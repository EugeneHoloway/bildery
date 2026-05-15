import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Scenario {
  label: string
  value: string
  sub?: string
  note: string
  highlight?: boolean
}

export function DocScenarios({ items }: { items: Scenario[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
      {items.map((s) => (
        <Card
          key={s.label}
          className={cn(
            'flex flex-col gap-1 p-4',
            s.highlight && 'border-success-border bg-success-bg',
          )}
        >
          <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
            {s.label}
          </span>
          <span className="text-2xl font-bold tracking-tight">{s.value}</span>
          {s.sub && <span className="text-xs text-muted-foreground">{s.sub}</span>}
          <p className="text-xs text-muted-foreground leading-snug mt-2">{s.note}</p>
        </Card>
      ))}
    </div>
  )
}
