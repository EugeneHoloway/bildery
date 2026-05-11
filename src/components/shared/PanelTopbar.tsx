import * as React from "react"
import { cn } from "@/lib/utils"

interface PanelTopbarProps {
  /** Основной заголовок */
  title: React.ReactNode
  /** Подзаголовок или мета-информация */
  subtitle?: React.ReactNode
  /** Иконка или аватар слева от заголовка */
  icon?: React.ReactNode
  /** Кнопки и элементы справа */
  actions?: React.ReactNode
  className?: string
}

/**
 * Шапка основной панели в PanelLayout.
 * Заголовок слева + actions справа, всегда с border-b.
 */
export function PanelTopbar({
  title,
  subtitle,
  icon,
  actions,
  className,
}: PanelTopbarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-4 border-b px-6 py-4",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium leading-tight truncate">{title}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
