'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardCheck, FileText, Layers, Info, LogIn, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/AuthProvider'
import { AuthDialog } from '@/components/auth/AuthDialog'

const navItems = [
  { label: 'Bildery',  href: '/',        icon: Home },
  { label: 'Tasks',    href: '/tasks',   icon: ClipboardCheck },
  { label: 'Docs',     href: '/docs',    icon: FileText },
  { label: 'Sandbox',  href: '/sandbox', icon: Layers },
  { label: 'About',    href: '/about',   icon: Info },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <nav
        className={cn(
          'fixed inset-x-0 bottom-0 z-[100]',
          'flex h-[60px] items-center',
          'border-t border-border bg-background/90 backdrop-blur-md',
          'tablet:hidden',
        )}
        aria-label="Bottom navigation"
      >
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-[3px]',
              'transition-colors duration-150',
              isActive(href)
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-[22px]" strokeWidth={1.75} />
            <span className="text-xs font-medium leading-none">{label}</span>
          </Link>
        ))}

        {user ? (
          <Link
            href="/dashboard"
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-[3px]',
              'transition-colors duration-150',
              isActive('/dashboard')
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <User className="size-[22px]" strokeWidth={1.75} />
            <span className="text-xs font-medium leading-none">Account</span>
          </Link>
        ) : (
          <button
            onClick={() => setDialogOpen(true)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-[3px]',
              'transition-colors duration-150 text-muted-foreground hover:text-foreground',
            )}
          >
            <LogIn className="size-[22px]" strokeWidth={1.75} />
            <span className="text-xs font-medium leading-none">Login</span>
          </button>
        )}
      </nav>

      <AuthDialog open={dialogOpen} mode="login" onOpenChange={setDialogOpen} />
    </>
  )
}
