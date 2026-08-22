-- ============================================================================
-- HyperStack @ SCOE — Flexible PS selection + team-owned custom problem
-- statements.
-- Run this SEVENTH, after 0001–0006.
--
-- Two independent features:
--
-- 1. Admin-controlled selection lock. Previously trg_lock_selected_ps
--    (0005) permanently froze a team's pick the moment it was first set.
--    That's now gated behind a single-row `event_settings` toggle: while
--    unlocked, teams can freely re-select; flipping the toggle (admin only)
--    starts enforcing the freeze again — same trigger, same error message,
--    just conditional now instead of always-on.
--
-- 2. Team-authored custom problem statements. `problem_statements` gets
--    `is_custom` + `created_by_team_id`. A team may INSERT a row for itself
--    (is_custom = true, created_by_team_id = their own team). Custom rows
--    are excluded from the public browse list at the query layer (lib/api.ts)
--    and, as a DB-level backstop, only visible via RLS to: the creating
--    team, judges, and admins — never to the public or other teams. No
--    approval step; a custom PS is usable (selectable) immediately.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. event_settings — singleton row holding event-wide toggles.
-- ---------------------------------------------------------------------------
create table if not exists public.event_settings (
  id                  boolean primary key default true check (id),  -- exactly one row, ever
  ps_selection_locked boolean not null default false,
  updated_at          timestamptz not null default now()
);

insert into public.event_settings (id, ps_selection_locked)
values (true, false)
on conflict (id) do nothing;

alter table public.event_settings enable row level security;

drop policy if exists event_settings_select_all on public.event_settings;
create policy event_settings_select_all
  on public.event_settings
  for select
  using (true);

drop policy if exists event_settings_update_admin on public.event_settings;
create policy event_settings_update_admin
  on public.event_settings
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- 2. lock_selected_ps() — now conditional on event_settings.ps_selection_locked
--    instead of always rejecting. Same trigger (trg_lock_selected_ps, 0005),
--    just a smarter function body.
-- ---------------------------------------------------------------------------
create or replace function public.lock_selected_ps()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_locked boolean;
begin
  if old.selected_ps_id is not null
     and new.selected_ps_id is distinct from old.selected_ps_id
     and not public.is_admin(auth.uid()) then

    select ps_selection_locked into is_locked
    from public.event_settings
    where id = true;

    if coalesce(is_locked, false) then
      raise exception 'Problem statement selection is locked — contact an admin to change it';
    end if;
  end if;
  return new;
end;
$$;

-- trigger already exists from 0005 and points at this function by name;
-- replacing the function body is enough, but re-create defensively in case
-- 0005 is ever re-run out of order.
drop trigger if exists trg_lock_selected_ps on public.teams;
create trigger trg_lock_selected_ps
  before update on public.teams
  for each row execute function public.lock_selected_ps();

-- ---------------------------------------------------------------------------
-- 3. problem_statements — custom-PS columns.
-- ---------------------------------------------------------------------------
alter table public.problem_statements
  add column if not exists is_custom          boolean not null default false,
  add column if not exists created_by_team_id uuid references public.teams(id) on delete cascade;

-- A custom row must always be attributed to the team that created it, and a
-- non-custom (admin-authored) row must never carry a creating team.
alter table public.problem_statements
  drop constraint if exists ps_custom_requires_team;
alter table public.problem_statements
  add constraint ps_custom_requires_team
  check (
    (is_custom and created_by_team_id is not null)
    or (not is_custom and created_by_team_id is null)
  );

-- ---------------------------------------------------------------------------
-- 4. RLS — replace the old "public SELECT" policy so custom rows are only
--    visible to their creating team, judges, and admins. Non-custom rows
--    remain visible to everyone, same as before.
-- ---------------------------------------------------------------------------
drop policy if exists ps_select_public on public.problem_statements;
create policy ps_select_public
  on public.problem_statements
  for select
  using (
    not is_custom
    or public.is_admin(auth.uid())
    or public.is_judge(auth.uid())
    or created_by_team_id = (
      select p.team_id from public.profiles p where p.id = auth.uid()
    )
  );

-- A team may INSERT a custom PS for itself. ps_insert_admin (0002) still
-- covers admin-authored rows; this is an additive, narrower policy.
drop policy if exists ps_insert_team_custom on public.problem_statements;
create policy ps_insert_team_custom
  on public.problem_statements
  for insert
  to authenticated
  with check (
    is_custom = true
    and created_by_team_id = (
      select p.team_id from public.profiles p where p.id = auth.uid()
    )
  );

-- A team may UPDATE/DELETE only its own custom PS (e.g. edit wording before
-- selecting it). Admins keep full access via ps_update_admin/ps_delete_admin.
drop policy if exists ps_update_own_custom on public.problem_statements;
create policy ps_update_own_custom
  on public.problem_statements
  for update
  to authenticated
  using (
    is_custom
    and created_by_team_id = (select p.team_id from public.profiles p where p.id = auth.uid())
  )
  with check (
    is_custom
    and created_by_team_id = (select p.team_id from public.profiles p where p.id = auth.uid())
  );

drop policy if exists ps_delete_own_custom on public.problem_statements;
create policy ps_delete_own_custom
  on public.problem_statements
  for delete
  to authenticated
  using (
    is_custom
    and created_by_team_id = (select p.team_id from public.profiles p where p.id = auth.uid())
  );
