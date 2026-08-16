'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { EVENT } from '@/lib/config'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/use-auth'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/problem-statements', label: 'Problem Statements' },
  { href: '/event', label: 'Event' },
  { href: '/rankings', label: 'Rankings' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { userId, role } = useAuth()
  const session = !!userId
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const dashboardHref =
    role === 'judge' ? '/dashboard/judge' :
    role === 'admin' ? '/dashboard/admin' :
    '/dashboard/team'

  const handleLogout = async () => {
    setOpen(false)
    await createClient()?.auth.signOut()
    router.push('/')
    router.refresh()
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu on route change.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border glass'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-foreground/5">
            <Image
              src="/college-logo.png"
              alt="Siddhant College of Engineering crest"
              width={36}
              height={36}
              className="size-full object-contain p-0.5"
              priority
            />
          </span>
          <span className="font-display text-sm font-bold tracking-widest uppercase">
            {EVENT.name}
            <span className="text-muted-foreground"> / SCOE</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'relative rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-md bg-muted/70"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <>
              <ButtonLink
                variant="outline"
                size="lg"
                className="h-10 border-primary/30 px-4 text-sm hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                href={dashboardHref}
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </ButtonLink>
              <Button
                variant="ghost"
                size="lg"
                aria-label="Log out"
                className="h-10 px-3 text-sm text-muted-foreground hover:text-foreground"
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <ButtonLink
              variant="outline"
              size="lg"
              className="h-10 border-primary/30 px-5 text-sm hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
              href="/login"
            >
              Login
            </ButtonLink>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-lg border border-border text-foreground md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-b border-border glass md:hidden"
          >
            <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'block rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                      isActive(link.href)
                        ? 'bg-muted/70 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2">
                {session ? (
                  <div className="flex flex-col gap-2">
                    <ButtonLink
                      size="lg"
                      className="h-11 w-full text-sm"
                      href={dashboardHref}
                    >
                      <LayoutDashboard className="size-4" />
                      Team Dashboard
                    </ButtonLink>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-11 w-full text-sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="size-4" />
                      Log out
                    </Button>
                  </div>
                ) : (
                  <ButtonLink
                    size="lg"
                    className="h-11 w-full text-sm"
                    href="/login"
                  >
                    Login
                  </ButtonLink>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
