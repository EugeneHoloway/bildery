'use client'
import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Sparkles, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldContent, FieldDescription, FieldLabel, FieldLegend, FieldSet, FieldTitle } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { BRAND_COLORS } from '../../../_lib/theme'
import { useBlobUrls } from '../../../_lib/use-blob-urls'

export type GenerateKind = 'banner' | 'background' | 'artwork'

type Source = 'none' | 'current' | 'upload'
/** What to do with the reference picture. */
type Mode = 'upscale' | 'subject' | 'theme'
type Quality = 'low' | 'medium' | 'high'

const KIND_COPY: Record<GenerateKind, { title: string; description: string; current: string; noun: string }> = {
  banner: {
    title: 'Generate a complete banner with AI',
    description:
      'One finished picture -- scene and subject together: the subject stands on the right, the left stays clean for the title and button. Fills the banner slots for every breakpoint; no separate artwork needed. Attach a photo to keep a specific person or product. Takes 15–40 seconds; you can close this and come back.',
    current: 'Current banner',
    noun: 'banner',
  },
  background: {
    title: 'Generate a background with AI',
    description:
      'Scenery only -- no subject and no text: the right side stays calm for the artwork, the left for the title and button. Fills the background slots for every breakpoint. Attach a photo to keep a specific place or mood. Takes 15–40 seconds; you can close this and come back.',
    current: 'Current background',
    noun: 'background',
  },
  artwork: {
    title: 'Generate artwork with AI',
    description:
      'A transparent cut-out -- the character or product alone, without a scene. Fills the artwork slots for every breakpoint. Attach a photo to keep a specific person or product. Takes 15–40 seconds; you can close this and come back.',
    current: 'Current artwork',
    noun: 'artwork',
  },
}

const MODELS: { id: string; label: string; price: number }[] = [
  { id: 'gemini-3.1-flash-image', label: 'gemini-3.1-flash-image (default)', price: 0.039 },
  { id: 'gpt-image-1',            label: 'gpt-image-1',                      price: 0.042 },
  { id: 'gpt-image-2',            label: 'gpt-image-2',                      price: 0.063 },
  { id: 'gemini-3-pro-image',     label: 'gemini-3-pro-image',               price: 0.134 },
]

const QUALITIES: { id: Quality; label: string; factor: number }[] = [
  { id: 'low',    label: 'Low',    factor: 0.5 },
  { id: 'medium', label: 'Medium', factor: 1 },
  { id: 'high',   label: 'High',   factor: 2.6 },
]

const STYLES = ['Classic fruit', 'Dark fantasy', 'Egyptian', 'Premium 3d', 'Realistic']

const COUNTS: { value: number; label: string }[] = [
  { value: 1, label: 'One' },
  { value: 2, label: '2 to pick from' },
  { value: 3, label: '3 to pick from' },
  { value: 4, label: '4 to pick from' },
]

// Ordered from "keep everything" to "keep only the idea"
function modes(noun: string): { id: Mode; title: string; description: string }[] {
  return [
    {
      id: 'upscale',
      title: 'Everything, just sharper',
      description: 'Same scene, subject and layout, redrawn in higher quality. Style is ignored.',
    },
    {
      id: 'subject',
      title: 'The subject only',
      description: `The person or product stays recognisable; the ${noun} around it is new, in the chosen style.`,
    },
    {
      id: 'theme',
      title: 'Just the idea',
      description: `The picture is only a brief: same kind of subject and mood, a new ${noun}.`,
    },
  ]
}

// Hatched placeholder for previews with nothing to show yet (border token, so it works in both themes)
const HATCHED = 'bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,var(--border)_6px,var(--border)_7px)]'

/** Choice card (shadcn radio-group pattern): title + description, radio on the right, optional preview below. */
function ChoiceCard({ id, value, title, description, preview, disabled }: {
  id: string
  value: string
  title: string
  description: string
  preview?: React.ReactNode
  disabled?: boolean
}) {
  return (
    <FieldLabel htmlFor={id} className={cn(disabled && 'pointer-events-none opacity-50')}>
      <Field className="flex-1">
        <div className="flex items-start gap-2">
          <FieldContent>
            <FieldTitle>{title}</FieldTitle>
            <FieldDescription>{description}</FieldDescription>
          </FieldContent>
          <RadioGroupItem value={value} id={id} disabled={disabled} />
        </div>
        {preview && (
          <div className="relative mt-auto flex h-24 w-full items-center justify-center overflow-hidden rounded-lg bg-muted/40">
            {preview}
          </div>
        )}
      </Field>
    </FieldLabel>
  )
}

