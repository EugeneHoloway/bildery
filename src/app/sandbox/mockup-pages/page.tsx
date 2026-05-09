'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  Globe,
  Plus,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type PageStatus = 'live' | 'hidden' | 'draft'

interface SitePage {
  id: string
  label: string
  url: string
  status: PageStatus
  isSystem: boolean
  info: string
}

interface Provider {
  id: string
  abbr: string
  name: string
  games: number
  selected: boolean
}

interface AuditItem {
  status: 'ok' | 'warn' | 'error'
  text: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SYSTEM_PAGES: SitePage[] = [
  { id: 'homepage',   label: 'Homepage',       url: 'betup.com/',           status: 'live',   isSystem: true,  info: 'System page — use Homepage Configurator to manage sections.' },
  { id: 'promotions', label: 'Promotions',     url: 'betup.com/promotions', status: 'live',   isSystem: true,  info: 'System page — manage individual promotion cards in the Promotions module.' },
  { id: 'vip',        label: 'VIP club',       url: 'betup.com/vip',        status: 'hidden', isSystem: true,  info: 'This system page is currently hidden from all visitors.' },
  { id: 'providers',  label: 'Game providers', url: 'betup.com/providers',  status: 'draft',  isSystem: true,  info: 'Custom page. Configure URL, visibility and content below, then publish to make it live.' },
]

const CUSTOM_PAGES: SitePage[] = [
  { id: 'about', label: 'About us', url: 'betup.com/about', status: 'live',   isSystem: false, info: 'Custom page — live and visible to all visitors.' },
  { id: 'blog',  label: 'Blog',     url: 'betup.com/blog',  status: 'hidden', isSystem: false, info: 'Custom page — currently hidden.' },
]

const INITIAL_PROVIDERS: Provider[] = [
  { id: 'ezugi',     abbr: 'EZG', name: 'Ezugi',         games: 84,  selected: true  },
  { id: 'pragmatic', abbr: 'PP',  name: 'Pragmatic Play', games: 312, selected: true  },
  { id: 'evolution', abbr: 'EVO', name: 'Evolution',      games: 127, selected: true  },
  { id: 'playngo',   abbr: 'PNG', name: "Play'n GO",      games: 256, selected: true  },
  { id: 'netent',    abbr: 'NET', name: 'NetEnt',         games: 203, selected: true  },
  { id: 'yggdrasil', abbr: 'YGG', name: 'Yggdrasil',     games: 91,  selected: false },
  { id: 'hacksaw',   abbr: 'HCK', name: 'Hacksaw',       games: 54,  selected: false },
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

const TITLE_MAX = 60
const DESC_MAX  = 160

// ─── Shared helpers ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: PageStatus }) {
  return (
    <span className={cn(
      'size-[6px] shrink-0 rounded-full',
      status === 'live'   && 'bg-success',
      status === 'hidden' && 'bg-muted-foreground/40',
      status === 'draft'  && 'bg-amber-400',
    )} />
  )
}

function StatusBadge({ status }: { status: PageStatus }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      status === 'live'   && 'bg-success-bg text-success',
      status === 'hidden' && 'bg-muted text-muted-foreground',
      status === 'draft'  && 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    )}>
      {status === 'live' ? 'Live' : status === 'hidden' ? 'Hidden' : 'Draft'}
    </span>
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

function CharBar({ value, max }: { value: number; max: number }) {
  const pct   = Math.min((value / max) * 100, 100)
  const color = value > max ? 'bg-destructive' : value > max * 0.83 ? 'bg-success' : 'bg-amber-400'
  return (
    <div className="mt-1.5 h-[3px] w-full rounded-full bg-border">
      <div className={cn('h-[3px] rounded-full transition-all duration-150', color)} style={{ width: `${pct}%` }} />
    </div>
  )
}

function AuditIcon({ status }: { status: AuditItem['status'] }) {
  if (status === 'ok')   return <CheckCircle2 className="size-4 shrink-0 text-success" />
  if (status === 'warn') return <AlertTriangle className="size-4 shrink-0 text-amber-500" />
  return <XCircle className="size-4 shrink-0 text-destructive" />
}

