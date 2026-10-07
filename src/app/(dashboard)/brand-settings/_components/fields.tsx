'use client'
import { useRef, useState } from 'react'
import { ChevronDown, CloudUpload, ImagePlus, Images, Languages, TextCursorInput, Trash2, TriangleAlert, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { IconImage, mockIcon } from './icon-image'
import { TRANSLATION_KEYS, TRANSLATIONS, type DepositIcon, type TranslationKey } from '../_lib/deposit-methods'

/** Translation key combobox (shadcn pattern: picking the checked key again clears it) with the EN value underneath. */
export function TranslationKeyField({ id, label, value, onChange, error, suggested }: {
  id: string
  label: string
  value: TranslationKey
  onChange: (v: TranslationKey) => void
  error?: string
  /** Conventional key for this field; listed first with a Suggested badge */
  suggested?: string
}) {
  const [open, setOpen] = useState(false)
  const en = value ? TRANSLATIONS[value] : undefined
  const keys = suggested ? [suggested, ...TRANSLATION_KEYS.filter(k => k !== suggested)] : TRANSLATION_KEYS

  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={!!error || undefined}
            aria-describedby={value ? `${id}-en` : undefined}
            className="w-full justify-start font-normal"
          >
            <Languages data-icon="inline-start" className="text-muted-foreground" />
            <span className={cn('min-w-0 flex-1 truncate text-left', value ? 'font-mono text-xs' : 'text-muted-foreground')}>
              {value ?? 'Select translation key…'}
            </span>
            <ChevronDown className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder="Search key or English text…" />
            <CommandList>
              <CommandEmpty>No keys found.</CommandEmpty>
              <CommandGroup>
                {keys.map(key => (
                  <CommandItem
                    key={key}
                    value={`${key} ${TRANSLATIONS[key]}`}
                    onSelect={() => { onChange(key === value ? null : key); setOpen(false) }}
                    data-checked={key === value || undefined}
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-mono text-xs">{key}</span>
                        {key === suggested && <Badge variant="secondary" className="uppercase">Suggested</Badge>}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">{TRANSLATIONS[key]}</span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && (en !== undefined ? (
        <FieldDescription id={`${id}-en`}>
          <span className="font-medium">EN</span> · {en}
        </FieldDescription>
      ) : (
        <p id={`${id}-en`} className="flex items-start gap-1.5 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Key not found in translations -- the website will render the raw key.{' '}
            <Button variant="link" size="xs" className="h-auto p-0 align-baseline text-sm text-foreground" onClick={() => toast('Localization is coming soon')}>
              Open Localization
            </Button>
          </span>
        </p>
      ))}
      {!value && suggested && (
        <FieldDescription className="flex flex-wrap items-center gap-x-2">
          <span>
            Suggested: <span className="font-mono text-xs">{suggested}</span> -- {TRANSLATIONS[suggested]}
          </span>
          <Button variant="link" size="xs" className="h-auto p-0 text-foreground" onClick={() => onChange(suggested)}>
            Use
          </Button>
        </FieldDescription>
      )}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

const IMAGE_FORMATS = {
  svg: { accept: 'image/svg+xml,.svg', types: ['image/svg+xml'], hint: 'SVG only', error: 'Only SVG icons are supported' },
  image: { accept: 'image/svg+xml,image/png,image/webp,.svg,.png,.webp', types: ['image/svg+xml', 'image/png', 'image/webp'], hint: 'SVG, PNG or WebP', error: 'Only SVG, PNG or WebP images are supported' },
}

/** Image slot (an icon by default) plus its alt text. */
export function IconFields({ id, value, onChange, label = 'Icon', formats = 'svg', error, variant = 'dropzone', surface = 'default' }: {
  id: string
  value: DepositIcon
  onChange: (v: DepositIcon) => void
  label?: string
  formats?: keyof typeof IMAGE_FORMATS
  error?: string
  /** compact: a 48px tile with inline actions and the alt text beside it, for forms with many icons */
  variant?: 'dropzone' | 'compact'
  /** dark: preview on the storefront's dark surface, for icons the website paints on dark (e.g. the sidebar drawer) */
  surface?: 'default' | 'dark'
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const format = IMAGE_FORMATS[formats]
  const noun = label.toLowerCase()

  function pick(file: File | undefined) {
    if (!file) return
    if (!format.types.includes(file.type)) {
      toast.error(format.error)
      return
    }
    // Mock upload: a local preview url stands in for the media library link
    onChange({ ...value, src: URL.createObjectURL(file) })
  }

  const browse = () => inputRef.current?.click()
  const chooseFromLibrary = () => toast('Media library is coming soon')

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={format.accept}
      className="hidden"
      onChange={e => {
        pick(e.target.files?.[0])
        e.target.value = ''
      }}
    />
  )

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragging(true) },
    onDragLeave: (e: React.DragEvent<HTMLElement>) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false) },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]) },
  }

  const showAlt = !!(value.src || value.alt)
  const altField = (
    <Field>
      <FieldLabel htmlFor={`${id}-alt`}>Alt text</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <TextCursorInput />
        </InputGroupAddon>
        <InputGroupInput
          id={`${id}-alt`}
          value={value.alt}
          onChange={e => onChange({ ...value, alt: e.target.value })}
          placeholder={`Describe the ${noun} for screen readers`}
        />
      </InputGroup>
    </Field>
  )

  if (variant === 'compact') {
    return (
      // Two columns only once the icon controls fit beside the alt text (by the form's own width, so sheets keep one)
      <div className="@container">
        <div className={cn('grid grid-cols-1 gap-5', showAlt && '@xl:grid-cols-2')}>
          <Field data-invalid={!!error || undefined}>
            <FieldLabel htmlFor={`${id}-upload`}>{label}</FieldLabel>
            {fileInput}
            {/* The whole row takes a dropped file */}
            <div {...dropHandlers} className="flex items-center gap-3">
              <div
                className={cn(
                  'flex size-12 shrink-0 items-center justify-center rounded-xl border transition-colors',
                  // Only a real uploaded file needs the dark surface; Lucide mocks read on the muted tile
                  value.src && surface === 'dark' && !mockIcon(value.src) ? 'border-transparent bg-storefront-surface dark:border-border' : 'border-border bg-muted',
                  error && 'border-destructive',
                  dragging && 'border-primary ring-3 ring-ring/50'
                )}
              >
                {value.src ? (
                  <IconImage src={value.src} className="size-6" />
                ) : (
                  <ImagePlus className="size-5 text-muted-foreground" />
                )}
              </div>
              {/* One group of actions, so it stays on one line in narrow forms */}
              <ButtonGroup>
                <Button id={`${id}-upload`} variant="outline" size="sm" onClick={browse} aria-invalid={!!error || undefined}>
                  <Upload data-icon="inline-start" />
                  {value.src ? 'Replace' : 'Upload'}
                </Button>
                <Button variant="outline" size="sm" onClick={chooseFromLibrary} aria-label="Choose from library">
                  <Images data-icon="inline-start" />
                  Library
                </Button>
                {value.src && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon-sm" aria-label={`Remove ${noun}`} onClick={() => onChange({ ...value, src: null })}>
                        <Trash2 className="text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove {noun}</TooltipContent>
                  </Tooltip>
                )}
              </ButtonGroup>
            </div>
            {/* Drag and drop onto the row still works; the hint only states the format */}
            <FieldDescription>{format.hint}</FieldDescription>
            <FieldError>{error}</FieldError>
          </Field>
          {showAlt && altField}
        </div>
      </div>
    )
  }

  return (
    <>
      <Field data-invalid={!!error || undefined}>
        <FieldLabel htmlFor={`${id}-upload`}>{label}</FieldLabel>
        {fileInput}
        {/* One shadcn Empty for both states, so the form doesn't jump and a new file can be dropped to replace */}
        <Empty
          {...dropHandlers}
          className={cn(
            // Empty is dashed by default; a filled slot switches to a solid border
            'border transition-colors',
            value.src && 'border-solid',
            error && 'border-destructive',
            dragging && 'border-primary bg-muted/50'
          )}
        >
          <EmptyHeader>
            {value.src ? (
              <EmptyMedia className="size-16 rounded-xl border border-border bg-muted">
                <IconImage src={value.src} className="size-8" />
              </EmptyMedia>
            ) : (
              <EmptyMedia variant="icon">
                <CloudUpload />
              </EmptyMedia>
            )}
            <EmptyTitle>{value.src ? `${label} uploaded` : `Upload ${noun}`}</EmptyTitle>
            <EmptyDescription>
              {value.src
                ? 'Drop a new file here or pick another one to replace it.'
                : `${format.hint}. Drag and drop a file here, browse, or pick one from the media library.`}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row flex-wrap justify-center">
            {value.src ? (
              <Button id={`${id}-upload`} variant="outline" size="sm" onClick={browse}>
                <Upload data-icon="inline-start" />
                Replace
              </Button>
            ) : (
              <Button id={`${id}-upload`} size="sm" onClick={browse} aria-invalid={!!error || undefined}>
                Browse files
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={chooseFromLibrary}>
              <Images data-icon="inline-start" />
              Choose from library
            </Button>
            {value.src && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Remove ${noun}`} onClick={() => onChange({ ...value, src: null })}>
                    <Trash2 className="text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove {noun}</TooltipContent>
              </Tooltip>
            )}
          </EmptyContent>
        </Empty>
        <FieldError>{error}</FieldError>
      </Field>
      {/* Alt text only matters once there is an icon (or an alt already saved with one) */}
      {showAlt && altField}
    </>
  )
}
