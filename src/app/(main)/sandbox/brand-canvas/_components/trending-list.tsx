import { ChevronRight } from 'lucide-react'

const TRENDING_ITEMS = [
  {
    id: 1,
    title: 'Texas Republican Senate Runoff: Margin of Victory',
    subtitle: 'Ken Paxton, 20%+',
    pct: '99%',
    trend: { value: 90, up: true },
  },
  {
    id: 2,
    title: 'Fed decision in June?',
    subtitle: 'Fed maintains rate',
    pct: '96%',
    trend: null,
  },
  {
    id: 3,
    title: 'Los Angeles Mayor winner?',
    subtitle: 'Karen Bass',
    pct: '70%',
    trend: null,
  },
]

export function TrendingList() {
  return (
    <div className="flex flex-1 flex-col">
      <button className="group mb-5 mt-4 flex items-center gap-1">
        <span className="font-display text-2xl font-medium text-foreground">Trending</span>
        <ChevronRight className="size-5 text-success transition-transform duration-200 group-hover:animate-chevron-nudge" />
      </button>

      <div className="flex flex-col gap-5">
        {TRENDING_ITEMS.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <span className="mt-0.5 w-4 shrink-0 text-sm text-muted-foreground">{item.id}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-foreground">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-foreground">{item.pct}</p>
              {item.trend ? (
                <p className="text-xs font-semibold text-success">▲ {item.trend.value}</p>
              ) : (
                <p className="text-xs text-muted-foreground">––</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
