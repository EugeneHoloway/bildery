"use client"

import * as React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FieldGroup, FieldRow } from "@/components/shared"
import { cn } from "@/lib/utils"

type SelectionMode = "auto" | "manual" | "mixed"

export function TopGamesPanel() {
  const [mode, setMode] = useState<SelectionMode>("auto")

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-5 p-6 max-w-[600px]">
        <FieldRow>
          <FieldGroup label="Section title"><Input defaultValue="Top games" /></FieldGroup>
          <FieldGroup label="Max games"><Input type="number" defaultValue="14" /></FieldGroup>
        </FieldRow>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Selection mode</p>
          <div className="flex w-fit overflow-hidden rounded-lg border border-border">
            {(["auto", "manual", "mixed"] as SelectionMode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                  m !== "auto" && "border-l border-border",
                  mode === m
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                )}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {mode !== "manual" && (
          <FieldGroup label="Auto rule">
            <Select defaultValue="sessions">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sessions">Most sessions — last 7 days</SelectItem>
                <SelectItem value="ggr">Highest GGR — last 24h</SelectItem>
                <SelectItem value="players">Most unique players — last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        )}

        <FieldRow>
          {mode !== "manual" && (
            <FieldGroup label="Refresh interval">
              <Select defaultValue="1h">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Every hour</SelectItem>
                  <SelectItem value="6h">Every 6 hours</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
          )}
          <FieldGroup label='Link "All Games"'><Input defaultValue="/games" /></FieldGroup>
        </FieldRow>
      </div>
    </div>
  )
}
