import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Service-role Supabase client — bypasses RLS entirely.
// ONLY use this for operations that genuinely require admin-level Auth
// access (right now: deleting a user's own auth.users row so their email
// becomes reusable). Never import this into client components, never use it
// for ordinary reads/writes — those go through server.ts / client.ts and are
// bound by RLS.
//
// Requires SUPABASE_SERVICE_ROLE_KEY (server-only env var, no NEXT_PUBLIC_
// prefix — must never be exposed to the browser). Get it from
// Supabase Dashboard → Project Settings → API → service_role key.
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        'SUPABASE_SERVICE_ROLE_KEY is not set — account deletion is ' +
          'unavailable. Add it to .env.local (see supabase/README.md).',
      )
    }
    return null
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
