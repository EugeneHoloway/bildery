'use client'
import { useState } from 'react'
import { Lock, Plus, X, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from '@/components/ui/empty'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

interface CatalogPickerProps {
  /** Every code that can be attached (registered in the upstream service). */
  catalog: string[]
  /** Currently attached codes. */
  value: string[]
  onChange: (value: string[]) => void
  /** Codes that are always attached and cannot be removed. */
  locked?: string[]
  /** Suffix shown next to locked codes, e.g. "default". */
  lockedHint?: string
  /** Display label for a code (chips and list); defaults to the code itself. */
  labelFor?: (code: string) => string
  addLabel?: string
  searchPlaceholder?: string
  /** Shown instead of the chips when nothing is attached. */
  emptyIcon?: LucideIcon
  emptyText?: string
}

export function CatalogPicker({
  catalog,
  value,
  onChange,
  locked = [],
  lockedHint,
  labelFor = code => code,
  addLabel = 'Add',
  searchPlaceholder = 'Search…',
  emptyIcon: EmptyIcon,
  emptyText,
}: CatalogPickerProps) {
  const [open, setOpen] = useState(false)

  function toggle(code: string) {
    if (locked.includes(code)) return
    onChange(value.includes(code) ? value.filter(v => v !== code) : [...value, code])
  }

  const trigger = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" role="combobox" aria-expanded={open}>
          <Plus data-icon="inline-start" />
          {addLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-56 p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>Nothing found.</CommandEmpty>
            <CommandGroup>
              {catalog.map(code => {
                const isLocked = locked.includes(code)
                const checked = value.includes(code)
                return (
                  // The check comes from CommandItem itself (data-checked), on the right like in the font picker
                  <CommandItem
                    key={code}
                    value={labelFor(code)}
                    disabled={isLocked}
                    data-checked={checked}
                    onSelect={() => toggle(code)}
                  >
                    {isLocked && <Lock className="text-muted-foreground" />}
                    {labelFor(code)}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )

  if (value.length === 0 && EmptyIcon) {
    return (
      <Empty className="rounded-xl border border-border">
        <EmptyHeader>
          {/* Project empty-state media: rounded-xl tile, 20px icon */}
          <EmptyMedia variant="icon" className="size-10 rounded-xl">
            <EmptyIcon className="size-5 text-muted-foreground" />
          </EmptyMedia>
          {emptyText && <EmptyDescription>{emptyText}</EmptyDescription>}
        </EmptyHeader>
        <EmptyContent>{trigger}</EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {value.map(code => {
        const isLocked = locked.includes(code)
        return isLocked ? (
          <Badge key={code} variant="outline">
            <Lock className="text-muted-foreground" />
            {labelFor(code)}
            {lockedHint && <span className="font-normal text-muted-foreground">· {lockedHint}</span>}
          </Badge>
        ) : (
          <Badge key={code} variant="secondary">
            {labelFor(code)}
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Remove ${code}`}
              onClick={() => toggle(code)}
              // Fits inside the 20px badge: smaller hit box, round like the chip
              className="-mr-1 size-4 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X />
            </Button>
          </Badge>
        )
      })}
      {trigger}
    </div>
  )
}
