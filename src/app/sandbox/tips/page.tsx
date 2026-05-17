'use client'

import { useState } from 'react'
import { DocLayout }    from '@/components/doc/DocLayout'
import { DocSection }   from '@/components/doc/DocSection'
import { DocBlock }     from '@/components/doc/DocBlock'
import { FeatureGrid }  from '@/components/doc/FeatureGrid'
import { Callout }      from '@/components/doc/Callout'
import { DocFlow }      from '@/components/doc/DocFlow'
import { DocScenarios } from '@/components/doc/DocScenarios'
import { DocRisks }     from '@/components/doc/DocRisks'
import { DocTable, DocTableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/doc/DocTable'
import { DocFormula }   from '@/components/doc/DocFormula'
import { Badge }        from '@/components/ui/badge'
import { User, Briefcase, CircleCheck, CircleX } from 'lucide-react'

type Lang = 'ua' | 'en'

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5">
      {(['en', 'ua'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={[
            'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
            lang === l
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  return (
    <DocLayout
      title="Expert Rating System | PO Task"
      breadcrumbLabel="Sandbox"
      breadcrumbHref="/sandbox"
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      tags={[
        { label: 'PO Test Task',     type: 'tag' },
        { label: 'MVP',              type: 'tag' },
        { label: 'Rating Algorithm', type: 'tag' },
      ]}
      description={ua
        ? "Документ, на основі якого команда розробки може почати реалізацію MVP без додаткових уточнень бізнес-логіки | By Yevhenii Holovei"
        : "A document enabling the development team to begin MVP implementation without additional business logic clarifications | By Yevhenii Holovei"
      }
      footnote={ua
        ? "PO Test Task -- Expert Rating System | Author: Yevhenii Holovei | Scope: MVP | Bayesian ROI Score Algorithm"
        : "PO Test Task -- Expert Rating System | Author: Yevhenii Holovei | Scope: MVP | Bayesian ROI Score Algorithm"
      }
    >

      {/* 01 — Problem */}
      <DocSection num="01" title={ua ? 'Problem' : 'Problem'}>
        <DocBlock>
          <FeatureGrid items={[
            {
              icon: User,
              title: ua ? 'Проблема для користувача' : 'User Problem',
              text: ua
                ? "Підписники не можуть об'єктивно оцінити якість тіпстерів. Без єдиного рейтингу вони підписуються на популярних, а не ефективних експертів -- зазнаючи збитків."
                : "Subscribers cannot objectively evaluate tipster quality. Without a unified rating, they follow popular rather than effective experts -- and lose money.",
            },
            {
              icon: Briefcase,
              title: ua ? 'Проблема для бізнесу' : 'Business Problem',
              text: ua
                ? 'Без прозорої метрики якості портал не може диференціювати тіпстерів. Зростає ризик репутаційних втрат. Рекламна монетизація профілів обмежена без підтвердженої ефективності.'
                : 'Without a transparent quality metric the portal cannot differentiate tipsters. Reputational risk grows. Advertising monetization of profiles is limited without proven effectiveness.',
            },
          ]} />
        </DocBlock>
      </DocSection>

      {/* 02 — Scope */}
      <DocSection num="02" title="Scope">
        <DocBlock>
          <FeatureGrid items={[
            {
              icon: CircleCheck,
              title: ua ? 'In scope (MVP)' : 'In scope (MVP)',
              text: ua
                ? 'Підрахунок SCORE для кожного активного тіпстера на базі ринку 1X2 | Публічна сторінка рейтингу TOP-N | Значок на профілі: ранг, SCORE, кількість ставок, Win Rate, ROI | Щоденний перерахунок о 04:00 CET | Правила підготовки даних | Захист від маніпуляцій з логуванням'
                : 'SCORE calculation for each active tipster based on 1X2 market | Public TOP-N leaderboard page | Profile badge: rank, SCORE, bet count, Win Rate, ROI | Daily recalculation at 04:00 CET | Data preparation rules | Anti-manipulation protection with logging',
            },
            {
              icon: CircleX,
              title: ua ? 'Out of scope' : 'Out of scope',
              text: ua
                ? 'Верифікація профілів | Підрейтинги по лізі та видах спорту | Алерти підписників при зміні рангу | Ручна модерація / апеляції | Рейтинг на базі реальних ставок | Поріг виключення при грубих маніпуляціях'
                : 'Profile verification | Sub-ratings by league and sport | Subscriber alerts on rank changes | Manual moderation / appeals | Rating based on real-money bets | Exclusion threshold for gross manipulation',
            },
          ]} />
        </DocBlock>
      </DocSection>

      {/* 03 — Algorithm Approach */}
      <DocSection num="03" title={ua ? 'Rating Algorithm Approach' : 'Rating Algorithm Approach'}>
        <DocBlock title={ua ? 'Порівняння підходів' : 'Approach Comparison'}>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Підхід' : 'Approach'}</TableHead>
                <TableHead>{ua ? 'Переваги' : 'Pros'}</TableHead>
                <TableHead>{ua ? 'Недоліки' : 'Cons'}</TableHead>
                <TableHead>{ua ? 'Вердикт' : 'Verdict'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow>
                <TableCell><strong>Win Rate Leaderboard</strong></TableCell>
                <TableCell>
                  {ua
                    ? 'Простий у реалізації | Легко пояснити | Інтуїтивно зрозуміло'
                    : 'Simple to implement | Easy to explain | Intuitive'}
                </TableCell>
                <TableCell>
                  {ua
                    ? 'Малі вибірки (2/2 = 100%) | Ігнорує коефіцієнти | Стимулює ставку на фаворита'
                    : 'Small samples (2/2 = 100%) | Ignores odds | Incentivizes favorites'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-destructive-bg text-destructive border-destructive/30 text-xs pointer-events-none">
                    {ua ? 'Відхилено' : 'Rejected'}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Bayesian ROI Score</strong></TableCell>
                <TableCell>
                  {ua
                    ? 'Відображає реальну цінність | Нейтралізує малі вибірки | Стійкий до маніпуляцій'
                    : 'Reflects real value | Neutralizes small samples | Manipulation-resistant'}
                </TableCell>
                <TableCell>
                  {ua
                    ? 'Складніше пояснити | Чутливий до якості даних | Потребує тюнінгу'
                    : 'Harder to explain | Sensitive to data quality | Requires tuning'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-success-bg text-success border-success-border text-xs pointer-events-none">
                    {ua ? 'Обрано' : 'Selected'}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </DocTable>
          <Callout variant="primary" title={ua ? 'Обґрунтування' : 'Rationale'}>
            {ua
              ? 'Betting-аудиторія оцінює прибутковість, а не лише частку перемог. Win Rate без урахування коефіцієнтів легко маніпулювати. Байєсівська корекція вирішує проблему малих вибірок без жорсткого cut-off порогу.'
              : 'Betting audiences care about profitability, not just win share. Win Rate without odds is easy to manipulate. Bayesian correction solves the small-sample problem without a hard cut-off threshold.'}
          </Callout>
        </DocBlock>
      </DocSection>

      {/* 04 — Algorithm Details */}
      <DocSection num="04" title={ua ? 'Деталі алгоритму' : 'Algorithm Details'}>

        <DocBlock title={ua ? 'Win / Lose / Push' : 'Win / Lose / Push'}>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {ua
              ? 'Система використовує модель рівних одиничних ставок (flat betting unit model). Кожен прогноз -- ставка рівно в 1 умовну одиницю.'
              : 'The system uses a flat betting unit model. Each prediction is treated as exactly 1 unit staked.'}
          </p>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Результат' : 'Outcome'}</TableHead>
                <TableHead>profit_i</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow>
                <TableCell><strong>WIN</strong></TableCell>
                <TableCell><code>odds_at_publish − 1</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>LOSE</strong></TableCell>
                <TableCell><code>−1</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>PUSH</strong></TableCell>
                <TableCell>
                  <code>0</code>{' '}
                  {ua ? '(займає місце в N, знижуючи ROI)' : '(counts toward N, lowering ROI)'}
                </TableCell>
              </TableRow>
            </TableBody>
          </DocTable>
          <DocFormula label="ROI_raw" code="ROI_raw = Σ(profit_i) / N" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {ua
              ? 'Приклад: 2 win (+2.50, +0.80), 2 lose (−1.00, −1.00), 1 push (0.00) → Sum = +1.30, N = 5 → ROI_raw = 0.26'
              : 'Example: 2 win (+2.50, +0.80), 2 lose (−1.00, −1.00), 1 push (0.00) → Sum = +1.30, N = 5 → ROI_raw = 0.26'}
          </p>
        </DocBlock>

        <DocBlock title={ua ? 'Як враховуються коефіцієнти' : 'How Odds Are Factored In'}>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Ставка' : 'Bet'}</TableHead>
                <TableHead>Odds</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Profit</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow><TableCell>A</TableCell><TableCell>1.2</TableCell><TableCell>WIN</TableCell><TableCell>+0.2</TableCell></TableRow>
              <TableRow><TableCell>B</TableCell><TableCell>3.5</TableCell><TableCell>WIN</TableCell><TableCell>+2.5</TableCell></TableRow>
              <TableRow><TableCell>C</TableCell><TableCell>5.0</TableCell><TableCell>LOSE</TableCell><TableCell>−1</TableCell></TableRow>
              <TableRow><TableCell>D</TableCell><TableCell>1.1</TableCell><TableCell>LOSE</TableCell><TableCell>−1</TableCell></TableRow>
            </TableBody>
          </DocTable>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            {ua
              ? 'Ставки C і D програні однаково (−1), хоча коефіцієнти кардинально різні. Експерт із 90% WR при avg_odds = 1.2 матиме низький ROI -- система природно пеналізує маніпуляцію через вибір "безпечних" ставок.'
              : 'Bets C and D each lose exactly −1 despite vastly different odds. An expert with 90% WR at avg_odds = 1.2 will have a low ROI -- the system naturally penalizes manipulation via "safe" bet selection.'}
          </p>
        </DocBlock>

        <DocBlock title={ua ? 'Мала вибірка (Байєсівська корекція)' : 'Small Sample (Bayesian Correction)'}>
          <DocFormula
            label={ua ? 'Формула SCORE' : 'SCORE Formula'}
            code={`PRIOR_N = 10
Confidence = N / (N + PRIOR_N)
SCORE = Confidence × ROI_raw`}
          />
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>N</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>{ua ? 'Ефект' : 'Effect'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>2/12 = 0.17</TableCell>
                <TableCell>{ua ? 'Навіть 100% WR дає Score ≈ 0.39' : 'Even 100% WR yields Score ≈ 0.39'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>50</TableCell>
                <TableCell>50/60 = 0.83</TableCell>
                <TableCell>{ua ? 'Рейтинг майже повністю залежить від реального ROI' : 'Rating almost entirely reflects actual ROI'}</TableCell>
              </TableRow>
            </TableBody>
          </DocTable>
          <Callout variant="warning">
            {ua
              ? <>Поріг відображення у публічному ТОП: <strong>N ≥ MIN_BETS = 5</strong>. Профіль із N &lt; 5 відображається зі статусом "недостатньо даних" і не входить у рейтингову таблицю.</>
              : <>Public leaderboard display threshold: <strong>N ≥ MIN_BETS = 5</strong>. Profiles with N &lt; 5 show "insufficient data" status and are excluded from the rankings table.</>}
          </Callout>
        </DocBlock>

        <DocBlock title={ua ? 'Захист від маніпуляцій' : 'Anti-Manipulation Measures'}>
          <DocRisks items={[
            {
              level: 'high',
              badge: ua ? 'Пізні ставки' : 'Late Bets',
              title: 'published_at ≥ match_datetime',
              text: ua
                ? "Запис відхиляється → rejection_log (reason='late_bet'). При >5 відхилень за 30 днів → флаг для модератора."
                : "Record rejected → rejection_log (reason='late_bet'). >5 rejections within 30 days → moderator flag.",
            },
            {
              level: 'watch',
              badge: ua ? 'Дублікати' : 'Duplicates',
              title: ua ? 'Кілька прогнозів на той самий матч' : 'Multiple predictions for the same match',
              text: ua
                ? "Залишається лише перший (MIN published_at). Решта → rejection_log (reason='duplicate'). При >3 за 7 днів → флаг."
                : "Only the first is kept (MIN published_at). Others → rejection_log (reason='duplicate'). >3 in 7 days → flag.",
            },
            {
              level: 'low',
              badge: ua ? 'Фаворити' : 'Favorites',
              title: ua ? 'Систематична гра на низьких коефіцієнтах' : 'Systematic low-odds betting',
              text: ua
                ? 'ROI природно пеналізує стратегію низьких коефіцієнтів. Окремий флаг у MVP не реалізовується.'
                : 'ROI naturally penalizes low-odds strategies. No separate flag implemented in MVP.',
            },
          ]} />
        </DocBlock>

      </DocSection>

      {/* 05 — Database */}
      <DocSection num="05" title={ua ? 'База даних' : 'Database'}>
        <DocBlock title={ua ? 'Поля таблиці expert_ratings' : 'expert_ratings Table Fields'}>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Поле' : 'Field'}</TableHead>
                <TableHead>{ua ? 'Тип' : 'Type'}</TableHead>
                <TableHead>{ua ? 'Приклад' : 'Example'}</TableHead>
                <TableHead>{ua ? 'Примітка' : 'Note'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow><TableCell><code>expert_id</code></TableCell><TableCell>VARCHAR(50)</TableCell><TableCell><code>&quot;C&quot;</code></TableCell><TableCell>PK</TableCell></TableRow>
              <TableRow><TableCell><code>n_valid_bets</code></TableCell><TableCell>INTEGER</TableCell><TableCell><code>9</code></TableCell><TableCell>{ua ? 'Для Confidence' : 'For Confidence'}</TableCell></TableRow>
              <TableRow><TableCell><code>wins</code></TableCell><TableCell>INTEGER</TableCell><TableCell><code>7</code></TableCell><TableCell>{ua ? 'Для Win Rate на UI' : 'For Win Rate on UI'}</TableCell></TableRow>
              <TableRow><TableCell><code>losses</code></TableCell><TableCell>INTEGER</TableCell><TableCell><code>2</code></TableCell><TableCell>{ua ? 'Аудит' : 'Audit'}</TableCell></TableRow>
              <TableRow><TableCell><code>pushes</code></TableCell><TableCell>INTEGER</TableCell><TableCell><code>0</code></TableCell><TableCell>{ua ? 'Зарезервовано' : 'Reserved'}</TableCell></TableRow>
              <TableRow><TableCell><code>sum_profit</code></TableCell><TableCell>DECIMAL(10,4)</TableCell><TableCell><code>6.0400</code></TableCell><TableCell>{ua ? 'Для ROI' : 'For ROI'}</TableCell></TableRow>
              <TableRow><TableCell><code>roi_raw</code></TableCell><TableCell>DECIMAL(10,4)</TableCell><TableCell><code>0.6711</code></TableCell><TableCell>{ua ? 'Для UI та аудиту' : 'For UI and audit'}</TableCell></TableRow>
              <TableRow><TableCell><code>score</code></TableCell><TableCell>DECIMAL(10,4)</TableCell><TableCell><code>0.3179</code></TableCell><TableCell>{ua ? 'Основа для сортування' : 'Sort basis'}</TableCell></TableRow>
              <TableRow><TableCell><code>avg_odds</code></TableCell><TableCell>DECIMAL(5,2)</TableCell><TableCell><code>2.30</code></TableCell><TableCell>{ua ? 'Для профілю' : 'For profile'}</TableCell></TableRow>
              <TableRow><TableCell><code>rank</code></TableCell><TableCell>INTEGER</TableCell><TableCell><code>2</code></TableCell><TableCell>{ua ? 'Для швидкої вибірки' : 'For quick lookup'}</TableCell></TableRow>
              <TableRow><TableCell><code>is_qualified</code></TableCell><TableCell>BOOLEAN</TableCell><TableCell><code>TRUE</code></TableCell><TableCell>{ua ? 'Фільтрація публічного ТОП' : 'Public TOP filter'}</TableCell></TableRow>
              <TableRow><TableCell><code>last_calculated_at</code></TableCell><TableCell>TIMESTAMP</TableCell><TableCell><code>2026-03-20 06:00 CET</code></TableCell><TableCell>{ua ? 'Актуальність' : 'Freshness'}</TableCell></TableRow>
            </TableBody>
          </DocTable>
          <Callout variant="primary" title={ua ? 'Обчислюються на льоту (не зберігаються)' : 'Computed on-the-fly (not stored)'}>
            {ua
              ? 'win_rate (wins/n_valid_bets) | confidence (n_valid_bets/(n_valid_bets+10)) | відносний приріст ROI за останні 30 днів'
              : 'win_rate (wins/n_valid_bets) | confidence (n_valid_bets/(n_valid_bets+10)) | relative ROI growth over the last 30 days'}
          </Callout>
        </DocBlock>
      </DocSection>

      {/* 06 — Decomposition */}
      <DocSection num="06" title={ua ? 'Декомпозиція' : 'Decomposition'}>

        <DocBlock title={ua ? 'Epic: Expert Rating System' : 'Epic: Expert Rating System'}>
          <Callout variant="primary">
            {ua
              ? 'Як маркетинговий менеджер порталу, я хочу мати прозорий рейтинг експертів на основі доведеної прибутковості, щоб підвищити довіру користувачів і стимулювати активність кваліфікованих тіпстерів.'
              : 'As a portal marketing manager, I want a transparent expert ranking based on proven profitability, so I can increase user trust and incentivize activity from qualified tipsters.'}
          </Callout>
        </DocBlock>

        <DocBlock title="User Stories">
          <DocFlow steps={[
            {
              num: '1',
              title: ua ? 'Розрахунок рейтингового балу' : 'Rating Score Calculation',
              text: ua
                ? 'Як система, я маю щоденно обчислювати SCORE для кожного кваліфікованого експерта, щоб рейтинг завжди відображав актуальний стан.'
                : 'As the system, I should daily compute a SCORE for each qualified expert so the rating always reflects current standing.',
            },
            {
              num: '2',
              title: ua ? 'Публічна сторінка рейтингу' : 'Public Leaderboard Page',
              text: ua
                ? 'Як відвідувач порталу, я хочу бачити топ-рейтинг кваліфікованих тіпстерів, відсортованих за SCORE, щоб обрати кращого для підписки.'
                : 'As a portal visitor, I want to see a top-ranking of qualified tipsters sorted by SCORE, so I can choose the best one to follow.',
            },
            {
              num: '3',
              title: ua ? 'Профіль експерта з метриками' : 'Expert Profile with Metrics',
              text: ua
                ? 'Як користувач, я хочу бачити детальну статистику (SCORE, WR, ROI, N, ранг) на профілі тіпстера, щоб оцінити його ефективність до підписки.'
                : 'As a user, I want to see detailed stats (SCORE, WR, ROI, N, rank) on a tipster profile, so I can assess effectiveness before subscribing.',
            },
            {
              num: '4',
              title: ua ? 'Детектор маніпуляцій ★ Ready-for-Dev' : 'Manipulation Detector ★ Ready-for-Dev',
              text: ua
                ? 'Як внутрішній модератор, я хочу автоматично отримувати флаги при виявленні підозрілої активності (пізні ставки, дублікати), щоб своєчасно перевіряти маніпуляції.'
                : 'As an internal moderator, I want to automatically receive flags when suspicious activity is detected (late bets, duplicates), so I can review manipulation in a timely manner.',
            },
          ]} />
        </DocBlock>

        <DocBlock
          title={ua ? 'Acceptance Criteria -- Детектор маніпуляцій' : 'Acceptance Criteria -- Manipulation Detector'}
          subtitle="Given / When / Then"
        >
          <DocFlow steps={[
            {
              num: '1',
              title: ua ? 'Виявлення пізньої ставки' : 'Late Bet Detection',
              text: (
                <span className="flex flex-col gap-0.5">
                  <span><strong className="text-foreground">GIVEN:</strong> {ua ? 'Cron-задача запустила pipeline підготовки даних' : 'Cron job triggered the data preparation pipeline'}</span>
                  <span><strong className="text-foreground">WHEN:</strong> {ua ? 'published_at ≥ match_datetime відповідного матчу' : "published_at ≥ match_datetime of the relevant match"}</span>
                  <span><strong className="text-foreground">THEN:</strong> {ua ? "запис відхиляється → rejection_log (expert_id, prediction_id, reason='late_bet', detected_at=NOW())" : "record is rejected → rejection_log (expert_id, prediction_id, reason='late_bet', detected_at=NOW())"}</span>
                  <span><strong className="text-foreground">AND:</strong> {ua ? "кількість late_bet флагів ≥ 5 за 30 днів → moderation_flags severity='high'" : "late_bet flag count ≥ 5 within 30 days → moderation_flags severity='high'"}</span>
                </span>
              ),
            },
            {
              num: '2',
              title: ua ? 'Виявлення дубліката' : 'Duplicate Detection',
              text: (
                <span className="flex flex-col gap-0.5">
                  <span><strong className="text-foreground">GIVEN:</strong> {ua ? 'Pipeline обробляє прогноз expert_id=X, match_id=M' : 'Pipeline is processing prediction expert_id=X, match_id=M'}</span>
                  <span><strong className="text-foreground">WHEN:</strong> {ua ? 'вже є валідний прогноз з тим самим expert_id та match_id' : 'a valid prediction with the same expert_id and match_id already exists'}</span>
                  <span><strong className="text-foreground">THEN:</strong> {ua ? "новий запис відхиляється → rejection_log reason='duplicate', reference_pred_id" : "new record is rejected → rejection_log reason='duplicate', reference_pred_id"}</span>
                  <span><strong className="text-foreground">AND:</strong> {ua ? "кількість duplicate ≥ 3 за 7 днів → moderation_flags severity='medium'" : "duplicate count ≥ 3 within 7 days → moderation_flags severity='medium'"}</span>
                </span>
              ),
            },
          ]} />
        </DocBlock>

        <DocBlock title="Edge Cases">
          <DocRisks items={[
            {
              level: 'high',
              badge: 'EC 1',
              title: 'published_at = match_datetime',
              text: ua
                ? 'Рівно в момент початку → відхилити (late, нестрога нерівність ≥)'
                : 'Exactly at match start → reject (late, non-strict ≥ inequality)',
            },
            {
              level: 'watch',
              badge: 'EC 2',
              title: ua ? 'Матч скасовано після публікації' : 'Match cancelled after publication',
              text: ua
                ? "event_status = 'cancelled' → rejection_log reason='event_cancelled'. Не рахувати як маніпуляцію."
                : "event_status = 'cancelled' → rejection_log reason='event_cancelled'. Do not count as manipulation.",
            },
            {
              level: 'watch',
              badge: 'EC 3',
              title: ua ? 'Два прогнози з однаковим published_at' : 'Two predictions with identical published_at',
              text: ua
                ? 'Залишити той, що з меншим prediction_id. Обидва записати в rejection_log.'
                : 'Keep the one with the lower prediction_id. Log both in rejection_log.',
            },
            {
              level: 'low',
              badge: 'EC 4',
              title: ua ? 'match_datetime NULL або некоректна дата' : 'match_datetime is NULL or invalid',
              text: ua
                ? "Відхилити обидва прогнози з reason='invalid_event_data'. Не генерувати флаг маніпуляції."
                : "Reject both predictions with reason='invalid_event_data'. Do not generate a manipulation flag.",
            },
            {
              level: 'high',
              badge: 'EC 5',
              title: ua ? 'Bot-like: 100 прогнозів за секунду' : 'Bot-like: 100 predictions per second',
              text: ua
                ? "rapid_submission_count ≥ 10 за 60 секунд → moderation_flags severity='critical'"
                : "rapid_submission_count ≥ 10 within 60 seconds → moderation_flags severity='critical'",
            },
          ]} />
        </DocBlock>

        <DocBlock title="Definition of Done">
          <DocFlow steps={[
            {
              num: '1',
              text: ua
                ? 'rejection_log отримує коректний запис для кожного відхиленого прогнозу з усіх 4 кроків підготовки'
                : 'rejection_log receives a correct entry for every rejected prediction from all 4 preparation steps',
            },
            {
              num: '2',
              text: ua
                ? 'moderation_flags генеруються за пороговими умовами (≥5 late/30d, ≥3 dupes/7d)'
                : 'moderation_flags are generated under threshold conditions (≥5 late/30d, ≥3 dupes/7d)',
            },
            {
              num: '3',
              text: ua
                ? 'Unit-тести покривають усі 5 edge cases'
                : 'Unit tests cover all 5 edge cases',
            },
            {
              num: '4',
              text: ua
                ? 'API endpoint GET /moderation/flags повертає список флагів з пагінацією'
                : 'API endpoint GET /moderation/flags returns a paginated list of flags',
            },
          ]} />
        </DocBlock>

      </DocSection>

      {/* 07 — Integration & Edge States */}
      <DocSection num="07" title={ua ? 'Інтеграція та граничні стани' : 'Integration & Edge States'}>

        <DocBlock title={ua ? 'Де відображається рейтинг' : 'Where the Rating is Displayed'}>
          <DocFlow steps={[
            {
              num: '1',
              title: '/leaderboard',
              text: ua
                ? 'Публічна сторінка, лише is_qualified = TRUE, сортування за SCORE'
                : 'Public page, only is_qualified = TRUE, sorted by SCORE',
            },
            {
              num: '2',
              title: '/expert/{id}',
              text: ua
                ? 'Профіль: ранг, SCORE, WR, ROI, N, avg_odds, last_calculated_at'
                : 'Profile: rank, SCORE, WR, ROI, N, avg_odds, last_calculated_at',
            },
            {
              num: '3',
              title: ua ? 'Головна сторінка' : 'Home Page',
              text: ua ? 'Топ-3 блок (віджет)' : 'Top-3 block (widget)',
            },
            {
              num: '4',
              title: 'Email / Push',
              text: ua
                ? 'Нотифікація при зміні рангу на ±3+ позиції (поза MVP, зарезервовано)'
                : 'Notification on rank change of ±3+ positions (out of MVP scope, reserved)',
            },
          ]} />
        </DocBlock>

        <DocBlock title={ua ? 'Граничні стани' : 'Edge States'}>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Ситуація' : 'Situation'}</TableHead>
                <TableHead>{ua ? 'Поведінка системи' : 'System Behavior'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">New expert N=0</TableCell>
                <TableCell>
                  {ua
                    ? 'Профіль без рейтингових метрик. Плашка "Недостатньо даних (0 прогнозів)". Не входить у leaderboard.'
                    : 'Profile without rating metrics. Badge "Insufficient data (0 predictions)". Not included in leaderboard.'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">N &lt; MIN_BETS (1–4)</TableCell>
                <TableCell>
                  {ua
                    ? 'SCORE розраховується і зберігається в БД, але is_qualified = FALSE. На профілі "Йде накопичення (N з 5)".'
                    : 'SCORE is calculated and stored in DB, but is_qualified = FALSE. Profile shows "Accumulating (N of 5)".'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{ua ? 'Пропущене оновлення даних' : 'Missed data update'}</TableCell>
                <TableCell>
                  {ua
                    ? 'etl_status check → якщо pipeline не завершено, пропустити перерахунок. Залишити попередній рейтинг + алерт про помилку.'
                    : 'etl_status check → if pipeline incomplete, skip recalculation. Retain previous rating + error alert.'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{ua ? 'Усі події upcoming' : 'All events upcoming'}</TableCell>
                <TableCell>
                  {ua
                    ? 'Перерахунок не змінює рейтинг. Зберігається last_calculated_at від попереднього дня.'
                    : 'Recalculation does not change the rating. last_calculated_at is preserved from the previous day.'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{ua ? 'Expert видалений/заблокований' : 'Expert deleted/blocked'}</TableCell>
                <TableCell>
                  {ua
                    ? 'is_qualified = FALSE; soft delete (active=FALSE). Зникає з leaderboard, рядок зберігається.'
                    : 'is_qualified = FALSE; soft delete (active=FALSE). Disappears from leaderboard, row is retained.'}
                </TableCell>
              </TableRow>
            </TableBody>
          </DocTable>
        </DocBlock>

      </DocSection>

      {/* 08 — NFR */}
      <DocSection num="08" title={ua ? 'Нефункціональні вимоги' : 'Non-Functional Requirements'}>

        <DocBlock title={ua ? 'Перформанс та обсяги' : 'Performance & Scale'}>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Метрика' : 'Metric'}</TableHead>
                <TableHead>{ua ? 'Ціль' : 'Target'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">GET /leaderboard</TableCell>
                <TableCell>{ua ? '< 200 мс при 1000 кваліфікованих експертах (Redis, TTL 1 год)' : '< 200 ms with 1000 qualified experts (Redis, TTL 1 hr)'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{'GET /expert/{id}'}</TableCell>
                <TableCell>{ua ? '< 100 мс (читання з БД з індексом по expert_id)' : '< 100 ms (DB read with index on expert_id)'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{ua ? 'Batch-розрахунок 1000 експертів' : 'Batch calc for 1000 experts'}</TableCell>
                <TableCell>{ua ? '< 5 хвилин' : '< 5 minutes'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{ua ? 'Predictions на рік' : 'Predictions per year'}</TableCell>
                <TableCell>{ua ? '1000 тіпстерів × 365 днів × 5 прогнозів = 1.8M рядків' : '1000 tipsters × 365 days × 5 predictions = 1.8M rows'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">expert_ratings</TableCell>
                <TableCell>{ua ? '1 рядок на експерта, < 1 MB' : '1 row per expert, < 1 MB'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">rejection_log</TableCell>
                <TableCell>{ua ? 'До 20 рядків на прогноз ≈ 30K рядків/місяць' : 'Up to 20 rows per prediction ≈ 30K rows/month'}</TableCell>
              </TableRow>
            </TableBody>
          </DocTable>
        </DocBlock>

        <DocBlock title={ua ? 'Ризики' : 'Risks'}>
          <DocScenarios items={[
            {
              label: 'Medium',
              value: ua ? 'Затримка оновлення' : 'Update Delay',
              sub: 'etl_status check',
              note: ua ? 'Fallback на попередній рейтинг' : 'Fallback to previous rating',
            },
            {
              label: 'Low',
              value: ua ? 'Маніпуляції' : 'Manipulation',
              sub: 'rejection_log + flags',
              note: ua ? 'Детектор пізніх ставок і дублікатів' : 'Late bet and duplicate detector',
            },
            {
              label: 'High',
              value: 'Tuning PRIOR_N',
              sub: ua ? 'Параметр у БД' : 'DB parameter',
              note: ua ? 'Зміна без деплою' : 'Change without deploy',
              highlight: true,
            },
          ]} />
        </DocBlock>

      </DocSection>

    </DocLayout>
  )
}
