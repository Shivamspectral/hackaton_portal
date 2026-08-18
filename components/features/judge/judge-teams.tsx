'use client'

import { CheckCircle2, ClipboardList, ExternalLink, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { ScoringForm } from '@/components/features/judge/scoring-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { JudgeTeamRow } from '@/lib/judge/data'
import { getSubmissionDownloadUrl } from '@/lib/submissions-client'

export function JudgeTeams({ teams }: { teams: JudgeTeamRow[] }) {
  const [active, setActive] = useState<JudgeTeamRow | null>(null)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleViewDeck(team: JudgeTeamRow) {
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
    <>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive"
        >
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const scored = !!team.myEvaluation
          return (
            <div key={team.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-primary">{team.teamCode}</div>
                  <h3 className="mt-1 truncate font-display text-base font-semibold">
                    {team.teamName}
                  </h3>
                </div>
                {scored && <CheckCircle2 className="size-4 shrink-0 text-chart-3" />}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={team.submissionStatus === 'submitted' ? 'success' : 'muted'}>
                  {team.submissionStatus === 'submitted' ? 'Deck submitted' : 'No deck yet'}
                </Badge>
                {team.selectedPs && (
                  <Badge variant="outline" className="font-mono">
                    {team.selectedPs.psId}
                  </Badge>
                )}
              </div>

              <p className="mt-2 min-h-[1.25rem] truncate text-xs text-muted-foreground">
                {team.selectedPs?.title ?? 'No problem statement selected'}
              </p>

              {team.submissionFileUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  disabled={openingId === team.id}
                  onClick={() => handleViewDeck(team)}
                >
                  {openingId === team.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ExternalLink className="size-3.5" />
                  )}
                  View deck
                </Button>
              )}

              <Button
                variant={scored ? 'outline' : 'default'}
                className={team.submissionFileUrl ? 'mt-2' : 'mt-4'}
                onClick={() => setActive(team)}
              >
                <ClipboardList className="size-4" />
                {scored ? `Edit score · ${team.myEvaluation!.totalScore}` : 'Score this team'}
              </Button>
            </div>
          )
        })}

        {teams.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No teams to score yet.
          </div>
        )}
      </div>

      <Modal
        open={active !== null}
        onOpenChange={(next) => !next && setActive(null)}
        title={active ? `Score ${active.teamCode}` : ''}
        description={active?.teamName}
        className="max-w-lg"
      >
        {active && <ScoringForm team={active} onDone={() => setActive(null)} />}
      </Modal>
    </>
  )
}
