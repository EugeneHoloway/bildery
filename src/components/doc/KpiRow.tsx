import { Card } from '@/components/ui/card'

interface KpiItem {
  value: string
  label: string
  note: string
}

export function KpiRow({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
      {items.map((item) => (
        <Card key={item.label} className="flex flex-col gap-1 p-5">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{item.value}</span>
          <span className="text-xs font-semibold text-foreground">{item.label}</span>
          <span className="text-xs text-muted-foreground">{item.note}</span>
        </Card>
      ))}
    </div>
  )
}
