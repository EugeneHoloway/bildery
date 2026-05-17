import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
    <div
      className={cn(
        // Layout
        'relative flex flex-col justify-between gap-4',
        'min-h-72 p-4 rounded-2xl',
        // Visual
        'bg-card border border-border',
        'shadow-sm',
        // Interaction
        'transition-[border-color,box-shadow] duration-200',
        'hover:border-subtle-border hover:shadow-md',
      )}
    >
      {/* Stretched link — makes the whole card clickable */}
      <Link
        href={card.href}
        className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`View ${card.title}`}
      />

      {/* Top */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-bold leading-snug tracking-heading text-foreground">
              {card.title}
            </h2>
            <span className="text-xs text-muted-foreground">
              {card.sections} sections
            </span>
          </div>
          <Badge
            variant="secondary"
            className="relative z-10 shrink-0"
          >
            {card.tag}
          </Badge>
        </div>

        <p className="text-sm leading-[1.55] text-muted-foreground">
          {card.description}
        </p>
      </div>

      {/* Footer */}
      <div className="-mx-4 -mb-4 flex items-center justify-between gap-3 rounded-b-2xl border-t border-border bg-subtle px-4 py-4">
        <Badge variant="outline">
          {card.status}
        </Badge>
        <Button asChild className="relative z-10">
          <Link href={card.href}>View details</Link>
        </Button>
      </div>
    </div>
  )
}
