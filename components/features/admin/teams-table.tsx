'use client'

import { ExternalLink, Loader2, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import type { ActionResult } from '@/lib/admin/actions'
import { assignTeamProblemStatement, deleteTeam, updateTeamStatus } from '@/lib/admin/actions'
import type { AdminTeamRow } from '@/lib/admin/data'
import { getSubmissionDownloadUrl } from '@/lib/submissions-client'

const STATUSES = ['Active', 'Qualified', 'Finalist', 'Eliminated'] as const

export function TeamsTable({
  teams,
  psOptions,
}: {
  teams: AdminTeamRow[]
  psOptions: { id: string; ps_id: string; title: string }[]
}) {
  const [pending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openingId, setOpeningId] = useState<string | null>(null)

  function run(id: string, task: () => Promise<ActionResult>) {
    setError(null)
    setBusyId(id)
    startTransition(async () => {
      const result = await task()
      setBusyId(null)
      if (!result.ok) setError(result.error ?? 'Something went wrong.')
    })
  }

  function handleDelete(team: AdminTeamRow) {
    if (!window.confirm(`Delete team ${team.teamCode} — ${team.teamName}? This can't be undone.`))
      return
    run(team.id, () => deleteTeam(team.id))
  }

  async function handleViewDeck(team: AdminTeamRow) {
    if (!team.submissionFileUrl) return
    setError(null)
    setOpeningId(team.id)
    const url = await getSubmissionDownloadUrl(team.submissionFileUrl)
    setOpeningId(null)
    if (!url) {
      setError(`Could not open ${team.teamCode}'s deck. Please try again.`)
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
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
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium sm:px-6">Team</th>
              <th className="px-4 py-3 font-medium sm:px-6">Leader</th>
              <th className="px-4 py-3 font-medium sm:px-6">Members</th>
              <th className="px-4 py-3 font-medium sm:px-6">Problem Statement</th>
              <th className="px-4 py-3 font-medium sm:px-6">Submission</th>
              <th className="px-4 py-3 font-medium sm:px-6">Status</th>
              <th className="px-4 py-3 sm:px-6" />
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => {
              const busy = pending && busyId === team.id
              return (
                <tr key={team.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 sm:px-6">
                    <div className="font-medium">{team.teamName}</div>
                    <div className="font-mono text-xs text-muted-foreground">{team.teamCode}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground sm:px-6">{team.leaderName}</td>
                  <td className="px-4 py-3 tabular-nums sm:px-6">{team.memberCount}</td>
                  <td className="px-4 py-3 sm:px-6">
                    <Select
                      aria-label={`Problem statement for ${team.teamCode}`}
                      className="h-9 min-w-[11rem] text-xs"
                      disabled={busy}
                      defaultValue={team.selectedPs?.id ?? ''}
                      onChange={(e) =>
                        run(team.id, () =>
                          assignTeamProblemStatement(team.id, e.target.value || null),
                        )
                      }
                    >
                      <option value="">Unassigned</option>
                      {psOptions.map((ps) => (
                        <option key={ps.id} value={ps.id}>
                          {ps.ps_id} — {ps.title}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-2">
                      <Badge variant={team.submissionStatus === 'submitted' ? 'success' : 'muted'}>
                        {team.submissionStatus === 'submitted' ? 'Submitted' : 'Pending'}
                      </Badge>
                      {team.submissionFileUrl && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`View ${team.teamCode}'s deck`}
                          disabled={openingId === team.id}
                          onClick={() => handleViewDeck(team)}
                        >
                          {openingId === team.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <ExternalLink className="size-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <Select
                      aria-label={`Status for ${team.teamCode}`}
                      className="h-9 min-w-[8rem] text-xs"
                      disabled={busy}
                      defaultValue={team.status}
                      onChange={(e) => run(team.id, () => updateTeamStatus(team.id, e.target.value))}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${team.teamCode}`}
                      disabled={busy}
                      onClick={() => handleDelete(team)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      {busy ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </Button>
                  </td>
                </tr>
              )
            })}
            {teams.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No teams yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
