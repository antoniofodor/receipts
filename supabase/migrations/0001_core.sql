-- Security model: clients can only SELECT, and only rows for trips their device is linked to.
-- Every write goes through a SECURITY DEFINER function below, which enforces the game rules
-- (who may vote, the vote threshold, rule limits, reply depth).

create extension if not exists pgcrypto with schema extensions;

create table public.trips (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(name) between 1 and 60),
  join_code      text not null unique,
  vote_threshold int  not null default 3 check (vote_threshold between 1 and 28),
  created_at     timestamptz not null default now()
);

create table public.players (
  id           uuid primary key default gen_random_uuid(),
  trip_id      uuid not null references public.trips (id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 30),
  position     int  not null,
  color        text not null,
  is_groom     boolean not null default false,
  is_organiser boolean not null default false,
  created_at   timestamptz not null default now()
);
create unique index players_trip_name_uniq on public.players (trip_id, lower(name));

-- Kept apart from players so PIN hashes are never readable by clients.
create table public.player_pins (
  player_id       uuid primary key references public.players (id) on delete cascade,
  pin_hash        text not null,
  failed_attempts int  not null default 0,
  locked_until    timestamptz
);

-- Links an anonymous Supabase auth user (one per phone install) to a player.
create table public.devices (
  auth_user_id uuid primary key references auth.users (id) on delete cascade,
  player_id    uuid not null references public.players (id) on delete cascade,
  trip_id      uuid not null references public.trips (id) on delete cascade,
  joined_at    timestamptz not null default now(),
  last_seen    timestamptz not null default now()
);
create index devices_trip_idx on public.devices (trip_id);

