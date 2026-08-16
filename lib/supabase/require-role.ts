import 'server-only'

import { redirect } from 'next/navigation'

import type { CurrentUser } from './auth'
import { getCurrentUser } from './auth'
import type { Role } from '@/lib/types'

function dashboardFor(role: Role) {
  if (role === 'admin') return '/dashboard/admin'
  if (role === 'judge') return '/dashboard/judge'
  return '/dashboard/team'
}

/**
 * Server-side authorization boundary for admin/judge routes and Server
 * Actions. Redirects to /staff-login when signed out, or to the caller's own
 * dashboard when signed in with the wrong role.
 *
 * This exists because the client-side <RequireAuth> guard only knows "is
 * anyone signed in" (it renders before the role is resolved, to avoid a
 * flash). Role-gating has to happen here, in a Server Component/Action,
 * before any admin/judge data is fetched. RLS is the final, database-level
 * backstop behind both.
 */
export async function requireRole(role: Role): Promise<CurrentUser> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/staff-login')
  }

  if (user.role !== role) {
    redirect(dashboardFor(user.role))
  }

  return user
}
