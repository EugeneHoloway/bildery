'use client'
import { Suspense, useContext, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Archive,
  ArchiveRestore,
  Check,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleOff,
  Copy,
  CreditCard,
  Fingerprint,
  GalleryHorizontal,
  GripVertical,
  House,
  Images,
  Info,
  Palette,
  Plus,
  Power,
  RotateCcw,
  PanelBottom,
  PanelLeft,
  Languages,
  Layers,
  Share2,
  Trash2,
  Upload,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from '@/components/AuthProvider'
import { formatDateTime } from '@/components/DateTimePicker'
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
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
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
import {
  ARCHIVE_RETENTION_DAYS,
  AUTOPLAY_DEFAULT,
  AUTOPLAY_MIN,
  BANNERS,
  BANNER_BREAKPOINTS,
  bannerHref,
  bannerName,
  bannerThumb,
  daysUntilPurge,
  imageCount,
  bannerStatus,
  STATE_LABEL,
  validateAutoplay,
  type BannerItem,
  type BannerState,
  type SlidesPerView,
} from './_lib/banners'
import {
  commitDepositMethods,
  DEPOSIT_KIND_ICON,
  DEPOSIT_KIND_LABEL,
  DEPOSIT_KINDS,
  DEPOSIT_METHODS,
  DEPOSIT_METHODS_DEFAULTS,
  depositMethodHref,
  depositMethodName,
  newDepositMethod,
  providerLabel,
  type DepositKind,
  type DepositMethod,
} from './_lib/deposit-methods'
import { SectionActions, SectionContext, SectionHeader, useSaveable } from './_lib/section'
import { BRAND_COLORS, readableOn } from './_lib/theme'
import { useBlobUrls } from './_lib/use-blob-urls'

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
  colors: BRAND_COLORS as Record<ColorKey, string>,
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

function IdentitySection() {
  const { go } = useContext(SectionContext)
  const [canonicalUrl, setCanonicalUrl] = useState(IDENTITY.canonicalUrl)
  const [logo, setLogo] = useState<{ light: string; dark: string } | null>(IDENTITY.logo)
  const [favicon, setFavicon] = useState<string | null>(IDENTITY.favicon)
  const { blobUrl, release } = useBlobUrls()
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
          preview={logo && (
            <img src={logo.light} alt="Logo" className="max-h-full max-w-full object-contain" />
          )}
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

function DepositMethodRow({ method, onToggle, onRemove }: {
  method: DepositMethod
  onToggle: (enabled: boolean) => void
  onRemove: () => void
}) {
  const { navigate } = useContext(SectionContext)
  const Icon = DEPOSIT_KIND_ICON[method.kind]
  const name = depositMethodName(method)
  const href = depositMethodHref(method.id)
  const main = providerLabel(method)
  const enabledCount = method.options.filter(o => o.enabled).length
  const switchId = `deposit-${method.id}-enabled`

  return (
    <li className="flex items-center gap-1 px-2 py-1.5">
      {/* The whole icon + text area opens the method page, like banner rows; toggle and delete stay outside it */}
      <Link
        href={href}
        onClick={e => {
          // Modifier clicks open a new tab and bypass the dirty guard on purpose
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
          e.preventDefault()
          navigate(href)
        }}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1.5 py-1 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Icon className={cn('size-5', method.enabled ? 'text-foreground' : 'text-muted-foreground')} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className={cn('truncate text-sm font-medium', !method.enabled && 'text-muted-foreground')}>{name}</span>
            <Badge variant="secondary">{DEPOSIT_KIND_LABEL[method.kind]}</Badge>
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            Main: {main ?? 'not set'} · {enabledCount}/{method.options.length} options on
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Wrapper takes the trigger's data-state/data-slot, which would otherwise override the Switch's own */}
          <span className="mx-2 flex">
            <Switch
              id={switchId}
              checked={method.enabled}
              onCheckedChange={onToggle}
              aria-label={`${method.enabled ? 'Disable' : 'Enable'} ${name}`}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>{method.enabled ? 'Shown in the deposit modal' : 'Hidden from the deposit modal'}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Remove ${name}`} onClick={onRemove}>
            <Trash2 className="text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove method</TooltipContent>
      </Tooltip>
    </li>
  )
}

function DepositMethodsSection() {
  const [methods, setMethods] = useState<DepositMethod[]>(DEPOSIT_METHODS)
  const { dirty, saving, save, reset } = useSaveable({ methods }, v => setMethods(v.methods), v => commitDepositMethods(v.methods))

  const missing = DEPOSIT_KINDS.filter(k => !methods.some(m => m.kind === k))
  const isDefault = JSON.stringify(methods) === JSON.stringify(DEPOSIT_METHODS_DEFAULTS)

  function add(kind: DepositKind) {
    // Keep Crypto above Fiat regardless of the order they were added in
    setMethods(list => [...list, newDepositMethod(kind)].sort((a, b) => DEPOSIT_KINDS.indexOf(a.kind) - DEPOSIT_KINDS.indexOf(b.kind)))
  }

  function restoreDefaults() {
    setMethods(DEPOSIT_METHODS_DEFAULTS)
    toast('Defaults restored. Save to apply them.')
  }

  const addButton = (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* The span keeps the tooltip on the disabled button */}
          <span>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={missing.length === 0}>
                <Plus data-icon="inline-start" />
                Add method
              </Button>
            </DropdownMenuTrigger>
          </span>
        </TooltipTrigger>
        {missing.length === 0 && <TooltipContent>Both Crypto and Fiat blocks are already added</TooltipContent>}
      </Tooltip>
      <DropdownMenuContent align="start">
        {missing.map(kind => (
          <DropdownMenuItem key={kind} onSelect={() => add(kind)}>{DEPOSIT_KIND_LABEL[kind]}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const restoreButton = (
    <Button variant="ghost" size="sm" onClick={restoreDefaults} disabled={isDefault}>
      <RotateCcw data-icon="inline-start" />
      Restore defaults
    </Button>
  )

  return (
    <>
      <SectionHeader
        title="Deposit methods"
        description="Configure the deposit modal: which payment methods players see and how they can deposit within each one."
      />

      <div className="mt-8">
        <h3 className="text-base font-medium">Methods</h3>
        <p className="text-sm text-muted-foreground">
          One Crypto and one Fiat block ({methods.length}/{DEPOSIT_KINDS.length}). Each block opens the deposit with its Main provider.
        </p>
      </div>

      {methods.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <CreditCard className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No deposit methods. Players can't deposit on this brand.</p>
          <div className="flex items-center gap-2">
            {addButton}
            {restoreButton}
          </div>
        </div>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
            {methods.map(method => (
              <DepositMethodRow
                key={method.id}
                method={method}
                onToggle={enabled => setMethods(list => list.map(m => (m.id === method.id ? { ...m, enabled } : m)))}
                onRemove={() => setMethods(list => list.filter(m => m.id !== method.id))}
              />
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-2">
            {addButton}
            {restoreButton}
          </div>
        </>
      )}

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
        <FieldGroup className="mt-8 max-w-2xl">
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

const LAYOUTS: { value: SlidesPerView; title: string; description: string }[] = [
  { value: 1, title: 'Hero', description: 'One full-width banner at a time, the classic hero slider.' },
  { value: 3, title: 'Row',  description: 'Three compact banners side by side -- 2 on tablet, 1 on mobile.' },
]

// Schematic of a carousel layout, filled with the first banners so it shows what players will see
function CarouselPreview({ slides, thumbs }: { slides: SlidesPerView; thumbs: (string | null)[] }) {
  return (
    <div className="flex w-full flex-col items-center gap-2 rounded-lg border border-border bg-muted/40 p-3" aria-hidden>
      <div className="flex w-full gap-1.5">
        {Array.from({ length: slides }, (_, i) => {
          const src = thumbs[i]
          return (
            <div key={i} className="h-16 flex-1 overflow-hidden rounded-md border border-border bg-muted">
              {src && <img src={src} alt="" className="size-full object-cover" />}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-1">
        <span className="h-1 w-3 rounded-full bg-foreground" />
        <span className="size-1 rounded-full bg-muted-foreground/40" />
        <span className="size-1 rounded-full bg-muted-foreground/40" />
      </div>
    </div>
  )
}

const STATE_BADGE: Record<BannerState, React.ComponentProps<typeof Badge>['variant']> = {
  live: 'success', scheduled: 'secondary', ended: 'ghost', draft: 'outline',
}

function stripProtocol(url: string) {
  return url.replace(/^https?:\/\//, '')
}

function ImageThumb({ item, className }: { item: BannerItem; className?: string }) {
  const src = bannerThumb(item)
  return (
    <div className={cn('flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted', className)}>
      {src ? <img src={src} alt="" className="size-full object-cover" /> : <Images className="size-4 text-muted-foreground" />}
    </div>
  )
}

function ImageRow({ item, index, onArchive }: { item: BannerItem; index: number; onArchive: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const { navigate } = useContext(SectionContext)
  const name = bannerName(item, `Image ${index + 1}`)
  const href = bannerHref(item.id)
  const backgrounds = imageCount(item.background)
  const artworks = imageCount(item.artwork)
  const status = bannerStatus(item)

  return (
    <li
      ref={setNodeRef}
      // Позиция элемента во время перетаскивания -- единственный оправданный inline-style
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center gap-1 bg-background px-2 py-1.5', isDragging && 'relative z-10 opacity-80 shadow-md')}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label={`Reorder ${name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical />
      </Button>
      <span className="w-5 shrink-0 text-center text-xs tabular-nums text-muted-foreground">{index + 1}</span>
      <Link
        href={href}
        onClick={e => {
          // Modifier clicks open a new tab and bypass the dirty guard on purpose
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
          e.preventDefault()
          navigate(href)
        }}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1.5 py-1 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ImageThumb item={item} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {item.cta.href.trim() ? stripProtocol(item.cta.href) : 'Not clickable'}
          </span>
        </span>
        {/* Status + schedule columns; hidden below desktop where the row gets tight */}
        <span className="hidden w-24 shrink-0 desktop:block">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant={STATE_BADGE[status.state]}>{STATE_LABEL[status.state]}</Badge>
            </TooltipTrigger>
            <TooltipContent>{status.label}</TooltipContent>
          </Tooltip>
        </span>
        <span className="hidden w-44 shrink-0 flex-col text-xs tabular-nums text-muted-foreground desktop:flex">
          <span className="truncate">{formatDateTime(new Date(item.schedule.startsAt))}</span>
          <span className="truncate">{item.schedule.endsAt ? formatDateTime(new Date(item.schedule.endsAt)) : 'No end date'}</span>
        </span>
        <span className="hidden w-28 shrink-0 items-center gap-3 text-xs tabular-nums text-muted-foreground sm:flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1"><Images className="size-3.5" />{backgrounds}/{BANNER_BREAKPOINTS.length}</span>
            </TooltipTrigger>
            <TooltipContent>{item.composition === 'layered' ? 'Background' : 'Banner'} images per breakpoint</TooltipContent>
          </Tooltip>
          {item.composition === 'layered' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1"><Layers className="size-3.5" />{artworks}/{BANNER_BREAKPOINTS.length}</span>
              </TooltipTrigger>
              <TooltipContent>Artwork cut-outs per breakpoint</TooltipContent>
            </Tooltip>
          )}
        </span>
        {backgrounds === 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleAlert className="size-4 shrink-0 text-muted-foreground" aria-label="No background" />
            </TooltipTrigger>
            <TooltipContent>No background -- shows the default banner colour</TooltipContent>
          </Tooltip>
        )}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Live images must be stopped first; the span keeps the tooltip on the disabled button */}
          <span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Archive ${name}`}
              onClick={onArchive}
              disabled={status.state === 'live'}
            >
              <Archive className="text-muted-foreground" />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{status.state === 'live' ? 'Stop the image before archiving' : 'Archive'}</TooltipContent>
      </Tooltip>
    </li>
  )
}

function ArchivedRow({ item, onRestore }: { item: BannerItem; onRestore: () => void }) {
  const name = bannerName(item)
  const days = daysUntilPurge(item.archivedAt!)
  return (
    <li className="flex items-center gap-3 px-3 py-2">
      <ImageThumb item={item} className="opacity-60" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-muted-foreground">{name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {days === 0 ? 'Deleted today' : `Deleted in ${days} ${days === 1 ? 'day' : 'days'}`}
        </span>
      </span>
      <Button variant="outline" size="sm" onClick={onRestore}>
        <ArchiveRestore data-icon="inline-start" />
        Restore
      </Button>
    </li>
  )
}

function BannersSection() {
  const { navigate } = useContext(SectionContext)
  const [slidesPerView, setSlidesPerView] = useState<SlidesPerView>(BANNERS.slidesPerView)
  const [autoplayDelay, setAutoplayDelay] = useState(String(BANNERS.autoplayDelay))
  const [items, setItems] = useState<BannerItem[]>(BANNERS.items)
  const [toArchive, setToArchive] = useState<BannerItem | null>(null)
  const { dirty, saving, save, reset } = useSaveable({ slidesPerView, autoplayDelay, items }, v => {
    setSlidesPerView(v.slidesPerView)
    setAutoplayDelay(v.autoplayDelay)
    setItems(v.items)
  })

  const active = items.filter(i => !i.archivedAt)
  const archived = items.filter(i => i.archivedAt)
  const autoplayError = validateAutoplay(autoplayDelay)
  const thumbs = active.slice(0, 3).map(bannerThumb)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function onDragEnd({ active: a, over }: DragEndEvent) {
    if (!over || a.id === over.id) return
    setItems(list => arrayMove(list, list.findIndex(i => i.id === a.id), list.findIndex(i => i.id === over.id)))
  }

  function archive(id: string) {
    const at = new Date().toISOString()
    setItems(list => list.map(i => (i.id === id ? { ...i, archivedAt: at } : i)))
    setToArchive(null)
  }

  // Restored banners go to the end of the carousel
  function restore(id: string) {
    setItems(list => {
      const item = list.find(i => i.id === id)
      return item ? [...list.filter(i => i.id !== id), { ...item, archivedAt: null }] : list
    })
  }

  const newHref = bannerHref('new')
  const addButton = (
    <Button variant="outline" size="sm" asChild>
      <Link
        href={newHref}
        onClick={e => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
          e.preventDefault()
          navigate(newHref)
        }}
      >
        <Plus data-icon="inline-start" />
        Add image
      </Link>
    </Button>
  )

  return (
    <>
      <SectionHeader title="Banners" description="Home page carousel: layout, timing and banner images per breakpoint." />

      <FieldGroup className="mt-8">
        <Field>
          <FieldLabel id="layout-label">Layout</FieldLabel>
          <RadioGroup
            value={String(slidesPerView)}
            onValueChange={v => setSlidesPerView(Number(v) as SlidesPerView)}
            aria-labelledby="layout-label"
            className="grid-cols-1 gap-3 tablet:grid-cols-2 desktop:max-w-2xl"
          >
            {LAYOUTS.map(layout => (
              <FieldLabel key={layout.value} htmlFor={`layout-${layout.value}`}>
                <Field orientation="horizontal">
                  <RadioGroupItem value={String(layout.value)} id={`layout-${layout.value}`} />
                  <FieldContent>
                    <CarouselPreview slides={layout.value} thumbs={thumbs} />
                    <FieldTitle className="mt-2">{layout.title}</FieldTitle>
                    <FieldDescription>{layout.description}</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </Field>
        <Field data-invalid={!!autoplayError || undefined}>
          <FieldLabel htmlFor="autoplay-delay">Autoplay delay</FieldLabel>
          <InputGroup className="max-w-40">
            <InputGroupInput
              id="autoplay-delay"
              type="number"
              inputMode="numeric"
              min={AUTOPLAY_MIN}
              step={500}
              value={autoplayDelay}
              onChange={e => setAutoplayDelay(e.target.value)}
              aria-invalid={!!autoplayError || undefined}
            />
            <InputGroupAddon align="inline-end">ms</InputGroupAddon>
          </InputGroup>
          <FieldDescription>
            How long the carousel waits before advancing to the next image. Default {AUTOPLAY_DEFAULT} ms, minimum {AUTOPLAY_MIN}.
          </FieldDescription>
          <FieldError>{autoplayError}</FieldError>
        </Field>
      </FieldGroup>

      <div className="mt-8 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-medium">Images</h3>
          <p className="text-sm text-muted-foreground">Shown in this order -- drag the handle to reorder.</p>
        </div>
        {active.length > 0 && addButton}
      </div>

      {active.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <GalleryHorizontal className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No images yet. The carousel is hidden on the storefront.</p>
          {addButton}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={active.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {active.map((item, index) => (
                <ImageRow key={item.id} item={item} index={index} onArchive={() => setToArchive(item)} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {archived.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-medium">Archived</h3>
          <p className="text-sm text-muted-foreground">
            Hidden from the storefront and permanently deleted {ARCHIVE_RETENTION_DAYS} days after archiving.
          </p>
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
            {archived.map(item => (
              <ArchivedRow key={item.id} item={item} onRestore={() => restore(item.id)} />
            ))}
          </ul>
        </div>
      )}

      <AlertDialog open={toArchive !== null} onOpenChange={open => { if (!open) setToArchive(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {toArchive ? bannerName(toArchive, 'this image') : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              The image is removed from the carousel and permanently deleted {ARCHIVE_RETENTION_DAYS} days
              after archiving. You can restore it from the archive until then.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (toArchive) archive(toArchive.id) }}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SectionActions dirty={dirty} saving={saving} onSave={save} onReset={reset} canSave={!autoplayError} />
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
  // Navigation held back by the dirty guard: sections are replaced in place, other routes are pushed
  const [pending, setPending] = useState<{ href: string; replace: boolean } | null>(null)
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

  function run({ href, replace }: { href: string; replace: boolean }) {
    if (replace) router.replace(href, { scroll: false })
    else router.push(href)
  }

  function go(id: SectionId) {
    if (id === section) return
    const target = { href: sectionHref(id), replace: true }
    if (dirty) setPending(target)
    else run(target)
  }

  function navigate(href: string) {
    const target = { href, replace: false }
    if (dirty) setPending(target)
    else run(target)
  }

  function discardAndGo() {
    if (!pending) return
    run(pending)
    setPending(null)
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
                <SectionContext.Provider value={{ reportDirty: setDirty, go: id => go(id as SectionId), navigate }}>
                  {section === 'general' && <GeneralSection active={brandActive} onActiveChange={setBrandActive} />}
                  {section === 'identity' && <IdentitySection />}
                  {section === 'locale' && <LocaleSection />}
                  {section === 'theme' && <ThemeSection />}
                  {section === 'banners' && <BannersSection />}
                  {section === 'social' && <SocialSection />}
                  {section === 'deposit-methods' && <DepositMethodsSection />}
                  {section === 'wallet-auto-provision' && <WalletAutoProvisionSection />}
                  {!['general', 'identity', 'locale', 'theme', 'banners', 'social', 'deposit-methods', 'wallet-auto-provision'].includes(section) && <PlaceholderSection item={current} />}
                </SectionContext.Provider>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={pending !== null} onOpenChange={open => { if (!open) setPending(null) }}>
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
