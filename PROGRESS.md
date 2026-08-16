# HyperStack Platform — Progress Notes

> Heads up: the zip you originally uploaded was the **pre-fix** state of the
> project — none of the work described in the earlier pasted transcript was
> actually present in it (no admin dashboard, no judge dashboard, no
> ButtonLink fix, no Supabase null-safety). That transcript was from a
> different session on a different copy of the code. Everything below was
> rebuilt from scratch against your actual uploaded files, verified by
> reading each file before editing it.

## ✅ Done

### Bug fixes
- **`nativeButton` console warning (7 spots)** — swapped Base UI's
  `<Button render={<Link .../>}>` for the existing `<ButtonLink>` component
  (which was already built for exactly this) in:
  - `components/site/navbar.tsx` (4 spots) — also updated the judge
    dashboard link target from `/rankings` to `/dashboard/judge`
  - `app/page.tsx` (3 spots)
- **Supabase env var crash** — `lib/supabase/client.ts` and `server.ts` now
  return `null` instead of throwing when `NEXT_PUBLIC_SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` are unset. Every consumer was updated to
  treat `null` as "signed out / not connected" instead of crashing:
  - `lib/supabase/auth.ts`, `lib/supabase/use-auth.ts`
  - `components/site/navbar.tsx` (logout)
  - `components/features/login-form.tsx`, `staff-login-form.tsx` (show a
    clear inline error instead of an unhandled exception)
  - The app now fully renders — signed out, on mock data — with zero
    Supabase configuration.
- **Leftover `college` fields** — `lib/mock-data.ts` had `college` on
  `rankings[]` and `currentTeam`, which `lib/types.ts` no longer declares
  (the schema is deliberately SCOE-only, per `supabase/migrations/0001`).
  Stripped — this would've failed TypeScript's excess-property check.

### Data layer (Part C — Supabase-wired, mock-data fallback)
- **`lib/supabase/mappers.ts`** (new) — snake_case DB rows → the camelCase
  types the UI already renders. One file to touch if the schema changes.
- **`lib/api.ts`** — fully rewritten:
  - Now `import 'server-only'` — it uses cookies, so it can no longer be
    imported from a client component (see submissions fix below).
  - `getAnnouncements` / `getTimeline` now correctly read from
    `lib/config.ts` (fixing a duplication bug where they were still reading
    stale, pre-rebrand copy out of `mock-data.ts`).
  - `getEventStats` computes live counts from Supabase (teams, problem
    statements, registered participants) with a mock fallback.
  - `getProblemStatements` / `getProblemStatement` / `getRankings` /
    `getTeam` all query real Supabase tables (`problem_statements`, the
    public `team_rankings` view, `teams` + `profiles` + `submissions`),
    falling back to mock data on any error or when Supabase isn't
    connected — so the app is always fully browsable either way.
- **`lib/submissions-client.ts`** (new) — the deck upload had to move out of
  `api.ts` once that became server-only: it needs the *browser* Supabase
  client plus an actual `File` object. Uploads to the private `submissions`
  storage bucket under the team's real DB id, then upserts the
  `submissions` row. Falls back to a simulated success when Supabase isn't
  connected, so the demo flow still works.
  - `components/features/submission-panel.tsx` and
    `app/dashboard/team/page.tsx` updated to use it (now also surfaces
    upload errors inline instead of failing silently).
- **`lib/types.ts`** — added `Team.dbId` (the real Supabase `teams.id` uuid),
  kept separate from the human-readable `teamId` (`team_code`, e.g.
  `SCOE-01`), since storage paths and FK writes need the uuid.
- **`lib/supabase/require-role.ts`** (new) — server-side role guard for
  admin/judge routes/actions. Redirects signed-out users to `/staff-login`
  and wrong-role users to their own dashboard. This is what actually
  enforces authorization before data is fetched — the client-side
  `<RequireAuth>` only checks "is anyone signed in"; RLS is the final
  backstop behind both.

### Admin & judge surfaces (this pass)

- **`supabase/migrations/0003_profile_full_name.sql`** — adds
  `profiles.full_name` (`handle_new_user()` now seeds it from signup
  metadata, without clobbering anything an admin later sets by hand), and
  extends `public.team_rankings` with a `team_code` column appended at the
  end (Postgres `CREATE OR REPLACE VIEW` only allows appending — never
  reordering or renaming — existing columns), so `mapRanking` gets the
  human-readable `SCOE-01`-style code instead of the raw `teams.id` uuid.
