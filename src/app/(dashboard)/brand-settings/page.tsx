'use client'
import { createContext, Suspense, useContext, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Check,
  CircleCheck,
  CircleOff,
  Copy,
  CreditCard,
  Fingerprint,
  GalleryHorizontal,
  House,
  Images,
  Info,
  Loader2,
  Palette,
  Plus,
  Power,
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
import { CatalogPicker } from '@/components/CatalogPicker'
import { SortableChips } from '@/components/SortableChips'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
const SECTION_IDS = new Set<string>(ALL_ITEMS.map(i => i.id))
const DEFAULT_SECTION: SectionId = 'general'

// Only deviations from the default end up in the URL
function sectionHref(id: SectionId) {
  return id === DEFAULT_SECTION ? '/brand-settings' : `/brand-settings?section=${id}`
}

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

// Currencies registered in the Currency Rate Service (catalog)
const CURRENCY_CATALOG = ['USD', 'EUR', 'CAD', 'AUD', 'NZD', 'CHF', 'BTC', 'ETH', 'LTC', 'TRX', 'USDT', 'USDC']

// Networks a brand can link to (catalog); the order is the display order
const SOCIAL_CATALOG: { id: string; label: string; placeholder: string }[] = [
  { id: 'x',         label: 'X (Twitter)', placeholder: 'https://x.com/betup' },
  { id: 'telegram',  label: 'Telegram',    placeholder: 'https://t.me/betup' },
  { id: 'instagram', label: 'Instagram',   placeholder: 'https://instagram.com/betup' },
  { id: 'facebook',  label: 'Facebook',    placeholder: 'https://facebook.com/betup' },
  { id: 'youtube',   label: 'YouTube',     placeholder: 'https://youtube.com/@betup' },
  { id: 'twitch',    label: 'Twitch',      placeholder: 'https://twitch.tv/betup' },
  { id: 'discord',   label: 'Discord',     placeholder: 'https://discord.gg/betup' },
]

type SocialLinks = Record<string, string>

const SOCIAL = {
  links: { x: 'https://x.com/betup', telegram: 'https://t.me/betup', instagram: '' } as SocialLinks,
}

const WALLET_AUTO_PROVISION = {
  currencies: ['TRX', 'USDT'],
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i

function validateRequired(value: string, label: string) {
  return value.trim() ? undefined : `${label} is required`
}

function validateUrl(value: string, label = 'URL') {
  if (!value.trim()) return `${label} is required`
  try {
    const u = new URL(value)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return 'URL must start with https:// or http://'
  } catch {
    return 'Enter a valid URL, e.g. https://example.com'
  }
  return undefined
}

const CSS_VAR = /^--[a-z0-9_-]+$/i

function validateCssVar(value: string) {
  if (!value.trim()) return undefined
  return CSS_VAR.test(value.trim()) ? undefined : 'Must start with -- and contain only letters, digits, - and _'
}

function validateHex(value: string) {
  return HEX_COLOR.test(value) ? undefined : 'Use a 6-digit hex color, e.g. #1a1a1a'
}

// Black or white, whichever reads better on the given color (preview only)
function readableOn(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#18181b' : '#fafafa'
}

type ColorKey = 'primary' | 'primaryHover' | 'primaryActive' | 'primaryForeground' | 'background'
type FontProvider = 'google' | 'system' | 'custom'

interface FontConfig {
  family: string
  provider: FontProvider
  cssVariable: string
  weights: number[]
  subsets: string[]
  fallback: string[]
}

const COLOR_FIELDS: { key: ColorKey; label: string; hint: string }[] = [
  { key: 'primary',           label: 'Primary',            hint: 'Buttons, links, highlights.' },
  { key: 'primaryHover',      label: 'Primary hover',      hint: 'Primary on hover.' },
  { key: 'primaryActive',     label: 'Primary active',     hint: 'Primary on press.' },
  { key: 'primaryForeground', label: 'Primary foreground', hint: 'Text on primary surfaces.' },
  { key: 'background',        label: 'Background',         hint: 'Page background.' },
]

const FONT_PROVIDERS: { value: FontProvider; label: string }[] = [
  { value: 'google', label: 'Google Fonts' },
  { value: 'system', label: 'System' },
  { value: 'custom', label: 'Custom (self-hosted)' },
]

const FONT_FAMILIES = ['Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins']
const FONT_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900]
const FONT_WEIGHT_NAMES: Record<number, string> = {
  100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium',
  600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black',
}
const FONT_SUBSETS = ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'vietnamese']

