'use client'

import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'

import { statusVariant } from '@/components/features/problem-statement-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deleteProblemStatement } from '@/lib/admin/actions'
import type { ProblemStatement } from '@/lib/types'

export function PsTable({
  problemStatements,
  onEdit,
}: {
  problemStatements: ProblemStatement[]
  onEdit: (ps: ProblemStatement) => void
}) {
  const [pending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleDelete(ps: ProblemStatement) {
    if (!window.confirm(`Delete ${ps.psId} — ${ps.title}? This can't be undone.`)) return
    setError(null)
    setDeletingId(ps.id)
    startTransition(async () => {
      const result = await deleteProblemStatement(ps.id)
      setDeletingId(null)
      if (!result.ok) setError(result.error ?? 'Failed to delete.')
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {error && (
        <p
          role="alert"
          className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 font-mono text-xs text-destructive"
        >
          {error}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium sm:px-6">PS</th>
              <th className="px-4 py-3 font-medium sm:px-6">Title</th>
              <th className="px-4 py-3 font-medium sm:px-6">Category</th>
              <th className="px-4 py-3 font-medium sm:px-6">Status</th>
              <th className="px-4 py-3 text-right font-medium sm:px-6">Teams</th>
              <th className="px-4 py-3 sm:px-6" />
            </tr>
          </thead>
          <tbody>
            {problemStatements.map((ps) => {
              const busy = pending && deletingId === ps.id
              return (
                <tr
                  key={ps.id}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-mono text-xs text-primary sm:px-6">{ps.psId}</td>
                  <td className="max-w-xs truncate px-4 py-3 font-medium sm:px-6">{ps.title}</td>
                  <td className="px-4 py-3 text-muted-foreground sm:px-6">{ps.category}</td>
                  <td className="px-4 py-3 sm:px-6">
                    <Badge variant={statusVariant(ps.status)}>{ps.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums sm:px-6">{ps.teamsSelected}</td>
                  <td className="px-4 py-3 sm:px-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${ps.psId}`}
                        onClick={() => onEdit(ps)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${ps.psId}`}
                        disabled={busy}
                        onClick={() => handleDelete(ps)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        {busy ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {problemStatements.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No problem statements yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
