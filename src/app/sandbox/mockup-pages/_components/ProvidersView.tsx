"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FieldGroup, FieldRow, LangSwitcher, CharBar, type Lang } from "@/components/shared"
import { InfoBox } from "@/components/shared"
import { cn } from "@/lib/utils"
import { DeletePageDialog, AddProviderDialog } from "./Dialogs"
import { type SitePage, type PageStatus, type Provider, type AuditItem, INITIAL_PROVIDERS, AUDIT_ITEMS, TITLE_MAX, DESC_MAX } from "./types"

const CIRCUMFERENCE = 267.035

function CircleProgress({ value, max }: { value: number; max: number }) {
  const pct  = max > 0 ? Math.min(value / max, 1) : 0
  const dash = pct * CIRCUMFERENCE
  return (
    <svg aria-hidden="true" fill="none" width="16" height="16" viewBox="0 0 100 100" className="-rotate-90 shrink-0">
      <circle cx="50" cy="50" r="42.5" strokeWidth="12" strokeDashoffset="0"
        strokeLinecap="round" strokeLinejoin="round"
        stroke="currentColor" className="opacity-20"
        style={{ strokeDasharray: `${CIRCUMFERENCE}, ${CIRCUMFERENCE}` }} />
      <circle cx="50" cy="50" r="42.5" strokeWidth="12" strokeDashoffset="0"
        strokeLinecap="round" strokeLinejoin="round"
        stroke="currentColor" className="transition-all duration-300"
        style={{ strokeDasharray: `${dash}, ${CIRCUMFERENCE}` }} />
    </svg>
  )
}

function AuditIcon({ status }: { status: AuditItem["status"] }) {
  if (status === "ok")   return <CheckCircle2 className="size-4 shrink-0 text-success" />
  if (status === "warn") return <AlertTriangle className="size-4 shrink-0 text-amber-500" />
  return <XCircle className="size-4 shrink-0 text-destructive" />
}

const TAB_LABELS: Record<string, string> = {
  main: "Main", basic: "Basic SEO", content: "Content",
  og: "Social / OG", advanced: "Advanced", audit: "SEO audit",
}

interface ProvidersViewProps {
  page: SitePage
  status: PageStatus
  onPublish: () => void
  onDelete: () => void
}

