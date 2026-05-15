import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Risk {
  level: 'high' | 'watch' | 'low'
  badge?: string
  title: string
  text: string
}

const levelConfig: Record<
  Risk['level'],
  { label: string; containerClass: string; badgeClass: string }
> = {
  high: {
    label: 'Highest Priority',
    containerClass: 'border-destructive bg-destructive-bg',
    badgeClass: 'bg-destructive-bg text-destructive border-destructive/30',
  },
  watch: {
    label: 'Watch Closely',
    containerClass: 'border-warning-border bg-warning-bg',
    badgeClass: 'bg-warning-bg text-warning border-warning-border',
  },
  low: {
    label: 'Low',
    containerClass: 'bg-card',
    badgeClass: 'bg-muted text-muted-foreground border-border',
  },
}

export function DocRisks({ items }: { items: Risk[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((r) => {
        const cfg = levelConfig[r.level]
        return (
          <div
            key={r.title}
            className={cn('px-4 py-3.5 rounded-xl border', cfg.containerClass)}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-sm font-bold">{r.title}</span>
              <Badge
                variant="outline"
                className={cn('text-xs font-semibold pointer-events-none', cfg.badgeClass)}
              >
                {r.badge ?? cfg.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
          </div>
        )
      })}
    </div>
  )
}
