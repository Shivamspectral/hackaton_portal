'use client'

import { Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'

import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import type { ActionResult } from '@/lib/admin/actions'
import { assignUserTeam, updateUserRole } from '@/lib/admin/actions'
import type { AdminUserRow } from '@/lib/admin/data'
import type { Role } from '@/lib/types'

const ROLES: Role[] = ['team', 'judge', 'admin']

function roleVariant(role: Role) {
  switch (role) {
    case 'admin':
      return 'default' as const
    case 'judge':
      return 'accent' as const
    default:
      return 'muted' as const
  }
}

export function UsersTable({
  users,
  teamOptions,
}: {
  users: AdminUserRow[]
  teamOptions: { id: string; team_code: string; name: string }[]
}) {
  const [pending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function run(id: string, task: () => Promise<ActionResult>) {
    setError(null)
    setBusyId(id)
    startTransition(async () => {
      const result = await task()
      setBusyId(null)
      if (!result.ok) setError(result.error ?? 'Something went wrong.')
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
              <th className="px-4 py-3 font-medium sm:px-6">Name</th>
              <th className="px-4 py-3 font-medium sm:px-6">Email</th>
              <th className="px-4 py-3 font-medium sm:px-6">Team</th>
              <th className="px-4 py-3 font-medium sm:px-6">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const busy = pending && busyId === user.id
              return (
                <tr key={user.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium sm:px-6">{user.fullName?.trim() || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground sm:px-6">{user.email}</td>
                  <td className="px-4 py-3 sm:px-6">
                    <Select
                      aria-label={`Team for ${user.email}`}
                      className="h-9 min-w-[10rem] text-xs"
                      disabled={busy}
                      defaultValue={user.teamId ?? ''}
                      onChange={(e) =>
                        run(user.id, () => assignUserTeam(user.id, e.target.value || null))
                      }
                    >
                      <option value="">No team</option>
                      {teamOptions.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.team_code} — {team.name}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-2">
                      <Badge variant={roleVariant(user.role)}>{user.role}</Badge>
                      <Select
                        aria-label={`Role for ${user.email}`}
                        className="h-9 min-w-[7rem] text-xs"
                        disabled={busy}
                        defaultValue={user.role}
                        onChange={(e) =>
                          run(user.id, () => updateUserRole(user.id, e.target.value as Role))
                        }
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </Select>
                      {busy && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
                    </div>
                  </td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
