'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { deleteOwnAccount } from '@/lib/account/actions'

// Hard-deletes the signed-in user's account (see lib/account/actions.ts).
// Confirmation requires typing DELETE so this can't be fat-fingered from a
// stray click. Drop this next to the Logout button anywhere a signed-in
// user is present — role-agnostic (team/judge/admin).
export function DeleteAccountButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canConfirm = confirmText.trim().toUpperCase() === 'DELETE'

  async function handleDelete() {
    if (!canConfirm) return
    setPending(true)
    setError(null)
    const res = await deleteOwnAccount()
    // deleteOwnAccount() redirects on success, so we only ever get here on
    // failure (or if redirect() throws NEXT_REDIRECT, which Next handles
    // for us and never reaches this line).
    if (res && !res.ok) {
      setError(res.error ?? 'Could not delete account. Please try again.')
      setPending(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Delete account"
        className={className ?? 'text-muted-foreground hover:text-destructive'}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
        Delete account
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
        title="Delete your account?"
        description="This permanently deletes your login and profile. Your email becomes free to register again as a brand-new account. If you lead a team, leadership is handed to your longest-standing teammate first — this cannot be undone."
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
                'Delete my account'
              )}
            </Button>
          </>
        }
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">
            Type <span className="font-mono font-semibold text-foreground">DELETE</span> to
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
