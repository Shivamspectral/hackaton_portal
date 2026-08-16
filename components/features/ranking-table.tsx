import { Badge } from '@/components/ui/badge'
import type { RankingEntry } from '@/lib/types'
import { cn } from '@/lib/utils'

function statusVariant(status: RankingEntry['status']) {
  switch (status) {
    case 'Finalist':
      return 'default' as const
    case 'Qualified':
      return 'accent' as const
    case 'Active':
      return 'muted' as const
    case 'Eliminated':
      return 'danger' as const
  }
}

function RankBadge({ rank }: { rank: number }) {
  // Signature treatment: the leader is marked in oxide red, the rest of the
  // podium in phosphor green, everyone else stays quiet.
  return (
    <span
      className={cn(
        'grid size-8 place-items-center rounded-lg font-display text-sm font-bold tabular-nums',
        rank === 1 && 'border border-destructive/50 bg-destructive/15 text-destructive',
        rank > 1 && rank <= 3 && 'border border-primary/40 bg-primary/10 text-primary',
        rank > 3 && 'text-muted-foreground',
      )}
    >
      {rank}
    </span>
  )
}

export function RankingTable({
  entries,
  variant = 'full',
  highlightTeamId,
}: {
  entries: RankingEntry[]
  variant?: 'preview' | 'full'
  highlightTeamId?: string
}) {
  const full = variant === 'full'

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium sm:px-6">Rank</th>
              <th className="px-4 py-3 font-medium sm:px-6">Team</th>
              {full && (
                <th className="hidden px-4 py-3 font-medium sm:px-6 md:table-cell">
                  Problem
                </th>
              )}
              <th className="px-4 py-3 text-right font-medium sm:px-6">Score</th>
              {full && (
                <th className="hidden px-4 py-3 font-medium sm:px-6 sm:table-cell">
                  Status
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const highlighted = highlightTeamId === entry.teamId
              return (
                <tr
                  key={entry.teamId}
                  className={cn(
                    'border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30',
                    highlighted && 'bg-primary/5 hover:bg-primary/10',
                  )}
                >
                  <td className="px-4 py-3 sm:px-6">
                    <RankBadge rank={entry.rank} />
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <div className="font-medium text-foreground">
                      {entry.team}
                      {highlighted && (
                        <span className="ml-2 text-xs font-normal text-primary">
                          You
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {entry.teamId}
                    </div>
                  </td>
                  {full && (
                    <td className="hidden px-4 py-3 sm:px-6 md:table-cell">
                      <span className="font-mono text-xs text-primary">
                        {entry.problemStatement}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-right sm:px-6">
                    <span className="font-display font-bold tabular-nums text-foreground">
                      {entry.score}
                    </span>
                  </td>
                  {full && (
                    <td className="hidden px-4 py-3 sm:px-6 sm:table-cell">
                      <Badge variant={statusVariant(entry.status)}>
                        {entry.status}
                      </Badge>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
