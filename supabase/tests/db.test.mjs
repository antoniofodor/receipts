import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

import { dbConfig } from '../scripts/db-config.mjs';

const client = new pg.Client(dbConfig());
const results = { passed: 0, failed: [] };

const users = Object.fromEntries(
  ['dev', 'jonno', 'sully', 'tommo', 'kev', 'marco', 'jonnoPhone2', 'outsider', 'packer', 'holder', 'anonymous', 'leaver', 'renamer', 'renamerFriend'].map((k) => [k, randomUUID()]),
);
const PLAYER_NAMES = ['Dev', 'Jonno', 'Sully', 'Tommo', 'Kev', 'Marco'];

async function as(userId) {
  await client.query(`select set_config('request.jwt.claims', $1, true)`, [
    JSON.stringify({ sub: userId, role: 'authenticated' }),
  ]);
}

async function rpc(fn, args = {}) {
  const keys = Object.keys(args);
  const params = keys.map((k, i) => `${k} => $${i + 1}`).join(', ');
  const { rows } = await client.query(`select public.${fn}(${params}) as r`, keys.map((k) => args[k]));
  return rows[0].r;
}

// What a phone's upload leaves behind, as far as the database can tell. The current user owns the file.
async function upload(path, bucket = 'evidence') {
  await client.query(`insert into storage.objects (bucket_id, name, owner_id) values ($1, $2, auth.uid()::text)`, [
    bucket,
    path,
  ]);
}

// What the Storage API's remove does: a delete as the current user, under the bucket's policies.
// Returns how many files were actually deleted.
async function removeFile(path, bucket = 'evidence') {
  await client.query(`select set_config('storage.allow_delete_query', 'true', true)`);
  const { rowCount } = await client.query('delete from storage.objects where bucket_id = $1 and name = $2', [bucket, path]);
  return rowCount;
}

// For setup only the service role could do, like publishing catalog data.
async function asAdmin(fn) {
  await client.query('reset role');
  try {
    await fn();
  } finally {
    await client.query('set local role authenticated');
  }
}

async function rows(sql, params = []) {
  return (await client.query(sql, params)).rows;
}

async function expectError(fn, messagePart) {
  await client.query('savepoint expect_error');
  try {
    await fn();
  } catch (err) {
    await client.query('rollback to savepoint expect_error');
    if (!err.message.includes(messagePart)) {
      throw new Error(`expected error containing "${messagePart}", got "${err.message}"`);
    }
    return;
  }
  await client.query('release savepoint expect_error');
  throw new Error(`expected error containing "${messagePart}", but it succeeded`);
}

async function test(name, fn) {
  await client.query('savepoint test_case');
  try {
    await fn();
    await client.query('release savepoint test_case');
    results.passed++;
    console.log(`  ok    ${name}`);
  } catch (err) {
    await client.query('rollback to savepoint test_case');
    results.failed.push(name);
    console.log(`  FAIL  ${name}\n        ${err.message}`);
  }
}

const shared = {};
const playerId = (name) => shared.players[name];
const ruleId = async (title) =>
  (await rows('select id from public.rules where trip_id = $1 and title = $2 and not archived', [shared.tripId, title]))[0].id;
const leaderboardRow = async (name) =>
  (await rows('select * from public.leaderboard where trip_id = $1 and name = $2', [shared.tripId, name]))[0];

