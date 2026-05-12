import { InfoBox } from "@/components/shared"
import { type SitePage, type PageStatus } from "./types"

interface SimpleViewProps {
  page: SitePage
  status: PageStatus
  children?: React.ReactNode
}

export function SimpleView({ page, status, children }: SimpleViewProps) {
  return (
    <div className="mt-5 pl-5">
      <InfoBox>{page.info}</InfoBox>
    </div>
  )
}
