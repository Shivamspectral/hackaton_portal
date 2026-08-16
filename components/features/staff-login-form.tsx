'use client'

import { ArrowRight, Loader2, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/lib/types'
import { cn } from '@/lib/utils'

const REDIRECT: Record<Role, string> = {
  admin: '/dashboard/admin',
  judge: '/rankings',
  team: '/dashboard/team',
}

export function StaffLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    if (!supabase) {
      setError(
        'Sign-in is not configured yet — this project isn\u2019t connected to Supabase (see supabase/README.md).',
      )
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error || !data.user) {
      setError(error?.message ?? 'Sign in failed.')
      setLoading(false)
      return
    }

    // Role comes from the profiles row — never chosen here.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    const role = (profile?.role as Role | undefined) ?? 'team'
    router.push(REDIRECT[role])
    router.refresh()
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-border bg-card/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-accent" />
          <span className="tracking-widest uppercase">staff / access</span>
        </div>

        <form onSubmit={handleSubmit}>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
            Staff sign in
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Judges and admins sign in here. Your access level is set by your
            account role — there is nothing to choose.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-email">Email</Label>
              <Input
                id="staff-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@siddhantcoe.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-password">Password</Label>
              <Input
                id="staff-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className={cn('mt-1 h-11 w-full text-sm font-semibold')}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ShieldAlert className="size-3.5" />
        Here to compete?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Team sign in
        </Link>
      </p>
    </div>
  )
}
