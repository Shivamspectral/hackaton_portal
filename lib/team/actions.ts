'use server'

// Self-serve team creation/joining for signed-in `team`-role users who don't
// belong to a team yet. Paired with supabase/migrations/0004_team_self_serve.sql
// (RLS + the 4-member cap trigger) — those DB rules are the real boundary;
// this file just gives users a friendly path to hit them.

import { revalidatePath } from 'next/cache'

import { getCurrentUser } from '@/lib/supabase/auth'
import { createRequiredClient } from '@/lib/supabase/server'

export interface ActionResult {
  ok: boolean
  error?: string
}

function randomTeamCode(): string {
  const n = Math.floor(100 + Math.random() * 900) // 3-digit, e.g. "T-482"
  return `T-${n}`
}

export async function createTeam(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Not signed in.' }
  if (user.teamId) return { ok: false, error: 'You already belong to a team.' }

  const name = String(formData.get('name') ?? '').trim()
  if (!name) return { ok: false, error: 'Team name is required.' }

  const supabase = await createRequiredClient()

  // team_code has a unique constraint — retry a few times on collision.
  let teamId: string | null = null
  let lastError: string | null = null

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from('teams')
      .insert({ name, leader_id: user.id, team_code: randomTeamCode() })
      .select('id')
      .single()

    if (!error && data) {
      teamId = data.id as string
      break
    }
    lastError = error?.message ?? 'Unknown error'
    // 23505 = unique_violation (team_code collision) — retry with a new code.
    if (!lastError.includes('duplicate') && !lastError.includes('unique')) break
  }

  if (!teamId) return { ok: false, error: lastError ?? 'Could not create team.' }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ team_id: teamId })
    .eq('id', user.id)

  if (profileError) return { ok: false, error: profileError.message }

  revalidatePath('/dashboard/team')
  return { ok: true }
}

export async function joinTeam(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Not signed in.' }
  if (user.teamId) return { ok: false, error: 'You already belong to a team.' }

  const code = String(formData.get('teamCode') ?? '').trim().toUpperCase()
  if (!code) return { ok: false, error: 'Team code is required.' }

  const supabase = await createRequiredClient()

  const { data: team, error: findError } = await supabase
    .from('teams')
    .select('id')
    .eq('team_code', code)
    .maybeSingle()

  if (findError) return { ok: false, error: findError.message }
  if (!team) return { ok: false, error: 'No team found with that code.' }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ team_id: team.id })
    .eq('id', user.id)

  if (updateError) {
    // Trigger raises this exact message when the team is at 6 members.
    if (updateError.message.includes('already full')) {
      return { ok: false, error: 'That team already has 6 members.' }
    }
    return { ok: false, error: updateError.message }
  }

  revalidatePath('/dashboard/team')
  return { ok: true }
}

// Selects (or switches to) a problem statement for the caller's team.
// Whether switching is actually allowed is decided entirely by
// trg_lock_selected_ps / event_settings.ps_selection_locked (0007
// migration) — this action no longer guards on "already selected" itself,
// so a team can pick, then re-pick, freely until an admin flips the lock.
export async function selectProblemStatement(psId: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Not signed in.' }
  if (!user.teamId) return { ok: false, error: 'You need to be on a team first.' }

  const supabase = await createRequiredClient()

  const { error } = await supabase
    .from('teams')
    .update({ selected_ps_id: psId })
    .eq('id', user.teamId)

  if (error) {
    if (error.message.includes('locked')) {
      return {
        ok: false,
        error: 'Problem statement selection is locked — contact an admin to change it.',
      }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath('/dashboard/team')
  revalidatePath('/problem-statements')
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Custom problem statements (team-authored, private to the team + staff)
// ---------------------------------------------------------------------------

// Creates a custom problem statement owned by the caller's team. Usable
// immediately — no admin approval step. Visibility is enforced by RLS
// (ps_select_public, 0007 migration): only this team, judges, and admins
// can see it; it's also excluded from the public browse list at the query
// layer (getProblemStatements in lib/api.ts).
export interface CreatePsResult extends ActionResult {
  /** The new row's id + ps_id, so the caller can e.g. immediately select it. */
  problemStatement?: { id: string; psId: string }
}

export async function createCustomProblemStatement(
  formData: FormData,
): Promise<CreatePsResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Not signed in.' }
  if (!user.teamId) return { ok: false, error: 'You need to be on a team first.' }

  const title = String(formData.get('title') ?? '').trim()
  const shortDescription = String(formData.get('shortDescription') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()

  if (!title) return { ok: false, error: 'Title is required.' }

  const supabase = await createRequiredClient()

  // Sequential per-team numbering: "Custom PS 1", "Custom PS 2", ... — the
  // count is scoped to this team, so every team starts back at 1. ps_id
  // still has a table-wide unique constraint, so the team's own uuid is
  // folded in too (invisible to the user — they only ever see the label).
  const { count } = await supabase
    .from('problem_statements')
    .select('id', { count: 'exact', head: true })
    .eq('is_custom', true)
    .eq('created_by_team_id', user.teamId)
  const n = (count ?? 0) + 1
  const psId = `CUSTOM-${user.teamId}-${n}`
  const label = `Custom PS ${n}`

  const { data, error } = await supabase
    .from('problem_statements')
    .insert({
      ps_id: psId,
      title: title || label,
      short_description: shortDescription || label,
      description: description || shortDescription || label,
      is_custom: true,
      created_by_team_id: user.teamId,
      status: 'Open',
    })
    .select('id, ps_id')
    .single()

  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard/team')
  return { ok: true, problemStatement: { id: data.id, psId: data.ps_id } }
}

// Deletes one of the caller's own custom problem statements. Scoped by
// is_custom + created_by_team_id in the query itself as a backstop on top
// of RLS (ps_delete_own_custom, 0007 migration) — a team can never delete
// another team's custom PS or an admin-authored one. If the team currently
// has this PS selected, teams.selected_ps_id is set to null automatically
// (on delete set null, from 0001_schema.sql).
export async function deleteCustomProblemStatement(psId: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Not signed in.' }
  if (!user.teamId) return { ok: false, error: 'You need to be on a team first.' }

  const supabase = await createRequiredClient()

  const { error } = await supabase
    .from('problem_statements')
    .delete()
    .eq('id', psId)
    .eq('is_custom', true)
    .eq('created_by_team_id', user.teamId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard/team')
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Delete own team (leader only)
// ---------------------------------------------------------------------------

// Only the team's leader may delete it — re-checked here even though RLS
// (teams_delete_leader, 0006_leader_deletes_team.sql) enforces the same rule,
// same pattern as every other action in this codebase. Deleting the team row
// cascades per 0001_schema.sql: members' profiles.team_id -> null (they're
// bumped back to the create/join screen, not deleted), submissions and
// evaluations for the team are removed.
export async function deleteOwnTeam(): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Not signed in.' }
  if (!user.teamId) return { ok: false, error: 'You are not on a team.' }

  const supabase = await createRequiredClient()

  const { data: team, error: findError } = await supabase
    .from('teams')
    .select('id, leader_id')
    .eq('id', user.teamId)
    .maybeSingle()

  if (findError) return { ok: false, error: findError.message }
  if (!team) return { ok: false, error: 'Team not found.' }
  if (team.leader_id !== user.id) {
    return { ok: false, error: 'Only the team leader can delete the team.' }
  }

  const { error } = await supabase.from('teams').delete().eq('id', team.id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard/team')
  revalidatePath('/dashboard/admin/teams')
  revalidatePath('/rankings')
  return { ok: true }
}
