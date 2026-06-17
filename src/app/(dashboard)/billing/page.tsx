'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from '@/components/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SettingsNav } from '@/components/settings/SettingsNav'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

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

export default function BillingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader
          breadcrumbs={[
            { label: 'Bildery', href: '/dashboard' },
            { label: 'Billing' },
          ]}

        />

        <div className="flex flex-1 flex-col px-6 pt-4 pb-8">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account settings and set preferences.
            </p>
          </div>

          <Separator className="mt-6" />

          <div className="mt-6 flex flex-col sm:flex-row sm:gap-10">
            <SettingsNav />

            <div className="flex-1 mt-4 sm:mt-0 max-w-lg">
              <h2 className="text-xl font-semibold">Billing</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your subscription and payment methods.
              </p>

              <p className="mt-8 text-sm text-muted-foreground">Coming soon.</p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
