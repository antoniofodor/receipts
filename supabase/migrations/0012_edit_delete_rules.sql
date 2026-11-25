-- A trip's rules, including the ones copied from a pack, are its own to reshape: the organiser can edit or delete
-- any rule, and whoever added a rule can edit or delete theirs. Entries keep the points they were logged with
-- (entries.points is a copy), so an edit only changes what the rule is worth from now on.

-- The checks every rule name and value must pass, shared by adding and editing so they can't drift apart.
-- Returns the title as it will be stored. p_rule_id is the rule being edited, which may keep its own name.
create function public.checked_rule_title(p_trip_id uuid, p_title text, p_points int, p_rule_id uuid default null)
returns text
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  v_title text := btrim(regexp_replace(coalesce(p_title, ''), '\s+', ' ', 'g'));
begin
  if char_length(v_title) < 2 or char_length(v_title) > 60 then
    raise exception 'Rule names must be 2 to 60 characters';
  end if;
  if p_points is null or p_points = 0 or abs(p_points) > 25 then
    raise exception 'Rule points must be between -25 and 25, and not 0';
  end if;
  if exists (select 1 from public.rules
             where trip_id = p_trip_id and not archived and lower(title) = lower(v_title)
               and id is distinct from p_rule_id) then
    raise exception 'There''s already a rule called "%"', v_title;
  end if;
  return v_title;
end
$$;

create or replace function public.insert_rule_internal(p_trip_id uuid, p_title text, p_points int, p_created_by uuid)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_title text := public.checked_rule_title(p_trip_id, p_title, p_points);
  v_id    uuid;
begin
  insert into public.rules (trip_id, title, points, created_by)
  values (p_trip_id, v_title, p_points, p_created_by)
  returning id into v_id;
  return v_id;
end
$$;

-- Locks the rule and checks the caller may change it. Raises the same "doesn't exist" for a rule in another
-- trip as for a deleted one, so outsiders learn nothing.
create function public.rule_i_can_manage(p_rule_id uuid) returns public.rules
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_rule public.rules;
  v_me   uuid;
begin
  select * into v_rule from public.rules where id = p_rule_id and not archived for update;
  if found then v_me := public.my_player_id(v_rule.trip_id); end if;
  if v_me is null then raise exception 'That rule doesn''t exist'; end if;
  if v_rule.created_by is distinct from v_me
     and not (select is_organiser from public.players where id = v_me) then
    raise exception 'Only the organiser or the person who added this rule can change it';
  end if;
  return v_rule;
end
$$;

create function public.update_rule(p_rule_id uuid, p_title text, p_points int) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_rule public.rules := public.rule_i_can_manage(p_rule_id);
begin
  update public.rules
     set title = public.checked_rule_title(v_rule.trip_id, p_title, p_points, v_rule.id),
         points = p_points
   where id = v_rule.id;
end
$$;

-- Archived, not deleted: entries already logged under the rule still point at it and keep showing its name.
-- Its name is free again for a new rule or a pack.
create function public.delete_rule(p_rule_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_rule public.rules := public.rule_i_can_manage(p_rule_id);
begin
  update public.rules set archived = true where id = v_rule.id;
end
$$;

revoke execute on function
  public.checked_rule_title(uuid, text, int, uuid),
  public.rule_i_can_manage(uuid),
  public.update_rule(uuid, text, int),
  public.delete_rule(uuid)
from public, anon;
revoke execute on function public.checked_rule_title(uuid, text, int, uuid), public.rule_i_can_manage(uuid)
from authenticated;
grant execute on function public.update_rule(uuid, text, int), public.delete_rule(uuid) to authenticated;