export function GenerateDialog({ kind, current, open, onOpenChange }: {
  kind: GenerateKind
  /** Largest picture already in this set, offered as a reference. */
  current: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const copy = KIND_COPY[kind]
  const { blobUrl, release } = useBlobUrls()
  const fileRef = useRef<HTMLInputElement>(null)

  const [source, setSource] = useState<Source>('none')
  const [upload, setUpload] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('upscale')
  const [model, setModel] = useState(MODELS[0].id)
  const [quality, setQuality] = useState<Quality>('high')
  const [style, setStyle] = useState('Realistic')
  const [count, setCount] = useState(1)
  const [brandColours, setBrandColours] = useState(true)
  const [instructions, setInstructions] = useState('')

  // A fresh dialog each time it opens
  useEffect(() => {
    if (!open) return
    setSource('none')
    setMode('upscale')
    setInstructions('')
  }, [open])

  const hasReference = source !== 'none'
  const styleIgnored = hasReference && mode === 'upscale'
  const missingPhoto = source === 'upload' && !upload
  const price = (MODELS.find(m => m.id === model)?.price ?? 0) * (QUALITIES.find(q => q.id === quality)?.factor ?? 1) * count

  function pickUpload() {
    fileRef.current?.click()
  }

  function onFile(file: File | undefined) {
    if (!file) return
    release(upload)
    setUpload(blobUrl(file))
  }

  function removeUpload() {
    release(upload)
    setUpload(null)
  }

  function generate() {
    onOpenChange(false)
    toast.success(`Generating ${count === 1 ? `the ${copy.noun}` : `${count} ${copy.noun} options`}`, {
      description: 'Takes 15–40 seconds. You can keep editing meanwhile.',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] gap-6 overflow-y-auto p-6 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-7">
          <FieldSet>
            <FieldLegend variant="label">Starting point</FieldLegend>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { onFile(e.target.files?.[0]); e.target.value = '' }}
            />
            <RadioGroup value={source} onValueChange={v => setSource(v as Source)} className="grid-cols-1 gap-3 sm:grid-cols-3">
              <ChoiceCard
                id="source-none"
                value="none"
                title="Description only"
                description="Everything comes from the description, style and settings below."
                preview={<div className={cn('size-full', HATCHED)} />}
              />
              <ChoiceCard
                id="source-current"
                value="current"
                title={copy.current}
                description={current ? 'Reuse what is already in the slots.' : 'Nothing in the slots yet.'}
                disabled={!current}
                preview={current
                  ? <img src={current} alt="" className="size-full object-cover" />
                  : <div className={cn('size-full', HATCHED)} />}
              />
              <ChoiceCard
                id="source-upload"
                value="upload"
                title="Reference photo"
                description="A person, product or place to keep in the result."
                preview={upload ? (
                  <>
                    <img src={upload} alt="" className="size-full object-cover" />
                    {/* Buttons inside a label do not toggle the radio, so they can sit on the preview */}
                    <div className="absolute right-1.5 bottom-1.5 flex items-center gap-1">
                      <Button variant="outline" size="icon-xs" aria-label="Replace photo" onClick={pickUpload}>
                        <Upload />
                      </Button>
                      <Button variant="outline" size="icon-xs" aria-label="Remove photo" onClick={removeUpload}>
                        <Trash2 />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className={cn('flex size-full items-center justify-center', HATCHED)}>
                    <Button variant="outline" size="sm" onClick={() => { setSource('upload'); pickUpload() }}>
                      <ImagePlus data-icon="inline-start" />
                      Upload a photo
                    </Button>
                  </div>
                )}
              />
            </RadioGroup>
          </FieldSet>

          {hasReference && (
            <FieldSet>
              <FieldLegend variant="label">How much to keep</FieldLegend>
              <RadioGroup value={mode} onValueChange={v => setMode(v as Mode)} className="grid-cols-1 gap-3 sm:grid-cols-3">
                {modes(copy.noun).map(m => (
                  <ChoiceCard key={m.id} id={`mode-${m.id}`} value={m.id} title={m.title} description={m.description} />
                ))}
              </RadioGroup>
            </FieldSet>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="gen-model">Model</FieldLabel>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="gen-model" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map(m => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldDescription>Same prompt, different renderer -- the price under the button follows it.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="gen-quality">Quality</FieldLabel>
              <Select value={quality} onValueChange={v => setQuality(v as Quality)}>
                <SelectTrigger id="gen-quality" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUALITIES.map(q => <SelectItem key={q.id} value={q.id}>{q.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field data-disabled={styleIgnored || undefined}>
              <FieldLabel htmlFor="gen-style">Style</FieldLabel>
              <Select value={style} onValueChange={setStyle} disabled={styleIgnored}>
                <SelectTrigger id="gen-style" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {styleIgnored && <FieldDescription>Not used while the picture is kept as it is.</FieldDescription>}
            </Field>
            <Field>
              <FieldLabel htmlFor="gen-count">Options to choose from</FieldLabel>
              <Select value={String(count)} onValueChange={v => setCount(Number(v))}>
                <SelectTrigger id="gen-count" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTS.map(c => <SelectItem key={c.value} value={String(c.value)}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldDescription>Each one is a separate render and costs the same as the first.</FieldDescription>
            </Field>
          </div>

          <Field orientation="horizontal">
            <Checkbox id="gen-brand" checked={brandColours} onCheckedChange={v => setBrandColours(v === true)} />
            <FieldContent>
              <FieldLabel htmlFor="gen-brand">Use brand colours</FieldLabel>
              <FieldDescription>
                Accent <span className="font-mono">{BRAND_COLORS.primary}</span>, background{' '}
                <span className="font-mono">{BRAND_COLORS.background}</span> -- woven in as accent light and details.
              </FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="gen-details">Description</FieldLabel>
            <Textarea
              id="gen-details"
              placeholder="golden scarab, torch-lit sandstone, no text"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="min-h-20"
            />
            <FieldDescription>
              Optional. Describe the subject, mood and anything to avoid -- layout, style and brand colours are added for you.
            </FieldDescription>
          </Field>
        </div>

        <DialogFooter className="-mx-6 -mb-6 px-6 sm:items-center sm:justify-start">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button onClick={generate} disabled={missingPhoto}>
                  <Sparkles />
                  Generate
                </Button>
              </span>
            </TooltipTrigger>
            {missingPhoto && <TooltipContent>Upload a reference photo first</TooltipContent>}
          </Tooltip>
          <span className="text-sm text-muted-foreground tabular-nums">about ${price.toFixed(3)}</span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
