import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react'
import type { Metadata } from 'next'

import { EventDetails } from '@/components/features/event-details'
import { Timeline } from '@/components/features/timeline'
import { Countdown } from '@/components/site/countdown'
import { PageShell } from '@/components/site/page-shell'
import { Reveal } from '@/components/site/reveal'
import { SectionHeading } from '@/components/site/section-heading'
import { ButtonLink } from '@/components/ui/button-link'
import { getTimeline } from '@/lib/api'
import { EVENT } from '@/lib/config'

export const metadata: Metadata = {
  title: `Event Details — ${EVENT.name}`,
  description: `Everything about ${EVENT.fullName}: format, important dates, eligibility, rules, evaluation criteria, venue, and contact.`,
}

export default async function EventPage() {
  const timeline = await getTimeline()

  return (
    <PageShell>
      {/* Intro */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
        <Reveal>
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-primary/60" />
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
              {EVENT.name} / event
            </span>
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl">
            {EVENT.fullName}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty">
            {EVENT.tagline} · {EVENT.details.date} · {EVENT.details.venue}
          </p>
          <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-border bg-card/50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Hacking begins in
              </p>
              <div className="mt-3">
                <Countdown targetDate={EVENT.startDate} size="sm" />
              </div>
            </div>
            <ButtonLink
              href="/login"
              size="lg"
              className="h-12 shrink-0 px-6 text-sm font-semibold"
            >
              Register / Login
              <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* About */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="What it is" title="About the Hackathon" />
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {EVENT.about.map((para) => (
              <p
                key={para.slice(0, 24)}
                className="text-sm leading-relaxed text-muted-foreground text-pretty sm:text-base"
              >
                {para}
              </p>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Format */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="Event Format"
            description="Four steps from sign-up to final pitch."
          />
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EVENT.format.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.06}>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                <span className="font-mono text-sm font-bold text-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 font-display text-base font-semibold text-balance">
                  {step.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Important dates */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Timeline"
            title="Important Dates"
            description="Mark these — from registration to results."
            align="center"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-12 rounded-2xl border border-border bg-card/50 p-6 sm:p-10">
            <Timeline steps={timeline} />
          </div>
        </Reveal>
      </section>

      {/* Essentials */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="The Essentials"
            title="Eligibility, Team Size & Venue"
            description="Who can join, how big your team can be, and where it all happens."
          />
        </Reveal>
        <div className="mt-8">
          <EventDetails />
        </div>
      </section>

      {/* Rules + Evaluation */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <div>
              <SectionHeading eyebrow="Play fair" title="Rules" />
              <ul className="mt-6 flex flex-col gap-4">
                {EVENT.rules.map((rule) => (
                  <li key={rule.slice(0, 24)} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {rule}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div>
              <SectionHeading eyebrow="How you're scored" title="Evaluation" />
              <ol className="mt-6 flex flex-col gap-3">
                {EVENT.evaluation.map((crit, i) => (
                  <li
                    key={crit.title}
                    className="flex gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 font-mono text-xs font-bold text-primary">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-display text-sm font-semibold">
                        {crit.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {crit.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-6xl px-4 py-16 pb-24 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Reach us"
            title="Contact & Venue"
            description="Questions about the event? The organizing team is here to help."
          />
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Mail,
                label: 'Email',
                value: EVENT.contact.email,
                href: `mailto:${EVENT.contact.email}`,
              },
              {
                icon: Phone,
                label: 'Phone',
                value: EVENT.contact.phone,
                href: `tel:${EVENT.contact.phone.replace(/\s+/g, '')}`,
              },
              { icon: MapPin, label: 'Venue', value: EVENT.details.venue },
            ].map(({ icon: Icon, label, value, href }) => {
              const inner = (
                <>
                  <span className="grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {label}
                  </div>
                  <div className="mt-1 font-display text-base font-semibold text-foreground text-balance">
                    {value}
                  </div>
                </>
              )
              return href ? (
                <a
                  key={label}
                  href={href}
                  className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
                >
                  {inner}
                </a>
              ) : (
                <div
                  key={label}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  {inner}
                </div>
              )
            })}
          </div>
        </Reveal>
      </section>
    </PageShell>
  )
}
