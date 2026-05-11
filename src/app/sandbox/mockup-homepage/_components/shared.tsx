import * as React from "react"
import { GripVertical } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export type BadgeType = "auto" | "manual"

export function SectionBadge({ type }: { type: BadgeType }) {
  return (
    <span className={cn(
      "shrink-0 rounded px-1.5 py-px text-3xs font-semibold uppercase tracking-wider",
      type === "auto"
        ? "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400"
        : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
    )}>
      {type}
    </span>
  )
}

export function SortableRow({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50">
      <GripVertical className="size-3.5 shrink-0 text-muted-foreground/40" />
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  )
}
