'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Tasks', href: '/tasks' },
  { label: 'Docs', href: '/docs' },
  { label: 'Sandbox', href: '/sandbox' },
  { label: 'About', href: '/about' },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-8 w-8" />

  return (
    <button
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Close menu on route change
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
        {/* Inner: container + flex row */}
        <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between gap-6 px-4 tablet:px-4">

          {/* Logo */}
          <Link
            href="/"
            className="text-[1.125rem] font-semibold tracking-[-0.03em] text-foreground"
          >
            Bildery
          </Link>

          {/* Desktop nav — hidden on mobile, flex on tablet+ */}
          <nav className="hidden items-center gap-8 tablet:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'text-[0.95rem] font-medium transition-colors duration-200',
                  isActive(item.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side: theme toggle + burger */}
          <div className="flex items-center gap-1">
            <ThemeToggle />

            {/* Burger — mobile only, hidden on tablet+ */}
            <button
              className="flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-[5px] p-1 tablet:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span
                className={cn(
                  'block h-[1.5px] w-full origin-center rounded-[2px] bg-foreground transition-all duration-[250ms] ease-[ease]',
                  menuOpen && 'translate-y-[6.5px] rotate-45',
                )}
              />
              <span
                className={cn(
                  'block h-[1.5px] w-full origin-center rounded-[2px] bg-foreground transition-all duration-200',
                  menuOpen && 'scale-x-0 opacity-0',
                )}
              />
              <span
                className={cn(
                  'block h-[1.5px] w-full origin-center rounded-[2px] bg-foreground transition-all duration-[250ms] ease-[ease]',
                  menuOpen && '-translate-y-[6.5px] -rotate-45',
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer — sibling of header, outside its stacking context */}
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
                'border-b border-border py-[10px]',
                'text-2xl font-semibold tracking-[-0.03em]',
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
