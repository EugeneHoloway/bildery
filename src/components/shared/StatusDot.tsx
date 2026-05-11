import * as React from "react"
import { cn } from "@/lib/utils"
import { type PageStatus } from "@/components/shared/StatusBadge"

interface StatusDotProps {
  status: PageStatus
  className?: string
}

/**
 * Маленькая цветная точка для статуса в навигации/списках.
 */
export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "size-[6px] shrink-0 rounded-full",
        status === "live"   && "bg-success",
        status === "hidden" && "bg-muted-foreground/40",
        status === "draft"  && "bg-amber-400",
        className
      )}
    />
  )
}
