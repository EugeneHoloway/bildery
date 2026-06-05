'use client'

import { useState } from 'react'
import { Activity, ChevronDown, PackageOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SandboxCard, type SandboxCardData, type CardStatus } from '@/components/SandboxCard'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ─── Data (newest first) ─────────────────────────────────────────────────────

const cards: SandboxCardData[] = [
  {
    id: 'lemon',
    tag: 'Tech Task',
    title: 'Vetting Flow Iteration',
    description:
      "PM test task for Lemon.io. Problem inventory, root-cause of Mark’s 50% false-positive rate, and a 4-week rubric hardening plan.",
    cardStatus: 'Done',
    sections: 4,
    href: '/sandbox/vetting-flow',
    highlight: {
      label: 'Deliverables:',
      bullets: [
        'Problem inventory (8 issues ranked)',
        'Root cause & chain of reasoning',
        '4-week hardening plan',
      ],
    },
    languages: ['EN'],
  },
  {
    id: 'payment-infra',
    tag: 'Prototype',
    title: 'Payment Infra',
    description: '',
    cardStatus: 'Done',
    sections: 5,
    href: '/sandbox/payment-infra',
    highlight: {
      label: 'Deliverables:',
      bullets: [
        'Overview',
        'Delivery phases',
        'Deep dive',
      ],
    },
    languages: ['EN', 'UA'],
  },
  {
    id: 'brand-canvas',
    tag: 'Prototype',
    title: 'Brand Canvas',
    description: '',
    cardStatus: 'In progress',
    sections: 0,
    href: '/sandbox/brand-canvas',
    highlight: {
      label: 'Covers:',
      bullets: [
        'Brand positioning & value prop',
        'Visual identity & tone of voice',
        'Audience segments & messaging',
      ],
    },
    languages: ['EN'],
  },
  {
    id: 'buki',
    tag: 'Tech Task',
    title: 'Product Audit',
    description: 'Funnel audit, growth strategy, and 6-month roadmap for BUKI.',
    cardStatus: 'Done',
    sections: 4,
    href: '/sandbox/buki',
    highlight: {
      label: 'Deliverables:',
      bullets: [
        'Funnel audit & conversion drop',
        'Growth hypotheses, prioritized',
        '6-month execution roadmap',
      ],
    },
    languages: ['EN', 'UA'],
  },
  {
    id: 'liki24',
    tag: 'Tech Task',
    title: 'Autoship & Save',
    description:
      'ROI-positive retention initiative for a marketplace. Covers initiative selection, target segment, LTV hypothesis, UX flow, ROI model, risk assessment, and A/B test design.',
    cardStatus: 'Done',
    sections: 8,
    href: '/sandbox/liki24',
    highlight: {
      label: 'Deliverables:',
      bullets: [
        'Initiative & target segment',
        'LTV hypothesis & ROI model',
        'A/B test design',
      ],
    },
    languages: ['EN'],
  },
  {
    id: 'tips',
    tag: 'Tech Task',
    title: 'Expert Rating System',
    description:
      'Expert Rating System for sports portal. Rating algorythm approach, Baessyan model calc, exceptions and edge cases.',
    cardStatus: 'Done',
    sections: 8,
    href: '/sandbox/tips',
    highlight: {
      label: 'Deliverables:',
      bullets: [
        'Rating algorithm design',
        'Bayesian model calculation',
        'Edge cases & exceptions',
      ],
    },
    languages: ['EN', 'UA'],
  },
  {
    id: 'enable3',
    tag: 'Tech Task',
    title: 'Shopify Growth Loop',
    description:
      'Mission-driven loyalty template for Shopify merchants. Covers ecosystem challenges, behavioral mechanics, mission categories, RFM segmentation, reward structure, and merchant value communication.',
    cardStatus: 'Done',
    sections: 5,
    href: '/sandbox/enable3',
    highlight: {
      label: 'Deliverables:',
      bullets: [
        'Behavioral loyalty mechanics',
        'RFM segmentation & rewards',
        'Merchant value communication',
      ],
    },
    languages: ['EN'],
  },
  {
    id: 'subsub',
    tag: 'Tech Task',
    title: '1K Signups, 0 Revenue',
    description:
      'Growth PM diagnosis and 90-day plan for SubSub: a YouTube creator monetization platform. Covers funnel analysis, activation gap, hypothesis prioritization, unit economics, and experiment roadmap.',
    cardStatus: 'Done',
    sections: 6,
    href: '/sandbox/subsub',
    highlight: {
      label: 'Deliverables:',
      bullets: [
        'Funnel & activation gap analysis',
        'Hypothesis prioritization',
        '90-day experiment roadmap',
      ],
    },
    languages: ['EN'],
  },
  {
    id: 'stm',
    tag: 'Markets',
    title: 'STM Analysis',
    description:
      'Gross margin, performance, EBITDA, Revenue, rating summary and price target scenarios.',
    cardStatus: 'In progress',
    sections: 9,
    href: '/sandbox/stm',
    highlight: {
      label: 'Covers:',
      bullets: [
        'Gross margin & EBITDA metrics',
        'Performance & revenue analysis',
        'Price target scenarios',
      ],
    },
    languages: ['EN'],
  },
  {
    id: 'homepage-configurator',
    tag: 'Prototype',
    title: 'Homepage Configurator',
    description:
      'Page section manager for iGaming operator backoffice. Banner slider, game sections (auto/manual), providers row, live bets feed and SEO text.',
    cardStatus: 'Done',
    sections: 3,
    href: '/sandbox/homepage-configurator',
    highlight: {
      label: 'Covers:',
      bullets: [
        'Banner & game section manager',
        'Providers row & live bets feed',
        'SEO text per page',
      ],
    },
    languages: ['EN'],
  },
  {
    id: 'page-manager',
    tag: 'Prototype',
    title: 'Page Manager',
    description:
      'Create, hide and delete custom pages. Includes Game Providers page with logo grid, layout toggle and per-page settings.',
    cardStatus: 'Done',
    sections: 2,
    href: '/sandbox/page-manager',
    highlight: {
      label: 'Covers:',
      bullets: [
        'Create, hide & delete pages',
        'Game Providers logo grid',
        'Per-page layout settings',
      ],
    },
    languages: ['EN'],
  },
  {
    id: 'seo-editor',
    tag: 'Prototype',
    title: 'SEO Editor',
    description:
      'Per-page SEO tab: H1, title tag, meta description with live SERP preview, Open Graph, advanced settings and audit checklist.',
    cardStatus: 'Done',
    sections: 4,
    href: '/sandbox/seo-editor',
    highlight: {
      label: 'Covers:',
      bullets: [
        'H1, title & meta description',
        'Live SERP preview',
        'Open Graph & audit checklist',
      ],
    },
    languages: ['EN'],
  },
  {
    id: 'analytics',
    tag: 'Analytics',
    title: 'Analytics Dashboard',
    description:
      'Operator analytics prototype with live Supabase data. Revenue GGR/NGR, deposits & withdrawals, top games by hold %, and player segmentation by VIP tier.',
    cardStatus: 'Done',
    sections: 4,
    href: '/sandbox/analytics',
    highlight: {
      label: 'Covers:',
      bullets: [
        'Revenue GGR/NGR & deposits',
        'Top games by hold %',
        'VIP player segmentation',
      ],
    },
    languages: ['EN'],
  },
  {
    id: 'revenue-intelligence',
    tag: 'Analytics',
    title: 'AI Revenue Intelligence',
    description:
      'Enter 9 operator KPIs - FTD rate, churn, bonus ROI, payment success - and get AI-generated revenue health scores, risk assessment, and prioritized actions.',
    cardStatus: 'Done',
    sections: 1,
    href: '/sandbox/revenue-intelligence',
    highlight: {
      label: 'Covers:',
      bullets: [
        '9 KPI inputs & health scores',
        'AI risk assessment',
        'Prioritized action plan',
      ],
    },
    languages: ['EN'],
  },
  {
    id: 'rocketman',
    tag: 'Game',
    title: 'Rocketman',
    description:
      'A crash game with a space theme. Rocket flies higher -- multiplier grows. Cash out before it explodes. Three modes: Orbit (×10), Moon (×50), Mars (×100). Built with provably fair RNG.',
    cardStatus: 'In progress',
    sections: 1,
    href: '/sandbox/rocketman',
    highlight: {
      label: 'Features:',
      bullets: [
        'Three modes: Orbit, Moon, Mars',
        'Growing multiplier mechanic',
        'Provably fair RNG',
      ],
    },
    languages: ['EN'],
  },
]

