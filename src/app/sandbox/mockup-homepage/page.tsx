'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  GripVertical,
  ImagePlay,
  LayoutGrid,
  TrendingUp,
  Star,
  Building2,
  Gift,
  Activity,
  FileText,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId =
  | 'banner'
  | 'categories'
  | 'top'
  | 'editorial'
  | 'providers'
  | 'promos'
  | 'feed'
  | 'seo'

type BadgeType = 'auto' | 'manual'
type SelectionMode = 'auto' | 'manual' | 'mixed'
type Lang = 'EN' | 'DE' | 'UA'

interface Section {
  id: SectionId
  label: string
  description: string
  icon: React.ReactNode
  badge?: BadgeType
  enabled: boolean
}

interface Slide {
  id: string
  abbr: string
  title: string
  meta: string
}

interface ToggleItem {
  id: string
  label: string
  enabled: boolean
}

interface GameSlot {
  id: string
  name: string
  selected: boolean
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_SECTIONS: Section[] = [
  { id: 'banner',     label: 'Banner slider',   description: 'Manage promotional banners',       icon: <ImagePlay  className="size-4" />, enabled: true  },
  { id: 'categories', label: 'Game categories', description: 'Toggle and reorder tabs',          icon: <LayoutGrid className="size-4" />, enabled: true  },
  { id: 'top',        label: 'Top games',       description: 'Auto or manual game selection',    icon: <TrendingUp className="size-4" />, badge: 'auto',   enabled: true  },
  { id: 'editorial',  label: "Editor's picks",  description: 'Hand-pick games for this section', icon: <Star       className="size-4" />, badge: 'manual', enabled: true  },
  { id: 'providers',  label: 'Game providers',  description: 'Show/hide provider logos',         icon: <Building2  className="size-4" />, enabled: true  },
  { id: 'promos',     label: 'Promo cards',     description: 'Feature cards for missions, VIP',  icon: <Gift       className="size-4" />, enabled: false },
  { id: 'feed',       label: 'Live bets feed',  description: 'Recent wins table',                icon: <Activity   className="size-4" />, enabled: true  },
  { id: 'seo',        label: 'SEO text',        description: 'Displayed at bottom of homepage',  icon: <FileText   className="size-4" />, enabled: true  },
]

const INITIAL_SLIDES: Slide[] = [
  { id: 's1', abbr: '225%', title: 'Welcome bonus package', meta: '225% up to €2000 + 225 FS · Guests only · Active' },
  { id: 's2', abbr: 'VIP',  title: 'VIP Reload bonus',      meta: '50% up to €500 · VIP only · Scheduled Apr 5'     },
  { id: 's3', abbr: 'FS',   title: 'Friday free spins',     meta: '50 FS on Book of Dead · All users · Active'      },
]

const INITIAL_CATEGORIES: ToggleItem[] = [
  { id: 'top',   label: 'TOP',         enabled: true  },
  { id: 'new',   label: 'NEW',         enabled: true  },
  { id: 'hot',   label: 'HOT',         enabled: true  },
  { id: 'slots', label: 'Slots',       enabled: true  },
  { id: 'live',  label: 'Live Casino', enabled: true  },
  { id: 'crash', label: 'Crash Games', enabled: false },
  { id: 'table', label: 'Table Games', enabled: true  },
]

const INITIAL_PROMOS: ToggleItem[] = [
  { id: 'missions',    label: 'Daily missions', enabled: true  },
  { id: 'vip',         label: 'VIP club',       enabled: true  },
  { id: 'tournaments', label: 'Tournaments',    enabled: true  },
  { id: 'wheel',       label: 'Lucky wheel',    enabled: false },
  { id: 'shop',        label: 'Prize shop',     enabled: true  },
  { id: 'cashback',    label: 'Cashback',       enabled: true  },
]

const INITIAL_PROVIDER_CHIPS: ToggleItem[] = [
  { id: 'ezugi',   label: 'Ezugi',         enabled: true  },
  { id: 'pp',      label: 'Pragmatic Play', enabled: true  },
  { id: 'evo',     label: 'Evolution',     enabled: true  },
  { id: 'png',     label: "Play'n GO",     enabled: true  },
  { id: 'netent',  label: 'NetEnt',        enabled: true  },
  { id: 'amatic',  label: 'Amatic',        enabled: true  },
  { id: 'ygg',     label: 'Yggdrasil',     enabled: false },
  { id: 'hacksaw', label: 'Hacksaw',       enabled: false },
  { id: 'push',    label: 'Push Gaming',   enabled: false },
  { id: 'relax',   label: 'Relax Gaming',  enabled: false },
]

const INITIAL_GAMES: GameSlot[] = [
  { id: 'g1', name: 'Olympus',    selected: true  },
  { id: 'g2', name: 'Book Dead',  selected: true  },
  { id: 'g3', name: 'Dog House',  selected: true  },
  { id: 'g4', name: 'Sweet Bon.', selected: true  },
  { id: 'g5', name: 'Pharaoh',    selected: true  },
  { id: 'g6', name: 'Big Bass',   selected: true  },
  { id: 'g7', name: 'Starburst',  selected: true  },
  { id: 'g8', name: '',           selected: false },
]

// ─── Shared helpers ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-muted-foreground">{children}</p>
}

