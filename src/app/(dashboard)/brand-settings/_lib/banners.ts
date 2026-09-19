import { formatDistanceToNowStrict, isAfter, isBefore } from 'date-fns'

export type SlidesPerView = 1 | 3

/** Text resolved on the storefront through the Translation Service; `fallback` shows when the key is missing. */
export interface Translatable {
  key: string
  fallback: string
}

/** How the picture is built: one complete image, or a background with a transparent cut-out over it. */
export type Composition = 'complete' | 'layered'

export type BannerBreakpoint = 'mobile' | 'mobileLarge' | 'tablet' | 'laptop' | 'desktop' | 'desktopXl'
export type BannerImages = Record<BannerBreakpoint, string | null>

export interface BannerItem {
  id: string
  /** Internal name for the CMS (lists, archive, page heading); never shown on the storefront. */
  name: string
  subtitle: Translatable
  title: Translatable
  cta: {
    label: Translatable
    /** Storefront path or full URL; empty means the banner is not clickable. */
    href: string
    /** Opens in a new tab; `href` must then be a full URL. */
    external: boolean
  }
  composition: Composition
  /** Full-bleed picture behind everything (the whole banner when `composition` is `complete`); falls back to the next smaller slot. */
  background: BannerImages
  /** Transparent cut-out laid over the background on the right side; ignored when `composition` is `complete`. */
  artwork: BannerImages
  /** Publish / Stop toggle; a draft is never shown regardless of its schedule. */
  published: boolean
  /** ISO timestamps, applied while published. Empty start = shown right away; empty end = shown until archived. */
  schedule: { startsAt: string | null; endsAt: string | null }
  /** ISO timestamp; archived banners are hidden from the storefront and purged after ARCHIVE_RETENTION_DAYS. */
  archivedAt: string | null
}

export const BANNER_BREAKPOINTS: {
  key: BannerBreakpoint
  label: string
  viewport: number
  /** Rendered banner size in CSS px at this viewport. */
  size: { w: number; h: number }
  /** Rendered banner size and the @2×/@3× upload size for the background slot. */
  background: string
  /** Recommended cut-out size for the artwork slot. */
  artwork: string
}[] = [
  { key: 'mobile',      label: 'Mobile',       viewport: 360,  size: { w: 328,  h: 200 }, background: '328 × 200 px -- upload 984 × 600 @3×',   artwork: '640 × 372 px' },
  { key: 'mobileLarge', label: 'Mobile Large', viewport: 540,  size: { w: 500,  h: 188 }, background: '500 × 188 px -- upload 1500 × 564 @3×',  artwork: '640 × 372 px' },
  { key: 'tablet',      label: 'Tablet',       viewport: 768,  size: { w: 720,  h: 324 }, background: '720 × 324 px -- upload 1440 × 648 @2×',  artwork: '1120 × 650 px' },
  { key: 'laptop',      label: 'Laptop',       viewport: 1024, size: { w: 960,  h: 372 }, background: '960 × 372 px -- upload 1920 × 744 @2×',  artwork: '1280 × 744 px' },
  { key: 'desktop',     label: 'Desktop',      viewport: 1440, size: { w: 1360, h: 372 }, background: '1360 × 372 px -- upload 2720 × 744 @2×', artwork: '1280 × 744 px' },
  { key: 'desktopXl',   label: 'Desktop XL',   viewport: 1920, size: { w: 1360, h: 372 }, background: 'Capped at 1360 × 372 px -- upload 2720 × 744 @2×', artwork: '1280 × 744 px' },
]

export const AUTOPLAY_MIN = 1000
export const AUTOPLAY_DEFAULT = 5000
export const ARCHIVE_RETENTION_DAYS = 30

export const BANNERS_HREF = '/brand-settings?section=banners'

export function bannerHref(id: string) {
  return `/brand-settings/banners/${id}`
}

export const EMPTY_IMAGES: BannerImages = {
  mobile: null, mobileLarge: null, tablet: null, laptop: null, desktop: null, desktopXl: null,
}

export function emptyBanner(id: string): BannerItem {
  return {
    id,
    name: '',
    subtitle: { key: '', fallback: '' },
    title: { key: '', fallback: '' },
    cta: { label: { key: '', fallback: '' }, href: '', external: false },
    composition: 'complete',
    background: { ...EMPTY_IMAGES },
    artwork: { ...EMPTY_IMAGES },
    published: false,
    schedule: { startsAt: null, endsAt: null },
    archivedAt: null,
  }
}

/** Display name for lists and headings. */
export function bannerName(item: BannerItem, fallback = 'Untitled image') {
  return item.name.trim() || fallback
}

/** Number of filled slots in an image set. */
export function imageCount(images: BannerImages) {
  return BANNER_BREAKPOINTS.filter(bp => images[bp.key]).length
}

