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
import type { TranslationKey } from './deposit-methods'

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

/** Optional heading the website renders above a section. */
export interface SectionTitleConfig {
  showTitle: boolean
  title: TranslationKey
}

/** Category chips at the top of the home page, after the fixed lobby chip. */
export interface GameCategoryFiltersConfig extends SectionTitleConfig {
  /** Category slugs in chip order */
  categories: string[]
  /** Lobby chip label; null = the website's default translation */
  lobbyLabel: TranslationKey
}

export type GameCardType = 'square' | 'horizontal' | 'vertical'

/** A row of games from one category, with a "View all" link to the category page. */
export interface GameListConfig {
  /** Category slug; required */
  category: string | null
  cardType: GameCardType
  /** "View all" label; null = the website's default translation */
  viewAllLabel: TranslationKey
}

export const GAME_CARD_TYPES: { value: GameCardType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
]

/** Where "View all" leads: the category page. */
export function categoryPageHref(slug: string) {
  return `/${slug}`
}

interface HomeSectionBase {
  id: string
  /** Disabled sections keep their place and settings but aren't rendered */
  enabled: boolean
}

/** One block on the home page; the same type can appear more than once (e.g. several Game Lists). */
export type HomeSection = HomeSectionBase & (
  | { type: 'game-category-filters'; config: GameCategoryFiltersConfig }
  | { type: 'player-activity-feed'; config: SectionTitleConfig }
  | { type: 'game-list'; config: GameListConfig }
  | { type: Exclude<HomeSectionType, EditableType> }
)

type EditableType = 'game-category-filters' | 'player-activity-feed' | 'game-list'

/** Types with settings of their own; the rest can only be toggled, removed and moved. */
export function isEditable(section: HomeSection): section is Extract<HomeSection, { config: unknown }> {
  return 'config' in section
}

/** Where the lobby chip links; it can't be removed or moved. */
export const LOBBY_HREF = '/casino'
/** Translation the website shows on the lobby chip when no label is set */
export const LOBBY_LABEL_FALLBACK = 'home.gameCategoryFilters.all'

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
    label: 'Game category filters',
    icon: ListFilter,
    hint: 'Pick which categories show as chips at the top of the home page. The lobby chip is always first.',
  },
  'player-activity-feed': {
    label: 'Player activity feed',
    icon: Activity,
    hint: 'Rendered dynamically at runtime.',
  },
  'game-list': {
    label: 'Game list',
    icon: LayoutGrid,
    hint: 'Pick a category, choose the card layout, and set an optional "View all" label.',
  },
  'main-game-categories': {
    label: 'Main game categories',
    icon: Shapes,
    hint: 'Add category cards. Each has a custom title + image (upload or generate); the caption shows the category slug (display name on the site).',
  },
  'game-providers': {
    label: 'Game providers',
    icon: Building2,
    hint: 'Pick providers from the brand\'s game providers and upload each logo. Each links to /providers/{slug}; the label-only "View all" CTA (→ /providers) always renders.',
  },
  'player-engagement': {
    label: 'Player engagement',
    icon: Sparkles,
    hint: 'Dynamic list of engagement cards (title, caption, image -- upload or generate, CTA).',
  },
  'payment-methods': {
    label: 'Payment methods',
    icon: CreditCard,
    hint: 'Display-only payment methods shown on the home page -- upload each logo. Not clickable; methods without a logo are hidden.',
  },
  'jackpot-big-wins': {
    label: 'Jackpot & big wins',
    icon: Trophy,
    hint: 'Three fixed slots: Win of the day / Total Jackpot / Win of the month. Trophy and chest images can be generated.',
  },
  'sport-events': {
    label: 'Sport events',
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
    label: 'Player activity block',
    icon: Users,
    hint: 'Rendered dynamically at runtime.',
  },
  'seo-text': {
    label: 'SEO text',
    icon: FileText,
    hint: 'Static SEO copy rendered below the fold. No editable content -- toggle, add/remove, or reorder.',
  },
}

export const HOME_SECTION_TYPE_IDS = Object.keys(HOME_SECTION_TYPES) as HomeSectionType[]

// Mock: the brand's current home page, top to bottom
const section = (n: number, type: Exclude<HomeSectionType, EditableType>, enabled = true): HomeSection => ({ id: `home-${n}`, type, enabled })

// Only the first Game List's settings are known (from the screenshot); the others are left empty
const gameList = (n: number): HomeSection => ({
  id: `home-${n}`,
  type: 'game-list',
  enabled: true,
  config: { category: null, cardType: 'square', viewAllLabel: null },
})

export const HOME: { sections: HomeSection[] } = {
  sections: [
    section(1, 'banner'),
    {
      id: 'home-2',
      type: 'game-category-filters',
      enabled: true,
      config: {
        showTitle: true,
        title: 'home.game',
        categories: ['top', 'hot', 'new', 'slots', 'crash-games', 'fruits', 'live', 'table-games'],
        lobbyLabel: 'category.all',
      },
    },
    {
      id: 'home-3',
      type: 'player-activity-feed',
      enabled: false,
      config: { showTitle: true, title: 'home.playerActivityFeed' },
    },
    {
      id: 'home-4',
      type: 'game-list',
      enabled: true,
      config: { category: 'top', cardType: 'square', viewAllLabel: 'home.top.games.button' },
    },
    section(5, 'main-game-categories'),
    section(6, 'game-providers'),
    section(7, 'player-engagement'),
    section(8, 'payment-methods'),
    section(9, 'jackpot-big-wins'),
    {
      id: 'home-10',
      type: 'player-activity-feed',
      enabled: false,
      config: { showTitle: true, title: 'home.playerActivityFeed' },
    },
    section(11, 'sport-events'),
    gameList(12),
    section(13, 'tournaments'),
    gameList(14),
    section(15, 'promotions'),
    gameList(16),
    section(17, 'player-activity-block'),
    section(18, 'seo-text'),
  ],
}

export function commitHome(next: { sections: HomeSection[] }) {
  Object.assign(HOME, next)
}

export function newHomeSection(type: HomeSectionType): HomeSection {
  const id = `home-${Date.now()}`
  if (type === 'game-category-filters') {
    return { id, type, enabled: true, config: { showTitle: false, title: null, categories: [], lobbyLabel: null } }
  }
  if (type === 'player-activity-feed') return { id, type, enabled: true, config: { showTitle: false, title: null } }
  if (type === 'game-list') return { id, type, enabled: true, config: { category: null, cardType: 'square', viewAllLabel: null } }
  return { id, type, enabled: true }
}

export const HOME_HREF = '/brand-settings?section=home'

/** Settings page of one section with settings of its own. */
export function homeSectionHref(id: string) {
  return `/brand-settings/home/${id}`
}

/** Saves one section's settings from its page; the list (order, toggles) is saved in the Home section. */
export function commitHomeSection(next: HomeSection) {
  HOME.sections = HOME.sections.map(s => (s.id === next.id ? next : s))
}
