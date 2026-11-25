-- Accounts are optional. Every phone starts with an anonymous sign-in; creating an account turns that same
-- sign-in into a permanent one (Supabase keeps the user id), so everything the phone already owns comes along.

-- Every player a sign-in has ever been, so past trips (and later, achievements) survive leaving a trip,
-- which deletes the devices row. Filled from devices by a trigger, so join_trip and create_trip stay as they are.
create table public.account_players (
  auth_user_id    uuid not null references auth.users (id) on delete cascade,
  player_id       uuid not null references public.players (id) on delete cascade,
  first_linked_at timestamptz not null default now(),
  primary key (auth_user_id, player_id)
);
create index account_players_player_idx on public.account_players (player_id);
alter table public.account_players enable row level security;

create function public.record_account_player() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.account_players (auth_user_id, player_id)
  values (new.auth_user_id, new.player_id)
  on conflict do nothing;
  return new;
end
$$;

create trigger devices_record_account_player
after insert or update of player_id on public.devices
for each row execute function public.record_account_player();

insert into public.account_players (auth_user_id, player_id, first_linked_at)
select auth_user_id, player_id, joined_at from public.devices
on conflict do nothing;

-- Deleting the account removes the sign-in and everything that belongs to it (this phone's link to its trip,
-- its trip history, its rule packs). Trips keep the player's entries and comments: they belong to the group.
create function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from auth.users where id = auth.uid();
end
$$;

revoke execute on function public.record_account_player() from public, anon, authenticated;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
