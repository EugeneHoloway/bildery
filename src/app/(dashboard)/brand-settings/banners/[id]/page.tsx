'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CircleStop, GalleryHorizontal, Images, Rocket, Sparkles, Trash2, Upload } from 'lucide-react'
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
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle } from '@/components/ui/field'
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
  emptyBanner,
  STATE_LABEL,
  imageCount,
  validateCtaHref,
  validateSchedule,
  validateTranslationKey,
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

function SectionTitle({ title, badge, description, aside }: {
  title: string
  badge?: React.ReactNode
  description: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:justify-between">
      <div>
        <h3 className="flex items-center gap-2 text-base font-medium">
          {title}
          {badge}
        </h3>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  )
}

// Texts form a small table: label column, then translation key and fallback columns.
// The label + key columns together make up exactly the left half of the page and the fallback
// column the right half, so the split lines up with every other two-column block on the page.
// Rows are subgrids so the columns line up and still stack cleanly on mobile.
const TEXT_TABLE =
  'grid grid-cols-1 gap-5 tablet:grid-cols-[7rem_minmax(0,calc(50%-9.25rem))_minmax(0,calc(50%-0.75rem))] tablet:gap-x-6 tablet:gap-y-3'
const TEXT_ROW = 'grid grid-cols-1 gap-2 tablet:col-span-3 tablet:grid-cols-subgrid tablet:gap-x-6'

// Name / schedule block beside the preview: label column + one wide input column
const TOP_TABLE = 'grid grid-cols-1 gap-5 tablet:grid-cols-[7rem_minmax(0,1fr)] tablet:gap-x-6 tablet:gap-y-5'
const TOP_ROW = 'grid grid-cols-1 gap-2 tablet:col-span-2 tablet:grid-cols-subgrid tablet:gap-x-6'

