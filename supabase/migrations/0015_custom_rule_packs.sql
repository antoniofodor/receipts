-- Rule packs people make for themselves, to reuse across trips. They belong to an account (not a phone's
-- anonymous sign-in), so they follow the person to any phone. Like the catalog packs, they're copied into a
-- trip, never linked: editing a pack later never changes a trip's rulebook.

create table public.custom_rule_packs (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now()
);
create unique index custom_rule_packs_owner_name_uniq on public.custom_rule_packs (owner_id, lower(name));

create table public.custom_pack_rules (
  id         uuid primary key default gen_random_uuid(),
  pack_id    uuid not null references public.custom_rule_packs (id) on delete cascade,
  title      text not null check (char_length(title) between 2 and 60),
  points     int  not null check (points between -25 and 25 and points <> 0),
  created_at timestamptz not null default now()
);
create unique index custom_pack_rules_title_uniq on public.custom_pack_rules (pack_id, lower(title));

alter table public.rules add column custom_pack_id uuid references public.custom_rule_packs (id) on delete set null;
create index rules_custom_pack_idx on public.rules (trip_id, custom_pack_id) where custom_pack_id is not null;

alter table public.custom_rule_packs enable row level security;
alter table public.custom_pack_rules enable row level security;
create policy "owners read their packs" on public.custom_rule_packs
  for select to authenticated using (owner_id = auth.uid());
create policy "owners read their pack rules" on public.custom_pack_rules
  for select to authenticated using (
    exists (select 1 from public.custom_rule_packs p where p.id = custom_pack_rules.pack_id and p.owner_id = auth.uid())
  );
revoke all on public.custom_rule_packs, public.custom_pack_rules from anon;
revoke insert, update, delete on public.custom_rule_packs, public.custom_pack_rules from authenticated;

-- The caller's account id. A phone that hasn't made an account yet is refused with a sentence that says why.
create function public.my_account_id() returns uuid
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if not exists (select 1 from auth.users where id = auth.uid() and not is_anonymous) then
    raise exception 'Create an account or sign in to save your own rule packs';
  end if;
  return auth.uid();
end
$$;

create function public.my_custom_pack(p_pack_id uuid) returns public.custom_rule_packs
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  v_pack public.custom_rule_packs;
begin
  select * into v_pack from public.custom_rule_packs where id = p_pack_id and owner_id = public.my_account_id();
  if not found then raise exception 'That rule pack isn''t yours, or it''s been deleted'; end if;
  return v_pack;
end
$$;

create function public.checked_pack_name(p_name text) returns text
language plpgsql immutable set search_path = public, pg_temp as $$
declare
  v_name text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
begin
  if char_length(v_name) < 1 or char_length(v_name) > 40 then
    raise exception 'Pack names must be 1 to 40 characters';
  end if;
  return v_name;
end
$$;

-- The same checks as a trip's rules (checked_rule_title), against the pack instead of the trip.
create function public.checked_pack_rule_title(p_pack_id uuid, p_title text, p_points int, p_rule_id uuid default null)
returns text
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  v_title text := btrim(regexp_replace(coalesce(p_title, ''), '\s+', ' ', 'g'));
begin
  if char_length(v_title) < 2 or char_length(v_title) > 60 then
    raise exception 'Rule names must be 2 to 60 characters';
  end if;
  if p_points is null or p_points = 0 or abs(p_points) > 25 then
    raise exception 'Rule points must be between -25 and 25, and not 0';
  end if;
  if exists (select 1 from public.custom_pack_rules
             where pack_id = p_pack_id and lower(title) = lower(v_title) and id is distinct from p_rule_id) then
    raise exception 'This pack already has a rule called "%"', v_title;
  end if;
  return v_title;
end
$$;

create function public.create_custom_pack(p_name text) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_owner uuid := public.my_account_id();
  v_name  text := public.checked_pack_name(p_name);
  v_id    uuid;
begin
  if (select count(*) from public.custom_rule_packs where owner_id = v_owner) >= 20 then
    raise exception 'You can keep up to 20 rule packs. Delete one to make room';
  end if;
  if exists (select 1 from public.custom_rule_packs where owner_id = v_owner and lower(name) = lower(v_name)) then
    raise exception 'You already have a pack called "%"', v_name;
  end if;
  insert into public.custom_rule_packs (owner_id, name) values (v_owner, v_name) returning id into v_id;
  return v_id;
end
$$;

create function public.rename_custom_pack(p_pack_id uuid, p_name text) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_pack public.custom_rule_packs := public.my_custom_pack(p_pack_id);
  v_name text := public.checked_pack_name(p_name);
begin
  if exists (select 1 from public.custom_rule_packs
             where owner_id = v_pack.owner_id and lower(name) = lower(v_name) and id <> v_pack.id) then
    raise exception 'You already have a pack called "%"', v_name;
  end if;
  update public.custom_rule_packs set name = v_name where id = v_pack.id;
end
$$;

