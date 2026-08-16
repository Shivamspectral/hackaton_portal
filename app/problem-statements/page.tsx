import type { Metadata } from 'next'

import { PSExplorer } from '@/components/features/ps-explorer'
import { PageShell } from '@/components/site/page-shell'
import { Reveal } from '@/components/site/reveal'
import { SectionHeading } from '@/components/site/section-heading'
import { getProblemStatements } from '@/lib/api'
import { EVENT } from '@/lib/config'

export const metadata: Metadata = {
  title: `Problem Statements — ${EVENT.name}`,
  description:
    'Browse and filter every hackathon problem statement across nine tracks — AI/ML, Web, Cybersecurity, FinTech, HealthTech, Sustainability, Smart Cities, Education, and Robotics.',
}

export default async function ProblemStatementsPage() {
  const problems = await getProblemStatements()

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
        <Reveal>
          <SectionHeading
            eyebrow="Pick Your Challenge"
            title="Problem Statements"
            description="Nine tracks, real-world briefs. Search, filter, and sort to find the challenge your team wants to own."
          />
        </Reveal>
        <div className="mt-8">
          <PSExplorer problems={problems} />
        </div>
      </section>
    </PageShell>
  )
}