function TextTableHeader() {
  return (
    <div className={cn(TEXT_ROW, 'hidden tablet:grid')} aria-hidden>
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
      <FieldLabel htmlFor={`${id}-key`} className="tablet:h-8 tablet:items-center">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Field data-invalid={!!keyError || undefined}>
        <FieldLabel htmlFor={`${id}-key`} className="text-muted-foreground tablet:sr-only">Translation key</FieldLabel>
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
        <FieldLabel htmlFor={`${id}-fallback`} className="text-muted-foreground tablet:sr-only">Fallback</FieldLabel>
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

function ImageSlot({ label, viewport, hint, value, transparent, onReplace, onRemove }: {
  label: string
  viewport: number
  hint: string
  value: string | null
  /** Cut-outs: fit inside the slot on a checkerboard so the transparency is visible. */
  transparent?: boolean
  onReplace: (file: File) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Field>
      <FieldLabel className="items-baseline">
        {label}
        <span className="text-xs font-normal text-muted-foreground">{viewport} vp</span>
      </FieldLabel>
      <div
        className={cn(
          'flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted',
          !value && 'border-dashed',
          // Checkerboard from the border token -- reads as "transparent" in both themes
          value && transparent && 'bg-[repeating-conic-gradient(var(--border)_0_25%,transparent_0_50%)] bg-[length:16px_16px]'
        )}
      >
        {value ? (
          <img src={value} alt={`${label} image`} className={cn('size-full', transparent ? 'object-contain p-2' : 'object-cover')} />
        ) : (
          <Images className="size-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex items-center gap-2">
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
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload data-icon="inline-start" />
          {value ? 'Replace' : 'Upload'}
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon-sm" aria-label={`Choose ${label} image from library`}>
              <Images />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Choose from library</TooltipContent>
        </Tooltip>
        {value && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Remove ${label} image`} onClick={onRemove}>
                <Trash2 className="text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove</TooltipContent>
          </Tooltip>
        )}
      </div>
      <FieldDescription>{hint}</FieldDescription>
    </Field>
  )
}

function ImageSet({ title, description, kind, generate, generateLabel, images, onChange }: {
  title: string
  description: React.ReactNode
  /** Which size hints to show per slot. */
  kind: 'background' | 'artwork'
  /** What the AI dialog produces; generation lands in this set's slots. */
  generate: GenerateKind
  generateLabel: string
  images: BannerImages
  onChange: (images: BannerImages) => void
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
      <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 tablet:grid-cols-2">
        {BANNER_BREAKPOINTS.map(bp => (
          <ImageSlot
            key={bp.key}
            label={bp.label}
            viewport={bp.viewport}
            hint={bp[kind]}
            value={images[bp.key]}
            transparent={kind === 'artwork'}
            onReplace={file => { release(images[bp.key]); onChange({ ...images, [bp.key]: blobUrl(file) }) }}
            onRemove={() => { release(images[bp.key]); onChange({ ...images, [bp.key]: null }) }}
          />
        ))}
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
  const { dirty, saving, save, reset, baseline } = useSaveable(banner, setBanner)
  const status = bannerStatus({ published, schedule: baseline.schedule })
  // Publishing pushes the saved version, so it waits for a first save / pending changes
  const publishBlocked = isNew ? 'Save the image first' : dirty ? 'Save changes first' : undefined

  function publish() {
    setPublished(true)
    toast.success('Published')
  }

  function stop() {
    setPublished(false)
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

      {/* Identity and schedule on the left, live preview on the right; stacked on narrow screens */}
      <div className="mt-6 grid grid-cols-1 gap-8 desktop:grid-cols-2 desktop:gap-x-6 desktop:items-start">
        <div>
          <SectionTitle title="General" description="Internal name and when the image is shown." />
          <div className={cn(TOP_TABLE, 'mt-5')}>
            <div className={TOP_ROW}>
              <FieldLabel htmlFor="banner-name" className="tablet:h-8 tablet:items-center">
                Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Field data-invalid={!!nameError || undefined}>
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
            </div>
            <div className={TOP_ROW}>
              <FieldLabel htmlFor="starts-at" className="tablet:h-8 tablet:items-center">Starts</FieldLabel>
              <Field>
                <div className="flex flex-wrap items-center gap-3">
                  <DateTimePicker
                    id="starts-at"
                    value={banner.schedule.startsAt ? new Date(banner.schedule.startsAt) : null}
                    onChange={d => set('schedule', { ...banner.schedule, startsAt: d?.toISOString() ?? null })}
                    placeholder="Right away"
                  />
                  {startsLabel && <Badge variant="secondary">{startsLabel}</Badge>}
                </div>
                <FieldDescription>Leave empty to show the image as soon as it is published.</FieldDescription>
              </Field>
            </div>
            <div className={TOP_ROW}>
              <FieldLabel htmlFor="ends-at" className="tablet:h-8 tablet:items-center">Ends</FieldLabel>
              <Field data-invalid={!!scheduleError || undefined}>
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
                <FieldDescription>
                  Leave empty to keep the image until it is archived. Times are in your local time zone.
                </FieldDescription>
                <FieldError>{scheduleError}</FieldError>
              </Field>
            </div>
          </div>
        </div>
        <SlidePreview banner={banner} />
      </div>

      <div className="mt-12">
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
            <FieldLabel htmlFor="cta-href" className="tablet:h-8 tablet:items-center">Button link</FieldLabel>
            <div className="flex flex-col gap-3 tablet:col-span-2">
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

      <div className="mt-12">
        <div>
          <SectionTitle
            title="Visuals"
            description="How the picture is built. Texts and the button are always laid over it on the left. Slots are per breakpoint: an empty one falls back to the next smaller slot, so upload only where the picture changes; all empty shows the default dark banner colour. Upload sizes are @2× / @3× for Retina."
          />
          <Field className="mt-5">
            <RadioGroup
              value={banner.composition}
              onValueChange={v => set('composition', v as Composition)}
              aria-label="Composition"
              className="grid-cols-1 gap-6 tablet:grid-cols-2"
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
        </div>

        {banner.composition === 'complete' ? (
          <div className="mt-8">
            <ImageSet
              title="Banner"
              kind="background"
              generate="banner"
              generateLabel="Generate banner"
              description="Scene and subject as one picture, cropped to fill the banner."
              images={banner.background}
              onChange={v => set('background', v)}
            />
          </div>
        ) : (
          <>
            <div className="mt-8">
              <ImageSet
                title="Background"
                kind="background"
                generate="background"
                generateLabel="Generate background"
                description="Scenery only, rendered behind everything and cropped to fill the banner."
                images={banner.background}
                onChange={v => set('background', v)}
              />
            </div>
            <div className="mt-10">
              <ImageSet
                title="Artwork"
                kind="artwork"
                generate="artwork"
                generateLabel="Generate artwork"
                description="Transparent cut-out, e.g. the character, laid over the background on the right. Sizes are the recommended cut-out dimensions, not the banner width."
                images={banner.artwork}
                onChange={v => set('artwork', v)}
              />
            </div>
          </>
        )}
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

        {loading ? (
          <div aria-busy="true" aria-label="Loading image">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-2 h-4 w-80 max-w-full" />
            <div className="mt-8 grid grid-cols-1 gap-5 tablet:grid-cols-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
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
          <div className="max-w-6xl">
            <BannerForm key={banner.id} initial={banner} isNew={isNew} />
          </div>
        )}
      </div>
    </>
  )
}
