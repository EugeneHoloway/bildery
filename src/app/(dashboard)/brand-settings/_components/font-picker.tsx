'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface FontInfo {
  family: string
  category: string
  /** One file covers every weight; static fonts ship a file per weight */
  variable: boolean
  weights: number[]
  subsets: string[]
}

/** Google Fonts catalog (mock). Weights and subsets come from the family, not from the form. */
export const FONT_CATALOG: FontInfo[] = [
  {
    family: 'Inter', category: 'Sans-serif', variable: true,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    subsets: ['cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'latin', 'latin-ext', 'vietnamese'],
  },
  {
    family: 'Inter Tight', category: 'Sans-serif', variable: true,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    subsets: ['cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'latin', 'latin-ext', 'vietnamese'],
  },
  {
    family: 'Roboto', category: 'Sans-serif', variable: true,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    subsets: ['cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'latin', 'latin-ext', 'math', 'symbols', 'vietnamese'],
  },
  {
    family: 'Open Sans', category: 'Sans-serif', variable: true,
    weights: [300, 400, 500, 600, 700, 800],
    subsets: ['cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'hebrew', 'latin', 'latin-ext', 'math', 'symbols', 'vietnamese'],
  },
  {
    family: 'Montserrat', category: 'Sans-serif', variable: true,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    subsets: ['cyrillic', 'cyrillic-ext', 'latin', 'latin-ext', 'vietnamese'],
  },
  {
    family: 'Poppins', category: 'Sans-serif', variable: false,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    subsets: ['devanagari', 'latin', 'latin-ext'],
  },
]

function summary(font: FontInfo) {
  return `${font.category} · ${font.variable ? 'Variable' : 'Static'}, ${font.weights.length} weights`
}

function FontDetails({ font, cssVariable, fallback }: { font: FontInfo; cssVariable?: string; fallback: string }) {
  const rows: [string, string][] = [
    ['Source', 'Google Fonts'],
    ...(cssVariable ? [['CSS variable', cssVariable] as [string, string]] : []),
    ['Fallback', fallback],
  ]
  // Lists read better as chips than as a comma run that wraps against the right edge
  const lists: [string, string[]][] = [
    [`Weights (${font.weights.length})`, font.weights.map(String)],
    [`Subsets (${font.subsets.length})`, font.subsets],
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-foreground">{font.family}</p>
          <p className="text-muted-foreground">{font.category}</p>
        </div>
        {font.variable
          ? <Badge className="bg-brand-bg text-brand">Variable</Badge>
          : <Badge variant="secondary">Static</Badge>}
      </div>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right break-words text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      {lists.map(([label, items]) => (
        <div key={label} className="flex flex-col gap-1.5">
          <p className="text-muted-foreground">{label}</p>
          <div className="flex flex-wrap gap-1">
            {items.map(item => <Badge key={item} variant="outline" className="font-normal">{item}</Badge>)}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        {font.variable
          ? 'All weights load as one file.'
          : 'Each weight is a separate file -- the storefront loads only the ones it uses.'}
      </p>
    </div>
  )
}

/**
 * Combobox for a Google Fonts family: searchable list on the left, details of the highlighted
 * family on the right (tablet and up), so weights and subsets are visible before picking.
 */
export function FontPicker({ id, value, onChange, cssVariable, fallback, detailsSide = 'right' }: {
  id?: string
  value: string
  onChange: (family: string) => void
  cssVariable?: string
  fallback: string
  /** Pickers near the right edge mirror: list aligned to the trigger's right edge, details to its left */
  detailsSide?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  // The highlighted row drives the details card; it starts on the saved family
  const [active, setActive] = useState(value)
  const activeFont = FONT_CATALOG.find(f => f.family === active)

  return (
    <Popover open={open} onOpenChange={o => { setOpen(o); if (o) setActive(value) }}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{value || 'Select a font'}</span>
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      {/* Two separate surfaces side by side: the wrapper itself has no background. Both panels share
          one height, so their tops line up and the list hugs the trigger whichever way the popover opens */}
      <PopoverContent
        align={detailsSide === 'left' ? 'end' : 'start'}
        sideOffset={6}
        className={cn(
          'w-auto items-stretch gap-2 bg-transparent p-0 shadow-none ring-0',
          detailsSide === 'left' ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        <div className="w-(--radix-popover-trigger-width) min-w-64 overflow-hidden rounded-lg bg-popover shadow-md ring-1 ring-foreground/10">
          <Command value={active} onValueChange={setActive}>
            <CommandInput placeholder="Search fonts…" />
            <CommandList>
              <CommandEmpty>No fonts found.</CommandEmpty>
              <CommandGroup>
                {FONT_CATALOG.map(f => (
                  <CommandItem
                    key={f.family}
                    value={f.family}
                    data-checked={f.family === value}
                    onSelect={() => { onChange(f.family); setOpen(false) }}
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate">{f.family}</span>
                      <span className="truncate text-xs text-muted-foreground">{summary(f)}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
        {/* Every family is rendered in the same grid cell and only the highlighted one is visible: the card
            takes the height of the longest one and does not resize (and nudge the popover) on hover.
            Transitions are off inside: Badge animates `all`, so it would fade visibility and two families overlap */}
        <div className="hidden w-80 grid-cols-1 rounded-lg bg-popover p-4 text-sm shadow-md ring-1 ring-foreground/10 tablet:grid [&_*]:transition-none">
          {FONT_CATALOG.map(f => (
            <div
              key={f.family}
              className={cn('col-start-1 row-start-1', f.family !== activeFont?.family && 'invisible')}
              aria-hidden={f.family !== activeFont?.family || undefined}
            >
              <FontDetails font={f} cssVariable={cssVariable} fallback={fallback} />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
