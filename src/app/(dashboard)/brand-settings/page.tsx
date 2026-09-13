'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  CircleCheck,
  Copy,
  CreditCard,
  Fingerprint,
  GalleryHorizontal,
  House,
  Images,
  Info,
  Lock,
  Palette,
  PanelBottom,
  PanelLeft,
  Languages,
  Share2,
  Trash2,
  Upload,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type SectionId =
  | 'general' | 'identity' | 'locale' | 'theme'
  | 'home' | 'banners' | 'sidebar' | 'footer' | 'social'
  | 'deposit-methods' | 'wallet-auto-provision'

interface NavItem { id: SectionId; label: string; icon: LucideIcon }

interface NavGroup { label: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    label: 'Brand',
    items: [
      { id: 'general',  label: 'General',  icon: Info },
      { id: 'identity', label: 'Identity', icon: Fingerprint },
      { id: 'locale',   label: 'Locale',   icon: Languages },
      { id: 'theme',    label: 'Theme',    icon: Palette },
    ],
  },
  {
    label: 'Storefront',
    items: [
      { id: 'home',    label: 'Home',                 icon: House },
      { id: 'banners', label: 'Banners',              icon: GalleryHorizontal },
      { id: 'sidebar', label: 'Sidebar & mobile nav', icon: PanelLeft },
      { id: 'footer',  label: 'Footer',               icon: PanelBottom },
      { id: 'social',  label: 'Social',               icon: Share2 },
    ],
  },
  {
    label: 'Payments',
    items: [
      { id: 'deposit-methods',       label: 'Deposit methods',       icon: CreditCard },
      { id: 'wallet-auto-provision', label: 'Wallet auto-provision', icon: WalletCards },
    ],
  },
]

const ALL_ITEMS = NAV.flatMap(g => g.items)

const BRAND = {
  id: 'bet1',
  operatorId: 'bet',
  name: 'BetUp',
  operatorName: 'Betsy',
  active: true,
}

const DEFAULT_LOCALE = 'en'

// Locales registered in the Translation Service (catalog)
const LOCALE_CATALOG = ['en', 'en-CA', 'fr-CA', 'uk-UA', 'en-NZ', 'de-CH', 'en-AU', 'de-DE', 'fr-FR', 'es-ES']

const IDENTITY = {
  canonicalUrl: 'https://depo44.website.servermacminihome.com',
  logo: { light: '/logos/betup-logo-black.svg', dark: '/logos/betup-logo.svg' } as { light: string; dark: string } | null,
  favicon: '/favicon-192.png' as string | null,
}

const LOCALE_SETTINGS = {
  locales: ['en', 'en-CA', 'fr-CA', 'uk-UA', 'en-NZ', 'de-CH', 'en-AU'],
}

function CopyableId({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-foreground">{value}</span>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        aria-label={`Copy ${label}`}
      >
        {copied
          ? <Check className="size-3.5 text-muted-foreground" />
          : <Copy className="size-3.5" />}
      </button>
    </div>
  )
}

