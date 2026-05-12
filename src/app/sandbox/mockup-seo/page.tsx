'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  PageShell,
  FieldGroup,
  FieldRow,
  CharBar,
  LangSwitcher,
  InfoBox,
  type Lang,
} from '@/components/shared'
import { cn } from '@/lib/utils'
import Link from 'next/link'

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
}

// ─── Data ────────────────────────────────────────────────────────────────────

const TITLE_MAX = 60
const DESC_MAX = 160

const INITIAL_TITLE = 'Game Providers — BetUp Casino | Slots & Live Games'
const INITIAL_DESC =
  'Explore 12 top game providers at BetUp Casino. Play 2000+ slots, live casino games and crash games from Pragmatic Play, Evolution, NetEnt and more.'
const INITIAL_H1 = 'Game providers at BetUp Casino'

const GAMES: GameCard[] = [
  { id: 'sweet-bonanza',     name: 'Sweet Bonanza',     provider: 'Pragmatic Play', abbr: 'PP'  },
  { id: 'gates-of-olympus',  name: 'Gates of Olympus',  provider: 'Pragmatic Play', abbr: 'PP'  },
  { id: 'big-bass',          name: 'Big Bass Bonanza',  provider: 'Pragmatic Play', abbr: 'PP'  },
  { id: 'wolf-gold',         name: 'Wolf Gold',         provider: 'Pragmatic Play', abbr: 'PP'  },
  { id: 'lightning-roulette',name: 'Lightning Roulette',provider: 'Evolution',      abbr: 'EVO' },
  { id: 'crazy-time',        name: 'Crazy Time',        provider: 'Evolution',      abbr: 'EVO' },
  { id: 'monopoly-live',     name: 'Monopoly Live',     provider: 'Evolution',      abbr: 'EVO' },
  { id: 'starburst',         name: 'Starburst',         provider: 'NetEnt',         abbr: 'NET' },
  { id: 'gonzos-quest',      name: "Gonzo's Quest",     provider: 'NetEnt',         abbr: 'NET' },
  { id: 'book-of-dead',      name: 'Book of Dead',      provider: "Play'n GO",      abbr: 'PNG' },
  { id: 'reactoonz',         name: 'Reactoonz',         provider: "Play'n GO",      abbr: 'PNG' },
  { id: 'jammin-jars',       name: "Jammin' Jars",      provider: "Play'n GO",      abbr: 'PNG' },
]

const AUDIT_ITEMS: AuditItem[] = [
  { status: 'ok',    text: 'H1 present and unique' },
  { status: 'ok',    text: 'Title tag: 50 characters — good length' },
  { status: 'ok',    text: 'Meta description: 148 characters — good length' },
  { status: 'warn',  text: 'OG image not set — social shares will use fallback' },
  { status: 'ok',    text: 'Page is indexable (robots: index, follow)' },
  { status: 'ok',    text: 'Page included in sitemap' },
  { status: 'warn',  text: 'No structured data — consider adding JSON-LD' },
  { status: 'ok',    text: 'Canonical URL: self-referencing (correct)' },
  { status: 'error', text: 'DE and UA translations missing' },
]

