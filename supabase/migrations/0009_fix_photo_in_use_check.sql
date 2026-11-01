-- In 0008 the bare "name" inside the players subquery meant the player's name, not the file's, so a photo in
-- use could be deleted. Qualifying it with the table compares against the file.
drop policy "players delete their old photos" on storage.objects;

create policy "players delete their old photos" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and public.storage_folder_id(objects.name, 2) = public.my_player_id(public.storage_trip_id(objects.name))
    and not exists (select 1 from public.players p where p.photo_path = objects.name)
  );
