import type { ReactNode } from 'react'

import { Footer } from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'

export function PageShell({
  children,
  hideFooter = false,
}: {
  children: ReactNode
  hideFooter?: boolean
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Fixed technical grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-grid bg-grid-fade opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,oklch(0.74_0.15_150/0.09),transparent_70%)]"
      />
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  )
}
