import { TRANSLATIONS, type DepositIcon, type TranslationKey } from './deposit-methods'

export const MAX_NAV_GROUPS = 10
export const MAX_GROUP_ROWS = 10
/** Sidebar rows that can be pinned to the bottom bar (one more when one of them is main) */
export const MAX_PINNED_ITEMS = 2

/** Bound to a game category: label, icon and destination all come from the category. */
export interface CategoryRow {
  id: string
  kind: 'category'
  /** Category slug */
  category: string
}

/** Any other destination: icon, label and href are authored here. */
export interface CustomLinkRow {
  id: string
  kind: 'custom'
  icon: DepositIcon
  title: TranslationKey
  href: string
  /** Opens in a new tab */
  external: boolean
}

export type SidebarRow = CategoryRow | CustomLinkRow

// Brand game categories (mock, same slugs as the homepage configurator); real ones come from Games -> Categories
export const GAME_CATEGORIES = ['top', 'new', 'hot', 'slots', 'live', 'crash-games', 'fruits', 'table-games']

export function categoryLabelKey(slug: string) {
  return `category.${slug}`
}

export function categoryHref(slug: string) {
  return `/casino/${slug}`
}

/** One rounded block in the drawer. Groups have no title on the website, so the admin names them by position. */
export interface NavGroup {
  id: string
  rows: SidebarRow[]
}

export function groupLabel(index: number) {
  return `Group ${index + 1}`
}

export interface SupportBlock {
  icon: DepositIcon
  label: TranslationKey
  href: string
  /** Opens in a new tab */
  external: boolean
}

export interface AppInstallCard {
  enabled: boolean
  icon: DepositIcon
  title: TranslationKey
  subtitle: TranslationKey
  storeUrl: string
}

/** Menu and Search are required; sidebar items are pinned rows from the nav groups. */
export type BarItemKind = 'menu' | 'search' | 'sidebar'

/** Menu or Search: always in the bar, only position, label and icon are editable. */
export interface FixedBarItem {
  id: string
  kind: 'menu' | 'search'
  /** null = the website's default label */
  label: TranslationKey
  /** No src = the website's default icon */
  icon: DepositIcon
}

/** A sidebar row pinned to the bar; label, icon and destination come from the row. */
export interface PinnedBarItem {
  id: string
  kind: 'sidebar'
  rowId: string
}

export type BarItem = FixedBarItem | PinnedBarItem

export interface CenterCta {
  loggedIn: { icon: DepositIcon; label: TranslationKey }
  loggedOut: { icon: DepositIcon; label: TranslationKey; href: string }
}

/** The mobile/tablet drawer. */
export interface SidebarSettings {
  groups: NavGroup[]
  support: SupportBlock
  appInstall: AppInstallCard
}

/** The fixed bar at the bottom of the screen on mobile. */
export interface BottomBarSettings {
  items: BarItem[]
  /** Sidebar item promoted to the center slot for logged-in users; null = Deposit */
  mainItemId: string | null
  cta: CenterCta
}

export const BAR_ITEM_KIND_LABEL: Record<BarItemKind, string> = {
  menu: 'Menu',
  search: 'Search',
  sidebar: 'Sidebar row',
}

// Mock of the brand's saved sidebar
export const SIDEBAR: SidebarSettings = {
  groups: [
    {
      id: 'group-1',
      rows: [
        { id: 'row-1', kind: 'custom', icon: { src: 'lucide:gift', alt: 'promotions' }, title: 'sidebar.nav.promotions', href: '/promotions', external: false },
        { id: 'row-2', kind: 'custom', icon: { src: 'lucide:banknote', alt: 'banknote' }, title: 'sidebar.nav.cashback', href: '#', external: false },
      ],
    },
    {
      id: 'group-2',
      rows: [
        { id: 'row-3', kind: 'category', category: 'slots' },
        { id: 'row-4', kind: 'category', category: 'live' },
      ],
    },
  ],
  support: {
    icon: { src: 'lucide:headset', alt: 'live support' },
    label: 'sidebar.nav.liveSupport',
    href: '#',
    external: false,
  },
  appInstall: {
    enabled: true,
    icon: { src: 'lucide:smartphone', alt: 'app' },
    title: 'sidebar.appInstall.title',
    subtitle: 'sidebar.appInstall.subtitle',
    storeUrl: '#',
  },
}

