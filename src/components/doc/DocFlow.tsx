import { type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface FlowStep {
  num: string
  icon?: LucideIcon
  title?: string
  text: React.ReactNode
  tags?: string[]
}

export function DocFlow({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border overflow-hidden mb-6">
      {steps.map((step) => {
        const Icon = step.icon
        return (
          <div key={step.num} className="flex gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 bg-card border-b border-border last:border-b-0">
            {Icon ? (
              <div className="flex-shrink-0 size-6 rounded-full bg-muted flex items-center justify-center mt-0.5">
                <Icon className="size-3 text-muted-foreground" />
              </div>
            ) : (
              <span className="flex-shrink-0 size-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center mt-0.5">
                {step.num}
              </span>
            )}
            <div className="flex flex-col gap-1.5">
              {step.title && (
                <span className="text-sm font-bold">{step.title}</span>
              )}
              <div className="text-sm text-muted-foreground leading-relaxed">{step.text}</div>
              {step.tags && step.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {step.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
