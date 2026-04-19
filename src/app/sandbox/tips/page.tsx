
import Link from 'next/link'

export default function TipsPage() {
  return (
    <div className="doc-page">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="doc-breadcrumb" aria-label="Breadcrumb">
          <Link href="/sandbox" className="doc-breadcrumb__link">Sandbox</Link>
          <span className="doc-breadcrumb__sep">/</span>
          <span className="doc-breadcrumb__current">Expert Rating System | PO Task</span>
        </nav>

        {/* Hero */}
        <div className="doc-hero">
          <h1 className="doc-hero__title">Expert Rating System для спортивного порталу</h1>
          <div className="doc-hero__tags">
            <span className="sandbox-card__tag">PO Test Task</span>
            <span className="sandbox-card__tag">MVP</span>
            <span className="sandbox-card__tag">Rating Algorithm</span>
          </div>
          <p className="doc-hero__description">
            Документ, на основі якого команда розробки може почати реалізацію MVP без додаткових уточнень бізнес-логіки · By Yevhenii Holovei
          </p>
        </div>

        {/* Section: Problem */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">01</span>
            <h2 className="doc-section__title">Problem</h2>
          </div>

          <div className="doc-block">
            <div className="doc-card-grid">
              <div className="doc-feature-card">
                <span className="doc-feature-card__icon">👤</span>
                <strong className="doc-feature-card__title">Проблема для користувача</strong>
                <p className="doc-feature-card__text">Підписники не можуть об'єктивно оцінити якість тіпстерів. Без єдиного рейтингу вони підписуються на популярних, а не ефективних експертів — зазнаючи збитків.</p>
              </div>
              <div className="doc-feature-card">
                <span className="doc-feature-card__icon">💼</span>
                <strong className="doc-feature-card__title">Проблема для бізнесу</strong>
                <p className="doc-feature-card__text">Без прозорої метрики якості портал не може диференціювати тіпстерів. Зростає ризик репутаційних втрат. Рекламна монетизація профілів обмежена без підтвердженої ефективності.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Scope */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">02</span>
            <h2 className="doc-section__title">Scope</h2>
          </div>

          <div className="doc-block">
            <div className="doc-card-grid">
              <div className="doc-feature-card">
                <span className="doc-feature-card__icon">✅</span>
                <strong className="doc-feature-card__title">In scope (MVP)</strong>
                <p className="doc-feature-card__text">
                  Підрахунок SCORE для кожного активного тіпстера на базі ринку 1X2 · Публічна сторінка рейтингу TOP-N · Значок на профілі: ранг, SCORE, кількість ставок, Win Rate, ROI · Щоденний перерахунок о 04:00 CET · Правила підготовки даних · Захист від маніпуляцій з логуванням
                </p>
              </div>
              <div className="doc-feature-card">
                <span className="doc-feature-card__icon">🚫</span>
                <strong className="doc-feature-card__title">Out of scope</strong>
                <p className="doc-feature-card__text">
                  Верифікація профілів · Підрейтинги по лізі та видах спорту · Алерти підписників при зміні рангу · Ручна модерація / апеляції · Рейтинг на базі реальних ставок · Поріг виключення при грубих маніпуляціях
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Algorithm */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">03</span>
            <h2 className="doc-section__title">Rating Algorithm Approach</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Порівняння підходів</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Підхід</th><th>Переваги</th><th>Недоліки</th><th>Вердикт</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Win Rate Leaderboard</strong></td>
                    <td>Простий у реалізації · Легко пояснити · Інтуїтивно зрозуміло</td>
                    <td>Малі вибірки (2/2 = 100%) · Ігнорує коефіцієнти · Стимулює ставку на фаворита</td>
                    <td><span className="doc-badge doc-badge--reject">Відхилено</span></td>
                  </tr>
                  <tr>
                    <td><strong>Bayesian ROI Score</strong></td>
                    <td>Відображає реальну цінність · Нейтралізує малі вибірки · Стійкий до маніпуляцій</td>
                    <td>Складніше пояснити · Чутливий до якості даних · Потребує тюнінгу</td>
                    <td><span className="doc-badge doc-badge--select">Обрано ✓</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="doc-callout doc-callout--primary">
              <strong>Обґрунтування:</strong> Betting-аудиторія оцінює прибутковість, а не лише частку перемог. Win Rate без урахування коефіцієнтів легко маніпулювати. Байєсівська корекція вирішує проблему малих вибірок без жорсткого cut-off порогу.
            </div>
          </div>
        </section>

        {/* Section: Algorithm Details */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">04</span>
            <h2 className="doc-section__title">Деталі алгоритму</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Win / Lose / Push</h3>
            <p className="doc-prose">Система використовує модель рівних одиничних ставок (flat betting unit model). Кожен прогноз — ставка рівно в 1 умовну одиницю.</p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead><tr><th>Результат</th><th>Формула profit_i</th></tr></thead>
                <tbody>
                  <tr><td><strong>WIN</strong></td><td><code>odds_at_publish − 1</code></td></tr>
                  <tr><td><strong>LOSE</strong></td><td><code>−1</code></td></tr>
                  <tr><td><strong>PUSH</strong></td><td><code>0</code> (займає місце в N, знижуючи ROI)</td></tr>
                </tbody>
              </table>
            </div>
            <div className="doc-formula">
              <span className="doc-formula__label">ROI_raw</span>
              <code className="doc-formula__code">ROI_raw = Σ(profit_i) / N</code>
            </div>
            <p className="doc-prose">Приклад: 2 win (+2.50, +0.80), 2 lose (−1.00, −1.00), 1 push (0.00) → Sum = +1.30, N = 5 → ROI_raw = <strong>0.26</strong></p>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Як враховуються коефіцієнти</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead><tr><th>Ставка</th><th>Odds</th><th>Outcome</th><th>Profit</th></tr></thead>
                <tbody>
                  <tr><td>A</td><td>1.2</td><td>WIN</td><td>+0.2</td></tr>
                  <tr><td>B</td><td>3.5</td><td>WIN</td><td>+2.5</td></tr>
                  <tr><td>C</td><td>5.0</td><td>LOSE</td><td>−1</td></tr>
                  <tr><td>D</td><td>1.1</td><td>LOSE</td><td>−1</td></tr>
                </tbody>
              </table>
            </div>
            <p className="doc-prose">Ставки C і D програні однаково (−1), хоча коефіцієнти кардинально різні. Експерт із 90% WR при avg_odds = 1.2 матиме низький ROI — система природно пеналізує маніпуляцію через вибір "безпечних" ставок.</p>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Мала вибірка (Байєсівська корекція)</h3>
            <div className="doc-formula">
              <span className="doc-formula__label">Формула SCORE</span>
              <code className="doc-formula__code">
                PRIOR_N = 10{'\n'}
                Confidence = N / (N + PRIOR_N){'\n'}
                SCORE = Confidence × ROI_raw
              </code>
            </div>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead><tr><th>N</th><th>Confidence</th><th>Ефект</th></tr></thead>
                <tbody>
                  <tr><td>2</td><td>2/12 = 0.17</td><td>Навіть 100% WR дає Score ≈ 0.39</td></tr>
                  <tr><td>50</td><td>50/60 = 0.83</td><td>Рейтинг майже повністю залежить від реального ROI</td></tr>
                </tbody>
              </table>
            </div>
            <div className="doc-callout doc-callout--warning">
              Поріг відображення у публічному ТОП: <strong>N ≥ MIN_BETS = 5</strong>. Профіль із N &lt; 5 відображається зі статусом "недостатньо даних" і не входить у рейтингову таблицю.
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Захист від маніпуляцій</h3>
            <div className="doc-risks">
              <div className="doc-risk doc-risk--high">
                <div className="doc-risk__header">
                  <span className="doc-risk__badge doc-risk__badge--high">Пізні ставки</span>
                  <strong className="doc-risk__title">published_at ≥ match_datetime</strong>
                </div>
                <p className="doc-risk__text">Запис відхиляється → rejection_log (reason='late_bet'). При &gt;5 відхилень за 30 днів → флаг для модератора.</p>
              </div>
              <div className="doc-risk doc-risk--watch">
                <div className="doc-risk__header">
                  <span className="doc-risk__badge doc-risk__badge--watch">Дублікати</span>
                  <strong className="doc-risk__title">Кілька прогнозів на той самий матч</strong>
                </div>
                <p className="doc-risk__text">Залишається лише перший (MIN published_at). Решта → rejection_log (reason='duplicate'). При &gt;3 за 7 днів → флаг.</p>
              </div>
              <div className="doc-risk doc-risk--low">
                <div className="doc-risk__header">
                  <span className="doc-risk__badge doc-risk__badge--low">Фаворити</span>
                  <strong className="doc-risk__title">Систематична гра на низьких коефіцієнтах</strong>
                </div>
                <p className="doc-risk__text">ROI природно пеналізує стратегію низьких коефіцієнтів. Окремий флаг у MVP не реалізовується.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Database */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">05</span>
            <h2 className="doc-section__title">База даних</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Поля таблиці expert_ratings</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead><tr><th>Поле</th><th>Тип</th><th>Приклад</th><th>Примітка</th></tr></thead>
                <tbody>
                  {[
                    ['expert_id', 'VARCHAR(50)', '"C"', 'PK'],
                    ['n_valid_bets', 'INTEGER', '9', 'Для Confidence'],
                    ['wins', 'INTEGER', '7', 'Для Win Rate на UI'],
                    ['losses', 'INTEGER', '2', 'Аудит'],
                    ['pushes', 'INTEGER', '0', 'Зарезервовано'],
                    ['sum_profit', 'DECIMAL(10,4)', '6.0400', 'Для ROI'],
                    ['roi_raw', 'DECIMAL(10,4)', '0.6711', 'Для UI та аудиту'],
                    ['score', 'DECIMAL(10,4)', '0.3179', 'Основа для сортування'],
                    ['avg_odds', 'DECIMAL(5,2)', '2.30', 'Для профілю'],
                    ['rank', 'INTEGER', '2', 'Для швидкої вибірки'],
                    ['is_qualified', 'BOOLEAN', 'TRUE', 'Фільтрація публічного ТОП'],
                    ['last_calculated_at', 'TIMESTAMP', '2026-03-20 06:00 CET', 'Актуальність'],
                  ].map(([field, type, example, note]) => (
                    <tr key={field}>
                      <td><code>{field}</code></td>
                      <td>{type}</td>
                      <td><code>{example}</code></td>
                      <td>{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="doc-callout doc-callout--primary">
              <strong>Обчислюються на льоту (не зберігаються):</strong> win_rate (wins/n_valid_bets) · confidence (n_valid_bets/(n_valid_bets+10)) · відносний приріст ROI за останні 30 днів
            </div>
          </div>
        </section>

        {/* Section: Decomposition */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">06</span>
            <h2 className="doc-section__title">Декомпозиція</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Epic: Expert Rating System</h3>
            <div className="doc-callout doc-callout--primary">
              Як маркетинговий менеджер порталу, я хочу мати прозорий рейтинг експертів на основі доведеної прибутковості, щоб підвищити довіру користувачів і стимулювати активність кваліфікованих тіпстерів.
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">User Stories</h3>
            <div className="doc-flow">
              {[
                { num: '1', title: 'Розрахунок рейтингового балу', text: 'Як система, я маю щоденно обчислювати SCORE для кожного кваліфікованого експерта, щоб рейтинг завжди відображав актуальний стан.' },
                { num: '2', title: 'Публічна сторінка рейтингу', text: 'Як відвідувач порталу, я хочу бачити топ-рейтинг кваліфікованих тіпстерів, відсортованих за SCORE, щоб обрати кращого для підписки.' },
                { num: '3', title: 'Профіль експерта з метриками', text: 'Як користувач, я хочу бачити детальну статистику (SCORE, WR, ROI, N, ранг) на профілі тіпстера, щоб оцінити його ефективність до підписки.' },
                { num: '4', title: 'Детектор маніпуляцій ★ Ready-for-Dev', text: 'Як внутрішній модератор, я хочу автоматично отримувати флаги при виявленні підозрілої активності (пізні ставки, дублікати), щоб своєчасно перевіряти маніпуляції.' },
              ].map((s) => (
                <div key={s.num} className="doc-flow__step">
                  <span className="doc-flow__num">{s.num}</span>
                  <div className="doc-flow__content">
                    <strong className="doc-flow__title">{s.title}</strong>
                    <p className="doc-flow__text">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Acceptance Criteria — Детектор маніпуляцій</h3>
            <p className="doc-block__subtitle">Given / When / Then</p>
            <div className="doc-flow">
              <div className="doc-flow__step">
                <span className="doc-flow__num">1</span>
                <div className="doc-flow__content">
                  <strong className="doc-flow__title">Виявлення пізньої ставки</strong>
                  <p className="doc-flow__text"><strong>GIVEN:</strong> Cron-задача запустила pipeline підготовки даних<br /><strong>WHEN:</strong> published_at ≥ match_datetime відповідного матчу<br /><strong>THEN:</strong> запис відхиляється → rejection_log (expert_id, prediction_id, reason='late_bet', detected_at=NOW())<br /><strong>AND:</strong> кількість late_bet флагів ≥ 5 за 30 днів → moderation_flags severity='high'</p>
                </div>
              </div>
              <div className="doc-flow__step">
                <span className="doc-flow__num">2</span>
                <div className="doc-flow__content">
                  <strong className="doc-flow__title">Виявлення дубліката</strong>
                  <p className="doc-flow__text"><strong>GIVEN:</strong> Pipeline обробляє прогноз expert_id=X, match_id=M<br /><strong>WHEN:</strong> вже є валідний прогноз з тим самим expert_id та match_id<br /><strong>THEN:</strong> новий запис відхиляється → rejection_log reason='duplicate', reference_pred_id<br /><strong>AND:</strong> кількість duplicate ≥ 3 за 7 днів → moderation_flags severity='medium'</p>
                </div>
              </div>
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Edge Cases</h3>
            <div className="doc-risks">
              {[
                { level: 'high', badge: 'EC 1', title: 'published_at = match_datetime', text: "Рівно в момент початку → відхилити (late, нестрога нерівність ≥)" },
                { level: 'watch', badge: 'EC 2', title: 'Матч скасовано після публікації', text: "event_status = 'cancelled' → rejection_log reason='event_cancelled'. Не рахувати як маніпуляцію." },
                { level: 'watch', badge: 'EC 3', title: 'Два прогноси з однаковим published_at', text: "Залишити той, що з меншим prediction_id. Обидва записати в rejection_log." },
                { level: 'low', badge: 'EC 4', title: 'match_datetime NULL або некоректна дата', text: "Відхилити обидва прогнози з reason='invalid_event_data'. Не генерувати флаг маніпуляції." },
                { level: 'high', badge: 'EC 5', title: 'Bot-like: 100 прогнозів за секунду', text: "rapid_submission_count ≥ 10 за 60 секунд → moderation_flags severity='critical'" },
              ].map((r) => (
                <div key={r.badge} className={`doc-risk doc-risk--${r.level}`}>
                  <div className="doc-risk__header">
                    <span className={`doc-risk__badge doc-risk__badge--${r.level}`}>{r.badge}</span>
                    <strong className="doc-risk__title">{r.title}</strong>
                  </div>
                  <p className="doc-risk__text">{r.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Definition of Done</h3>
            <div className="doc-flow">
              {[
                'rejection_log отримує коректний запис для кожного відхиленого прогнозу з усіх 4 кроків підготовки',
                'moderation_flags генеруються за пороговими умовами (≥5 late/30d, ≥3 dupes/7d)',
                'Unit-тести покривають усі 5 edge cases',
                'API endpoint GET /moderation/flags повертає список флагів з пагінацією',
              ].map((item, i) => (
                <div key={i} className="doc-flow__step">
                  <span className="doc-flow__num">{i + 1}</span>
                  <div className="doc-flow__content">
                    <p className="doc-flow__text">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Integration */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">07</span>
            <h2 className="doc-section__title">Інтеграція та граничні стани</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Де відображається рейтинг</h3>
            <div className="doc-flow">
              {[
                { num: '1', title: '/leaderboard', text: 'Публічна сторінка, лише is_qualified = TRUE, сортування за SCORE' },
                { num: '2', title: '/expert/{id}', text: 'Профіль: ранг, SCORE, WR, ROI, N, avg_odds, last_calculated_at' },
                { num: '3', title: 'Головна сторінка', text: 'Топ-3 блок (віджет)' },
                { num: '4', title: 'Email / Push', text: 'Нотифікація при зміні рангу на ±3+ позиції (поза MVP, зарезервовано)' },
              ].map((s) => (
                <div key={s.num} className="doc-flow__step">
                  <span className="doc-flow__num">{s.num}</span>
                  <div className="doc-flow__content">
                    <strong className="doc-flow__title">{s.title}</strong>
                    <p className="doc-flow__text">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Граничні стани</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead><tr><th>Ситуація</th><th>Поведінка системи</th></tr></thead>
                <tbody>
                  {[
                    ['New expert N=0', 'Профіль без рейтингових метрик. Плашка "Недостатньо даних (0 прогнозів)". Не входить у leaderboard.'],
                    ['N < MIN_BETS (1–4)', 'SCORE розраховується і зберігається в БД, але is_qualified = FALSE. На профілі "Йде накопичення (N з 5)".'],
                    ['Пропущене оновлення даних', 'etl_status check → якщо pipeline не завершено, пропустити перерахунок. Залишити попередній рейтинг + алерт про помилку.'],
                    ['Усі події upcoming', 'Перерахунок не змінює рейтинг. Зберігається last_calculated_at від попереднього дня.'],
                    ['Expert видалений/заблокований', 'is_qualified = FALSE; soft delete (active=FALSE). Зникає з leaderboard, рядок зберігається.'],
                  ].map(([situation, action]) => (
                    <tr key={situation}><td><strong>{situation}</strong></td><td>{action}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section: NFR */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">08</span>
            <h2 className="doc-section__title">Нефункціональні вимоги</h2>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Перформанс та обсяги</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead><tr><th>Метрика</th><th>Ціль</th></tr></thead>
                <tbody>
                  {[
                    ['GET /leaderboard', '< 200 мс при 1000 кваліфікованих експертах (Redis, TTL 1 год)'],
                    ['GET /expert/{id}', '< 100 мс (читання з БД з індексом по expert_id)'],
                    ['Batch-розрахунок 1000 експертів', '< 5 хвилин'],
                    ['Predictions на рік', '1000 тіпстерів × 365 днів × 5 прогнозів = 1.8M рядків'],
                    ['expert_ratings', '1 рядок на експерта, < 1 MB'],
                    ['rejection_log', 'До 20 рядків на прогноз ≈ 30K рядків/місяць'],
                  ].map(([metric, target]) => (
                    <tr key={metric}><td><strong>{metric}</strong></td><td>{target}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="doc-block">
            <h3 className="doc-block__title">Ризики</h3>
            <div className="doc-scenarios">
              {[
                { label: 'Medium', value: 'Затримка оновлення', sub: 'etl_status check', note: 'Fallback на попередній рейтинг' },
                { label: 'Low', value: 'Маніпуляції', sub: 'rejection_log + flags', note: 'Детектор пізніх ставок і дублікатів' },
                { label: 'High', value: 'Tuning PRIOR_N', sub: 'Параметр у БД', note: 'Зміна без деплою', highlight: true },
              ].map((s) => (
                <div key={s.value} className={`doc-scenario${s.highlight ? ' doc-scenario--highlight' : ''}`}>
                  <span className="doc-scenario__label">{s.label}</span>
                  <span className="doc-scenario__value">{s.value}</span>
                  <span className="doc-scenario__sub">{s.sub}</span>
                  <p className="doc-scenario__note">{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footnote */}
        <div className="doc-footnote">
          📋 PO Test Task — Expert Rating System · Author: Yevhenii Holovei · Scope: MVP · Bayesian ROI Score Algorithm
        </div>

      </div>
    </div>
  );
}