// Mock of the brand's saved bottom bar
export const BOTTOM_BAR: BottomBarSettings = {
  items: [
    { id: 'menu', kind: 'menu', label: null, icon: { src: null, alt: '' } },
    { id: 'pin-promotions', kind: 'sidebar', rowId: 'row-1' },
    { id: 'pin-slots', kind: 'sidebar', rowId: 'row-3' },
    { id: 'search', kind: 'search', label: null, icon: { src: null, alt: '' } },
  ],
  mainItemId: null,
  cta: {
    loggedIn: {
      icon: { src: 'lucide:archive-restore', alt: 'deposit' },
      label: 'mobileNav.cta.deposit',
    },
    loggedOut: {
      icon: { src: 'lucide:user-plus', alt: 'join now' },
      label: 'mobileNav.cta.joinNav',
      href: '/auth/register',
    },
  },
}

export function commitSidebar(next: SidebarSettings) {
  Object.assign(SIDEBAR, next)
  // Rows removed from the sidebar are unpinned from the bottom bar too, so it never points at a missing row
  const rowIds = new Set(next.groups.flatMap(g => g.rows.map(r => r.id)))
  const items = BOTTOM_BAR.items.filter(i => i.kind !== 'sidebar' || rowIds.has(i.rowId))
  const mainKept = items.some(i => i.id === BOTTOM_BAR.mainItemId)
  Object.assign(BOTTOM_BAR, { items, mainItemId: mainKept ? BOTTOM_BAR.mainItemId : null })
}

/** Sidebar rows pinned to the saved bottom bar. */
export function pinnedRowIds() {
  return new Set(BOTTOM_BAR.items.flatMap(i => (i.kind === 'sidebar' ? [i.rowId] : [])))
}

export function commitBottomBar(next: BottomBarSettings) {
  Object.assign(BOTTOM_BAR, next)
}

export function newNavGroup(): NavGroup {
  return { id: `group-${Date.now()}`, rows: [] }
}

export function newCategoryRow(category: string): CategoryRow {
  return { id: `row-${Date.now()}`, kind: 'category', category }
}

export function newCustomLinkRow(): CustomLinkRow {
  return { id: `row-${Date.now()}`, kind: 'custom', icon: { src: null, alt: '' }, title: null, href: '', external: false }
}

export function newPinnedItem(rowId: string): PinnedBarItem {
  return { id: `pin-${Date.now()}`, kind: 'sidebar', rowId }
}

/** Store links always open outside the website, so they need a full https:// URL. */
export function validateStoreUrl(url: string) {
  if (!url.trim()) return 'Store URL is required'
  return /^https:\/\/[^\s/]+\.[^\s]+$/i.test(url.trim()) ? undefined : 'Enter a full https:// URL'
}

/** How a translation key reads on the website: the EN value, else the raw key (flagged as missing). */
export function resolveLabel(key: TranslationKey, fallback: string) {
  if (!key) return { text: fallback, missingKey: false }
  const en = TRANSLATIONS[key]
  return en ? { text: en, missingKey: false } : { text: key, missingKey: true }
}

/** A sidebar row as the website shows it, wherever it appears (drawer, bottom bar). */
export interface RowView {
  label: string
  missingKey: boolean
  /** Custom icon; null = none uploaded, or a category row (its image lives in Games -> Categories) */
  iconSrc: string | null
  href: string
  external: boolean
}

export function rowView(row: SidebarRow): RowView {
  if (row.kind === 'category') {
    const { text, missingKey } = resolveLabel(categoryLabelKey(row.category), row.category)
    return { label: text, missingKey, iconSrc: null, href: categoryHref(row.category), external: false }
  }
  const { text, missingKey } = resolveLabel(row.title, 'Untitled link')
  return { label: text, missingKey, iconSrc: row.icon.src, href: row.href.trim(), external: row.external }
}

/** Finds a row and the group it sits in (with the group's position, for its label). */
export function findRow(groups: NavGroup[], rowId: string) {
  for (const [index, group] of groups.entries()) {
    const row = group.rows.find(r => r.id === rowId)
    if (row) return { group, groupIndex: index, row }
  }
  return null
}

/** Where a category is already used across the sidebar, if anywhere (each category can be used once). */
export function categoryUse(groups: NavGroup[], category: string) {
  const index = groups.findIndex(g => g.rows.some(r => r.kind === 'category' && r.category === category))
  return index === -1 ? null : groupLabel(index)
}

/** The center CTA sits at the midpoint of the bar: 4 regular slots put it at position 3. */
export function ctaIndex(regularCount: number) {
  return Math.floor(regularCount / 2)
}
