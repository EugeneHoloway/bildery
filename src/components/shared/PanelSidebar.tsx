"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ─── Секция сайдбара (заголовок группы) ──────────────────────────────────────

interface PanelSidebarSectionProps {
  label: string
  children: React.ReactNode
  /** Контент в шапке секции (например кнопка "New page") */
  headerAction?: React.ReactNode
}

export function PanelSidebarSection({
  label,
  children,
  headerAction,
}: PanelSidebarSectionProps) {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-4 pb-1 pt-2">
        <p className="text-2xs font-semibold uppercase tracking-label text-muted-foreground">
          {label}
        </p>
      </div>
      {headerAction && <div className="px-4 pb-2">{headerAction}</div>}
      {children}
    </div>
  )
}

// ─── Один nav-item в сайдбаре ─────────────────────────────────────────────────

interface PanelSidebarItemProps {
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
  /** "panel" — border-l-2 стиль (по умолчанию); "nav" — rounded bg-accent стиль (как settings sidebar) */
  variant?: "panel" | "nav"
  className?: string
}

export function PanelSidebarItem({
  isActive,
  onClick,
  children,
  variant = "panel",
  className,
}: PanelSidebarItemProps) {
  if (variant === "nav") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
          isActive
            ? "bg-accent text-foreground font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
          className
        )}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 border-l-2 px-3 py-2.5 text-left text-sm transition-colors",
        isActive
          ? "border-foreground bg-background text-foreground"
          : "border-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  )
}

// ─── Контейнер сайдбара ───────────────────────────────────────────────────────

interface PanelSidebarProps {
  width?: string
  children: React.ReactNode
  className?: string
}

/**
 * Левая панель двухпанельного layout.
 * Содержит PanelSidebarSection + PanelSidebarItem.
 */
export function PanelSidebar({
  width = "w-[220px]",
  children,
  className,
}: PanelSidebarProps) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col bg-muted/30",
        width,
        className
      )}
    >
      {children}
    </aside>
  )
}
