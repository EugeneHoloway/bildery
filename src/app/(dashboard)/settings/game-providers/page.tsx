'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'

export default function GameProvidersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Organization settings', href: '/settings/operators-brands' },
          { label: 'Games Providers' },
        ]}
      />

      <div className="flex flex-1 flex-col px-6 pt-4 pb-8">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-semibold">Games Providers</h1>
          <p className="mt-6 text-sm text-muted-foreground">Coming soon.</p>
        </div>
      </div>
    </>
  )
}
