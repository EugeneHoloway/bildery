'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const items = [
  { label: 'Profile', href: '/profile' },
  { label: 'Account', href: '/account' },
  { label: 'Billing', href: '/billing' },
  { label: 'Notifications', href: '/notifications' },
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile: horizontal scrollable line nav */}
      <nav className="flex sm:hidden overflow-x-auto border-b border-border">
        {items.map(({ label, href }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'shrink-0 px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                active
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Desktop: vertical nav */}
      <nav className="hidden sm:flex flex-col gap-0.5 w-44 shrink-0">
        {items.map(({ label, href }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                active
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
