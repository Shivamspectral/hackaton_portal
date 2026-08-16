import { ClipboardList, FileCheck2, Gavel, Users } from 'lucide-react'
import type { Metadata } from 'next'

import { getAdminOverview } from '@/lib/admin/data'
import { EVENT } from '@/lib/config'

export const metadata: Metadata = {
  title: `Admin Overview — ${EVENT.name}`,
  description: 'Live event counts: participants, teams, problem statements, and submissions.',
}

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview()

  const cards = [
    { label: 'Participants', value: overview.participants, hint: 'Registered team members', icon: Users },
    { label: 'Teams', value: overview.teams, hint: 'Registered squads', icon: Users },
    {
      label: 'Problem Statements',
      value: overview.problemStatements,
      hint: 'Published briefs',
      icon: ClipboardList,
    },
    {
      label: 'Decks Submitted',
      value: overview.submissions,
      hint: 'Teams with a final deck',
      icon: FileCheck2,
    },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card p-6 sm:p-8">
            <card.icon className="size-5 text-primary" />
            <div className="mt-4 font-display text-4xl font-bold tracking-tight tabular-nums">
              {card.value}
            </div>
            <div className="mt-1 text-sm font-medium text-foreground">{card.label}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{card.hint}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold">
          <Gavel className="size-4 text-primary" />
          Judging status
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {overview.evaluationsSubmitted} evaluation
          {overview.evaluationsSubmitted === 1 ? '' : 's'} submitted across all judges so far.
          Aggregate scores update automatically on the{' '}
          <span className="text-foreground">Rankings</span> page as judges score more teams.
        </p>
      </div>
    </div>
  )
}
