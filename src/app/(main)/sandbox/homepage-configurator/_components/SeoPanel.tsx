"use client"

import * as React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { FieldGroup, FieldRow, LangSwitcher, PanelContent, type Lang } from "@/components/shared"

export function SeoPanel() {
  const [lang, setLang] = useState<Lang>("EN")

  return (
    <PanelContent className="max-w-2xl">
        <LangSwitcher value={lang} onChange={setLang} />

        <FieldGroup label="H1">
          <Input defaultValue="Online Casino -- Slots, Live Casino & Sports Betting" />
        </FieldGroup>
        <FieldGroup label="Meta title">
          <Input defaultValue="BetUp Casino -- Play Slots, Live Games & Win Big" />
        </FieldGroup>
        <FieldGroup label="Meta description">
          <Textarea rows={2} defaultValue="Play 3000+ slots, live casino and sports betting at BetUp. Welcome bonus 225% up to €2000." />
        </FieldGroup>

        <Separator />

        <FieldGroup label="SEO body text (HTML)">
          <Textarea rows={6} className="font-mono text-xs"
            defaultValue={"<h2>General Rules</h2>\n<p>Lorem ipsum dolor sit amet.</p>\n\n<h2>Responsible Gaming</h2>\n<p>We promote responsible gaming.</p>"} />
        </FieldGroup>

        <FieldRow>
          <FieldGroup label='"Show more" after (chars)'>
            <Input type="number" defaultValue="400" />
          </FieldGroup>
          <FieldGroup label="Collapse by default">
            <Select defaultValue="yes">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </FieldRow>
    </PanelContent>
  )
}
