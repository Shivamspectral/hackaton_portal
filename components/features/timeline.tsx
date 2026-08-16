'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

import type { TimelineStep } from '@/lib/types'
import { cn } from '@/lib/utils'

function Node({ step }: { step: TimelineStep }) {
  return (
    <span
      className={cn(
        'relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2 transition-colors',
        step.state === 'done' &&
          'border-primary bg-primary text-primary-foreground',
        step.state === 'active' &&
          'border-primary bg-background text-primary glow-primary',
        step.state === 'upcoming' &&
          'border-border bg-card text-muted-foreground',
      )}
    >
      {step.state === 'done' ? (
        <Check className="size-4" strokeWidth={3} />
      ) : (
        <span
          className={cn(
            'size-2 rounded-full',
            step.state === 'active' ? 'bg-primary' : 'bg-muted-foreground/50',
          )}
        />
      )}
      {step.state === 'active' && (
        <span className="absolute inset-0 animate-ping rounded-full border-2 border-primary/50" />
      )}
    </span>
  )
}

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div>
      {/* Desktop: horizontal */}
      <div className="hidden md:block">
        <div className="relative grid grid-cols-7 gap-2">
          <div className="absolute left-0 right-0 top-[18px] h-0.5 bg-border" />
          <motion.div
            className="absolute left-0 top-[18px] h-0.5 origin-left bg-primary"
            style={{ width: `${(2 / (steps.length - 1)) * 100}%` }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Node step={step} />
              <span className="mt-3 font-mono text-xs font-semibold text-primary">
                {step.date}
              </span>
              <span className="mt-1 text-sm font-medium text-foreground text-balance">
                {step.label}
              </span>
              <span className="mt-1 text-xs leading-relaxed text-muted-foreground text-pretty">
                {step.description}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical */}
      <ol className="relative space-y-6 md:hidden">
        <div className="absolute bottom-4 left-[18px] top-4 w-0.5 bg-border" />
        {steps.map((step, i) => (
          <motion.li
            key={step.id}
            className="relative flex gap-4"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <Node step={step} />
            <div className="pt-0.5">
              <span className="font-mono text-xs font-semibold text-primary">
                {step.date}
              </span>
              <div className="text-sm font-medium text-foreground">
                {step.label}
              </div>
              <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </div>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
