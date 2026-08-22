'use server'

// Self-serve "delete my account" for any signed-in user (team/judge/admin).
// This is a HARD delete of the auth.users row (via the Auth Admin API, which
// needs the service-role key — see lib/supabase/admin.ts) so the same email
// can be used to register a brand-new account afterward. profiles.id has
// `on delete cascade` back to auth.users, so the profile row disappears too.
//
// If the user is currently leading a team, leadership is auto-transferred to
// their longest-standing teammate first (oldest profiles.created_at among the
// remaining members) so the team isn't left leaderless. If they're the only
// member, the team is simply left with leader_id = null (handled by the
// existing `on delete set null` FK) — nothing left to promote.

import { redirect } from 'next/navigation'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/supabase/auth'
import { createRequiredClient } from '@/lib/supabase/server'

export interface ActionResult {
  ok: boolean
  error?: string
}

export async function deleteOwnAccount(): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  const supabase = await createRequiredClient()

  // If this user leads a team, hand leadership off before they're deleted.
  const { data: ledTeam, error: ledTeamError } = await supabase
    .from('teams')
    .select('id')
    .eq('leader_id', user.id)
    .maybeSingle()

  if (ledTeamError) return { ok: false, error: ledTeamError.message }

  if (ledTeam) {
    const { data: nextLeader, error: memberError } = await supabase
      .from('profiles')
      .select('id')
      .eq('team_id', ledTeam.id)
      .neq('id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (memberError) return { ok: false, error: memberError.message }

    if (nextLeader) {
      const { error: promoteError } = await supabase
        .from('teams')
        .update({ leader_id: nextLeader.id })
        .eq('id', ledTeam.id)

      if (promoteError) return { ok: false, error: promoteError.message }
    }
    // else: no other members — leader_id will fall back to null automatically
    // once the auth user is deleted (FK on delete set null).
  }

  const admin = createAdminClient()
  if (!admin) {
    return {
      ok: false,
      error:
        'Account deletion is not configured. Set SUPABASE_SERVICE_ROLE_KEY ' +
        '(see supabase/README.md).',
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
  if (deleteError) return { ok: false, error: deleteError.message }

  // Clear the now-invalid session cookie on the way out.
  await supabase.auth.signOut()

  redirect('/')
}
