'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number }

function getTimeLeft(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now())
  const seconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  }
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export function Countdown({
  targetDate,
  className,
  size = 'default',
}: {
  targetDate: string
  className?: string
  size?: 'default' | 'sm'
}) {
  const target = new Date(targetDate).getTime()
  const [time, setTime] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setTime(getTimeLeft(target))
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const units: { label: string; value: number }[] = [
    { label: 'Days', value: time?.days ?? 0 },
    { label: 'Hours', value: time?.hours ?? 0 },
    { label: 'Minutes', value: time?.minutes ?? 0 },
    { label: 'Seconds', value: time?.seconds ?? 0 },
  ]

  return (
    <div className={cn('flex items-stretch gap-2 sm:gap-3', className)}>
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-stretch gap-2 sm:gap-3">
          <div
            className={cn(
              'flex min-w-0 flex-col items-center justify-center rounded-xl border border-border bg-card/70 glass',
              size === 'sm' ? 'w-16 px-2 py-2' : 'w-[72px] px-2 py-3 sm:w-20',
            )}
          >
            <div
              className={cn(
                'relative overflow-hidden font-display font-bold tabular-nums text-foreground',
                size === 'sm' ? 'text-2xl' : 'text-3xl sm:text-4xl',
              )}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={pad(unit.value)}
                  initial={{ y: '-70%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '70%', opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  {pad(unit.value)}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="mt-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span
              aria-hidden
              className={cn(
                'flex items-center font-display font-bold text-primary/40',
                size === 'sm' ? 'text-2xl' : 'text-3xl sm:text-4xl',
              )}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