-- Penalty or bonus is the sign of points.
create table public.rules (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references public.trips (id) on delete cascade,
  title      text not null check (char_length(title) between 2 and 60),
  points     int  not null check (points between -25 and 25 and points <> 0),
  is_preset  boolean not null default false,
  created_by uuid references public.players (id) on delete set null,
  archived   boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index rules_trip_title_uniq on public.rules (trip_id, lower(title)) where not archived;

-- points is copied from the rule when filed (and may be overridden, e.g. "late, per 10 min" x2),
-- so later edits to a rule never rewrite history.
create table public.entries (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references public.trips (id) on delete cascade,
  subject_id  uuid not null references public.players (id) on delete cascade,
  filed_by    uuid not null references public.players (id) on delete cascade,
  rule_id     uuid not null references public.rules (id) on delete restrict,
  points      int  not null check (points between -50 and 50 and points <> 0),
  note        text check (note is null or char_length(note) <= 500),
  status      text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);
create index entries_trip_created_idx on public.entries (trip_id, created_at desc);
create index entries_subject_idx on public.entries (subject_id);

create table public.votes (
  entry_id   uuid not null references public.entries (id) on delete cascade,
  voter_id   uuid not null references public.players (id) on delete cascade,
  trip_id    uuid not null references public.trips (id) on delete cascade,
  confirm    boolean not null,
  created_at timestamptz not null default now(),
  primary key (entry_id, voter_id)
);
create index votes_trip_idx on public.votes (trip_id);

create table public.evidence (
  id           uuid primary key default gen_random_uuid(),
  entry_id     uuid not null references public.entries (id) on delete cascade,
  trip_id      uuid not null references public.trips (id) on delete cascade,
  storage_path text not null unique,
  width        int,
  height       int,
  created_at   timestamptz not null default now()
);
create index evidence_entry_idx on public.evidence (entry_id);

create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  entry_id   uuid not null references public.entries (id) on delete cascade,
  trip_id    uuid not null references public.trips (id) on delete cascade,
  parent_id  uuid references public.comments (id) on delete cascade,
  author_id  uuid not null references public.players (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index comments_entry_idx on public.comments (entry_id, created_at);

create function public.my_player_id(p_trip_id uuid) returns uuid
language sql stable security definer set search_path = public, pg_temp as $$
  select d.player_id from public.devices d
  where d.auth_user_id = auth.uid() and d.trip_id = p_trip_id
$$;

create function public.is_trip_member(p_trip_id uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.devices d
    where d.auth_user_id = auth.uid() and d.trip_id = p_trip_id
  )
$$;

alter table public.trips       enable row level security;
alter table public.players     enable row level security;
alter table public.player_pins enable row level security;
alter table public.devices     enable row level security;
alter table public.rules       enable row level security;
alter table public.entries     enable row level security;
alter table public.votes       enable row level security;
alter table public.evidence    enable row level security;
alter table public.comments    enable row level security;

create policy "members read trip"     on public.trips    for select to authenticated using (public.is_trip_member(id));
create policy "members read players"  on public.players  for select to authenticated using (public.is_trip_member(trip_id));
create policy "members read rules"    on public.rules    for select to authenticated using (public.is_trip_member(trip_id));
create policy "members read entries"  on public.entries  for select to authenticated using (public.is_trip_member(trip_id));
create policy "members read votes"    on public.votes    for select to authenticated using (public.is_trip_member(trip_id));
create policy "members read evidence" on public.evidence for select to authenticated using (public.is_trip_member(trip_id));
create policy "members read comments" on public.comments for select to authenticated using (public.is_trip_member(trip_id));
create policy "read own device"       on public.devices  for select to authenticated using (auth_user_id = auth.uid());
-- player_pins: no policies, so no client access at all.

-- security_invoker makes the view respect the RLS policies above.
create view public.leaderboard with (security_invoker = true) as
select
  p.trip_id,
  p.id    as player_id,
  p.name,
  p.color,
  p.is_groom,
  coalesce(sum(e.points) filter (where e.status = 'confirmed'), 0)::int as points,
  count(e.id) filter (where e.status = 'pending')::int                  as pending_count,
  rank() over (
    partition by p.trip_id
    order by coalesce(sum(e.points) filter (where e.status = 'confirmed'), 0) desc
  )::int as rank
from public.players p
left join public.entries e on e.subject_id = p.id
group by p.id;

create function public.seed_preset_rules(p_trip_id uuid) returns void
language sql security definer set search_path = public, pg_temp as $$
  insert into public.rules (trip_id, title, points, is_preset)
  select p_trip_id, r.title, r.points, true
  from (values
    ('Drinking from a straw', -5),
    ('Ordering a non-alcoholic or light drink', -3),
    ('Checking work email or Slack', -10),
    ('Late to a group plan (per 10 min)', -5),
    ('Asleep before midnight', -15),
    ('Losing phone, wallet or room key', -20),
    ('Saying the fiancée''s name before noon', -5),
    ('Not wearing the trip shirt on shirt day', -10),
    ('Taking a call over 5 minutes', -5),
    ('Leaving a drink unfinished', -5),
    ('On your phone at dinner', -5),
    ('Logging points against the wrong player', -2),
    ('Getting a stranger to toast the groom', 10),
    ('Winning a group game or tournament', 15),
    ('First up and bringing coffee for the group', 10),
    ('Best dressed of the night', 10),
    ('Karaoke performance, full song', 10),
    ('Talking the group out of a terrible idea', 10),
    ('Group photo with a stranger who joins in', 5),
    ('Remembering everyone''s drink order', 5),
    ('Completing a daily challenge', 20),
    ('Groom''s pick', 15)
  ) as r (title, points)
$$;

create function public.create_trip(
  p_name           text,
  p_player_names   text[],
  p_my_index       int,          -- 0-based index into p_player_names
  p_pin            text,
  p_groom_index    int default null,
  p_vote_threshold int default 3
) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  v_uid       uuid := auth.uid();
  v_n         int  := coalesce(array_length(p_player_names, 1), 0);
  v_alphabet  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  v_colors    text[] := array['#E07A3F','#3F7EE0','#9B59D0','#2FA37A','#D04B6E','#C9A227',
                              '#1FA2B8','#7A6FF0','#E0563F','#5E8C31','#B5487F','#8C6A3F'];
  v_code      text;
  v_trip_id   uuid;
  v_player_id uuid;
  v_me        uuid;
  v_i         int;
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

  perform public.seed_preset_rules(v_trip_id);

  return jsonb_build_object('trip_id', v_trip_id, 'join_code', v_code, 'player_id', v_me);
end
$$;

-- Readable before joining, so it exposes only what the join screen needs.
create function public.trip_preview(p_code text) returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  v_trip public.trips;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select * into v_trip from public.trips where join_code = upper(btrim(p_code));
  if not found then raise exception 'No trip found with that code'; end if;
  return jsonb_build_object(
    'trip_id', v_trip.id,
    'name', v_trip.name,
    'players', (
      select jsonb_agg(jsonb_build_object(
        'id', p.id, 'name', p.name, 'color', p.color, 'is_groom', p.is_groom,
        'claimed', exists (select 1 from public.player_pins pp where pp.player_id = p.id)
      ) order by p.position)
      from public.players p where p.trip_id = v_trip.id
    )
  );
end
$$;

-- First join for a player sets their PIN. Later joins (new phone) must match it.
-- Wrong PINs return {ok:false} instead of raising, so the attempt counter is saved.
create function public.join_trip(p_code text, p_player_id uuid, p_pin text) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  v_uid     uuid := auth.uid();
  v_trip_id uuid;
  v_pin     public.player_pins;
  v_fails   int;
begin
  if v_uid is null then raise exception 'Not signed in'; end if;
  select id into v_trip_id from public.trips where join_code = upper(btrim(p_code));
  if v_trip_id is null then raise exception 'No trip found with that code'; end if;
  if not exists (select 1 from public.players where id = p_player_id and trip_id = v_trip_id) then
    raise exception 'That player isn''t on this trip';
  end if;
  if p_pin is null or p_pin !~ '^[0-9]{4}$' then raise exception 'PIN must be 4 digits'; end if;

  select * into v_pin from public.player_pins where player_id = p_player_id for update;
  if not found then
    insert into public.player_pins (player_id, pin_hash) values (p_player_id, crypt(p_pin, gen_salt('bf', 8)));
  else
    if v_pin.locked_until is not null and v_pin.locked_until > now() then
      return jsonb_build_object('ok', false, 'error', 'locked',
        'retry_after_seconds', ceil(extract(epoch from v_pin.locked_until - now()))::int);
    end if;
    if v_pin.pin_hash <> crypt(p_pin, v_pin.pin_hash) then
      v_fails := v_pin.failed_attempts + 1;
      update public.player_pins
        set failed_attempts = case when v_fails >= 5 then 0 else v_fails end,
            locked_until    = case when v_fails >= 5 then now() + interval '10 minutes' else null end
        where player_id = p_player_id;
      if v_fails >= 5 then
        return jsonb_build_object('ok', false, 'error', 'locked', 'retry_after_seconds', 600);
      end if;
      return jsonb_build_object('ok', false, 'error', 'wrong_pin', 'attempts_left', 5 - v_fails);
    end if;
    update public.player_pins set failed_attempts = 0, locked_until = null where player_id = p_player_id;
  end if;

  insert into public.devices (auth_user_id, player_id, trip_id) values (v_uid, p_player_id, v_trip_id)
  on conflict (auth_user_id) do update
    set player_id = excluded.player_id, trip_id = excluded.trip_id, joined_at = now(), last_seen = now();

  return jsonb_build_object('ok', true, 'trip_id', v_trip_id, 'player_id', p_player_id);
end
$$;

create function public.get_my_session() returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_row record;
begin
  update public.devices set last_seen = now() where auth_user_id = auth.uid();
  select d.trip_id, d.player_id, t.name as trip_name, t.join_code, t.vote_threshold,
         p.name as player_name, p.is_organiser, p.is_groom
    into v_row
    from public.devices d
    join public.trips t on t.id = d.trip_id
    join public.players p on p.id = d.player_id
   where d.auth_user_id = auth.uid();
  if not found then return null; end if;
  return to_jsonb(v_row);
end
$$;

create function public.leave_trip() returns void
language sql security definer set search_path = public, pg_temp as $$
  delete from public.devices where auth_user_id = auth.uid()
$$;

create function public.insert_rule_internal(p_trip_id uuid, p_title text, p_points int, p_created_by uuid)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_title text := btrim(regexp_replace(coalesce(p_title, ''), '\s+', ' ', 'g'));
  v_id    uuid;
begin
  if char_length(v_title) < 2 or char_length(v_title) > 60 then
    raise exception 'Rule names must be 2 to 60 characters';
  end if;
  if p_points is null or p_points = 0 or abs(p_points) > 25 then
    raise exception 'Rule points must be between -25 and 25, and not 0';
  end if;
  if exists (select 1 from public.rules
             where trip_id = p_trip_id and not archived and lower(title) = lower(v_title)) then
    raise exception 'There''s already a rule called "%"', v_title;
  end if;
  insert into public.rules (trip_id, title, points, created_by)
  values (p_trip_id, v_title, p_points, p_created_by)
  returning id into v_id;
  return v_id;
end
$$;

create function public.create_rule(p_trip_id uuid, p_title text, p_points int) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_me uuid := public.my_player_id(p_trip_id);
begin
  if v_me is null then raise exception 'You''re not in this trip'; end if;
  return public.insert_rule_internal(p_trip_id, p_title, p_points, v_me);
end
$$;

-- Pass p_rule_id to use an existing rule, or p_new_rule_title + p_new_rule_points to create one.
-- p_subject_id may be yourself (self-claims); the same vote check applies.
create function public.create_entry(
  p_trip_id          uuid,
  p_subject_id       uuid,
  p_rule_id          uuid default null,
  p_new_rule_title   text default null,
  p_new_rule_points  int  default null,
  p_points           int  default null,
  p_note             text default null
) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_me          uuid := public.my_player_id(p_trip_id);
  v_rule_id     uuid;
  v_rule_points int;
  v_points      int;
  v_note        text := nullif(btrim(coalesce(p_note, '')), '');
  v_id          uuid;
begin
  if v_me is null then raise exception 'You''re not in this trip'; end if;
  if not exists (select 1 from public.players where id = p_subject_id and trip_id = p_trip_id) then
    raise exception 'That player isn''t on this trip';
  end if;
  if p_rule_id is not null and p_new_rule_title is not null then
    raise exception 'Pick a rule or create one, not both';
  end if;

  if p_rule_id is null then
    if p_new_rule_title is null then raise exception 'Pick a rule or create a new one'; end if;
    v_rule_id := public.insert_rule_internal(p_trip_id, p_new_rule_title, p_new_rule_points, v_me);
    v_rule_points := p_new_rule_points;
  else
    select id, points into v_rule_id, v_rule_points
      from public.rules where id = p_rule_id and trip_id = p_trip_id and not archived;
    if v_rule_id is null then raise exception 'That rule doesn''t exist'; end if;
  end if;

  v_points := coalesce(p_points, v_rule_points);
  if v_points = 0 or abs(v_points) > 50 then
    raise exception 'Points must be between -50 and 50, and not 0';
  end if;
  if char_length(v_note) > 500 then raise exception 'Notes can be up to 500 characters'; end if;

  insert into public.entries (trip_id, subject_id, filed_by, rule_id, points, note)
  values (p_trip_id, p_subject_id, v_me, v_rule_id, v_points, v_note)
  returning id into v_id;
  return v_id;
end
$$;

-- The entry row is locked so simultaneous votes are counted one at a time.
create function public.cast_vote(p_entry_id uuid, p_confirm boolean) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_entry     public.entries;
  v_me        uuid;
  v_threshold int;
  v_yes       int;
  v_no        int;
  v_status    text;
begin
  if p_confirm is null then raise exception 'Vote must be confirm or reject'; end if;
  select * into v_entry from public.entries where id = p_entry_id for update;
  if not found then raise exception 'Entry not found'; end if;
  v_me := public.my_player_id(v_entry.trip_id);
  if v_me is null then raise exception 'Entry not found'; end if;
  if v_me = v_entry.filed_by then raise exception 'You can''t vote on an entry you logged'; end if;
  if v_me = v_entry.subject_id then raise exception 'You can''t vote on an entry about you'; end if;
  if v_entry.status <> 'pending' then raise exception 'Voting on this entry has closed'; end if;
  if exists (select 1 from public.votes where entry_id = p_entry_id and voter_id = v_me) then
    raise exception 'You''ve already voted on this entry';
  end if;

  insert into public.votes (entry_id, voter_id, trip_id, confirm)
  values (p_entry_id, v_me, v_entry.trip_id, p_confirm);

  select count(*) filter (where confirm), count(*) filter (where not confirm)
    into v_yes, v_no
    from public.votes where entry_id = p_entry_id;
  select vote_threshold into v_threshold from public.trips where id = v_entry.trip_id;

  v_status := case
    when v_yes >= v_threshold then 'confirmed'
    when v_no  >= v_threshold then 'rejected'
    else 'pending'
  end;
  if v_status <> 'pending' then
    update public.entries set status = v_status, resolved_at = now() where id = p_entry_id;
  end if;

  return jsonb_build_object('status', v_status, 'confirms', v_yes, 'rejects', v_no, 'threshold', v_threshold);
end
$$;

-- Replies are one level deep: you can reply to a comment, not to a reply.
create function public.add_comment(p_entry_id uuid, p_body text, p_parent_id uuid default null) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_trip_id uuid;
  v_me      uuid;
  v_body    text := btrim(coalesce(p_body, ''));
  v_parent  public.comments;
  v_id      uuid;
begin
  select trip_id into v_trip_id from public.entries where id = p_entry_id;
  v_me := public.my_player_id(v_trip_id);
  if v_trip_id is null or v_me is null then raise exception 'Entry not found'; end if;
  if char_length(v_body) = 0 then raise exception 'Write something first'; end if;
  if char_length(v_body) > 1000 then raise exception 'Comments can be up to 1000 characters'; end if;
  if p_parent_id is not null then
    select * into v_parent from public.comments where id = p_parent_id;
    if not found or v_parent.entry_id <> p_entry_id then raise exception 'That comment doesn''t exist'; end if;
    if v_parent.parent_id is not null then raise exception 'You can only reply to top-level comments'; end if;
  end if;

  insert into public.comments (entry_id, trip_id, parent_id, author_id, body)
  values (p_entry_id, v_trip_id, p_parent_id, v_me, v_body)
  returning id into v_id;
  return v_id;
end
$$;

-- Called after the photo is uploaded to storage at <trip_id>/<entry_id>/<file>.
create function public.add_evidence(p_entry_id uuid, p_storage_path text, p_width int default null, p_height int default null)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_entry public.entries;
  v_id    uuid;
begin
  select * into v_entry from public.entries where id = p_entry_id;
  if not found or public.my_player_id(v_entry.trip_id) is null then raise exception 'Entry not found'; end if;
  if public.my_player_id(v_entry.trip_id) <> v_entry.filed_by then
    raise exception 'Only the person who logged an entry can add photos to it';
  end if;
  if p_storage_path is null or p_storage_path not like v_entry.trip_id || '/' || v_entry.id || '/%' then
    raise exception 'Photo path doesn''t match this entry';
  end if;
  if (select count(*) from public.evidence where entry_id = p_entry_id) >= 3 then
    raise exception 'An entry can have up to 3 photos';
  end if;

  insert into public.evidence (entry_id, trip_id, storage_path, width, height)
  values (p_entry_id, v_entry.trip_id, p_storage_path, p_width, p_height)
  returning id into v_id;
  return v_id;
end
$$;

-- Supabase grants table writes to API roles by default; RLS already blocks them, this is belt and braces.
revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;
revoke select on all tables in schema public from anon;
revoke all on public.player_pins from anon, authenticated;

revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.my_player_id(uuid),
  public.is_trip_member(uuid),
  public.create_trip(text, text[], int, text, int, int),
  public.trip_preview(text),
  public.join_trip(text, uuid, text),
  public.get_my_session(),
  public.leave_trip(),
  public.create_rule(uuid, text, int),
  public.create_entry(uuid, uuid, uuid, text, int, int, text),
  public.cast_vote(uuid, boolean),
  public.add_comment(uuid, text, uuid),
  public.add_evidence(uuid, text, int, int)
to authenticated;
revoke execute on function public.seed_preset_rules(uuid), public.insert_rule_internal(uuid, text, int, uuid) from authenticated;
