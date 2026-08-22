'use client'

import { Loader2, Lock, LockOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { setPsSelectionLocked } from '@/lib/admin/actions'

export function PsLockToggle({ initialLocked }: { initialLocked: boolean }) {
  const router = useRouter()
  const [locked, setLocked] = useState(initialLocked)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function toggle() {
    const next = !locked
    setError(null)
    startTransition(async () => {
      const result = await setPsSelectionLocked(next)
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong.')
        return
      }
      setLocked(next)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border ${
            locked
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-chart-3/30 bg-chart-3/10 text-chart-3'
          }`}
        >
          {locked ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
        </span>
        <div>
          <h3 className="font-display text-sm font-semibold">
            Problem statement selection
          </h3>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
            {locked
              ? 'Locked — teams cannot change their selected problem statement. Only admins can reassign it.'
              : 'Unlocked — teams can freely switch their selected problem statement at any time.'}
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors disabled:opacity-60 ${
          locked
            ? 'border-border bg-background/60 text-foreground hover:border-chart-3/40 hover:text-chart-3'
            : 'border-border bg-background/60 text-foreground hover:border-destructive/40 hover:text-destructive'
        }`}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : locked ? (
          <LockOpen className="size-4" />
        ) : (
          <Lock className="size-4" />
        )}
        {locked ? 'Unlock selection' : 'Lock selection'}
      </button>
    </div>
  )
}