function BrandSettingsNav({ active, onChange }: { active: SectionId; onChange: (id: SectionId) => void }) {
  return (
    <>
      {/* Mobile: horizontal scrollable line nav */}
      <nav className="flex sm:hidden overflow-x-auto border-b border-border">
        {ALL_ITEMS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              'shrink-0 px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
              active === id
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </nav>
      {/* Desktop: grouped vertical nav */}
      <nav className="hidden sm:flex flex-col gap-5 w-48 shrink-0">
        {NAV.map(group => (
          <div key={group.label} className="flex flex-col gap-0.5">
            <p className="px-3 mb-1 text-xs font-medium text-muted-foreground">
              {group.label}
            </p>
            {group.items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-left transition-colors',
                  active === id
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </>
  )
}

function GeneralSection() {
  const [name, setName] = useState(BRAND.name)
  const [active, setActive] = useState(BRAND.active)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const dirty = name !== BRAND.name || active !== BRAND.active
  function reset() {
    setName(BRAND.name)
    setActive(BRAND.active)
    setSaved(false)
  }

  function save() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 400)
  }

  return (
    <>
      <h2 className="text-xl font-semibold">General</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Brand identity and status.
      </p>
      <div className="mt-8 space-y-5">
        <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Brand ID</label>
            <CopyableId value={BRAND.id} label="brand ID" />
            <p className="text-xs text-muted-foreground">
              Brand ID cannot be changed.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Operator ID</label>
            <CopyableId value={BRAND.operatorId} label="operator ID" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Brand name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Active</label>
            <div className="flex h-8 items-center">
              <Switch checked={active} onCheckedChange={setActive} aria-label="Brand active" />
            </div>
            <p className="text-xs text-muted-foreground">
              Inactive brands are hidden from players.
            </p>
          </div>
        </div>
      </div>
      {saved && (
        <p className="mt-4 text-sm text-success">Changes saved successfully.</p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={save} disabled={!dirty || saving || !name.trim()}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        <Button variant="outline" onClick={reset} disabled={!dirty || saving}>
          Reset
        </Button>
      </div>
    </>
  )
}

interface AssetFieldProps {
  label: string
  hint: string
  preview: React.ReactNode | null
  emptyLabel: string
  onReplace: (file: File) => void
  onChooseFromLibrary: () => void
  onRemove: () => void
  /** Ширина колонки превью+подсказка; превью растягивается на всю ширину */
  columnClassName: string
  previewClassName?: string
}

function AssetField({ label, hint, preview, emptyLabel, onReplace, onChooseFromLibrary, onRemove, columnClassName, previewClassName }: AssetFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-start gap-4">
        <div className={cn('flex flex-col gap-1.5 shrink-0', columnClassName)}>
          <div
            className={cn(
              'flex w-full items-center justify-center rounded-xl border border-border bg-muted overflow-hidden',
              previewClassName
            )}
          >
            {preview ?? (
              <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                <Images className="size-5" />
                <span className="text-xs">{emptyLabel}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="flex flex-1 flex-col gap-3 min-w-0">
          <div className="flex flex-col items-start gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) onReplace(file)
                e.target.value = ''
              }}
            />
            <Button variant="outline" onClick={() => inputRef.current?.click()}>
              <Upload />
              {preview ? 'Replace' : 'Upload'}
            </Button>
            <Button variant="outline" onClick={onChooseFromLibrary}>
              <Images />
              Choose from library
            </Button>
            {preview && (
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={onRemove}>
                <Trash2 />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function IdentitySection() {
  const [canonicalUrl, setCanonicalUrl] = useState(IDENTITY.canonicalUrl)
  const [logo, setLogo] = useState<{ light: string; dark: string } | null>(IDENTITY.logo)
  const [favicon, setFavicon] = useState<string | null>(IDENTITY.favicon)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const dirty =
    canonicalUrl !== IDENTITY.canonicalUrl ||
    logo !== IDENTITY.logo ||
    favicon !== IDENTITY.favicon
  function reset() {
    setCanonicalUrl(IDENTITY.canonicalUrl)
    setLogo(IDENTITY.logo)
    setFavicon(IDENTITY.favicon)
    setSaved(false)
  }

  function save() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 400)
  }

  return (
    <>
      <h2 className="text-xl font-semibold">Identity</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Site name, canonical URL, logo and favicon.
      </p>
      <div className="mt-8 space-y-5">
        <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Site name</label>
            <Input value={BRAND.name} disabled />
            <p className="text-xs text-muted-foreground">
              Synced from Name in the General section.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Canonical URL</label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={canonicalUrl}
              onChange={e => setCanonicalUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Used for SEO canonical tags, sitemaps and absolute links in emails.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 desktop:grid-cols-2">
        <AssetField
          label="Logo"
          hint="SVG or PNG with transparent background, min. 224 × 64 px."
          emptyLabel="No logo"
          columnClassName="w-48"
          previewClassName="h-24 p-4"
          preview={logo && (
            <>
              <img src={logo.light} alt="Logo" className="max-h-full max-w-full object-contain dark:hidden" />
              <img src={logo.dark} alt="Logo" className="max-h-full max-w-full object-contain hidden dark:block" />
            </>
          )}
          onReplace={file => {
            const url = URL.createObjectURL(file)
            setLogo({ light: url, dark: url })
          }}
          onChooseFromLibrary={() => {}}
          onRemove={() => setLogo(null)}
        />
        <AssetField
          label="Favicon"
          hint="PNG or SVG, 512 × 512 px."
          emptyLabel="No favicon"
          columnClassName="w-24"
          previewClassName="h-24 p-4"
          preview={favicon && (
            <img src={favicon} alt="Favicon" className="size-12 rounded-lg object-contain" />
          )}
          onReplace={file => setFavicon(URL.createObjectURL(file))}
          onChooseFromLibrary={() => {}}
          onRemove={() => setFavicon(null)}
        />
      </div>
      {saved && (
        <p className="mt-4 text-sm text-success">Changes saved successfully.</p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={save} disabled={!dirty || saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        <Button variant="outline" onClick={reset} disabled={!dirty || saving}>
          Reset
        </Button>
      </div>
    </>
  )
}

function LocaleSection() {
  const [locales, setLocales] = useState<string[]>(LOCALE_SETTINGS.locales)
  const [localeOpen, setLocaleOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const dirty = locales.join() !== LOCALE_SETTINGS.locales.join()

  function reset() {
    setLocales(LOCALE_SETTINGS.locales)
    setSaved(false)
  }

  function save() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 400)
  }

  return (
    <>
      <h2 className="text-xl font-semibold">Locale</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Default locale and locales available for this brand.
      </p>

      <div className="mt-8 space-y-5">
        <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Default locale</label>
            <Input value={DEFAULT_LOCALE} disabled />
            <p className="text-xs text-muted-foreground">
              Platform-wide default, cannot be changed. Lives unprefixed on the website
              (/auth/login); other locales are prefixed (/fr-ca/auth/login).
            </p>
          </div>
        </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Locales</label>
        <p className="text-xs text-muted-foreground">
          Attach or detach locales available for this brand.
        </p>
        <div className="mt-2">
          <Popover open={localeOpen} onOpenChange={setLocaleOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Languages className="size-3.5" />
                Manage locales
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={6} className="w-48 p-1">
              {LOCALE_CATALOG.map(locale => {
                const isDefault = locale === DEFAULT_LOCALE
                const attached = locales.includes(locale)
                return (
                  <button
                    key={locale}
                    type="button"
                    disabled={isDefault}
                    onClick={() => setLocales(ls => attached ? ls.filter(l => l !== locale) : [...ls, locale])}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors disabled:pointer-events-none disabled:text-muted-foreground"
                  >
                    {isDefault
                      ? <Lock className="size-3.5 shrink-0" />
                      : <Check className={cn('size-3.5 shrink-0', attached ? 'opacity-100' : 'opacity-0')} />}
                    {locale}
                  </button>
                )
              })}
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {locales.map(locale => {
            const isDefault = locale === DEFAULT_LOCALE
            return isDefault ? (
              <Badge key={locale} variant="ghost" className="font-normal">
                {locale}
                <span className="ml-1">· default</span>
              </Badge>
            ) : (
              <Badge key={locale} className="font-normal">
                {locale}
              </Badge>
            )
          })}
        </div>
        <p className="pt-2 text-xs text-muted-foreground">
<span className="font-medium text-foreground">{DEFAULT_LOCALE}</span> is the platform-wide default and cannot be
          removed. Only locales registered in the Translation Service can be attached -- manage the
          catalog on the Localization page.
        </p>
      </div>
      </div>
      {saved && (
        <p className="mt-4 text-sm text-success">Changes saved successfully.</p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={save} disabled={!dirty || saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        <Button variant="outline" onClick={reset} disabled={!dirty || saving}>
          Reset
        </Button>
      </div>
    </>
  )
}

function PlaceholderSection({ item }: { item: NavItem }) {
  return (
    <>
      <h2 className="text-xl font-semibold">{item.label}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage {item.label.toLowerCase()} settings for this brand.
      </p>
      <p className="mt-8 text-sm text-muted-foreground">Coming soon.</p>
    </>
  )
}

export default function BrandSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [section, setSection] = useState<SectionId>('general')
  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  if (loading || !user) return null
  const current = ALL_ITEMS.find(i => i.id === section) ?? ALL_ITEMS[0]

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Bildery', href: '/dashboard' },
          { label: 'CMS', href: '/brand-settings' },
          { label: 'Brand Settings' },
        ]}
      />
      <div className="flex flex-1 flex-col px-6 pt-4 pb-8">
        <div>
          <h1 className="text-2xl font-semibold">Brand Settings</h1>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {BRAND.name} · {BRAND.operatorName}
            </p>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0',
                BRAND.active ? 'bg-success-bg text-success' : 'bg-muted text-muted-foreground'
              )}
            >
              <CircleCheck className="size-3.5" />
              {BRAND.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:gap-10">
            <BrandSettingsNav active={section} onChange={setSection} />
            <div className="flex-1 min-w-0 mt-4 sm:mt-0">
              {section === 'general' && <GeneralSection />}
              {section === 'identity' && <IdentitySection />}
              {section === 'locale' && <LocaleSection />}
              {!['general', 'identity', 'locale'].includes(section) && <PlaceholderSection item={current} />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
