create or replace function public.trip_preview(p_code text) returns jsonb
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
        'has_joined', exists (select 1 from public.player_pins pp where pp.player_id = p.id)
      ) order by p.position)
      from public.players p where p.trip_id = v_trip.id
    )
  );
end
$$;
