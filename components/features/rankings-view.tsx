'use client'

import { Award, Minus, Trophy, User } from 'lucide-react'
import { useMemo, useState } from 'react'

import { RankingTable } from '@/components/features/ranking-table'
import { Badge } from '@/components/ui/badge'
import type { RankingEntry } from '@/lib/types'
import { cn } from '@/lib/utils'

type Tab = 'overall' | 'finalists' | 'mine'

const TABS: { value: Tab; label: string; icon: typeof Trophy }[] = [
  { value: 'overall', label: 'Overall', icon: Trophy },
  { value: 'finalists', label: 'Finalists', icon: Award },
  { value: 'mine', label: 'My Rank', icon: User },
]

export function RankingsView({
  entries,
  myTeamId,
}: {
  entries: RankingEntry[]
  myTeamId?: string
}) {
  const [tab, setTab] = useState<Tab>('overall')

  const finalists = useMemo(
    () => entries.filter((e) => e.status === 'Finalist'),
    [entries],
  )

  const me = useMemo(
    () => entries.find((e) => e.teamId === myTeamId),
    [entries, myTeamId],
  )

  // A window around the current team for the "My Rank" tab.
  const neighbours = useMemo(() => {
    if (!me) return []
    const idx = entries.findIndex((e) => e.teamId === me.teamId)
    const start = Math.max(0, idx - 2)
    return entries.slice(start, idx + 3)
  }, [entries, me])

  return (
    <div>
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Ranking views"
        className="inline-flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1"
      >
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
              tab === value
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'overall' && (
          <RankingTable entries={entries} variant="full" highlightTeamId={myTeamId} />
        )}

        {tab === 'finalists' && (
          <RankingTable entries={finalists} variant="full" highlightTeamId={myTeamId} />
        )}

        {tab === 'mine' &&
          (me ? (
            <div className="flex flex-col gap-6">
              {/* Highlight card */}
              <div className="grid gap-px overflow-hidden rounded-2xl border border-primary/30 bg-border sm:grid-cols-3">
                {[
                  { label: 'Rank', value: `#${me.rank}`, hint: `of ${entries.length} teams` },
                  { label: 'Score', value: String(me.score), hint: 'points' },
                  { label: 'Status', value: me.status, hint: me.problemStatement },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card p-6">
                    <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </div>
                    <div className="mt-1.5 font-display text-3xl font-bold tracking-tight text-primary">
                      {stat.value}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {stat.hint}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="muted" className="font-mono">
                    {me.team}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Your standing among nearby teams
                  </span>
                </div>
                <RankingTable
                  entries={neighbours}
                  variant="full"
                  highlightTeamId={me.teamId}
                />
              </div>
            </div>
          ) : (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/30 px-6 py-16 text-center">
              <Minus className="size-6 text-muted-foreground" />
              <p className="mt-3 font-display text-lg font-semibold">
                No ranked team yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Sign in as a team and start submitting to appear on the
                leaderboard.
              </p>
            </div>
          ))}
      </div>
    </div>
  )
}
