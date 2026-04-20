import type { Metadata } from 'next'
import { SandboxCard, type SandboxCardData } from '@/components/SandboxCard'

export const metadata: Metadata = {
  title: 'Sandbox',
  description: 'Work-in-progress projects, test tasks, and exploratory documents.',
}

// ─── Data ────────────────────────────────────────────────────────────────────

const techCards: SandboxCardData[] = [
  {
    id: 'liki24',
    tag: 'PM Task (PRD, logic, calc)',
    title: 'Autoship & Save | Liki24',
    description:
      'ROI-positive retention initiative for a marketplace. Covers initiative selection, target segment, LTV hypothesis, UX flow, ROI model, risk assessment, and A/B test design.',
    status: 'ROI Positive',
    platform: 'Web + App',
    sections: 8,
    href: '/sandbox/liki24',
  },
  {
    id: 'tips',
    tag: 'PM Task (MVP, calc)',
    title: 'Expert Rating System | Tips',
    description:
      'Expert Rating System for sports portal. Rating algorythm approach, Baessyan model calc, exceptions and edge cases.',
    status: 'Approved',
    platform: 'Web + App',
    sections: 8,
    href: '/sandbox/tips',
  },
  {
    id: 'enable3',
    tag: 'PM Task (RR, segmentation)',
    title: 'Shopify Growth Loop | Enable3',
    description:
      'Mission-driven loyalty template for Shopify merchants. Covers ecosystem challenges, behavioral mechanics, mission categories, RFM segmentation, reward structure, and merchant value communication.',
    status: 'Mission-Driven',
    platform: 'Shopify',
    sections: 5,
    href: '/sandbox/enable3',
  },
  {
    id: 'subsub',
    tag: 'PM Task (Growth)',
    title: '1K Signups, 0 Revenue | SubSub',
    description:
      'Growth PM diagnosis and 90-day plan for SubSub: a YouTube creator monetization platform. Covers funnel analysis, activation gap, hypothesis prioritization, unit economics, and experiment roadmap.',
    status: 'Growth Plan',
    platform: 'Web',
    sections: 6,
    href: '/sandbox/subsub',
  },
]

const marketCards: SandboxCardData[] = [
  {
    id: 'stm',
    tag: 'STM (Share analysis)',
    title: 'STM · EBITDA and other details (Feb. 2026)',
    description:
      'Gross margin, performance, EBITDA, Revenue, rating summary and price target scenarios.',
    status: 'Draft',
    platform: 'Web + App',
    sections: 9,
    href: '/sandbox/stm',
  },
]

const mockupCards: SandboxCardData[] = [
  {
    id: 'mockup-pages',
    tag: 'iGaming Backoffice (mockup)',
    title: 'Page manager · BetUp',
    description:
      'Create, hide and delete custom pages. Includes Game Providers page with logo grid, layout toggle and per-page settings.',
    status: 'Concept',
    platform: 'Web',
    sections: 2,
    href: '/sandbox/mockup-pages',
  },
  {
    id: 'mockup-homepage',
    tag: 'iGaming Backoffice (mockup)',
    title: 'Homepage configurator · BetUp',
    description:
      'Page section manager for iGaming operator backoffice. Banner slider, game sections (auto/manual), providers row, live bets feed and SEO text.',
    status: 'Concept',
    platform: 'Web',
    sections: 3,
    href: '/sandbox/mockup-homepage',
  },
  {
    id: 'mockup-seo',
    tag: 'iGaming Backoffice (mockup)',
    title: 'SEO editor · BetUp',
    description:
      'Per-page SEO tab: H1, title tag, meta description with live SERP preview, Open Graph, advanced settings and audit checklist.',
    status: 'Concept',
    platform: 'Web',
    sections: 4,
    href: '/sandbox/mockup-seo',
  },
  {
    id: 'analytics',
    tag: 'iGaming Backoffice (mockup)',
    title: 'Analytics Dashboard · BetUp',
    description:
      'Operator analytics prototype with live Supabase data. Revenue GGR/NGR, deposits & withdrawals, top games by hold %, and player segmentation by VIP tier.',
    status: 'Live Data',
    platform: 'Web',
    sections: 4,
    href: '/sandbox/analytics',
  },
  {
    id: 'revenue-intelligence',
    tag: 'iGaming (AI prototype)',
    title: 'AI Revenue Intelligence · Depo44',
    description:
      'Enter 9 operator KPIs — FTD rate, churn, bonus ROI, payment success — and get AI-generated revenue health scores, risk assessment, and prioritized actions.',
    status: 'AI Prototype',
    platform: 'Web',
    sections: 1,
    href: '/sandbox/revenue-intelligence',
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
      <h2 className="mb-4 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
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

export default function SandboxPage() {
  return (
    <div className="py-12 pb-20">
      <div className="mx-auto max-w-[1240px] px-4 tablet:px-4">

        {/* Page header */}
        <div className="mb-10">
          <h1 className="mb-2 text-[2rem] font-bold tracking-[-0.03em]">
            Sandbox
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Work-in-progress projects, test tasks, and exploratory documents.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          <SandboxSection title="Tech tasks" cards={techCards} />
          <SandboxSection title="Markets" cards={marketCards} />
          <SandboxSection title="Mockups" cards={mockupCards} />
        </div>

      </div>
    </div>
  )
}
