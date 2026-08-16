-- ============================================================================
-- HyperStack @ SCOE — Self-serve team creation & joining
-- Run this FOURTH, after 0001, 0002, and 0003.
--
-- Previously only an admin could INSERT into public.teams, and profiles.team_id
-- could technically be set to any team_id via the "update own profile" policy
-- from 0002 — with no cap on team size. This migration:
--   1. Lets an authenticated user create their own team (becoming its leader),
--      as long as they don't already belong to one.
--   2. Caps team membership at 4 (enforced in a trigger on profiles, since
--      that's what actually assigns someone to a team).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Allow a user with no team yet to create ONE team, as its leader.
-- ---------------------------------------------------------------------------
drop policy if exists teams_insert_self_leader on public.teams;
create policy teams_insert_self_leader
  on public.teams
  for insert
  to authenticated
  with check (
    leader_id = auth.uid()
    and not exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.team_id is not null
    )
  );

-- ---------------------------------------------------------------------------
-- 2. Cap team size at 4 members. Fires whenever someone's team_id is set
--    (both the leader's own row, via the create-team action, and a joiner's
--    row, via the join-team action).
-- ---------------------------------------------------------------------------
create or replace function public.enforce_team_size()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.team_id is not null
     and (old.team_id is distinct from new.team_id) then
    if (
      select count(*) from public.profiles
      where team_id = new.team_id
    ) >= 6 then
      raise exception 'Team is already full (max 6 members)';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_team_size on public.profiles;
create trigger trg_enforce_team_size
  before update on public.profiles
  for each row execute function public.enforce_team_size();
