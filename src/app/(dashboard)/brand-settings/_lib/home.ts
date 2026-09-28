import {
  Activity,
  Building2,
  CreditCard,
  FileText,
  GalleryHorizontal,
  Gift,
  Goal,
  LayoutGrid,
  ListFilter,
  Medal,
  Shapes,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type HomeSectionType =
  | 'banner'
  | 'game-category-filters'
  | 'player-activity-feed'
  | 'game-list'
  | 'main-game-categories'
  | 'game-providers'
  | 'player-engagement'
  | 'payment-methods'
  | 'jackpot-big-wins'
  | 'sport-events'
  | 'tournaments'
  | 'promotions'
  | 'player-activity-block'
  | 'seo-text'

/** One block on the home page; the same type can appear more than once (e.g. several Game Lists). */
export interface HomeSection {
  id: string
  type: HomeSectionType
  /** Disabled sections keep their place and settings but aren't rendered */
  enabled: boolean
}

export interface HomeSectionMeta {
  label: string
  icon: LucideIcon
  hint: string
}

// Catalog order is the order of the Add section menu
export const HOME_SECTION_TYPES: Record<HomeSectionType, HomeSectionMeta> = {
  'banner': {
    label: 'Banner',
    icon: GalleryHorizontal,
    hint: 'Banner items are managed in the Banners section.',
  },
  'game-category-filters': {
    label: 'Game Category Filters',
    icon: ListFilter,
    hint: 'Pick which categories show as chips at the top of the home page. The lobby chip is always first.',
  },
  'player-activity-feed': {
    label: 'Player Activity Feed',
    icon: Activity,
    hint: 'Rendered dynamically at runtime.',
  },
  'game-list': {
    label: 'Game List',
    icon: LayoutGrid,
    hint: 'Pick a category, choose the card layout, and set an optional "View all" label.',
  },
  'main-game-categories': {
    label: 'Main Game Categories',
    icon: Shapes,
    hint: 'Add category cards. Each has a custom title + image (upload or generate); the caption shows the category slug (display name on the site).',
  },
  'game-providers': {
    label: 'Game Providers',
    icon: Building2,
    hint: 'Pick providers from the brand\'s game providers and upload each logo. Each links to /providers/{slug}; the label-only "View all" CTA (→ /providers) always renders.',
  },
  'player-engagement': {
    label: 'Player Engagement',
    icon: Sparkles,
    hint: 'Dynamic list of engagement cards (title, caption, image -- upload or generate, CTA).',
  },
  'payment-methods': {
    label: 'Payment Methods',
    icon: CreditCard,
    hint: 'Display-only payment methods shown on the home page -- upload each logo. Not clickable; methods without a logo are hidden.',
  },
  'jackpot-big-wins': {
    label: 'Jackpot & Big Wins',
    icon: Trophy,
    hint: 'Three fixed slots: Win of the day / Total Jackpot / Win of the month. Trophy and chest images can be generated.',
  },
  'sport-events': {
    label: 'Sport Events',
    icon: Goal,
    hint: 'Rendered dynamically at runtime. Configure an optional "View all" CTA.',
  },
  'tournaments': {
    label: 'Tournaments',
    icon: Medal,
    hint: 'Rendered dynamically at runtime. Configure an optional "View all" CTA.',
  },
  'promotions': {
    label: 'Promotions',
    icon: Gift,
    hint: 'Live bonus offers from Bonuses, rendered at runtime. Optional "View all" label; the link always goes to /promotions.',
  },
  'player-activity-block': {
    label: 'Player Activity Block',
    icon: Users,
    hint: 'Rendered dynamically at runtime.',
  },
  'seo-text': {
    label: 'SEO Text',
    icon: FileText,
    hint: 'Static SEO copy rendered below the fold. No editable content -- toggle, add/remove, or reorder.',
  },
}

export const HOME_SECTION_TYPE_IDS = Object.keys(HOME_SECTION_TYPES) as HomeSectionType[]

// Mock: the brand's current home page, top to bottom
const section = (n: number, type: HomeSectionType, enabled = true): HomeSection => ({ id: `home-${n}`, type, enabled })

export const HOME: { sections: HomeSection[] } = {
  sections: [
    section(1, 'banner'),
    section(2, 'game-category-filters'),
    section(3, 'player-activity-feed', false),
    section(4, 'game-list'),
    section(5, 'main-game-categories'),
    section(6, 'game-providers'),
    section(7, 'player-engagement'),
    section(8, 'payment-methods'),
    section(9, 'jackpot-big-wins'),
    section(10, 'player-activity-feed', false),
    section(11, 'sport-events'),
    section(12, 'game-list'),
    section(13, 'tournaments'),
    section(14, 'game-list'),
    section(15, 'promotions'),
    section(16, 'game-list'),
    section(17, 'player-activity-block'),
    section(18, 'seo-text'),
  ],
}

export function commitHome(next: { sections: HomeSection[] }) {
  Object.assign(HOME, next)
}

export function newHomeSection(type: HomeSectionType): HomeSection {
  return { id: `home-${Date.now()}`, type, enabled: true }
}
