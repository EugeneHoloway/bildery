interface AbCell {
  label: string
  pct: string
  title: string
  text: string
}

export function DocAbGrid({ cells }: { cells: AbCell[] }) {
  return (
    <div className="doc-ab-grid">
      {cells.map((cell) => (
        <div key={cell.label} className="doc-ab-cell">
          <div className="doc-ab-cell__header">
            <span className="doc-ab-cell__label">{cell.label}</span>
            <span className="doc-ab-cell__pct">{cell.pct}</span>
          </div>
          <strong className="doc-ab-cell__title">{cell.title}</strong>
          <p className="doc-ab-cell__text">{cell.text}</p>
        </div>
      ))}
    </div>
  )
}