// ─── Sections helper ─────────────────────────────────────────────────────────

function SandboxSection({
  title,
  cards,
}: {
  title: string
  cards: SandboxCardData[]
}) {
  return (
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-label text-muted-foreground">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        {cards.map((card) => (
          <SandboxCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { key: 'all',        label: 'All' },
  { key: 'Tech Task',  label: 'Tech Task' },
  { key: 'Analytics',  label: 'Analytics' },
  { key: 'Markets',    label: 'Markets' },
  { key: 'Prototype',  label: 'Prototype' },
  { key: 'Game',       label: 'Game' },
]

const STATUS_OPTIONS: { key: CardStatus | 'all'; label: string }[] = [
  { key: 'all',         label: 'All statuses' },
  { key: 'Initiated',   label: 'Initiated' },
  { key: 'In progress', label: 'In progress' },
  { key: 'Done',        label: 'Done' },
]

export default function SandboxPage() {
  const [filter, setFilter]       = useState('all')
  const [statusFilter, setStatus] = useState<CardStatus | 'all'>('all')

  const visibleCards = cards.filter(card =>
    (filter === 'all' || card.tag === filter) &&
    (statusFilter === 'all' || card.cardStatus === statusFilter)
  )

  const currentStatusLabel = STATUS_OPTIONS.find(o => o.key === statusFilter)?.label ?? 'Status'

  return (
    <div className="py-12 pb-20">
      <div className="mx-auto max-w-screen-xl px-4">

        {/* Page header */}
        <div className="mb-10">
          <h1 className="mb-2 text-xl font-bold tracking-heading">
            Sandbox
          </h1>
          <p className="mb-4 text-base leading-relaxed text-muted-foreground">
            Work-in-progress projects, test tasks, and exploratory documents.
          </p>

          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-foreground">Filter</span>
              <div className="flex gap-1.5 flex-wrap">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setFilter(opt.key)}
                  className={cn(
                    'px-2.5 py-1 rounded-md border text-xs font-semibold transition-all',
                    filter === opt.key
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-transparent text-muted-foreground border-border hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
              </div>
            </div>

            {/* Status dropdown */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-foreground">Status</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  'flex w-36 items-center justify-between gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-all',
                  statusFilter !== 'all'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-muted-foreground border-border hover:text-foreground',
                )}>
                  <Activity className="size-3.5" />
                  <span className="whitespace-nowrap">{statusFilter === 'all' ? 'All statuses' : currentStatusLabel}</span>
                  <ChevronDown className="size-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-36">
                {STATUS_OPTIONS.map(opt => (
                  <DropdownMenuItem
                    key={opt.key}
                    onSelect={() => setStatus(opt.key)}
                    className={cn(
                      'text-xs',
                      statusFilter === opt.key && 'font-semibold',
                    )}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </div>

        {visibleCards.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
            {visibleCards.map((card) => (
              <SandboxCard key={card.id} card={card} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-xl bg-muted">
              <PackageOpen className="size-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No cards found</p>
            <p className="text-sm text-muted-foreground">
              No projects match the selected filters.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
