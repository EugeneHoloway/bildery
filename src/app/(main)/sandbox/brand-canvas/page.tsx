'use client'

import type { ElementType } from 'react'
import { ChevronRight, Crown, Gift, RotateCcw } from 'lucide-react'
import { DocLayout } from '@/components/doc/DocLayout'
import { AuthModals } from './_components/auth-modals'
import { TopicsNav } from './_components/topics-nav'
import { TrendingList } from './_components/trending-list'
import { OnboardingSection } from './_components/onboarding-section'

// ─── Category card ────────────────────────────────────────────────────────────

function CategoryCard({
  icon: Icon,
  label,
  iconClassName = '',
}: {
  icon: ElementType
  label: string
  iconClassName?: string
}) {
  return (
    <button className="group flex h-16 w-full cursor-pointer items-center gap-3 rounded-2xl border border-border px-5 shadow-card transition-all duration-200 hover:border-subtle-border hover:shadow-card-hover">
      <Icon className={`size-5 shrink-0 ${iconClassName}`} />
      <span className="flex-1 font-display text-xl font-medium text-foreground">{label}</span>
      <ChevronRight className={`size-5 shrink-0 transition-transform duration-200 group-hover:animate-chevron-nudge ${iconClassName}`} />
    </button>
  )
}

// ─── Layout placeholders ──────────────────────────────────────────────────────

function Placeholder({ className = '', label }: { className?: string; label?: string }) {
  return (
    <div className={`rounded-2xl border border-border shadow-card transition-all duration-200 hover:border-subtle-border hover:shadow-card-hover flex items-center justify-center ${className}`}>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  )
}

// ─── Page sections ────────────────────────────────────────────────────────────

function MainContent() {
  return (
    <div className="flex flex-col gap-4">
      <Placeholder className="min-h-[340px]" label="Featured market card" />
      <OnboardingSection />
    </div>
  )
}

function Sidebar() {
  return (
    <div className="flex flex-col gap-3">
      <CategoryCard icon={Gift}      label="Promotions" iconClassName="text-warning" />
      <CategoryCard icon={RotateCcw} label="Cashback"   iconClassName="text-success" />
      <CategoryCard icon={Crown}     label="VIP Club"   iconClassName="text-brand"   />
      <TrendingList />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <AuthModals />
      <DocLayout
        title="Brand Canvas"
        breadcrumbLabel="Sandbox"
        breadcrumbHref="/sandbox"
        tags={[
          { label: 'Prototype', type: 'tag' },
          { label: 'iGaming',   type: 'tag' },
        ]}
        description="Main page prototype"
      >
        <TopicsNav />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <MainContent />
          <Sidebar />
        </div>
      </DocLayout>
    </>
  )
}
