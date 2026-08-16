import type { Metadata } from 'next'

import { LoginForm } from '@/components/features/login-form'
import { PageShell } from '@/components/site/page-shell'
import { EVENT } from '@/lib/config'

export const metadata: Metadata = {
  title: `Team Login — ${EVENT.name}`,
  description:
    'Sign in or create your team account to browse problem statements, submit your deck, and track your standing.',
}

export default function LoginPage() {
  return (
    <PageShell>
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-4 py-16 sm:px-6">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* Left: build-log narrative panel */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-primary/60" />
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                {EVENT.name} / access
              </span>
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-balance">
              One login. Everything you need to ship.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
              Your team workspace tracks the whole build: problem statement, team
              roster, submission status, and where you stand on the leaderboard.
            </p>

            <ul className="mt-8 flex flex-col gap-3 font-mono text-sm">
              {[
                'Select a problem statement from the open tracks',
                'Submit and replace your pitch deck any time before the deadline',
                'Follow your progress and live leaderboard rank',
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground text-pretty">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: form */}
          <LoginForm />
        </div>
      </section>
    </PageShell>
  )
}
