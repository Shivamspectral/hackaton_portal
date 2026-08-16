'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null | undefined

// Browser Supabase client. Uses the public anon key + the user's cookie
// session (set by @supabase/ssr). Safe to import in client components.
//
// Returns `null` (instead of throwing) when the env vars are not configured,
// so the app can still render — signed out, on mock data — without a
// connected Supabase project. Every caller must handle the null case.
export function createClient(): SupabaseClient | null {
  if (cached !== undefined) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        'Supabase env vars are not set (NEXT_PUBLIC_SUPABASE_URL / ' +
          'NEXT_PUBLIC_SUPABASE_ANON_KEY). Running signed-out with mock data ' +
          '— see supabase/README.md to connect a project.',
      )
    }
    cached = null
    return null
  }

  cached = createBrowserClient(url, anonKey)
  return cached
}
