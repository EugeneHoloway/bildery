interface Props {
  num: string
  title: string
  children: React.ReactNode
}

export function DocSection({ num, title, children }: Props) {
  return (
    <section className="pt-12 border-t border-border">
      <div className="flex items-baseline gap-3 mb-7">
        <span className="text-sm font-semibold tabular-nums text-muted-foreground">
          {num}.
        </span>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  )
}
