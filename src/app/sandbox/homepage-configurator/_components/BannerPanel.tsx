"use client"

import * as React from "react"
import { useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FieldGroup, FieldRow, PanelContent } from "@/components/shared"

interface Slide { id: string; abbr: string; title: string; meta: string }

const INITIAL_SLIDES: Slide[] = [
  { id: "s1", abbr: "225%", title: "Welcome bonus package", meta: "225% up to €2000 + 225 FS · Guests only · Active" },
  { id: "s2", abbr: "VIP",  title: "VIP Reload bonus",      meta: "50% up to €500 · VIP only · Scheduled Apr 5" },
  { id: "s3", abbr: "FS",   title: "Friday free spins",     meta: "50 FS on Book of Dead · All users · Active" },
]

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-muted/40 px-4 py-3">
      <p className="text-xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

export function BannerPanel() {
  const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES)

  return (
    <PanelContent className="gap-6">
        <div className="flex gap-3">
          <StatCard value="3"     label="Active slides" />
          <StatCard value="4.2s"  label="Auto-rotate" />
          <StatCard value="12.4%" label="Avg CTR" />
        </div>

        <FieldGroup label="Slides">
          <div className="mt-1 flex flex-col gap-2">
            {slides.map((slide) => (
              <div key={slide.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-bold tracking-wide text-foreground">
                  {slide.abbr}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{slide.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{slide.meta}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button variant="outline" size="sm"><Pencil className="size-3.5" />Edit</Button>
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive"
                    onClick={() => setSlides((p) => p.filter((s) => s.id !== slide.id))}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-3 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
              <Plus className="size-3.5" />Add slide
            </button>
          </div>
        </FieldGroup>

        <FieldRow>
          <FieldGroup label="Auto-rotate interval">
            <Select defaultValue="4s">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="4s">4 seconds</SelectItem>
                <SelectItem value="6s">6 seconds</SelectItem>
                <SelectItem value="off">No rotation</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Show to">
            <Select defaultValue="all">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All visitors</SelectItem>
                <SelectItem value="guests">Guests only</SelectItem>
                <SelectItem value="logged">Logged in only</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </FieldRow>
    </PanelContent>
  )
}