function FieldGroup({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  )
}

function SectionBadge({ type }: { type: BadgeType }) {
  return (
    <span className={cn(
      'shrink-0 rounded px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider',
      type === 'auto'
        ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
    )}>
      {type}
    </span>
  )
}

function SortableRow({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50">
      <GripVertical className="size-3.5 shrink-0 text-muted-foreground/40" />
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  )
}

// ─── Generic toggle-list panel (Categories + Promos share this) ───────────────

function ToggleListPanel({ initial, description }: { initial: ToggleItem[]; description: string }) {
  const [items, setItems] = useState<ToggleItem[]>(initial)

  function toggle(id: string) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)))
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-2 p-6">
        <FieldLabel>{description}</FieldLabel>
        <div className="mt-1 flex flex-col gap-2">
          {items.map((item) => (
            <SortableRow key={item.id} label={item.label} enabled={item.enabled} onToggle={() => toggle(item.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Banner slider panel ──────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-muted/40 px-4 py-3">
      <p className="text-xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function BannerPanel() {
  const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES)

  function removeSlide(id: string) {
    setSlides((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-6 p-6">

        <div className="flex gap-3">
          <StatCard value="3"     label="Active slides" />
          <StatCard value="4.2s"  label="Auto-rotate"   />
          <StatCard value="12.4%" label="Avg CTR"        />
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel>Slides</FieldLabel>
          <div className="mt-1 flex flex-col gap-2">
            {slides.map((slide) => (
              <div key={slide.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50">
                <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-[#0f1623] dark:bg-[#1e2535] text-[10px] font-bold text-white">
                  {slide.abbr}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{slide.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{slide.meta}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button variant="outline" size="sm">
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => removeSlide(slide.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-3 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
              <Plus className="size-3.5" />
              Add slide
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Auto-rotate interval">
            <Select defaultValue="4s">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="4s">4 seconds</SelectItem>
                <SelectItem value="6s">6 seconds</SelectItem>
                <SelectItem value="off">No rotation</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Show to">
            <Select defaultValue="all">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All visitors</SelectItem>
                <SelectItem value="guests">Guests only</SelectItem>
                <SelectItem value="logged">Logged in only</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </div>

      </div>
    </div>
  )
}

// ─── Live bets feed panel ─────────────────────────────────────────────────────

function FeedPanel() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-5 p-6 max-w-[560px]">
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Default tab">
            <Select defaultValue="casino">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="casino">Casino</SelectItem>
                <SelectItem value="sport">Sport</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Rows visible">
            <Input type="number" defaultValue="10" />
          </FieldGroup>
        </div>
        <FieldGroup label="Minimum payout to show (€)" className="max-w-[180px]">
          <Input type="number" defaultValue="100" />
        </FieldGroup>
        <FieldGroup label="Mask player names">
          <Select defaultValue="partial">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="partial">Show partial (User4534***)</SelectItem>
              <SelectItem value="full">Show full username</SelectItem>
              <SelectItem value="hide">Hide completely</SelectItem>
            </SelectContent>
          </Select>
        </FieldGroup>
      </div>
    </div>
  )
}

// ─── Top games panel ──────────────────────────────────────────────────────────

function TopGamesPanel() {
  const [mode, setMode] = useState<SelectionMode>('auto')

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-5 p-6 max-w-[600px]">

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Section title">
            <Input defaultValue="Top games" />
          </FieldGroup>
          <FieldGroup label="Max games">
            <Input type="number" defaultValue="14" />
          </FieldGroup>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel>Selection mode</FieldLabel>
          <div className="flex w-fit overflow-hidden rounded-lg border border-border">
            {(['auto', 'manual', 'mixed'] as SelectionMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'px-4 py-1.5 text-sm font-medium capitalize transition-colors',
                  m !== 'auto' && 'border-l border-border',
                  mode === m
                    ? 'bg-foreground text-background'
                    : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {mode !== 'manual' && (
          <FieldGroup label="Auto rule">
            <Select defaultValue="sessions">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sessions">Most sessions — last 7 days</SelectItem>
                <SelectItem value="ggr">Highest GGR — last 24h</SelectItem>
                <SelectItem value="players">Most unique players — last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        )}

        <div className="grid grid-cols-2 gap-4">
          {mode !== 'manual' && (
            <FieldGroup label="Refresh interval">
              <Select defaultValue="1h">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Every hour</SelectItem>
                  <SelectItem value="6h">Every 6 hours</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
          )}
          <FieldGroup label='Link "All Games"'>
            <Input defaultValue="/games" />
          </FieldGroup>
        </div>

      </div>
    </div>
  )
}

// ─── Editor's picks panel ─────────────────────────────────────────────────────

function EditorialPanel() {
  const [games, setGames] = useState<GameSlot[]>(INITIAL_GAMES)

  function toggleGame(id: string) {
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, selected: !g.selected } : g)))
  }

  const selectedCount = games.filter((g) => g.selected).length

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-5 p-6">
        <FieldGroup label="Section title" className="max-w-[400px]">
          <Input defaultValue="Editor's picks" />
        </FieldGroup>

        <div className="flex flex-col gap-2">
          <FieldLabel>Selected games — {selectedCount} of {games.length} slots</FieldLabel>
          <div className="mt-1 grid grid-cols-7 gap-2">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => toggleGame(game.id)}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-xl border text-[9px] font-semibold transition-all',
                  game.selected
                    ? 'border-foreground bg-background text-foreground'
                    : 'border-border bg-muted/40 text-muted-foreground hover:border-foreground/30 hover:bg-muted',
                )}
              >
                {game.selected && game.name
                  ? <span className="px-1 leading-tight">{game.name}</span>
                  : <Plus className="size-3 m-auto text-muted-foreground/50" />
                }
                {game.selected && (
                  <span className="absolute right-1 top-0.5 text-[8px] font-bold text-foreground/50">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <FieldGroup label="Search game catalog" className="max-w-[400px]">
          <Input placeholder="Type game name or provider…" />
        </FieldGroup>
      </div>
    </div>
  )
}

// ─── Game providers panel ─────────────────────────────────────────────────────

function ProvidersHomepagePanel() {
  const [chips, setChips] = useState<ToggleItem[]>(INITIAL_PROVIDER_CHIPS)

  function toggleChip(id: string) {
    setChips((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)))
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-2">
          <FieldLabel>Visible providers — click to toggle</FieldLabel>
          <div className="mt-1 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => toggleChip(chip.id)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                  chip.enabled
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
        <FieldGroup label="Display limit" className="max-w-[200px]">
          <Input type="number" defaultValue="8" min={4} max={20} />
        </FieldGroup>
      </div>
    </div>
  )
}

// ─── SEO text panel ───────────────────────────────────────────────────────────

function SeoPanel() {
  const [lang, setLang] = useState<Lang>('EN')

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-5 p-6 max-w-[640px]">

        <div className="flex gap-1.5">
          {(['EN', 'DE', 'UA'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                'rounded-md border px-3 py-1 text-xs font-semibold transition-colors',
                lang === l
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground',
              )}
            >
              {l}
            </button>
          ))}
        </div>

        <FieldGroup label="H1">
          <Input defaultValue="Online Casino — Slots, Live Casino & Sports Betting" />
        </FieldGroup>
        <FieldGroup label="Meta title">
          <Input defaultValue="BetUp Casino — Play Slots, Live Games & Win Big" />
        </FieldGroup>
        <FieldGroup label="Meta description">
          <Textarea rows={2} defaultValue="Play 3000+ slots, live casino and sports betting at BetUp. Welcome bonus 225% up to €2000." />
        </FieldGroup>

        <Separator />

        <FieldGroup label="SEO body text (HTML)">
          <Textarea
            rows={6}
            className="font-mono text-xs"
            defaultValue={'<h2>General Rules</h2>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>\n\n<h2>Responsible Gaming</h2>\n<p>We promote responsible gaming. If you need help, contact our support team.</p>'}
          />
        </FieldGroup>

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label='"Show more" after (chars)'>
            <Input type="number" defaultValue="400" />
          </FieldGroup>
          <FieldGroup label="Collapse by default">
            <Select defaultValue="yes">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </div>

      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MockupHomepagePage() {
  const [activeId, setActiveId] = useState<SectionId>('banner')
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS)

  const activeSection = sections.find((s) => s.id === activeId)!

  function toggleSection(id: SectionId, e: React.MouseEvent) {
    e.stopPropagation()
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  function renderPanel() {
    switch (activeId) {
      case 'banner':     return <BannerPanel />
      case 'categories': return <ToggleListPanel initial={INITIAL_CATEGORIES} description="Drag to reorder · toggle to show/hide" />
      case 'top':        return <TopGamesPanel />
      case 'editorial':  return <EditorialPanel />
      case 'providers':  return <ProvidersHomepagePanel />
      case 'promos':     return <ToggleListPanel initial={INITIAL_PROMOS} description="Toggle promo cards to show/hide on homepage" />
      case 'feed':       return <FeedPanel />
      case 'seo':        return <SeoPanel />
    }
  }

  return (
    <div className="py-12 pb-20">
      <div className="mx-auto max-w-[1240px] px-4">

        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/sandbox" className="transition-colors hover:text-foreground">Sandbox</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">Homepage configurator</span>
        </nav>

        <div className="mb-8">
          <h1 className="mb-2 text-[2rem] font-bold tracking-[-0.03em]">Homepage configurator</h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Configure sections of the casino homepage. Toggle visibility, reorder blocks, and edit content.
          </p>
        </div>

        <div className="flex h-[calc(100vh-16rem)] min-h-[600px] overflow-hidden rounded-xl border border-border">

          <aside className="flex w-[240px] shrink-0 flex-col border-r border-border bg-muted/30">
            <div className="border-b border-border px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                Page sections
              </p>
            </div>
            <div className="flex-1 overflow-y-auto py-1.5">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveId(section.id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 border-l-2 px-3 py-2.5 text-left text-sm transition-colors',
                    section.id === activeId
                      ? 'border-foreground bg-background text-foreground'
                      : 'border-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground',
                  )}
                >
                  <GripVertical className="size-3.5 shrink-0 text-muted-foreground/40" />
                  <span className="flex-1 truncate font-medium">{section.label}</span>
                  {section.badge && <SectionBadge type={section.badge} />}
                  <Switch
                    checked={section.enabled}
                    onCheckedChange={() => {}}
                    onClick={(e) => toggleSection(section.id, e)}
                    className="shrink-0"
                  />
                </button>
              ))}
            </div>
          </aside>

          <main className="flex flex-1 flex-col overflow-hidden bg-background">
            <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {activeSection.icon}
                </div>
                <div>
                  <p className="text-[15px] font-medium leading-tight">{activeSection.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{activeSection.description}</p>
                </div>
              </div>
              <Button size="sm">Save changes</Button>
            </div>
            {renderPanel()}
          </main>

        </div>
      </div>
    </div>
  )
}
