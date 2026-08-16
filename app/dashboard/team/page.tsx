import { ArrowRight, Crown, Layers, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { AnnouncementCard } from '@/components/features/announcement-card'
import { ProgressTracker } from '@/components/features/progress-tracker'
import { SubmissionPanel } from '@/components/features/submission-panel'
import { TeamSetupForm } from '@/components/features/team-setup-form'
import { PageShell } from '@/components/site/page-shell'
import { Reveal } from '@/components/site/reveal'
import { RequireAuth } from '@/components/site/require-auth'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import { getAnnouncements, getTeam } from '@/lib/api'
import { getCurrentUser } from '@/lib/supabase/auth'
import { EVENT } from '@/lib/config'

export const metadata: Metadata = {
  title: `Team Dashboard — ${EVENT.name}`,
  description:
    'Your team workspace: roster, selected problem statement, submission status, progress, and the latest announcements.',
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function Panel({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string
  icon: typeof Users
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-6 ${className ?? ''}`}>
      <h2 className="flex items-center gap-2 font-display text-base font-semibold">
        <Icon className="size-4 text-primary" />
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export default async function TeamDashboardPage() {
  // Real, signed-in users with no team yet get the create/join flow instead
  // of the workspace (which would otherwise silently fall back to demo data —
  // see getTeam() in lib/api.ts). Users still get the mock-data preview when
  // Supabase isn't connected at all (getCurrentUser() returns null then).
  const user = await getCurrentUser()
  const needsTeamSetup = user !== null && user.teamId === null

  const [team, announcements] = await Promise.all([
    getTeam(),
    getAnnouncements(),
  ])

  const relevant = announcements.slice(0, 3)

  if (needsTeamSetup) {
    return (
      <PageShell>
        <RequireAuth>
          <section className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6">
            <div className="mx-auto mb-8 max-w-md text-center">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                Join or create a team
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                You need to be on a team before you can pick a problem
                statement or submit your work.
              </p>
            </div>
            <TeamSetupForm />
          </section>
        </RequireAuth>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <RequireAuth>
        <section className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
          {/* Header */}
          <Reveal>
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="tracking-widest uppercase">team workspace</span>
            </div>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                  {team.teamName}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="font-mono text-primary">{team.teamId}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Crown className="size-4" />
                    Led by {team.leader}
                  </span>
                </div>
              </div>
              <Badge variant="muted" className="w-fit font-mono">
                {team.members.length} members
              </Badge>
            </div>
          </Reveal>

          {/* Progress */}
          <Reveal className="mt-8">
            <Panel title="Progress" icon={Layers}>
              <ProgressTracker steps={team.progress} />
            </Panel>
          </Reveal>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
            {/* Main column */}
            <div className="flex flex-col gap-6">
              {/* Selected problem statement */}
              <Reveal>
                <Panel title="Selected Problem Statement" icon={Layers}>
                  {team.selectedProblem ? (
                    <div className="flex flex-col gap-4 rounded-xl border border-border bg-background/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold tracking-wider text-primary">
                            {team.selectedProblem.psId}
                          </span>
                          <Badge variant="outline">
                            {team.selectedProblem.category}
                          </Badge>
                          <Badge variant="success">
                            {team.selectedProblem.status}
                          </Badge>
                        </div>
                        <h3 className="mt-2 font-display text-lg font-semibold text-balance">
                          {team.selectedProblem.title}
                        </h3>
                      </div>
                      <ButtonLink
                        variant="outline"
                        href={`/problem-statements/${team.selectedProblem.psId}`}
                        className="shrink-0 hover:border-primary/40 hover:text-primary"
                      >
                        View brief
                        <ArrowRight className="size-4" />
                      </ButtonLink>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-background/40 p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        You haven&apos;t selected a problem statement yet.
                      </p>
                      <ButtonLink href="/problem-statements" className="mt-4">
                        Browse problem statements
                        <ArrowRight className="size-4" />
                      </ButtonLink>
                    </div>
                  )}
                </Panel>
              </Reveal>

              {/* Submission */}
              <Reveal>
                <Panel title="Presentation Submission" icon={Layers}>
                  <p className="-mt-1 mb-4 text-sm leading-relaxed text-muted-foreground">
                    Upload your final pitch deck as a PPT or PPTX. You can replace
                    it any time before the submission deadline.
                  </p>
                  <SubmissionPanel
                    submission={team.submission}
                    teamDbId={team.dbId}
                  />
                </Panel>
              </Reveal>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-6">
              <Reveal>
                <Panel title="Team Roster" icon={Users}>
                  <ul className="flex flex-col gap-4">
                    {team.members.map((m) => {
                      const isLead = m.name === team.leader
                      return (
                        <li key={m.name} className="flex items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/10 font-display text-sm font-semibold text-primary">
                            {initials(m.name)}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-sm font-medium text-foreground">
                                {m.name}
                              </span>
                              {isLead && (
                                <Crown className="size-3.5 shrink-0 text-primary" />
                              )}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {m.role}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </Panel>
              </Reveal>

              <Reveal>
                <div>
                  <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                    <Layers className="size-4 text-primary" />
                    Announcements
                  </h2>
                  <div className="mt-4 flex flex-col gap-4">
                    {relevant.map((item) => (
                      <AnnouncementCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </RequireAuth>
    </PageShell>
  )
}
