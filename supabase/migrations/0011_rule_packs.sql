-- Rule packs are a curated catalog of starter rules, kept on the server so new packs reach every phone
-- without an app release. A pack is copied into a trip (at creation or later), never linked: the trip
-- owns its rules from then on, and editing a pack never changes a trip's rulebook.
create table public.rule_packs (
  id         text primary key check (id ~ '^[a-z0-9-]+$'),
  name       text not null check (char_length(name) between 2 and 40),
  position   int  not null,
  published  boolean not null default true,
  created_at timestamptz not null default now()
);

-- Same limits as public.rules, and titles already in the form insert_rule_internal would store,
-- so copying a pack into a trip can never fail a check.
create table public.rule_pack_rules (
  pack_id  text not null references public.rule_packs (id) on delete cascade,
  title    text not null check (
             char_length(title) between 2 and 60 and title = btrim(regexp_replace(title, '\s+', ' ', 'g'))
           ),
  points   int  not null check (points between -25 and 25 and points <> 0),
  position int  not null
);
create unique index rule_pack_rules_title_uniq on public.rule_pack_rules (pack_id, lower(title));

alter table public.rules add column pack_id text references public.rule_packs (id) on delete set null;

-- The catalog isn't trip data: any signed-in phone may read it, including before it joins a trip.
alter table public.rule_packs      enable row level security;
alter table public.rule_pack_rules enable row level security;
create policy "signed-in phones read published packs" on public.rule_packs
  for select to authenticated using (published);
create policy "signed-in phones read published pack rules" on public.rule_pack_rules
  for select to authenticated using (
    exists (select 1 from public.rule_packs p where p.id = rule_pack_rules.pack_id and p.published)
  );
revoke insert, update, delete, truncate on public.rule_packs, public.rule_pack_rules from anon, authenticated;
revoke select on public.rule_packs, public.rule_pack_rules from anon;

insert into public.rule_packs (id, name, position) values
  ('classics', 'Trip classics', 1),
  ('cabin-weekend', 'Cabin weekend', 2);

-- The rules every trip was seeded with before packs existed.
insert into public.rule_pack_rules (pack_id, title, points, position)
select 'classics', r.title, r.points, r.position
from (values
  ('Drinking from a straw', -5, 1),
  ('Ordering a non-alcoholic or light drink', -3, 2),
  ('Checking work email or Slack', -10, 3),
  ('Late to a group plan (per 10 min)', -5, 4),
  ('Asleep before midnight', -15, 5),
  ('Losing phone, wallet or room key', -20, 6),
  ('Saying the fiancée''s name before noon', -5, 7),
  ('Not wearing the trip shirt on shirt day', -10, 8),
  ('Taking a call over 5 minutes', -5, 9),
  ('Leaving a drink unfinished', -5, 10),
  ('On your phone at dinner', -5, 11),
  ('Logging points against the wrong player', -2, 12),
  ('Getting a stranger to toast the groom', 10, 13),
  ('Winning a group game or tournament', 15, 14),
  ('First up and bringing coffee for the group', 10, 15),
  ('Best dressed of the night', 10, 16),
  ('Karaoke performance, full song', 10, 17),
  ('Talking the group out of a terrible idea', 10, 18),
  ('Group photo with a stranger who joins in', 5, 19),
  ('Remembering everyone''s drink order', 5, 20),
  ('Completing a daily challenge', 20, 21),
  ('Groom''s pick', 15, 22)
) as r (title, points, position);

