'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  CircleCheck,
  Copy,
  CreditCard,
  Fingerprint,
  GalleryHorizontal,
  House,
  Info,
  Palette,
  PanelBottom,
  PanelLeft,
  Share2,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type SectionId =
  | 'general' | 'identity' | 'theme'
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

function CopyableId({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-sm text-foreground">{value}</span>
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

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Name <span className="text-destructive">*</span>
          </label>
          <Input
            size="xl"
            placeholder="Brand name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Active</label>
            <p className="text-xs text-muted-foreground">
              Inactive brands are hidden from players.
            </p>
          </div>
          <Switch checked={active} onCheckedChange={setActive} aria-label="Brand active" />
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
        <div className="max-w-3xl flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Brand Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {BRAND.name} · {BRAND.operatorName}
            </p>
          </div>
          <span
            className={cn(
              'mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0',
              BRAND.active ? 'bg-success-bg text-success' : 'bg-muted text-muted-foreground'
            )}
          >
            <CircleCheck className="size-3.5" />
            {BRAND.active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <Separator className="mt-6" />

        <div className="mt-6 flex flex-col sm:flex-row sm:gap-10">
          <BrandSettingsNav active={section} onChange={setSection} />

          <div className="flex-1 mt-4 sm:mt-0 max-w-lg">
            {section === 'general'
              ? <GeneralSection />
              : <PlaceholderSection item={current} />}
          </div>
        </div>
      </div>
    </>
  )
}
