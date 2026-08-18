import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CircleAlert,
  Gauge,
  Layers,
  Target,
  Users,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  difficultyVariant,
  statusVariant,
} from '@/components/features/problem-statement-card'
import { PSSelectCta } from '@/components/features/ps-select-cta'
import { PageShell } from '@/components/site/page-shell'
import { Reveal } from '@/components/site/reveal'
import { Badge } from '@/components/ui/badge'
import { getProblemStatement, getProblemStatements, getTeam } from '@/lib/api'
import { getCurrentUser } from '@/lib/supabase/auth'
import { EVENT } from '@/lib/config'
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const ps = await getProblemStatement(id)
  if (!ps) return { title: `Problem Statement — ${EVENT.name}` }
  return {
    title: `${ps.psId} · ${ps.title} — ${EVENT.name}`,
    description: ps.shortDescription,
  }
}

function ListBlock({
  icon: Icon,
  title,
  items,
  tone = 'primary',
}: {
  icon: typeof Target
  title: string
  items: string[]
  tone?: 'primary' | 'muted'
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Icon className="size-5 text-primary" />
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
            <span
              className={
                tone === 'primary'
                  ? 'mt-2 size-1.5 shrink-0 rounded-full bg-primary'
                  : 'mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60'
              }
            />
            <span className="text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function ProblemStatementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const ps = await getProblemStatement(id)
  if (!ps) notFound()

  // If the signed-in user's team already has a PS selected, pass its psId
  // down so the button reflects that instead of showing "Select" everywhere.
  const user = await getCurrentUser()
  let teamSelectedPsId: string | null = null
  if (user?.teamId) {
    const team = await getTeam()
    teamSelectedPsId = team.selectedProblem?.psId ?? null
  }

  const facts = [
    { icon: Layers, label: 'Category', value: ps.category },
    { icon: Gauge, label: 'Difficulty', value: ps.difficulty },
    { icon: Users, label: 'Teams selected', value: String(ps.teamsSelected) },
    { icon: Building2, label: 'Organization', value: ps.organization },
  ]

  return (
    <PageShell>
      <article className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
        <Link
          href="/problem-statements"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All problem statements
        </Link>

        {/* Header */}
        <Reveal className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold tracking-wider text-primary">
              {ps.psId}
            </span>
            <span className="text-muted-foreground">/</span>
            <Badge variant={statusVariant(ps.status)}>
              <span className="size-1.5 rounded-full bg-current" />
              {ps.status}
            </Badge>
            <Badge variant={difficultyVariant(ps.difficulty)}>
              {ps.difficulty}
            </Badge>
            <Badge variant="outline">{ps.category}</Badge>
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {ps.title}
          </h1>
          <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="size-4" />
            {ps.organization}
          </div>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
          {/* Main content */}
          <div className="flex flex-col gap-10">
            <Reveal>
              <section>
                <h2 className="font-display text-lg font-semibold">Overview</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {ps.description}
                </p>
              </section>
            </Reveal>

            <Reveal>
              <section className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Target className="size-5 text-primary" />
                  Expected Solution
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {ps.expectedSolution}
                </p>
              </section>
            </Reveal>

            <Reveal>
              <div className="grid gap-8 sm:grid-cols-2">
                <ListBlock
                  icon={CheckCircle2}
                  title="Requirements"
                  items={ps.requirements}
                />
                <ListBlock
                  icon={CircleAlert}
                  title="Constraints"
                  items={ps.constraints}
                  tone="muted"
                />
              </div>
            </Reveal>

            <Reveal>
              <section>
                <h2 className="font-display text-lg font-semibold">
                  Tags &amp; Technologies
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ps.tags.map((tag) => (
                    <Badge key={tag} variant="muted" className="font-mono">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            </Reveal>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary" />
                <span className="tracking-widest uppercase">selection</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Lock this brief in for your team. You can change your pick until
                PS selection closes on the timeline.
              </p>
              <div className="mt-5">
                <PSSelectCta ps={ps} teamSelectedPsId={teamSelectedPsId} />
              </div>

              <dl className="mt-6 flex flex-col gap-4 border-t border-border pt-6">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background/50 text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        {label}
                      </dt>
                      <dd className="truncate text-sm font-medium text-foreground">
                        {value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </article>
    </PageShell>
  )
}