-- Trips that used the pack keep their copies of its rules.
create function public.delete_custom_pack(p_pack_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_pack public.custom_rule_packs := public.my_custom_pack(p_pack_id);
begin
  delete from public.custom_rule_packs where id = v_pack.id;
end
$$;

-- Adds rules from anywhere (a catalog pack, a trip's rulebook, or typed in) as [{"title": …, "points": …}].
-- A rule the pack already has by name is skipped, as is a repeat within the list. Returns how many were added.
create function public.add_custom_pack_rules(p_pack_id uuid, p_rules jsonb) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_pack  public.custom_rule_packs := public.my_custom_pack(p_pack_id);
  v_rule  jsonb;
  v_title text;
  v_added int := 0;
begin
  if jsonb_typeof(p_rules) is distinct from 'array' then raise exception 'Pick some rules to add'; end if;
  for v_rule in select * from jsonb_array_elements(p_rules) loop
    v_title := btrim(regexp_replace(coalesce(v_rule ->> 'title', ''), '\s+', ' ', 'g'));
    continue when exists (select 1 from public.custom_pack_rules where pack_id = v_pack.id and lower(title) = lower(v_title));
    v_title := public.checked_pack_rule_title(v_pack.id, v_title, (v_rule ->> 'points')::int);
    if (select count(*) from public.custom_pack_rules where pack_id = v_pack.id) >= 100 then
      raise exception 'A pack can hold up to 100 rules';
    end if;
    insert into public.custom_pack_rules (pack_id, title, points) values (v_pack.id, v_title, (v_rule ->> 'points')::int);
    v_added := v_added + 1;
  end loop;
  return v_added;
end
$$;

create function public.update_custom_pack_rule(p_rule_id uuid, p_title text, p_points int) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_pack_id uuid := (select pack_id from public.custom_pack_rules where id = p_rule_id);
  v_pack    public.custom_rule_packs := public.my_custom_pack(v_pack_id);
begin
  update public.custom_pack_rules
     set title = public.checked_pack_rule_title(v_pack.id, p_title, p_points, p_rule_id), points = p_points
   where id = p_rule_id;
end
$$;

create function public.delete_custom_pack_rule(p_rule_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_pack public.custom_rule_packs := public.my_custom_pack((select pack_id from public.custom_pack_rules where id = p_rule_id));
begin
  delete from public.custom_pack_rules where id = p_rule_id and pack_id = v_pack.id;
end
$$;

-- The organiser copies one of their own packs into the trip, like add_rule_pack. Rules the trip already has
-- by name are skipped. Returns how many were added.
create function public.add_custom_pack_to_trip(p_trip_id uuid, p_pack_id uuid) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_me    uuid := public.my_player_id(p_trip_id);
  v_pack  public.custom_rule_packs;
  v_added int;
begin
  if v_me is null then raise exception 'You''re not in this trip'; end if;
  if not (select is_organiser from public.players where id = v_me) then
    raise exception 'Only the organiser can add rule packs';
  end if;
  v_pack := public.my_custom_pack(p_pack_id);
  insert into public.rules (trip_id, title, points, is_preset, custom_pack_id)
  select p_trip_id, r.title, r.points, true, v_pack.id
  from public.custom_pack_rules r
  where r.pack_id = v_pack.id
  order by r.created_at
  on conflict (trip_id, lower(title)) where not archived do nothing;
  get diagnostics v_added = row_count;
  return v_added;
end
$$;

-- Like remove_rule_pack: archives every rule copied from the pack, edited ones too.
create function public.remove_custom_pack_from_trip(p_trip_id uuid, p_pack_id uuid) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_me      uuid := public.my_player_id(p_trip_id);
  v_removed int;
begin
  if v_me is null then raise exception 'You''re not in this trip'; end if;
  if not (select is_organiser from public.players where id = v_me) then
    raise exception 'Only the organiser can remove rule packs';
  end if;
  update public.rules set archived = true
  where trip_id = p_trip_id and custom_pack_id = p_pack_id and not archived;
  get diagnostics v_removed = row_count;
  return v_removed;
end
$$;

revoke execute on function
  public.my_account_id(),
  public.my_custom_pack(uuid),
  public.checked_pack_name(text),
  public.checked_pack_rule_title(uuid, text, int, uuid),
  public.create_custom_pack(text),
  public.rename_custom_pack(uuid, text),
  public.delete_custom_pack(uuid),
  public.add_custom_pack_rules(uuid, jsonb),
  public.update_custom_pack_rule(uuid, text, int),
  public.delete_custom_pack_rule(uuid),
  public.add_custom_pack_to_trip(uuid, uuid),
  public.remove_custom_pack_from_trip(uuid, uuid)
from public, anon;
revoke execute on function
  public.my_account_id(),
  public.my_custom_pack(uuid),
  public.checked_pack_name(text),
  public.checked_pack_rule_title(uuid, text, int, uuid)
from authenticated;
grant execute on function
  public.create_custom_pack(text),
  public.rename_custom_pack(uuid, text),
  public.delete_custom_pack(uuid),
  public.add_custom_pack_rules(uuid, jsonb),
  public.update_custom_pack_rule(uuid, text, int),
  public.delete_custom_pack_rule(uuid),
  public.add_custom_pack_to_trip(uuid, uuid),
  public.remove_custom_pack_from_trip(uuid, uuid)
to authenticated;
