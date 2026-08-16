'use client'

import { useEffect, useState } from 'react'

import type { Role } from '@/lib/types'
import { createClient } from './client'

export interface AuthState {
  // undefined = still resolving (avoids a login/dashboard flash on first paint)
  // null      = definitively signed out (or Supabase isn't connected)
  userId: string | null | undefined
  email: string | null
  role: Role | null
}

/**
 * Reactive Supabase auth for client components (navbar, guards).
 * Resolves the current user and their `role` from the profiles table, and
 * stays in sync via onAuthStateChange.
 *
 * If Supabase env vars aren't configured, resolves immediately to signed-out
 * instead of throwing, so the rest of the app still renders.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    userId: undefined,
    email: null,
    role: null,
  })

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setState({ userId: null, email: null, role: null })
      return
    }

    let active = true

    async function resolve(userId: string | null, email: string | null) {
      if (!userId) {
        if (active) setState({ userId: null, email: null, role: null })
        return
      }
      const { data } = await supabase!
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle()
      if (active) {
        setState({
          userId,
          email,
          role: (data?.role as Role | undefined) ?? 'team',
        })
      }
    }

    supabase.auth.getUser().then(({ data }) => {
      resolve(data.user?.id ?? null, data.user?.email ?? null)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      resolve(session?.user?.id ?? null, session?.user?.email ?? null)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return state
}
