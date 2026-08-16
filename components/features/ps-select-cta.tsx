'use client'

import { CheckCircle2, Loader2, Lock } from 'lucide-react'
import { useState } from 'react'

import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import type { ProblemStatement } from '@/lib/types'

export function PSSelectCta({ ps }: { ps: ProblemStatement }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(false)

  const closed = ps.status === 'Closed'

  async function confirm() {
    setLoading(true)
    // Stubbed selection — a real backend call would go here.
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setSelected(true)
    setOpen(false)
  }

  return (
    <>
      {selected ? (
        <div className="flex items-center gap-2 rounded-xl border border-chart-3/40 bg-chart-3/10 px-4 py-3 text-sm font-medium text-chart-3">
          <CheckCircle2 className="size-5" />
          Selected — this brief is now on your team dashboard.
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

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Confirm your problem statement"
        description="Your team can only work on one brief at a time. You can change it until PS selection closes."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirm} disabled={loading}>
              {loading ? (
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
