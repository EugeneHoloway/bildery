'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

// ── helpers ────────────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      Live
    </span>
  )
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-3xl font-semibold tabular-nums">{value}</span>
    </div>
  )
}

// ── Heatmap ────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => i)

const DAYS = [
  { label: 'Saturday', date: 'Jun 13, 2026' },
  { label: 'Sunday', date: 'Jun 14, 2026' },
  { label: 'Monday', date: 'Jun 15, 2026' },
  { label: 'Tuesday', date: 'Jun 16, 2026' },
  { label: 'Wednesday', date: 'Jun 17, 2026' },
  { label: 'Thursday', date: 'Jun 18, 2026' },
  { label: 'Friday', date: 'Jun 19, 2026' },
]

function Heatmap() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        {/* rows */}
        <div className="flex flex-col gap-0.5">
          {DAYS.map((day) => (
            <div key={day.date} className="flex items-center gap-2">
              {/* day label */}
              <div className="w-28 shrink-0 text-right">
                <div className="text-xs font-medium">{day.label}</div>
                <div className="text-xs text-muted-foreground">{day.date}</div>
              </div>
              {/* cells */}
              <div className="flex flex-1 gap-0.5">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="h-8 flex-1 rounded-sm bg-muted hover:bg-muted/70 transition-colors cursor-default"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* hour labels */}
        <div className="mt-1 flex gap-2 pl-[7.5rem]">
          <div className="flex flex-1 gap-0.5">
            {HOURS.map((h) => (
              <div key={h} className="flex-1 text-center text-xs text-muted-foreground">
                {h}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ReportsPage() {
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
          { label: 'Reports', href: '/reports' },
          { label: 'Overview' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-8">
        <h1 className="text-2xl font-semibold">Overview</h1>

        {/* top cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Open Conversations */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="text-lg font-semibold">Open Conversations</span>
              <LiveBadge />
            </div>
            <div className="flex gap-8">
              <StatBlock label="Open" value={0} />
              <StatBlock label="Unassigned" value={0} />
              <StatBlock label="Pending" value={0} />
            </div>
          </div>

          {/* Agent status */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="text-lg font-semibold">Agent status</span>
              <LiveBadge />
            </div>
            <div className="flex gap-8">
              <StatBlock label="Online" value={1} />
              <StatBlock label="Busy" value={0} />
              <StatBlock label="Offline" value={0} />
            </div>
          </div>
        </div>

        {/* Conversation Traffic */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Conversation Traffic</span>
              <LiveBadge />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Last 7 days</Button>
              <Button variant="outline" size="sm">All Inboxes</Button>
              <Button variant="outline" size="icon-sm">
                <Download className="size-4" />
              </Button>
            </div>
          </div>
          <Heatmap />
        </div>
      </div>
    </>
  )
}
