'use client'

import { useState } from 'react'
import { DocLayout }    from '@/components/doc/DocLayout'
import { DocSection }   from '@/components/doc/DocSection'
import { DocBlock }     from '@/components/doc/DocBlock'
import { Callout }      from '@/components/doc/Callout'
import { DocFlow }      from '@/components/doc/DocFlow'
import { DocScenarios } from '@/components/doc/DocScenarios'
import { DocRisks }     from '@/components/doc/DocRisks'
import { DocTable, DocTableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/doc/DocTable'
import { DocResult }    from '@/components/doc/DocResult'
import { Badge }        from '@/components/ui/badge'

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
      title="BUKI | Product Audit"
      breadcrumbLabel="Sandbox"
      breadcrumbHref="/sandbox"
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      tags={[
        { label: 'PO Test Task',    type: 'tag' },
        { label: 'Product Audit',   type: 'tag' },
        { label: 'Growth Strategy', type: 'tag' },
      ]}
      description={ua
        ? 'Аудит продукту та стратегія зростання для платформи BUKI. Аналіз воронки, діагностика падіння конверсії та план виконання на 6 місяців | By Yevhenii Holovei'
        : 'Product audit and growth strategy for the BUKI platform. Funnel analysis, conversion drop diagnosis, and 6-month execution plan | By Yevhenii Holovei'
      }
      footnote="PO Test Task -- BUKI Product Audit & Growth Strategy | Author: Yevhenii Holovei | Target: +10% Lead→Client conversion"
    >

      {/* 01 -- Funnel Audit */}
      <DocSection num="01" title={ua ? 'Аудит воронки' : 'Funnel Audit'}>

        <DocBlock title={ua ? 'Структура воронки: Traffic → Lead → Contact → Trial → Payment' : 'Funnel Structure: Traffic → Lead → Contact → Trial → Payment'}>
          <DocFlow steps={[
            {
              num: '1',
              title: ua ? 'Traffic -- Низький ризик' : 'Traffic -- Low Risk',
              text: ua
                ? 'SEO (сторінки репетиторів та предметів), direct, paid. Сильний SEO-актив з кількома каналами залучення. Ризик залежить від релевантності пошуку.'
                : 'SEO (tutor and subject pages), direct, paid. Strong SEO asset with multiple acquisition channels. Risk depends on search relevance.',
              tags: ['SEO', 'Direct', 'Paid', 'Low Risk'],
            },
            {
              num: '2',
              title: ua ? 'Lead / Prospect -- Середній ризик' : 'Lead / Prospect -- Medium Risk',
              text: ua
                ? "Пошук → список репетиторів → профіль → 3-кроковий модальний флоу (рівень, частота, тривалість → ім'я, телефон, email → час і цілі). Кожен крок -- точка відтоку."
                : 'Search → tutor list → profile → 3-step modal flow (level, frequency, duration → name, phone, email → time and goals). Each step is a drop-off point.',
              tags: ['Medium Risk'],
            },
            {
              num: '3',
              title: ua ? 'Contact -- Низький ризик' : 'Contact -- Low Risk',
              text: ua
                ? 'Перше заняття заплановано і підтверджено. Перехід на bukischool.com.ua (зміна домену). Заповнена форма свідчить про рівень залученості.'
                : 'First lesson scheduled and confirmed. Transition to bukischool.com.ua (domain change). Completed form signals commitment level.',
              tags: ['Low Risk'],
            },
            {
              num: '4',
              title: ua ? 'Trial -- Середній-Великий ризик' : 'Trial -- Medium-High Risk',
              text: ua
                ? 'Безкоштовне пробне заняття через BUKI School (Zoom). Нульова відповідальність учня -- можна скасувати або забути без наслідків. Найнебезпечніший етап.'
                : 'Free trial lesson via BUKI School (Zoom). Zero student accountability -- can cancel or forget without consequences. Most dangerous stage.',
              tags: ['Medium-High Risk'],
            },
            {
              num: '5',
              title: ua ? 'Payment -- Середній ризик' : 'Payment -- Medium Risk',
              text: ua
                ? 'Після пробного заняття надсилається email з балансом "0 годин". Конверсія залежить від якості репетитора і готовності учня, а не від механіки платформи.'
                : 'Post-trial email sent with account balance showing "0 hours". Conversion depends on tutor quality and student readiness, not platform mechanics.',
              tags: ['Medium Risk'],
            },
          ]} />
        </DocBlock>

        <DocBlock title={ua ? 'Критичні проблеми' : 'Critical Problems'}>
          <div className="mb-5">
            <DocRisks items={[
              {
                level: 'high',
                title: ua ? 'Нульова відповідальність учня (Trial)' : 'Zero Student Accountability (Trial)',
                text: ua
                  ? "Безкоштовне пробне заняття без жодних зобов'язань знижує сприйняту цінність. Учні не мають фінансового якоря, що підтверджував би намір."
                  : 'Free, obligation-free trials reduce perceived value. Students have no financial anchor confirming intent.',
              },
              {
                level: 'high',
                title: ua ? 'Слабка механіка конверсії після триалу (Payment)' : 'Weak Post-Trial Conversion Mechanics (Payment)',
                text: ua
                  ? 'Платформа не контролює конверсію Trial→Payment. Залежність від якості репетитора. Підозра на домовленості поза платформою між репетиторами і учнями.'
                  : 'Platform lacks conversion control. Dependency on tutor quality. Suspected off-platform arrangements between tutors and students harm revenue capture.',
              },
              {
                level: 'watch',
                title: ua ? 'Відсутність персоналізованих рекомендацій (Prospect)' : 'No Personalized Recommendations (Prospect)',
                text: ua
                  ? 'Репетитори представлені як пасивний список із фільтрами. Платформа не використовує інтелектуальне звуження за цілями, рівнем і розкладом учня.'
                  : 'Tutors presented as a passive list with filters. Platform provides no intelligent narrowing based on student goals, level, or schedule.',
              },
            ]} />
          </div>
          <Callout variant="warning" title={ua ? 'Точка максимальних втрат' : 'Maximum Value Loss Point'}>
            {ua
              ? 'Найбільше значення губиться на переході Opportunity → Payment, де якість одного заняття і пасивна позиція платформи сходяться разом.'
              : 'Maximum value drain occurs at the Opportunity → Payment transition where single-lesson quality variability and platform powerlessness converge.'}
          </Callout>
        </DocBlock>

      </DocSection>

      {/* 02 -- Deep Dive */}
      <DocSection num="02" title={ua ? 'Deep Dive: Падіння конверсії на 20%' : 'Deep Dive: 20% Conversion Drop'}>

        <DocBlock title={ua ? '4 під-етапи для дослідження' : '4 Sub-Stages to Investigate'}>
          <DocFlow steps={[
            {
              num: '1',
              title: 'Submission → Manager Contact',
              text: ua
                ? 'Вимірюється медіанним часом до першого контакту. Деградація тут призводить до прямого падіння конверсії.'
                : 'Measured by median time-to-first-contact. Degradation here causes direct impact on conversion.',
            },
            {
              num: '2',
              title: 'Manager Contact → Trial Scheduled',
              text: ua
                ? 'Відстежується через booking confirmation rates за менеджером і репетитором. Проблеми: падіння acceptance rate або слабкий sales script.'
                : 'Tracked via booking confirmation rates by manager and tutor. Problems include acceptance rate failures or poor sales scripts.',
            },
            {
              num: '3',
              title: 'Trial Scheduled → Trial Completed',
              text: ua
                ? 'Моніторинг no-show rates, скасувань і частоти перенесень. Зростання no-shows вказує на проблеми з commitment учнів.'
                : 'Monitored through no-show rates, cancellations, and rescheduling frequency. Rising no-shows indicate student commitment issues.',
            },
            {
              num: '4',
              title: 'Trial Completed → First Payment',
              text: ua
                ? '% триалів, що конвертуються в оплату протягом 7 днів. Ідентифікований як найбільш ризиковий через пасивну механіку конверсії.'
                : '% of trials converting to payment within 7 days. Identified as highest-risk due to passive conversion mechanics.',
            },
          ]} />
        </DocBlock>

        <DocBlock title={ua ? '6 гіпотез (за ймовірністю)' : '6 Hypotheses (by Probability)'}>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Гіпотеза' : 'Hypothesis'}</TableHead>
                <TableHead>{ua ? 'Необхідні дані' : 'Data Required'}</TableHead>
                <TableHead>{ua ? 'Ймовірність' : 'Probability'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{ua ? 'Деградація часу до контакту' : 'Time-to-contact degraded'}</TableCell>
                <TableCell>{ua ? 'Медіанний час контакту по місяцях' : 'Monthly median contact time'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-destructive-bg text-destructive border-destructive/30 text-xs pointer-events-none">
                    High
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{ua ? 'Зниження якості трафіку' : 'Traffic quality declined'}</TableCell>
                <TableCell>{ua ? 'Розбивка трафіку (paid/organic)' : 'Traffic source breakdown (paid/organic)'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-brand-bg text-brand border-brand/30 text-xs pointer-events-none">
                    Medium
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{ua ? 'Падіння acceptance rate репетиторів' : 'Tutor acceptance rate fell'}</TableCell>
                <TableCell>{ua ? 'Метрики acceptance + час відповіді' : 'Acceptance metrics + response times'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-destructive-bg text-destructive border-destructive/30 text-xs pointer-events-none">
                    High
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{ua ? 'Сезонність ринку' : 'Market seasonality'}</TableCell>
                <TableCell>{ua ? 'Історичні сезонні паттерни' : 'Historical seasonal patterns'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-brand-bg text-brand border-brand/30 text-xs pointer-events-none">
                    Medium
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{ua ? 'Зростання відтоку після триалу' : 'Post-trial dropout increased'}</TableCell>
                <TableCell>{ua ? 'Аналіз Trial→Payment rate' : 'Trial-to-payment rate analysis'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-destructive-bg text-destructive border-destructive/30 text-xs pointer-events-none">
                    High
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{ua ? 'Регресія UX форми' : 'Form UX regression'}</TableCell>
                <TableCell>{ua ? 'Completion rates по кроках форми' : 'Step-by-step completion rates'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-brand-bg text-brand border-brand/30 text-xs pointer-events-none">
                    Medium
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </DocTable>
        </DocBlock>

        <DocBlock title={ua ? 'Швидкі перемоги (2–4 тижні)' : 'Quick Wins (2–4 Weeks)'}>
          <DocFlow steps={[
            {
              num: '1',
              title: ua ? 'Оптимізація часу до контакту' : 'Time-to-Contact Optimization',
              text: ua
                ? 'Алерти на заявки без відповіді >2 годин. Авто-підтвердження SMS/email для сигналу миттєвої реакції. Зусилля: 3–5 днів.'
                : 'Alerts for submissions unanswered >2 hours. Auto-acknowledgment SMS/email for immediate response signal. Effort: 3–5 days.',
              tags: ['+3–5% Lead→Contact'],
            },
            {
              num: '2',
              title: ua ? 'Тригерна послідовність після триалу' : 'Post-Trial Trigger Sequence',
              text: ua
                ? '1–2 год після триалу: запит оцінки (SMS/Viber). 24 год: перевірка задоволеності + посилання на поповнення. 72 год: повідомлення про терміновість слотів. Зусилля: ~1 тиждень.'
                : '1–2 hours post-trial: rating request (SMS/Viber). 24 hours: satisfaction check with direct top-up link. 72 hours: urgency message about slot availability. Effort: ~1 week.',
              tags: ['+5–8% Trial→Payment'],
            },
            {
              num: '3',
              title: ua ? 'Реактивація "мертвих" лідів' : 'Dormant Lead Reactivation',
              text: ua
                ? '3-листова email-послідовність протягом 7 днів для неконвертованих лідів: нові репетитори, навчальний контент, персоналізовані матчі. Зусилля: ~1 тиждень.'
                : '3-message email sequence over 7 days for unconverted leads: new tutors, educational content, personalized matches. Effort: ~1 week.',
              tags: ['+2–4% reactivation'],
            },
            {
              num: '4',
              title: ua ? 'Прискорення відповіді репетиторів' : 'Tutor Response Acceleration',
              text: ua
                ? 'Авто-нагадування репетиторам через 4 години без відповіді. Алерт менеджеру через 8 годин з опцією переназначення. Зусилля: ~3 дні.'
                : 'Auto-reminder to tutors at 4-hour mark if no response. Manager alert at 8 hours; option to reassign to available tutor. Effort: ~3 days.',
              tags: ['+10–15% acceptance rate'],
            },
          ]} />
        </DocBlock>

      </DocSection>

      {/* 03 -- Growth Strategy */}
      <DocSection num="03" title={ua ? 'Стратегія зростання: +10% Lead→Client' : 'Growth Strategy: +10% Lead→Client'}>

        <DocBlock title={ua ? '5 ініціатив та RICE-пріоритизація' : '5 Initiatives & RICE Prioritization'}>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Ініціатива' : 'Initiative'}</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Effort</TableHead>
                <TableHead>RICE</TableHead>
                <TableHead>{ua ? 'Місяць' : 'Month'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div>
                    <strong>Post-Trial Conversion Flow</strong>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ua ? 'SMS → email → messenger після триалу з тригерами бронювання' : 'SMS → email → messenger after trial with booking triggers'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-brand-bg text-brand border-brand/30 text-xs pointer-events-none">Medium</Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">+2–3%</TableCell>
                <TableCell className="text-sm">{ua ? '1 тиждень' : '1 week'}</TableCell>
                <TableCell>160</TableCell>
                <TableCell>M1</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div>
                    <strong>Lead Reactivation</strong>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ua ? 'Автоматизована 3-листова послідовність для "мертвих" лідів' : 'Automated 3-email sequence targeting unconverted leads'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-subtle text-muted-foreground border-subtle-border text-xs pointer-events-none">Low</Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">+1–2%</TableCell>
                <TableCell className="text-sm">{ua ? '1 тиждень' : '1 week'}</TableCell>
                <TableCell>21</TableCell>
                <TableCell>M1</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div>
                    <strong>Trust Signals & Time-to-Contact</strong>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ua ? 'Час відповіді, онлайн-статус, "X% продовжують після триалу" на профілях' : 'Response time, online status, "X% continue after trial" on profiles'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-brand-bg text-brand border-brand/30 text-xs pointer-events-none">Medium</Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">+2–3%</TableCell>
                <TableCell className="text-sm">{ua ? '2 тижні' : '2 weeks'}</TableCell>
                <TableCell>70</TableCell>
                <TableCell>M2</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div>
                    <strong>Tutor Video Profiles</strong>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ua ? 'Відео-представлення 30–60 сек. Перевірено моделлю Preply.' : '30–60 sec video introductions. Proven by Preply model.'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-success-bg text-success border-success-border text-xs pointer-events-none">High</Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">+3–5%</TableCell>
                <TableCell className="text-sm">{ua ? '4 тижні' : '4 weeks'}</TableCell>
                <TableCell>52</TableCell>
                <TableCell>M3</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div>
                    <strong>Smart Match + AI</strong>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ua ? 'Блок "Найкращий матч для вас" на основі AI та даних форми' : '"Best match for you" block using AI and form intake data'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-warning-bg text-warning border-warning-border text-xs pointer-events-none">Very High</Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">+4–6%</TableCell>
                <TableCell className="text-sm">{ua ? '12 тижнів' : '12 weeks'}</TableCell>
                <TableCell>20</TableCell>
                <TableCell>M4–M6</TableCell>
              </TableRow>
            </TableBody>
          </DocTable>
          <Callout variant="primary" title={ua ? 'Логіка послідовності' : 'Sequencing Rationale'}>
            {ua
              ? 'Попри низький RICE-score, Smart Match має найвищу стратегічну цінність. Спочатку -- quick wins (M1–M2) для встановлення baseline з нульовим CAPEX. Потім інфраструктура (M3), потім AI (M5–M6) -- коли накопичилися дані для навчання моделі.'
              : 'Despite low RICE score, Smart Match has the highest strategic value. First -- quick wins (M1–M2) to establish baseline with zero CAPEX. Then infrastructure (M3), then AI (M5–M6) -- when sufficient data has accumulated to train the model.'}
          </Callout>
        </DocBlock>

        <DocBlock title={ua ? 'Очікуваний кумулятивний ефект' : 'Expected Cumulative Impact'}>
          <DocScenarios items={[
            {
              label: 'M1–M2',
              value: '+5–6%',
              sub: ua ? 'Автоматизація + реактивність' : 'Automation + responsiveness',
              note: ua
                ? 'Post-trial flow і Lead reactivation + Trust signals і Manager alerts'
                : 'Post-trial flow and Lead reactivation + Trust signals and Manager alerts',
            },
            {
              label: 'M3–M4',
              value: '+8–11%',
              sub: ua ? 'Відео + аналіз' : 'Video + analysis',
              note: ua
                ? 'Відео-профілі додають 3–5%, аналіз і закладка фундаменту для Smart Match'
                : 'Video profiles add 3–5%, analysis and Smart Match foundation',
            },
            {
              label: 'M5–M6',
              value: '+10%',
              sub: ua ? 'Стале зростання' : 'Steady state',
              note: ua
                ? 'Smart Match в роботі, тестування підписок, NPS програма запущена'
                : 'Smart Match operational, subscription testing, NPS program launched',
              highlight: true,
            },
          ]} />
        </DocBlock>

      </DocSection>

      {/* 04 -- Product Execution */}
      <DocSection num="04" title={ua ? 'Виконання: Roadmap на 6 місяців' : 'Execution: 6-Month Roadmap'}>

        <DocBlock title={ua ? 'Roadmap по місяцях' : 'Month-by-Month Roadmap'}>
          <DocFlow steps={[
            {
              num: 'M1',
              title: ua ? 'Квітень -- Фундамент та Quick Wins' : 'April -- Foundation & Quick Wins',
              text: ua
                ? 'Дашборд воронки (Lead→Contact→Trial→Payment). Авто-тригери після триалу (SMS/email/Viber/Telegram через 1–2 год). Реактивація лідів за попередні 3 місяці. Метрика: Trial→Payment +2%.'
                : 'Funnel dashboard (Lead→Contact→Trial→Payment). Post-trial triggers (SMS/email/Viber/Telegram within 1–2 hours). Reactivation of leads from previous 3 months. Metric: Trial→Payment +2%.',
              tags: ['PM', 'Data', 'Backend'],
            },
            {
              num: 'M2',
              title: ua ? 'Травень -- Довіра та Реактивність' : 'May -- Trust & Responsiveness',
              text: ua
                ? 'Trust signals UI: час відповіді, онлайн-статус, бронювання, retention % на профілях. Система реактивності менеджерів. A/B тест CTA на сторінках репетиторів. Підготовка до відео-онбордингу. Метрика: Time-to-contact ≤2 год, Lead→Contact +3%.'
                : 'Trust signal UI: response time badges, online status, booking counts, retention % on profiles. Manager responsiveness system. A/B test CTA on tutor profiles. Video onboarding prep. Metric: Time-to-contact ≤2 hours, Lead→Contact +3%.',
              tags: ['PM', 'Design', 'Backend', 'Frontend', 'Data'],
            },
            {
              num: 'M3',
              title: ua ? 'Червень -- Відео-профілі' : 'June -- Video Profiles',
              text: ua
                ? 'Відео-інфраструктура (зберігання, кодування, відтворення). Відео-онбординг репетиторів (30–60 сек). Інтеграція відео в профілі. A/B тест: профілі з відео vs. контрольна група. Метрика: Trial booking rate +5%.'
                : 'Video infrastructure (storage, encoding, playback). Tutor video onboarding (30–60 sec). Video profile integration. A/B test: profiles with video vs. control group. Metric: Trial booking rate +5%.',
              tags: ['PM', 'Design', 'Backend', 'Frontend', 'Data'],
            },
            {
              num: 'M4',
              title: ua ? 'Липень -- Аналіз та Фундамент Smart Match' : 'July -- Analysis & Smart Match Foundation',
              text: ua
                ? 'Аналіз відео-профілів за сегментами (предмет, рівень, географія). BRD/PRD для Smart Match. Вимоги до ML-моделі: навчання на continuation rates, швидкості відповіді, доступності репетиторів. Метрика: кумулятивний +3–5% над baseline.'
                : 'Video profile performance analysis by segment (subject, level, geography). BRD/PRD for Smart Match. ML model requirements: learning from continuation rates, tutor responsiveness, calendar availability. Metric: cumulative +3–5% above baseline.',
              tags: ['PM', 'Data', 'Backend'],
            },
            {
              num: 'M5',
              title: ua ? 'Серпень -- Smart Match v1' : 'August -- Smart Match v1',
              text: ua
                ? 'Блок рекомендацій: топ-3 репетитори на основі цілей, рівня і розкладу з форми. AI prompt interface: текстове поле для опису потреб. Пайплайн переналаштування моделі. Метрика: Choice-to-contact rate +5–7%.'
                : 'Recommendation block: top-3 tutors based on goals, level, schedule from form. AI prompt interface: text box for describing needs. Continuous model retraining pipeline. Metric: Choice-to-contact rate +5–7%.',
              tags: ['PM', 'Backend (ML)', 'Frontend'],
            },
            {
              num: 'M6',
              title: ua ? 'Вересень -- Refinement та Наступний крок' : 'September -- Refinement & Next Steps',
              text: ua
                ? 'Оптимізація Smart Match за A/B-даними. Тестування підписок (пакети 8+ занять зі знижкою після триалу). NPS-програма після 3-го заняття. Ретроспектива 6 місяців + ревізія roadmap на Q4. Метрика: кумулятивний +10%, NPS baseline 75–80.'
                : 'Smart Match optimization based on A/B test data. Subscription bundle testing (8+ lessons at discounted rate post-trial). NPS program after 3rd lesson. 6-month retrospective + Q4 roadmap revision. Metric: cumulative +10%, NPS baseline 75–80.',
              tags: ['PM', 'Design', 'Backend', 'Frontend', 'Data'],
            },
          ]} />
        </DocBlock>

        <DocBlock title={ua ? 'Команда' : 'Team'}>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Роль' : 'Role'}</TableHead>
                <TableHead>FTE</TableHead>
                <TableHead>{ua ? 'Відповідальність' : 'Responsibilities'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">Head of Product</TableCell>
                <TableCell>1.0</TableCell>
                <TableCell>{ua ? 'Стратегія, OKR, пріоритизація беклогу, stakeholder alignment, sprint governance' : 'Strategy, OKR management, backlog prioritization, stakeholder alignment, sprint governance'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Product Designer</TableCell>
                <TableCell>1.0</TableCell>
                <TableCell>{ua ? 'UX-дослідження, прототипи, trust signals UI, post-trial flows' : 'UX research, interaction design, prototypes, trust signal UI, post-trial screen flows'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Backend Engineer ×2</TableCell>
                <TableCell>2.0</TableCell>
                <TableCell>{ua ? 'Тригерні системи, Calendar API, алгоритми матчингу, workflows acceptance' : 'Notification trigger systems, calendar API integrations, matching algorithms, tutor acceptance workflows'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Frontend Engineer</TableCell>
                <TableCell>1.0</TableCell>
                <TableCell>{ua ? 'Рефакторинг форми бронювання, post-trial UI, trust signal рендеринг' : 'Booking form refactoring, bukischool.com.ua post-trial interfaces, trust signal rendering'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Data Analyst</TableCell>
                <TableCell>0.5</TableCell>
                <TableCell>{ua ? 'Funnel дашборди, A/B аналіз, щотижневий metrics review, alerting' : 'Dashboard construction, A/B test analysis, weekly metrics review, alerting infrastructure'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">QA Engineer</TableCell>
                <TableCell>0.5</TableCell>
                <TableCell>{ua ? 'Регресійне тестування кожного спринту, edge cases booking flow, валідація тригерів' : 'Regression testing each sprint, booking flow edge cases, notification delivery validation'}</TableCell>
              </TableRow>
            </TableBody>
          </DocTable>
          <Callout variant="primary">
            {ua
              ? 'Координація: щотижневий 15-хвилинний metrics standup + щомісячні OKR check-ins з CPO/CEO.'
              : 'Coordination pattern: weekly 15-minute metrics standup + monthly OKR check-ins with CPO/CEO.'}
          </Callout>
        </DocBlock>

        <DocBlock title={ua ? 'Система вимірювання' : 'Measurement System'}>
          <DocResult
            label="North Star Metric"
            value="+10%"
            formula={ua
              ? 'Lead → Client conversion rate | Ціль: +10% за 6 місяців | Кадент: щотижнево'
              : 'Lead → Client conversion rate | Target: +10% over 6 months | Cadence: weekly'}
            note={ua
              ? '% лідів, що стають платними клієнтами протягом 30 днів після триалу. Публікується в спільному дашборді щотижнево.'
              : '% of leads becoming paying customers within 30 days of trial. Published in shared dashboard weekly.'}
          />
          <p className="text-sm font-semibold text-foreground mb-3 -mt-2">
            {ua ? 'Провідні індикатори (щотижнево)' : 'Leading Indicators (weekly)'}
          </p>
          <DocFlow steps={[
            {
              num: '1',
              title: 'Time-to-first-contact',
              text: ua ? 'Ціль: <2 години. Щоденні алерти при перевищенні.' : 'Target: <2 hours. Daily alerts when exceeded.',
            },
            {
              num: '2',
              title: 'Tutor acceptance rate',
              text: ua ? 'Ціль: >85%. Алерт при падінні нижче 70%.' : 'Target: >85%. Alert when below 70%.',
            },
            {
              num: '3',
              title: 'Trial completion rate',
              text: ua ? 'Ціль: +10% vs. baseline.' : 'Target: +10% vs. baseline.',
            },
            {
              num: '4',
              title: 'Post-trial payment rate',
              text: ua ? 'Вікно 7 днів. Ключовий показник конверсії.' : '7-day window. Key conversion indicator.',
            },
            {
              num: '5',
              title: 'Form completion rate',
              text: ua ? 'Всі 3 кроки форми.' : 'All 3 form steps.',
            },
            {
              num: '6',
              title: 'Choice-to-contact rate',
              text: ua ? 'Для рекомендацій Smart Match. Починаючи з M5.' : 'For Smart Match recommendations. Starting from M5.',
            },
          ]} />
          <Callout variant="warning" title={ua ? 'Критична технічна нота' : 'Critical Technical Note'}>
            {ua
              ? 'Дашборд має відстежувати користувачів між двома доменами (buki.com.ua → bukischool.com.ua). Необхідне server-side event tracking або GA4 cross-domain конфігурація. Без цього -- аналітика не дає повної картини.'
              : 'Dashboard must track users across two domains (buki.com.ua → bukischool.com.ua). Requires server-side event tracking or GA4 cross-domain configuration. Without this -- analytics provides an incomplete picture.'}
          </Callout>
        </DocBlock>

      </DocSection>

    </DocLayout>
  )
}
