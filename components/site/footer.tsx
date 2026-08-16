import { AtSign, Code, Globe, Send } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { EVENT } from '@/lib/config'

const QUICK_LINKS = [
  { href: '/problem-statements', label: 'Problem Statements' },
  { href: '/event', label: 'Event Details' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/login', label: 'Login' },
]

const SOCIALS = [
  { icon: Send, label: 'Twitter / X', href: EVENT.social.twitter },
  { icon: Code, label: 'GitHub', href: EVENT.social.github },
  { icon: AtSign, label: 'Instagram', href: EVENT.social.instagram },
  { icon: Globe, label: 'LinkedIn', href: EVENT.social.linkedin },
]

export function Footer() {
  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-foreground/5">
                <Image
                  src="/college-logo.png"
                  alt="Siddhant College of Engineering crest"
                  width={44}
                  height={44}
                  className="size-full object-contain p-1"
                />
              </span>
              <span className="font-display text-sm font-bold tracking-widest uppercase">
                {EVENT.name} / SCOE
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {EVENT.fullName}. Organized by {EVENT.college}. {EVENT.tagline}.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Contact
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  href={`mailto:${EVENT.contact.email}`}
                  className="transition-colors hover:text-foreground"
                >
                  {EVENT.contact.email}
                </a>
              </li>
              <li>{EVENT.contact.phone}</li>
              <li>{EVENT.details.venue}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {EVENT.name}. All rights reserved.
          </p>
          <p className="font-mono tracking-wide">
            {EVENT.college}
          </p>
        </div>
      </div>
    </footer>
  )
}
