'use client'
import { useEffect, useRef, useState } from 'react'
import { format, setHours, setMinutes, startOfDay } from 'date-fns'
import { CalendarClock, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  id?: string
  value: Date | null
  onChange: (value: Date | null) => void
  placeholder?: string
  /** Minutes between time options. */
  minuteStep?: number
  /** Days that cannot be picked (react-day-picker matcher). */
  disabled?: React.ComponentProps<typeof Calendar>['disabled']
  'aria-invalid'?: boolean
  className?: string
}

function timeOptions(step: number) {
  const out: { h: number; m: number; label: string }[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += step) {
      out.push({ h, m, label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` })
    }
  }
  return out
}

export function formatDateTime(d: Date) {
  return format(d, 'd MMM yyyy, HH:mm')
}

/** Single date + time of day, picked from a calendar and a time list (Popover). */
export function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = 'Pick date and time',
  minuteStep = 30,
  disabled,
  'aria-invalid': ariaInvalid,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const times = timeOptions(minuteStep)

  // Bring the selected (or a mid-day) time into view when the popover opens
  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      const target =
        listRef.current?.querySelector<HTMLElement>('[data-selected=true]') ??
        listRef.current?.querySelector<HTMLElement>('[data-time="09:00"]')
      target?.scrollIntoView({ block: 'center' })
    })
    return () => cancelAnimationFrame(frame)
  }, [open])

  function pickDay(day: Date | undefined) {
    if (!day) return
    const base = value ?? startOfDay(new Date())
    onChange(setMinutes(setHours(day, base.getHours()), base.getMinutes()))
  }

  function pickTime(h: number, m: number) {
    const base = startOfDay(value ?? new Date())
    onChange(setMinutes(setHours(base, h), m))
  }

  const selectedTime = value ? format(value, 'HH:mm') : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          aria-invalid={ariaInvalid || undefined}
          className={cn('w-56 justify-start font-normal', !value && 'text-muted-foreground', className)}
        >
          <CalendarClock className="text-muted-foreground" />
          {value ? formatDateTime(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-auto max-w-[calc(100vw-1rem)] p-0">
        <div className="flex flex-col sm:flex-row">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={pickDay}
            defaultMonth={value ?? undefined}
            disabled={disabled}
          />
          <ScrollArea className="h-40 border-t border-border sm:h-72 sm:border-t-0 sm:border-l">
            <div ref={listRef} className="flex flex-col gap-0.5 p-2">
              {times.map(t => {
                const selected = t.label === selectedTime
                return (
                  <button
                    key={t.label}
                    type="button"
                    data-time={t.label}
                    data-selected={selected || undefined}
                    onClick={() => pickTime(t.h, t.m)}
                    className={cn(
                      'flex items-center justify-between gap-4 rounded-md px-3 py-1.5 text-sm tabular-nums transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
                      selected ? 'bg-muted font-medium' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {t.label}
                    <Check className={cn('size-4', selected ? 'opacity-100' : 'opacity-0')} />
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border p-2">
          <Button variant="ghost" size="sm" onClick={() => onChange(null)} disabled={!value}>
            <X data-icon="inline-start" />
            Clear
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>Done</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
