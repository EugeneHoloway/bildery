'use client'

import { Flag } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// duplicate flag state: 'ok' | 'duplicate' | 'blocked'
export type DuplicateState = 'ok' | 'duplicate' | 'blocked'

export function PillToggle({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center rounded-md border h-7 px-2.5 text-[0.8rem] transition-colors ${
        selected
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-background text-foreground hover:bg-muted'
      }`}
    >
      {label}
    </button>
  )
}

export function DuplicateFlag({ state }: { state: DuplicateState }) {
  if (state === 'ok') {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground/40">
              <Flag className="size-3.5" />
              No duplicates
            </span>
          </TooltipTrigger>
          <TooltipContent>No duplicate accounts detected</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  if (state === 'duplicate') {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Flag className="size-3.5 fill-destructive text-destructive" />
              Duplicates
              <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-semibold text-foreground">6</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>This player has 6 duplicate accounts</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-destructive">
            <Flag className="size-3.5 fill-destructive" />
            Multi-account block
          </span>
        </TooltipTrigger>
        <TooltipContent>Blocked for multi-account violation</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
