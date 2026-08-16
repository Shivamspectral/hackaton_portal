import type { Metadata } from 'next'

import { RankingsView } from '@/components/features/rankings-view'
import { PageShell } from '@/components/site/page-shell'
import { Reveal } from '@/components/site/reveal'
import { SectionHeading } from '@/components/site/section-heading'
import { getRankings, getTeam } from '@/lib/api'
import { EVENT } from '@/lib/config'

export const metadata: Metadata = {
  title: `Rankings — ${EVENT.name}`,
  description:
    'Live hackathon leaderboard. View overall standings, finalists, and your own team rank.',
}

export default async function RankingsPage() {
  const [rankings, team] = await Promise.all([getRankings(), getTeam()])

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
        <Reveal>
          <SectionHeading
            eyebrow="Live Standings"
            title="Leaderboard"
            description="Scores update as judges evaluate submissions. Track the overall race, the finalists, and where your team stands."
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8">
            <RankingsView entries={rankings} myTeamId={team.teamId} />
          </div>
        </Reveal>
      </section>
    </PageShell>
  )
}
