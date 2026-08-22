import type { Metadata } from 'next'

import { PsLockToggle } from '@/components/features/admin/ps-lock-toggle'
import { PsManager } from '@/components/features/admin/ps-manager'
import { getAdminProblemStatements, getPsSelectionLocked } from '@/lib/admin/data'
import { EVENT } from '@/lib/config'

export const metadata: Metadata = {
  title: `Problem Statements — Admin — ${EVENT.name}`,
  description: 'Create, edit, and remove problem statements teams can select.',
}

export default async function AdminProblemStatementsPage() {
  const [problemStatements, locked] = await Promise.all([
    getAdminProblemStatements(),
    getPsSelectionLocked(),
  ])
  return (
    <div className="flex flex-col gap-6">
      <PsLockToggle initialLocked={locked} />
      <PsManager problemStatements={problemStatements} />
    </div>
  )
}
