import { ArrowUpRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { Announcement } from '@/lib/types'

export function AnnouncementCard({ item }: { item: Announcement }) {
  return (
    <a
      href="#"
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:glow-primary"
    >
      <div className="flex items-center justify-between gap-3">
        <Badge variant="muted" className="font-mono">
          {item.category}
        </Badge>
        <time className="text-xs text-muted-foreground">{item.date}</time>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-balance">
        {item.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {item.description}
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        View announcement
        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </a>
  )
}
