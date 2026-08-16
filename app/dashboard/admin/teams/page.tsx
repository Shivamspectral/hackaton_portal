import type { Metadata } from 'next'

import { TeamsTable } from '@/components/features/admin/teams-table'
import { getAdminProblemStatementOptions, getAdminTeams } from '@/lib/admin/data'
import { EVENT } from '@/lib/config'

export const metadata: Metadata = {
  title: `Teams — Admin — ${EVENT.name}`,
  description: 'Manage team status and problem statement assignment.',
}

export default async function AdminTeamsPage() {
  const [teams, psOptions] = await Promise.all([
    getAdminTeams(),
    getAdminProblemStatementOptions(),
  ])

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {teams.length} team{teams.length === 1 ? '' : 's'}
      </p>
      <div className="mt-4">
        <TeamsTable teams={teams} psOptions={psOptions} />
      </div>
    </div>
  )
}
