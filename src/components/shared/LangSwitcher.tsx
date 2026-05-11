"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type Lang = "EN" | "DE" | "UA"
export const ALL_LANGS: Lang[] = ["EN", "DE", "UA"]

interface LangSwitcherProps {
  value: Lang
  onChange: (lang: Lang) => void
  langs?: Lang[]
  className?: string
}

/**
 * Переключатель языков EN / DE / UA.
 * Используется в SEO-полях и везде, где есть мультиязычный контент.
 */
export function LangSwitcher({
  value,
  onChange,
  langs = ALL_LANGS,
  className,
}: LangSwitcherProps) {
  return (
    <div className={cn("flex gap-1.5", className)}>
      {langs.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          className={cn(
            "rounded-md border px-3 py-1 text-xs font-medium transition-colors",
            value === lang
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}
