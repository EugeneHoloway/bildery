'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CircleStop,
  GalleryHorizontal,
  ImagePlus,
  Images,
  MoreHorizontal,
  Rocket,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { DateTimePicker } from '@/components/DateTimePicker'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'
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
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  BANNER_BREAKPOINTS,
  BANNERS,
  BANNERS_HREF,
  bannerName,
  bannerStatus,
  boundaryLabel,
  commitBanner,
  emptyBanner,
  STATE_LABEL,
  imageCount,
  resolveSlot,
  validateCtaHref,
  validateSchedule,
  validateTranslationKey,
  type BannerBreakpoint,
  type BannerImages,
  type BannerItem,
  type BannerState,
  type Composition,
  type Translatable,
} from '../../_lib/banners'
import { SectionActions, useSaveable } from '../../_lib/section'
import { useBlobUrls } from '../../_lib/use-blob-urls'
import { GenerateDialog, type GenerateKind } from './_components/generate-dialog'
import { SlidePreview } from './_components/slide-preview'

// Layout is driven by container queries, not the viewport: the sidebar (16rem, or 3rem collapsed)
// decides how much room the page really has.
//   `form` -- the page body: form column + preview rail side by side from 56rem, stacked (preview on top) below
//   `main` -- the form column: field tables, radio cards and slot grids adapt to its own width
const PAGE_GRID = 'grid grid-cols-1 gap-8 @4xl/form:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] @4xl/form:items-start'
const PAGE_MAIN = '@container/main flex min-w-0 flex-col gap-10 @4xl/form:col-start-1 @4xl/form:row-start-1'
// The rail sticks under the 4rem dashboard header while the much taller form scrolls past it
const PAGE_RAIL = '@4xl/form:col-start-2 @4xl/form:row-start-1 @4xl/form:sticky @4xl/form:top-20'

function SectionTitle({ title, badge, description, aside }: {
  title: string
  badge?: React.ReactNode
  description: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 @lg/main:flex-row @lg/main:items-start @lg/main:justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-base font-medium">
          {title}
          {badge}
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  )
}

// Texts form a small table: label column, then translation key and fallback columns.
// Rows are subgrids so the columns line up; in a narrow form column they stack with their own labels.
const TEXT_TABLE =
  'grid grid-cols-1 gap-5 @lg/main:grid-cols-[7rem_minmax(0,1fr)_minmax(0,1fr)] @lg/main:gap-x-6 @lg/main:gap-y-3'
const TEXT_ROW = 'grid grid-cols-1 gap-2 @lg/main:col-span-3 @lg/main:grid-cols-subgrid @lg/main:gap-x-6'
const TEXT_ROW_LABEL = '@lg/main:h-8 @lg/main:items-center'

function TextTableHeader() {
  return (
    <div className={cn(TEXT_ROW, 'hidden @lg/main:grid')} aria-hidden>
      <span />
      <span className="text-xs font-medium text-muted-foreground">Translation key</span>
      <span className="text-xs font-medium text-muted-foreground">Fallback</span>
    </div>
  )
}

function TranslationRow({ id, label, value, onChange, required, keyPlaceholder, fallbackPlaceholder }: {
  id: string
  label: string
  value: Translatable
  onChange: (v: Translatable) => void
  required?: boolean
  keyPlaceholder: string
  fallbackPlaceholder: string
}) {
  const keyError = validateTranslationKey(value.key)
  const fallbackError = required && !value.fallback.trim() ? `${label} fallback is required` : undefined

  return (
    <div className={TEXT_ROW}>
      <FieldLabel htmlFor={`${id}-key`} className={TEXT_ROW_LABEL}>
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Field data-invalid={!!keyError || undefined}>
        <FieldLabel htmlFor={`${id}-key`} className="text-muted-foreground @lg/main:sr-only">Translation key</FieldLabel>
        <Input
          id={`${id}-key`}
          placeholder={keyPlaceholder}
          value={value.key}
          onChange={e => onChange({ ...value, key: e.target.value })}
          spellCheck={false}
          className="font-mono"
          aria-invalid={!!keyError || undefined}
        />
        <FieldError>{keyError}</FieldError>
      </Field>
      <Field data-invalid={!!fallbackError || undefined}>
        <FieldLabel htmlFor={`${id}-fallback`} className="text-muted-foreground @lg/main:sr-only">Fallback</FieldLabel>
        <Input
          id={`${id}-fallback`}
          placeholder={fallbackPlaceholder}
          value={value.fallback}
          onChange={e => onChange({ ...value, fallback: e.target.value })}
          aria-invalid={!!fallbackError || undefined}
        />
        <FieldError>{fallbackError}</FieldError>
      </Field>
    </div>
  )
}

