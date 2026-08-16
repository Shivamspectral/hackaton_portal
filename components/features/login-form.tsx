'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Loader2, Shield } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Mode = 'signin' | 'signup'

export function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setLoading(true)

    const supabase = createClient()
    if (!supabase) {
      setError(
        'Sign-in is not configured yet — this project isn\u2019t connected to Supabase (see supabase/README.md).',
      )
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim() } },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      // If email confirmation is on, there's no session yet.
      if (!data.session) {
        setNotice(
          'Account created. Check your email to confirm, then sign in.',
        )
        setMode('signin')
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    }

    router.push('/dashboard/team')
    router.refresh()
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-border bg-card/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
        {/* Build-log style header line */}
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="tracking-widest uppercase">team / access</span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.form
            key={mode}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
              {mode === 'signin' ? 'Sign in to your team' : 'Create your team account'}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {mode === 'signin'
                ? 'Pick a problem statement, submit your deck, and track your standing.'
                : 'Sign up to register your squad and join the hackathon.'}
            </p>

            <div className="mt-6 flex flex-col gap-4">
              {mode === 'signup' && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fullName">Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">College email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@siddhantcoe.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={
                    mode === 'signin' ? 'current-password' : 'new-password'
                  }
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
              {notice && (
                <p className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 font-mono text-xs text-primary">
                  {notice}
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
                    {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign in' : 'Create account'}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => {
            setError(null)
            setNotice(null)
            setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
          }}
          className="mt-5 text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {mode === 'signin'
            ? "New here? Create a team account"
            : 'Already have an account? Sign in'}
        </button>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Shield className="size-3.5" />
        Judge or admin?{' '}
        <Link href="/staff-login" className="font-medium text-primary hover:underline">
          Staff sign in
        </Link>
      </p>
    </div>
  )
}
