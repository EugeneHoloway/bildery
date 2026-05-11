import * as React from "react"
import { cn } from "@/lib/utils"

interface PanelLayoutProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  className?: string
}

/**
 * Двухпанельный контейнер: фиксированный сайдбар слева + основная область справа.
 * Используется в Homepage Configurator, Page Manager и других tool-страницах.
 */
export function PanelLayout({ sidebar, children, className }: PanelLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-[calc(100vh-16rem)] min-h-[600px] overflow-hidden rounded-xl border border-border",
        className
      )}
    >
      {sidebar}
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        {children}
      </main>
    </div>
  )
}
