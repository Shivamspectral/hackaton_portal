import type { Metadata } from 'next'

import { UsersTable } from '@/components/features/admin/users-table'
import { getAdminTeamOptions, getAdminUsers } from '@/lib/admin/data'
import { EVENT } from '@/lib/config'

export const metadata: Metadata = {
  title: `Users — Admin — ${EVENT.name}`,
  description: 'Manage account roles and team assignments.',
}

export default async function AdminUsersPage() {
  const [users, teamOptions] = await Promise.all([getAdminUsers(), getAdminTeamOptions()])

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {users.length} user{users.length === 1 ? '' : 's'}
      </p>
      <div className="mt-4">
        <UsersTable users={users} teamOptions={teamOptions} />
      </div>
    </div>
  )
}
