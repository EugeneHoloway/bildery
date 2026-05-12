'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuditItem {
  status: 'ok' | 'warn' | 'error'
  text: string
}

interface GameCard {
  id: string
  name: string
  provider: string
  abbr: string
  gradient: string
  selected: boolean
}

// ─── Data ────────────────────────────────────────────────────────────────────

const TITLE_MAX = 60
const DESC_MAX = 160

const INITIAL_TITLE = 'Game Providers — BetUp Casino | Slots & Live Games'
const INITIAL_DESC =
  'Explore 12 top game providers at BetUp Casino. Play 2000+ slots, live casino games and crash games from Pragmatic Play, Evolution, NetEnt and more.'
const INITIAL_H1 = 'Game providers at BetUp Casino'

const INITIAL_GAMES: GameCard[] = [
  { id: 'sweet-bonanza', name: 'Sweet Bonanza', provider: 'Pragmatic Play', abbr: 'PP', gradient: 'from-pink-400 to-red-400', selected: true },
  { id: 'gates-of-olympus', name: 'Gates of Olympus', provider: 'Pragmatic Play', abbr: 'PP', gradient: 'from-violet-700 to-indigo-500', selected: true },
  { id: 'big-bass', name: 'Big Bass Bonanza', provider: 'Pragmatic Play', abbr: 'PP', gradient: 'from-sky-500 to-cyan-400', selected: false },
  { id: 'wolf-gold', name: 'Wolf Gold', provider: 'Pragmatic Play', abbr: 'PP', gradient: 'from-blue-900 to-blue-600', selected: false },
  { id: 'lightning-roulette', name: 'Lightning Roulette', provider: 'Evolution', abbr: 'EVO', gradient: 'from-amber-600 to-amber-400', selected: true },
  { id: 'crazy-time', name: 'Crazy Time', provider: 'Evolution', abbr: 'EVO', gradient: 'from-red-600 to-orange-500', selected: true },
  { id: 'monopoly-live', name: 'Monopoly Live', provider: 'Evolution', abbr: 'EVO', gradient: 'from-green-700 to-green-400', selected: false },
  { id: 'starburst', name: 'Starburst', provider: 'NetEnt', abbr: 'NET', gradient: 'from-purple-700 to-fuchsia-600', selected: false },
  { id: 'gonzos-quest', name: "Gonzo's Quest", provider: 'NetEnt', abbr: 'NET', gradient: 'from-yellow-800 to-yellow-400', selected: false },
  { id: 'book-of-dead', name: 'Book of Dead', provider: "Play'n GO", abbr: 'PNG', gradient: 'from-amber-900 to-amber-500', selected: false },
  { id: 'reactoonz', name: 'Reactoonz', provider: "Play'n GO", abbr: 'PNG', gradient: 'from-emerald-800 to-emerald-400', selected: false },
  { id: 'jammin-jars', name: "Jammin' Jars", provider: "Play'n GO", abbr: 'PNG', gradient: 'from-rose-800 to-rose-400', selected: false },
]

const AUDIT_ITEMS: AuditItem[] = [
  { status: 'ok', text: 'H1 present and unique' },
  { status: 'ok', text: 'Title tag: 50 characters — good length' },
  { status: 'ok', text: 'Meta description: 148 characters — good length' },
  { status: 'warn', text: 'OG image not set — social shares will use fallback' },
  { status: 'ok', text: 'Page is indexable (robots: index, follow)' },
  { status: 'ok', text: 'Page included in sitemap' },
  { status: 'warn', text: 'No structured data — consider adding JSON-LD' },
  { status: 'ok', text: 'Canonical URL: self-referencing (correct)' },
  { status: 'error', text: 'DE and UA translations missing' },
]

// ─── Small helpers ────────────────────────────────────────────────────────────

function CharBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100)
  const color =
    value > max
      ? 'bg-destructive'
      : value > max * 0.83
      ? 'bg-success'
      : 'bg-amber-400'
  return (
    <div className="mt-1.5 h-[3px] w-full rounded-full bg-border">
      <div
        className={cn('h-[3px] rounded-full transition-all duration-150', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">{children}</div>
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function AuditDot({ status }: { status: AuditItem['status'] }) {
  if (status === 'ok') return <CheckCircle2 className="size-4 shrink-0 text-success" />
  if (status === 'warn') return <AlertTriangle className="size-4 shrink-0 text-amber-500" />
  return <XCircle className="size-4 shrink-0 text-destructive" />
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MockupSeoPage() {
  // Basic SEO state
  const [h1, setH1] = useState(INITIAL_H1)
  const [metaTitle, setMetaTitle] = useState(INITIAL_TITLE)
  const [metaDesc, setMetaDesc] = useState(INITIAL_DESC)
  const [activeLang, setActiveLang] = useState<'EN' | 'DE' | 'UA'>('EN')

  // Content tab state
  const [games, setGames] = useState(INITIAL_GAMES)
  const [gameSearch, setGameSearch] = useState('')

  const filteredGames = gameSearch
    ? games.filter((g) => g.name.toLowerCase().includes(gameSearch.toLowerCase()))
    : games

  const selectedCount = games.filter((g) => g.selected).length

  function toggleGame(id: string) {
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, selected: !g.selected } : g)))
  }

  // SERP preview values
  const serpTitle = metaTitle.length > TITLE_MAX ? metaTitle.slice(0, 57) + '…' : metaTitle
  const serpDesc = metaDesc.length > DESC_MAX ? metaDesc.slice(0, 157) + '…' : metaDesc

  return (
    <div className="py-12 pb-20">
      <div className="mx-auto max-w-[1240px] px-4">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/sandbox" className="hover:text-foreground transition-colors">
            Sandbox
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">SEO Settings</span>
        </nav>


        {/* Title */}
        <h1 className="mb-1 font-bold tracking-heading">SEO Settings</h1>
        <p className="mb-6 text-sm text-muted-foreground">Configure meta tags, structured data and indexing rules for this page.</p>
        <Separator className="mb-8" />

        {/* Info box */}
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-border bg-muted px-3 py-2.5">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-foreground leading-relaxed">
            Custom page. Configure URL, visibility and content below, then publish to make it live.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="main">
          <div className="border-b">
            <TabsList className="h-auto w-max gap-0 rounded-none bg-transparent p-0">
                {(['main', 'basic', 'content', 'og', 'advanced', 'audit'] as const).map((tab) => {
                  const labels: Record<string, string> = {
                    main: 'Main',
                    basic: 'Basic SEO',
                    content: 'Content',
                    og: 'Social / OG',
                    advanced: 'Advanced',
                    audit: 'SEO audit',
                  }
                  return (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="mb-[-1px] rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                      {labels[tab]}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {/* ── MAIN ───────────────────────────────────────────────────────── */}
            <TabsContent value="main" className="flex flex-col gap-4 pt-6 max-w-[720px]">
              <FieldRow>
                <FieldGroup label="Page title">
                  <Input defaultValue="Game providers" />
                </FieldGroup>
                <FieldGroup label="URL slug">
                  <Input defaultValue="/providers" />
                </FieldGroup>
              </FieldRow>
              <FieldRow>
                <FieldGroup label="Show in navigation">
                  <Select defaultValue="main">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Yes — main menu</SelectItem>
                      <SelectItem value="footer">Yes — footer only</SelectItem>
                      <SelectItem value="hidden">No — hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldGroup>
                <FieldGroup label="Access">
                  <Select defaultValue="public">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="loggedin">Logged in only</SelectItem>
                      <SelectItem value="vip">VIP only</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </FieldRow>
            </TabsContent>

            {/* ── BASIC SEO ──────────────────────────────────────────────────── */}
            <TabsContent value="basic" className="flex flex-col gap-4 pt-6 max-w-[720px]">

              {/* Language selector */}
              <div className="flex gap-1.5">
                {(['EN', 'DE', 'UA'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={cn(
                      'rounded-md border px-3 py-1 text-xs font-medium transition-colors',
                      activeLang === lang
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <FieldGroup label="H1 — page heading" hint="shown on the page, 1 per page">
                <Input
                  value={h1}
                  onChange={(e) => setH1(e.target.value)}
                />
              </FieldGroup>

              <FieldGroup label="Title tag" hint="shown in browser tab and Google">
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
                <CharBar value={metaTitle.length} max={TITLE_MAX} />
                <p className="text-xs text-muted-foreground">
                  {metaTitle.length} / {TITLE_MAX} characters
                </p>
              </FieldGroup>

              <FieldGroup label="Meta description" hint="shown under title in Google">
                <Textarea
                  rows={3}
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                />
                <CharBar value={metaDesc.length} max={DESC_MAX} />
                <p className="text-xs text-muted-foreground">
                  {metaDesc.length} / {DESC_MAX} characters
                </p>
              </FieldGroup>

              <Separator />

              {/* SERP preview */}
              <FieldGroup label="SERP preview">
                <div className="rounded-xl border bg-muted/40 p-4">
                  <p className="mb-2.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Google search result
                  </p>
                  <p className="text-xs text-serp-domain">betup.com › providers</p>
                  <p className="mt-0.5 text-lg font-normal leading-snug text-serp-title">
                    {serpTitle}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-serp-text">
                    {serpDesc}
                  </p>
                </div>
              </FieldGroup>
            </TabsContent>

            {/* ── CONTENT ────────────────────────────────────────────────────── */}
            <TabsContent value="content" className="flex flex-col gap-5 pt-6">

              {/* WYSIWYG placeholder — TipTap in Iteration 3 */}
              <div className="max-w-[720px]">
              <FieldGroup label="Page text" hint="shown on page below the provider grid">
                <div className="overflow-hidden rounded-lg border">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/50 px-2 py-1.5">
                    {['B', 'I', 'U', '|', 'H2', '¶', '|', '• list', '1. list', '|', '⌘ link'].map((t, i) =>
                      t === '|' ? (
                        <span key={i} className="mx-1 h-4 w-px bg-border" />
                      ) : (
                        <button
                          key={i}
                          className="inline-flex h-6 min-w-[26px] items-center justify-center rounded px-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          {t}
                        </button>
                      )
                    )}
                  </div>
                  <div
                    className="min-h-[160px] p-3 text-sm leading-relaxed outline-none"
                    contentEditable
                    suppressContentEditableWarning
                  >
                    <h2 className="mb-1 mt-0.5 text-sm font-semibold">
                      Top Game Providers at BetUp Casino
                    </h2>
                    <p className="mb-1.5">
                      BetUp Casino partners with 12 of the world's leading game studios, delivering over 2,000 slots, live casino tables, and crash games. From <strong>Pragmatic Play's</strong> iconic Sweet Bonanza to <strong>Evolution's</strong> live Lightning Roulette — every title is hand-picked for quality.
                    </p>
                    <p>
                      All providers are licensed, regularly audited for fairness, and offer games optimised for desktop and mobile.
                    </p>
                  </div>
                </div>
              </FieldGroup>
              </div>

              <Separator className="max-w-[720px]" />

              {/* Game selector */}
              <FieldGroup
                label="Featured games"
                hint={`${selectedCount} selected`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Input
                    placeholder="Search games…"
                    value={gameSearch}
                    onChange={(e) => setGameSearch(e.target.value)}
                    className="text-xs"
                  />
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {filteredGames.length} games
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 tablet:grid-cols-4">
                  {filteredGames.map((game) => (
                    <div
                      key={game.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleGame(game.id)}
                      onKeyDown={(e) => e.key === 'Enter' && toggleGame(game.id)}
                      className={cn(
                        'relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-colors',
                        game.selected
                          ? 'border-foreground bg-background'
                          : 'border-border bg-muted/40 hover:border-subtle-border'
                      )}
                    >
                      <Checkbox
                        checked={game.selected}
                        className="absolute right-2 top-2 pointer-events-none"
                      />
                      <span className="text-xs font-semibold leading-tight">{game.name}</span>
                      <span className="text-2xs text-muted-foreground">{game.provider}</span>
                    </div>
                  ))}
                </div>
              </FieldGroup>
            </TabsContent>

            {/* ── SOCIAL / OG ────────────────────────────────────────────────── */}
            <TabsContent value="og" className="flex flex-col gap-4 pt-6 max-w-[720px]">
              <FieldGroup label="OG title" hint="shown when sharing link on social">
                <Input defaultValue="Game Providers — BetUp Casino" />
              </FieldGroup>
              <FieldGroup label="OG description">
                <Textarea
                  rows={2}
                  defaultValue="Discover all game providers at BetUp. Slots, live casino and more from the world's top studios."
                />
              </FieldGroup>
              <FieldGroup label="OG image" hint="recommended 1200×630px">
                <div className="overflow-hidden rounded-lg border">
                  <div className="flex h-20 cursor-pointer items-center justify-center bg-muted/50 text-xs text-muted-foreground hover:bg-muted transition-colors">
                    Click to upload OG image (1200×630)
                  </div>
                  <div className="border-t bg-muted/50 px-3 py-2.5">
                    <p className="text-2xs uppercase tracking-wider text-muted-foreground">BETUP.COM</p>
                    <p className="mt-0.5 text-sm font-medium">Game Providers — BetUp Casino</p>
                    <p className="text-xs text-muted-foreground">Discover all game providers at BetUp.</p>
                  </div>
                </div>
              </FieldGroup>
              <FieldRow>
                <FieldGroup label="Twitter card type">
                  <Select defaultValue="large">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="large">summary_large_image</SelectItem>
                      <SelectItem value="summary">summary</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldGroup>
                <FieldGroup label="Twitter site handle">
                  <Input defaultValue="@betup" />
                </FieldGroup>
              </FieldRow>
            </TabsContent>

            {/* ── ADVANCED ───────────────────────────────────────────────────── */}
            <TabsContent value="advanced" className="flex flex-col gap-4 pt-6 max-w-[720px]">
              <FieldRow>
                <FieldGroup label="Canonical URL" hint="leave blank = self">
                  <Input placeholder="https://betup.com/providers" />
                </FieldGroup>
                <FieldGroup label="Robots">
                  <Select defaultValue="index">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="index">index, follow</SelectItem>
                      <SelectItem value="noindex-follow">noindex, follow</SelectItem>
                      <SelectItem value="noindex">noindex, nofollow</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </FieldRow>
              <FieldRow>
                <FieldGroup label="Include in sitemap">
                  <Select defaultValue="yes">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldGroup>
                <FieldGroup label="Sitemap priority">
                  <Select defaultValue="high">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">0.8 — high</SelectItem>
                      <SelectItem value="normal">0.5 — normal</SelectItem>
                      <SelectItem value="low">0.3 — low</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </FieldRow>
              <Separator />
              <FieldGroup label="Structured data (JSON-LD)">
                <Textarea
                  rows={5}
                  className="font-mono text-xs"
                  defaultValue={`{\n  "@context": "https://schema.org",\n  "@type": "ItemList",\n  "name": "Game providers at BetUp Casino"\n}`}
                />
              </FieldGroup>
              <FieldGroup label="Hreflang">
                <Select defaultValue="auto">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto — generate from active languages</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </FieldGroup>
            </TabsContent>

            {/* ── SEO AUDIT ──────────────────────────────────────────────────── */}
            <TabsContent value="audit" className="pt-6 max-w-[480px]">
              <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-4">
                {AUDIT_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <AuditDot status={item.status} />
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

        </Tabs>

      </div>
    </div>
  )
}
