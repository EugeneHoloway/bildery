interface KpiItem {
  value: string
  label: string
  note: string
}

export function KpiRow({ items }: { items: KpiItem[] }) {
  return (
    <div className="doc-kpi-row">
      {items.map((item) => (
        <div key={item.label} className="doc-kpi">
          <span className="doc-kpi__value">{item.value}</span>
          <span className="doc-kpi__label">{item.label}</span>
          <span className="doc-kpi__note">{item.note}</span>
        </div>
      ))}
    </div>
  )
}
