import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export interface SandboxCardData {
  id: string
  tag: string
  title: string
  description: string
  status: string
  sections: number
  href: string
}

export function SandboxCard({ card }: { card: SandboxCardData }) {
  return (
    <Link
      href={card.href}
      className={cn(
        // Layout
        'flex flex-col justify-between gap-4',
        'min-h-72 p-4 rounded-2xl',
        // Visual
        'bg-card border border-border',
        'shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
        // Interaction
        'cursor-pointer transition-[border-color,box-shadow] duration-200',
        'hover:border-subtle-border hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)]',
      )}
    >
      {/* Top */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-bold leading-[1.35] tracking-[-0.02em] text-foreground">
              {card.title}
            </h2>
            <span className="text-[0.72rem] text-muted-foreground">
              {card.sections} sections
            </span>
          </div>
          <Badge
            variant="secondary"
            className="shrink-0 text-[0.65rem] font-semibold px-2 py-0.5"
          >
            {card.tag}
          </Badge>
        </div>

        <p className="text-[0.8rem] leading-[1.55] text-muted-foreground">
          {card.description}
        </p>
      </div>

      {/* Footer */}
      <div className="-mx-4 -mb-4 flex items-center justify-between gap-3 rounded-b-2xl border-t border-border bg-subtle px-4 py-4">
        <Badge variant="outline" className="text-muted-foreground border-border bg-transparent">
          {card.status}
        </Badge>
        <span className="shrink-0 inline-flex items-center rounded-lg bg-foreground px-3 h-8 text-sm font-medium text-background">
          View details
        </span>
      </div>
    </Link>
  )
}
