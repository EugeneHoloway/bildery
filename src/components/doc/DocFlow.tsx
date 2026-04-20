interface FlowStep {
  num: string
  title?: string
  text: string
  tags?: string[]
}

export function DocFlow({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="doc-flow">
      {steps.map((step) => (
        <div key={step.num} className="doc-flow__step">
          <span className="doc-flow__num">{step.num}</span>
          <div className="doc-flow__content">
            {step.title && <strong className="doc-flow__title">{step.title}</strong>}
            <p className="doc-flow__text">{step.text}</p>
            {step.tags && step.tags.length > 0 && (
              <div className="doc-flow__tags">
                {step.tags.map((t) => (
                  <span key={t} className="sandbox-card__tag">{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
