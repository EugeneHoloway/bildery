import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

export type BadgeType = "auto" | "manual"

export function SectionBadge({ type }: { type: BadgeType }) {
  return (
    <Badge variant="secondary" className="shrink-0 capitalize">{type}</Badge>
  )
}

// ── SegmentControl ────────────────────────────────────────────────────────────

interface SegmentControlProps<T extends string> {
  options: T[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function SegmentControl<T extends string>({
  options, value, onChange, className,
}: SegmentControlProps<T>) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => { if (v) onChange(v as T) }}
      className={cn("w-fit gap-0 overflow-hidden rounded-lg border border-border", className)}
    >
      {options.map((option, i) => (
        <ToggleGroupItem
          key={option}
          value={option}
          className={cn(
            "h-auto rounded-none px-4 py-1.5 text-sm font-medium capitalize",
            i > 0 && "border-l border-border",
            "data-[state=on]:bg-foreground data-[state=on]:text-background",
            "data-[state=off]:bg-background data-[state=off]:text-muted-foreground",
            "hover:bg-muted hover:text-foreground data-[state=on]:hover:bg-foreground data-[state=on]:hover:text-background",
          )}
        >
          {option}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

// ── ToggleChip ────────────────────────────────────────────────────────────────

interface ToggleChipProps {
  label: string
  enabled: boolean
  onToggle: () => void
}

export function ToggleChip({ label, enabled, onToggle }: ToggleChipProps) {
  return (
    <Toggle
      pressed={enabled}
      onPressedChange={onToggle}
      className={cn(
        "h-auto rounded-full border px-3.5 py-1.5 text-sm font-medium",
        "data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background",
        "data-[state=off]:border-border data-[state=off]:bg-background data-[state=off]:text-muted-foreground",
        "hover:border-foreground/40 hover:bg-background hover:text-foreground",
        "data-[state=on]:hover:bg-foreground data-[state=on]:hover:text-background",
      )}
    >
      {label}
    </Toggle>
  )
}

