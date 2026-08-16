'use server'

// Server Action for judge scoring. Upserts one (team_id, judge_id) row into
// evaluations — the unique constraint from 0001_schema.sql means a second
// submission for the same team just updates the judge's existing score.
// RLS (evaluations_insert_own_judge / evaluations_update_own_judge) is what
// actually enforces that a judge can only ever write their own row.

import { revalidatePath } from 'next/cache'

import { getCurrentUser } from '@/lib/supabase/auth'
import { requireRole } from '@/lib/supabase/require-role'
import { createRequiredClient } from '@/lib/supabase/server'

export interface ActionResult {
  ok: boolean
  error?: string
}

function score(formData: FormData, key: string): number {
  const raw = formData.get(key)
  const value = typeof raw === 'string' ? Number(raw) : NaN
  if (Number.isNaN(value)) return 0
  return Math.min(10, Math.max(0, Math.round(value)))
}

export async function submitScore(teamId: string, formData: FormData): Promise<ActionResult> {
  await requireRole('judge')
  const supabase = await createRequiredClient()

  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  const feedbackRaw = formData.get('feedback')
  const feedback =
    typeof feedbackRaw === 'string' && feedbackRaw.trim() ? feedbackRaw.trim() : null

  const { error } = await supabase.from('evaluations').upsert(
    {
      team_id: teamId,
      judge_id: user.id,
      innovation: score(formData, 'innovation'),
      technical: score(formData, 'technical'),
      impact: score(formData, 'impact'),
      feasibility: score(formData, 'feasibility'),
      ui_ux: score(formData, 'uiUx'),
      presentation: score(formData, 'presentation'),
      feedback,
    },
    { onConflict: 'team_id,judge_id' },
  )

  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard/judge')
  revalidatePath('/rankings')
  return { ok: true }
}
