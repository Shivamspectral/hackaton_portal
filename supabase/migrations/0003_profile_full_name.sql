-- ============================================================================
-- HyperStack @ SCOE — profiles.full_name + team_rankings.team_code
-- Run this THIRD, after 0001_schema.sql and 0002_rls_and_storage.sql.
--
-- - Adds profiles.full_name so the team roster and the admin users list can
--   show real names instead of raw emails. handle_new_user() (from 0001) is
--   updated to seed it from auth signup metadata when present, without
--   overriding anything already set by an admin.
-- - Extends the public.team_rankings view (created in 0001) with team_code,
--   since the frontend's RankingEntry.teamId expects the human-readable
--   "SCOE-01"-style code, not the raw teams.id uuid. Appended as the LAST
--   column so this remains a valid CREATE OR REPLACE VIEW — Postgres only
--   allows a replace to append columns, never reorder or rename existing
--   ones.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles.full_name
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists full_name text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    'team',
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- public.team_rankings — append team_code
-- ---------------------------------------------------------------------------
create or replace view public.team_rankings as
select
  t.id                                                                       as team_id,
  t.name                                                                     as team_name,
  ps.ps_id                                                                   as problem_statement,
  coalesce(round(avg(e.total_score))::int, 0)                                as score,
  t.status                                                                   as status,
  rank() over (order by coalesce(avg(e.total_score), 0) desc, t.created_at asc) as rank,
  t.team_code                                                                as team_code
from public.teams t
left join public.problem_statements ps on ps.id = t.selected_ps_id
left join public.evaluations e on e.team_id = t.id
group by t.id, t.name, ps.ps_id, t.status, t.created_at, t.team_code;

grant select on public.team_rankings to anon, authenticated;
