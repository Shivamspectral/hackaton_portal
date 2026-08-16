'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { PsForm } from '@/components/features/admin/ps-form'
import { PsTable } from '@/components/features/admin/ps-table'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { ProblemStatement } from '@/lib/types'

export function PsManager({ problemStatements }: { problemStatements: ProblemStatement[] }) {
  const [editing, setEditing] = useState<ProblemStatement | null>(null)
  const [creating, setCreating] = useState(false)

  const open = creating || editing !== null

  function close() {
    setCreating(false)
    setEditing(null)
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {problemStatements.length} problem statement{problemStatements.length === 1 ? '' : 's'}
        </p>
        <Button onClick={() => setCreating(true)} className="w-fit">
          <Plus className="size-4" />
          New problem statement
        </Button>
      </div>

      <div className="mt-4">
        <PsTable problemStatements={problemStatements} onEdit={setEditing} />
      </div>

      <Modal
        open={open}
        onOpenChange={(next) => !next && close()}
        title={editing ? `Edit ${editing.psId}` : 'New problem statement'}
        description={
          editing
            ? 'Update this brief — changes are visible to teams immediately.'
            : 'Publish a new brief for teams to select.'
        }
        className="max-w-2xl"
      >
        <PsForm problemStatement={editing} onDone={close} />
      </Modal>
    </div>
  )
}
