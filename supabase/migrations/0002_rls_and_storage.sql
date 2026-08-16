-- ============================================================================
-- HyperStack @ SCOE — Row Level Security + Storage
-- Run this SECOND, after 0001_schema.sql, in the Supabase SQL Editor.
--
-- 0001 created the tables, triggers, is_admin()/is_judge() helpers and the
-- public team_rankings view but ZERO policies. This file locks everything down
-- with RLS and creates the private `submissions` storage bucket + policies.
--
-- Mental model of the roles (all derived from public.profiles.role):
--   team   — a participant; belongs to at most one team via profiles.team_id
--   judge  — scores teams; may read all submissions/teams
--   admin  — runs the event; may read/write everything
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on every domain table. With RLS on and no policy, access is
-- denied by default — so each table below gets explicit policies.
-- ---------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.teams              enable row level security;
alter table public.problem_statements enable row level security;
alter table public.submissions        enable row level security;
alter table public.evaluations        enable row level security;

-- ===========================================================================
-- problem_statements
--   public SELECT; only admins may INSERT / UPDATE / DELETE.
-- ===========================================================================
drop policy if exists ps_select_public on public.problem_statements;
create policy ps_select_public
  on public.problem_statements
  for select
  using (true);

drop policy if exists ps_insert_admin on public.problem_statements;
create policy ps_insert_admin
  on public.problem_statements
  for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

drop policy if exists ps_update_admin on public.problem_statements;
create policy ps_update_admin
  on public.problem_statements
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists ps_delete_admin on public.problem_statements;
create policy ps_delete_admin
  on public.problem_statements
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- ===========================================================================
-- teams
--   public SELECT; a team may UPDATE only its own row (its leader, or any of
--   its members via profiles.team_id); admins may UPDATE any row.
--   INSERT/DELETE of teams is left to admins only (event setup).
-- ===========================================================================
drop policy if exists teams_select_public on public.teams;
create policy teams_select_public
  on public.teams
  for select
  using (true);

drop policy if exists teams_update_own_or_admin on public.teams;
create policy teams_update_own_or_admin
  on public.teams
  for update
  to authenticated
  using (
    leader_id = auth.uid()
    or id = (select p.team_id from public.profiles p where p.id = auth.uid())
    or public.is_admin(auth.uid())
  )
  with check (
    leader_id = auth.uid()
    or id = (select p.team_id from public.profiles p where p.id = auth.uid())
    or public.is_admin(auth.uid())
  );

drop policy if exists teams_insert_admin on public.teams;
create policy teams_insert_admin
  on public.teams
  for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

drop policy if exists teams_delete_admin on public.teams;
create policy teams_delete_admin
  on public.teams
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- ===========================================================================
-- submissions
--   a team may INSERT / UPDATE only its own row (submissions.team_id must equal
--   the caller's profiles.team_id); admins and judges may SELECT all; a team
--   may also SELECT its own submission.
-- ===========================================================================
drop policy if exists submissions_select_team_staff on public.submissions;
create policy submissions_select_team_staff
  on public.submissions
  for select
  to authenticated
  using (
    team_id = (select p.team_id from public.profiles p where p.id = auth.uid())
    or public.is_admin(auth.uid())
    or public.is_judge(auth.uid())
  );

drop policy if exists submissions_insert_own_team on public.submissions;
create policy submissions_insert_own_team
  on public.submissions
  for insert
  to authenticated
  with check (
    team_id = (select p.team_id from public.profiles p where p.id = auth.uid())
  );

drop policy if exists submissions_update_own_team on public.submissions;
create policy submissions_update_own_team
  on public.submissions
  for update
  to authenticated
  using (
    team_id = (select p.team_id from public.profiles p where p.id = auth.uid())
  )
  with check (
    team_id = (select p.team_id from public.profiles p where p.id = auth.uid())
  );

-- ===========================================================================
-- evaluations
--   a judge may INSERT only their OWN evaluation (judge_id = auth.uid());
--   one row per (team, judge) is already enforced by the unique constraint in
--   0001. A judge may read/update their own rows; admins may SELECT all.
--   Note: anon/public never touch this table directly — they read aggregated
--   scores through the public.team_rankings view (granted in 0001).
-- ===========================================================================
drop policy if exists evaluations_select_own_or_admin on public.evaluations;
create policy evaluations_select_own_or_admin
  on public.evaluations
  for select
  to authenticated
  using (judge_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists evaluations_insert_own_judge on public.evaluations;
create policy evaluations_insert_own_judge
  on public.evaluations
  for insert
  to authenticated
  with check (judge_id = auth.uid() and public.is_judge(auth.uid()));

drop policy if exists evaluations_update_own_judge on public.evaluations;
create policy evaluations_update_own_judge
  on public.evaluations
  for update
  to authenticated
  using (judge_id = auth.uid() and public.is_judge(auth.uid()))
  with check (judge_id = auth.uid() and public.is_judge(auth.uid()));

-- ===========================================================================
-- profiles
--   a user may SELECT their own row; admins may SELECT all.
--   a user may UPDATE their own row (e.g. set team_id) — but the
--   protect_profile_role() trigger from 0001 is the final guard that blocks
--   non-admins from changing `role`. Admins may UPDATE any row.
-- ===========================================================================
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
  -- role changes on your own row are still rejected by trg_protect_profile_role.

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin
  on public.profiles
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ===========================================================================
-- Storage: private `submissions` bucket.
--   Objects are namespaced by team: the first path segment must be the
--   caller's team_id, e.g.  "<team_id>/final-deck.pptx".
--   A team may write only under its own prefix; admins/judges may read all.
-- ===========================================================================
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

-- Team members: insert/update/delete objects only under their own team_id
-- prefix. (storage.foldername(name))[1] is the first folder segment.
drop policy if exists submissions_obj_insert_own_team on storage.objects;
create policy submissions_obj_insert_own_team
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] =
        (select p.team_id::text from public.profiles p where p.id = auth.uid())
  );

drop policy if exists submissions_obj_update_own_team on storage.objects;
create policy submissions_obj_update_own_team
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] =
        (select p.team_id::text from public.profiles p where p.id = auth.uid())
  )
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] =
        (select p.team_id::text from public.profiles p where p.id = auth.uid())
  );

drop policy if exists submissions_obj_delete_own_team on storage.objects;
create policy submissions_obj_delete_own_team
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] =
        (select p.team_id::text from public.profiles p where p.id = auth.uid())
  );

-- Read: a team may read its own objects; admins and judges may read all.
drop policy if exists submissions_obj_select_team_staff on storage.objects;
create policy submissions_obj_select_team_staff
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'submissions'
    and (
      (storage.foldername(name))[1] =
        (select p.team_id::text from public.profiles p where p.id = auth.uid())
      or public.is_admin(auth.uid())
      or public.is_judge(auth.uid())
    )
  );