function PageTopbar({ page, status, children }: { page: SitePage; status: PageStatus; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
      <div>
        <p className="text-[15px] font-medium leading-tight">{page.label}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Globe className="size-3" />{page.url}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={status} />
        {children}
      </div>
    </div>
  )
}

// ─── Layout selector ──────────────────────────────────────────────────────────

type Layout = '4col' | '3col' | 'list'

function LayoutOption({ value, active, onClick, children, label }: {
  value: Layout; active: boolean; onClick: () => void; children: React.ReactNode; label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2.5 rounded-xl border px-5 py-3 transition-colors',
        active
          ? 'border-foreground bg-background text-foreground'
          : 'border-border bg-muted/30 text-muted-foreground hover:border-subtle-border',
      )}
    >
      <div className="flex items-center gap-1">{children}</div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

function Block({ active }: { active: boolean }) {
  return (
    <div className={cn(
      'h-5 w-5 rounded-md transition-colors',
      active ? 'bg-foreground' : 'bg-muted-foreground/25',
    )} />
  )
}

function ListLine({ active }: { active: boolean }) {
  return (
    <div className={cn(
      'h-[5px] w-10 rounded-full transition-colors',
      active ? 'bg-foreground' : 'bg-muted-foreground/25',
    )} />
  )
}

// ─── New page dialog ──────────────────────────────────────────────────────────

