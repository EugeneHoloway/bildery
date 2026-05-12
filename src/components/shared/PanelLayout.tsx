import * as React from "react"
import { cn } from "@/lib/utils"

interface PanelLayoutProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  /** Убирает фиксированную высоту и внутренний скролл — контент скроллится на уровне страницы */
  flat?: boolean
  className?: string
}

/**
 * Двухпанельный контейнер: фиксированный сайдбар слева + основная область справа.
 * Используется в Homepage Configurator, Page Manager и других tool-страницах.
 */
export function PanelLayout({ sidebar, children, flat, className }: PanelLayoutProps) {
  return (
    <div
      className={cn(
        "flex",
        !flat && "h-[calc(100vh-16rem)] min-h-[600px] overflow-hidden",
        className
      )}
    >
      {sidebar}
      <main className={cn("flex flex-1 flex-col bg-background", !flat && "overflow-hidden")}>
        {children}
      </main>
    </div>
  )
}
