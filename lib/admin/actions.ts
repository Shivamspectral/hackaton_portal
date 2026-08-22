'use server'

// Server Actions for the admin console. Each one re-checks requireRole('admin')
// itself — the admin layout already redirects unauthorized visitors before
// they ever see a form, but actions can in principle be invoked directly, so
// this is the real authorization boundary together with RLS
// (0002_rls_and_storage.sql). No service-role key is used anywhere here.

import { revalidatePath } from 'next/cache'

import { requireRole } from '@/lib/supabase/require-role'
import { createRequiredClient } from '@/lib/supabase/server'
import type { Category, Difficulty, PSStatus, Role } from '@/lib/types'

export interface ActionResult {
  ok: boolean
  error?: string
}

function str(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function splitList(raw: FormDataEntryValue | null): string[] {
  const value = typeof raw === 'string' ? raw : ''
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function psPayload(formData: FormData) {
  return {
    ps_id: str(formData, 'psId'),
    title: str(formData, 'title'),
    organization: str(formData, 'organization'),
    category: str(formData, 'category') as Category,
    short_description: str(formData, 'shortDescription'),
    description: str(formData, 'description'),
    expected_solution: str(formData, 'expectedSolution'),
    requirements: splitList(formData.get('requirements')),
    constraints: splitList(formData.get('constraints')),
    tags: splitList(formData.get('tags')),
    difficulty: str(formData, 'difficulty') as Difficulty,
    status: str(formData, 'status') as PSStatus,
  }
}

// ---------------------------------------------------------------------------
// Problem statements
// ---------------------------------------------------------------------------

export async function createProblemStatement(formData: FormData): Promise<ActionResult> {
  await requireRole('admin')
  const supabase = await createRequiredClient()

  const { error } = await supabase.from('problem_statements').insert(psPayload(formData))
  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard/admin/problem-statements')
  revalidatePath('/problem-statements')
  return { ok: true }
}

export async function updateProblemStatement(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole('admin')
  const supabase = await createRequiredClient()

  const { error } = await supabase
    .from('problem_statements')
    .update(psPayload(formData))
    .eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard/admin/problem-statements')
  revalidatePath('/problem-statements')
  revalidatePath(`/problem-statements/${id}`)
  return { ok: true }
}

export async function deleteProblemStatement(id: string): Promise<ActionResult> {
  await requireRole('admin')
  const supabase = await createRequiredClient()

  const { error } = await supabase.from('problem_statements').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard/admin/problem-statements')
  revalidatePath('/problem-statements')
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Event settings
// ---------------------------------------------------------------------------

// Flips the global switch trg_lock_selected_ps (0007 migration) checks
// before rejecting a team's re-selection. When true, teams are frozen on
// whatever they've currently picked (same as the old always-on behavior);
// when false, teams may switch freely.
export async function setPsSelectionLocked(locked: boolean): Promise<ActionResult> {
  await requireRole('admin')
  const supabase = await createRequiredClient()

  const { error } = await supabase
    .from('event_settings')
    .update({ ps_selection_locked: locked, updated_at: new Date().toISOString() })
    .eq('id', true)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard/admin/problem-statements')
  revalidatePath('/problem-statements')
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export async function updateTeamStatus(teamId: string, status: string): Promise<ActionResult> {
  await requireRole('admin')
  const supabase = await createRequiredClient()

  const { error } = await supabase.from('teams').update({ status }).eq('id', teamId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard/admin/teams')
  revalidatePath('/rankings')
  return { ok: true }
}

export async function assignTeamProblemStatement(
  teamId: string,
  problemStatementId: string | null,
): Promise<ActionResult> {
  await requireRole('admin')
  const supabase = await createRequiredClient()

  const { error } = await supabase
    .from('teams')
    .update({ selected_ps_id: problemStatementId })
    .eq('id', teamId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard/admin/teams')
  revalidatePath('/dashboard/team')
  return { ok: true }
}

export async function deleteTeam(teamId: string): Promise<ActionResult> {
  await requireRole('admin')
  const supabase = await createRequiredClient()

  const { error } = await supabase.from('teams').delete().eq('id', teamId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard/admin/teams')
  revalidatePath('/rankings')
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function updateUserRole(userId: string, role: Role): Promise<ActionResult> {
  await requireRole('admin')
  const supabase = await createRequiredClient()

  // The protect_profile_role() trigger (0001_schema.sql) is the final,
  // database-level guard against non-admins changing a role — this action is
  // the intended admin-only path to do so.
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard/admin/users')
  return { ok: true }
}

export async function assignUserTeam(
  userId: string,
  teamId: string | null,
): Promise<ActionResult> {
  await requireRole('admin')
  const supabase = await createRequiredClient()

  const { error } = await supabase.from('profiles').update({ team_id: teamId }).eq('id', userId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard/admin/users')
  revalidatePath('/dashboard/admin/teams')
  return { ok: true }
}
