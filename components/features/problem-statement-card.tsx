import Link from 'next/link'
import { ArrowRight, Building2, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import type { Difficulty, ProblemStatement, PSStatus } from '@/lib/types'

export function statusVariant(status: PSStatus) {
  switch (status) {
    case 'Open':
      return 'success' as const
    case 'Filling Fast':
      return 'warning' as const
    case 'Closed':
      return 'danger' as const
  }
}

export function difficultyVariant(difficulty: Difficulty) {
  switch (difficulty) {
    case 'Beginner':
      return 'success' as const
    case 'Intermediate':
      return 'default' as const
    case 'Advanced':
      return 'accent' as const
  }
}

export function ProblemStatementCard({ ps }: { ps: ProblemStatement }) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:glow-primary">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-semibold tracking-wider text-primary">
          {ps.psId}
        </span>
        <Badge variant={statusVariant(ps.status)}>
          <span className="size-1.5 rounded-full bg-current" />
          {ps.status}
        </Badge>
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-balance">
        <Link
          href={`/problem-statements/${ps.id}`}
          className="transition-colors hover:text-primary"
        >
          {ps.title}
        </Link>
      </h3>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Building2 className="size-3.5" />
        {ps.organization}
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
        {ps.shortDescription}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="outline">{ps.category}</Badge>
        <Badge variant={difficultyVariant(ps.difficulty)}>{ps.difficulty}</Badge>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" />
          {ps.teamsSelected} teams selected
        </span>
        <ButtonLink
          size="sm"
          variant="ghost"
          href={`/problem-statements/${ps.id}`}
          className="text-primary hover:bg-primary/10 hover:text-primary"
        >
          View
          <ArrowRight className="size-3.5" />
        </ButtonLink>
      </div>
    </div>
  )
}