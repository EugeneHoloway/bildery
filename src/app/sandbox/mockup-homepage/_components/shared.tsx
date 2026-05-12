import * as React from "react"
import { GripVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export type BadgeType = "auto" | "manual"

export function SectionBadge({ type }: { type: BadgeType }) {
  return (
    <Badge
      className={cn(
        "shrink-0 rounded-sm px-1.5 py-px text-3xs uppercase tracking-wider border-transparent",
        type === "auto"
          ? "bg-brand-bg text-brand"
          : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
      )}
    >
      {type}
    </Badge>
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
    <div className={cn("flex w-fit overflow-hidden rounded-lg border border-border", className)}>
      {options.map((option, i) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "px-4 py-1.5 text-sm font-medium capitalize transition-colors",
            i > 0 && "border-l border-border",
            value === option
              ? "bg-foreground text-background"
              : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {option}
        </button>
      ))}
    </div>
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
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        enabled
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  )
}

// ── SortableRow ───────────────────────────────────────────────────────────────

export function SortableRow({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50">
      <GripVertical className="size-3.5 shrink-0 text-muted-foreground/40" />
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  )
}
