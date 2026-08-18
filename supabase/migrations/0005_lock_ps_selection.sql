-- ============================================================================
-- HyperStack @ SCOE — Lock problem-statement selection
-- Run this FIFTH, after 0001–0004.
--
-- Multiple teams may select the same problem statement (no capacity cap),
-- but once a team's selected_ps_id is set, they can't change it themselves —
-- only an admin can (via SQL Editor, or a future admin-UI action).
-- ============================================================================

create or replace function public.lock_selected_ps()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.selected_ps_id is not null
     and new.selected_ps_id is distinct from old.selected_ps_id
     and not public.is_admin(auth.uid()) then
    raise exception 'Problem statement already selected — contact an admin to change it';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_lock_selected_ps on public.teams;
create trigger trg_lock_selected_ps
  before update on public.teams
  for each row execute function public.lock_selected_ps();
