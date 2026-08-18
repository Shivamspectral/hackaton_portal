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

export async function selectProblemStatement(psId: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Not signed in.' }
  if (!user.teamId) return { ok: false, error: 'You need to be on a team first.' }

  const supabase = await createRequiredClient()

  const { error } = await supabase
    .from('teams')
    .update({ selected_ps_id: psId })
    .eq('id', user.teamId)
    .is('selected_ps_id', null) // extra guard against a race; the DB trigger is the real lock

  if (error) {
    if (error.message.includes('already selected')) {
      return { ok: false, error: 'Your team already has a problem statement selected.' }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath('/dashboard/team')
  revalidatePath('/problem-statements')
  return { ok: true }
}
