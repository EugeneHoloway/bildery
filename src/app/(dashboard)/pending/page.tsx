'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'

export default function PendingPage() {
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
          { label: 'Bildery', href: '/dashboard' },
          { label: 'Customer Support', href: '/all-conversations' },
          { label: 'Pending' },
        ]}
      />
      <div className="flex flex-1 flex-col px-6 pt-4 pb-8">
        <h1 className="text-2xl font-semibold">Pending</h1>
        <p className="mt-1 text-sm text-muted-foreground">Coming soon.</p>
      </div>
    </>
  )
}
