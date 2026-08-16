import {
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
  Timer,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { StaggerGroup, StaggerItem } from '@/components/site/reveal'
import { EVENT } from '@/lib/config'

const DETAILS: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: CalendarDays, label: 'Event Date', value: EVENT.details.date },
  { icon: MapPin, label: 'Venue', value: EVENT.details.venue },
  { icon: Clock, label: 'Duration', value: EVENT.details.duration },
  { icon: Users, label: 'Team Size', value: EVENT.details.teamSize },
  {
    icon: Timer,
    label: 'Registration Deadline',
    value: EVENT.details.registrationDeadline,
  },
  { icon: GraduationCap, label: 'Eligibility', value: EVENT.details.eligibility },
]

export function EventDetails() {
  return (
    <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {DETAILS.map(({ icon: Icon, label, value }) => (
        <StaggerItem key={label}>
          <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30">
            <div className="grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <Icon className="size-5" />
            </div>
            <div className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {label}
            </div>
            <div className="mt-1 font-display text-lg font-semibold text-foreground text-balance">
              {value}
            </div>
          </div>
        </StaggerItem>
      ))}
    </StaggerGroup>
  )
}
