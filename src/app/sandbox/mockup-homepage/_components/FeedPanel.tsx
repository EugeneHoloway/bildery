import * as React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FieldGroup, FieldRow } from "@/components/shared"

export function FeedPanel() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-5 p-6 max-w-[560px]">
        <FieldRow>
          <FieldGroup label="Default tab">
            <Select defaultValue="casino">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="casino">Casino</SelectItem>
                <SelectItem value="sport">Sport</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Rows visible">
            <Input type="number" defaultValue="10" />
          </FieldGroup>
        </FieldRow>
        <FieldGroup label="Minimum payout to show (€)" className="max-w-[180px]">
          <Input type="number" defaultValue="100" />
        </FieldGroup>
        <FieldGroup label="Mask player names">
          <Select defaultValue="partial">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="partial">Show partial (User4534***)</SelectItem>
              <SelectItem value="full">Show full username</SelectItem>
              <SelectItem value="hide">Hide completely</SelectItem>
            </SelectContent>
          </Select>
        </FieldGroup>
      </div>
    </div>
  )
}
