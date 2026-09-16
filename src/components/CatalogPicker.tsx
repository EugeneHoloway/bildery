'use client'
import { useState } from 'react'
import { Check, Lock, Plus, X, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
                  <CommandItem
                    key={code}
                    value={labelFor(code)}
                    disabled={isLocked}
                    onSelect={() => toggle(code)}
                  >
                    {isLocked
                      ? <Lock className="size-3.5 text-muted-foreground" />
                      : <Check className={cn('size-3.5', checked ? 'opacity-100' : 'opacity-0')} />}
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
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
        <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
          <EmptyIcon className="size-5 text-muted-foreground" />
        </div>
        {emptyText && <p className="text-sm text-muted-foreground">{emptyText}</p>}
        {trigger}
      </div>
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
            <button
              type="button"
              aria-label={`Remove ${code}`}
              onClick={() => toggle(code)}
              className="rounded-full p-0.5 text-muted-foreground transition-colors outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-3" />
            </button>
          </Badge>
        )
      })}
      {trigger}
    </div>
  )
}
