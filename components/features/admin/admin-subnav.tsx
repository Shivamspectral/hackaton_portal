'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const TABS = [
  { href: '/dashboard/admin', label: 'Overview' },
  { href: '/dashboard/admin/problem-statements', label: 'Problem Statements' },
  { href: '/dashboard/admin/teams', label: 'Teams' },
  { href: '/dashboard/admin/users', label: 'Users' },
]

export function AdminSubnav() {
  const pathname = usePathname()

  return (
    <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
      {TABS.map((tab) => {
        const active =
          tab.href === '/dashboard/admin' ? pathname === tab.href : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
              active
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
