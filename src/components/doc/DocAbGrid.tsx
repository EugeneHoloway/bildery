import { Card } from '@/components/ui/card'

interface AbCell {
  label: string
  pct: string
  title: string
  text: string
}

export function DocAbGrid({ cells }: { cells: AbCell[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-5">
      {cells.map((cell) => (
        <Card key={cell.label} className="flex flex-col gap-1.5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
              {cell.label}
            </span>
            <span className="text-sm font-bold text-foreground">{cell.pct}</span>
          </div>
          <span className="text-sm font-bold">{cell.title}</span>
          <p className="text-xs text-muted-foreground leading-relaxed">{cell.text}</p>
        </Card>
      ))}
    </div>
  )
}
