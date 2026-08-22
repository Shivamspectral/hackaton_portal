'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { deleteCustomProblemStatement } from '@/lib/team/actions'

export function DeleteCustomPsButton({ psId, label }: { psId: string; label: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    if (!window.confirm(`Delete ${label}? This can't be undone.`)) return
    setError(null)
    startTransition(async () => {
      const result = await deleteCustomProblemStatement(psId)
      if (!result.ok) {
        setError(result.error ?? 'Could not delete.')
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete ${label}`}
        disabled={pending}
        onClick={handleDelete}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