-- From the first group's point sheet, with points capped at the ±25 rule limit.
insert into public.rule_pack_rules (pack_id, title, points, position)
select 'cabin-weekend', r.title, r.points, r.position
from (values
  ('First to arrive', 10, 1),
  ('Ping pong win (singles)', 10, 2),
  ('Ping pong win (doubles)', 5, 3),
  ('Foosball win (singles)', 10, 4),
  ('Foosball win (doubles)', 5, 5),
  ('Pool win (singles)', 10, 6),
  ('Pool win (doubles)', 5, 7),
  ('Beer pong win (doubles)', 10, 8),
  ('Cornhole win (doubles)', 10, 9),
  ('Flip cup win (doubles)', 10, 10),
  ('Flip cup win (triples)', 5, 11),
  ('Chesties win (doubles)', 10, 12),
  ('Gingerbread house contest win', 5, 13),
  ('Locate My Buddies win', 20, 14),
  ('Lasting longest outside in gym shorts', 20, 15),
  ('Shotgunning a beer', 1, 16),
  ('Shotgunning a beer before 10am', 5, 17),
  ('Finishing a drink', 1, 18),
  ('Taking a shot', 3, 19),
  ('Drawing on a sleeping person''s face', 5, 20),
  ('Catching someone sneaking a cigarette', 2, 21),
  ('Trick shot made on the first try', 25, 22),
  ('Eating a whole large pizza in one sitting', 25, 23),
  ('Swiping someone''s ID for 5 minutes unnoticed', 10, 24),
  ('Last to arrive', -20, 25),
  ('Getting lost driving', -25, 26),
  ('Asleep before midnight', -15, 27),
  ('Last one to wake up', -5, 28),
  ('Falling asleep somewhere weird', -10, 29),
  ('Complaining about the weather', -3, 30),
  ('Complaining about a hangover', -25, 31),
  ('Spilling a drink', -5, 32),
  ('Leaving a drink unfinished', -2, 33),
  ('Sitting out a group game', -25, 34),
  ('Wetting yourself', -25, 35),
  ('Opening the fridge and taking nothing', -5, 36),
  ('Getting yourself a drink without offering', -5, 37),
  ('Throwing up', -25, 38),
  ('Breaking something that isn''t yours', -25, 39),
  ('Telling a "funny" story nobody laughs at', -5, 40),
  ('Not starting a story with "This one time at band camp"', -5, 41),
  ('The whole group agrees you lose points', -10, 42),
  ('Drinking from a straw', -10, 43),
  ('Skipping the group tattoo', -25, 44)
) as r (title, points, position);

update public.rules r set pack_id = 'classics'
where r.is_preset
  and exists (
    select 1 from public.rule_pack_rules p where p.pack_id = 'classics' and lower(p.title) = lower(r.title)
  );

-- Copies a pack's rules into a trip, skipping any the trip already has by name (the same check that stops
-- duplicate rules), so a pack can be added again safely or after other packs. Returns how many were added.
create function public.insert_rule_pack_internal(p_trip_id uuid, p_pack_id text) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_added int;
begin
  if not exists (select 1 from public.rule_packs where id = p_pack_id and published) then
    raise exception 'That rule pack isn''t available';
  end if;
  insert into public.rules (trip_id, title, points, is_preset, pack_id)
  select p_trip_id, r.title, r.points, true, r.pack_id
  from public.rule_pack_rules r
  where r.pack_id = p_pack_id
  order by r.position
  on conflict (trip_id, lower(title)) where not archived do nothing;
  get diagnostics v_added = row_count;
  return v_added;
end
$$;

-- Adding a whole pack changes the rulebook for everyone at once, so it's the organiser's call.
create function public.add_rule_pack(p_trip_id uuid, p_pack_id text) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_me uuid := public.my_player_id(p_trip_id);
begin
  if v_me is null then raise exception 'You''re not in this trip'; end if;
  if not (select is_organiser from public.players where id = v_me) then
    raise exception 'Only the organiser can add rule packs';
  end if;
  return public.insert_rule_pack_internal(p_trip_id, p_pack_id);
end
$$;

drop function public.create_trip(text, text[], int, text, int, int);
drop function public.seed_preset_rules(uuid);

-- p_rule_pack_ids defaults to the classics, which is what every trip got before packs existed,
-- so an app version that doesn't send packs still starts with a rulebook. An empty array starts with none.
create function public.create_trip(
  p_name           text,
  p_player_names   text[],
  p_my_index       int,          -- 0-based index into p_player_names
  p_pin            text,
  p_groom_index    int    default null,
  p_vote_threshold int    default 3,
  p_rule_pack_ids  text[] default array['classics']
) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  v_uid       uuid := auth.uid();
  v_n         int  := coalesce(array_length(p_player_names, 1), 0);
  v_packs     text[] := coalesce(p_rule_pack_ids, '{}');
  v_alphabet  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  v_colors    text[] := array['#E07A3F','#3F7EE0','#9B59D0','#2FA37A','#D04B6E','#C9A227',
                              '#1FA2B8','#7A6FF0','#E0563F','#5E8C31','#B5487F','#8C6A3F'];
  v_code      text;
  v_trip_id   uuid;
  v_player_id uuid;
  v_me        uuid;
  v_i         int;
  v_pack_id   text;
