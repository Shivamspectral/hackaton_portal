-- ============================================================================
-- HyperStack @ SCOE — Core schema
-- Run this FIRST in the Supabase SQL Editor.
--
-- Tables: problem_statements, teams, profiles, submissions, evaluations
-- Plus: new-user trigger, role helper functions, role-protection trigger,
--       and a public aggregated-score view for the rankings page.
--
-- Every team is from Siddhant College of Engineering, so there is deliberately
-- NO `college` column anywhere.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- problem_statements  (created first — teams reference it)
-- ---------------------------------------------------------------------------
create table if not exists public.problem_statements (
  id                uuid primary key default gen_random_uuid(),
  ps_id             text unique not null,               -- e.g. "PS-101"
  title             text not null,
  organization      text not null default '',
  category          text not null default 'Web Development',
  short_description text not null default '',
  description       text not null default '',
  expected_solution text not null default '',
  requirements      text[] not null default '{}',
  constraints       text[] not null default '{}',
  tags              text[] not null default '{}',
  difficulty        text not null default 'Intermediate'
                      check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  status            text not null default 'Open'
                      check (status in ('Open', 'Filling Fast', 'Closed')),
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- teams
-- ---------------------------------------------------------------------------
create table if not exists public.teams (
  id             uuid primary key default gen_random_uuid(),
  team_code      text unique not null,
  name           text not null,
  leader_id      uuid references auth.users(id) on delete set null,
  selected_ps_id uuid references public.problem_statements(id) on delete set null,
  status         text not null default 'Active'
                   check (status in ('Active', 'Qualified', 'Finalist', 'Eliminated')),
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       text not null default 'team' check (role in ('team', 'judge', 'admin')),
  team_id    uuid references public.teams(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- submissions  (one per team)
-- ---------------------------------------------------------------------------
create table if not exists public.submissions (
  id           uuid primary key default gen_random_uuid(),
  team_id      uuid not null unique references public.teams(id) on delete cascade,
  file_name    text,
  file_url     text,
  status       text not null default 'submitted' check (status in ('submitted', 'none')),
  submitted_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- evaluations  (one row per judge per team)
-- ---------------------------------------------------------------------------
create table if not exists public.evaluations (
  id           uuid primary key default gen_random_uuid(),
  team_id      uuid not null references public.teams(id) on delete cascade,
  judge_id     uuid not null references auth.users(id) on delete cascade,
  innovation   int not null default 0 check (innovation between 0 and 10),
  technical    int not null default 0 check (technical between 0 and 10),
  impact       int not null default 0 check (impact between 0 and 10),
  feasibility  int not null default 0 check (feasibility between 0 and 10),
  ui_ux        int not null default 0 check (ui_ux between 0 and 10),
  presentation int not null default 0 check (presentation between 0 and 10),
  total_score  int generated always as
                 (innovation + technical + impact + feasibility + ui_ux + presentation) stored,
  feedback     text,
  created_at   timestamptz not null default now(),
  unique (team_id, judge_id)   -- a judge can only score a team once
);

-- ---------------------------------------------------------------------------
-- Role helper functions (security definer → bypass RLS, avoid recursion)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

create or replace function public.is_judge(uid uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'judge'
  );
$$;

-- ---------------------------------------------------------------------------
-- Auto-create a `team` profile whenever a new auth user signs up.
-- New signups are ALWAYS `role = 'team'`; judges/admins are promoted later
-- from the Admin UI (or the very first admin, manually — see README).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'team')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Prevent anyone but an admin from changing a profile's `role`.
-- (Lets users update their own team_id without being able to self-promote.)
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and not public.is_admin(auth.uid()) then
    raise exception 'Only admins can change a user role';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---------------------------------------------------------------------------
-- Public, aggregated rankings view.
-- Runs with the view owner's privileges (not security_invoker), so it exposes
-- ONLY aggregated scores publicly without granting access to raw evaluations.
-- ---------------------------------------------------------------------------
create or replace view public.team_rankings as
select
  t.id                                              as team_id,
  t.name                                            as team_name,
  ps.ps_id                                          as problem_statement,
  coalesce(round(avg(e.total_score))::int, 0)       as score,
  t.status                                          as status,
  rank() over (order by coalesce(avg(e.total_score), 0) desc, t.created_at asc) as rank
from public.teams t
left join public.problem_statements ps on ps.id = t.selected_ps_id
left join public.evaluations e on e.team_id = t.id
group by t.id, t.name, ps.ps_id, t.status, t.created_at;

grant select on public.team_rankings to anon, authenticated;
