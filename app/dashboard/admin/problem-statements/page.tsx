import type { Metadata } from 'next'

import { PsManager } from '@/components/features/admin/ps-manager'
import { getAdminProblemStatements } from '@/lib/admin/data'
import { EVENT } from '@/lib/config'

export const metadata: Metadata = {
  title: `Problem Statements — Admin — ${EVENT.name}`,
  description: 'Create, edit, and remove problem statements teams can select.',
}

export default async function AdminProblemStatementsPage() {
  const problemStatements = await getAdminProblemStatements()
  return <PsManager problemStatements={problemStatements} />
}