function ImageSlot({ id, label, viewport, hint, value, inherited, transparent, active, onSelect, onReplace, onRemove }: {
  id: string
  label: string
  viewport: number
  hint: string
  value: string | null
  /** What the storefront shows here while the slot is empty: the next smaller slot's image. */
  inherited: { src: string; label: string } | null
  /** Cut-outs: fit inside the slot on a checkerboard so the transparency is visible. */
  transparent?: boolean
  /** The preview is currently rendering this breakpoint. */
  active: boolean
  onSelect: () => void
  onReplace: (file: File) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function pick(files: FileList | null) {
    const file = files?.[0]
    if (file && file.type.startsWith('image/')) onReplace(file)
  }

  return (
    <Field>
      <FieldLabel htmlFor={id} className="items-baseline">
        {label}
        <span className="text-xs font-normal text-muted-foreground">{viewport}px</span>
      </FieldLabel>
      {/* Filled: click shows this breakpoint in the preview. Empty: click or drop a file to upload. */}
      <button
        type="button"
        id={id}
        aria-label={value ? `Show ${label} in the preview` : `Upload ${label} image`}
        aria-current={active || undefined}
        onClick={() => (value ? onSelect() : inputRef.current?.click())}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false) }}
        onDrop={e => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files) }}
        className={cn(
          'relative flex aspect-[2/1] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted text-muted-foreground transition-[color,border-color,box-shadow]',
          'hover:border-muted-foreground/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
          !value && 'border-dashed',
          // Checkerboard from the border token -- reads as "transparent" in both themes
          value && transparent && 'bg-[repeating-conic-gradient(var(--border)_0_25%,transparent_0_50%)] bg-[length:16px_16px]',
          active && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
          dragging && 'border-primary bg-primary/5 text-primary'
        )}
      >
        {value ? (
          <img src={value} alt="" className={cn('size-full', transparent ? 'object-contain p-2' : 'object-cover')} />
        ) : inherited ? (
          <>
            <img src={inherited.src} alt="" className={cn('size-full opacity-40', transparent ? 'object-contain p-2' : 'object-cover')} />
            <Badge variant="secondary" className="absolute bottom-2 left-2">From {inherited.label}</Badge>
          </>
        ) : (
          <span className="flex flex-col items-center gap-1">
            <ImagePlus className="size-5" />
            <span className="text-xs">Add image</span>
          </span>
        )}
      </button>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            pick(e.target.files)
            e.target.value = ''
          }}
        />
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload data-icon="inline-start" />
          {value ? 'Replace' : 'Upload'}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon-sm" aria-label={`More actions for ${label} image`}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>
              <Images />
              Choose from library
            </DropdownMenuItem>
            {value && (
              <DropdownMenuItem variant="destructive" onSelect={onRemove}>
                <Trash2 />
                Remove
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <FieldDescription>{hint}</FieldDescription>
    </Field>
  )
}

