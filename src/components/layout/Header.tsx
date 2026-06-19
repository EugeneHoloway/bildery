'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sun, Moon, Menu, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/AuthProvider'
import { AuthDialog } from '@/components/auth/AuthDialog'

const navItems = [
  { label: 'Tasks',   href: '/tasks' },
  { label: 'Docs',    href: '/docs' },
  { label: 'Sandbox', href: '/sandbox' },
  { label: 'About',   href: '/about' },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="size-8" />

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark'
        ? <Sun className="size-4" />
        : <Moon className="size-4" />
      }
    </Button>
  )
}

function AuthButtons() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'login' | 'signup'>('login')

  if (loading) return <div className="w-20 h-8" />

  if (user) {
    return (
      <Button variant="ghost" size="icon" aria-label="Dashboard" onClick={() => router.push('/dashboard')}>
        <User className="size-4" />
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="lg"
        onClick={() => { setDialogMode('login'); setDialogOpen(true) }}
      >
        Login
      </Button>
      <Button
        variant="default"
        size="lg"
        onClick={() => { setDialogMode('signup'); setDialogOpen(true) }}
      >
        Sign up
      </Button>
      <AuthDialog
        open={dialogOpen}
        mode={dialogMode}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[100]',
          'h-16 desktop:h-[72px]',
          'border-b border-border',
          'bg-background/85 backdrop-blur-md',
        )}
      >
        <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between gap-6 px-4">

          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-semibold tracking-display text-foreground"
          >
            Bildery
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 tablet:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  isActive(item.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <div className="hidden items-center gap-1 tablet:flex">
              <AuthButtons />
            </div>

            {/* Burger — mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="tablet:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen
                ? <X className="size-5" />
                : <Menu className="size-5" />
              }
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        className={cn(
          'fixed inset-x-0 bottom-0 top-16 z-[90]',
          'flex flex-col bg-background px-6 pt-8',
          'transition-[opacity,transform] duration-[220ms] ease-[ease]',
          menuOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0',
          'tablet:hidden',
        )}
      >
        <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'border-b border-border py-3',
                'text-sm font-medium',
                'transition-colors duration-150',
                isActive(item.href)
                  ? 'text-muted-foreground'
                  : 'text-foreground hover:text-muted-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
