import { type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface FeatureItem {
  icon: LucideIcon | string
  title: string
  text: string
}

export function FeatureGrid({ items, cols }: { items: FeatureItem[]; cols?: 2 | 3 }) {
  const colClass = (cols ?? 2) === 3
    ? 'grid-cols-1 sm:grid-cols-3'
    : 'grid-cols-1 md:grid-cols-2'
  return (
    <div className={`grid ${colClass} gap-3 mb-6`}>
      {items.map((item) => {
        const isEmoji = typeof item.icon === 'string'
        const Icon = isEmoji ? null : (item.icon as LucideIcon)
        return (
          <Card key={item.title} className="flex flex-col gap-3 p-4 min-w-0">
            <div className="size-8 rounded-xl bg-muted flex items-center justify-center">
              {isEmoji
                ? <span className="text-base leading-none">{item.icon as string}</span>
                : Icon && <Icon className="size-4 text-muted-foreground" />
              }
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold">{item.title}</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
