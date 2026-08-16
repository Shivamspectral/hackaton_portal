'use client'

import { Loader2 } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createProblemStatement, updateProblemStatement } from '@/lib/admin/actions'
import { categories } from '@/lib/mock-data'
import type { ProblemStatement } from '@/lib/types'

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const
const STATUSES = ['Open', 'Filling Fast', 'Closed'] as const

const textareaClass =
  'flex w-full rounded-lg border border-border bg-card/60 px-3.5 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:ring-3 focus-visible:ring-primary/20'

export function PsForm({
  problemStatement,
  onDone,
}: {
  problemStatement: ProblemStatement | null
  onDone: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = problemStatement
        ? await updateProblemStatement(problemStatement.id, formData)
        : await createProblemStatement(formData)

      if (!result.ok) {
        setError(result.error ?? 'Something went wrong. Please try again.')
        return
      }
      onDone()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="psId">PS ID</Label>
          <Input
            id="psId"
            name="psId"
            required
            placeholder="PS-116"
            defaultValue={problemStatement?.psId}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="organization">Organization</Label>
          <Input
            id="organization"
            name="organization"
            required
            defaultValue={problemStatement?.organization}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={problemStatement?.title} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            name="category"
            required
            defaultValue={problemStatement?.category ?? categories[0]}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            id="difficulty"
            name="difficulty"
            required
            defaultValue={problemStatement?.difficulty ?? 'Intermediate'}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" required defaultValue={problemStatement?.status ?? 'Open'}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="shortDescription">Short description</Label>
        <Input
          id="shortDescription"
          name="shortDescription"
          required
          defaultValue={problemStatement?.shortDescription}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Full description</Label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={problemStatement?.description}
          className={textareaClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expectedSolution">Expected solution</Label>
        <textarea
          id="expectedSolution"
          name="expectedSolution"
          required
          rows={3}
          defaultValue={problemStatement?.expectedSolution}
          className={textareaClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="requirements">Requirements (comma-separated)</Label>
        <Input
          id="requirements"
          name="requirements"
          defaultValue={problemStatement?.requirements.join(', ')}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="constraints">Constraints (comma-separated)</Label>
        <Input
          id="constraints"
          name="constraints"
          defaultValue={problemStatement?.constraints.join(', ')}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input id="tags" name="tags" defaultValue={problemStatement?.tags.join(', ')} />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive"
        >
          {error}
        </p>
      )}

      <div className="sticky bottom-0 mt-2 flex justify-end gap-2 border-t border-border bg-card pt-4">
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {problemStatement ? 'Save changes' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
