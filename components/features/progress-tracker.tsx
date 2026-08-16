import { Check } from 'lucide-react'

import type { Team } from '@/lib/types'
import { cn } from '@/lib/utils'

export function ProgressTracker({ steps }: { steps: Team['progress'] }) {
  const doneCount = steps.filter((s) => s.state === 'done').length
  const pct = Math.round((doneCount / steps.length) * 100)

  return (
    <div>
      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:block">
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-border" />
          <div
            className="absolute left-0 top-4 h-0.5 bg-primary transition-all"
            style={{ width: `${(doneCount / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step) => (
            <div key={step.label} className="relative flex flex-col items-center text-center">
              <span
                className={cn(
                  'grid size-8 place-items-center rounded-full border-2 bg-background transition-colors',
                  step.state === 'done' && 'border-primary bg-primary text-primary-foreground',
                  step.state === 'active' && 'border-primary text-primary glow-primary',
                  step.state === 'upcoming' && 'border-border text-muted-foreground',
                )}
              >
                {step.state === 'done' ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : (
                  <span className={cn('size-2 rounded-full', step.state === 'active' ? 'bg-primary' : 'bg-muted-foreground/50')} />
                )}
              </span>
              <span
                className={cn(
                  'mt-2 max-w-[7rem] text-xs font-medium text-balance',
                  step.state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: progress bar + list */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-muted-foreground">{pct}% complete</span>
          <span className="font-mono text-muted-foreground">
            {doneCount}/{steps.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-full border',
                  step.state === 'done' && 'border-primary bg-primary text-primary-foreground',
                  step.state === 'active' && 'border-primary text-primary',
                  step.state === 'upcoming' && 'border-border text-muted-foreground',
                )}
              >
                {step.state === 'done' ? (
                  <Check className="size-3" strokeWidth={3} />
                ) : (
                  <span className={cn('size-1.5 rounded-full', step.state === 'active' ? 'bg-primary' : 'bg-muted-foreground/50')} />
                )}
              </span>
              <span className={step.state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'}>
                {step.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