function ImageSet({ title, description, kind, generate, generateLabel, images, onChange, previewBp, onPreview }: {
  title: string
  description: React.ReactNode
  /** Which size hints to show per slot. */
  kind: 'background' | 'artwork'
  /** What the AI dialog produces; generation lands in this set's slots. */
  generate: GenerateKind
  generateLabel: string
  images: BannerImages
  onChange: (images: BannerImages) => void
  previewBp: BannerBreakpoint
  /** Point the preview at a breakpoint -- after an upload, or when a filled slot is clicked. */
  onPreview: (bp: BannerBreakpoint) => void
}) {
  const { blobUrl, release } = useBlobUrls()
  const [generating, setGenerating] = useState(false)
  const count = imageCount(images)
  // Largest filled slot doubles as the reference picture in the dialog
  const current = [...BANNER_BREAKPOINTS].reverse().map(bp => images[bp.key]).find(Boolean) ?? null

  return (
    <div>
      <SectionTitle
        title={title}
        badge={<Badge variant="outline" className="tabular-nums">{count} / {BANNER_BREAKPOINTS.length}</Badge>}
        description={description}
        aside={
          <Button variant="outline" onClick={() => setGenerating(true)}>
            <Sparkles data-icon="inline-start" />
            {generateLabel}
          </Button>
        }
      />
      <GenerateDialog kind={generate} current={current} open={generating} onOpenChange={setGenerating} />
      {/* Six breakpoints: two rows of three once the column allows, two columns on a phone */}
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 @md/main:grid-cols-3 @md/main:gap-x-6">
        {BANNER_BREAKPOINTS.map(bp => {
          const own = images[bp.key]
          const fallback = own ? null : resolveSlot(images, bp.key)
          return (
            <ImageSlot
              key={bp.key}
              id={`${generate}-${bp.key}`}
              label={bp.label}
              viewport={bp.viewport}
              hint={bp[kind]}
              value={own}
              inherited={fallback && { src: fallback.src, label: BANNER_BREAKPOINTS.find(b => b.key === fallback.key)!.label }}
              transparent={kind === 'artwork'}
              active={previewBp === bp.key}
              onSelect={() => onPreview(bp.key)}
              onReplace={file => {
                release(own)
                onChange({ ...images, [bp.key]: blobUrl(file) })
                onPreview(bp.key)
              }}
              onRemove={() => { release(own); onChange({ ...images, [bp.key]: null }) }}
            />
          )
        })}
      </div>
    </div>
  )
}

const COMPOSITIONS: { value: Composition; title: string; description: string }[] = [
  {
    value: 'complete',
    title: 'Complete banner',
    description: 'Scene and subject in one picture; texts and the button are laid over it. One image per breakpoint -- the simplest way.',
  },
  {
    value: 'layered',
    title: 'Background + Artwork',
    description: 'Scenery behind, a transparent cut-out on the right. Swap the character or reuse the scene without redrawing everything.',
  },
]

// Schematic of the banner layers: text block on the left, and for the layered variant a cut-out on the right
function CompositionPreview({ layered }: { layered: boolean }) {
  return (
    <div className="relative flex h-16 w-full items-center overflow-hidden rounded-lg border border-border bg-muted px-3" aria-hidden>
      <div className="flex flex-col gap-1">
        <span className="h-1.5 w-16 rounded-full bg-foreground/70" />
        <span className="h-1 w-10 rounded-full bg-muted-foreground/60" />
        <span className="mt-1 h-3 w-9 rounded-sm bg-foreground/80" />
      </div>
      {layered ? (
        <div className="ml-auto flex items-end self-end">
          <span className="h-9 w-7 rounded-t-full border border-dashed border-foreground/40 bg-foreground/15" />
          <span className="-ml-2 h-6 w-5 rounded-t-full border border-dashed border-foreground/40 bg-foreground/15" />
        </div>
      ) : (
        <Images className="ml-auto size-5 text-muted-foreground/50" />
      )}
    </div>
  )
}

const STATE_BADGE: Record<BannerState, React.ComponentProps<typeof Badge>['variant']> = {
  live: 'success', scheduled: 'secondary', ended: 'ghost', draft: 'outline',
}

