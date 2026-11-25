-- Takes a whole pack back out of a trip: every rule that came from it, including ones edited since.
-- Rules the trip made up itself, even with the same name as a pack rule, have no pack_id and stay.
-- Archived, like delete_rule, so entries already logged keep their rule and points, and the pack can be added again.
create function public.remove_rule_pack(p_trip_id uuid, p_pack_id text) returns int
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
  where trip_id = p_trip_id and pack_id = p_pack_id and not archived;
  get diagnostics v_removed = row_count;
  return v_removed;
end
$$;

revoke execute on function public.remove_rule_pack(uuid, text) from public, anon;
grant execute on function public.remove_rule_pack(uuid, text) to authenticated;