function NewPageDialog({ onCreated }: { onCreated: (page: SitePage) => void }) {
  const [open, setOpen]     = useState(false)
  const [name, setName]     = useState('')
  const [slug, setSlug]     = useState('')
  const nameRef             = useRef<HTMLInputElement>(null)

  function handleNameChange(v: string) {
    setName(v)
    setSlug('/' + v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  }

  function handleCreate() {
    if (!name.trim()) return
    const id = 'custom-' + Date.now()
    onCreated({
      id,
      label: name.trim(),
      url: 'betup.com' + slug,
      status: 'draft',
      isSystem: false,
      info: 'Custom page — configure content and SEO, then publish to make it live.',
    })
    setName('')
    setSlug('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full justify-start gap-1.5">
          <Plus className="size-3.5" />
          New page
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New page</DialogTitle>
          <DialogDescription>Enter a name and URL slug for the new page.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Page name</Label>
            <Input
              ref={nameRef}
              autoFocus
              placeholder="e.g. Responsible gaming"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">URL slug</Label>
            <Input
              placeholder="/responsible-gaming"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button size="sm" disabled={!name.trim()} onClick={handleCreate}>
            Create page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete page dialog ───────────────────────────────────────────────────────

function DeletePageDialog({
  pageName,
  onConfirm,
}: {
  pageName: string
  onConfirm: () => void
}) {
  const [open, setOpen] = useState(false)

  function handleConfirm() {
    onConfirm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
        >
          Delete page
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete "{pageName}"?</DialogTitle>
          <DialogDescription>
            This will permanently remove the page and all its content. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button
            size="sm"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleConfirm}
          >
            Delete page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Add provider dialog ──────────────────────────────────────────────────────

function AddProviderDialog({ onAdd }: { onAdd: (name: string) => void }) {
  const router              = useRouter()
  const [open, setOpen]     = useState(false)
  const [name, setName]     = useState('')

  function handleAdd() {
    if (!name.trim()) return
    onAdd(name.trim())
    setName('')
    setOpen(false)
    router.push('/sandbox/mockup-seo')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 transition-colors hover:border-subtle-border hover:bg-muted/40">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Plus className="size-4" />
          </div>
          <span className="text-xs text-muted-foreground">Add provider</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add game provider</DialogTitle>
          <DialogDescription>
            Enter the provider name. You'll be taken to the SEO editor to configure its page.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 py-1">
          <Label className="text-xs font-medium text-muted-foreground">Provider name</Label>
          <Input
            autoFocus
            placeholder="e.g. Red Tiger"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button size="sm" disabled={!name.trim()} onClick={handleAdd}>
            Add &amp; open SEO editor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Providers view (full tabbed editor) ──────────────────────────────────────

function ProvidersView({
  page,
  status,
  onPublish,
  onDelete,
}: {
  page: SitePage
  status: PageStatus
  onPublish: () => void
  onDelete: () => void
}) {
  const [layout,    setLayout]    = useState<Layout>('4col')
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS)
  const [h1,        setH1]        = useState('Game providers at BetUp Casino')
  const [metaTitle, setMetaTitle] = useState('Game Providers — BetUp Casino | Slots & Live Games')
  const [metaDesc,  setMetaDesc]  = useState('Explore 12 top game providers at BetUp Casino. Play 2000+ slots, live casino games and crash games from Pragmatic Play, Evolution, NetEnt and more.')
  const [activeLang, setActiveLang] = useState<'EN' | 'DE' | 'UA'>('EN')

  const serpTitle = metaTitle.length > TITLE_MAX ? metaTitle.slice(0, 57) + '…' : metaTitle
  const serpDesc  = metaDesc.length  > DESC_MAX  ? metaDesc.slice(0, 157)  + '…' : metaDesc

  function toggleProvider(id: string) {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, selected: !p.selected } : p))
  }

  const TAB_LABELS: Record<string, string> = {
    main: 'Main', basic: 'Basic SEO', content: 'Content',
    og: 'Social / OG', advanced: 'Advanced', audit: 'SEO audit',
  }

  return (
    <>
      {/* Topbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
        <div>
          <p className="text-[15px] font-medium leading-tight">{page.label}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="size-3" />{page.url}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <DeletePageDialog pageName={page.label} onConfirm={onDelete} />
          <Button variant="outline" size="sm">Preview</Button>
          <Button size="sm" onClick={onPublish}>Publish</Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* Info box */}
        <div className="mx-5 mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted px-3 py-2.5">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-foreground">{page.info}</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="main" className="mt-4">
          <div className="border-b px-5">
            <TabsList className="h-auto flex-wrap gap-0 rounded-none bg-transparent p-0">
              {Object.entries(TAB_LABELS).map(([value, label]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="mb-[-1px] rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── MAIN ─────────────────────────────────────────────────────── */}
          <TabsContent value="main" className="flex flex-col gap-5 p-5">

            <div className="flex flex-col gap-4 max-w-[640px]">
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
            </div>

            <Separator className="max-w-[640px]" />

            {/* Providers grid */}
            <div className="flex flex-col gap-3">
              <Label className="text-xs font-medium text-muted-foreground">
                Providers to display — click to toggle
              </Label>
              <div className="grid grid-cols-3 gap-3 tablet:grid-cols-4">
                {providers.map((prov) => (
                  <div
                    key={prov.id}
                    onClick={() => toggleProvider(prov.id)}
                    className={cn(
                      'group relative flex aspect-square cursor-pointer flex-col items-center justify-evenly overflow-hidden rounded-2xl border px-5 transition-colors',
                      prov.selected
                        ? 'border-foreground bg-background'
                        : 'border-border bg-muted/40 hover:border-subtle-border hover:bg-background/60',
                    )}
                  >
                    {/* Checkbox — top-right */}
                    <Checkbox
                      checked={prov.selected}
                      tabIndex={-1}
                      className="pointer-events-none absolute right-2.5 top-2.5"
                    />

                    {/* Logo icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0f1623] dark:bg-[#1e2535] text-sm font-bold tracking-wide text-white">
                      {prov.abbr}
                    </div>

                    {/* Name */}
                    <span className="text-sm font-semibold leading-tight">{prov.name}</span>

                    {/* Games count */}
                    <span className="text-xs text-muted-foreground">{prov.games} games</span>

                    {/* Button */}
                    <Button size="sm" asChild>
                      <Link href="/sandbox/mockup-seo" onClick={(e) => e.stopPropagation()}>
                        Webpage setup
                      </Link>
                    </Button>
                  </div>
                ))}

                {/* Add new */}
                <AddProviderDialog
                  onAdd={(name) => {
                    const abbr = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3)
                    setProviders(prev => [
                      ...prev,
                      { id: 'new-' + Date.now(), abbr, name, games: 0, selected: true },
                    ])
                  }}
                />
              </div>
            </div>

          </TabsContent>

          {/* ── BASIC SEO ─────────────────────────────────────────────────── */}
          <TabsContent value="basic" className="flex flex-col gap-4 p-5 max-w-[720px]">

            {/* Lang switcher */}
            <div className="flex gap-1.5">
              {(['EN', 'DE', 'UA'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={cn(
                    'rounded-md border px-3 py-1 text-xs font-medium transition-colors',
                    activeLang === lang
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>

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
                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Google search result</p>
                <p className="text-xs text-[#1a7f4b] dark:text-green-400">betup.com › providers</p>
                <p className="mt-0.5 text-[18px] font-normal leading-snug text-[#1558d6] dark:text-blue-400">{serpTitle}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#555] dark:text-muted-foreground">{serpDesc}</p>
              </div>
            </FieldGroup>

          </TabsContent>

          {/* ── CONTENT ───────────────────────────────────────────────────── */}
          <TabsContent value="content" className="flex flex-col gap-4 p-5">
            <div className="max-w-[720px]">
              <FieldGroup label="Page text" hint="shown below the provider grid">
                <div className="overflow-hidden rounded-lg border">
                  <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/50 px-2 py-1.5">
                    {['B', 'I', 'U', '|', 'H2', '¶', '|', '• list', '1. list', '|', '⌘ link'].map((t, i) =>
                      t === '|'
                        ? <span key={i} className="mx-1 h-4 w-px bg-border" />
                        : <button key={i} className="inline-flex h-6 min-w-[26px] items-center justify-center rounded px-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">{t}</button>
                    )}
                  </div>
                  <div className="min-h-[140px] p-3 text-sm leading-relaxed outline-none" contentEditable suppressContentEditableWarning>
                    <h2 className="mb-1 mt-0.5 text-[15px] font-semibold">Top Game Providers at BetUp Casino</h2>
                    <p className="mb-1.5">BetUp Casino partners with 12 of the world's leading game studios, delivering over 2,000 slots, live casino tables, and crash games. From <strong>Pragmatic Play's</strong> iconic Sweet Bonanza to <strong>Evolution's</strong> live Lightning Roulette — every title is hand-picked for quality.</p>
                    <p>All providers are licensed, regularly audited for fairness, and offer games optimised for desktop and mobile.</p>
                  </div>
                </div>
              </FieldGroup>
            </div>
          </TabsContent>

          {/* ── SOCIAL / OG ───────────────────────────────────────────────── */}
          <TabsContent value="og" className="flex flex-col gap-4 p-5 max-w-[720px]">
            <FieldGroup label="OG title" hint="shown when sharing on social">
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
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">BETUP.COM</p>
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

          {/* ── ADVANCED ──────────────────────────────────────────────────── */}
          <TabsContent value="advanced" className="flex flex-col gap-4 p-5 max-w-[720px]">
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
              <Textarea rows={5} className="font-mono text-xs" defaultValue={`{\n  "@context": "https://schema.org",\n  "@type": "ItemList",\n  "name": "Game providers at BetUp Casino"\n}`} />
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

          {/* ── SEO AUDIT ─────────────────────────────────────────────────── */}
          <TabsContent value="audit" className="p-5 max-w-[480px]">
            <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-4">
              {AUDIT_ITEMS.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <AuditIcon status={item.status} />
                  <span className="text-sm text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </>
  )
}

// ─── Simple page views ────────────────────────────────────────────────────────

function SimpleView({ page, status, children }: { page: SitePage; status: PageStatus; children: React.ReactNode }) {
  return (
    <>
      <PageTopbar page={page} status={status}>{children}</PageTopbar>
      <div className="p-5">
        <p className="text-sm text-muted-foreground">{page.info}</p>
      </div>
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MockupPagesPage() {
  const [activeId,     setActiveId]     = useState<string>('providers')
  const [customPages,  setCustomPages]  = useState<SitePage[]>(CUSTOM_PAGES)
  // Track live statuses separately so Publish can update sidebar dot
  const [pageStatuses, setPageStatuses] = useState<Record<string, PageStatus>>({
    providers: 'draft',
    about: 'live',
    blog: 'hidden',
  })

  const allPages   = [...SYSTEM_PAGES, ...customPages]
  const activePage = allPages.find((p) => p.id === activeId) ?? allPages[0]

  function getStatus(id: string): PageStatus {
    return pageStatuses[id] ?? activePage.status
  }

  function setStatus(id: string, status: PageStatus) {
    setPageStatuses(prev => ({ ...prev, [id]: status }))
  }

  function handleDeletePage(id: string) {
    setCustomPages(prev => prev.filter(p => p.id !== id))
    // If we deleted the active page, fall back to providers
    if (activeId === id) setActiveId('providers')
  }

  function renderView() {
    const status = getStatus(activeId)
    switch (activeId) {
      case 'homepage':
        return <SimpleView page={activePage} status="live"><Button size="sm">Edit sections</Button></SimpleView>
      case 'promotions':
        return <SimpleView page={activePage} status="live"><Button size="sm">Manage promos</Button></SimpleView>
      case 'vip':
        return (
          <SimpleView page={activePage} status="hidden">
            <Button variant="outline" size="sm">Show page</Button>
            <Button size="sm">Edit content</Button>
          </SimpleView>
        )
      case 'providers':
        return (
          <ProvidersView
            page={activePage}
            status={status}
            onPublish={() => setStatus('providers', 'live')}
            onDelete={() => {}} // system page — delete disabled
          />
        )
      case 'about':
        return (
          <SimpleView page={activePage} status={status}>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
              onClick={() => setStatus('about', 'hidden')}
            >
              Hide page
            </Button>
            <Button size="sm">Edit content</Button>
          </SimpleView>
        )
      case 'blog':
        return (
          <SimpleView page={activePage} status={status}>
            <Button variant="outline" size="sm" onClick={() => setStatus('blog', 'live')}>Show page</Button>
            <DeletePageDialog pageName={activePage.label} onConfirm={() => handleDeletePage('blog')} />
          </SimpleView>
        )
      default: {
        // Custom pages added via New Page dialog
        const cp = customPages.find(p => p.id === activeId)
        if (!cp) return null
        return (
          <SimpleView page={cp} status={status}>
            <DeletePageDialog pageName={cp.label} onConfirm={() => handleDeletePage(cp.id)} />
            <Button size="sm" onClick={() => setStatus(cp.id, 'live')}>Publish</Button>
          </SimpleView>
        )
      }
    }
  }

  function NavItem({ page }: { page: SitePage }) {
    const isActive  = page.id === activeId
    const navStatus = getStatus(page.id) ?? page.status
    return (
      <button
        onClick={() => setActiveId(page.id)}
        className={cn(
          'flex w-full items-center gap-2 border-l-2 px-4 py-2 text-left text-sm transition-colors',
          isActive
            ? 'border-brand bg-background text-foreground'
            : 'border-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground',
        )}
      >
        <StatusDot status={navStatus} />
        <span className={cn('flex-1 truncate', navStatus === 'hidden' && !isActive && 'opacity-50')}>
          {page.label}
        </span>
        {page.isSystem && (
          <span className="rounded px-1 py-px text-[9px] font-medium uppercase tracking-wide text-muted-foreground bg-muted">
            sys
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="py-12 pb-20">
      <div className="mx-auto max-w-[1240px] px-4">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/sandbox" className="hover:text-foreground transition-colors">Sandbox</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">Page manager</span>
        </nav>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="mb-2 text-[2rem] font-bold tracking-[-0.03em]">Page manager</h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Create, configure and publish pages. Manage URL slugs, visibility, SEO and content.
          </p>
        </div>

        {/* Tool area */}
        <div className="flex h-[calc(100vh-16rem)] min-h-[600px] overflow-hidden rounded-xl border border-border">

          {/* Sidebar */}
          <aside className="flex w-[220px] shrink-0 flex-col border-r border-border bg-muted/30">
            <div className="border-b border-border px-4 py-3">
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                Site pages
              </p>
              <NewPageDialog
                onCreated={(page) => {
                  setCustomPages(prev => [...prev, page])
                  setActiveId(page.id)
                }}
              />
            </div>

            <div className="py-2">
              <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                System pages
              </p>
              {SYSTEM_PAGES.map((page) => <NavItem key={page.id} page={page} />)}
            </div>

            <div className="mx-4 h-px bg-border" />

            <div className="py-2">
              <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                Custom pages
              </p>
              {customPages.map((page) => <NavItem key={page.id} page={page} />)}
            </div>
          </aside>

          {/* Main content */}
          <main className="flex flex-1 flex-col bg-background overflow-hidden">
            {renderView()}
          </main>

        </div>

      </div>
    </div>
  )
}
