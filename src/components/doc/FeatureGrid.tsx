interface FeatureItem {
  icon: string
  title: string
  text: string
}

export function FeatureGrid({ items }: { items: FeatureItem[] }) {
  return (
    <div className="doc-card-grid">
      {items.map((item) => (
        <div key={item.title} className="doc-feature-card">
          <span className="doc-feature-card__icon">{item.icon}</span>
          <strong className="doc-feature-card__title">{item.title}</strong>
          <p className="doc-feature-card__text">{item.text}</p>
        </div>
      ))}
    </div>
  )
}
