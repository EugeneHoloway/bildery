export type PageStatus = "live" | "hidden" | "draft"

export interface SitePage {
  id: string
  label: string
  url: string
  status: PageStatus
  isSystem: boolean
  info: string
}

export interface Provider {
  id: string
  abbr: string
  name: string
  games: number
  selected: boolean
}

export interface AuditItem {
  status: "ok" | "warn" | "error"
  text: string
}

export const TITLE_MAX = 60
export const DESC_MAX  = 160

export const SYSTEM_PAGES: SitePage[] = [
  { id: "homepage",   label: "Homepage",       url: "betup.com/",           status: "live",   isSystem: true,  info: "System page — use Homepage Configurator to manage sections." },
  { id: "promotions", label: "Promotions",     url: "betup.com/promotions", status: "live",   isSystem: true,  info: "System page — manage individual promotion cards in the Promotions module." },
  { id: "vip",        label: "VIP club",       url: "betup.com/vip",        status: "hidden", isSystem: true,  info: "This system page is currently hidden from all visitors." },
  { id: "providers",  label: "Game providers", url: "betup.com/providers",  status: "draft",  isSystem: true,  info: "Custom page. Configure URL, visibility and content below, then publish to make it live." },
]

export const CUSTOM_PAGES: SitePage[] = [
  { id: "about", label: "About us", url: "betup.com/about", status: "live",   isSystem: false, info: "Custom page — live and visible to all visitors." },
  { id: "blog",  label: "Blog",     url: "betup.com/blog",  status: "hidden", isSystem: false, info: "Custom page — currently hidden." },
]

export const INITIAL_PROVIDERS: Provider[] = [
  { id: "ezugi",     abbr: "EZG", name: "Ezugi",         games: 84,  selected: true  },
  { id: "pragmatic", abbr: "PP",  name: "Pragmatic Play", games: 312, selected: true  },
  { id: "evolution", abbr: "EVO", name: "Evolution",      games: 127, selected: true  },
  { id: "playngo",   abbr: "PNG", name: "Play'n GO",      games: 256, selected: true  },
  { id: "netent",    abbr: "NET", name: "NetEnt",         games: 203, selected: true  },
  { id: "yggdrasil", abbr: "YGG", name: "Yggdrasil",     games: 91,  selected: false },
  { id: "hacksaw",   abbr: "HCK", name: "Hacksaw",       games: 54,  selected: false },
]

export const AUDIT_ITEMS: AuditItem[] = [
  { status: "ok",    text: "H1 present and unique" },
  { status: "ok",    text: "Title tag: 50 characters — good length" },
  { status: "ok",    text: "Meta description: 148 characters — good length" },
  { status: "warn",  text: "OG image not set — social shares will use fallback" },
  { status: "ok",    text: "Page is indexable (robots: index, follow)" },
  { status: "ok",    text: "Page included in sitemap" },
  { status: "warn",  text: "No structured data — consider adding JSON-LD" },
  { status: "ok",    text: "Canonical URL: self-referencing (correct)" },
  { status: "error", text: "DE and UA translations missing" },
]