/** The slot the storefront renders at a breakpoint: its own, or the next smaller one that is filled. */
export function resolveSlot(images: BannerImages, bp: BannerBreakpoint): { src: string; key: BannerBreakpoint } | null {
  const idx = BANNER_BREAKPOINTS.findIndex(b => b.key === bp)
  for (let i = idx; i >= 0; i--) {
    const key = BANNER_BREAKPOINTS[i].key
    const src = images[key]
    if (src) return { src, key }
  }
  return null
}

/** Largest available background, used for thumbnails. */
export function bannerThumb(item: BannerItem) {
  for (let i = BANNER_BREAKPOINTS.length - 1; i >= 0; i--) {
    const src = item.background[BANNER_BREAKPOINTS[i].key]
    if (src) return src
  }
  return null
}

// Mock images: one picsum seed per banner, sized per breakpoint
function backgrounds(seed: string, keys: BannerBreakpoint[] = BANNER_BREAKPOINTS.map(bp => bp.key)): BannerImages {
  const sizes: Record<BannerBreakpoint, string> = {
    mobile: '328/200', mobileLarge: '500/188', tablet: '720/324',
    laptop: '960/372', desktop: '1360/372', desktopXl: '1360/372',
  }
  const out = { ...EMPTY_IMAGES }
  for (const k of keys) out[k] = `https://picsum.photos/seed/${seed}/${sizes[k]}`
  return out
}

// Transparent SVG cut-outs from /public; the same file serves every breakpoint
function artworks(file: string, keys: BannerBreakpoint[] = BANNER_BREAKPOINTS.map(bp => bp.key)): BannerImages {
  const out = { ...EMPTY_IMAGES }
  for (const k of keys) out[k] = `/banners/${file}`
  return out
}

function t(key: string, fallback: string): Translatable {
  return { key, fallback }
}

const DAY_MS = 86_400_000
const iso = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString()

export const BANNERS = {
  slidesPerView: 3 as SlidesPerView,
  autoplayDelay: AUTOPLAY_DEFAULT,
  items: [
    {
      id: 'b1',
      name: 'Welcome bonus',
      subtitle: t('home.banner.welcome.subtitle', 'Welcome Bonus'),
      title: t('home.banner.welcome.title', '$100 + 200 Free Spins'),
      cta: { label: t('home.banner.welcome.cta', 'Get it NOW'), href: '/promotions/welcome', external: false },
      composition: 'complete',
      background: backgrounds('betup-crown'),
      artwork: { ...EMPTY_IMAGES },
      published: true,
      schedule: { startsAt: null, endsAt: null },
      archivedAt: null,
    },
    {
      id: 'b2',
      name: 'Live casino',
      subtitle: t('home.banner.live.subtitle', 'Live Casino'),
      title: t('home.banner.live.title', 'Real dealers, real time'),
      cta: { label: t('home.banner.live.cta', 'Play live'), href: '/live', external: false },
      composition: 'layered',
      background: backgrounds('betup-live'),
      artwork: artworks('artwork-chips.svg', ['tablet', 'laptop', 'desktop', 'desktopXl']),
      published: true,
      schedule: { startsAt: null, endsAt: null },
      archivedAt: null,
    },
    {
      id: 'b3',
      name: 'Joker tournament',
      subtitle: t('home.banner.joker.subtitle', 'Tournament'),
      title: t('home.banner.joker.title', 'Joker Jackpot -- €50,000 prize pool'),
      cta: { label: t('home.banner.joker.cta', 'Join now'), href: '/tournaments/joker', external: false },
      composition: 'layered',
      background: backgrounds('betup-joker'),
      artwork: artworks('artwork-joker.svg'),
      published: true,
      schedule: { startsAt: iso(2 * DAY_MS), endsAt: iso(9 * DAY_MS) },
      archivedAt: null,
    },
    {
      id: 'b4',
      name: 'New slots',
      subtitle: t('', 'New'),
      title: t('', 'Fresh slots every week'),
      cta: { label: t('', ''), href: '', external: false },
      composition: 'complete',
      background: backgrounds('betup-slots', ['mobile', 'tablet', 'laptop']),
      artwork: { ...EMPTY_IMAGES },
      published: false,
      schedule: { startsAt: null, endsAt: null },
      archivedAt: null,
    },
    {
      id: 'b5',
      name: 'Pirate drops',
      subtitle: t('home.banner.drops.subtitle', 'Pirate Drops'),
      title: t('home.banner.drops.title', 'Daily cash drops up to $5,000'),
      cta: { label: t('home.banner.drops.cta', 'Learn more'), href: 'https://blog.betup.com/pirate-drops', external: true },
      composition: 'complete',
      background: backgrounds('betup-pirate'),
      artwork: { ...EMPTY_IMAGES },
      published: true,
      schedule: { startsAt: iso(-20 * DAY_MS), endsAt: iso(-1 * DAY_MS) },
      archivedAt: null,
    },
    {
      id: 'b6',
      name: 'Gift of the week',
      subtitle: t('home.banner.gift.subtitle', 'Gift of the week'),
      title: t('home.banner.gift.title', '50 Free Spins on Book of Dead'),
      cta: { label: t('home.banner.gift.cta', 'Claim'), href: '/promotions/gift', external: false },
      composition: 'complete',
      background: backgrounds('betup-gift'),
      artwork: { ...EMPTY_IMAGES },
      published: true,
      schedule: { startsAt: iso(-2 * DAY_MS), endsAt: iso(5 * DAY_MS) },
      archivedAt: null,
    },
    {
      id: 'b7',
      name: 'Summer cashback',
      subtitle: t('home.banner.summer.subtitle', 'Summer Cashback'),
      title: t('home.banner.summer.title', '15% back every weekend'),
      cta: { label: t('home.banner.summer.cta', 'Get cashback'), href: '/promotions/summer', external: false },
      composition: 'complete',
      background: backgrounds('betup-summer'),
      artwork: { ...EMPTY_IMAGES },
      published: true,
      schedule: { startsAt: null, endsAt: null },
      archivedAt: new Date(Date.now() - 3 * DAY_MS).toISOString(),
    },
  ] as BannerItem[],
}

