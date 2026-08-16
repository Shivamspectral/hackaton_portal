'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createTeam, joinTeam } from '@/lib/team/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/input'

type Tab = 'create' | 'join'

export function TeamSetupForm() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('create')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const action = tab === 'create' ? createTeam : joinTeam
      const result = await action(formData)
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong.')
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6">
      <div className="mb-6 flex gap-2 rounded-lg bg-background/60 p-1">
        <button
          type="button"
          onClick={() => setTab('create')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            tab === 'create' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          }`}
        >
          Create a team
        </button>
        <button
          type="button"
          onClick={() => setTab('join')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            tab === 'join' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          }`}
        >
          Join a team
        </button>
      </div>

      <form action={handleSubmit} className="flex flex-col gap-4">
        {tab === 'create' ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Team name</Label>
            <Input id="name" name="name" required placeholder="e.g. Ctrl Alt Elite" />
            <p className="text-xs text-muted-foreground">
              You'll get a team code to share with up to 5 teammates.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="teamCode">Team code</Label>
            <Input
              id="teamCode"
              name="teamCode"
              required
              placeholder="e.g. T-482"
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Ask your team leader for this code.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={pending} className="mt-2">
          {pending ? 'Working…' : tab === 'create' ? 'Create team' : 'Join team'}
        </Button>
      </form>
    </div>
  )
}
