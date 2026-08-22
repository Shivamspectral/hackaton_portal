-- ============================================================================
-- HyperStack @ SCOE — Leader self-delete for teams
-- Run this AFTER 0001-0005, in the Supabase SQL Editor.
--
-- Previously only admins could delete a team row (teams_delete_admin,
-- 0002_rls_and_storage.sql). This adds a second policy letting a team's
-- own leader delete it too. deleteOwnTeam() in lib/team/actions.ts also
-- re-checks leader_id === auth.uid() in code before calling delete — this
-- policy is the DB-level backstop, same pattern as every other action here.
--
-- Cascade behavior on delete (already defined in 0001_schema.sql):
--   profiles.team_id   -> set null   (members become teamless, not deleted)
--   submissions.team_id -> cascade   (the team's deck submission is removed)
--   evaluations.team_id -> cascade   (judge scores for this team are removed)
-- ============================================================================

drop policy if exists teams_delete_leader on public.teams;
create policy teams_delete_leader
  on public.teams
  for delete
  to authenticated
  using (leader_id = auth.uid());
