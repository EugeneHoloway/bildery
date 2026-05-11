import * as React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FieldGroupProps {
  label: string
  hint?: string
  children: React.ReactNode
  className?: string
}

/**
 * Стандартная обёртка для поля формы: label + опциональный hint + контент.
 * Используется везде где есть форм-поля (Select, Input, Textarea и т.д.)
 */
export function FieldGroup({ label, hint, children, className }: FieldGroupProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {hint && (
          <span className="text-xs text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
    </div>
  )
}
