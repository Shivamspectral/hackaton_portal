'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { useAuth } from '@/lib/supabase/use-auth'

/**
 * Client-side guard backed by the real Supabase session. Redirects to /login
 * once we know there is no authenticated user. Role-level gating (e.g. admin)
 * is handled server-side in the relevant route/layout.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (userId === null) router.replace('/login')
  }, [userId, router])

  if (userId === undefined || userId === null) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="font-mono text-xs uppercase tracking-widest">
            Checking access…
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