async function run() {
  await client.connect();
  await client.query('begin');
  try {
    for (const id of Object.values(users)) {
      await client.query(`insert into auth.users (id, aud, role) values ($1, 'authenticated', 'authenticated')`, [id]);
    }
    await client.query('set local role authenticated');

    console.log('\nTrips and joining');

    await test('vote threshold above players minus 2 is refused', async () => {
      await as(users.dev);
      await expectError(
        () => rpc('create_trip', { p_name: 'Small', p_player_names: ['A', 'B', 'C', 'D'], p_my_index: 0, p_pin: '1234', p_vote_threshold: 3 }),
        'Votes needed must be between 1 and 2',
      );
    });

    await test('duplicate player names are refused', async () => {
      await as(users.dev);
      await expectError(
        () => rpc('create_trip', { p_name: 'Dupes', p_player_names: ['Dev', 'dev ', 'Kev'], p_my_index: 0, p_pin: '1234', p_vote_threshold: 1 }),
        'must all be different',
      );
    });

    await test('create_trip returns a join code and, without packs picked, seeds the 22 classics', async () => {
      await as(users.dev);
      const r = await rpc('create_trip', {
        p_name: 'Lisbon 2026', p_player_names: PLAYER_NAMES, p_my_index: 0, p_pin: '1111', p_groom_index: 5, p_vote_threshold: 3,
      });
      assert.match(r.join_code, /^[A-HJ-NP-Z]{6}$/);
      shared.tripId = r.trip_id;
      shared.code = r.join_code;
      shared.players = Object.fromEntries(
        (await rows('select name, id from public.players where trip_id = $1', [shared.tripId])).map((p) => [p.name, p.id]),
      );
      assert.equal(r.player_id, playerId('Dev'));
      const packs = await rows('select pack_id, count(*)::int n from public.rules where trip_id = $1 group by pack_id', [shared.tripId]);
      assert.deepEqual(packs, [{ pack_id: 'classics', n: 22 }]);
      const [marco] = await rows('select is_groom from public.players where id = $1', [playerId('Marco')]);
      assert.equal(marco.is_groom, true);
    });

    await test('outsider can preview the trip by code but read nothing else', async () => {
      await as(users.outsider);
      const preview = await rpc('trip_preview', { p_code: shared.code.toLowerCase() });
      assert.deepEqual(preview.players.map((p) => p.name), PLAYER_NAMES);
      assert.deepEqual(preview.players.map((p) => p.has_joined), [true, false, false, false, false, false]);
      assert.equal((await rows('select * from public.trips')).length, 0);
      assert.equal((await rows('select * from public.rules')).length, 0);
      assert.equal((await rows('select * from public.leaderboard')).length, 0);
    });

    await test('players claim their names with a PIN', async () => {
      const claims = [['jonno', 'Jonno', '2222'], ['sully', 'Sully', '3333'], ['tommo', 'Tommo', '4444'], ['kev', 'Kev', '5555'], ['marco', 'Marco', '6666']];
      for (const [user, name, pin] of claims) {
        await as(users[user]);
        const r = await rpc('join_trip', { p_code: shared.code, p_player_id: playerId(name), p_pin: pin });
        assert.equal(r.ok, true, `${name} join`);
      }
    });

    await test('a second phone joins as Jonno with the right PIN', async () => {
      await as(users.jonnoPhone2);
      const r = await rpc('join_trip', { p_code: shared.code, p_player_id: playerId('Jonno'), p_pin: '2222' });
      assert.equal(r.ok, true);
      const session = await rpc('get_my_session');
      assert.equal(session.player_name, 'Jonno');
      assert.equal(session.join_code, shared.code);
    });

    await test('wrong PINs count down, then lock the player for 10 minutes', async () => {
      await as(users.outsider);
      const tryPin = (pin) => rpc('join_trip', { p_code: shared.code, p_player_id: playerId('Sully'), p_pin: pin });
      for (let left = 4; left >= 1; left--) {
        const r = await tryPin('0000');
        assert.deepEqual([r.ok, r.error, r.attempts_left], [false, 'wrong_pin', left]);
      }
      const fifth = await tryPin('0000');
      assert.deepEqual([fifth.ok, fifth.error], [false, 'locked']);
      const correctButLocked = await tryPin('3333');
      assert.equal(correctButLocked.error, 'locked');
      assert.equal(await rpc('get_my_session'), null);
    });

    await test('clients cannot write tables or read PIN hashes directly', async () => {
      await as(users.dev);
      await expectError(
        () => client.query(`insert into public.entries (trip_id, subject_id, filed_by, rule_id, points) values ($1, $2, $2, $3, 50)`,
          [shared.tripId, playerId('Dev'), randomUUID()]),
        'permission denied',
      );
      await expectError(() => client.query('select * from public.player_pins'), 'permission denied');
      await expectError(() => client.query(`update public.entries set status = 'confirmed'`), 'permission denied');
    });

    console.log('\nRule packs');

    const packTrip = (packIds) =>
      rpc('create_trip', { p_name: 'Packs', p_player_names: ['P', 'Q', 'R'], p_my_index: 0, p_pin: '1212', p_vote_threshold: 1, p_rule_pack_ids: packIds });
    const tripRules = (tripId) => rows('select title, points, is_preset, pack_id from public.rules where trip_id = $1', [tripId]);

    await test('any signed-in phone reads the published packs before joining a trip', async () => {
      await as(users.packer);
      assert.equal(await rpc('get_my_session'), null);
      const packs = await rows('select p.id, count(r.*)::int n from public.rule_packs p join public.rule_pack_rules r on r.pack_id = p.id group by p.id');
      const ruleCounts = Object.fromEntries(packs.map((p) => [p.id, p.n]));
      assert.deepEqual([ruleCounts.classics, ruleCounts['cabin-weekend']], [22, 44]);
    });

    await test('clients cannot write the pack catalog', async () => {
      await as(users.dev);
      await expectError(() => client.query(`insert into public.rule_packs (id, name, position) values ('mine', 'Mine', 9)`), 'permission denied');
      await expectError(() => client.query(`update public.rule_pack_rules set points = 25`), 'permission denied');
    });

    await test('create_trip copies the picked packs in order, and the first pack wins a shared rule name', async () => {
      await as(users.packer);
      const trip = await packTrip(['cabin-weekend', 'classics']);
      const rules = await tripRules(trip.trip_id);
      const namesInBothPacks = ['Asleep before midnight', 'Leaving a drink unfinished', 'Drinking from a straw'];
      assert.equal(rules.length, 44 + 22 - namesInBothPacks.length);
      assert.ok(rules.every((r) => r.is_preset));
      const straw = rules.find((r) => r.title === 'Drinking from a straw');
      assert.deepEqual([straw.points, straw.pack_id], [-10, 'cabin-weekend']);
    });

    await test('create_trip with no packs starts with an empty rulebook', async () => {
      await as(users.packer);
      const trip = await packTrip([]);
      assert.equal((await tripRules(trip.trip_id)).length, 0);
    });

    await test('create_trip refuses a pack that does not exist', async () => {
      await as(users.packer);
      await expectError(() => packTrip(['classics', 'nope']), "That rule pack isn't available");
    });

    await test('the organiser adds a pack later, and adding it again adds nothing', async () => {
      await as(users.packer);
      const trip = await packTrip(['classics']);
      assert.equal(await rpc('add_rule_pack', { p_trip_id: trip.trip_id, p_pack_id: 'cabin-weekend' }), 41);
      assert.equal(await rpc('add_rule_pack', { p_trip_id: trip.trip_id, p_pack_id: 'cabin-weekend' }), 0);
      const rules = await tripRules(trip.trip_id);
      assert.equal(rules.length, 63);
      assert.equal(rules.find((r) => r.title === 'Drinking from a straw').points, -5);
    });

    await test('a pack skips a rule the trip already made up, whatever its case', async () => {
      await as(users.packer);
      const trip = await packTrip([]);
      await rpc('create_rule', { p_trip_id: trip.trip_id, p_title: 'SPILLING A DRINK', p_points: -1 });
      assert.equal(await rpc('add_rule_pack', { p_trip_id: trip.trip_id, p_pack_id: 'cabin-weekend' }), 43);
    });

    await test('only the organiser adds packs, and outsiders cannot', async () => {
      await as(users.jonno);
      await expectError(() => rpc('add_rule_pack', { p_trip_id: shared.tripId, p_pack_id: 'cabin-weekend' }), 'Only the organiser can add rule packs');
      await as(users.packer);
      await expectError(() => rpc('add_rule_pack', { p_trip_id: shared.tripId, p_pack_id: 'cabin-weekend' }), 'not in this trip');
    });

    await test('an unpublished pack is hidden and cannot be added', async () => {
      await asAdmin(async () => {
        await client.query(`insert into public.rule_packs (id, name, position, published) values ('draft', 'Draft', 99, false)`);
        await client.query(`insert into public.rule_pack_rules (pack_id, title, points, position) values ('draft', 'Secret rule', 5, 1)`);
      });
      await as(users.packer);
      const trip = await packTrip([]);
      assert.equal((await rows(`select * from public.rule_packs where id = 'draft'`)).length, 0);
      assert.equal((await rows(`select * from public.rule_pack_rules where pack_id = 'draft'`)).length, 0);
      await expectError(() => rpc('add_rule_pack', { p_trip_id: trip.trip_id, p_pack_id: 'draft' }), "That rule pack isn't available");
      await expectError(() => packTrip(['draft']), "That rule pack isn't available");
    });

    await test('the organiser removes a whole pack, edited rules too, and keeps rules the trip made up', async () => {
      await as(users.packer);
      const trip = await packTrip(['classics']);
      await rpc('add_rule_pack', { p_trip_id: trip.trip_id, p_pack_id: 'cabin-weekend' });
      const [firstToArrive] = await rows(`select id from public.rules where trip_id = $1 and title = 'First to arrive'`, [trip.trip_id]);
      await rpc('update_rule', { p_rule_id: firstToArrive.id, p_title: 'First one there', p_points: 15 });
      await rpc('create_rule', { p_trip_id: trip.trip_id, p_title: 'Ordering pineapple on pizza', p_points: -10 });

      assert.equal(await rpc('remove_rule_pack', { p_trip_id: trip.trip_id, p_pack_id: 'cabin-weekend' }), 41);
      const rules = await rows('select title, pack_id from public.rules where trip_id = $1 and not archived', [trip.trip_id]);
      assert.equal(rules.length, 23);
      assert.ok(rules.every((r) => r.pack_id === 'classics' || r.title === 'Ordering pineapple on pizza'));
      assert.equal(await rpc('remove_rule_pack', { p_trip_id: trip.trip_id, p_pack_id: 'cabin-weekend' }), 0);
    });

    await test('entries logged under a removed pack keep their points, and the pack can come back', async () => {
      await as(users.packer);
      const trip = await packTrip(['cabin-weekend']);
      const [straw] = await rows(`select id from public.rules where trip_id = $1 and title = 'Drinking from a straw'`, [trip.trip_id]);
      const [q] = await rows(`select id from public.players where trip_id = $1 and name = 'Q'`, [trip.trip_id]);
      const entryId = await rpc('create_entry', { p_trip_id: trip.trip_id, p_subject_id: q.id, p_rule_id: straw.id });
      await rpc('remove_rule_pack', { p_trip_id: trip.trip_id, p_pack_id: 'cabin-weekend' });

      const [entry] = await rows('select e.points, r.title from public.entries e join public.rules r on r.id = e.rule_id where e.id = $1', [entryId]);
      assert.deepEqual([entry.points, entry.title], [-10, 'Drinking from a straw']);
      assert.equal(await rpc('add_rule_pack', { p_trip_id: trip.trip_id, p_pack_id: 'cabin-weekend' }), 44);
    });

    await test('only the organiser removes packs, and outsiders cannot', async () => {
      await as(users.jonno);
      await expectError(() => rpc('remove_rule_pack', { p_trip_id: shared.tripId, p_pack_id: 'classics' }), 'Only the organiser can remove rule packs');
      await as(users.packer);
      await expectError(() => rpc('remove_rule_pack', { p_trip_id: shared.tripId, p_pack_id: 'classics' }), 'not in this trip');
    });

    await test('the internal pack copier cannot be called from the app', async () => {
      await as(users.packer);
      const trip = await packTrip([]);
      await expectError(() => rpc('insert_rule_pack_internal', { p_trip_id: trip.trip_id, p_pack_id: 'classics' }), 'permission denied');
    });

    console.log('\nAccounts');

    async function historyOf(userId) {
      let history;
      await asAdmin(async () => {
        history = await rows('select player_id from public.account_players where auth_user_id = $1', [userId]);
      });
      return history;
    }

    await test('every trip a sign-in plays is remembered, even after leaving it', async () => {
      await as(users.holder);
      const first = await packTrip([]);
      await rpc('leave_trip');
      const second = await packTrip([]);
      const players = (await historyOf(users.holder)).map((r) => r.player_id).sort();
      assert.deepEqual(players, [first.player_id, second.player_id].sort());
    });

    await test('joining a trip on another phone is remembered for that sign-in too', async () => {
      const history = await historyOf(users.jonnoPhone2);
      assert.ok(history.some((r) => r.player_id === playerId('Jonno')));
    });

    await test("phones cannot read anyone's trip history directly", async () => {
      await as(users.holder);
      await packTrip([]);
      assert.equal((await rows('select * from public.account_players')).length, 0);
    });

    await test('deleting the account removes the sign-in, its link and its history, but not the trip', async () => {
      await as(users.holder);
      const trip = await packTrip([]);
      await rpc('delete_my_account');
      await asAdmin(async () => {
        assert.equal((await rows('select * from auth.users where id = $1', [users.holder])).length, 0);
        assert.equal((await rows('select * from public.devices where auth_user_id = $1', [users.holder])).length, 0);
        assert.equal((await rows('select * from public.account_players where auth_user_id = $1', [users.holder])).length, 0);
        assert.equal((await rows('select * from public.players where id = $1', [trip.player_id])).length, 1);
      });
    });

    console.log('\nCustom rule packs');

    const packRules = (packId) =>
      rows('select title, points from public.custom_pack_rules where pack_id = $1 order by title', [packId]);

    await test('a phone without an account cannot make a pack', async () => {
      await asAdmin(() => client.query('update auth.users set is_anonymous = true where id = $1', [users.anonymous]));
      await as(users.anonymous);
      await expectError(() => rpc('create_custom_pack', { p_name: 'Mine' }), 'Create an account or sign in');
    });

    await test('an account makes a pack and fills it from anywhere, skipping names it already has', async () => {
      await as(users.packer);
      const packId = await rpc('create_custom_pack', { p_name: '  Stag   classics ' });
      const added = await rpc('add_custom_pack_rules', {
        p_pack_id: packId,
        p_rules: JSON.stringify([
          { title: 'Drinking from a straw', points: -5 },
          { title: 'Best  speech', points: 15 },
          { title: 'drinking from a straw', points: -20 },
        ]),
      });
      assert.equal(added, 2);
      assert.deepEqual(await packRules(packId), [
        { title: 'Best speech', points: 15 },
        { title: 'Drinking from a straw', points: -5 },
      ]);
      const [pack] = await rows('select name from public.custom_rule_packs where id = $1', [packId]);
      assert.equal(pack.name, 'Stag classics');
    });

    await test('pack rules get the same checks as trip rules, and pack names are unique per account', async () => {
      await as(users.packer);
      const packId = await rpc('create_custom_pack', { p_name: 'Checks' });
      await expectError(() => rpc('add_custom_pack_rules', { p_pack_id: packId, p_rules: JSON.stringify([{ title: 'X', points: 5 }]) }), 'Rule names must be 2 to 60');
      await expectError(() => rpc('add_custom_pack_rules', { p_pack_id: packId, p_rules: JSON.stringify([{ title: 'Fine name', points: 0 }]) }), 'between -25 and 25');
      await expectError(() => rpc('create_custom_pack', { p_name: 'CHECKS' }), 'already have a pack called');
      await rpc('add_custom_pack_rules', { p_pack_id: packId, p_rules: JSON.stringify([{ title: 'Late', points: -5 }, { title: 'Early', points: 5 }]) });
      const [late] = await rows(`select id from public.custom_pack_rules where pack_id = $1 and title = 'Late'`, [packId]);
      await expectError(() => rpc('update_custom_pack_rule', { p_rule_id: late.id, p_title: 'early', p_points: -5 }), 'already has a rule called');
      await rpc('update_custom_pack_rule', { p_rule_id: late.id, p_title: 'Late to dinner', p_points: -10 });
      await rpc('delete_custom_pack_rule', { p_rule_id: (await rows(`select id from public.custom_pack_rules where title = 'Early' and pack_id = $1`, [packId]))[0].id });
      assert.deepEqual(await packRules(packId), [{ title: 'Late to dinner', points: -10 }]);
    });

    await test('nobody else can see, change or use your pack', async () => {
      await as(users.packer);
      const packId = await rpc('create_custom_pack', { p_name: 'Private' });
      await rpc('add_custom_pack_rules', { p_pack_id: packId, p_rules: JSON.stringify([{ title: 'Secret', points: 5 }]) });
      await as(users.dev);
      assert.equal((await rows('select * from public.custom_rule_packs where id = $1', [packId])).length, 0);
      assert.equal((await rows('select * from public.custom_pack_rules where pack_id = $1', [packId])).length, 0);
      await expectError(() => rpc('rename_custom_pack', { p_pack_id: packId, p_name: 'Taken' }), "isn't yours");
      await expectError(() => rpc('add_custom_pack_to_trip', { p_trip_id: shared.tripId, p_pack_id: packId }), "isn't yours");
      await expectError(() => client.query(`insert into public.custom_rule_packs (owner_id, name) values ($1, 'Sneaky')`, [users.dev]), 'permission denied');
    });

    await test('the organiser copies their pack into a trip and can take it back out; edits to the pack later change nothing', async () => {
      await as(users.packer);
      const trip = await packTrip(['classics']);
      const packId = await rpc('create_custom_pack', { p_name: 'Reusable' });
      await rpc('add_custom_pack_rules', {
        p_pack_id: packId,
        p_rules: JSON.stringify([{ title: 'Drinking from a straw', points: -10 }, { title: 'Best speech', points: 15 }]),
      });
      assert.equal(await rpc('add_custom_pack_to_trip', { p_trip_id: trip.trip_id, p_pack_id: packId }), 1);
      await rpc('rename_custom_pack', { p_pack_id: packId, p_name: 'Renamed' });
      await rpc('add_custom_pack_rules', { p_pack_id: packId, p_rules: JSON.stringify([{ title: 'Later rule', points: 5 }]) });
      const fromPack = await rows('select title from public.rules where trip_id = $1 and custom_pack_id = $2 and not archived', [trip.trip_id, packId]);
      assert.deepEqual(fromPack.map((r) => r.title), ['Best speech']);

      assert.equal(await rpc('remove_custom_pack_from_trip', { p_trip_id: trip.trip_id, p_pack_id: packId }), 1);
      assert.equal((await rows('select * from public.rules where trip_id = $1 and not archived', [trip.trip_id])).length, 22);
    });

    await test('only the organiser adds or removes a custom pack', async () => {
      await as(users.jonno);
      await asAdmin(() => client.query('update auth.users set is_anonymous = false where id = $1', [users.jonno]));
      const packId = await rpc('create_custom_pack', { p_name: 'Jonno pack' });
      await expectError(() => rpc('add_custom_pack_to_trip', { p_trip_id: shared.tripId, p_pack_id: packId }), 'Only the organiser can add rule packs');
      await expectError(() => rpc('remove_custom_pack_from_trip', { p_trip_id: shared.tripId, p_pack_id: packId }), 'Only the organiser can remove rule packs');
    });

    await test("deleting a pack keeps the trips' copies of its rules, and deleting the account deletes its packs", async () => {
      await as(users.leaver);
      const trip = await packTrip([]);
      const packId = await rpc('create_custom_pack', { p_name: 'Short lived' });
      await rpc('add_custom_pack_rules', { p_pack_id: packId, p_rules: JSON.stringify([{ title: 'Kept', points: 5 }]) });
      await rpc('add_custom_pack_to_trip', { p_trip_id: trip.trip_id, p_pack_id: packId });
      await rpc('delete_custom_pack', { p_pack_id: packId });
      const [kept] = await rows(`select custom_pack_id from public.rules where trip_id = $1 and title = 'Kept'`, [trip.trip_id]);
      assert.equal(kept.custom_pack_id, null);

      const another = await rpc('create_custom_pack', { p_name: 'Goes with the account' });
      await rpc('delete_my_account');
      await asAdmin(async () => {
        assert.equal((await rows('select * from public.custom_rule_packs where id = $1', [another])).length, 0);
      });
    });

    await test('the pack helpers cannot be called from the app', async () => {
      await as(users.packer);
      await expectError(() => rpc('my_account_id'), 'permission denied');
      await expectError(() => rpc('checked_pack_name', { p_name: 'x' }), 'permission denied');
    });

    console.log('\nVoting');

    await test('the logger and the subject cannot vote', async () => {
      await as(users.dev);
      shared.strawEntry = await rpc('create_entry', { p_trip_id: shared.tripId, p_subject_id: playerId('Jonno'), p_rule_id: await ruleId('Drinking from a straw') });
      await expectError(() => rpc('cast_vote', { p_entry_id: shared.strawEntry, p_confirm: true }), 'entry you logged');
      await as(users.jonno);
      await expectError(() => rpc('cast_vote', { p_entry_id: shared.strawEntry, p_confirm: false }), 'entry about you');
      await as(users.jonnoPhone2);
      await expectError(() => rpc('cast_vote', { p_entry_id: shared.strawEntry, p_confirm: false }), 'entry about you');
    });

    await test('an entry stays pending until the 3rd confirm, and counts on the leaderboard after', async () => {
      await as(users.sully);
      assert.equal((await rpc('cast_vote', { p_entry_id: shared.strawEntry, p_confirm: true })).status, 'pending');
      await expectError(() => rpc('cast_vote', { p_entry_id: shared.strawEntry, p_confirm: true }), 'already voted');
      await as(users.tommo);
      assert.equal((await rpc('cast_vote', { p_entry_id: shared.strawEntry, p_confirm: false })).status, 'pending');
      await as(users.kev);
      assert.equal((await rpc('cast_vote', { p_entry_id: shared.strawEntry, p_confirm: true })).status, 'pending');
      assert.equal((await leaderboardRow('Jonno')).points, 0);
      assert.equal((await leaderboardRow('Jonno')).pending_count, 1);
      await as(users.marco);
      const r = await rpc('cast_vote', { p_entry_id: shared.strawEntry, p_confirm: true });
      assert.deepEqual([r.status, r.confirms, r.rejects], ['confirmed', 3, 1]);
      const jonno = await leaderboardRow('Jonno');
      assert.deepEqual([jonno.points, jonno.pending_count, jonno.rank], [-5, 0, 6]);
    });

    await test('voting closes once an entry is decided', async () => {
      await as(users.dev);
      shared.coffeeEntry = await rpc('create_entry', { p_trip_id: shared.tripId, p_subject_id: playerId('Kev'), p_rule_id: await ruleId('First up and bringing coffee for the group') });
      for (const u of ['sully', 'tommo', 'marco']) {
        await as(users[u]);
        await rpc('cast_vote', { p_entry_id: shared.coffeeEntry, p_confirm: true });
      }
      await as(users.jonno);
      await expectError(() => rpc('cast_vote', { p_entry_id: shared.coffeeEntry, p_confirm: true }), 'has closed');
    });

    await test('self-claim with a brand-new rule: rule joins the rulebook, 3 rejects remove the entry', async () => {
      await as(users.sully);
      const entry = await rpc('create_entry', {
        p_trip_id: shared.tripId, p_subject_id: playerId('Sully'), p_new_rule_title: '  Ordering   pineapple on pizza ', p_new_rule_points: -10,
      });
      const [rule] = await rows(`select title, points, created_by, is_preset from public.rules where trip_id = $1 and title like 'Ordering pineapple%'`, [shared.tripId]);
      assert.deepEqual([rule.title, rule.points, rule.created_by, rule.is_preset], ['Ordering pineapple on pizza', -10, playerId('Sully'), false]);
      await expectError(() => rpc('cast_vote', { p_entry_id: entry, p_confirm: true }), 'entry you logged');
      for (const u of ['dev', 'jonno', 'tommo']) {
        await as(users[u]);
        await rpc('cast_vote', { p_entry_id: entry, p_confirm: false });
      }
      const [e] = await rows('select status from public.entries where id = $1', [entry]);
      assert.equal(e.status, 'rejected');
      assert.equal((await leaderboardRow('Sully')).points, 0);
      assert.equal((await rows(`select 1 from public.rules where title = 'Ordering pineapple on pizza'`)).length, 1);
    });

    await test('entries awaiting my vote skip ones I logged, about me, already voted on, or decided', async () => {
      await as(users.dev);
      const pending = await rpc('create_entry', { p_trip_id: shared.tripId, p_subject_id: playerId('Kev'), p_rule_id: await ruleId('Asleep before midnight') });
      await as(users.tommo);
      await rpc('cast_vote', { p_entry_id: pending, p_confirm: true });

      const awaitingFor = async (user) => {
        await as(users[user]);
        return (await rows('select id from public.entries_awaiting_my_vote where trip_id = $1', [shared.tripId])).map((r) => r.id);
      };
      assert.deepEqual(await awaitingFor('sully'), [pending]);
      assert.deepEqual(await awaitingFor('tommo'), [], 'already voted');
      assert.deepEqual(await awaitingFor('dev'), [], 'logged it');
      assert.deepEqual(await awaitingFor('kev'), [], 'about them');
      assert.deepEqual(await awaitingFor('outsider'), [], 'not in the trip');
      await as(users.dev);
      await expectError(() => client.query('delete from public.entries_awaiting_my_vote'), 'permission denied');
    });

    console.log('\nRules and points');

    await test('duplicate rule names are refused, ignoring case and spacing', async () => {
      await as(users.tommo);
      await expectError(() => rpc('create_rule', { p_trip_id: shared.tripId, p_title: ' drinking   FROM a straw ', p_points: -5 }), 'already a rule');
    });

    await test('rule points must be -25 to 25 and not 0', async () => {
      await as(users.tommo);
      await expectError(() => rpc('create_rule', { p_trip_id: shared.tripId, p_title: 'Huge bonus', p_points: 30 }), 'between -25 and 25');
      await expectError(() => rpc('create_rule', { p_trip_id: shared.tripId, p_title: 'Nothing', p_points: 0 }), 'between -25 and 25');
      const id = await rpc('create_rule', { p_trip_id: shared.tripId, p_title: 'Speech made the groom cry', p_points: 25 });
      assert.ok(id);
    });

    await test("an entry always counts its rule's points, with no way to send its own", async () => {
      await as(users.tommo);
      const late = await ruleId('Late to a group plan (per 10 min)');
      const id = await rpc('create_entry', { p_trip_id: shared.tripId, p_subject_id: playerId('Kev'), p_rule_id: late, p_note: 'Late to dinner' });
      const [e] = await rows('select points, note, status from public.entries where id = $1', [id]);
      assert.deepEqual([e.points, e.note, e.status], [-5, 'Late to dinner', 'pending']);
      await expectError(() => rpc('create_entry', { p_trip_id: shared.tripId, p_subject_id: playerId('Kev'), p_rule_id: late, p_points: -10 }), 'does not exist');
      await expectError(() => rpc('create_entry', { p_trip_id: shared.tripId, p_subject_id: playerId('Kev') }), 'Pick a rule');
    });

    const ruleRow = async (id) => (await rows('select title, points, archived from public.rules where id = $1', [id]))[0];

    await test('the organiser edits a pack rule, and entries already logged keep their points', async () => {
      const karaoke = await ruleId('Karaoke performance, full song');
      await as(users.kev);
      const entry = await rpc('create_entry', { p_trip_id: shared.tripId, p_subject_id: playerId('Jonno'), p_rule_id: karaoke });
      await as(users.dev);
      await rpc('update_rule', { p_rule_id: karaoke, p_title: '  Karaoke,   whole song ', p_points: 15 });
      assert.deepEqual(await ruleRow(karaoke), { title: 'Karaoke, whole song', points: 15, archived: false });
      const [e] = await rows('select points, rule_id from public.entries where id = $1', [entry]);
      assert.deepEqual([e.points, e.rule_id], [10, karaoke]);
    });

    await test('whoever added a rule can edit and delete it, and other players cannot', async () => {
      await as(users.tommo);
      const mine = await rpc('create_rule', { p_trip_id: shared.tripId, p_title: 'Tommo special', p_points: -3 });
      await as(users.jonno);
      await expectError(() => rpc('update_rule', { p_rule_id: mine, p_title: 'Hijacked', p_points: 25 }), 'Only the organiser or the person who added this rule');
      await expectError(() => rpc('delete_rule', { p_rule_id: mine }), 'Only the organiser or the person who added this rule');
      await as(users.tommo);
      await rpc('update_rule', { p_rule_id: mine, p_title: 'TOMMO special', p_points: -4 });
      assert.deepEqual(await ruleRow(mine), { title: 'TOMMO special', points: -4, archived: false });
      await rpc('delete_rule', { p_rule_id: mine });
      assert.equal((await ruleRow(mine)).archived, true);
    });

    await test('an edit passes the same checks as a new rule', async () => {
      const karaoke = await ruleId('Karaoke, whole song');
      await as(users.dev);
      const edit = (title, points) => rpc('update_rule', { p_rule_id: karaoke, p_title: title, p_points: points });
      await expectError(() => edit('drinking FROM a straw', 10), 'already a rule');
      await expectError(() => edit('Karaoke, whole song', 30), 'between -25 and 25');
      await expectError(() => edit('Karaoke, whole song', 0), 'between -25 and 25');
      await expectError(() => edit('K', 10), '2 to 60 characters');
    });

    await test('a deleted rule leaves the rulebook, its entries stay, and its name is free again', async () => {
      const bestDressed = await ruleId('Best dressed of the night');
      await as(users.kev);
      const entry = await rpc('create_entry', { p_trip_id: shared.tripId, p_subject_id: playerId('Sully'), p_rule_id: bestDressed });
      await as(users.dev);
      await rpc('delete_rule', { p_rule_id: bestDressed });

      const [e] = await rows('select points, rule_id from public.entries where id = $1', [entry]);
      assert.deepEqual([e.points, e.rule_id], [10, bestDressed]);
      await expectError(() => rpc('create_entry', { p_trip_id: shared.tripId, p_subject_id: playerId('Sully'), p_rule_id: bestDressed }), "That rule doesn't exist");
      await expectError(() => rpc('update_rule', { p_rule_id: bestDressed, p_title: 'Back again', p_points: 5 }), "That rule doesn't exist");
      await expectError(() => rpc('delete_rule', { p_rule_id: bestDressed }), "That rule doesn't exist");
      await as(users.tommo);
      assert.ok(await rpc('create_rule', { p_trip_id: shared.tripId, p_title: 'Best dressed of the night', p_points: 5 }));
    });

    await test('an outsider cannot edit or delete rules, and the shared checks are not callable', async () => {
      const straw = await ruleId('Drinking from a straw');
      await as(users.outsider);
      await expectError(() => rpc('update_rule', { p_rule_id: straw, p_title: 'Sneaky', p_points: 25 }), "That rule doesn't exist");
      await expectError(() => rpc('delete_rule', { p_rule_id: straw }), "That rule doesn't exist");
      await as(users.dev);
      await expectError(() => rpc('rule_i_can_manage', { p_rule_id: straw }), 'permission denied');
      await expectError(() => rpc('checked_rule_title', { p_trip_id: shared.tripId, p_title: 'x', p_points: 1 }), 'permission denied');
    });

    console.log('\nComments and evidence');

    await test('comments allow one level of replies', async () => {
      await as(users.jonno);
      const top = await rpc('add_comment', { p_entry_id: shared.strawEntry, p_body: 'It was a stirrer. I was stirring.' });
      await as(users.sully);
      const reply = await rpc('add_comment', { p_entry_id: shared.strawEntry, p_body: 'Stirrers don\'t have liquid going UP them', p_parent_id: top });
      await as(users.tommo);
      await expectError(() => rpc('add_comment', { p_entry_id: shared.strawEntry, p_body: 'deeper', p_parent_id: reply }), 'top-level comments');
      await expectError(() => rpc('add_comment', { p_entry_id: shared.strawEntry, p_body: '   ' }), 'Write something');
      await expectError(() => rpc('add_comment', { p_entry_id: shared.coffeeEntry, p_body: 'wrong entry', p_parent_id: top }), 'doesn\'t exist');
    });

    await test('only the logger adds photos, at the right path, once uploaded, up to 3', async () => {
      const path = (n) => `${shared.tripId}/${shared.strawEntry}/photo${n}.jpg`;
      await as(users.dev);
      for (const n of [1, 2, 3, 4, 5]) await upload(path(n));
      await as(users.jonno);
      await expectError(() => rpc('add_evidence', { p_entry_id: shared.strawEntry, p_storage_path: path(1) }), 'Only the person who logged');
      await as(users.dev);
      await expectError(() => rpc('add_evidence', { p_entry_id: shared.strawEntry, p_storage_path: `${shared.tripId}/${randomUUID()}/x.jpg` }), 'doesn\'t match');
      await expectError(() => rpc('add_evidence', { p_entry_id: shared.strawEntry, p_storage_path: path(9) }), 'didn\'t finish uploading');
      for (const n of [1, 2, 3]) await rpc('add_evidence', { p_entry_id: shared.strawEntry, p_storage_path: path(n), p_width: 1600, p_height: 1200 });
      await expectError(() => rpc('add_evidence', { p_entry_id: shared.strawEntry, p_storage_path: path(4) }), 'up to 3');
    });

    await test('an entry and its photos are saved together', async () => {
      await as(users.dev);
      const entryId = randomUUID();
      const photos = [1, 2].map((n) => ({ path: `${shared.tripId}/${entryId}/${n}.jpg`, width: 1600, height: 1200 }));
      for (const photo of photos) await upload(photo.path);
      const straw = await ruleId('Drinking from a straw');

      const created = await rpc('create_entry', {
        p_trip_id: shared.tripId, p_subject_id: playerId('Kev'), p_rule_id: straw, p_entry_id: entryId, p_photos: JSON.stringify(photos),
      });

      assert.equal(created, entryId);
      const saved = await rows('select storage_path, width from public.evidence where entry_id = $1 order by storage_path', [entryId]);
      assert.deepEqual(saved, photos.map((photo) => ({ storage_path: photo.path, width: 1600 })));
    });

    await test('a photo that never uploaded stops the whole entry from saving', async () => {
      await as(users.dev);
      const entryId = randomUUID();
      const straw = await ruleId('Drinking from a straw');
      await expectError(
        () => rpc('create_entry', {
          p_trip_id: shared.tripId, p_subject_id: playerId('Kev'), p_rule_id: straw, p_entry_id: entryId,
          p_photos: JSON.stringify([{ path: `${shared.tripId}/${entryId}/missing.jpg`, width: 1, height: 1 }]),
        }),
        'didn\'t finish uploading',
      );
      assert.equal((await rows('select id from public.entries where id = $1', [entryId])).length, 0);
    });

    await test('an entry takes at most 3 photos, all in its own folder', async () => {
      await as(users.dev);
      const entryId = randomUUID();
      const straw = await ruleId('Drinking from a straw');
      const photo = (n, folder = entryId) => ({ path: `${shared.tripId}/${folder}/${n}.jpg`, width: 1, height: 1 });
      const entry = (photos) => () => rpc('create_entry', {
        p_trip_id: shared.tripId, p_subject_id: playerId('Kev'), p_rule_id: straw, p_entry_id: entryId, p_photos: JSON.stringify(photos),
      });
      await expectError(entry([1, 2, 3, 4].map((n) => photo(n))), 'up to 3 photos');
      const elsewhere = photo(1, shared.strawEntry);
      await expectError(entry([elsewhere]), 'doesn\'t match');
    });

    await test('only trip members can upload into a trip\'s photo folder', async () => {
      await as(users.outsider);
      await expectError(() => upload(`${shared.tripId}/${randomUUID()}/sneaky.jpg`), 'row-level security');
    });

    console.log('\nDeleting entries');

    const logStraw = async (subject = 'Kev', photoCount = 0) => {
      const entryId = randomUUID();
      const photos = Array.from({ length: photoCount }, (_, i) => ({ path: `${shared.tripId}/${entryId}/${i}.jpg`, width: 1, height: 1 }));
      for (const photo of photos) await upload(photo.path);
      await rpc('create_entry', {
        p_trip_id: shared.tripId, p_subject_id: playerId(subject), p_rule_id: await ruleId('Drinking from a straw'),
        p_entry_id: entryId, p_photos: JSON.stringify(photos),
      });
      return { entryId, paths: photos.map((photo) => photo.path) };
    };

    await test('the logger deletes a pending entry with its votes, photos and comments, and the trip hears about it', async () => {
      await as(users.dev);
      const { entryId, paths } = await logStraw('Kev', 2);
      await as(users.sully);
      await rpc('cast_vote', { p_entry_id: entryId, p_confirm: true });
      await as(users.jonno);
      await rpc('add_comment', { p_entry_id: entryId, p_body: 'Wrong person' });

      await as(users.dev);
      const removed = await rpc('delete_entry', { p_entry_id: entryId });

      assert.deepEqual(removed, paths);
      for (const table of ['entries', 'votes', 'evidence', 'comments']) {
        const column = table === 'entries' ? 'id' : 'entry_id';
        assert.equal((await rows(`select 1 from public.${table} where ${column} = $1`, [entryId])).length, 0, table);
      }
      await as(users.jonno);
      const [deleted] = await rows('select trip_id, deleted_by from public.deleted_entries where entry_id = $1', [entryId]);
      assert.deepEqual(deleted, { trip_id: shared.tripId, deleted_by: playerId('Dev') });
      await as(users.outsider);
      assert.equal((await rows('select 1 from public.deleted_entries')).length, 0);
    });

    await test('only the logger can delete an entry, and only before the votes are in', async () => {
      await as(users.dev);
      const { entryId } = await logStraw('Kev');
      await as(users.kev);
      await expectError(() => rpc('delete_entry', { p_entry_id: entryId }), 'Only the person who logged');
      await as(users.outsider);
      await expectError(() => rpc('delete_entry', { p_entry_id: entryId }), 'Entry not found');
      for (const voter of ['sully', 'tommo', 'jonno']) {
        await as(users[voter]);
        await rpc('cast_vote', { p_entry_id: entryId, p_confirm: true });
      }
      await as(users.dev);
      await expectError(() => rpc('delete_entry', { p_entry_id: entryId }), 'votes are in');
    });

    await test('only the uploader removes photo files, and only once no entry uses them', async () => {
      await as(users.dev);
      const { entryId, paths: [photo] } = await logStraw('Kev', 1);
      assert.equal(await removeFile(photo), 0, 'still attached to its entry');
      await rpc('delete_entry', { p_entry_id: entryId });
      await as(users.jonno);
      assert.equal(await removeFile(photo), 0, 'someone else uploaded it');
      await as(users.dev);
      assert.equal(await removeFile(photo), 1);
    });

    console.log('\nProfile photos');

    const avatarPath = (player, file) => `${shared.tripId}/${playerId(player)}/${file}.jpg`;

    await test('players set, replace and clear their own photo, and it shows on the board and the join screen', async () => {
      await as(users.sully);
      const [first, second] = [avatarPath('Sully', 'first'), avatarPath('Sully', 'second')];
      await upload(first, 'avatars');
      await upload(second, 'avatars');

      assert.equal(await rpc('set_my_photo', { p_trip_id: shared.tripId, p_photo_path: first }), null);
      assert.equal((await leaderboardRow('Sully')).photo_path, first);
      const preview = await rpc('trip_preview', { p_code: shared.code });
      assert.equal(preview.players.find((p) => p.name === 'Sully').photo_path, first);

      assert.equal(await rpc('set_my_photo', { p_trip_id: shared.tripId, p_photo_path: second }), first);
      assert.equal(await rpc('set_my_photo', { p_trip_id: shared.tripId, p_photo_path: null }), second);
      assert.equal((await leaderboardRow('Sully')).photo_path, null);
    });

    await test('players only upload into and use their own photo folder', async () => {
      await as(users.sully);
      await expectError(() => upload(avatarPath('Jonno', 'sneaky'), 'avatars'), 'row-level security');
      await expectError(() => rpc('set_my_photo', { p_trip_id: shared.tripId, p_photo_path: avatarPath('Jonno', 'x') }), 'doesn\'t belong to you');
      await expectError(() => rpc('set_my_photo', { p_trip_id: shared.tripId, p_photo_path: avatarPath('Sully', 'never') }), 'didn\'t finish uploading');
      await as(users.outsider);
      await expectError(() => upload(avatarPath('Sully', 'outsider'), 'avatars'), 'row-level security');
      await expectError(() => rpc('set_my_photo', { p_trip_id: shared.tripId, p_photo_path: null }), 'not in this trip');
    });

    await test('only the owner removes their old photos, never the one in use', async () => {
      await as(users.sully);
      const [old, current] = [avatarPath('Sully', 'old'), avatarPath('Sully', 'current')];
      await upload(old, 'avatars');
      await upload(current, 'avatars');
      await rpc('set_my_photo', { p_trip_id: shared.tripId, p_photo_path: current });

      await as(users.jonno);
      assert.equal(await removeFile(old, 'avatars'), 0, 'not their photo');
      await as(users.sully);
      assert.equal(await removeFile(current, 'avatars'), 0, 'still in use');
      assert.equal(await removeFile(old, 'avatars'), 1);
    });

    console.log('\nRenaming yourself');

    const renameTrip = {};
    const renameMe = (name, tripId = renameTrip.id) => rpc('rename_me', { p_trip_id: tripId, p_name: name });
    const renameTripNames = async () =>
      (await rows('select name from public.players where trip_id = $1 order by position', [renameTrip.id])).map((p) => p.name);

    await test('a player renames themselves, with spaces tidied, and the trip shows the new name everywhere', async () => {
      await as(users.renamer);
      const trip = await rpc('create_trip', { p_name: 'Renames', p_player_names: ['Ana', 'Ben', 'Cat'], p_my_index: 0, p_pin: '1212', p_vote_threshold: 1 });
      renameTrip.id = trip.trip_id;
      renameTrip.ben = (await rows('select id from public.players where trip_id = $1 and name = $2', [trip.trip_id, 'Ben']))[0].id;
      await as(users.renamerFriend);
      assert.equal((await rpc('join_trip', { p_code: trip.join_code, p_player_id: renameTrip.ben, p_pin: '3434' })).ok, true);

      await as(users.renamer);
      assert.equal(await renameMe('  Ana   Banana '), 'Ana Banana');
      assert.equal((await rpc('get_my_session')).player_name, 'Ana Banana');
      assert.deepEqual(await renameTripNames(), ['Ana Banana', 'Ben', 'Cat']);
      const board = await rows('select name from public.leaderboard where trip_id = $1 and player_id = $2', [renameTrip.id, trip.player_id]);
      assert.deepEqual(board, [{ name: 'Ana Banana' }]);
    });

    await test('a player can change just the case of their own name', async () => {
      await as(users.renamer);
      assert.equal(await renameMe('ana banana'), 'ana banana');
    });

    await test('empty, too long and taken names are refused', async () => {
      await as(users.renamer);
      await expectError(() => renameMe('   '), 'Names must be 1 to 30 characters');
      await expectError(() => renameMe(null), 'Names must be 1 to 30 characters');
      await expectError(() => renameMe('x'.repeat(31)), 'Names must be 1 to 30 characters');
      await expectError(() => renameMe(' BEN '), 'Someone in this trip is already called "BEN"');
      assert.equal(await renameMe('x'.repeat(30)), 'x'.repeat(30));
    });

    await test('a name taken in another trip is free in this one', async () => {
      await as(users.renamerFriend);
      assert.equal(await renameMe('Dev'), 'Dev');
      assert.equal((await rows('select name from public.players where id = $1', [renameTrip.ben]))[0].name, 'Dev');
    });

    await test("nobody renames someone else, or anyone in a trip they're not in", async () => {
      await as(users.renamerFriend);
      const before = await renameTripNames();
      await expectError(
        () => client.query('update public.players set name = $1 where id = $2', ['Hacked', renameTrip.ben]),
        'permission denied',
      );
      await as(users.outsider);
      await expectError(() => renameMe('Hacked'), 'not in this trip');
      await as(users.renamer);
      await expectError(() => renameMe('Hacked', shared.tripId), 'not in this trip');
      await expectError(() => rpc('checked_player_name', { p_trip_id: renameTrip.id, p_name: 'Probe' }), 'permission denied');
      assert.deepEqual(await renameTripNames(), before);
    });

    await test('renames reach other phones, because changes to players are published to realtime', async () => {
      const published = await rows(
        "select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'players'",
      );
      assert.equal(published.length, 1);
    });

    console.log('\nIsolation');

    await test('an outsider cannot log, vote, comment or create rules', async () => {
      await as(users.dev);
      const straw = await ruleId('Drinking from a straw');
      await as(users.outsider);
      await expectError(() => rpc('create_entry', { p_trip_id: shared.tripId, p_subject_id: playerId('Dev'), p_rule_id: straw }), 'not in this trip');
      await expectError(() => rpc('cast_vote', { p_entry_id: shared.strawEntry, p_confirm: true }), 'Entry not found');
      await expectError(() => rpc('add_comment', { p_entry_id: shared.strawEntry, p_body: 'hi' }), 'Entry not found');
      await expectError(() => rpc('create_rule', { p_trip_id: shared.tripId, p_title: 'Sneaky', p_points: 5 }), 'not in this trip');
      assert.equal((await rows('select * from public.entries')).length, 0);
      assert.equal((await rows('select * from public.comments')).length, 0);
    });

    await test('two trips cannot see each other', async () => {
      await as(users.outsider);
      const other = await rpc('create_trip', { p_name: 'Other trip', p_player_names: ['X', 'Y', 'Z'], p_my_index: 0, p_pin: '9999', p_vote_threshold: 1 });
      assert.equal((await rows('select * from public.entries')).length, 0);
      assert.equal((await rows('select distinct trip_id from public.rules'))[0].trip_id, other.trip_id);
      await as(users.dev);
      assert.equal((await rows('select * from public.rules where trip_id = $1', [other.trip_id])).length, 0);
    });

    await test("one player's entries are indexed newest first", async () => {
      const indexes = await client.query("select indexdef from pg_indexes where schemaname = 'public' and indexname = 'entries_subject_created_idx'");
      assert.match(indexes.rows[0]?.indexdef ?? '', /\(subject_id, created_at DESC\)/);
    });

    await test('leave_trip unlinks the phone', async () => {
      await as(users.marco);
      await rpc('leave_trip');
      assert.equal(await rpc('get_my_session'), null);
      assert.equal((await rows('select * from public.trips')).length, 0);
    });
  } finally {
    await client.query('rollback');
    await client.end();
  }

  console.log(`\n${results.passed} passed, ${results.failed.length} failed`);
  if (results.failed.length) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