const TAB_LABELS: Record<string, string> = {
  main: 'Main', basic: 'Basic SEO', content: 'Content',
  og: 'Social / OG', advanced: 'Advanced', audit: 'SEO audit',
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function AuditDot({ status }: { status: AuditItem['status'] }) {
  if (status === 'ok')   return <CheckCircle2 className="size-4 shrink-0 text-success" />
  if (status === 'warn') return <AlertTriangle className="size-4 shrink-0 text-warning" />
  return <XCircle className="size-4 shrink-0 text-destructive" />
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MockupSeoPage() {
  const [h1,         setH1]         = useState(INITIAL_H1)
  const [metaTitle,  setMetaTitle]  = useState(INITIAL_TITLE)
  const [metaDesc,   setMetaDesc]   = useState(INITIAL_DESC)
  const [lang,       setLang]       = useState<Lang>('EN')
  const [gameSearch, setGameSearch] = useState('')
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  const filteredGames = gameSearch
    ? GAMES.filter((g) => g.name.toLowerCase().includes(gameSearch.toLowerCase()))
    : GAMES

  const allChecked  = filteredGames.length > 0 && filteredGames.every((g) => checkedIds.has(g.id))
  const someChecked = !allChecked && filteredGames.some((g) => checkedIds.has(g.id))

  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setCheckedIds(allChecked ? new Set() : new Set(filteredGames.map((g) => g.id)))
  }

  const serpTitle = metaTitle.length > TITLE_MAX ? metaTitle.slice(0, 57) + '…' : metaTitle
  const serpDesc  = metaDesc.length  > DESC_MAX  ? metaDesc.slice(0, 157)  + '…' : metaDesc

  return (
    <PageShell
      breadcrumbs={[
        { label: 'Sandbox', href: '/sandbox' },
        { label: 'SEO Settings' },
      ]}
      title="SEO Settings"
      description="Configure meta tags, structured data and indexing rules for this page."
    >
      <Separator className="mb-6" />

      <InfoBox className="mb-6">
        Custom page. Configure URL, visibility and content below, then publish to make it live.
      </InfoBox>

      <Tabs defaultValue="main">
        <div className="border-b">
          <TabsList className="h-auto w-max gap-0 rounded-none bg-transparent p-0">
            {Object.entries(TAB_LABELS).map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="mb-[-1px] rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── MAIN ─────────────────────────────────────────────────────────── */}
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
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Yes — main menu</SelectItem>
                  <SelectItem value="footer">Yes — footer only</SelectItem>
                  <SelectItem value="hidden">No — hidden</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Access">
              <Select defaultValue="public">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="loggedin">Logged in only</SelectItem>
                  <SelectItem value="vip">VIP only</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
          </FieldRow>
        </TabsContent>

        {/* ── BASIC SEO ────────────────────────────────────────────────────── */}
        <TabsContent value="basic" className="flex flex-col gap-4 pt-6 max-w-[720px]">
          <LangSwitcher value={lang} onChange={setLang} />
          <FieldGroup label="H1 — page heading" hint="shown on the page, 1 per page">
            <Input value={h1} onChange={(e) => setH1(e.target.value)} />
          </FieldGroup>
          <FieldGroup label="Title tag" hint="shown in browser tab and Google">
            <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
            <CharBar value={metaTitle.length} max={TITLE_MAX} />
            <p className="text-xs text-muted-foreground">{metaTitle.length} / {TITLE_MAX} characters</p>
          </FieldGroup>
          <FieldGroup label="Meta description" hint="shown under title in Google">
            <Textarea rows={3} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} />
            <CharBar value={metaDesc.length} max={DESC_MAX} />
            <p className="text-xs text-muted-foreground">{metaDesc.length} / {DESC_MAX} characters</p>
          </FieldGroup>
          <Separator />
          <FieldGroup label="SERP preview">
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="mb-2.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                Google search result
              </p>
              <p className="text-xs text-serp-domain">betup.com › providers</p>
              <p className="mt-0.5 text-lg font-normal leading-snug text-serp-title">{serpTitle}</p>
              <p className="mt-1 text-sm leading-relaxed text-serp-text">{serpDesc}</p>
            </div>
          </FieldGroup>
        </TabsContent>

        {/* ── CONTENT ──────────────────────────────────────────────────────── */}
        <TabsContent value="content" className="flex flex-col gap-5 pt-6">
          <div className="max-w-[720px]">
            <FieldGroup label="Page text" hint="shown on page below the provider grid">
              <div className="overflow-hidden rounded-lg border">
                <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/50 px-2 py-1.5">
                  {['B', 'I', 'U', '|', 'H2', '¶', '|', '• list', '1. list', '|', '⌘ link'].map((t, i) =>
                    t === '|'
                      ? <span key={i} className="mx-1 h-4 w-px bg-border" />
                      : <button key={i} className="inline-flex h-6 min-w-[26px] items-center justify-center rounded px-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">{t}</button>
                  )}
                </div>
                <div
                  className="min-h-[160px] resize-y overflow-auto p-3 text-sm leading-relaxed outline-none"
                  contentEditable
                  suppressContentEditableWarning
                >
                  <h2 className="mb-1 mt-0.5 text-sm font-semibold">Top Game Providers at BetUp Casino</h2>
                  <p className="mb-1.5">
                    BetUp Casino partners with 12 of the world's leading game studios, delivering over 2,000 slots, live casino tables, and crash games. From <strong>Pragmatic Play's</strong> iconic Sweet Bonanza to <strong>Evolution's</strong> live Lightning Roulette — every title is hand-picked for quality.
                  </p>
                  <p>All providers are licensed, regularly audited for fairness, and offer games optimised for desktop and mobile.</p>
                </div>
              </div>
            </FieldGroup>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <div>
              <h3>Featured games</h3>
              <p className="text-xs text-muted-foreground">Select which providers appear on this page and toggle their visibility.</p>
            </div>
            <Input
              placeholder="Search games…"
              className="max-w-[320px]"
              value={gameSearch}
              onChange={(e) => setGameSearch(e.target.value)}
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allChecked}
                      data-state={someChecked ? 'indeterminate' : allChecked ? 'checked' : 'unchecked'}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="w-14">Image</TableHead>
                  <TableHead className="w-[200px]">Game</TableHead>
                  <TableHead className="w-[200px]">Provider</TableHead>
                  <TableHead />
                  <TableHead className="w-px whitespace-nowrap">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGames.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell>
                      <Checkbox
                        checked={checkedIds.has(game.id)}
                        onCheckedChange={() => toggleCheck(game.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-sm font-bold tracking-wide text-foreground">
                        {game.abbr}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{game.name}</TableCell>
                    <TableCell className="text-muted-foreground">{game.provider}</TableCell>
                    <TableCell />
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/sandbox/mockup-seo">View details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── SOCIAL / OG ──────────────────────────────────────────────────── */}
        <TabsContent value="og" className="flex flex-col gap-4 pt-6 max-w-[720px]">
          <FieldGroup label="OG title" hint="shown when sharing link on social">
            <Input defaultValue="Game Providers — BetUp Casino" />
          </FieldGroup>
          <FieldGroup label="OG description">
            <Textarea rows={2} defaultValue="Discover all game providers at BetUp. Slots, live casino and more from the world's top studios." />
          </FieldGroup>
          <FieldGroup label="OG image" hint="recommended 1200×630px">
            <div className="overflow-hidden rounded-lg border">
              <div className="flex h-20 cursor-pointer items-center justify-center bg-muted/50 text-xs text-muted-foreground transition-colors hover:bg-muted">
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
                <SelectTrigger><SelectValue /></SelectTrigger>
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

        {/* ── ADVANCED ─────────────────────────────────────────────────────── */}
        <TabsContent value="advanced" className="flex flex-col gap-4 pt-6 max-w-[720px]">
          <FieldRow>
            <FieldGroup label="Canonical URL" hint="leave blank = self">
              <Input placeholder="https://betup.com/providers" />
            </FieldGroup>
            <FieldGroup label="Robots">
              <Select defaultValue="index">
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Sitemap priority">
              <Select defaultValue="high">
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <InfoBox>
              JSON-LD is injected into the page <code className="font-mono">&lt;head&gt;</code> and tells Google the structure of your content in machine-readable format. Without it, Google sees plain text. With it, rich snippets in search results become possible.
            </InfoBox>
            <Textarea
              rows={5}
              className="font-mono text-xs"
              defaultValue={`{\n  "@context": "https://schema.org",\n  "@type": "ItemList",\n  "name": "Game providers at BetUp Casino"\n}`}
            />
          </FieldGroup>
          <FieldGroup label="Hreflang">
            <Select defaultValue="auto">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto — generate from active languages</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </TabsContent>

        {/* ── SEO AUDIT ────────────────────────────────────────────────────── */}
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
    </PageShell>
  )
}