export function validateAutoplay(value: string) {
  const n = Number(value)
  if (!value.trim() || !Number.isInteger(n)) return 'Enter a whole number of milliseconds'
  return n >= AUTOPLAY_MIN ? undefined : `Minimum is ${AUTOPLAY_MIN} ms`
}

const TRANSLATION_KEY = /^[a-z0-9]+(\.[a-z0-9_-]+)*$/i

export function validateTranslationKey(value: string) {
  if (!value.trim()) return undefined
  return TRANSLATION_KEY.test(value.trim()) ? undefined : 'Use dot-separated segments, e.g. home.banner.welcome.title'
}

/** Internal links are storefront paths; external ones must be full URLs. */
export function validateCtaHref(href: string, external: boolean) {
  const v = href.trim()
  if (!v) return undefined
  if (external) {
    try {
      const u = new URL(v)
      if (u.protocol !== 'https:' && u.protocol !== 'http:') return 'External link must start with https:// or http://'
      return undefined
    } catch {
      return 'Enter a full URL, e.g. https://example.com'
    }
  }
  return v.startsWith('/') || v.startsWith('#') || /^https?:\/\//.test(v)
    ? undefined
    : 'Use a storefront path starting with /, or a full URL'
}

/** Whole days left before an archived banner is purged (never below 0). */
export function daysUntilPurge(archivedAt: string, now = Date.now()) {
  const elapsed = Math.floor((now - new Date(archivedAt).getTime()) / DAY_MS)
  return Math.max(0, ARCHIVE_RETENTION_DAYS - elapsed)
}

export type BannerState = 'draft' | 'live' | 'scheduled' | 'ended'

export const STATE_LABEL: Record<BannerState, string> = {
  draft: 'Draft', live: 'Live', scheduled: 'Scheduled', ended: 'Ended',
}

/** Where the banner is right now -- publish toggle first, then its schedule -- with a human summary. */
export function bannerStatus(
  { published, schedule }: Pick<BannerItem, 'published' | 'schedule'>,
  now = new Date()
): { state: BannerState; label: string } {
  if (!published) return { state: 'draft', label: 'Not published -- hidden from the storefront' }
  const start = schedule.startsAt ? new Date(schedule.startsAt) : null
  const end = schedule.endsAt ? new Date(schedule.endsAt) : null
  if (start && isAfter(start, now)) {
    return { state: 'scheduled', label: `Starts in ${formatDistanceToNowStrict(start)}` }
  }
  if (end && isBefore(end, now)) {
    return { state: 'ended', label: `Ended ${formatDistanceToNowStrict(end)} ago` }
  }
  return { state: 'live', label: end ? `Live -- ends in ${formatDistanceToNowStrict(end)}` : 'Live, no end date' }
}

export function validateSchedule(schedule: BannerItem['schedule']) {
  if (schedule.startsAt && schedule.endsAt && !isAfter(new Date(schedule.endsAt), new Date(schedule.startsAt))) {
    return 'End must be after start'
  }
  return undefined
}

/** "Starts in 7 days" / "Started 2 hours ago" for one schedule boundary; null when unset. */
export function boundaryLabel(iso: string | null, verb: { future: string; past: string }, now = new Date()) {
  if (!iso) return null
  const at = new Date(iso)
  return isAfter(at, now)
    ? `${verb.future} in ${formatDistanceToNowStrict(at)}`
    : `${verb.past} ${formatDistanceToNowStrict(at)} ago`
}
