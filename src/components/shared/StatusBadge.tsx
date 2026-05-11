import * as React from "react"
import { cn } from "@/lib/utils"

export type PageStatus = "live" | "hidden" | "draft"

const STATUS_LABELS: Record<PageStatus, string> = {
  live:   "Live",
  hidden: "Hidden",
  draft:  "Draft",
}

interface StatusBadgeProps {
  status: PageStatus
  className?: string
}

/**
 * Бейдж статуса страницы/контента: live / hidden / draft.
 * Использует семантические токены: success-bg, muted, amber.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "live"   && "bg-success-bg text-success",
        status === "hidden" && "bg-muted text-muted-foreground",
        status === "draft"  && "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
