import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export interface SandboxCardData {
  id: string
  tag: string
  title: string
  description: string
  status: string
  platform: string
  sections: number
  href: string
}

export function SandboxCard({ card }: { card: SandboxCardData }) {
  return (
    <Link
      href={card.href}
      className={cn(
        // Layout
        'flex flex-col justify-between gap-6',
        'p-5 rounded-2xl',
        // Visual
        'bg-card border border-border',
        'shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
        // Interaction
        'cursor-pointer transition-[border-color,box-shadow] duration-200',
        'hover:border-subtle-border hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)]',
      )}
    >
      {/* Top */}
      <div className="flex flex-col gap-[10px]">
        <Badge
          variant="outline"
          className="self-start bg-brand/6 text-brand border-brand/20"
        >
          {card.tag}
        </Badge>

        <h2 className="text-base font-bold leading-[1.3] tracking-[-0.02em] text-foreground">
          {card.title}
        </h2>

        <p className="text-sm leading-[1.6] text-muted-foreground">
          {card.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge
          variant="outline"
          className="bg-success-bg text-success border-success-border"
        >
          {card.status}
        </Badge>
        <span className="text-[0.8rem] text-muted-foreground">
          {card.platform} · {card.sections} sections
        </span>
      </div>
    </Link>
  )
}
