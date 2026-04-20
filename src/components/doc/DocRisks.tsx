interface Risk {
  level: 'high' | 'watch' | 'low'
  title: string
  text: string
}

const levelLabel: Record<Risk['level'], string> = {
  high:  'Highest Priority',
  watch: 'Watch Closely',
  low:   'Low',
}

export function DocRisks({ items }: { items: Risk[] }) {
  return (
    <div className="doc-risks">
      {items.map((r) => (
        <div key={r.title} className={`doc-risk doc-risk--${r.level}`}>
          <div className="doc-risk__header">
            <span className={`doc-risk__badge doc-risk__badge--${r.level}`}>{levelLabel[r.level]}</span>
            <strong className="doc-risk__title">{r.title}</strong>
          </div>
          <p className="doc-risk__text">{r.text}</p>
        </div>
      ))}
    </div>
  )
}