function BannerForm({ initial, isNew }: { initial: BannerItem; isNew: boolean }) {
  // Publish / Stop is immediate and lives outside the draft: the form only edits content
  const [published, setPublished] = useState(initial.published)
  const [confirmStop, setConfirmStop] = useState(false)
  const [banner, setBanner] = useState(initial)
  // Breakpoint shown in the preview; the image slots point it at themselves
  const [previewBp, setPreviewBp] = useState<BannerBreakpoint>('desktop')
  // Saved content goes back to the list. `published` is managed separately; uploaded images are local blob URLs
  // revoked on unmount, so the list keeps its own images until there is a real upload
  const { dirty, saving, save, reset, baseline } = useSaveable(banner, setBanner, saved =>
    commitBanner({ id: saved.id, name: saved.name, subtitle: saved.subtitle, title: saved.title, cta: saved.cta, schedule: saved.schedule })
  )
  const status = bannerStatus({ published, schedule: baseline.schedule })
  // Publishing pushes the saved version, so it waits for a first save / pending changes
  const publishBlocked = isNew ? 'Save the image first' : dirty ? 'Save changes first' : undefined

  function publish() {
    setPublished(true)
    commitBanner({ id: banner.id, published: true })
    toast.success('Published')
  }

  function stop() {
    setPublished(false)
    commitBanner({ id: banner.id, published: false })
    setConfirmStop(false)
    toast.success('Stopped -- hidden from the storefront')
  }

  const hrefError = validateCtaHref(banner.cta.href, banner.cta.external)
  const nameError = banner.name.trim() ? undefined : 'Name is required'
  const scheduleError = validateSchedule(banner.schedule)
  const hiddenArtworks = imageCount(banner.artwork)
  const startsLabel = boundaryLabel(banner.schedule.startsAt, { future: 'Starts', past: 'Started' })
  const endsLabel = boundaryLabel(banner.schedule.endsAt, { future: 'Ends', past: 'Ended' })
  const valid =
    !nameError &&
    !scheduleError &&
    !validateTranslationKey(banner.subtitle.key) &&
    !validateTranslationKey(banner.title.key) &&
    !validateTranslationKey(banner.cta.label.key) &&
    !hrefError

  function set<K extends keyof BannerItem>(key: K, value: BannerItem[K]) {
    setBanner(b => ({ ...b, [key]: value }))
  }

  const imageSetProps = { previewBp, onPreview: setPreviewBp }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Saved name, not the draft: the heading stays put while the Name field is being edited */}
          <h1 className="text-2xl font-semibold">{bannerName(baseline, isNew ? 'New image' : 'Untitled image')}</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant={STATE_BADGE[status.state]}>{STATE_LABEL[status.state]}</Badge>
            </TooltipTrigger>
            <TooltipContent>{status.label}</TooltipContent>
          </Tooltip>
        </div>
        {published ? (
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive-bg hover:text-destructive"
            onClick={() => setConfirmStop(true)}
          >
            <CircleStop />
            Stop
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              {/* span keeps the tooltip working while the button is disabled */}
              <span>
                <Button onClick={publish} disabled={!!publishBlocked}>
                  <Rocket />
                  Publish
                </Button>
              </span>
            </TooltipTrigger>
            {publishBlocked && <TooltipContent>{publishBlocked}</TooltipContent>}
          </Tooltip>
        )}
      </div>

      <AlertDialog open={confirmStop} onOpenChange={setConfirmStop}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop showing {bannerName(baseline, 'this image')}?</AlertDialogTitle>
            <AlertDialogDescription>
              The image disappears from the carousel immediately. Its content and schedule are kept,
              and you can publish it again at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={stop} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Stop
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className={cn(PAGE_GRID, 'mt-6')}>
        {/* Rail first in the DOM so it is on top when the layout stacks */}
        <div className={PAGE_RAIL}>
          <SlidePreview banner={banner} bp={previewBp} onBpChange={setPreviewBp} />
        </div>

        <div className={PAGE_MAIN}>
          <div>
            <SectionTitle title="General" description="Internal name and when the image is shown. Times are in your local time zone." />
            <FieldGroup className="mt-5">
              <Field data-invalid={!!nameError || undefined} className="max-w-md">
                <FieldLabel htmlFor="banner-name">
                  Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="banner-name"
                  placeholder="Welcome bonus"
                  value={banner.name}
                  onChange={e => set('name', e.target.value)}
                  aria-invalid={!!nameError || undefined}
                />
                <FieldDescription>Only used in the CMS; not shown on the storefront.</FieldDescription>
                <FieldError>{nameError}</FieldError>
              </Field>
              <div className="grid grid-cols-1 gap-5 @lg/main:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="starts-at">Starts</FieldLabel>
                  <div className="flex flex-wrap items-center gap-3">
                    <DateTimePicker
                      id="starts-at"
                      value={new Date(banner.schedule.startsAt)}
                      onChange={d => d && set('schedule', { ...banner.schedule, startsAt: d.toISOString() })}
                      clearable={false}
                    />
                    {startsLabel && <Badge variant="secondary">{startsLabel}</Badge>}
                  </div>
                  <FieldDescription>The image is shown from this moment once it is published.</FieldDescription>
                </Field>
                <Field data-invalid={!!scheduleError || undefined}>
                  <FieldLabel htmlFor="ends-at">Ends</FieldLabel>
                  <div className="flex flex-wrap items-center gap-3">
                    <DateTimePicker
                      id="ends-at"
                      value={banner.schedule.endsAt ? new Date(banner.schedule.endsAt) : null}
                      onChange={d => set('schedule', { ...banner.schedule, endsAt: d?.toISOString() ?? null })}
                      placeholder="No end date"
                      aria-invalid={!!scheduleError}
                    />
                    {endsLabel && <Badge variant="secondary">{endsLabel}</Badge>}
                  </div>
                  <FieldDescription>Leave empty to keep the image until it is archived.</FieldDescription>
                  <FieldError>{scheduleError}</FieldError>
                </Field>
              </div>
            </FieldGroup>
          </div>

          <div>
            <SectionTitle
              title="Content"
              description="Each text takes a translation key resolved on the storefront by the Translation Service; the fallback is shown when the translation is missing."
            />
            <div className={cn(TEXT_TABLE, 'mt-5')}>
              <TextTableHeader />
              <TranslationRow
                id="title"
                label="Title"
                value={banner.title}
                onChange={v => set('title', v)}
                keyPlaceholder="home.banner.welcome.title"
                fallbackPlaceholder="$100 + 200 Free Spins"
              />
              <TranslationRow
                id="subtitle"
                label="Subtitle"
                value={banner.subtitle}
                onChange={v => set('subtitle', v)}
                keyPlaceholder="home.banner.welcome.subtitle"
                fallbackPlaceholder="Welcome Bonus"
              />
              <TranslationRow
                id="cta-label"
                label="Button label"
                value={banner.cta.label}
                onChange={v => set('cta', { ...banner.cta, label: v })}
                keyPlaceholder="home.banner.welcome.cta"
                fallbackPlaceholder="Get it NOW"
              />
              <div className={TEXT_ROW}>
                <FieldLabel htmlFor="cta-href" className={TEXT_ROW_LABEL}>Button link</FieldLabel>
                <div className="flex flex-col gap-3 @lg/main:col-span-2">
                  <Field data-invalid={!!hrefError || undefined}>
                    <Input
                      id="cta-href"
                      placeholder={banner.cta.external ? 'https://example.com/promo' : '/promotions/welcome'}
                      value={banner.cta.href}
                      onChange={e => set('cta', { ...banner.cta, href: e.target.value })}
                      spellCheck={false}
                      aria-invalid={!!hrefError || undefined}
                    />
                    <FieldDescription>Leave empty to make the image non-clickable.</FieldDescription>
                    <FieldError>{hrefError}</FieldError>
                  </Field>
                  <Field orientation="horizontal">
                    <Checkbox
                      id="cta-external"
                      checked={banner.cta.external}
                      onCheckedChange={v => set('cta', { ...banner.cta, external: v === true })}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="cta-external">External link</FieldLabel>
                      <FieldDescription>Opens in a new tab; the link must be a full URL.</FieldDescription>
                    </FieldContent>
                  </Field>
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionTitle
              title="Visuals"
              description="How the picture is built. Texts and the button are always laid over it on the left. An empty slot falls back to the next smaller one; with nothing uploaded the banner shows the brand colour."
            />
            <Field className="mt-5">
              <RadioGroup
                value={banner.composition}
                onValueChange={v => set('composition', v as Composition)}
                aria-label="Composition"
                className="max-w-2xl grid-cols-1 gap-3 @lg/main:grid-cols-2"
              >
                {COMPOSITIONS.map(c => (
                  <FieldLabel key={c.value} htmlFor={`composition-${c.value}`}>
                    <Field orientation="horizontal">
                      <RadioGroupItem value={c.value} id={`composition-${c.value}`} />
                      <FieldContent>
                        <CompositionPreview layered={c.value === 'layered'} />
                        <FieldTitle className="mt-2">{c.title}</FieldTitle>
                        <FieldDescription>{c.description}</FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
              {banner.composition === 'complete' && hiddenArtworks > 0 && (
                <FieldDescription>
                  {hiddenArtworks} artwork {hiddenArtworks === 1 ? 'image is' : 'images are'} kept but not shown while Complete banner is selected.
                </FieldDescription>
              )}
            </Field>

            <div className="mt-8 flex flex-col gap-10">
              {banner.composition === 'complete' ? (
                <ImageSet
                  {...imageSetProps}
                  title="Banner"
                  kind="background"
                  generate="banner"
                  generateLabel="Generate banner"
                  description="Scene and subject as one picture, cropped to fill the banner."
                  images={banner.background}
                  onChange={v => set('background', v)}
                />
              ) : (
                <>
                  <ImageSet
                    {...imageSetProps}
                    title="Background"
                    kind="background"
                    generate="background"
                    generateLabel="Generate background"
                    description="Scenery only, rendered behind everything and cropped to fill the banner."
                    images={banner.background}
                    onChange={v => set('background', v)}
                  />
                  <ImageSet
                    {...imageSetProps}
                    title="Artwork"
                    kind="artwork"
                    generate="artwork"
                    generateLabel="Generate artwork"
                    description="Transparent cut-out, e.g. the character, laid over the background on the right. Sizes are the recommended cut-out dimensions, not the banner width."
                    images={banner.artwork}
                    onChange={v => set('artwork', v)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <SectionActions dirty={dirty} saving={saving} onSave={save} onReset={reset} canSave={valid} />
    </>
  )
}

/**
 * Single banner (image) page. `new` creates a banner, any other id edits an
 * existing one. Mock: reads BANNERS by id, saves locally.
 */
export default function BannerPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const banner = isNew ? emptyBanner('new') : BANNERS.items.find(b => b.id === id) ?? null
  const title = isNew ? 'New image' : banner ? bannerName(banner) : 'Image not found'

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
          { label: 'Brand Settings', href: '/brand-settings' },
          { label: 'Banners', href: BANNERS_HREF },
          { label: title },
        ]}
      />
      <div className="flex flex-1 flex-col px-6 pt-4 pb-8">
        <Button variant="ghost" size="sm" className="-ml-2 mb-4 w-fit text-muted-foreground" asChild>
          <Link href={BANNERS_HREF}>
            <ArrowLeft data-icon="inline-start" />
            Banners
          </Link>
        </Button>

        <div className="@container/form max-w-6xl">
          {loading ? (
            <div aria-busy="true" aria-label="Loading image">
              <Skeleton className="h-8 w-56" />
              <div className={cn(PAGE_GRID, 'mt-6')}>
                <Skeleton className={cn(PAGE_RAIL, 'h-64 rounded-xl')} />
                <div className={cn(PAGE_MAIN, 'gap-5')}>
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : !banner ? (
            <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <GalleryHorizontal className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">This image does not exist or has been deleted.</p>
              <Button variant="outline" size="sm" asChild>
                <Link href={BANNERS_HREF}>Back to banners</Link>
              </Button>
            </div>
          ) : (
            <BannerForm key={banner.id} initial={banner} isNew={isNew} />
          )}
        </div>
      </div>
    </>
  )
}
