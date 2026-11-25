-- A player can rename themselves in their trip. Phones hear about it through the players table, which has been in
-- the realtime publication since 0008, so every list showing the name refetches.

-- The checks every player name must pass. Returns the name as it will be stored: spaces tidied, 1 to 30 characters
-- (the column's limit), and no one else in the trip with it, ignoring case (players_trip_name_uniq).
-- p_player_id is the player being renamed, who may keep their own name in a different case.
create function public.checked_player_name(p_trip_id uuid, p_name text, p_player_id uuid default null)
returns text
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  v_name text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
begin
  if char_length(v_name) < 1 or char_length(v_name) > 30 then
    raise exception 'Names must be 1 to 30 characters';
  end if;
  if exists (select 1 from public.players
             where trip_id = p_trip_id and lower(name) = lower(v_name) and id is distinct from p_player_id) then
    raise exception 'Someone in this trip is already called "%"', v_name;
  end if;
  return v_name;
end
$$;

-- Only ever the caller's own player in that trip. Returns the name as stored.
create function public.rename_me(p_trip_id uuid, p_name text) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_me   uuid := public.my_player_id(p_trip_id);
  v_name text;
begin
  if v_me is null then raise exception 'You''re not in this trip'; end if;
  v_name := public.checked_player_name(p_trip_id, p_name, v_me);
  update public.players set name = v_name where id = v_me;
  return v_name;
-- Two players taking the same name at the same moment both pass the check; the unique index stops the second.
exception when unique_violation then
  raise exception 'Someone in this trip is already called "%"', v_name;
end
$$;

revoke execute on function
  public.checked_player_name(uuid, text, uuid),
  public.rename_me(uuid, text)
from public, anon;
revoke execute on function public.checked_player_name(uuid, text, uuid) from authenticated;
grant execute on function public.rename_me(uuid, text) to authenticated;
