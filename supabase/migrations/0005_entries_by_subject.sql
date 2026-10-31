-- The player screen lists one player's entries, newest first.
drop index public.entries_subject_idx;
create index entries_subject_created_idx on public.entries (subject_id, created_at desc);
