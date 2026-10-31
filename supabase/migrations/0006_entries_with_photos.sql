-- Photos are uploaded before their entry is saved, to <trip>/<entry id>/<file>, so the phone picks the entry id
-- and create_entry saves the entry and its photos together. Other phones never see an entry with photos missing.

create function public.insert_evidence_internal(p_entry public.entries, p_storage_path text, p_width int, p_height int)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_id uuid;
begin
  if p_storage_path is null or p_storage_path not like p_entry.trip_id || '/' || p_entry.id || '/%' then
    raise exception 'Photo path doesn''t match this entry';
  end if;
  if not exists (select 1 from storage.objects where bucket_id = 'evidence' and name = p_storage_path) then
    raise exception 'A photo didn''t finish uploading. Try again.';
  end if;
  if (select count(*) from public.evidence where entry_id = p_entry.id) >= 3 then
    raise exception 'An entry can have up to 3 photos';
  end if;

  insert into public.evidence (entry_id, trip_id, storage_path, width, height)
  values (p_entry.id, p_entry.trip_id, p_storage_path, p_width, p_height)
  returning id into v_id;
  return v_id;
end
$$;

create or replace function public.add_evidence(p_entry_id uuid, p_storage_path text, p_width int default null, p_height int default null)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_entry public.entries;
begin
  select * into v_entry from public.entries where id = p_entry_id;
  if not found or public.my_player_id(v_entry.trip_id) is null then raise exception 'Entry not found'; end if;
  if public.my_player_id(v_entry.trip_id) <> v_entry.filed_by then
    raise exception 'Only the person who logged an entry can add photos to it';
  end if;
  return public.insert_evidence_internal(v_entry, p_storage_path, p_width, p_height);
end
$$;

drop function public.create_entry(uuid, uuid, uuid, text, int, int, text);

-- p_photos: [{ "path": text, "width": int, "height": int }]
create function public.create_entry(
  p_trip_id          uuid,
  p_subject_id       uuid,
  p_rule_id          uuid  default null,
  p_new_rule_title   text  default null,
  p_new_rule_points  int   default null,
  p_points           int   default null,
  p_note             text  default null,
  p_entry_id         uuid  default null,
  p_photos           jsonb default '[]'
) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_me          uuid := public.my_player_id(p_trip_id);
  v_rule_id     uuid;
  v_rule_points int;
  v_points      int;
  v_note        text := nullif(btrim(coalesce(p_note, '')), '');
  v_entry       public.entries;
  v_photo       jsonb;
begin
  if v_me is null then raise exception 'You''re not in this trip'; end if;
  if not exists (select 1 from public.players where id = p_subject_id and trip_id = p_trip_id) then
    raise exception 'That player isn''t on this trip';
  end if;
  if p_rule_id is not null and p_new_rule_title is not null then
    raise exception 'Pick a rule or create one, not both';
  end if;
  if jsonb_typeof(coalesce(p_photos, '[]')) <> 'array' or jsonb_array_length(coalesce(p_photos, '[]')) > 3 then
    raise exception 'An entry can have up to 3 photos';
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

  insert into public.entries (id, trip_id, subject_id, filed_by, rule_id, points, note)
  values (coalesce(p_entry_id, gen_random_uuid()), p_trip_id, p_subject_id, v_me, v_rule_id, v_points, v_note)
  returning * into v_entry;

  for v_photo in select * from jsonb_array_elements(coalesce(p_photos, '[]')) loop
    perform public.insert_evidence_internal(
      v_entry, v_photo->>'path', (v_photo->>'width')::int, (v_photo->>'height')::int
    );
  end loop;

  return v_entry.id;
end
$$;

revoke execute on function public.insert_evidence_internal(public.entries, text, int, int) from public, anon, authenticated;
revoke execute on function public.create_entry(uuid, uuid, uuid, text, int, int, text, uuid, jsonb) from public, anon;
grant execute on function public.create_entry(uuid, uuid, uuid, text, int, int, text, uuid, jsonb) to authenticated;
