import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        default: 'border-primary/30 bg-primary/10 text-primary',
        accent: 'border-accent/30 bg-accent/10 text-accent',
        muted: 'border-border bg-muted/60 text-muted-foreground',
        outline: 'border-border bg-transparent text-foreground',
        success:
          'border-chart-3/40 bg-chart-3/10 text-chart-3',
        warning:
          'border-chart-4/40 bg-chart-4/10 text-chart-4',
        danger: 'border-destructive/40 bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
