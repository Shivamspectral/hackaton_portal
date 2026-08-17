'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Calendar, MapPin, Sparkles } from 'lucide-react'
import Image from 'next/image'

import { Countdown } from '@/components/site/countdown'
import { ButtonLink } from '@/components/ui/button-link'
import { EVENT } from '@/lib/config'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background visual */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/hero-visual.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center"
        >
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-wide text-primary">
              <Sparkles className="size-3.5" />
              {EVENT.fullName}
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight text-balance sm:text-7xl lg:text-8xl"
          >
            BUILD.{' '}
            <span className="text-primary text-glow">BREAK.</span>{' '}
            INNOVATE.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg"
          >
            {EVENT.tagline}, where the sharpest student builders across campus
            ship real solutions to real problems. Pick a challenge, form your team,
            and race to the top of the leaderboard.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
          >
            <ButtonLink
              size="lg"
              href="/login"
              className="h-12 px-6 text-sm font-semibold"
            >
              Register / Login
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink
              size="lg"
              variant="outline"
              href="/problem-statements"
              className="h-12 border-border px-6 text-sm font-semibold hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              Explore Problem Statements
            </ButtonLink>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4 text-primary" />
              {EVENT.details.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" />
              {EVENT.details.venue}
            </span>
          </motion.div>

          <motion.div variants={item} className="mt-12">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Hacking begins in
            </p>
            <Countdown targetDate={EVENT.startDate} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
