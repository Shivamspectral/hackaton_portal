import type { ReactNode } from 'react'

import { AdminSubnav } from '@/components/features/admin/admin-subnav'
import { PageShell } from '@/components/site/page-shell'
import { requireRole } from '@/lib/supabase/require-role'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Server-side role boundary — redirects to /staff-login when signed out,
  // or to the caller's own dashboard when signed in with the wrong role.
  // RLS is the final backstop behind every read/write these pages trigger.
  await requireRole('admin')

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="tracking-widest uppercase">admin console</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Event Control
        </h1>
        <AdminSubnav />
        <div className="mt-8">{children}</div>
      </section>
    </PageShell>
  )
}