begin
  if v_uid is null then raise exception 'Not signed in'; end if;
  if char_length(btrim(coalesce(p_name, ''))) = 0 then raise exception 'Give the trip a name'; end if;
  if v_n < 3 or v_n > 30 then raise exception 'A trip needs between 3 and 30 players'; end if;
  if exists (select 1 from unnest(p_player_names) x where char_length(btrim(coalesce(x, ''))) = 0) then
    raise exception 'Every player needs a name';
  end if;
  if (select count(distinct lower(btrim(x))) from unnest(p_player_names) x) <> v_n then
    raise exception 'Player names must all be different';
  end if;
  if p_my_index is null or p_my_index < 0 or p_my_index >= v_n then
    raise exception 'Pick which player you are';
  end if;
  if p_groom_index is not null and (p_groom_index < 0 or p_groom_index >= v_n) then
    raise exception 'Pick a valid groom';
  end if;
  -- The logger and the subject can't vote, so at most n-2 players can vote on an entry.
  if p_vote_threshold is null or p_vote_threshold < 1 or p_vote_threshold > v_n - 2 then
    raise exception 'Votes needed must be between 1 and % for % players', v_n - 2, v_n;
  end if;
  if p_pin is null or p_pin !~ '^[0-9]{4}$' then raise exception 'PIN must be 4 digits'; end if;
  if cardinality(v_packs) > 10 then raise exception 'Pick up to 10 rule packs'; end if;
  if exists (
    select 1 from unnest(v_packs) x
    where not exists (select 1 from public.rule_packs p where p.id = x and p.published)
  ) then
    raise exception 'That rule pack isn''t available';
  end if;

  loop
    v_code := '';
    for v_i in 1..6 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.trips where join_code = v_code);
  end loop;

  insert into public.trips (name, join_code, vote_threshold)
  values (btrim(p_name), v_code, p_vote_threshold)
  returning id into v_trip_id;

  for v_i in 1..v_n loop
    insert into public.players (trip_id, name, position, color, is_groom, is_organiser)
    values (
      v_trip_id,
      btrim(p_player_names[v_i]),
      v_i - 1,
      v_colors[1 + (v_i - 1) % array_length(v_colors, 1)],
      coalesce(p_groom_index = v_i - 1, false),
      p_my_index = v_i - 1
    )
    returning id into v_player_id;
    if p_my_index = v_i - 1 then v_me := v_player_id; end if;
  end loop;

  insert into public.player_pins (player_id, pin_hash) values (v_me, crypt(p_pin, gen_salt('bf', 8)));

  insert into public.devices (auth_user_id, player_id, trip_id) values (v_uid, v_me, v_trip_id)
  on conflict (auth_user_id) do update
    set player_id = excluded.player_id, trip_id = excluded.trip_id, joined_at = now(), last_seen = now();

  -- In the order picked, so where two packs share a rule name the first pack's points win.
  foreach v_pack_id in array v_packs loop
    perform public.insert_rule_pack_internal(v_trip_id, v_pack_id);
  end loop;

  return jsonb_build_object('trip_id', v_trip_id, 'join_code', v_code, 'player_id', v_me);
end
$$;

revoke execute on function
  public.create_trip(text, text[], int, text, int, int, text[]),
  public.add_rule_pack(uuid, text),
  public.insert_rule_pack_internal(uuid, text)
from public, anon;
grant execute on function
  public.create_trip(text, text[], int, text, int, int, text[]),
  public.add_rule_pack(uuid, text)
to authenticated;
revoke execute on function public.insert_rule_pack_internal(uuid, text) from authenticated;
