interface Scenario {
  label: string
  value: string
  sub: string
  note: string
  highlight?: boolean
}

export function DocScenarios({ items }: { items: Scenario[] }) {
  return (
    <div className="doc-scenarios">
      {items.map((s) => (
        <div key={s.label} className={`doc-scenario${s.highlight ? ' doc-scenario--highlight' : ''}`}>
          <span className="doc-scenario__label">{s.label}</span>
          <span className="doc-scenario__value">{s.value}</span>
          <span className="doc-scenario__sub">{s.sub}</span>
          <p className="doc-scenario__note">{s.note}</p>
        </div>
      ))}
    </div>
  )
}
