import 'server-only'

import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Server Supabase client for RSC pages, Route Handlers and Server Actions.
// In Next.js 16 `cookies()` is async, so this factory is async too.
// Reads run as the signed-in user; RLS enforces what they can see/write.
//
// Returns `null` (instead of throwing) when the env vars are not configured,
// so pages can fall back to mock data rather than crashing the whole app.
// Every caller must handle the null case.
export async function createClient(): Promise<SupabaseClient | null> {
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
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        // In a plain RSC render `set` throws — that's expected and safe to
        // ignore when a middleware/route handler is responsible for refresh.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // no-op in read-only render contexts
        }
      },
    },
  })
}

// Convenience helper for server code that truly requires a connected
// Supabase project (e.g. admin/judge write paths). Throws a clear error
// instead of a confusing downstream null-reference.
export async function createRequiredClient(): Promise<SupabaseClient> {
  const supabase = await createClient()
  if (!supabase) {
    throw new Error(
      'This action requires a connected Supabase project. Set ' +
        'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
        '(see supabase/README.md).',
    )
  }
  return supabase
}
