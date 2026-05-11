import * as React from "react"
import { AlertCircle, Info, CheckCircle2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type InfoBoxVariant = "info" | "success" | "warning" | "error"

interface InfoBoxProps {
  children: React.ReactNode
  variant?: InfoBoxVariant
  className?: string
}

const VARIANT_STYLES: Record<InfoBoxVariant, string> = {
  info:    "border-border bg-muted",
  success: "border-success-border bg-success-bg",
  warning: "border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20",
  error:   "border-destructive/30 bg-destructive-bg",
}

const ICON_STYLES: Record<InfoBoxVariant, string> = {
  info:    "text-muted-foreground",
  success: "text-success",
  warning: "text-amber-500",
  error:   "text-destructive",
}

const ICONS: Record<InfoBoxVariant, React.ElementType> = {
  info:    AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  error:   AlertCircle,
}

/**
 * Информационный блок с иконкой и текстом.
 * Варианты: info (по умолчанию), success, warning, error.
 */
export function InfoBox({ children, variant = "info", className }: InfoBoxProps) {
  const Icon = ICONS[variant]

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5",
        VARIANT_STYLES[variant],
        className
      )}
    >
      <Icon className={cn("mt-0.5 size-3.5 shrink-0", ICON_STYLES[variant])} />
      <p className="text-xs leading-relaxed text-foreground">{children}</p>
    </div>
  )
}
