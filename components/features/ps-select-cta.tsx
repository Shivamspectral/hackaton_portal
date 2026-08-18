'use client'

import { CheckCircle2, Loader2, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { selectProblemStatement } from '@/lib/team/actions'
import type { ProblemStatement } from '@/lib/types'

export function PSSelectCta({
  ps,
  teamSelectedPsId = null,
}: {
  ps: ProblemStatement
  teamSelectedPsId?: string | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [justSelected, setJustSelected] = useState(false)

  const closed = ps.status === 'Closed'
  const isThisOne = teamSelectedPsId === ps.psId
  const selected = justSelected || isThisOne
  const lockedToOther = !!teamSelectedPsId && !isThisOne

  function confirm() {
    setError(null)
    startTransition(async () => {
      const result = await selectProblemStatement(ps.id)
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong.')
        return
      }
      setJustSelected(true)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      {selected ? (
        <div className="flex items-center gap-2 rounded-xl border border-chart-3/40 bg-chart-3/10 px-4 py-3 text-sm font-medium text-chart-3">
          <CheckCircle2 className="size-5" />
          Selected — this brief is now on your team dashboard.
        </div>
      ) : lockedToOther ? (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm font-medium text-muted-foreground">
          <Lock className="size-4" />
          Your team already selected {teamSelectedPsId} — contact an admin to change it.
        </div>
      ) : (
        <Button
          size="lg"
          disabled={closed}
          onClick={() => setOpen(true)}
          className="h-12 w-full px-6 text-sm font-semibold sm:w-auto"
        >
          {closed ? (
            <>
              <Lock className="size-4" />
              Selection Closed
            </>
          ) : (
            'Select this Problem Statement'
          )}
        </Button>
      )}

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Confirm your problem statement"
        description="Once selected, this is final — contact an admin if you need to change it later."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirm} disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Locking in…
                </>
              ) : (
                'Confirm selection'
              )}
            </Button>
          </>
        }
      >
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <div className="font-mono text-xs font-semibold tracking-wider text-primary">
            {ps.psId}
          </div>
          <div className="mt-1 font-display text-sm font-semibold text-balance">
            {ps.title}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {ps.organization} · {ps.category}
          </div>
        </div>
      </Modal>
    </>
  )
}
