-- Worked out in the database so it stays correct however far back a pending entry sits in the feed.
create view public.entries_awaiting_my_vote with (security_invoker = true) as
select e.id, e.trip_id, e.created_at
from public.entries e
where e.status = 'pending'
  and public.my_player_id(e.trip_id) is not null
  and e.filed_by <> public.my_player_id(e.trip_id)
  and e.subject_id <> public.my_player_id(e.trip_id)
  and not exists (
    select 1 from public.votes v
    where v.entry_id = e.id and v.voter_id = public.my_player_id(e.trip_id)
  );

revoke all on public.entries_awaiting_my_vote from anon, authenticated;
grant select on public.entries_awaiting_my_vote to authenticated;
