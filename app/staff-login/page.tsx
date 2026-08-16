import type { Metadata } from 'next'

import { StaffLoginForm } from '@/components/features/staff-login-form'
import { PageShell } from '@/components/site/page-shell'
import { EVENT } from '@/lib/config'

export const metadata: Metadata = {
  title: `Staff Login — ${EVENT.name}`,
  description:
    'Judge and admin sign in for the hackathon platform. Access level is determined by your account role.',
}

export default function StaffLoginPage() {
  return (
    <PageShell>
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-4 py-16 sm:px-6">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* Left: build-log narrative panel */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-accent/60" />
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
                {EVENT.name} / staff
              </span>
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-balance">
              Run the event. Score the work.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
              Judges review submissions and score finalist teams; admins manage
              problem statements, teams, and roles. Your permissions are tied to
              your account — sign in and you land in the right place.
            </p>

            <ul className="mt-8 flex flex-col gap-3 font-mono text-sm">
              {[
                'judge — read all submissions & score teams',
                'admin — manage tracks, teams & user roles',
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="text-muted-foreground text-pretty">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: form */}
          <StaffLoginForm />
        </div>
      </section>
    </PageShell>
  )
}
