import * as React from "react"
import { cn } from "@/lib/utils"

interface CharBarProps {
  value: number
  max: number
  className?: string
}

/**
 * Прогресс-бар для SEO-полей с подсчётом символов.
 * Цвет меняется: amber (до 83% от max) → success (83–100%) → destructive (overflow).
 */
export function CharBar({ value, max, className }: CharBarProps) {
  const pct   = Math.min((value / max) * 100, 100)
  const over  = value > max
  const good  = !over && value > max * 0.83

  return (
    <div className={cn("mt-1.5 h-[3px] w-full rounded-full bg-border", className)}>
      <div
        className={cn(
          "h-[3px] rounded-full transition-all duration-150",
          over  ? "bg-destructive" :
          good  ? "bg-success"     :
                  "bg-amber-400"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
