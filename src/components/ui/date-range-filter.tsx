'use client'

import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { subDays, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface DateRangePreset {
  label: string
  range: () => { from: Date; to: Date }
}

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  { label: 'Today',        range: () => { const d = new Date(); return { from: d, to: d } } },
  { label: 'Yesterday',    range: () => { const d = subDays(new Date(), 1); return { from: d, to: d } } },
  { label: 'This Week',    range: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 0 }), to: endOfWeek(new Date(), { weekStartsOn: 0 }) }) },
  { label: 'Last 7 Days',  range: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: 'Last 28 Days', range: () => ({ from: subDays(new Date(), 27), to: new Date() }) },
  { label: 'This Month',   range: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: 'Last Month',   range: () => { const d = subMonths(new Date(), 1); return { from: startOfMonth(d), to: endOfMonth(d) } } },
  { label: 'This Year',    range: () => ({ from: startOfYear(new Date()), to: new Date() }) },
]

function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function sameRange(a: DateRange | undefined, b: { from: Date; to: Date }) {
  return !!a?.from && !!a?.to &&
    a.from.toDateString() === b.from.toDateString() &&
    a.to.toDateString() === b.to.toDateString()
}

interface DateRangeFilterProps {
  /** Controlled value; pair with onChange. Omit both for uncontrolled mode. */
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  /** Uncontrolled mode: label of the preset to start with (e.g. 'Last 28 Days'). */
  defaultPreset?: string
  presets?: DateRangePreset[]
  placeholder?: string
  size?: 'default' | 'sm'
  /** What the trigger shows below the sm breakpoint: the full range, the active preset name, or icon only. */
  mobileLabel?: 'full' | 'preset' | 'none'
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function DateRangeFilter({
  value,
  onChange,
  defaultPreset,
  presets = DATE_RANGE_PRESETS,
  placeholder = 'Date',
  size = 'sm',
  mobileLabel = 'full',
  align = 'end',
  className,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false)
  const [internal, setInternal] = useState<DateRange | undefined>(
    () => presets.find(p => p.label === defaultPreset)?.range()
  )
  const range = onChange ? value : internal
  const setRange: (r: DateRange | undefined) => void = onChange ?? setInternal

  const label = range?.from && range?.to
    ? `${formatDate(range.from)} - ${formatDate(range.to)}`
    : range?.from ? formatDate(range.from) : placeholder

  const activePreset = presets.find(p => sameRange(range, p.range()))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={cn('gap-2', size === 'default' && 'text-sm font-normal', className)}
        >
          <CalendarDays className={cn('shrink-0', size === 'sm' ? 'size-3.5' : 'size-4 text-muted-foreground')} />
          {mobileLabel === 'preset' && <span className="sm:hidden">{activePreset?.label ?? label}</span>}
          <span className={mobileLabel === 'full' ? 'inline' : 'hidden sm:inline'}>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} sideOffset={6} className="w-auto max-w-[calc(100vw-1rem)] p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-row flex-wrap gap-0.5 border-b border-border p-2 sm:min-w-[130px] sm:flex-col sm:border-b-0 sm:border-r sm:px-2 sm:py-3">
            {presets.map(p => {
              const active = sameRange(range, p.range())
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setRange(p.range())}
                  className={cn(
                    'text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                    active ? 'bg-muted font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            defaultMonth={range?.from}
            numberOfMonths={1}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