export function ProvidersView({ page, status, onPublish, onDelete }: ProvidersViewProps) {
  const [lang,      setLang]      = useState<Lang>("EN")
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS)
  const [h1,        setH1]        = useState("Game providers at BetUp Casino")
  const [metaTitle, setMetaTitle] = useState("Game Providers — BetUp Casino | Slots & Live Games")
  const [metaDesc,  setMetaDesc]  = useState("Explore 12 top game providers at BetUp Casino. Play 2000+ slots, live casino games and crash games from Pragmatic Play, Evolution, NetEnt and more.")

  const serpTitle = metaTitle.length > TITLE_MAX ? metaTitle.slice(0, 57) + "…" : metaTitle
  const serpDesc  = metaDesc.length  > DESC_MAX  ? metaDesc.slice(0, 157)  + "…" : metaDesc

  function toggleProvider(id: string) {
    setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)))
  }

  function toggleLive(id: string) {
    setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, live: !p.live } : p)))
  }

  return (
    <>
      <div className="flex-1">
        <div className="mt-5 pl-5">
          <InfoBox>{page.info}</InfoBox>
        </div>

        <Tabs defaultValue="main" className="mt-4">
          <div className="ml-5 border-b">
            <TabsList className="h-auto flex-wrap gap-0 rounded-none bg-transparent p-0">
              {Object.entries(TAB_LABELS).map(([value, label]) => (
                <TabsTrigger key={value} value={value}
                  className="mb-[-1px] rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* MAIN */}
          <TabsContent value="main" className="flex flex-col gap-5 p-5">
            <div className="flex flex-col gap-4 max-w-[640px]">
              <FieldRow>
                <FieldGroup label="Page title"><Input defaultValue="Game providers" /></FieldGroup>
                <FieldGroup label="URL slug"><Input defaultValue="/providers" /></FieldGroup>
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
            <Separator />
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3>Providers to display</h3>
                  <p className="text-xs text-muted-foreground">Configure which providers are live on your site.</p>
                </div>
                <AddProviderDialog onAdd={(name) => {
                  const abbr = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 3)
                  setProviders((prev) => [...prev, { id: "new-" + Date.now(), abbr, name, games: 0, enabledGames: 0, selected: true, live: false }])
                }} />
              </div>
              <div className="flex flex-col">
                {providers.map((prov, i) => (
                  <div key={prov.id}
                    className={cn("flex items-center gap-4 py-3", i !== 0 && "border-t border-border")}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold tracking-wide text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                      {prov.abbr}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{prov.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {prov.enabledGames} / {prov.games} games · {prov.games > 0
                          ? `${Math.round(prov.enabledGames / prov.games * 100)}% active`
                          : "0% active"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        prov.live
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      )}>Shown</span>
                      <Switch checked={prov.live} onCheckedChange={() => toggleLive(prov.id)} />
                    </div>
                    <Link
                      href="/sandbox/mockup-seo"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 inline-flex items-center rounded-lg border border-border bg-transparent px-3 h-8 text-sm font-medium text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      View details
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* BASIC SEO */}
          <TabsContent value="basic" className="flex flex-col gap-4 p-5 max-w-[720px]">
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
                <p className="mb-2.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Google search result</p>
                <p className="text-xs text-serp-domain">betup.com › providers</p>
                <p className="mt-0.5 text-lg font-normal leading-snug text-serp-title">{serpTitle}</p>
                <p className="mt-1 text-sm leading-relaxed text-serp-text">{serpDesc}</p>
              </div>
            </FieldGroup>
          </TabsContent>

          {/* CONTENT */}
          <TabsContent value="content" className="p-5" tabIndex={-1}>
            <div className="max-w-[720px]">
              <FieldGroup label="Page text" hint="shown below the provider grid">
                <div className="rounded-lg border">
                  <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/50 px-2 py-1.5">
                    {["B","I","U","|","H2","¶","|","• list","1. list","|","⌘ link"].map((t,i) =>
                      t==="|" ? <span key={i} className="mx-1 h-4 w-px bg-border" />
                               : <button key={i} className="inline-flex h-6 min-w-[26px] items-center justify-center rounded px-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">{t}</button>
                    )}
                  </div>
                  <div className="min-h-[140px] p-3 text-sm leading-relaxed outline-none resize-y overflow-auto" contentEditable suppressContentEditableWarning>
                    <p>BetUp Casino partners with 12 of the world's leading game studios, delivering over 2,000 slots, live casino tables, and crash games.</p>
                  </div>
                </div>
              </FieldGroup>
            </div>
          </TabsContent>

          {/* SOCIAL / OG */}
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
                  <p className="text-2xs uppercase tracking-wider text-muted-foreground">BETUP.COM</p>
                  <p className="mt-0.5 text-sm font-medium">Game Providers — BetUp Casino</p>
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
              <FieldGroup label="Twitter site handle"><Input defaultValue="@betup" /></FieldGroup>
            </FieldRow>
          </TabsContent>

          {/* ADVANCED */}
          <TabsContent value="advanced" className="flex flex-col gap-4 p-5 max-w-[720px]">
            <FieldRow>
              <FieldGroup label="Canonical URL" hint="leave blank = self"><Input placeholder="https://betup.com/providers" /></FieldGroup>
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
                  <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
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
              <InfoBox>JSON-LD is injected into the page <code className="font-mono">&lt;head&gt;</code> and tells Google the structure of your content in machine-readable format. Without it, Google sees plain text. With it, rich snippets in search results become possible.</InfoBox>
              <Textarea rows={5} className="font-mono text-xs"
                defaultValue={'{\n  "@context": "https://schema.org",\n  "@type": "ItemList",\n  "name": "Game providers at BetUp Casino"\n}'} />
            </FieldGroup>
          </TabsContent>

          {/* SEO AUDIT */}
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
