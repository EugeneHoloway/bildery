'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

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
      {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}

interface BreadcrumbEntry {
  label: string
  href?: string
}

interface DashboardHeaderProps {
  breadcrumbs: BreadcrumbEntry[]
  right?: React.ReactNode
}

export function DashboardHeader({ breadcrumbs, right }: DashboardHeaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0, rootMargin: '0px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Zero-height sentinel: when it leaves viewport, header gets border + blur */}
      <div ref={sentinelRef} className="h-0 w-full" aria-hidden="true" />

      <header
        className={cn(
          'sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2',
          'transition-[border-color,background-color,backdrop-filter] duration-150 ease-in-out',
          'group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
          scrolled
            ? 'border-b border-border bg-background/80 backdrop-blur-md'
            : 'bg-background',
        )}
      >
        <div className="flex flex-1 items-center gap-2 px-4 group-has-data-[collapsible=icon]/sidebar-wrapper:px-2">
          <SidebarTrigger className="-ml-1 group-has-data-[collapsible=icon]/sidebar-wrapper:ml-0" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1
                return (
                  <Fragment key={i}>
                    {i > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    <BreadcrumbItem className={!isLast ? 'hidden md:block' : undefined}>
                      {isLast
                        ? <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        : <BreadcrumbLink href={crumb.href ?? '#'}>{crumb.label}</BreadcrumbLink>
                      }
                    </BreadcrumbItem>
                  </Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-1">
            {right}
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  )
}
