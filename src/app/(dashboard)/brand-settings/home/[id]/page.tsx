'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, House, Lock, Plus } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'
import { SortableChips } from '@/components/SortableChips'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { TranslationKeyField } from '../../_components/fields'
import { DisabledReason, insertAt, toastRemoved } from '../../_components/list-actions'
import { BlockTitle } from '../../_components/nav-shared'
import {
  categoryPageHref,
  commitHomeSection,
  GAME_CARD_TYPES,
  HOME,
  HOME_HREF,
  HOME_SECTION_TYPES,
  LOBBY_HREF,
  LOBBY_LABEL_FALLBACK,
  type GameCardType,
  type GameCategoryFiltersConfig,
  type GameListConfig,
  type HomeSection,
  type SectionTitleConfig,
} from '../../_lib/home'
import { SectionActions, useGuardedSave, useSaveable } from '../../_lib/section'
import { categoryLabelKey, GAME_CATEGORIES, resolveLabel } from '../../_lib/sidebar'

function PageHeader({ section }: { section: HomeSection }) {
  const meta = HOME_SECTION_TYPES[section.type]
  // The same type can repeat on the page, so the position tells them apart
  const position = HOME.sections.findIndex(s => s.id === section.id) + 1
  return (
    <>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">{meta.label}</h1>
        {!section.enabled && <Badge variant="secondary">Disabled</Badge>}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Section {position} of {HOME.sections.length} on the home page. {meta.hint}
      </p>
    </>
  )
}

// Show-title switch as a choice card (like the App Install Card in Sidebar) and the title key; shared by every section with a heading
function TitleBlock({ value, onChange }: { value: SectionTitleConfig; onChange: (patch: Partial<SectionTitleConfig>) => void }) {
  return (
    <section className="flex flex-col gap-6">
      <BlockTitle title="Title" description={<p>Optional heading above the section.</p>} />
      <FieldGroup>
        <FieldLabel htmlFor="show-title">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Show section title</FieldTitle>
              <FieldDescription>When off, the title isn&apos;t rendered on the page. It&apos;s kept.</FieldDescription>
            </FieldContent>
            <Switch id="show-title" checked={value.showTitle} onCheckedChange={showTitle => onChange({ showTitle })} />
          </Field>
        </FieldLabel>
        {value.showTitle && (
          <TranslationKeyField id="section-title" label="Section title" value={value.title} onChange={title => onChange({ title })} />
        )}
      </FieldGroup>
    </section>
  )
}

function PlayerActivityFeedForm({ section }: { section: Extract<HomeSection, { type: 'player-activity-feed' }> }) {
  const [config, setConfig] = useState(section.config)
  const { dirty, saving, save, reset } = useSaveable(config, setConfig, v => commitHomeSection({ ...section, config: v }))

  return (
    <>
      <div className="mt-8 flex flex-col gap-12">
        <TitleBlock value={config} onChange={patch => setConfig(c => ({ ...c, ...patch }))} />
      </div>
      <SectionActions dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </>
  )
}

const CARD_SHAPE: Record<GameCardType, string> = {
  square: 'size-20',
  horizontal: 'h-16 w-28',
  vertical: 'h-24 w-16',
}

