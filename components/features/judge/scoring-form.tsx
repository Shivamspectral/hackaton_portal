'use client'

import { Loader2 } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/input'
import { submitScore } from '@/lib/judge/actions'
import type { JudgeTeamRow } from '@/lib/judge/data'

const CRITERIA = [
  { key: 'innovation', label: 'Innovation' },
  { key: 'technical', label: 'Technical Execution' },
  { key: 'feasibility', label: 'Problem Fit' },
  { key: 'impact', label: 'Impact & Feasibility' },
  { key: 'uiUx', label: 'UI / UX' },
  { key: 'presentation', label: 'Presentation' },
] as const

function ScoreSlider({
  name,
  label,
  defaultValue,
}: {
  name: string
  label: string
  defaultValue: number
}) {
  const [value, setValue] = useState(defaultValue)
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        <span className="font-mono text-xs font-semibold tabular-nums text-primary">
          {value}/10
        </span>
      </div>
      <input
        id={name}
        name={name}
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
      />
    </div>
  )
}

export function ScoringForm({ team, onDone }: { team: JudgeTeamRow; onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const evaluation = team.myEvaluation

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await submitScore(team.id, formData)
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong. Please try again.')
        return
      }
      onDone()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {CRITERIA.map((c) => (
          <ScoreSlider
            key={c.key}
            name={c.key}
            label={c.label}
            defaultValue={evaluation ? evaluation[c.key] : 0}
          />
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback">Feedback (optional)</Label>
        <textarea
          id="feedback"
          name="feedback"
          rows={3}
          defaultValue={evaluation?.feedback ?? ''}
          placeholder="Notes for the team or fellow judges…"
          className="flex w-full rounded-lg border border-border bg-card/60 px-3.5 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:ring-3 focus-visible:ring-primary/20"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {evaluation ? 'Update score' : 'Submit score'}
        </Button>
      </div>
    </form>
  )
}
