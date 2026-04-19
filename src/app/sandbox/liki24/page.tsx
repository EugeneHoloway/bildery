
import Link from 'next/link'

export default function Liki24Page() {
  return (
    <div className="doc-page">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="doc-breadcrumb" aria-label="Breadcrumb">
          <Link href="/sandbox" className="doc-breadcrumb__link">Sandbox</Link>
          <span className="doc-breadcrumb__sep">/</span>
          <span className="doc-breadcrumb__current">Liki24.de - Test Task (PM)</span>
        </nav>

        {/* Hero */}
        <div className="doc-hero">
          <h1 className="doc-hero__title">Autoship &amp; Save | Liki24</h1>
          <div className="doc-hero__tags">
            <span className="sandbox-card__status">ROI Positive</span>
            <span className="sandbox-card__tag">Retention Initiative</span>
            <span className="sandbox-card__tag">Web + App</span>
            <span className="sandbox-card__tag">PM Test Task</span>
          </div>
          <p className="doc-hero__description">
            Build one ROI-positive retention initiative for Liki24.de · By Yevhenii Holovei
          </p>
        </div>

        {/* KPI row */}
        <div className="doc-kpi-row">
          <div className="doc-kpi">
            <span className="doc-kpi__value">$103.89</span>
            <span className="doc-kpi__label">Incremental LTV / User</span>
            <span className="doc-kpi__note">▲ $214 → $318 total LTV</span>
          </div>
          <div className="doc-kpi">
            <span className="doc-kpi__value">~$19.8K</span>
            <span className="doc-kpi__label">Cohort Net ROI (Jan '26)</span>
            <span className="doc-kpi__note">191 subscribers × $103.89</span>
          </div>
          <div className="doc-kpi">
            <span className="doc-kpi__value">15%</span>
            <span className="doc-kpi__label">Target Activation Rate</span>
            <span className="doc-kpi__note">of eligible repurchase users</span>
          </div>
          <div className="doc-kpi">
            <span className="doc-kpi__value">10%</span>
            <span className="doc-kpi__label">Autoship Discount</span>
            <span className="doc-kpi__note">$51 AOV → $45.90 per order</span>
          </div>
        </div>

        {/* Section 01 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">01</span>
            <h2 className="doc-section__title">Why This Initiative</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Why Autoship &amp; Save</h3>
            <p className="doc-block__subtitle">Four structural advantages that make this the strongest retention lever</p>
            <div className="doc-card-grid">
              {[
                { icon: '🔒', title: 'Behavioural lock-in at the product level', text: 'Creates a predictable restocking habit tied to a specific product — not to a discount or campaign. Customers opt into a repeating behaviour. This is the strongest and most durable form of retention.' },
                { icon: '📱', title: 'Widest addressable audience — web + app', text: 'Works across both surfaces, maximising the eligible user pool from day one. Yearly Membership (mobile-only) was immediately deprioritised for this reason alone.' },
                { icon: '🎯', title: 'Self-selecting mechanic', text: 'Only products with genuine repeating demand qualify — filtered via Product repurchase % from Bestsellers data. This avoids cannibalising one-off category buyers and targets the highest-intent users.' },
                { icon: '📊', title: 'Measurable, experiment-ready, attributable', text: 'Unlike Personalised UX, every key metric — frequency delta, subscription churn, LTV uplift, cannibalization — has a clean formula and maps directly to an A/B test cell.' },
              ].map((item) => (
                <div key={item.title} className="doc-feature-card">
                  <span className="doc-feature-card__icon">{item.icon}</span>
                  <strong className="doc-feature-card__title">{item.title}</strong>
                  <p className="doc-feature-card__text">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Alternatives Considered &amp; Rejected</h3>
            <p className="doc-block__subtitle">Why the other three directions were deprioritised</p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Initiative</th><th>Decisive Weakness</th><th>Verdict</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>Yearly Membership</strong><br /><span className="doc-table__meta">7% discount · app-only</span></td><td>Mobile-only caps TAM. Annual commitment is a high entry barrier.</td><td><span className="doc-badge doc-badge--reject">Rejected</span></td></tr>
                  <tr><td><strong>Personalised UX</strong><br /><span className="doc-table__meta">Top-category experience</span></td><td>Improves experience but creates no obligation. Impact is indirect and hard to isolate.</td><td><span className="doc-badge doc-badge--reject">Rejected</span></td></tr>
                  <tr><td><strong>Smart Re-purchase Triggers</strong><br /><span className="doc-table__meta">Behavioural push/email</span></td><td>No customer commitment. Notifications decay in effectiveness over time.</td><td><span className="doc-badge doc-badge--reject">Rejected</span></td></tr>
                  <tr><td><strong>Autoship &amp; Save</strong><br /><span className="doc-table__meta">10% off · web + app</span></td><td>Cannibalization risk — manageable via A/B test with proper control group.</td><td><span className="doc-badge doc-badge--select">Selected ✓</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 02 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">02</span>
            <h2 className="doc-section__title">Target Segment</h2>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">Segment Definition: Product Repurchase ≥ 20%</h3>
            <p className="doc-block__subtitle">Why product-level repurchase rate is the right filter — not category volume</p>
            <p className="doc-prose">The Bestsellers file contains a <code>Product repurchase %</code> column — the only signal that directly measures repeat buying behaviour at the SKU level. Customers with repurchase ≥ 20% are already self-returning; Autoship formalises and accelerates that pattern.</p>
            <p className="doc-prose"><strong>Why NOT category rank alone:</strong> Antiparasitic is #1 by order volume (1,824 orders) but repurchase is only 1–7%. Offering Autoship there is a pure margin discount with zero behavioural additionality.</p>
            <p className="doc-prose"><strong>Cohort sizing — Jan 2026:</strong> 4,247 total → ~30% eligible (~1,274) → 15% activation → <strong>~191 autoship subscribers</strong></p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead><tr><th>Product</th><th>Repurchase %</th><th>Autoship Fit</th></tr></thead>
                <tbody>
                  {[
                    ['Maraton Forte', '54%', 'Strong'],
                    ['Power V8', '41%', 'Strong'],
                    ['Minus 30', '33%', 'Good'],
                    ['Magiun afrodisiac', '27%', 'Good'],
                    ['Pharmatex', '22%', 'Marginal'],
                    ['Antiparasitic category', '1–7%', 'Exclude'],
                  ].map(([product, rate, fit]) => (
                    <tr key={product}><td>{product}</td><td>{rate}</td><td>{fit}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 03 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">03</span>
            <h2 className="doc-section__title">Core Hypothesis</h2>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">LTV Uplift Hypothesis &amp; Model</h3>
            <p className="doc-block__subtitle">If users with repurchase ≥ 20% switch to Autoship at 10% off, frequency + retention gains will outweigh the discount cost</p>
            <div className="doc-formula">
              <span className="doc-formula__label">Formula</span>
              <code className="doc-formula__code">
                Incremental LTV =<br />
                {'  '}AOV × (1 − 0.10) × freq × 1.10 × retention_autoship<br />
                {'  '}− AOV × freq × retention_baseline
              </code>
            </div>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead><tr><th>Variable</th><th>Value</th><th>Basis</th></tr></thead>
                <tbody>
                  {[
                    ['AOV', '$51', 'Average across cohorts'],
                    ['freq_baseline', '1.05 /month', 'Jan 2026 cohort actuals'],
                    ['retention_baseline', '4 months', 'Historical baseline'],
                    ['retention_autoship', '6 months', 'Target (Amazon analogue)'],
                    ['Discount', '10%', 'Activation optimisation'],
                    ['Frequency uplift', '+10%', 'Monthly order rate target'],
                  ].map(([v, val, basis]) => (
                    <tr key={v}><td><code>{v}</code></td><td><strong>{val}</strong></td><td>{basis}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="doc-result">
              <span className="doc-result__label">Result — Incremental LTV per user</span>
              <span className="doc-result__value">+$103.89</span>
              <span className="doc-result__formula">= (51 × 0.90 × 1.05 × 1.10 × 6) − (51 × 1.05 × 4)</span>
              <p className="doc-result__note">LTV grows from <strong>$214 → $318</strong> per customer. The 10% discount is fully recouped through higher frequency (+10%) and extended platform life (4 → 6 months).</p>
            </div>
          </div>
        </section>

        {/* Section 04 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">04</span>
            <h2 className="doc-section__title">Success Metrics</h2>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">Northstar Metric</h3>
            <div className="doc-callout doc-callout--primary">
              <strong>Primary:</strong> LTV uplift &gt; Discount cost + Cannibalization
              <p>Measured via A/B test. Large cannibalization will destroy gross margin even if subscription LTV looks positive on paper.</p>
            </div>
            <div className="doc-callout doc-callout--warning">
              <strong>⛔ Early Stop Condition:</strong> Stop test immediately if gross margin in the test group drops &gt;3% vs baseline.
            </div>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead><tr><th>Metric</th><th>Target</th><th>What it signals</th></tr></thead>
                <tbody>
                  {[
                    ['Autoship Adoption Rate', '≥15%', 'Offer resonance'],
                    ['Autoship vs non-Autoship LTV', '+15–25% benchmark', 'Incremental value'],
                    ['Active at 1 / 3 / 6 months', 'Monitor churn curve', 'Retention quality'],
                    ['Orders/user (test vs control)', '+10% vs baseline', 'Frequency uplift'],
                    ['Cannibalization Rate', '<30%', 'Margin protection'],
                    ['Subscription Cancellation Rate', '<35–40%', 'Product-market fit'],
                  ].map(([metric, target, signal]) => (
                    <tr key={metric}><td><strong>{metric}</strong></td><td>{target}</td><td>{signal}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 05 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">05</span>
            <h2 className="doc-section__title">UX Flow &amp; Product Design</h2>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">Purchase &amp; Subscription Flow</h3>
            <p className="doc-block__subtitle">End-to-end user journey across 6 core states</p>
            <div className="doc-flow">
              {[
                { num: '1', title: 'Entry Point — Product Page', text: 'Two purchase options side-by-side: One-time ($51) and Autoship & Save 10% ($45.90). Recommended delivery interval pre-populated. Cancel / Skip anytime surfaced prominently to reduce commitment anxiety.', tags: ['Web + App', 'Frequency dropdown', 'Cancel anytime'] },
                { num: '2', title: 'Add to Cart', text: 'Cart treats Autoship as a standard line item. Savings surfaced as a concrete number: "You save $5.10 every delivery." UX principle: looks and feels like a regular purchase.', tags: [] },
                { num: '3', title: 'Checkout', text: 'Identical to standard checkout. A compact "Subscription summary" block is appended: cadence, next date, discount. No separate subscription checkout — eliminating friction is paramount.', tags: [] },
                { num: '4', title: 'Order Confirmation', text: 'Confirms both the order and subscription creation. Next delivery date surfaced immediately. CTA: "Manage subscription" — anchoring the expected next step from day zero.', tags: [] },
                { num: '5', title: 'Subscription Management', text: 'New "Subscriptions" section in account. All actions in 1–2 clicks: Skip next / Change frequency / Change quantity / Cancel. Frictionless control builds trust and reduces reactive cancellation.', tags: ['1–2 click rule', 'Full self-serve'] },
                { num: '6', title: 'Automated Delivery Cycle', text: 'Order auto-creates → charges → ships on schedule. Zero customer action required — this is the core value proposition.', tags: [] },
              ].map((step) => (
                <div key={step.num} className="doc-flow__step">
                  <span className="doc-flow__num">{step.num}</span>
                  <div className="doc-flow__content">
                    <strong className="doc-flow__title">{step.title}</strong>
                    <p className="doc-flow__text">{step.text}</p>
                    {step.tags.length > 0 && (
                      <div className="doc-flow__tags">
                        {step.tags.map((t) => <span key={t} className="sandbox-card__tag">{t}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 06 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">06</span>
            <h2 className="doc-section__title">ROI Logic</h2>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">Revenue ROI Model — Jan 2026 Cohort</h3>
            <p className="doc-block__subtitle">Bottom-up from cohort sizing to net incremental value across three activation scenarios</p>
            <div className="doc-scenarios">
              {[
                { label: 'Conservative Case', value: '~$9.9K', sub: '10% activation · 96 subscribers', note: 'Below activation target. Initiative is still ROI-positive but signals the offer needs iteration — likely on discount size, placement, or SKU selection.' },
                { label: 'Base Case', value: '~$19.8K', sub: '15% activation · 191 subscribers', note: '4,247 cohort → ~1,274 eligible (30%) → 191 subscribers. Net ROI per user $103.89 → cohort total $19,826.', highlight: true },
                { label: 'Upside Case', value: '~$33K', sub: '20% activation · 255 subscribers', note: 'Strong product-market fit. Validates scaling Autoship to a broader SKU catalogue and potentially increasing the discount in A/B iteration.' },
              ].map((s) => (
                <div key={s.label} className={`doc-scenario${s.highlight ? ' doc-scenario--highlight' : ''}`}>
                  <span className="doc-scenario__label">{s.label}</span>
                  <span className="doc-scenario__value">{s.value}</span>
                  <span className="doc-scenario__sub">{s.sub}</span>
                  <p className="doc-scenario__note">{s.note}</p>
                </div>
              ))}
            </div>
            <div className="doc-callout doc-callout--warning">
              ⚠️ All figures are Revenue LTV, not Profit LTV. Margin impact of the 10% discount and cannibalization must be modelled against actual category gross margin data before final go/no-go.
            </div>
          </div>
        </section>

        {/* Section 07 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">07</span>
            <h2 className="doc-section__title">Key Risks</h2>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">Risk Assessment</h3>
            <p className="doc-block__subtitle">Five key risks ranked by combined probability × impact — with mitigation strategies</p>
            <div className="doc-risks">
              {[
                { level: 'high', title: 'Cannibalization', text: 'Customers who would have purchased anyway receive a 10% discount — pure margin destruction. Must be isolated via A/B test with a clean control group. Treat incremental orders, not total subscriber orders, as the numerator.' },
                { level: 'watch', title: 'High Cancellation Rate', text: 'Even eligible products (repurchase 20–54%) still have 46–80% of customers who don\'t return regularly. Track cancellation rate by delivery cycle — a spike at cycle #2 signals frequency mismatch.' },
                { level: 'low', title: 'Low Activation Risk', text: '10% may be insufficient if users distrust auto-billing. Mitigate with: prominent "Cancel/Skip anytime" copy, A/B test on discount size (0% vs 5% vs 10%).' },
                { level: 'low', title: 'OOS on Delivery Day', text: 'Autoship creates predictable demand but requires predictable supply. Mitigate with proactive email 5 days before if SKU is at risk of OOS.' },
                { level: 'low', title: 'DE Regulatory', text: 'German law may restrict auto-billing for certain near-prescription categories. Mitigate with legal review before launch; start with clearly non-regulated SKUs.' },
              ].map((r) => (
                <div key={r.title} className={`doc-risk doc-risk--${r.level}`}>
                  <div className="doc-risk__header">
                    <span className={`doc-risk__badge doc-risk__badge--${r.level}`}>{r.level === 'high' ? 'Highest Priority' : r.level === 'watch' ? 'Watch Closely' : 'Low'}</span>
                    <strong className="doc-risk__title">{r.title}</strong>
                  </div>
                  <p className="doc-risk__text">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 08 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">08</span>
            <h2 className="doc-section__title">Experiment Design</h2>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">A/B Test Structure</h3>
            <p className="doc-block__subtitle">Three-cell design to isolate the mechanism effect from the discount effect · Min. 8 weeks · 2 delivery cycles</p>
            <div className="doc-ab-grid">
              {[
                { label: 'Control', pct: '34%', title: 'Standard Checkout', text: 'No Autoship option shown. Establishes the true repeat-purchase baseline without any intervention. All uplift in test cells is measured relative to this group.' },
                { label: 'Test A', pct: '33%', title: 'Autoship — 0% Discount', text: 'Autoship mechanic with no financial incentive. Tests whether convenience alone drives subscription adoption and what frequency uplift it produces.' },
                { label: 'Test B', pct: '33%', title: 'Autoship — 10% Discount', text: 'Full offer: convenience + 10% discount. Tests whether the financial incentive provides incremental activation lift above convenience alone.' },
              ].map((cell) => (
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
            <div className="doc-table-wrap">
              <table className="doc-table">
                <tbody>
                  {[
                    ['Population', 'Repeat buyers of qualifying SKUs, ≥2 orders in last 90 days'],
                    ['Randomisation unit', 'User ID — prevents cross-group contamination'],
                    ['Duration', '8 weeks minimum (covers 2 full delivery cycles)'],
                    ['Traffic split', '34% / 33% / 33%'],
                    ['Expected cohort', '~2,000–4,000 new eligible users/month'],
                    ['Significance threshold', 'p < 0.05 for primary metrics'],
                  ].map(([k, v]) => (
                    <tr key={k}><td><strong>{k}</strong></td><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div className="doc-footnote">
          📋 PM Test Task — Retention Initiative for Liki24.de · Author: Yevhenii Holovei · Initiative: Autoship &amp; Save · Scope: Web + Mobile App · Financial projections are based on provided cohort data. All LTV figures represent Revenue LTV.
        </div>

      </div>
    </div>
  );
}
