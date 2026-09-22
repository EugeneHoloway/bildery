'use client'
import { useRef, useState } from 'react'
import { ChevronDown, CloudUpload, Images, Languages, TextCursorInput, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { TRANSLATION_KEYS, TRANSLATIONS, type DepositIcon, type TranslationKey } from '../../../_lib/deposit-methods'

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
        <p id={`${id}-en`} className="text-sm text-destructive">No EN translation for this key.</p>
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

/** SVG icon slot plus its alt text. */
export function IconFields({ id, value, onChange }: {
  id: string
  value: DepositIcon
  onChange: (v: DepositIcon) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function pick(file: File | undefined) {
    if (!file) return
    if (file.type !== 'image/svg+xml') {
      toast.error('Only SVG icons are supported')
      return
    }
    // Mock upload: a local preview url stands in for the media library link
    onChange({ ...value, src: URL.createObjectURL(file) })
  }

  const browse = () => inputRef.current?.click()
  const chooseFromLibrary = () => toast('Media library is coming soon')

  return (
    <>
      <Field>
        <FieldLabel htmlFor={`${id}-upload`}>Icon</FieldLabel>
        <input
          ref={inputRef}
          type="file"
          accept="image/svg+xml,.svg"
          className="hidden"
          onChange={e => {
            pick(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        {/* One shadcn Empty for both states, so the form doesn't jump and a new file can be dropped to replace */}
        <Empty
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false) }}
          onDrop={e => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]) }}
          className={cn(
            // Empty is dashed by default; a filled slot switches to a solid border
            'border transition-colors',
            value.src && 'border-solid',
            dragging && 'border-primary bg-muted/50'
          )}
        >
          <EmptyHeader>
            {value.src ? (
              <EmptyMedia className="size-16 rounded-xl border border-border bg-muted">
                <img src={value.src} alt="" className="size-8 object-contain" />
              </EmptyMedia>
            ) : (
              <EmptyMedia variant="icon">
                <CloudUpload />
              </EmptyMedia>
            )}
            <EmptyTitle>{value.src ? 'Icon uploaded' : 'Upload icon'}</EmptyTitle>
            <EmptyDescription>
              {value.src
                ? 'Drop a new SVG here or pick another one to replace it.'
                : 'SVG only. Drag and drop a file here, browse, or pick one from the media library.'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row flex-wrap justify-center">
            {value.src ? (
              <Button id={`${id}-upload`} variant="outline" size="sm" onClick={browse}>
                <Upload data-icon="inline-start" />
                Replace
              </Button>
            ) : (
              <Button id={`${id}-upload`} size="sm" onClick={browse}>
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
                  <Button variant="ghost" size="icon-sm" aria-label="Remove icon" onClick={() => onChange({ ...value, src: null })}>
                    <Trash2 className="text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove icon</TooltipContent>
              </Tooltip>
            )}
          </EmptyContent>
        </Empty>
      </Field>
      {/* Alt text only matters once there is an icon (or an alt already saved with one) */}
      {(value.src || value.alt) && (
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
              placeholder="Describe the icon for screen readers"
            />
          </InputGroup>
        </Field>
      )}
    </>
  )
}
