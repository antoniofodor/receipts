-- Object paths are <trip_id>/<entry_id>/<file>, so the first folder decides trip membership.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidence', 'evidence', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- First folder of the object path as a trip id, or null if it isn't a uuid.
create function public.storage_trip_id(p_name text) returns uuid
language plpgsql immutable set search_path = public, pg_temp as $$
begin
  return (storage.foldername(p_name))[1]::uuid;
exception when others then
  return null;
end
$$;
grant execute on function public.storage_trip_id(text) to authenticated;
revoke execute on function public.storage_trip_id(text) from public, anon;

create policy "trip members read evidence" on storage.objects
  for select to authenticated
  using (bucket_id = 'evidence' and public.is_trip_member(public.storage_trip_id(name)));

create policy "trip members upload evidence" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'evidence' and public.is_trip_member(public.storage_trip_id(name)));

-- Realtime applies the RLS policies above to these tables.
alter publication supabase_realtime add table
  public.entries, public.votes, public.comments, public.evidence, public.rules;