const THEME = {
  colors: {
    primary: '#ccff00',
    primaryHover: '#d8ff3d',
    primaryActive: '#abd600',
    primaryForeground: '#18181b',
    background: '#09090b',
  } as Record<ColorKey, string>,
  projectFont: {
    family: 'Inter',
    provider: 'google',
    cssVariable: '--font-inter',
    weights: [200, 400, 500, 600, 700, 800],
    subsets: ['latin'],
    fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
  } as FontConfig,
  emailFont: {
    family: 'Inter Tight',
    provider: 'google',
    cssVariable: '',
    weights: [400, 500, 600, 700, 800],
    subsets: ['latin'],
    fallback: ['Arial', 'Helvetica', 'sans-serif'],
  } as FontConfig,
}

function CopyableId({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-8 items-center gap-1">
      <span className="text-sm text-foreground">{value}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-xs" onClick={copy} aria-label={`Copy ${label}`}>
            {copied ? <Check className="text-success" /> : <Copy className="text-muted-foreground" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? 'Copied' : 'Copy'}</TooltipContent>
      </Tooltip>
    </div>
  )
}

function BrandSettingsNav({ active, onSelect }: { active: SectionId; onSelect: (id: SectionId) => void }) {
  // Plain clicks are handled in React (dirty guard); modifier clicks fall through to the href
  function onLinkClick(e: React.MouseEvent<HTMLAnchorElement>, id: SectionId) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    onSelect(id)
  }

  return (
    <>
      {/* Mobile: grouped select */}
      <div className="sm:hidden">
        <Select value={active} onValueChange={v => onSelect(v as SectionId)}>
          <SelectTrigger className="w-full" aria-label="Section">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NAV.map(group => (
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.items.map(({ id, label, icon: Icon }) => (
                  <SelectItem key={id} value={id}>
                    <Icon className="size-4 text-muted-foreground" />
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Desktop: grouped vertical nav */}
      <nav className="hidden sm:flex flex-col gap-5 w-48 shrink-0">
        {NAV.map(group => (
          <div key={group.label} className="flex flex-col gap-0.5">
            <p className="px-3 mb-1 text-xs font-medium text-muted-foreground">
              {group.label}
            </p>
            {group.items.map(({ id, label, icon: Icon }) => (
              <Link
                key={id}
                href={sectionHref(id)}
                replace
                scroll={false}
                aria-current={active === id ? 'page' : undefined}
                onClick={e => onLinkClick(e, id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-left transition-colors',
                  active === id
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </>
  )
}

// Sections report their dirty state up to the page so navigation can be guarded,
// and navigate between sections through the same guard
const SectionContext = createContext<{ reportDirty: (dirty: boolean) => void; go: (id: SectionId) => void }>({
  reportDirty: () => {},
  go: () => {},
})

/**
 * Draft/baseline bookkeeping shared by every section: `dirty` compares the
 * current values against the last saved ones, `save` commits them (mock),
 * `reset` restores them, and the page is told about unsaved changes.
 */
function useSaveable<T extends object>(values: T, apply: (v: T) => void) {
  const [baseline, setBaseline] = useState(values)
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(values) !== JSON.stringify(baseline)
  const { reportDirty } = useContext(SectionContext)

  useEffect(() => {
    reportDirty(dirty)
    return () => reportDirty(false)
  }, [dirty, reportDirty])

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function reset() {
    apply(baseline)
    toast('Changes discarded')
  }

  function save() {
    setSaving(true)
    setTimeout(() => {
      setBaseline(values)
      setSaving(false)
      toast.success('Changes saved')
    }, 400)
  }

  return { dirty, saving, save, reset }
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      {/* Focus target after section navigation (see BrandSettingsPage) */}
      <h2 tabIndex={-1} className="text-xl font-semibold outline-none">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function SectionActions({ dirty, saving, onSave, onReset, canSave = true }: {
  dirty: boolean
  saving: boolean
  onSave: () => void
  onReset: () => void
  canSave?: boolean
}) {
  const [isMac, setIsMac] = useState(false)
  useEffect(() => { setIsMac(/Mac|iPhone|iPad/.test(navigator.platform)) }, [])

  // ⌘S / Ctrl+S saves while there is something to save
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave
  const active = dirty && !saving && canSave
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        onSaveRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  if (!dirty) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky bottom-[calc(--spacing(4)+env(safe-area-inset-bottom))] mt-8 flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none"
    >
      <p className="hidden text-sm text-muted-foreground sm:block">You have unsaved changes.</p>
      <div className="flex flex-1 items-center gap-2 sm:flex-none">
        <Button variant="outline" onClick={onReset} disabled={saving} className="flex-1 sm:flex-none">
          Discard
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onSave} disabled={saving || !canSave} className="flex-1 sm:flex-none">
              {saving && <Loader2 className="animate-spin" />}
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-1.5">
            Save <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd><Kbd>S</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

function GeneralSection({ active, onActiveChange }: { active: boolean; onActiveChange: (v: boolean) => void }) {
  const [name, setName] = useState(BRAND.name)
  const { dirty, saving, save, reset } = useSaveable({ name }, v => setName(v.name))
  const nameError = validateRequired(name, 'Name')
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)

  function deactivate() {
    onActiveChange(false)
    setConfirmDeactivate(false)
    toast.success('Brand deactivated')
  }

  function activate() {
    onActiveChange(true)
    toast.success('Brand activated')
  }

  return (
    <>
      <SectionHeader title="General" description="Brand identity and status." />
      <FieldGroup className="mt-8">
        <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
          <Field>
            <FieldLabel>Brand ID</FieldLabel>
            <CopyableId value={BRAND.id} label="brand ID" />
            <FieldDescription>Brand ID cannot be changed.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Operator ID</FieldLabel>
            <CopyableId value={BRAND.operatorId} label="operator ID" />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
          <Field data-invalid={!!nameError || undefined}>
            <FieldLabel htmlFor="brand-name">
              Name <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="brand-name"
              placeholder="Brand name"
              value={name}
              onChange={e => setName(e.target.value)}
              aria-invalid={!!nameError || undefined}
            />
            <FieldError>{nameError}</FieldError>
          </Field>
        </div>
      </FieldGroup>

      <Card className="mt-10 border-destructive/50">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>Actions here take effect immediately and affect every player of this brand.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
            <div>
              <p className="text-sm font-medium">{active ? 'Deactivate brand' : 'Activate brand'}</p>
              <p className="text-xs text-muted-foreground">
                {active
                  ? 'The storefront goes offline and players can no longer log in.'
                  : 'This brand is currently hidden from players.'}
              </p>
            </div>
            {active ? (
              <Button
                variant="outline"
                className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive-bg hover:text-destructive"
                onClick={() => setConfirmDeactivate(true)}
              >
                <Power />
                Deactivate brand
              </Button>
            ) : (
              <Button variant="outline" className="shrink-0" onClick={activate}>
                <Power />
                Activate brand
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmDeactivate} onOpenChange={setConfirmDeactivate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {BRAND.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The storefront will go offline immediately and players will not be able to log in
              until the brand is activated again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SectionActions dirty={dirty} saving={saving} onSave={save} onReset={reset} canSave={!nameError} />
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
    <Field>
      <FieldLabel>{label}</FieldLabel>
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
          <FieldDescription>{hint}</FieldDescription>
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
    </Field>
  )
}

// Fixed white surface on purpose: the logo is checked against the storefront's light background
// regardless of the CMS theme, so this is not swapped with a dark: variant.
function LogoSurface({ src }: { src: string }) {
  return (
    <div className="flex size-full items-center justify-center rounded-lg bg-white p-3">
      <img src={src} alt="Logo on light background" className="max-h-full max-w-full object-contain" />
    </div>
  )
}

function IdentitySection() {
  const { go } = useContext(SectionContext)
  const [canonicalUrl, setCanonicalUrl] = useState(IDENTITY.canonicalUrl)
  const [logo, setLogo] = useState<{ light: string; dark: string } | null>(IDENTITY.logo)
  const [favicon, setFavicon] = useState<string | null>(IDENTITY.favicon)

  // Object URLs created for local previews; revoked when replaced and on unmount
  const blobUrls = useRef(new Set<string>())
  function blobUrl(file: File) {
    const url = URL.createObjectURL(file)
    blobUrls.current.add(url)
    return url
  }
  function release(url: string | null | undefined) {
    if (url && blobUrls.current.delete(url)) URL.revokeObjectURL(url)
  }
  useEffect(() => {
    const urls = blobUrls.current
    return () => { urls.forEach(u => URL.revokeObjectURL(u)) }
  }, [])
  const { dirty, saving, save, reset } = useSaveable({ canonicalUrl, logo, favicon }, v => {
    setCanonicalUrl(v.canonicalUrl)
    setLogo(v.logo)
    setFavicon(v.favicon)
  })
  const urlError = validateUrl(canonicalUrl, 'Canonical URL')

  return (
    <>
      <SectionHeader title="Identity" description="Site name, canonical URL, logo and favicon." />
      <FieldGroup className="mt-8">
        <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="site-name">Site name</FieldLabel>
            <Input id="site-name" value={BRAND.name} disabled />
            <FieldDescription>
              Synced from Name in{' '}
              <Link
                href={sectionHref('general')}
                replace
                scroll={false}
                onClick={e => { e.preventDefault(); go('general') }}
              >
                General
              </Link>
              .
            </FieldDescription>
          </Field>
          <Field data-invalid={!!urlError || undefined}>
            <FieldLabel htmlFor="canonical-url">
              Canonical URL <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="canonical-url"
              type="url"
              placeholder="https://example.com"
              value={canonicalUrl}
              onChange={e => setCanonicalUrl(e.target.value)}
              aria-invalid={!!urlError || undefined}
            />
            <FieldDescription>
              Used for SEO canonical tags, sitemaps and absolute links in emails.
            </FieldDescription>
            <FieldError>{urlError}</FieldError>
          </Field>
        </div>
      </FieldGroup>
      <div className="mt-8 grid grid-cols-1 gap-8 desktop:grid-cols-2">
        <AssetField
          label="Logo"
          hint="SVG or PNG with transparent background, min. 224 × 64 px."
          emptyLabel="No logo"
          columnClassName="w-48"
          previewClassName="h-24 p-2"
          preview={logo && <LogoSurface src={logo.light} />}
          onReplace={file => {
            release(logo?.light)
            release(logo?.dark)
            const url = blobUrl(file)
            setLogo({ light: url, dark: url })
          }}
          onChooseFromLibrary={() => {}}
          onRemove={() => { release(logo?.light); release(logo?.dark); setLogo(null) }}
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
          onReplace={file => { release(favicon); setFavicon(blobUrl(file)) }}
          onChooseFromLibrary={() => {}}
          onRemove={() => { release(favicon); setFavicon(null) }}
        />
      </div>
      <SectionActions dirty={dirty} saving={saving} onSave={save} onReset={reset} canSave={!urlError} />
    </>
  )
}

function LocaleSection() {
  const [locales, setLocales] = useState<string[]>(LOCALE_SETTINGS.locales)
  const { dirty, saving, save, reset } = useSaveable({ locales }, v => setLocales(v.locales))

  return (
    <>
      <SectionHeader title="Locale" description="Locales available on this brand's storefront." />

      <FieldGroup className="mt-8">
        <Field>
          <FieldLabel>Locales</FieldLabel>
          <CatalogPicker
            catalog={LOCALE_CATALOG}
            value={locales}
            onChange={setLocales}
            locked={[DEFAULT_LOCALE]}
            lockedHint="default"
            addLabel="Add locale"
            searchPlaceholder="Search locales…"
          />
          <FieldDescription>
            <span className="font-medium text-foreground">{DEFAULT_LOCALE}</span> is the platform-wide
            default and cannot be removed: it lives unprefixed on the website (/auth/login), other
            locales are prefixed (/fr-ca/auth/login). Only locales registered in the Translation
            Service can be attached -- manage the catalog on the Localization page.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <SectionActions dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </>
  )
}

function ColorField({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  const error = validateHex(value)
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel>{label}</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          {/* Цвет задаётся пользователем -- единственное место, где inline-style оправдан */}
          <label
            className={cn(
              'relative block size-5 shrink-0 cursor-pointer rounded-md border border-border',
              error && 'bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,var(--border)_3px,var(--border)_4px)]'
            )}
            style={error ? undefined : { backgroundColor: value }}
            aria-label={`Pick ${label}`}
          >
            <input
              type="color"
              value={error ? '#000000' : value}
              onChange={e => onChange(e.target.value)}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </label>
        </InputGroupAddon>
        <InputGroupInput
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#000000"
          spellCheck={false}
          aria-invalid={!!error || undefined}
        />
      </InputGroup>
      <FieldDescription>{hint}</FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  )
}

function ThemePreview({ colors, font }: { colors: Record<ColorKey, string>; font: FontConfig }) {
  // Fall back to the saved theme for any color that is mid-edit, so the preview never breaks
  const c = Object.fromEntries(
    COLOR_FIELDS.map(f => [f.key, validateHex(colors[f.key]) ? THEME.colors[f.key] : colors[f.key]])
  ) as Record<ColorKey, string>
  const text = readableOn(c.background)
  const states: { label: string; color: string }[] = [
    { label: 'Default', color: c.primary },
    { label: 'Hover', color: c.primaryHover },
    { label: 'Active', color: c.primaryActive },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>How the colors and project font combine on the storefront.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Цвета и шрифт из формы -- inline-style оправдан */}
        <div
          className="flex flex-col gap-5 rounded-xl border border-border p-5"
          style={{ backgroundColor: c.background, fontFamily: [font.family, ...font.fallback].join(', ') }}
        >
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold" style={{ color: text }}>Welcome back</p>
            <p className="text-sm" style={{ color: text, opacity: 0.7 }}>
              Your balance is ready.{' '}
              <span className="font-medium underline underline-offset-4" style={{ color: c.primary }}>View wallet</span>
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {states.map(st => (
              <div key={st.label} className="flex flex-col items-center gap-1.5">
                <span
                  className="inline-flex h-8 w-full items-center justify-center rounded-lg text-sm font-medium"
                  style={{ backgroundColor: st.color, color: c.primaryForeground }}
                >
                  Deposit
                </span>
                <span className="text-xs" style={{ color: text, opacity: 0.6 }}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FontFields({ value, onChange }: { value: FontConfig; onChange: (v: FontConfig) => void }) {
  const [fallbackDraft, setFallbackDraft] = useState('')
  const cssVarError = validateCssVar(value.cssVariable)

  function set<K extends keyof FontConfig>(key: K, v: FontConfig[K]) {
    onChange({ ...value, [key]: v })
  }

  function addFallback() {
    const name = fallbackDraft.trim()
    if (!name || value.fallback.includes(name)) return
    set('fallback', [...value.fallback, name])
    setFallbackDraft('')
  }

  return (
    <FieldGroup>
      <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
        <Field>
          <FieldLabel>Family</FieldLabel>
          <Select value={value.family} onValueChange={v => set('family', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              {/* Keep a saved family that is not in the catalog selectable */}
              {(FONT_FAMILIES.includes(value.family) ? FONT_FAMILIES : [value.family, ...FONT_FAMILIES]).map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Provider</FieldLabel>
          <Select value={value.provider} onValueChange={v => set('provider', v as FontProvider)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_PROVIDERS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field data-invalid={!!cssVarError || undefined}>
        <FieldLabel>CSS variable</FieldLabel>
        <Input
          placeholder="--font-name"
          value={value.cssVariable}
          onChange={e => set('cssVariable', e.target.value)}
          spellCheck={false}
          aria-invalid={!!cssVarError || undefined}
        />
        <FieldDescription>
          Exposed on the storefront as a CSS custom property. Leave empty to skip.
        </FieldDescription>
        <FieldError>{cssVarError}</FieldError>
      </Field>

      <Field>
        <FieldLabel>Weights</FieldLabel>
        <CatalogPicker
          catalog={FONT_WEIGHTS.map(String)}
          value={value.weights.map(String)}
          onChange={ws => set('weights', ws.map(Number).sort((a, b) => a - b))}
          labelFor={w => `${w} ${FONT_WEIGHT_NAMES[Number(w)] ?? ''}`.trim()}
          addLabel="Add weight"
          searchPlaceholder="Search weights…"
        />
      </Field>

      <Field>
        <FieldLabel>Subsets</FieldLabel>
        <CatalogPicker
          catalog={FONT_SUBSETS}
          value={value.subsets}
          onChange={subs => set('subsets', subs)}
          addLabel="Add subset"
          searchPlaceholder="Search subsets…"
        />
      </Field>

      <Field>
        <FieldLabel>Fallback stack</FieldLabel>
        <InputGroup>
          <InputGroupInput
            placeholder="Add a fallback, e.g. sans-serif"
            value={fallbackDraft}
            onChange={e => setFallbackDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFallback() } }}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={addFallback} disabled={!fallbackDraft.trim()}>
              Add
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <SortableChips items={value.fallback} onChange={v => set('fallback', v)} />
        <FieldDescription>Applied in order when the primary family fails to load -- drag to reorder.</FieldDescription>
      </Field>
    </FieldGroup>
  )
}

function ThemeSection() {
  const [colors, setColors] = useState<Record<ColorKey, string>>(THEME.colors)
  const [projectFont, setProjectFont] = useState<FontConfig>(THEME.projectFont)
  const [emailFont, setEmailFont] = useState<FontConfig>(THEME.emailFont)
  const { dirty, saving, save, reset } = useSaveable({ colors, projectFont, emailFont }, v => {
    setColors(v.colors)
    setProjectFont(v.projectFont)
    setEmailFont(v.emailFont)
  })
  const themeValid =
    COLOR_FIELDS.every(f => !validateHex(colors[f.key])) &&
    !validateCssVar(projectFont.cssVariable) &&
    !validateCssVar(emailFont.cssVariable)

  return (
    <>
      <SectionHeader title="Theme" description="Colors and font configuration." />

      <div className="mt-8 grid grid-cols-1 gap-5 desktop:grid-cols-[minmax(0,1fr)_20rem] desktop:items-start">
        <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
          {COLOR_FIELDS.map(f => (
            <ColorField
              key={f.key}
              label={f.label}
              hint={f.hint}
              value={colors[f.key]}
              onChange={v => setColors(c => ({ ...c, [f.key]: v }))}
            />
          ))}
        </div>
        <ThemePreview colors={colors} font={projectFont} />
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-1 gap-5 desktop:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Project font</CardTitle>
              <CardDescription>Used across the storefront UI.</CardDescription>
            </CardHeader>
            <CardContent>
              <FontFields value={projectFont} onChange={setProjectFont} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Email font</CardTitle>
              <CardDescription>Used in transactional emails. Prefer web-safe fallbacks.</CardDescription>
            </CardHeader>
            <CardContent>
              <FontFields value={emailFont} onChange={setEmailFont} />
            </CardContent>
          </Card>
        </div>
      </div>

      <SectionActions dirty={dirty} saving={saving} onSave={save} onReset={reset} canSave={themeValid} />
    </>
  )
}

function WalletAutoProvisionSection() {
  const [currencies, setCurrencies] = useState<string[]>(WALLET_AUTO_PROVISION.currencies)
  const { dirty, saving, save, reset } = useSaveable({ currencies }, v => setCurrencies(v.currencies))

  return (
    <>
      <SectionHeader
        title="Wallet auto-provision"
        description="Currency wallets automatically created for a new player of this brand at registration, in addition to their default (PRIMARY) wallet."
      />

      <FieldGroup className="mt-8">
        <Field>
          <FieldLabel>Currencies</FieldLabel>
          <CatalogPicker
            catalog={CURRENCY_CATALOG}
            value={currencies}
            onChange={setCurrencies}
            addLabel="Add currency"
            searchPlaceholder="Search currencies…"
            emptyIcon={WalletCards}
            emptyText="No extra wallets. New players get only the PRIMARY wallet."
          />
          <FieldDescription>
            Only currencies registered in the Currency Rate Service can be attached.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <Alert className="mt-6">
        <Info className="size-4" />
        <AlertTitle>Applies to new players only</AlertTitle>
        <AlertDescription>
          Saving does not create wallets for existing players. The default (PRIMARY) wallet is
          always created regardless of this list. Duplicates and unknown currency codes are
          ignored by the Wallet service.
        </AlertDescription>
      </Alert>

      <SectionActions dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </>
  )
}

function SectionSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading section">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      <div className="mt-8 grid grid-cols-1 gap-5 tablet:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>
    </div>
  )
}

function SocialSection() {
  const [links, setLinks] = useState<SocialLinks>(SOCIAL.links)
  const { dirty, saving, save, reset } = useSaveable({ links }, v => setLinks(v.links))

  const rows = SOCIAL_CATALOG.filter(n => n.id in links)
  const available = SOCIAL_CATALOG.filter(n => !(n.id in links))
  const errors = Object.fromEntries(rows.map(n => [n.id, validateUrl(links[n.id], `${n.label} link`)]))
  const valid = rows.every(n => !errors[n.id])

  function add(id: string) {
    setLinks(l => ({ ...l, [id]: '' }))
  }

  function remove(id: string) {
    setLinks(l => {
      const next = { ...l }
      delete next[id]
      return next
    })
  }

  const addMenu = available.length > 0 && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus data-icon="inline-start" />
          Add social link
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {available.map(n => (
          <DropdownMenuItem key={n.id} onSelect={() => add(n.id)}>{n.label}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      <SectionHeader title="Social" description="Links to the brand's social media accounts shown on the storefront." />

      {rows.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <Share2 className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No social links yet.</p>
          {addMenu}
        </div>
      ) : (
        <FieldGroup className="mt-8">
          {rows.map(n => {
            const error = errors[n.id]
            const inputId = `social-${n.id}`
            return (
              <div key={n.id} className="grid grid-cols-1 gap-2 tablet:grid-cols-[8rem_minmax(0,1fr)_auto] tablet:gap-3">
                <FieldLabel htmlFor={inputId} className="tablet:h-8 tablet:items-center">{n.label}</FieldLabel>
                <Field data-invalid={!!error || undefined} className="relative">
                  <Input
                    id={inputId}
                    type="url"
                    placeholder={n.placeholder}
                    value={links[n.id]}
                    onChange={e => setLinks(l => ({ ...l, [n.id]: e.target.value }))}
                    aria-invalid={!!error || undefined}
                  />
                  {/* Overlaid so rows keep their height whether or not there is an error */}
                  <FieldError className="absolute top-full left-0 mt-0.5">{error}</FieldError>
                </Field>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Remove ${n.label}`} onClick={() => remove(n.id)}>
                      <Trash2 className="text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove</TooltipContent>
                </Tooltip>
              </div>
            )
          })}
          {addMenu && <div>{addMenu}</div>}
        </FieldGroup>
      )}

      <SectionActions dirty={dirty} saving={saving} onSave={save} onReset={reset} canSave={valid} />
    </>
  )
}

function PlaceholderSection({ item }: { item: NavItem }) {
  return (
    <>
      <SectionHeader title={item.label} description={`Manage ${item.label.toLowerCase()} settings for this brand.`} />
      <p className="mt-8 text-sm text-muted-foreground">Coming soon.</p>
    </>
  )
}

function BrandSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  // The URL is the source of truth for the active section; unknown values fall back to the default
  const param = searchParams.get('section')
  const section: SectionId = param && SECTION_IDS.has(param) ? (param as SectionId) : DEFAULT_SECTION

  const [dirty, setDirty] = useState(false)
  const [pendingSection, setPendingSection] = useState<SectionId | null>(null)
  const [brandActive, setBrandActive] = useState(BRAND.active)

  // Move focus to the new section's heading after navigation (skip the initial render)
  const contentRef = useRef<HTMLDivElement>(null)
  const prevSection = useRef(section)
  useEffect(() => {
    if (prevSection.current === section) return
    prevSection.current = section
    contentRef.current?.querySelector('h2')?.focus()
  }, [section])

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  if (!loading && !user) return null
  const current = ALL_ITEMS.find(i => i.id === section) ?? ALL_ITEMS[0]

  function go(id: SectionId) {
    if (id === section) return
    if (dirty) setPendingSection(id)
    else router.replace(sectionHref(id), { scroll: false })
  }

  function discardAndGo() {
    if (!pendingSection) return
    router.replace(sectionHref(pendingSection), { scroll: false })
    setPendingSection(null)
  }

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
            {loading ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {BRAND.name} · {BRAND.operatorName}
                </p>
                <Badge variant={brandActive ? 'success' : 'secondary'}>
                  {brandActive ? <CircleCheck className="size-3.5" /> : <CircleOff className="size-3.5" />}
                  {brandActive ? 'Active' : 'Inactive'}
                </Badge>
              </>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:gap-10">
            <BrandSettingsNav active={section} onSelect={go} />
            <div ref={contentRef} className="flex-1 min-w-0 mt-4 sm:mt-0">
              {loading ? (
                <SectionSkeleton />
              ) : (
                <SectionContext.Provider value={{ reportDirty: setDirty, go }}>
                  {section === 'general' && <GeneralSection active={brandActive} onActiveChange={setBrandActive} />}
                  {section === 'identity' && <IdentitySection />}
                  {section === 'locale' && <LocaleSection />}
                  {section === 'theme' && <ThemeSection />}
                  {section === 'social' && <SocialSection />}
                  {section === 'wallet-auto-provision' && <WalletAutoProvisionSection />}
                  {!['general', 'identity', 'locale', 'theme', 'social', 'wallet-auto-provision'].includes(section) && <PlaceholderSection item={current} />}
                </SectionContext.Provider>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={pendingSection !== null} onOpenChange={open => { if (!open) setPendingSection(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in {current.label}. Leaving this section will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={discardAndGo}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// useSearchParams needs a Suspense boundary for static prerendering
export default function BrandSettingsPageWrapper() {
  return (
    <Suspense>
      <BrandSettingsPage />
    </Suspense>
  )
}
