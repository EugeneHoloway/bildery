
import Link from 'next/link'

export default function Enable3Page() {
  return (
    <div className="doc-page">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="doc-breadcrumb" aria-label="Breadcrumb">
          <Link href="/sandbox" className="doc-breadcrumb__link">Sandbox</Link>
          <span className="doc-breadcrumb__sep">/</span>
          <span className="doc-breadcrumb__current">Enable3 | Shopify Growth Loop (PM)</span>
        </nav>

        {/* Hero */}
        <div className="doc-hero">
          <h1 className="doc-hero__title">Shopify Growth Loop | Enable3</h1>
          <div className="doc-hero__tags">
            <span className="sandbox-card__status">Mission-Driven</span>
            <span className="sandbox-card__tag">Loyalty Template</span>
            <span className="sandbox-card__tag">Shopify</span>
            <span className="sandbox-card__tag">PM Test Task</span>
          </div>
          <p className="doc-hero__description">
            Mission-driven loyalty template for Shopify merchants · Replacing closed-loop points with blockchain-tokenized rewards and behavioral engagement missions · By Yevhenii Holovei
          </p>
        </div>

        {/* KPI row */}
        <div className="doc-kpi-row">
          <div className="doc-kpi">
            <span className="doc-kpi__value">72%</span>
            <span className="doc-kpi__label">First-time Buyers Lost</span>
            <span className="doc-kpi__note">never return after 1st order</span>
          </div>
          <div className="doc-kpi">
            <span className="doc-kpi__value">54%</span>
            <span className="doc-kpi__label">Probability of 3rd Purchase</span>
            <span className="doc-kpi__note">after a customer makes their 2nd</span>
          </div>
          <div className="doc-kpi">
            <span className="doc-kpi__value">21% → 44%</span>
            <span className="doc-kpi__label">Loyal Customers Drive Revenue</span>
            <span className="doc-kpi__note">21% of base generates 44% of revenue</span>
          </div>
          <div className="doc-kpi">
            <span className="doc-kpi__value">5 Segments</span>
            <span className="doc-kpi__label">Auto-RFM Engine</span>
            <span className="doc-kpi__note">zero manual merchant action required</span>
          </div>
        </div>

        {/* Section 01 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">01</span>
            <h2 className="doc-section__title">Shopify Ecosystem: Key Challenges</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Why Existing Loyalty Programs Fail</h3>
            <p className="doc-block__subtitle">Four structural problems that the Shopify App Store has not solved</p>
            <div className="doc-card-grid">
              {[
                {
                  icon: '🔒',
                  title: 'Loyalty Rewards Locked in Closed Systems',
                  text: 'Points are locked inside merchant-controlled programs and can only be used in narrowly defined reward scenarios. Customers do not truly own these rewards, which limits perceived value and weakens long-term retention.',
                },
                {
                  icon: '📉',
                  title: 'One-Time Buyers Dominate the Base',
                  text: 'Only 27–28% of Shopify customers ever make a second purchase. The 30-day post-purchase window — when propensity to return is highest — is consistently wasted: no visible goal, no mission, no reason to act.',
                },
                {
                  icon: '💸',
                  title: 'Discount Dependency Erodes Margin',
                  text: 'The most popular retention mechanic is the promo code. The structural problem: discounts train customers to wait for the next offer rather than return out of genuine preference.',
                },
                {
                  icon: '📬',
                  title: 'No Behavioral Layer',
                  text: 'A first-time buyer, a lapsed VIP, and a brand advocate all receive the same communication. Without behavioral segmentation, mass discounts become the only lever — simultaneously eroding margin and reinforcing dependency.',
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
            <h3 className="doc-block__title">The Opportunity at Scale</h3>
            <div className="doc-callout doc-callout--primary">
              <strong>The second purchase is the highest-leverage moment in the customer lifecycle.</strong>
              <p>Loyal customers are just 21% of a typical base, yet they generate 44% of revenue and 46% of orders. A customer who makes a second purchase has a <strong>54% probability of returning for a third</strong> — nearly double the 27% baseline. Most Shopify merchants have no specific mechanic designed to capture it.</p>
            </div>
          </div>
        </section>

        {/* Section 02 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">02</span>
            <h2 className="doc-section__title">Loyalty Template: Shopify Growth Loop</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Core Architecture</h3>
            <p className="doc-block__subtitle">Enable3 Features Used in the Template</p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Feature</th><th>Role in the Program</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Missions', 'Structured tasks shown to customers before they act; guide specific behaviors'],
                    ['Points and Rewards', 'Earn/burn system with merchant-controlled conversion rate; margin-safe by design'],
                    ['Web3 Tokenization', 'A more modern approach — increases ownership, perceived value, and long-term engagement'],
                    ['Tiers (Levels)', 'Bronze → Silver → Gold → Platinum with escalating privileges and multipliers'],
                    ['Behavioral Segments', 'Automatic RFM-based grouping with distinct mission feeds per segment'],
                    ['Referral Module', 'Unique links auto-generated; conversions tracked automatically; two-way rewards'],
                    ['Analytics Dashboard', 'Mission completion rates, redemption rates, segment transitions in real time'],
                  ].map(([feature, role]) => (
                    <tr key={feature}><td><strong>{feature}</strong></td><td>{role}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">What Makes This Architecturally Different</h3>
            <p className="doc-block__subtitle">Three behavioral mechanics that no closed-loop Shopify competitor replicates</p>
            <div className="doc-card-grid">
              {[
                {
                  icon: '📊',
                  title: 'Endowed Progress Effect',
                  text: 'Customers always see their current points balance and distance to the next tier. "300 points left to Silver" is a more effective return trigger than any discount code. Partial progress creates a compulsion to complete.',
                },
                {
                  icon: '🎲',
                  title: 'Variable Reward Schedule',
                  text: 'Not every mission yields the same points. Bonus multipliers, time-limited challenges, and surprise rewards sustain engagement through unpredictability — the same mechanism behind high-retention consumer apps.',
                },
                {
                  icon: '⚠️',
                  title: 'Status Loss Aversion',
                  text: 'After 90 days of inactivity, instead of an immediate downgrade, a triggered notification fires: "Your Gold status is at risk. Complete any mission to keep it." Loss aversion is a consistently stronger motivator than equivalent gain.',
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
            <h3 className="doc-block__title">How the Program Solves Merchant Problems</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Merchant Problem</th><th>Solution</th><th>Mechanic</th></tr>
                </thead>
                <tbody>
                  {[
                    ['72% of buyers never return', 'Visible missions give a reason to return without a promotion', 'Second Chance mission with countdown timer'],
                    ['Discount dependency erodes margin', 'Rewards include status and access — not just discounts', 'Experiential and Status reward tiers'],
                    ['Zero engagement between purchases', 'Non-transactional missions keep brand visible', 'Review, referral, and sharing missions'],
                    ['No customer personalization', 'Behavioral segmentation: different mission feeds per segment', 'Auto-RFM segmentation engine'],
                    ['Rising CAC, no organic growth', 'Loyalty converts into a referral acquisition channel', 'Ambassador mission track'],
                  ].map(([problem, solution, mechanic]) => (
                    <tr key={problem}><td>{problem}</td><td>{solution}</td><td>{mechanic}</td></tr>
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
            <h2 className="doc-section__title">Missions, Rewards &amp; Customer Progression</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Mission Categories</h3>
            <p className="doc-block__subtitle">Four behavioral categories — displayed to the customer before they act, not awarded silently after</p>

            <div className="doc-flow">
              {[
                {
                  num: '1',
                  title: 'Transactional Missions — stimulate purchasing behavior',
                  text: 'Second Chance (2nd purchase within 30 days, 300 pts + 1.5x multiplier), Big Basket ($100+ order, 150 pts), All-Season (3 months, 500 pts), Collector (3 categories, 250 pts), Replenishment (reorder within 60 days, 200 pts + early access).',
                  tags: ['Second Chance: highest-leverage', 'Countdown timer, no discount'],
                },
                {
                  num: '2',
                  title: 'Engagement Missions — build brand interaction between purchases',
                  text: 'Leave a Trace (product review, 100 pts), Star (photo review, 200 pts), Subscriber (email newsletter, 50 pts), Social (purchase share, 150 pts), Curious (5 products in one session, 30 pts). Generates UGC, grows email list, keeps brand visible between cycles.',
                  tags: ['Solves the silent customer problem'],
                },
                {
                  num: '3',
                  title: 'Referral Missions — convert loyalty into organic acquisition',
                  text: 'Bring a Friend (friend registers: 200 pts sender + 100 pts friend), Friend\'s First Purchase (400 pts to sender), Ambassador (3 referred friends each purchase: 1,000 pts + exclusive badge). Auto-generated unique links, conversions tracked automatically.',
                  tags: ['Zero ad spend', 'Trust signal from referrer'],
                },
                {
                  num: '4',
                  title: 'Onboarding Missions — activate new members within 7 days',
                  text: 'Welcome Aboard (register, 100 pts), Tell Us About Yourself (complete profile, 75 pts), First Step (any mission in 7 days, 150 pts). Closes the activation gap where members join but never complete a single action.',
                  tags: ['Habit formation', 'First-party data for personalization'],
                },
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
            <h3 className="doc-block__title">Reward Structure</h3>
            <p className="doc-block__subtitle">Four reward types — the balance determines whether the program builds relationships or bargain hunters</p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Type</th><th>Category</th><th>Examples</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Monetary', 'Direct financial value', 'Order discount (500 pts = $5 off), free shipping, gift card'],
                    ['Experiential', 'Access and privilege', 'Early collection access, priority support, exclusive products unavailable publicly'],
                    ['Status-based', 'Intangible but high-retention', 'Mission badges, leaderboard position, personalized tier addressing ("Gold Member")'],
                    ['Web3 Token', 'True digital ownership', 'Blockchain tokens in customer wallet; cross-merchant redemption via Enable3/Merchant partner network'],
                  ].map(([type, category, examples]) => (
                    <tr key={type}><td><strong>{type}</strong></td><td>{category}</td><td>{examples}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="doc-callout doc-callout--primary">
              <strong>Breakage advantage:</strong> Industry redemption rates average 20–30%. 70–80% of issued points are never redeemed — a dynamic that makes well-designed loyalty programs structurally more margin-friendly than flat discounts.
              <p><strong>Web3 tokenization extends this further:</strong> tokens that can appreciate in value give customers a financial incentive to hold rather than immediately redeem, deepening engagement while extending the deferred liability window for the merchant.</p>
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Tiered Progression System</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Tier</th><th>Points</th><th>Key Benefits</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Bronze', '0 – 499', 'Base point earning, access to onboarding missions'],
                    ['Silver', '500 – 1,499', '1.25x point multiplier, free shipping from $50'],
                    ['Gold', '1,500 – 3,999', '1.5x multiplier, early collection access, priority support'],
                    ['Platinum', '>4,000', '2x multiplier, exclusive products, dedicated manager, surprise gifts'],
                  ].map(([tier, points, benefits]) => (
                    <tr key={tier}><td><strong>{tier}</strong></td><td>{points}</td><td>{benefits}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Customer Lifecycle Map</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Timepoint</th><th>Event</th><th>System Action</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Day 0', 'First purchase', 'Onboarding mission sequence auto-launches'],
                    ['Days 1–7', 'Onboarding window', '3 quick missions; habit formation phase'],
                    ['Days 7–30', 'Second Chance window', 'Timer mission active; progress bar to Silver displayed'],
                    ['Days 30–90', 'Active engagement phase', 'Engagement missions unlock; bonus multipliers active'],
                    ['Day 90', 'Activity checkpoint', 'If inactive: status-risk notification triggered automatically'],
                    ['Day >120', 'Churn threshold', 'Win-back sequence: max bonus & 14-day expiring reward'],
                  ].map(([time, event, action]) => (
                    <tr key={time}><td><strong>{time}</strong></td><td>{event}</td><td>{action}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Launch Approach: Phase 1 vs Phase 2</h3>
            <p className="doc-block__subtitle">Phased rollout reduces merchant setup friction and accelerates time to first meaningful data signal</p>
            <div className="doc-ab-grid">
              {[
                {
                  label: 'Phase 1',
                  pct: 'Week 1',
                  title: 'MVP',
                  text: 'Second Chance, Leave a Trace, Welcome Aboard missions. Bronze and Silver tiers only. New & At-Risk segments. Core widget & points engine. Goal: prove repeat purchase lift within 60 days.',
                },
                {
                  label: 'Phase 2',
                  pct: 'Month 2+',
                  title: 'Full Program',
                  text: 'Full library — all 4 mission categories. Gold and Platinum tiers added. Complete 5-segment RFM model. Referral module, advanced personalization. Goal: maximize LTV across full customer base.',
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

        {/* Section 04 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">04</span>
            <h2 className="doc-section__title">Segmentation &amp; Engagement Mechanics</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Auto-RFM Segmentation</h3>
            <p className="doc-block__subtitle">Five segments — each with a distinct mission feed and trigger logic, activated without any manual merchant action</p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Segment</th><th>Trigger</th><th>Primary Mechanic</th><th>Success Metric</th></tr>
                </thead>
                <tbody>
                  {[
                    ['New', '1 purchase, joined <30 days', 'Onboarding & timer mission', '2nd purchase within 30 days'],
                    ['Promising', '2–3 purchases, moderate engagement', 'Personalized missions & multipliers', 'Purchase frequency increase'],
                    ['Loyal', '>4 purchases, Gold/Platinum', 'Referrals & VIP-only access', 'Referrals generated'],
                    ['At-Risk', '60–90 days inactive', 'Status-loss threat & points reminder', 'Reactivation rate'],
                    ['Churned', '>120 days inactive', 'One-time win-back offer (14-day expiry)', 'Win-back % or clean offboarding'],
                  ].map(([segment, trigger, mechanic, metric]) => (
                    <tr key={segment}><td><strong>{segment}</strong></td><td>{trigger}</td><td>{mechanic}</td><td>{metric}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Segment Detail: Critical Moments</h3>
            <div className="doc-risks">
              {[
                {
                  level: 'high',
                  title: 'New Customers — The Second Purchase Window',
                  text: 'Onboarding sequence auto-launches immediately after the first order. "Second Chance" mission with a visible countdown timer activates. Progress bar showing distance to Silver creates an immediate incentive. This is the single highest-leverage moment in the lifecycle.',
                },
                {
                  level: 'watch',
                  title: 'At-Risk — Status Loss Trigger',
                  text: '"Your Gold status is at risk. Come back and keep it." A single low-friction mission (product view, review) with an elevated reward reduces the return barrier. Points reminder surfaces unused balance: "You have $12 waiting — don\'t let it expire."',
                },
                {
                  level: 'low',
                  title: 'Loyal — Ambassador Track',
                  text: 'Ambassador referral track with elevated rewards. Exclusive early-access missions unavailable to lower tiers. Surprise and delight bonuses fire at irregular intervals. VIP-only missions: "Be the first to try our new product." All communications reference name and tier.',
                },
              ].map((r) => (
                <div key={r.title} className={`doc-risk doc-risk--${r.level}`}>
                  <div className="doc-risk__header">
                    <span className={`doc-risk__badge doc-risk__badge--${r.level}`}>
                      {r.level === 'high' ? 'Priority' : r.level === 'watch' ? 'Watch Closely' : 'Opportunity'}
                    </span>
                    <strong className="doc-risk__title">{r.title}</strong>
                  </div>
                  <p className="doc-risk__text">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 05 */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">05</span>
            <h2 className="doc-section__title">Value Communication &amp; Metrics</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Three Arguments for Shopify Merchants</h3>
            <p className="doc-block__subtitle">Rational + Emotional + Practical — removing all three merchant objection barriers</p>

            <div className="doc-scenarios">
              {[
                {
                  label: 'Rational',
                  value: 'Economics',
                  sub: 'Deferred cost · Breakage advantage · LTV compounding',
                  note: 'Points are future liability, not immediate cost. The merchant pays only when the customer returns and spends. Industry redemption rates of 20–30% mean 70–80% of issued points are never redeemed — structurally more margin-friendly than flat discounts.',
                },
                {
                  label: 'Emotional',
                  value: 'Identity',
                  sub: 'From expense line to revenue asset',
                  note: '"Your best customers already exist — you\'re just not activating them." Loyal customers are 21% of the base but drive 44% of revenue. The referral module converts loyalty into an acquisition channel — a direct counter to rising CPCs on Meta and Google.',
                  highlight: true,
                },
                {
                  label: 'Practical',
                  value: 'No-code',
                  sub: 'Zero setup barrier · 30 min to launch',
                  note: 'Visual dashboard: merchant selects missions from a library, sets point values, and launches — no engineering required. Shopify-ready template with all e-commerce defaults pre-configured. Engagement data visible right after launch.',
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
            <h3 className="doc-block__title">Measuring Success: B2C North Star Metrics</h3>
            <p className="doc-block__subtitle">North Star: Repeat Purchase Rate — enrolled cohort vs. pre-program baseline. Target: from 27% toward 35–40% at 6 months</p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Timeframe</th><th>Metric</th><th>Target</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Week 2–3', 'Activation rate: buyers who register in the loyalty program', '>30% of first-time buyers'],
                    ['Month 1', 'Completion rate: members who complete at least 1 mission', '>60% of registered members'],
                    ['Month 3', 'Second-purchase conversion rate', '>35% (vs. 27% baseline)'],
                    ['Month 6', 'Repeat purchase rate, enrolled cohort vs. control', '35–40% (vs. 27% baseline)'],
                  ].map(([time, metric, target]) => (
                    <tr key={time}><td><strong>{time}</strong></td><td>{metric}</td><td>{target}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Key Risks</h3>
            <div className="doc-risks">
              {[
                {
                  level: 'high',
                  title: 'Merchant Activation Gap',
                  text: 'The most common B2B SaaS failure mode: merchant installs but never launches. Fix: reduce Time to First Value to minimum. Onboarding should bring the merchant to their first customer mission completion within 48 hours. Signal metric: % of merchants who haven\'t completed setup within 7 days of install.',
                },
                {
                  level: 'watch',
                  title: 'Loyalty Programs Show Results on 60–90 Day Horizon',
                  text: 'Merchant launches, sees no results, churns. Fix: set expectations during sales and onboarding, and surface interim signals early — first mission completions, growth in registered buyer base. Health score metric: composite of widget DAU, active missions, and completion rate.',
                },
              ].map((r) => (
                <div key={r.title} className={`doc-risk doc-risk--${r.level}`}>
                  <div className="doc-risk__header">
                    <span className={`doc-risk__badge doc-risk__badge--${r.level}`}>
                      {r.level === 'high' ? 'Highest Priority' : 'Watch Closely'}
                    </span>
                    <strong className="doc-risk__title">{r.title}</strong>
                  </div>
                  <p className="doc-risk__text">{r.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Communication Channels</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Channel</th><th>Format</th><th>Core Message</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Shopify App Store', 'Listing with case studies and ROI examples', '"Launch a loyalty program in 30 minutes"'],
                    ['Content Marketing', 'Articles: "Why discounts kill your margin and what to do instead"', 'Market education via SEO'],
                    ['Email Onboarding', 'Post-install sequence with early result benchmarks', 'Step-by-step activation guide'],
                    ['Webinars', '"How Shopify merchants double repeat purchases without discounts"', 'Social proof through real merchant cases'],
                    ['Ecosystem Partnerships', 'Integrations: Klaviyo, Shopify Email, Gorgias', 'Amplified value through loyalty × CRM stack'],
                  ].map(([channel, format, message]) => (
                    <tr key={channel}><td><strong>{channel}</strong></td><td>{format}</td><td>{message}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div className="doc-footnote">
          📋 PM Test Task — Enable3 x Shopify · Author: Yevhenii Holovei · Initiative: Shopify Growth Loop · Scope: Loyalty Template, Behavioral Segmentation, Web3 Tokenization · April 2026
        </div>

      </div>
    </div>
  );
}
