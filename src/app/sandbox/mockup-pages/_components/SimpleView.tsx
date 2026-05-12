import { InfoBox } from "@/components/shared"
import { type SitePage } from "./types"

interface SimpleViewProps {
  page: SitePage
  children?: React.ReactNode
}

export function SimpleView({ page, children }: SimpleViewProps) {
  return (
    <div className="mt-5 pl-5">
      <InfoBox>{page.info}</InfoBox>
      {children && (
        <div className="mt-4 flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  )
}
