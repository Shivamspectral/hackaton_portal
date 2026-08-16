import type { Metadata } from 'next'

import { JudgeTeams } from '@/components/features/judge/judge-teams'
import { PageShell } from '@/components/site/page-shell'
import { Reveal } from '@/components/site/reveal'
import { EVENT } from '@/lib/config'
import { getJudgeTeams } from '@/lib/judge/data'
import { requireRole } from '@/lib/supabase/require-role'

export const metadata: Metadata = {
  title: `Judge Dashboard — ${EVENT.name}`,
  description: 'Score teams against the evaluation rubric.',
}

export default async function JudgeDashboardPage() {
  // Server-side role boundary — redirects to /staff-login when signed out,
  // or to the caller's own dashboard when signed in with the wrong role.
  await requireRole('judge')
  const teams = await getJudgeTeams()

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
        <Reveal>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="tracking-widest uppercase">judge workspace</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Score teams
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Rate each team against the rubric below. Scores are saved per team — revisit and
            update them any time before judging closes.
          </p>
        </Reveal>

        <Reveal className="mt-8">
          <JudgeTeams teams={teams} />
        </Reveal>
      </section>
    </PageShell>
  )
}
