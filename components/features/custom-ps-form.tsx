'use client'

// STUB: minimal fields for now (title / short description / description).
// Swap in the fuller field set (org, requirements, tags, difficulty, etc.)
// once the exact spec is decided — the action (createCustomProblemStatement,
// lib/team/actions.ts) already accepts a plain FormData, so extending this
// form later won't require touching the backend.

import { Loader2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { createCustomProblemStatement } from '@/lib/team/actions'

export function CustomPsForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function submit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createCustomProblemStatement(formData)
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong.')
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="w-fit">
        <Sparkles className="size-4" />
        Write your own problem statement
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Custom problem statement"
        description="Private to your team — only your team, judges, and admins can see it. Usable immediately, no approval needed."
      >
        <form action={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="custom-ps-title">Title</Label>
            <Input id="custom-ps-title" name="title" placeholder="e.g. Smart campus energy dashboard" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="custom-ps-short">Short description</Label>
            <Input
              id="custom-ps-short"
              name="shortDescription"
              placeholder="One line summary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="custom-ps-desc">Description</Label>
            <textarea
              id="custom-ps-desc"
              name="description"
              rows={4}
              placeholder="What problem are you solving, and how?"
              className="flex w-full rounded-lg border border-border bg-card/60 px-3.5 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:ring-3 focus-visible:ring-primary/20"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create & save'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
