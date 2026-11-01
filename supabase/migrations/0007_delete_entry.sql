-- Which entries were deleted, by whom. Realtime can't route a DELETE to one trip (the old row carries only
-- its id), so phones hear about a deletion through the insert here instead.
create table public.deleted_entries (
  entry_id   uuid primary key,
  trip_id    uuid not null references public.trips (id) on delete cascade,
  deleted_by uuid references public.players (id) on delete set null,
  deleted_at timestamptz not null default now()
);
create index deleted_entries_trip_idx on public.deleted_entries (trip_id);

alter table public.deleted_entries enable row level security;
create policy "members read deleted entries" on public.deleted_entries
  for select to authenticated using (public.is_trip_member(trip_id));

alter publication supabase_realtime add table public.deleted_entries;

-- A folder of a storage path as a uuid, or null if it isn't one. Folders count from 1.
create function public.storage_folder_id(p_name text, p_index int) returns uuid
language plpgsql immutable set search_path = public, pg_temp as $$
begin
  return (storage.foldername(p_name))[p_index]::uuid;
exception when others then
  return null;
end
$$;
revoke execute on function public.storage_folder_id(text, int) from public, anon;
grant execute on function public.storage_folder_id(text, int) to authenticated;

-- The person who logged an entry can take it back while it's still being voted on; once the votes are in,
-- the group's decision stands. Votes, photo records and comments go with it. Photo files can only be
-- removed through the Storage API, so their paths are returned for the phone to remove.
create function public.delete_entry(p_entry_id uuid) returns text[]
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_entry public.entries;
  v_me    uuid;
  v_paths text[];
begin
  select * into v_entry from public.entries where id = p_entry_id for update;
  if not found then raise exception 'Entry not found'; end if;
  v_me := public.my_player_id(v_entry.trip_id);
  if v_me is null then raise exception 'Entry not found'; end if;
  if v_me <> v_entry.filed_by then raise exception 'Only the person who logged this entry can delete it'; end if;
  if v_entry.status <> 'pending' then
    raise exception 'The votes are in on this entry, so it can''t be deleted anymore';
  end if;

  select coalesce(array_agg(storage_path order by storage_path), '{}') into v_paths
    from public.evidence where entry_id = p_entry_id;
  delete from public.entries where id = p_entry_id;
  insert into public.deleted_entries (entry_id, trip_id, deleted_by) values (p_entry_id, v_entry.trip_id, v_me);
  return v_paths;
end
$$;
revoke execute on function public.delete_entry(uuid) from public, anon;
grant execute on function public.delete_entry(uuid) to authenticated;

-- Only the phone that uploaded a photo can delete the file, and only once no entry uses it: after the
-- entry is deleted, or when saving the entry failed after the upload.
create policy "uploader deletes photos no entry uses" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'evidence'
    and owner_id = (select auth.uid())::text
    and not exists (select 1 from public.entries e where e.id = public.storage_folder_id(name, 2))
  );
