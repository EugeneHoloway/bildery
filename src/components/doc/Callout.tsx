import { Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'primary' | 'warning'
  title?: string
  children: React.ReactNode
}

export function Callout({ variant = 'primary', title, children }: Props) {
  const Icon = variant === 'warning' ? AlertTriangle : Info

  return (
    <div
      className={cn(
        'flex gap-3 items-start px-4 py-4 rounded-lg border mb-4',
        variant === 'primary' && 'border-info-border bg-info-bg',
        variant === 'warning' && 'border-warning-border bg-warning-bg',
      )}
    >
      <Icon
        className={cn(
          'size-4 shrink-0 mt-0.5',
          variant === 'primary' && 'text-info',
          variant === 'warning' && 'text-warning',
        )}
      />
      <div className="flex-1 min-w-0">
        {title && (
          <p
            className={cn(
              'text-sm font-semibold mb-1',
              variant === 'primary' && 'text-info',
              variant === 'warning' && 'text-warning',
            )}
          >
            {title}
          </p>
        )}
        <div className="text-sm leading-relaxed text-foreground">{children}</div>
      </div>
    </div>
  )
}