function GameListForm({ section }: { section: Extract<HomeSection, { type: 'game-list' }> }) {
  const [config, setConfig] = useState(section.config)
  const { dirty, saving, save, reset } = useSaveable(config, setConfig, v => commitHomeSection({ ...section, config: v }))
  const categoryError = config.category ? undefined : 'Category is required'
  const { showErrors, formRef, trySave } = useGuardedSave(!categoryError, save)
  const set = (patch: Partial<GameListConfig>) => setConfig(c => ({ ...c, ...patch }))

  return (
    <>
      <div ref={formRef} className="mt-8 flex flex-col gap-12">
        <FieldGroup>
          <Field data-invalid={(showErrors && !!categoryError) || undefined}>
            <FieldLabel htmlFor="game-list-category">Category</FieldLabel>
            <Select value={config.category ?? ''} onValueChange={category => set({ category })}>
              <SelectTrigger id="game-list-category" className="w-full" aria-invalid={(showErrors && !!categoryError) || undefined}>
                <SelectValue placeholder="Select a category…" />
              </SelectTrigger>
              <SelectContent>
                {GAME_CATEGORIES.map(slug => (
                  <SelectItem key={slug} value={slug}>
                    <span className="font-mono text-xs">{slug}</span>
                    <span className="text-muted-foreground">-- {categoryLabelKey(slug)}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>Games shown in the row come from this category, in its order.</FieldDescription>
            <FieldError>{showErrors ? categoryError : undefined}</FieldError>
          </Field>

          <Field>
            <FieldLabel id="card-type-label">Card type</FieldLabel>
            <RadioGroup
              value={config.cardType}
              onValueChange={v => set({ cardType: v as GameCardType })}
              aria-labelledby="card-type-label"
              className="grid-cols-1 gap-3 tablet:grid-cols-3"
            >
              {GAME_CARD_TYPES.map(type => (
                // Choice cards with a preview, like the carousel layouts in Banners
                <FieldLabel key={type.value} htmlFor={`card-type-${type.value}`}>
                  <Field orientation="horizontal">
                    <RadioGroupItem value={type.value} id={`card-type-${type.value}`} />
                    <FieldContent>
                      <div className="flex h-28 items-center justify-center rounded-lg border border-border bg-muted/40" aria-hidden>
                        <div className={cn('rounded-md bg-muted-foreground/25', CARD_SHAPE[type.value])} />
                      </div>
                      <FieldTitle className="mt-2">{type.label}</FieldTitle>
                    </FieldContent>
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
            <FieldDescription>How game tiles are shown on the website.</FieldDescription>
          </Field>
        </FieldGroup>

        <section className="flex flex-col gap-6">
          <BlockTitle
            title='"View all" CTA'
            description={
              <p>
                Always shown next to the title; links to the category page
                {config.category ? <> <span className="font-mono text-xs">{categoryPageHref(config.category)}</span></> : null}.
              </p>
            }
          />
          <FieldGroup>
            <TranslationKeyField id="view-all-label" label="Label (Optional)" value={config.viewAllLabel} onChange={viewAllLabel => set({ viewAllLabel })} />
          </FieldGroup>
        </section>
      </div>

      <SectionActions dirty={dirty} saving={saving} onSave={trySave} onReset={reset} />
    </>
  )
}

function GameCategoryFiltersForm({ section }: { section: Extract<HomeSection, { type: 'game-category-filters' }> }) {
  const [config, setConfig] = useState(section.config)
  const { dirty, saving, save, reset } = useSaveable(config, setConfig, v => commitHomeSection({ ...section, config: v }))
  const set = (patch: Partial<GameCategoryFiltersConfig>) => setConfig(c => ({ ...c, ...patch }))
  const available = GAME_CATEGORIES.filter(c => !config.categories.includes(c))

  // Every removal gets an Undo, like the other brand-settings lists
  function setCategories(next: string[]) {
    const removed = config.categories.findIndex(c => !next.includes(c))
    set({ categories: next })
    if (removed === -1) return
    const slug = config.categories[removed]
    toastRemoved(`${slug} removed`, () => setConfig(c => ({ ...c, categories: insertAt(c.categories, removed, slug) })))
  }

  const lobbyChip = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" tabIndex={0}>
          <Lock className="text-muted-foreground" />
          {LOBBY_HREF}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>Lobby chip -- always first, can&apos;t be removed</TooltipContent>
    </Tooltip>
  )

  const addMenu = (
    <DropdownMenu>
      <DisabledReason reason={available.length === 0 ? 'All categories are added' : undefined}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={available.length === 0}>
            <Plus data-icon="inline-start" />
            Add category
          </Button>
        </DropdownMenuTrigger>
      </DisabledReason>
      <DropdownMenuContent align="start" className="w-56">
        {available.map(slug => (
          <DropdownMenuItem key={slug} onSelect={() => set({ categories: [...config.categories, slug] })}>
            <span className="min-w-0 flex-1 truncate">{resolveLabel(categoryLabelKey(slug), slug).text}</span>
            <span className="font-mono text-xs text-muted-foreground">{slug}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      <div className="mt-8 flex flex-col gap-12">
        <TitleBlock value={config} onChange={set} />

        <section className="flex flex-col gap-6">
          <BlockTitle
            title="Categories"
            description={<p>Chips shown after the lobby chip, in this order -- drag to reorder. Each category once.</p>}
          />
          <SortableChips items={config.categories} onChange={setCategories} before={lobbyChip} after={addMenu} />
        </section>

        <section className="flex flex-col gap-6">
          <BlockTitle
            title="Lobby chip"
            description={
              <p>
                Always the first chip, everywhere this row is shown, and links to{' '}
                <span className="font-mono text-xs">{LOBBY_HREF}</span>. It can&apos;t be removed -- only its label is
                editable. Empty falls back to the <span className="font-mono text-xs">{LOBBY_LABEL_FALLBACK}</span> translation.
              </p>
            }
          />
          <FieldGroup>
            <TranslationKeyField id="lobby-label" label="Label (Optional)" value={config.lobbyLabel} onChange={lobbyLabel => set({ lobbyLabel })} />
          </FieldGroup>
        </section>
      </div>

      <SectionActions dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </>
  )
}

export default function HomeSectionPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const section = HOME.sections.find(s => s.id === id) ?? null
  const title = section ? HOME_SECTION_TYPES[section.type].label : 'Section not found'

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  if (!loading && !user) return null

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Bildery', href: '/dashboard' },
          { label: 'CMS', href: '/brand-settings' },
          { label: 'Brand settings', href: '/brand-settings' },
          { label: 'Home', href: HOME_HREF },
          { label: title },
        ]}
      />
      <div className="flex flex-1 flex-col px-6 pt-4 pb-8">
        <Button variant="ghost" size="sm" className="-ml-2 mb-4 w-fit text-muted-foreground" asChild>
          <Link href={HOME_HREF}>
            <ArrowLeft data-icon="inline-start" />
            Home
          </Link>
        </Button>

        <div className="max-w-3xl">
          {loading ? (
            <div aria-busy="true" aria-label="Loading section">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="mt-2 h-4 w-72" />
              <div className="mt-8 flex flex-col gap-5">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : !section || !('config' in section) ? (
            <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <House className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {section ? 'This section has no settings of its own.' : 'This home page section does not exist.'}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={HOME_HREF}>Back to Home</Link>
              </Button>
            </div>
          ) : (
            <>
              <PageHeader section={section} />
              {section.type === 'game-category-filters' && <GameCategoryFiltersForm section={section} />}
              {section.type === 'player-activity-feed' && <PlayerActivityFeedForm section={section} />}
              {section.type === 'game-list' && <GameListForm section={section} />}
            </>
          )}
        </div>
      </div>
    </>
  )
}
