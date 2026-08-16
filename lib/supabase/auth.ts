import 'server-only'

import type { Role } from '@/lib/types'
import { createClient } from './server'

export interface CurrentUser {
  id: string
  email: string | null
  role: Role
  teamId: string | null
}

/**
 * Resolve the signed-in user together with their profile (role + team_id),
 * for use in RSC pages, layouts and server actions. Returns null when there
 * is no authenticated session — OR when Supabase isn't connected, which is
 * treated the same as "signed out".
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, team_id, email')
    .eq('id', user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    role: (profile?.role as Role | undefined) ?? 'team',
    teamId: (profile?.team_id as string | null | undefined) ?? null,
  }
}
