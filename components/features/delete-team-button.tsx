'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { deleteOwnTeam } from '@/lib/team/actions'

// Only render this where the caller has already confirmed the current user
// is the team leader (see app/dashboard/team/page.tsx) — deleteOwnTeam()
// re-checks leadership server-side regardless, but there's no reason to show
// a button that will just error for regular members.
export function DeleteTeamButton({ teamName }: { teamName: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canConfirm = confirmText.trim() === teamName

  async function handleDelete() {
    if (!canConfirm) return
    setPending(true)
    setError(null)
    const res = await deleteOwnTeam()
    if (res.ok) {
      router.push('/dashboard/team')
      router.refresh()
    } else {
      setError(res.error ?? 'Could not delete team. Please try again.')
      setPending(false)
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
        Delete team
      </Button>

      <Modal
        open={open}
        onOpenChange={(v) => {
          if (!pending) {
            setOpen(v)
            if (!v) {
              setConfirmText('')
              setError(null)
            }
          }
        }}
        title="Delete this team?"
        description="This permanently removes the team, its submitted deck, and any judge scores it has received. Members aren't deleted — they're returned to the create/join screen."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!canConfirm || pending}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete team'
              )}
            </Button>
          </>
        }
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">
            Type <span className="font-mono font-semibold text-foreground">{teamName}</span> to
            confirm.
          </span>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={pending}
            autoComplete="off"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </Modal>
    </>
  )
}
