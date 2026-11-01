-- Profile photos live in a public bucket, so every avatar's link can be built on the phone without signing.
-- Paths are <trip_id>/<player_id>/<random uuid>.jpg: unguessable, and only shared with the trip.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg'])
on conflict (id) do nothing;

alter table public.players add column photo_path text;

-- Links to the public bucket work for anyone holding them; listing and deleting through the Storage API
-- also need this read rule.
create policy "trip members read photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and public.is_trip_member(public.storage_trip_id(name)));

-- Each player uploads only into their own folder.
create policy "players upload their own photo" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and public.storage_folder_id(name, 2) = public.my_player_id(public.storage_trip_id(name))
  );

-- And deletes only their own old photos, never the one in use.
create policy "players delete their old photos" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and public.storage_folder_id(name, 2) = public.my_player_id(public.storage_trip_id(name))
    and not exists (select 1 from public.players p where p.photo_path = name)
  );

-- Sets or clears the caller's photo and returns the one it replaced, for the phone to delete.
create function public.set_my_photo(p_trip_id uuid, p_photo_path text) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_me       uuid := public.my_player_id(p_trip_id);
  v_previous text;
begin
  if v_me is null then raise exception 'You''re not in this trip'; end if;
  if p_photo_path is not null then
    if p_photo_path not like p_trip_id::text || '/' || v_me::text || '/%' then
      raise exception 'That photo doesn''t belong to you';
    end if;
    if not exists (select 1 from storage.objects where bucket_id = 'avatars' and name = p_photo_path) then
      raise exception 'The photo didn''t finish uploading. Try again.';
    end if;
  end if;

  select photo_path into v_previous from public.players where id = v_me for update;
  update public.players set photo_path = p_photo_path where id = v_me;
  return nullif(v_previous, p_photo_path);
end
$$;
revoke execute on function public.set_my_photo(uuid, text) from public, anon;
grant execute on function public.set_my_photo(uuid, text) to authenticated;

-- The leaderboard and the join screen show each player's photo too.
create or replace view public.leaderboard with (security_invoker = true) as
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
  )::int as rank,
  p.photo_path
from public.players p
left join public.entries e on e.subject_id = p.id
group by p.id;

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
        'id', p.id, 'name', p.name, 'color', p.color, 'is_groom', p.is_groom, 'photo_path', p.photo_path,
        'has_joined', exists (select 1 from public.player_pins pp where pp.player_id = p.id)
      ) order by p.position)
      from public.players p where p.trip_id = v_trip.id
    )
  );
end
$$;

-- Phones refresh avatars when someone changes their photo.
alter publication supabase_realtime add table public.players;
