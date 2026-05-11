import * as React from "react"
import { cn } from "@/lib/utils"

interface FieldRowProps {
  children: React.ReactNode
  className?: string
  cols?: 2 | 3
}

/**
 * Двух- или трёхколоночная сетка для полей формы.
 * На мобиле всегда одна колонка, на tablet+ — cols колонок.
 */
export function FieldRow({ children, className, cols = 2 }: FieldRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3",
        cols === 2 && "tablet:grid-cols-2",
        cols === 3 && "tablet:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  )
}
