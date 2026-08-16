import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { AnnouncementCard } from '@/components/features/announcement-card'
import { EventDetails } from '@/components/features/event-details'
import { EventStats } from '@/components/features/event-stats'
import { ProblemStatementCard } from '@/components/features/problem-statement-card'
import { RankingTable } from '@/components/features/ranking-table'
import { Timeline } from '@/components/features/timeline'
import { Hero } from '@/components/sections/hero'
import { PageShell } from '@/components/site/page-shell'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/site/reveal'
import { SectionHeading } from '@/components/site/section-heading'
import { ButtonLink } from '@/components/ui/button-link'
import {
  getAnnouncements,
  getEventStats,
  getProblemStatements,
  getRankings,
  getTimeline,
} from '@/lib/api'

export default async function HomePage() {
  const [stats, announcements, timeline, problems, rankings] = await Promise.all([
    getEventStats(),
    getAnnouncements(),
    getTimeline(),
    getProblemStatements(),
    getRankings(),
  ])

  const featuredProblems = problems.slice(0, 3)
  const topRanks = rankings.slice(0, 5)

  return (
    <PageShell>
      <Hero />

      {/* Event stats */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <EventStats stats={stats} />
      </section>

      {/* Announcements */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Latest Updates"
            title="Announcements"
            description="Stay on top of every drop — new tracks, mentor line-ups, and deadline changes."
            action={
              <ButtonLink
                variant="outline"
                className="h-10 hover:border-primary/40 hover:text-primary"
                href="/event"
              >
                Event Info
                <ArrowRight className="size-4" />
              </ButtonLink>
            }
          />
        </Reveal>
        <StaggerGroup className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {announcements.map((item) => (
            <StaggerItem key={item.id} className="h-full">
              <AnnouncementCard item={item} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Event details */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="The Essentials"
            title="Event Details"
            description="Everything you need to know before you commit your weekend to shipping."
          />
        </Reveal>
        <div className="mt-8">
          <EventDetails />
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Roadmap"
            title="Hackathon Timeline"
            description="From registration to results — here is how the event unfolds."
            align="center"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-12 rounded-2xl border border-border bg-card/50 p-6 sm:p-10">
            <Timeline steps={timeline} />
          </div>
        </Reveal>
      </section>

      {/* Problem statements preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Pick Your Challenge"
            title="Featured Problem Statements"
            description="A taste of the challenges waiting for you across nine tracks."
            action={
              <ButtonLink
                variant="outline"
                className="h-10 hover:border-primary/40 hover:text-primary"
                href="/problem-statements"
              >
                View All Problem Statements
                <ArrowRight className="size-4" />
              </ButtonLink>
            }
          />
        </Reveal>
        <StaggerGroup className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredProblems.map((ps) => (
            <StaggerItem key={ps.id} className="h-full">
              <ProblemStatementCard ps={ps} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Ranking preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 pb-24 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Live Standings"
            title="Ranking Preview"
            description="The current top teams as judges score submissions."
            action={
              <ButtonLink
                variant="outline"
                className="h-10 hover:border-primary/40 hover:text-primary"
                href="/rankings"
              >
                View Full Rankings
                <ArrowRight className="size-4" />
              </ButtonLink>
            }
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8">
            <RankingTable entries={topRanks} variant="preview" />
          </div>
        </Reveal>
      </section>
    </PageShell>
  )
}
