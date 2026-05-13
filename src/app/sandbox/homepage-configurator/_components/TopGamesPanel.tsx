"use client"

import * as React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FieldGroup, FieldRow, PanelContent } from "@/components/shared"
import { SegmentControl } from "./shared"

type SelectionMode = "auto" | "manual" | "mixed"

export function TopGamesPanel() {
  const [mode, setMode] = useState<SelectionMode>("auto")

  return (
    <PanelContent className="max-w-2xl">
        <FieldRow>
          <FieldGroup label="Section title"><Input defaultValue="Top games" /></FieldGroup>
          <FieldGroup label="Max games"><Input type="number" defaultValue="14" /></FieldGroup>
        </FieldRow>

        <FieldGroup label="Selection mode">
          <SegmentControl
            options={["auto", "manual", "mixed"] as SelectionMode[]}
            value={mode}
            onChange={setMode}
          />
        </FieldGroup>

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
    </PanelContent>
  )
}
