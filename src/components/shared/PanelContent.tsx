import * as React from "react"
import { cn } from "@/lib/utils"

interface PanelContentProps {
  children: React.ReactNode
  /** Дополнительные классы для внутреннего flex-контейнера (gap, max-w и т.д.) */
  className?: string
}

/**
 * Стандартная обёртка контентной панели:
 * прокручиваемая область + внутренний flex-столбец с отступами.
 */
export function PanelContent({ children, className }: PanelContentProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className={cn("flex flex-col gap-5 p-6", className)}>
        {children}
      </div>
    </div>
  )
}
