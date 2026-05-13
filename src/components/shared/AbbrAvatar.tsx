import * as React from "react"
import { cn } from "@/lib/utils"

interface AbbrAvatarProps {
  abbr: string
  className?: string
}

/**
 * Квадратный аватар-заглушка с аббревиатурой.
 * Используется вместо реального изображения для слайдов, игр, провайдеров и т.п.
 */
export function AbbrAvatar({ abbr, className }: AbbrAvatarProps) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-bold tracking-wide text-foreground",
        className
      )}
    >
      {abbr}
    </div>
  )
}