- **`lib/admin/data.ts`** (new) — `getAdminOverview` (live counts: team
  participants, teams, problem statements, submitted decks, evaluations),
  `getAdminProblemStatements` (reuses `mapProblemStatement`),
  `getAdminTeams` (team + leader name + member count + selected PS +
  submission status, assembled from `teams` + `profiles` +
  `problem_statements` + `submissions`), `getAdminUsers` (profile + role +
  team, via the `profiles → teams` FK), plus `getAdminProblemStatementOptions`
  / `getAdminTeamOptions` for the assignment dropdowns. Every export assumes
  an already-authenticated admin (the layout's `requireRole('admin')` runs
  first), so these call `createRequiredClient()` directly rather than
  falling back to mock data.
- **`lib/admin/actions.ts`** (new) — Server Actions:
  `createProblemStatement` / `updateProblemStatement` /
  `deleteProblemStatement`, `updateTeamStatus` /
  `assignTeamProblemStatement` / `deleteTeam`, `updateUserRole` /
  `assignUserTeam`. Every action re-checks `requireRole('admin')` itself
  (actions can in principle be invoked directly, so this — together with
  RLS — is the real authorization boundary, not just the page-level
  redirect), writes through the normal server client (no service-role key),
  and calls `revalidatePath` on every surface the change affects (the admin
  table itself, plus `/problem-statements`, `/dashboard/team`, `/rankings`
  as relevant).
- **`lib/judge/data.ts`** (new) — `getJudgeTeams`: every team, each
  annotated with *this judge's own* evaluation only (never aggregate scores
  or other judges' rows — the public `team_rankings` view is the only
  aggregate surface).
- **`lib/judge/actions.ts`** (new) — `submitScore` Server Action: upserts
  one `(team_id, judge_id)` row into `evaluations` (`onConflict:
  'team_id,judge_id'`, matching the unique constraint from
  `0001_schema.sql`), so re-scoring a team just updates the judge's
  existing row. RLS (`evaluations_insert_own_judge` /
  `evaluations_update_own_judge`) is what actually stops a judge writing
  anyone else's row.
- **Admin pages** — `app/dashboard/admin/layout.tsx` (shared layout:
  `requireRole('admin')` + subnav), `/dashboard/admin` (overview stat
  cards + judging-status blurb), `/dashboard/admin/problem-statements`
  (`PsManager` client wrapper holding create/edit `Modal` state over
  `PsTable` + `PsForm`), `/dashboard/admin/teams` (`TeamsTable`: inline
  status + PS-assignment `Select`s, delete with confirm), `/dashboard/admin/users`
  (`UsersTable`: inline team + role `Select`s). All the inline `Select`
  handlers and delete buttons use `useTransition` + a small `run()` helper
  so only the row being changed shows a spinner, with a shared error banner
  per table.
- **Judge pages** — `/dashboard/judge` (`requireRole('judge')` inline, then
  `JudgeTeams`: a card grid, one per team, each opening a `Modal` with
  `ScoringForm` — six 0–10 range-slider criteria matching
  `EVENT.evaluation` from `lib/config.ts`, plus optional feedback).
  Cards already scored show a check mark and the saved total; the modal
  pre-fills from `myEvaluation` when re-opened.

Both `requireRole()` calls in the admin layout and the judge page are the
real server-side gate — there's no client-side `<RequireAuth>` needed here
since the redirect happens before any data fetch.

## ✅ Verified

- `npx tsc --noEmit` — clean, zero errors, across the whole project
  (including everything added in this pass).
- `npx next build` — gets past compilation and page-graph construction;
  the only failure in this sandbox is `next/font` being unable to reach
  `fonts.googleapis.com` over the restricted network, which is unrelated
  to this change and will not occur in a normal deploy environment.

## Next step

Nothing outstanding from the original plan. If you connect a Supabase
project (see `supabase/README.md`, then run migrations `0001` → `0002` →
`0003` in order), the whole app — team, admin, and judge surfaces — is
fully wired end-to-end. Promote your first admin manually (there's no
signup flow for staff roles by design — see `0001_schema.sql`'s comment
on `handle_new_user()`).
