
import Link from 'next/link'

export default function SubSubPage() {
  return (
    <div className="doc-page">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="doc-breadcrumb" aria-label="Breadcrumb">
          <Link href="/sandbox" className="doc-breadcrumb__link">Sandbox</Link>
          <span className="doc-breadcrumb__sep">/</span>
          <span className="doc-breadcrumb__current">SubSub | Growth PM Test Task</span>
        </nav>

        {/* Hero */}
        <div className="doc-hero">
          <h1 className="doc-hero__title">1000 Signups. Zero Revenue · SubSub</h1>
          <div className="doc-hero__tags">
            <span className="sandbox-card__status">Growth Plan</span>
            <span className="sandbox-card__tag">Growth PM</span>
            <span className="sandbox-card__tag">YouTube Monetization</span>
            <span className="sandbox-card__tag">PM Test Task</span>
          </div>
          <p className="doc-hero__description">
            Diagnosis and 90-day plan for SubSub — a YouTube creator monetization platform with 1,000 signups and zero paid conversions · Funnel analysis, activation gap, hypothesis prioritization, unit economics, experiment roadmap · By Yevhenii Holovei
          </p>
        </div>

        {/* KPI row */}
        <div className="doc-kpi-row">
          <div className="doc-kpi">
            <span className="doc-kpi__value">1,000</span>
            <span className="doc-kpi__label">Signups</span>
            <span className="doc-kpi__note">0 paid conversions</span>
          </div>
          <div className="doc-kpi">
            <span className="doc-kpi__value">$149/mo</span>
            <span className="doc-kpi__label">Pro Plan Price</span>
            <span className="doc-kpi__note">$0 → $149 is a cliff, not a ladder</span>
          </div>
          <div className="doc-kpi">
            <span className="doc-kpi__value">20+</span>
            <span className="doc-kpi__label">90-Day Goal</span>
            <span className="doc-kpi__note">paying customers</span>
          </div>
          <div className="doc-kpi">
            <span className="doc-kpi__value">≥2%</span>
            <span className="doc-kpi__label">Target Conversion</span>
            <span className="doc-kpi__note">free → paid</span>
          </div>
        </div>

        {/* Section 01 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">01</span>
            <h2 className="doc-section__title">Problem Framing</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">What Might Actually Be Happening</h3>
            <p className="doc-block__subtitle">1,000 signups / 0 paid conversions is not a single problem — it is a compound failure with multiple plausible root causes</p>
            <div className="doc-card-grid">
              {[
                {
                  icon: '🔀',
                  title: 'Feature Breadth Dilutes the Wedge',
                  text: 'Users sign up, trying to figure out what this product is about and how to use it, feel lost and go. No single JTBD is the clear hero. Users don\'t know what this product is for.',
                },
                {
                  icon: '🕳️',
                  title: 'Activation Gap (Most Likely)',
                  text: 'Users sign up, connect a channel, see some analytics — and never reach a moment where the paid plan becomes obviously necessary. "Aha" is unclear and probably takes too many clicks.',
                },
                {
                  icon: '💸',
                  title: 'Value / Price Mismatch at This ICP',
                  text: 'Mass-market creators with 10K–500K subs are mostly hobbyists or semi-pro. $149/month is a meaningful expense. The value has to be clearly revenue-generating, not "insight-generating".',
                },
                {
                  icon: '📦',
                  title: 'Packaging',
                  text: 'Freemium → $149 is a cliff, not a ladder. Wrong ICP signal from traffic: organic, LinkedIn etc. brings curious visitors, not necessarily creators with intent and budget.',
                },
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
            <h3 className="doc-block__title">How to Determine Which Hypothesis Is Real</h3>
            <p className="doc-block__subtitle">Triangulate with small cheap signals rather than waiting for a perfect dataset</p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Hypothesis</th><th>Cheapest Signal That Confirms / Denies</th><th>Time to Answer</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Wrong ICP', 'Cohort-slice current 1,000 signups by channel size band. Look at the retention curve per band. If 10K–50K sub creators churn out and 100K+ retain, the ICP is narrower than marketing thinks.', '1 day'],
                    ['Weak value prop', '10 × 30-min user interviews (5 active free users, 5 churned). Single question: "What did you think this product would do for you?" If answers vary wildly, value prop is unclear.', '1 week'],
                    ['Onboarding issue', 'Session replays (Hotjar / Clarity) of 50 signups. Count drop-off between "account created" and "first meaningful action". If >60% drop before first action, onboarding is the bottleneck.', '2–3 days'],
                    ['Pricing / packaging', 'Look at pricing-page exit rate and "plan clicked" rate. Run a paywall A/B test with $79 and $49 trial entry points, weekly subscription.', '2 weeks (test)'],
                    ['Product quality', 'Support tickets + NPS from 1-month active users. If quality is the problem, negative signal will show up here.', '1 day'],
                  ].map(([hyp, signal, time]) => (
                    <tr key={hyp}><td><strong>{hyp}</strong></td><td>{signal}</td><td>{time}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="doc-block">
            <div className="doc-callout doc-callout--primary">
              <strong>Working with uncertainty.</strong>
              <p>Data is partial and instrumentation is incomplete. The rule: <em>"Can I get a directional answer in under 72 hours for $0?"</em> If yes, do that first; if no, invest in instrumentation. Never block on perfect data — commit to reversible decisions based on directional signals and revise weekly.</p>
            </div>
          </div>
        </section>

        {/* Section 02 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">02</span>
            <h2 className="doc-section__title">Funnel &amp; Metrics</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Core Funnel: Signup → Payment</h3>
            <p className="doc-block__subtitle">Seven discrete steps — each with a specific "done" definition so the data team can instrument without ambiguity</p>
            <div className="doc-flow">
              {[
                { num: '1', title: 'Visit', text: 'Landing page pageview.', tags: [] },
                { num: '2', title: 'Signup', text: 'Account created and email verified.', tags: [] },
                { num: '3', title: 'Channel Connected', text: 'YouTube OAuth completed and at least one channel imported.', tags: [] },
                { num: '4', title: 'First Value Moment', text: 'User viewed an analytics report OR set up a Live schedule OR configured Fan Funding (at least one of the three hero actions).', tags: [] },
                { num: '5', title: 'Activation', text: 'User is activated when, within 7 days of signup, connects ≥1 channel AND completes at least one revenue-relevant action: schedule a recurring Live stream, configure a Fan Funding page, or export a competitor benchmark report.', tags: ['Tied to value realized, not just feature use'] },
                { num: '6', title: 'Explorer', text: 'User has hit limits of the free tier.', tags: [] },
                { num: '7', title: 'Paid Conversion', text: 'First successful charge.', tags: [] },
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

          <div className="doc-block">
            <h3 className="doc-block__title">Leading &amp; Lagging Indicators</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Type</th><th>Metric</th><th>Why It Matters</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Leading', 'Activation rate (7-day)', 'Predicts paid conversion 2–4 weeks out. If this moves, revenue will follow.'],
                    ['Leading', 'Time-to-first-value (median)', 'Onboarding health. Target: < 10 minutes end-to-end.'],
                    ['Leading', 'Qualified signup rate', '% of signups matching ICP (10K–500K, active channel, EN/UA). Filters bad traffic before it hits the funnel.'],
                    ['Lagging', 'Free → Paid conversion', 'Core growth metric.'],
                    ['Lagging', 'Net new MRR', 'Ultimate business metric. Weekly view.'],
                    ['Lagging', 'Gross / net dollar retention (90d)', 'Tells us if the value is real after the novelty wears off.'],
                  ].map(([type, metric, why]) => (
                    <tr key={metric}><td><strong>{type}</strong></td><td>{metric}</td><td>{why}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Weekly Dashboard</h3>
            <p className="doc-block__subtitle">One page, five blocks — shown to founders every Monday; PM owns the narrative next to the numbers</p>
            <div className="doc-risks">
              {[
                { level: 'high', title: 'Top-line', text: 'Signups, activations, paid, MRR, churn. WoW deltas.' },
                { level: 'high', title: 'Funnel Heatmap', text: 'Conversion rate between each of the 7 funnel steps, coloured by delta vs 4-week rolling average.' },
                { level: 'watch', title: 'Cohort Retention', text: '1/7/14/30-day retention for last 8 weekly cohorts.' },
                { level: 'watch', title: 'Experiments Ledger', text: 'Every live test — hypothesis, metric, lift, ship/no-ship decision.' },
                { level: 'low', title: 'Qualitative Pulse', text: '3 direct quotes from users this week (interview, support, churn survey). Counteracts decoration-bias in the numbers.' },
              ].map((r) => (
                <div key={r.title} className={`doc-risk doc-risk--${r.level}`}>
                  <div className="doc-risk__header">
                    <strong className="doc-risk__title">{r.title}</strong>
                  </div>
                  <p className="doc-risk__text">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 03 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">03</span>
            <h2 className="doc-section__title">Hypotheses &amp; Prioritization</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Growth Hypotheses</h3>
            <p className="doc-block__subtitle">Each hypothesis is framed as "if we do X, Y will change, because Z" — activation and monetization levers mixed on purpose, as they feed each other</p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>#</th><th>Hypothesis</th><th>Why</th><th>Impact</th><th>Effort</th><th>Validation</th></tr>
                </thead>
                <tbody>
                  {[
                    ['H5', 'Outbound to top 20 power users from free tier: "we\'ll set up Live / Fan Funding on a call — free".', 'High-touch assisted activation. Reveals whether value is real when friction = 0.', 'High (learning)', 'Low', 'Manual, 2w'],
                    ['H1', 'Narrow onboarding to ONE hero flow (e.g., Channel setup). Hide the rest until day 2.', 'Today: choice paralysis across Analytics/Live/Fan Funding. One clear path → faster TTV.', 'High', 'Low', 'A/B, 2 weeks'],
                    ['H7', 'Qualify signups with a 3-question survey; route non-ICP users to a different flow.', 'Stops wasting activation on people who will never pay. Frees us to measure real conversion.', 'Med', 'Low', '1 week'],
                    ['H3', 'Add a $49 Creator tier to break the $0→$149 cliff.', 'Price ladder lets undecided users commit. Lower-tier LTV is still profitable on a gross margin.', 'High', 'Med', 'Landing-page test → live test'],
                    ['H2', 'Introduce a 14-day paid trial of Pro features triggered on activation events (not signup).', 'Product asks for commitment AFTER value is felt, not before.', 'High', 'Med', 'A/B, 4 weeks'],
                    ['H6', 'Replace Explorer with a 14-day full trial, then downgrade to limited free.', 'Forces a payment decision at the moment of peak engagement.', 'High', 'Med', 'Live test, 3w'],
                    ['H4', 'In-product "Next step" nudges from Marketing / Founder when a user hits an activation milestone.', 'Expert/Founder brand is already a traffic source — extend it into product via 1:1 feel.', 'Med', 'Low', 'Cohort test, 2w'],
                  ].map(([num, hyp, why, impact, effort, validation]) => (
                    <tr key={num}>
                      <td><strong>{num}</strong></td>
                      <td>{hyp}</td>
                      <td>{why}</td>
                      <td>{impact}</td>
                      <td>{effort}</td>
                      <td>{validation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Priority Order for Execution</h3>
            <p className="doc-block__subtitle">Simplified ICE weighted by confidence — with 0 paid conversions, bias toward tests that teach us something even if they don't win. Effort is engineering-capped.</p>
            <div className="doc-flow">
              {[
                { num: '1', title: 'H5 — Concierge Activation', text: 'Zero engineering effort, maximum learning. Validates or kills the activation hypothesis in 2 weeks.', tags: ['Start immediately'] },
                { num: '2', title: 'H1 — Narrow Onboarding to One Hero Flow', text: 'Low eng, highest expected impact on activation rate.', tags: [] },
                { num: '3', title: 'H7 — Qualify Signups', text: 'Cheap filter, prevents ICP noise from polluting measurement.', tags: [] },
                { num: '4', title: 'H3 — Add $39 Creator Tier', text: 'Medium eng, opens a monetization path. Sequenced after we know which hero flow converts.', tags: [] },
                { num: '5', title: 'H2 / H6 — Trial Mechanics', text: 'After we know activation exists, re-architect the trial.', tags: [] },
                { num: '6', title: 'H4 — Growth Loops & Retention Nudges', text: 'Layer on top once fundamentals work. Do NOT start with "build more features" or "scale traffic".', tags: ['Last'] },
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

        {/* Section 04 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">04</span>
            <h2 className="doc-section__title">90-Day Execution Plan</h2>
          </div>

          <div className="doc-block">
            <p className="doc-block__subtitle">Each month builds on learnings from the previous one. Theme progression: Diagnose → Convert → Scale. Traffic is not scaled until the funnel produces repeatable paid conversion.</p>
          </div>

          <div className="doc-block">
            <div className="doc-scenarios">
              {[
                {
                  label: 'Month 1',
                  value: 'Diagnose',
                  sub: 'Stop the leaks · Get to 2 paying customers',
                  note: 'Week 1: Set up full funnel, pull cohort data, stand up weekly dashboard. Week 1–2: 10 user interviews (5 active, 5 churned) + session replays. Week 2–3: Concierge activation (H5) — 20 signups, offer 30-min setup call. Week 2–4: Ship H1 (narrow onboarding) and H7 (qualify signups). Week 4: Diagnosis memo + ICP definition alignment with founders.',
                },
                {
                  label: 'Month 2',
                  value: 'Convert',
                  sub: 'Install a repeatable monetization loop',
                  note: 'Week 5–6: Trial mechanic experiment (H2 or H6) — trigger paid trial on activation event. Week 6–7: 2 copy/UX iterations on pricing page; A/B test tier order, headline, social proof. Week 7–8: Ship H3 ($49 Creator tier) as pricing-page test first. Weekly: 2 user interviews, 1 experiment shipped, 1 killed.',
                  highlight: true,
                },
                {
                  label: 'Month 3',
                  value: 'Scale',
                  sub: 'Optimize the working loop · Earn the right to scale traffic',
                  note: 'Week 9–10: Identify the single highest-converting tier + flow. Kill the rest. Week 9–11: Ship H4 (founder in-product nudges) — retention lever. Week 11–12: Marketing scale-up brief with validated channels, creative angles, and segments. Week 12: Quarterly retro; build month 4–6 plan.',
                },
              ].map((s) => (
                <div key={s.label} className={`doc-scenario${s.highlight ? ' doc-scenario--highlight' : ''}`}>
                  <span className="doc-scenario__label">{s.label}</span>
                  <span className="doc-scenario__value">{s.value}</span>
                  <span className="doc-scenario__sub">{s.sub}</span>
                  <p className="doc-scenario__note">{s.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Success Criteria by Month</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Month</th><th>Success Criteria</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Month 1', 'Activation rate measured (even if low). ≥2 paying customers — even if from concierge. Validated ICP definition + documented "why users don\'t pay".'],
                    ['Month 2', 'Free→paid conversion ≥1%. ≥10 paying customers total. At least one converted without human touch — proves the loop is repeatable. Trial→paid rate baseline measured.'],
                    ['Month 3', '≥20 paying customers, free→paid ≥2%. At least one growth loop producing qualified signups for free. CAC per paying customer trending down; 30-day retention ≥80%. Monetization loop documented, not tribal.'],
                  ].map(([month, criteria]) => (
                    <tr key={month}><td><strong>{month}</strong></td><td>{criteria}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="doc-block">
            <div className="doc-callout doc-callout--primary">
              <strong>Sequencing logic:</strong>
              <p>Pouring more traffic into a broken funnel is a waste trap — do not scale until the funnel produces paid conversion by itself. Learning compounds: Month 1 gives us the ICP definition Month 2 depends on. Concierge first is cheap insurance — it validates whether the value is real before we build anything.</p>
            </div>
          </div>
        </section>

        {/* Section 05 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">05</span>
            <h2 className="doc-section__title">Monetization &amp; Unit Economics</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Minimum Retention for Viability</h3>
            <p className="doc-block__subtitle">Starting from stated assumptions: price $129/mo, blended CAC $18, infra+support $6/mo per active user</p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Metric</th><th>Value</th><th>Note</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Blended CAC per signup', '$18', 'Given'],
                    ['Target free→paid conversion', '2%', 'Our target'],
                    ['Effective CAC per paying customer', '$900', '$18 / 2%'],
                    ['Gross margin $/mo ($129 plan)', '$123', 'Price − infra'],
                    ['Payback month', '7.3 mo', '900 / 123'],
                    ['Break-even churn', '≈13.7%', '% from previous month average'],
                    ['Viable LTV/CAC >3 target', '$2,700', '3× SaaS benchmark'],
                    ['Required churn for viability', '4.5%', '123 / 2,700'],
                  ].map(([metric, value, note]) => (
                    <tr key={metric}><td><strong>{metric}</strong></td><td>{value}</td><td>{note}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">LTV Scenario Analysis</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Scenario</th><th>Churn %</th><th>Lifetime (mo)</th><th>LTV ($)</th><th>Eff CAC ($)</th><th>LTV/CAC</th><th>Payback (mo)</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Pessimistic', '18%', '5.5', '$677', '$1,200', '0.56', '9.8'],
                    ['Break-even', '13.7%', '7.3', '$898', '$900', '1.0', '7.3'],
                    ['Optimistic', '4.5%', '22', '$2,700', '$600', '4.5', '4.9'],
                  ].map(([scenario, churn, life, ltv, cac, ratio, payback]) => (
                    <tr key={scenario}>
                      <td><strong>{scenario}</strong></td>
                      <td>{churn}</td><td>{life}</td><td>{ltv}</td>
                      <td>{cac}</td><td>{ratio}</td><td>{payback}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="doc-callout doc-callout--primary">
              <strong>Honest answer:</strong> We need roughly &lt;13.7% monthly churn and &gt;7-month LTV to hit a healthy LTV/CAC at today's conversion assumptions. Always compute LTV on gross margin, not revenue. Never use blended CAC without conversion-adjusting it — Effective CAC = Blended CAC / Conversion Rate is where most early-stage models lie to themselves.
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Alternative Packaging — Would I Test It?</h3>
            <p className="doc-block__subtitle">Yes. $149 plan is probably the biggest monetization leak after activation. Proposed four-tier model:</p>
            <div className="doc-ab-grid">
              {[
                {
                  label: 'Test A',
                  pct: 'Tier ladder',
                  title: 'Creator ($39) + Pro ($79/$149)',
                  text: 'Creator tier breaks the $0→$149 cliff. Pro tier validates whether there\'s a product value for $79. First month discount at $79. Lowers entry barrier while preserving upside.',
                },
                {
                  label: 'Test B',
                  pct: 'Weekly billing',
                  title: '$39/week vs $149/month',
                  text: 'Weekly subscription A/B test. Lowers the entry barrier psychologically while keeping monthly equivalent roughly the same. Easier first commitment for a creator who is uncertain.',
                },
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
          </div>
        </section>

        {/* Section 06 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">06</span>
            <h2 className="doc-section__title">Process Thinking</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">As the Only PM: How I Organize Growth Work</h3>
            <div className="doc-risks">
              {[
                { level: 'high', title: 'One Theme / Goal per Month, Not Ten', text: 'Growth work fragments fast. One theme per month (Month 1: Diagnose; Month 2: Convert; Month 3: Optimize) — say no to everything outside it.' },
                { level: 'high', title: 'Public Experiment Ledger', text: 'Every experiment has an owner, a hypothesis, a single metric, a decision rule, and a ship date. Nothing runs longer than 2 weeks without a decision.' },
                { level: 'watch', title: 'Evidence Over Opinion', text: 'Every roadmap change must be backed by a data point OR a user interview. Founder intuition is a hypothesis, not a conclusion.' },
              ].map((r) => (
                <div key={r.title} className={`doc-risk doc-risk--${r.level}`}>
                  <div className="doc-risk__header">
                    <strong className="doc-risk__title">{r.title}</strong>
                  </div>
                  <p className="doc-risk__text">{r.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Balancing Discovery, Experiments, Delivery</h3>
            <p className="doc-block__subtitle">Rough weekly time allocation for the PM — deliberately discovery-heavy for the first 90 days. Rebalances toward delivery (~40%) once the funnel works.</p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Work Type</th><th>My Time</th><th>Examples</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Discovery (qual + quant)', '40%', 'User interviews, session replays, cohort digs, competitor teardown.'],
                    ['Experiments (design + analyze)', '35%', 'Writing test briefs, pricing experiments, A/B analysis, decision memos.'],
                    ['Delivery (ship + spec)', '20%', 'Specs for engineering, copy iterations, backlog grooming, QA.'],
                    ['Comms & alignment', '5%', 'Weekly dashboard narrative, founder update, marketing sync.'],
                  ].map(([type, time, examples]) => (
                    <tr key={type}><td><strong>{type}</strong></td><td>{time}</td><td>{examples}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Cadence</h3>
            <div className="doc-flow">
              {[
                { num: '📅', title: 'Daily', text: '15-min standup with eng and designer; PM brings blockers, they bring status.', tags: [] },
                { num: '📊', title: 'Monday', text: 'Weekly metrics review (30 min, founders in the room). Walk through the dashboard and 1 qualitative insight of the week.', tags: [] },
                { num: '🧪', title: 'Wednesday', text: 'Experiment review. What shipped, what\'s live, what\'s being designed, what got killed.', tags: [] },
                { num: '🎙️', title: 'Friday', text: '2 user interviews + synthesis. Non-negotiable; it\'s where the real signal lives.', tags: ['Non-negotiable'] },
                { num: '🗺️', title: 'Biweekly', text: 'Roadmap review with founders. Short memo, no slide deck.', tags: [] },
                { num: '📝', title: 'End of Month', text: '1-page retro: what we learned, what we\'d change, next month\'s theme.', tags: [] },
              ].map((step) => (
                <div key={step.title} className="doc-flow__step">
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

          <div className="doc-block">
            <h3 className="doc-block__title">What I Would Propose on Day 1</h3>
            <div className="doc-ab-grid">
              {[
                {
                  label: 'Process',
                  pct: 'Experiments',
                  title: 'Definition of Done for an Experiment',
                  text: 'Hypothesis + metric + decision rule written up front. No running tests indefinitely. If it doesn\'t have a decision rule, it doesn\'t run.',
                },
                {
                  label: 'Governance',
                  pct: 'Direction',
                  title: 'Founder Veto on Direction, Not on Tactics',
                  text: 'Founders set the goal; PM chooses the levers. Otherwise context-switching kills the team. Founder intuition enters the backlog as a hypothesis, not as an instruction.',
                },
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
          </div>

          <div className="doc-block">
            <div className="doc-callout doc-callout--primary">
              <strong>Closing note.</strong>
              <p>The headline of this task is "1,000 signups, zero revenue" — but the underlying problem is almost certainly that nobody reaches value. Pricing tests, traffic scaling, and new features are all valid growth levers eventually, but they are traps if run before the funnel produces a single paid conversion on its own. The 90-day plan: get to 5 paying customers, prove the conversion loop works without human touch, then hand marketing a validated acquisition brief. Everything else is a distraction until that happens.</p>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div className="doc-footnote">
          📋 Growth PM Test Task — SubSub · Author: Yevhenii Holovei · Initiative: 1000 Signups, Zero Revenue · Scope: Funnel Diagnosis, Activation Gap, Monetization Loop, Unit Economics · April 2026
        </div>

      </div>
    </div>
  );
}
