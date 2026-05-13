import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageShellProps {
  /** Путь хлебных крошек. Последний элемент — текущая страница (без href). Не передавать для верхнеуровневых страниц. */
  breadcrumbs?: BreadcrumbItem[]
  title: string
  description?: string
  /** Доп. контент справа от заголовка (кнопки, бейджи и т.д.) */
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Рендерить children вне max-w контейнера — для full-width tool страниц (Homepage configurator и т.п.) */
  fullWidthChildren?: boolean
}

/**
 * Стандартная обёртка страницы: breadcrumb + заголовок + описание + контент.
 * Используется на всех основных страницах Bildery.
 */
export function PageShell({
  breadcrumbs,
  title,
  description,
  actions,
  children,
  className,
  fullWidthChildren = false,
}: PageShellProps) {
  const header = (
    <>
      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1
            return (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="size-3.5 shrink-0" />}
                {isLast || !crumb.href ? (
                  <span className={cn(isLast ? "text-foreground" : "")}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="transition-colors hover:text-foreground">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            )
          })}
        </nav>
      )}

      {/* Header */}
      <div className={cn("mb-8", actions && "flex items-start justify-between gap-4")}>
        <div>
          <h1 className="mb-2 text-xl font-bold tracking-heading">{title}</h1>
          {description && (
            <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </>
  )

  if (fullWidthChildren) {
    return (
      <div className={cn("flex flex-col pb-20", className)}>
        <div className="px-4 pt-12">
          {header}
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className={cn("py-12 pb-20", className)}>
      <div className="mx-auto max-w-[1240px] px-4">
        {header}
        {children}
      </div>
    </div>
  )
}
