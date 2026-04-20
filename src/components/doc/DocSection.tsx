interface Props {
  num: string
  title: string
  children: React.ReactNode
}

export function DocSection({ num, title, children }: Props) {
  return (
    <section className="doc-section">
      <div className="doc-section__header">
        <span className="doc-section__num">{num}</span>
        <h2 className="doc-section__title">{title}</h2>
      </div>
      {children}
    </section>
  )
}
