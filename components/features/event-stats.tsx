import type { EventStat } from '@/lib/types'
import { StaggerGroup, StaggerItem } from '@/components/site/reveal'

export function EventStats({ stats }: { stats: EventStat[] }) {
  return (
    <StaggerGroup className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
      {stats.map((stat) => (
        <StaggerItem key={stat.label} className="bg-card">
          <div className="group h-full p-6 transition-colors hover:bg-muted/40 sm:p-8">
            <div className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {stat.value}
            </div>
            <div className="mt-2 text-sm font-medium text-foreground">
              {stat.label}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">{stat.hint}</div>
          </div>
        </StaggerItem>
      ))}
    </StaggerGroup>
  )
}
