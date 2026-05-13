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
    tag: 'PM Task',
    title: 'Autoship & Save',
    description:
      'ROI-positive retention initiative for a marketplace. Covers initiative selection, target segment, LTV hypothesis, UX flow, ROI model, risk assessment, and A/B test design.',
    status: 'Liki24',

    sections: 8,
    href: '/sandbox/liki24',
  },
  {
    id: 'tips',
    tag: 'PM Task',
    title: 'Expert Rating System',
    description:
      'Expert Rating System for sports portal. Rating algorythm approach, Baessyan model calc, exceptions and edge cases.',
    status: 'Tips',

    sections: 8,
    href: '/sandbox/tips',
  },
  {
    id: 'enable3',
    tag: 'PM Task',
    title: 'Shopify Growth Loop',
    description:
      'Mission-driven loyalty template for Shopify merchants. Covers ecosystem challenges, behavioral mechanics, mission categories, RFM segmentation, reward structure, and merchant value communication.',
    status: 'Enable3',

    sections: 5,
    href: '/sandbox/enable3',
  },
  {
    id: 'subsub',
    tag: 'PM Task',
    title: '1K Signups, 0 Revenue',
    description:
      'Growth PM diagnosis and 90-day plan for SubSub: a YouTube creator monetization platform. Covers funnel analysis, activation gap, hypothesis prioritization, unit economics, and experiment roadmap.',
    status: 'SubSub',

    sections: 6,
    href: '/sandbox/subsub',
  },
]

const marketCards: SandboxCardData[] = [
  {
    id: 'stm',
    tag: 'STM',
    title: 'EBITDA and other details',
    description:
      'Gross margin, performance, EBITDA, Revenue, rating summary and price target scenarios.',
    status: 'Feb. 2026',

    sections: 9,
    href: '/sandbox/stm',
  },
]

const mockupCards: SandboxCardData[] = [
  {
    id: 'homepage-configurator',
    tag: 'iGaming Backoffice',
    title: 'Homepage configurator',
    description:
      'Page section manager for iGaming operator backoffice. Banner slider, game sections (auto/manual), providers row, live bets feed and SEO text.',
    status: 'BetUp',

    sections: 3,
    href: '/sandbox/homepage-configurator',
  },
  {
    id: 'page-manager',
    tag: 'iGaming Backoffice',
    title: 'Page manager',
    description:
      'Create, hide and delete custom pages. Includes Game Providers page with logo grid, layout toggle and per-page settings.',
    status: 'BetUp',

    sections: 2,
    href: '/sandbox/page-manager',
  },
  {
    id: 'seo-editor',
    tag: 'iGaming Backoffice',
    title: 'SEO editor',
    description:
      'Per-page SEO tab: H1, title tag, meta description with live SERP preview, Open Graph, advanced settings and audit checklist.',
    status: 'BetUp',

    sections: 4,
    href: '/sandbox/seo-editor',
  },
  {
    id: 'analytics',
    tag: 'iGaming Backoffice',
    title: 'Analytics Dashboard',
    description:
      'Operator analytics prototype with live Supabase data. Revenue GGR/NGR, deposits & withdrawals, top games by hold %, and player segmentation by VIP tier.',
    status: 'BetUp',

    sections: 4,
    href: '/sandbox/analytics',
  },
  {
    id: 'revenue-intelligence',
    tag: 'iGaming',
    title: 'AI Revenue Intelligence',
    description:
      'Enter 9 operator KPIs - FTD rate, churn, bonus ROI, payment success - and get AI-generated revenue health scores, risk assessment, and prioritized actions.',
    status: 'Depo44',

    sections: 1,
    href: '/sandbox/revenue-intelligence',
  },
  {
    id: 'rocketman',
    tag: 'Game',
    title: 'Rocketman',
    description:
      'A crash game with a space theme. Rocket flies higher — multiplier grows. Cash out before it explodes. Three modes: Orbit (×10), Moon (×50), Mars (×100). Built with provably fair RNG.',
    status: 'Bildery',

    sections: 1,
    href: '/sandbox/rocketman',
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

export default function SandboxPage() {
  return (
    <div className="py-12 pb-20">
      <div className="mx-auto max-w-[1240px] px-4">

        {/* Page header */}
        <div className="mb-10">
          <h1 className="mb-2 text-xl font-bold tracking-heading">
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
