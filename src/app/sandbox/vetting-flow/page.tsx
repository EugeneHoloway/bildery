'use client'

import { useState } from 'react'
import { DocLayout }    from '@/components/doc/DocLayout'
import { DocSection }   from '@/components/doc/DocSection'
import { DocBlock }     from '@/components/doc/DocBlock'
import { Callout }      from '@/components/doc/Callout'
import { DocFlow }      from '@/components/doc/DocFlow'
import { DocRisks }     from '@/components/doc/DocRisks'
import { DocTable, DocTableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/doc/DocTable'
import { Badge }        from '@/components/ui/badge'

type Lang = 'en' | 'ua'

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
      title="Vetting Flow Iteration | Lemon.io"
      breadcrumbLabel="Sandbox"
      breadcrumbHref="/sandbox"
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      tags={[
        { label: 'PM Test Task',   type: 'tag' },
        { label: 'Vetting Flow',   type: 'tag' },
        { label: 'AI Interviewer', type: 'tag' },
      ]}
      description={ua
        ? 'Інвентаризація проблем, аналіз першопричини 50% хибно-позитивних Mark, і 4-тижневий план hardening | By Yevhenii Holovei'
        : "Problem inventory, root-cause analysis of Mark's 50% false-positive rate, and a 4-week hardening plan | By Yevhenii Holovei"
      }
      footnote="PM Test Task -- Vetting Flow Iteration | Author: Yevhenii Holovei | Focus: Mark Evaluation & Rubric Hardening | Goal: lift auto-advance precision 50% → 80%+"
    >

      {/* ── Problem ─────────────────────────────────────────────────────────── */}
      <section className="pt-12 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-foreground mb-6">
          {ua ? 'Проблема' : 'Problem'}
        </p>
        <DocBlock>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {ua
              ? <><a href="https://lemon.io" target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 transition-colors hover:text-foreground">Lemon.io</a> використовує голосовий AI-скринер <strong className="text-foreground">Mark</strong> (provided by <a href="https://vapi.ai" target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 transition-colors hover:text-foreground">vapi.ai</a>) для кваліфікації розробників перед ручним рев'ю. Ціль -- <strong className="text-foreground">150 наймів/місяць</strong>. Поточний результат -- <strong className="text-foreground">104</strong> -- не через брак людей, а тому що Mark генерує більше повторної роботи, ніж усуває.</>
              : <><a href="https://lemon.io" target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 transition-colors hover:text-foreground">Lemon.io</a> runs a voice AI screener called <strong className="text-foreground">Mark</strong> (provided by <a href="https://vapi.ai" target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 transition-colors hover:text-foreground">vapi.ai</a>) to qualify developers before human review. The target is <strong className="text-foreground">150 hires/month</strong>. The current result is <strong className="text-foreground">104</strong> -- not because of headcount, but because Mark generates more rework than it eliminates.</>
            }
          </p>
          <ul className="flex flex-col gap-2.5">
            <li className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
              <span className="mt-0.5 size-1.5 rounded-full bg-destructive shrink-0 translate-y-1.5" />
              <span>
                <strong className="text-foreground">{ua ? 'Провал точності.' : 'Precision failure.'}</strong>{' '}
                {ua
                  ? "Auto-advance Mark пропускає 50% хибно-позитивних -- кожен другий схвалений кандидат відхиляється при ручному QC. Рекрутери перевіряють кожен Mark Pass вручну. Автоматизація не звільняє жодної ємності."
                  : "Mark's auto-advance passes 50% false positives -- every other candidate it clears fails human QC. Recruiters must manually review every single Mark Pass. Automation frees zero capacity."
                }
              </span>
            </li>
            <li className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
              <span className="mt-0.5 size-1.5 rounded-full bg-destructive shrink-0 translate-y-1.5" />
              <span>
                <strong className="text-foreground">{ua ? 'Витік рейту.' : 'Rate leak.'}</strong>{' '}
                {ua
                  ? "Mark розкриває внутрішні компенсаційні діапазони у 74% дзвінків. Кандидати орієнтуються на верхню межу замість власних очікувань -- втрачається орієнтовно $4–5K/місяць маржі офферів."
                  : "Mark shares internal compensation ranges in 74% of calls. Candidates anchor to the ceiling instead of stating their own number -- eroding an estimated $4–5K/month in offer margin."
                }
              </span>
            </li>
            <li className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
              <span className="mt-0.5 size-1.5 rounded-full bg-destructive shrink-0 translate-y-1.5" />
              <span>
                <strong className="text-foreground">{ua ? 'Відтік воронки.' : 'Funnel bleed.'}</strong>{' '}
                {ua
                  ? "Лише 54% кандидатів завершують дзвінок з Mark. 208 відключаються через технічні збої без логіки повтору. Ще 38% відпадають на стадії 2 ('переваги проекту') через UX дзвінка."
                  : "Only 54% of candidates complete the Mark call. 208 drop due to tech failures with zero retry logic. Another 38% drop at stage 2 alone (\"project preferences\") due to call UX."
                }
              </span>
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            {ua
              ? "Підсумок: завантаженість рекрутерів -- 53%. Не через брак людей, а через AI-повторну роботу. Ціль 150/місяць структурно заблокована, поки точність Mark не виправлена."
              : "Net effect: recruiter utilization sits at 53% -- not from lack of people, but from AI-generated rework. The 150/month target is structurally blocked until Mark's precision is fixed."
            }
          </p>
        </DocBlock>
      </section>

      {/* ── Solution label + Section 01 (no border between them) ───────────── */}
      <section className="pt-12 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-foreground mb-6">
          {ua ? 'Рішення' : 'Solution'}
        </p>
        <div className="flex items-baseline gap-3 mb-7">
          <span className="text-sm font-semibold tabular-nums text-muted-foreground">01.</span>
          <h2 className="text-lg font-bold tracking-tight">
            {ua ? 'Інвентаризація проблем і пріоритизація' : 'Problem Inventory & Prioritization'}
          </h2>
        </div>

        <DocBlock
          title={ua ? 'Фреймворк: Impact × Confidence × Urgency / Effort' : 'Framework: Impact × Confidence × Urgency / Effort'}
          subtitle={ua
            ? 'Де: Impact = вплив на 4 бізнес-метрики (throughput: найми/міс, ємність рекрутера, довіра кандидата, маржа на найм) · Confidence = проблема підтверджена? · Urgency = вплив зросте при затримці? · Effort = тижні команди (2 BE + 1 FE + 1 QA, без дизайнера)'
            : 'Where: Impact = effect on 4 business metrics (throughput: hires/month, recruiter capacity, candidate trust, margin per hire) · Confidence = is the problem proven? · Urgency = will the impact grow if we delay? · Effort = engineering weeks (2 BE + 1 FE + 1 QA, no designer)'
          }
        >
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{ua ? 'Проблема' : 'Problem'}</TableHead>
                <TableHead>{ua ? 'Що страждає' : 'What suffers'}</TableHead>
                <TableHead>{ua ? 'Докази' : 'Evidence'}</TableHead>
                <TableHead>{ua ? 'Зусилля' : 'Effort'}</TableHead>
                <TableHead>{ua ? 'Пріоритет' : 'Priority'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">1</TableCell>
                <TableCell>{ua ? 'Mark Pass зламаний: 50% auto-advance кандидатів відхиляються після QC рекрутера. (English / role-claims / skill-probe стадії).' : 'Mark Pass is broken: 50% of auto-advance candidates downgraded after recruiter QC. (English / role-claims / skill-probe stages).'}</TableCell>
                <TableCell>{ua ? 'Ємність рекрутерів, throughput до цілі 150/міс' : 'Recruiter capacity, throughput vs 150/mo goal'}</TableCell>
                <TableCell>{ua ? '15 з 30 перевірених відхилено (50%): Олена: 5 випадків Mark Pass з A2 English за тиждень; Юлія: Mark пропускає скриптові відповіді (3+ схожих зафіксовано)' : '15 of 30 reviewed downgraded to Reject (50%): Olena: 5 cases of Mark Pass with A2 English in a single week; Yulia: Mark passes scripted answers (3+ similar caught in standup notes)'}</TableCell>
                <TableCell>{ua ? '±4 тижні' : '±4 weeks'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-destructive-bg text-destructive border-destructive/30 text-xs pointer-events-none whitespace-nowrap">P0 Top</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">2</TableCell>
                <TableCell>{ua ? 'Mark розкриває внутрішній діапазон рейтів кандидатам (74%).' : 'Mark discloses the internal rate range to candidates (74%).'}</TableCell>
                <TableCell>{ua ? 'Маржа на найм, ~5–6 втрачених офферів/міс' : 'Margin per hire, ~5–6 lost offers/mo'}</TableCell>
                <TableCell>{ua ? "Марина: 17 з 23 кейсів (74%) за 30 днів. Почувши діапазон, кандидати тягнуться до його стелі. 5–6 втрачених офферів за оцінкою Марини." : 'Maryna: 17 of 23 cases (74%) in the past 30 days. After hearing the range, candidates push for the top of it instead of their original ask. 5–6 lost offers based on Maryna\'s estimate.'}</TableCell>
                <TableCell>{ua ? '±0.5 дня (зміна промпту)' : '±0.5 day (prompt change)'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-destructive-bg text-destructive border-destructive/30 text-xs pointer-events-none whitespace-nowrap">P0 Quick-win</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">3</TableCell>
                <TableCell>{ua ? "Завершення дзвінків Mark лише 54% (відмови 27% + тех. збої 13% + agent-ended 6%). Найбільший відтік (38%) на стадії 2/8 -- 'project preferences'." : 'Mark call completion only 54% (hangups 27% + tech issues 13% + agent-ended 6%). Biggest drop (38%) on stage 2/8 -- "project preferences".'}</TableCell>
                <TableCell>{ua ? 'Конверсія top-of-funnel, довіра кандидатів' : 'Top-of-funnel conversion, candidate trust'}</TableCell>
                <TableCell>{ua ? "736 втрачено з 1600 · кандидати називають дзвінок 'нав'язливим' · немає повтору після тех. збоїв (208 кандидатів)" : '736 lost out of 1600 · candidate quotes call it "pushy" · no retry after tech failures (208 candidates)'}</TableCell>
                <TableCell>{ua ? '±2–3 тижні (фікс стадії 2 + retry)' : '±2–3 weeks (stage-2 prompt fix + retry for tech-issue)'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-brand-bg text-brand border-brand/30 text-xs pointer-events-none whitespace-nowrap">P1</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">4</TableCell>
                <TableCell>{ua ? 'Черга Need Review переповнена: 160 з 400 чекають до 14 днів. Немає SLA, FIFO, пріоритизації.' : 'Need Review queue overflow: 160 of 400 waiting up to 14 days. No SLA, FIFO, no prioritization.'}</TableCell>
                <TableCell>{ua ? 'Довіра кандидатів, time-to-matching' : 'Candidate trust, time-to-matching'}</TableCell>
                <TableCell>{ua ? "Олена: 'черга зростає на 20–25/день, обробляємо 8–10' · Костянтин: 'я не знаю порядку пріоритетів'" : 'Olena: "queue grows by 20–25/day, we clear 8–10" · Kostyantyн: "I don\'t know the priority order"'}</TableCell>
                <TableCell>{ua ? '±1–2 тижні (scoring engine + SLA)' : '±1–2 weeks (scoring engine + SLA)'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-brand-bg text-brand border-brand/30 text-xs pointer-events-none whitespace-nowrap">P1</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">5</TableCell>
                <TableCell>{ua ? <>Хибно-позитивні Mark Reject: 73% override rate на Mark Reject + <a href="https://coderbyte.com" target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 transition-colors hover:text-foreground">Coderbyte</a> Pass. Mark надто суворий до пауз і повторних запитань.</> : <>Mark Reject false positives: 73% override rate on Mark Reject + <a href="https://coderbyte.com" target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 transition-colors hover:text-foreground">Coderbyte</a> Pass. Mark is overly strict on pauses and re-asks.</>}</TableCell>
                <TableCell>{ua ? 'Throughput (хибні відхилення)' : 'Throughput (false rejects)'}</TableCell>
                <TableCell>{ua ? "11 з 15 overridden · Андрій: пауза 8 сек → Mark позначив 'shady'" : '11 of 15 overridden · Andrii: 8-sec pause → Mark flagged "shady"'}</TableCell>
                <TableCell>{ua ? '±1 тиждень (критерії Reject + regression test)' : '±1 week (Reject criteria + regression test)'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-brand-bg text-brand border-brand/30 text-xs pointer-events-none whitespace-nowrap">{ua ? 'P1 Малий обсяг' : 'P1 Low volume'}</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">6</TableCell>
                <TableCell>{ua ? 'Черга Flagged for Decline (FfD) -- чиста формальність: 16 год/міс на ручне підтвердження, а override rate лише 7%.' : 'Flagged for Decline (FfD) queue is just rubber-stamping: 16 h/mo on manual confirmation, while override rate is only 7%.'}</TableCell>
                <TableCell>{ua ? 'Ємність рекрутерів' : 'Recruiter capacity'}</TableCell>
                <TableCell>{ua ? 'Андрій: 2.5 год/день; 4 екрани на кандидата' : 'Andrii: 2.5 h/day; 4 screens per candidate'}</TableCell>
                <TableCell>{ua ? '±2 дні (bulk-confirm UI + фільтр)' : '±2 days (bulk-confirm UI + filter)'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-success-bg text-success border-success-border text-xs pointer-events-none whitespace-nowrap">P2 Quick-win</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">7</TableCell>
                <TableCell>{ua ? 'QC UI: немає фільтра по routing decision, немає індексації стадій у транскриптах. Рекрутер витрачає більше часу на пошук дзвінка, ніж на сам QC.' : 'QC UI: no filter by routing decision, no stage indexing in transcripts. Recruiter spends more time finding the call than doing the QC itself.'}</TableCell>
                <TableCell>{ua ? 'Ємність рекрутерів' : 'Recruiter capacity'}</TableCell>
                <TableCell>{ua ? 'Фідбек Юлії + Марини; Марина кинула QC на півдорозі' : 'Yulia + Maryna feedback; Maryna gave up on QC mid-way'}</TableCell>
                <TableCell>{ua ? '±1 тиждень (routing filter + stage indexing)' : '±1 week (routing filter + stage indexing)'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-success-bg text-success border-success-border text-xs pointer-events-none whitespace-nowrap">P2 Quick-win</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">8</TableCell>
                <TableCell>{ua ? "Voice/TTS + якість контенту: роботизований голос, 'Cuber-NEE-ties', 'React Jessup', 'Redux in Node.js'. Немає механізму повтору для 208 дзвінків із тех. збоями." : 'Voice/TTS + content quality: robotic, "Cuber-NEE-ties", "React Jessup", "Redux in Node.js". No retry mechanism on the 208 tech-issue calls.'}</TableCell>
                <TableCell>{ua ? 'Довіра кандидатів, top-of-funnel' : 'Candidate trust, top-of-funnel'}</TableCell>
                <TableCell>{ua ? "12 'стресових' vs 16 'сподобалось' (змішано); 8 'дзвінок обірвався, не можу повторити'" : '12 "stressful" vs 16 "loved it" (mixed); 8 "call dropped, can\'t redo"'}</TableCell>
                <TableCell>{ua ? '±1 день (вимова + QA питань)' : '±1 day (pronunciation + question QA)'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-success-bg text-success border-success-border text-xs pointer-events-none whitespace-nowrap">P2</Badge></TableCell>
              </TableRow>
            </TableBody>
          </DocTable>

          <Callout variant="warning" title={ua ? 'Чому #1 = точність Mark Pass (а не витік рейту)' : 'Why #1 = Mark Pass precision (and not Rate leak)'}>
            {ua
              ? "Точність Mark Pass -- структурна проблема: поки auto-advance дає 50% хибно-позитивних, рекрутери змушені QC-ти кожен Mark Pass -- автоматизація не звільняє ємності, і 150 наймів/місяць залишається недосяжним. Витік рейту терміновіший і простіший у виправленні, тому відвантажуємо його як P0 quick-win. Але це локальний фікс, а не структурний."
              : 'Mark Pass precision is the structural problem: as long as auto-advance produces 50% false positives, recruiters must QC every Mark Pass -- automation frees no capacity, and 150 hires/month stays out of reach. The rate leak is more urgent and easier to fix, so we ship it as a P0 quick-win. But it\'s a local fix, not a structural one.'
            }
          </Callout>
        </DocBlock>
      </section>

      {/* ── 02 ──────────────────────────────────────────────────────────────── */}
      <DocSection num="02" title={ua ? 'Першопричина топ-проблеми' : 'Root Cause of Top Priority'}>

        <DocBlock title={ua ? 'Точність Mark Pass 50% -- Гіпотеза' : 'Mark Pass precision 50% -- Hypothesis'}>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {ua
              ? "Mark не 'злегка розкалібрований'. 3 з його 8 стадій фундаментально зламані: перевірка English, заявки на роль/сеньорність і skill probe. Це не проблема порогу -- це відсутній рубрик і відсутня крос-валідація з CV."
              : 'Mark isn\'t "slightly miscalibrated". 3 of its 8 stages are fundamentally broken: English check, role/seniority claims, and skills probe. This isn\'t a threshold problem -- it\'s a missing rubric and no cross-validation against the CV.'
            }
          </p>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{ua ? 'Стадія' : 'Stage'}</TableHead>
                <TableHead>{ua ? 'Статус' : 'Status'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>{ua ? 'Вступ' : 'Intro'}</TableCell>
                <TableCell>{ua ? 'English check -- прихована суб-перевірка на всіх стадіях, перші сигнали тут' : 'English check is a hidden sub-check within all stages but first signals are here'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>{ua ? 'Переваги проекту' : 'Project preferences'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-destructive-bg text-destructive border-destructive/30 text-xs pointer-events-none">UX issue (38% drop)</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>3</TableCell>
                <TableCell>{ua ? 'Уточнення ролі' : 'Role clarification'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-destructive-bg text-destructive border-destructive/30 text-xs pointer-events-none">{ua ? 'Зламано -- немає перевірки заявок з CV' : 'Broken -- No Claims vs CV check'}</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>4</TableCell>
                <TableCell>{ua ? 'Перевірка навичок' : 'Skills verification'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-destructive-bg text-destructive border-destructive/30 text-xs pointer-events-none">{ua ? 'Зламано -- Mark приймає шаблонні відповіді' : 'Broken -- Mark accepts templated answers'}</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>5</TableCell>
                <TableCell>{ua ? 'Обговорення рейту' : 'Rate discussion'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-brand-bg text-brand border-brand/30 text-xs pointer-events-none">{ua ? 'Витік (розкриває внутрішній діапазон -- Проблема #2)' : 'Leak (shares internal range -- Problem #2)'}</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>6</TableCell>
                <TableCell>{ua ? 'Доступність і логістика' : 'Availability & logistics'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-success-bg text-success border-success-border text-xs pointer-events-none">Ok</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>7</TableCell>
                <TableCell>{ua ? 'Оцінка soft skills' : 'Soft skills probe'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-success-bg text-success border-success-border text-xs pointer-events-none">Ok</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>8</TableCell>
                <TableCell>{ua ? 'Завершення' : 'Close'}</TableCell>
                <TableCell><Badge variant="outline" className="bg-success-bg text-success border-success-border text-xs pointer-events-none">Ok</Badge></TableCell>
              </TableRow>
            </TableBody>
          </DocTable>
        </DocBlock>

        <DocBlock title={ua ? "Ланцюг міркувань: 3 зламані стадії Mark" : "Chain of Reasoning: Mark's 3 Broken Stages"}>
          <DocRisks items={[
            {
              level: 'high',
              badge: 'English check',
              title: ua ? 'Немає явного рубрика -- перші сигнали на Intro' : 'No explicit rubric -- first signals at Intro',
              text: ua
                ? "English check не є іменованою стадією в специфікації -- перевірка імпліцитна, перші сигнали на Intro. За замовчуванням Voice LLM-и оцінюють 'відповів vs не відповів', а не рівень вільності мовлення. Без 3-рівневого рубрика (A1-2 / B1 / B2+), прив'язаного до конверсаційних тригерів, Mark не розпізнає рівень English. → Олена: 5 випадків Mark Pass з A2 English за один тиждень."
                : 'English check isn\'t a named stage in the spec -- the check is implicit, with first signals captured at Intro. By default, Voice LLMs judge "answered vs. didn\'t answer," not fluency level. Without a 3-tier rubric (A1-2 / B1 / B2+) tied to conversational triggers, Mark doesn\'t catch the level of English. → Olena: 5 Mark Pass cases with A2 English in one week.',
            },
            {
              level: 'high',
              badge: 'Role clarification',
              title: ua ? 'Не крос-перевіряє заявки з CV' : "Doesn't cross-check claims against the CV",
              text: ua
                ? "Mark отримує структуровані дані профілю з розпарсеного CV, але промпт не вимагає порівнювати 'кандидат заявляє senior' з graduation_year + employment history. → Олена: кандидат, який заявив senior через 2 роки після університету без попереднього досвіду, пройшов перевірку."
                : 'Mark receives structured profile data from the parsed CV, but the prompt doesn\'t require comparing "candidate claims senior" against graduation_year + employment history. → Olena: a candidate claiming senior 2 years after graduation with zero prior experience passed.',
            },
            {
              level: 'high',
              badge: 'Skill probe',
              title: ua ? 'Приймає загальні відповіді -- класичний LLM failure mode' : 'Accepts generic answers -- classic LLM failure mode',
              text: ua
                ? "Юлія зафіксувала Mark Pass на: 'Так, у мене великий досвід з React. Я працював над багатьма React-проектами.' Ключове слово + стверджувальний тон → Pass, без жодного уточнюючого питання ('наведи приклад бага, який ти виправив', 'компроміс, з яким ти стикнувся'). Cooperative agent винагороджує кількість тексту > якість."
                : 'Yulia caught a Mark Pass on: "Yes, I have extensive experience in React. I have worked on many React projects." Keyword + affirmative tone → Pass, with no follow-up probe ("give me an example of a bug you fixed," "a trade-off you faced"). Cooperative agent rewards a lot of text > quality.',
            },
          ]} />
        </DocBlock>

        <DocBlock title={ua ? 'Кількісне підтвердження' : 'Quantitative Confirmation'}>
          <DocRisks items={[
            {
              level: 'high',
              badge: 'Auto-advance',
              title: ua ? 'Auto-advance = точність 50%' : 'Auto-advance = 50% precision',
              text: ua
                ? "Auto-advance (AI-trusted fast-track) = Mark Pass + Coderbyte Pass + чистий scam score. З 60 auto-advance кейсів 30 пройшли QC → 15 відхилено (точність 50%). Це ±30 хибно-позитивних/міс × 20 хв = ±10 год витраченого часу рекрутерів + додаткове навантаження на tech interview."
                : 'Auto-advance (AI-trusted fast-track) = Mark Pass + Coderbyte Pass + clean scam score. Of the 60 auto-advance cases, 30 were QC\'d → 15 downgraded to Reject (50% precision). That\'s ±30 false positives per month × 20 min = ±10h of wasted recruiter time, plus extra load on the downstream tech interview.',
            },
            {
              level: 'watch',
              badge: 'Need Review',
              title: ua ? '120 рішень advance з Need Review -- без QC' : '120 advance decisions out of Need Review -- no QC run',
              text: ua
                ? "50% advance rate -- без жодного QC. Юлія: 9 з 10 (??) Mark Unclear кейсів -- просто кандидати, які просили повторити питання. Реальна точність, мабуть, аналогічна auto-advance."
                : '50% advance rate -- no QC has been run on these. Yulia: 9 out of 10 (??) Mark Unclear cases were just candidates asking to repeat the question. True precision is likely similar to auto-advance.',
            },
            {
              level: 'watch',
              badge: 'Asymmetric error',
              title: ua ? 'Асиметрична помилка -- шумна межа рішень' : 'Asymmetric error -- noisy decision boundary',
              text: ua
                ? "Mark Reject + Coderbyte Pass overridden у 73% випадків, тоді як Mark Pass + Coderbyte Reject -- лише у 8%. Mark одночасно надто суворий на граничних кейсах і надто м'який на основному шляху. Це не зсунутий поріг -- шумна межа рішень. Виправляється рубриком, а не зміщенням cutoff."
                : 'Mark Reject + Coderbyte Pass is overridden 73% of the time, while Mark Pass + Coderbyte Reject is overridden only 8%. Mark is simultaneously too strict on edge cases and too lenient on the main path. This isn\'t a shifted threshold -- it\'s a noisy decision boundary. Fixed with a rubric, not by moving the cutoff.',
            },
          ]} />
        </DocBlock>

        <DocBlock title={ua ? 'Контр-аргументи (розглянуті та відхилені)' : 'Counter-Evidence (Considered and Rejected)'}>
          <DocRisks items={[
            {
              level: 'low',
              badge: 'Sampling bias',
              title: ua ? 'Упередженість вибірки QC' : 'QC sampling bias',
              text: ua
                ? "30 з 60 зразків могли бути відібрані як 'підозрілі', а не випадково. Валідація: на тижні 1 провести рандомний QC по всій auto-advance популяції для перевірки baseline."
                : 'The 30 of 60 samples may have been hand-picked as "suspicious" rather than drawn at random. Validation: in week 1, run random QC across the full auto-advance population to validate the baseline.',
            },
            {
              level: 'low',
              badge: 'Coderbyte',
              title: ua ? 'Coderbyte винен?' : 'Is Coderbyte to blame?',
              text: ua
                ? "Ні. Він тестує здатність до кодування, що ортогонально до failure modes з English / сеньорністю / skill-probe."
                : 'No. It tests coding ability, which is orthogonal to the English / seniority / skill-probe failure modes.',
            },
            {
              level: 'low',
              badge: 'Recruiter bias',
              title: ua ? 'Рекрутери надто суворі?' : 'Are recruiters being too strict?',
              text: ua
                ? "Цитати кандидатів об'єктивно підтверджують шаблонні відповіді та фіктивну сеньорність -- це не суб'єктивні оцінки рекрутерів, це спостережувані failure modes."
                : 'Candidate quotes objectively confirm templated answers and fake seniority -- these aren\'t recruiter judgment calls, they\'re observable failure modes.',
            },
          ]} />
        </DocBlock>

        <DocBlock>
          <Callout variant="primary" title={ua ? 'Чому це блокує umbrella goal' : 'Why this blocks the umbrella goal'}>
            {ua
              ? "Throughput -- 104 з 150 = 69%. Завантаженість рекрутерів -- 53% (3 400 з 6 400 хв) -- потенціал є, але він з'їдається обов'язковим QC кожного Mark Pass. Піднімаємо точність до 90% → прибираємо QC → розширюємо auto-advance з 9% до 25%+ → звільняємо ємність для нових дзвінків. Точність Mark = ключ до розблокування."
              : "Throughput is 104 of 150 = 69%. Recruiter capacity is at 53% utilization (3,400 of 6,400 min) -- there's potential, but it's eaten by mandatory QC on every Mark Pass. Lift precision to 90% → drop the QC → expand auto-advance share from 9% to 25%+ → free up capacity for new calls. Mark precision = the key unlock."
            }
          </Callout>
        </DocBlock>

      </DocSection>

      {/* ── 03 ──────────────────────────────────────────────────────────────── */}
      <DocSection num="03" title={ua ? 'Що я б збудував або змінив' : "What I'd Build or Change"}>

        <DocBlock title={ua ? 'Фокус: Оцінка Mark і Hardening рубрика' : 'Focus: Mark Evaluation and Rubric Hardening'}>
          <Callout variant="primary">
            {ua
              ? 'Ціль: підняти точність auto-advance з 50% до >80% за 4 тижні без збільшення обсягу QC рекрутерів.'
              : 'Goal: lift auto-advance precision from 50% to >80% in 4 weeks, without growing the recruiter QC.'
            }
          </Callout>
        </DocBlock>

        <DocBlock title={ua ? 'Фаза 1: Оцінка -- тиждень 1 (1 BE + QA)' : 'Phase 1: Evaluation -- week 1 (1 BE + QA)'}>
          <DocFlow steps={[
            {
              num: '1',
              title: ua ? 'Побудувати labeled eval dataset (200 транскриптів)' : 'Build labeled eval dataset (200 transcripts)',
              text: ua
                ? 'Стратифіковано: 50 auto-advance + 50 Need Review + 50 Flagged for Decline + 50 hangups. Ground truth = вердикт QC рекрутера + рішення після дзвінка.'
                : 'Stratified: 50 auto-advance + 50 Need Review + 50 Flagged for Decline + 50 hangups. Ground truth = recruiter QC verdict + post-recruiter-call decision.',
            },
            {
              num: '2',
              title: ua ? 'Запустити поточний промпт Mark на golden set' : "Run Mark's current prompt against the golden set",
              text: ua
                ? 'Отримати stage-level baseline precision/recall (English check, role clarification, skills verification, rate, soft skills). Побудувати дашборд.'
                : 'Produce stage-level baseline precision/recall (English check, role clarification, skills verification, rate, soft skills). Build a dashboard.',
            },
          ]} />
        </DocBlock>

        <DocBlock title={ua ? 'Фаза 2: Цільові фікси -- тижні 2–3 (паралельні треки)' : 'Phase 2: Targeted Fixes -- weeks 2–3 (parallel tracks)'}>
          <DocFlow steps={[
            {
              num: 'A',
              title: ua ? 'English рубрик (1 BE)' : 'English rubric (1 BE)',
              text: ua
                ? 'Додати явну 3-крокову перевірку English до промпту + post-call LLM-суддя (A1-2 / B1 / B2+ classifier) на транскрипті. Якщо суддя повертає ≤ B1 → понижуємо Pass → Unclear.'
                : 'Add an explicit 3-step English check to the prompt + a post-call LLM-judge (A1-2 / B1 / B2+ classifier) running on the transcript. If the judge returns ≤ B1 → downgrade Pass → Unclear.',
            },
            {
              num: 'B',
              title: ua ? 'Крос-перевірка CV (1 BE)' : 'CV cross-reference (1 BE)',
              text: ua
                ? "Жорстка структурна guardrail на рівні routing engine. Якщо кандидат заявляє 'senior/lead' І (current_year − graduation_year < 4 АБО total_employment < 4) → примусово Unclear, навіть якщо Mark повертає Pass. Не LLM-виклик -- звичайне правило на розпарсеному CV. Дешевше і надійніше."
                : 'A hard structural guardrail at the routing-engine level. If the candidate claims "senior/lead" AND (current_year − graduation_year < 4 OR total_employment < 4) → force Unclear, even when Mark returns Pass. Not an LLM call -- a plain rule on the parsed CV. Cheaper and more reliable.',
            },
            {
              num: 'C',
              title: ua ? 'Якість skill probe (shared)' : 'Skill probe quality (shared)',
              text: ua
                ? "Для кожної заявленої навички вимагати конкретний приклад ('розкажи про проблему, яку ти вирішував'). Post-call LLM-суддя оцінює суть відповіді (specific / templated / uncertain). Templated → понижуємо."
                : 'For every claimed skill, require a concrete example ("tell me about a problem you solved"). A post-call LLM-judge scores the substance (specific / templated / uncertain). Templated → downgrade.',
            },
            {
              num: '/',
              title: ua ? 'A/B routing layer (1 BE, ~3 дні)' : 'A/B routing layer (1 BE, ~3d)',
              text: ua
                ? "Специфікація каже 'no A/B infra' -- без нього неможливо валідувати до відвантаження. Мінімальний hash-router (candidate_id % 100) -- в скоупі."
                : 'The spec says "no A/B infra" -- without it, we can\'t validate before we ship. A minimal hash-router (candidate_id % 100) is in scope.',
            },
          ]} />
        </DocBlock>

        <DocBlock title={ua ? 'Фаза 3: Shadow + Ship -- тиждень 4' : 'Phase 3: Shadow + Ship -- week 4'}>
          <DocFlow steps={[
            {
              num: '1',
              title: 'Shadow mode',
              text: ua
                ? "Новий промпт працює паралельно з production на live-трафіку; його рішення логується, але не застосовується."
                : "The new prompt runs in parallel with production on live traffic; its decision is logged but not acted on.",
            },
            {
              num: '2',
              title: ua ? 'Критерії для відвантаження' : 'Ship criteria',
              text: ua
                ? 'Якщо точність auto-advance досягає ≥80% І точність Mark Reject досягає ≥75% (або +20pp над baseline) → рампуємо до 50% через A/B → повне відвантаження тиждень потому. Інакше -- ще 2 тижні ітерацій.'
                : 'If auto-advance precision hits ≥80% AND Mark Reject precision hits ≥75% (or +20pp over baseline) → ramp to 50% via A/B → full ship a week later. Otherwise -- another 2-week iteration.',
            },
          ]} />
        </DocBlock>

        <DocBlock title={ua ? 'Метрики, які ми відстежуємо' : 'Metrics We Track'}>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Метрика' : 'Metric'}</TableHead>
                <TableHead>Baseline</TableHead>
                <TableHead>{ua ? 'Ціль на 4 тижні' : '4-week target'}</TableHead>
                <TableHead>{ua ? 'Квартальна ціль' : 'Quarterly target'}</TableHead>
                <TableHead>{ua ? 'Навіщо' : 'Why'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">{ua ? 'Точність auto-advance (post-QC pass rate)' : 'Auto-advance precision (post-QC pass rate)'}</TableCell>
                <TableCell>50%</TableCell><TableCell>≥80%</TableCell><TableCell>≥90%</TableCell>
                <TableCell>North-star</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{ua ? 'Точність Mark Reject (1 − override rate на Mark Rej + Coderbyte Pass)' : 'Mark Reject precision (1 − override rate on Mark Rej + Coderbyte Pass)'}</TableCell>
                <TableCell>27%</TableCell><TableCell>≥75%</TableCell><TableCell>≥90%</TableCell>
                <TableCell>Anti-bias</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{ua ? 'Точність Mark Unclear (% Unclear = true)' : 'Mark Unclear precision (% Unclear = true)'}</TableCell>
                <TableCell>~10% (??)</TableCell><TableCell>≥60%</TableCell><TableCell>≥80%</TableCell>
                <TableCell>{ua ? 'Навантаження черги →' : 'Queue load →'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{ua ? 'Години рекрутера на одного dev' : 'Recruiter hours per vetted dev'}</TableCell>
                <TableCell>1.3h</TableCell><TableCell>1.1h</TableCell><TableCell>≤1.0h</TableCell>
                <TableCell>{ua ? 'Ємність' : 'Capacity'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{ua ? 'Найми/місяць' : 'Hires/month'}</TableCell>
                <TableCell>104</TableCell><TableCell>120</TableCell><TableCell>150</TableCell>
                <TableCell>Umbrella</TableCell>
              </TableRow>
            </TableBody>
          </DocTable>
        </DocBlock>

        <DocBlock title={ua ? 'Залежності і ризики' : 'Dependencies and Risks'}>
          <DocRisks items={[
            {
              level: 'high',
              badge: 'A/B layer',
              title: ua ? "Обов'язковий -- вже в скоупі Фази 2" : 'Required -- already in Phase 2 scope',
              text: ua
                ? "Без нього неможливо валідувати до відвантаження. Якщо інженери кажуть '3 тижні, а не 3 дні' → відвантажуємо з shadow-only валідацією (гірше, але прийнятно)."
                : "Without it, there's no way to validate before shipping. If engineering tells us it's \"3 weeks, not 3 days\" → we ship with shadow-only validation (worse, but workable).",
            },
            {
              level: 'watch',
              badge: "Mark's LLM stack",
              title: ua ? 'Підтримка tool-calling впливає на реалізованість Track B' : 'Tool-calling support affects Track B feasibility',
              text: ua
                ? "Якщо поточна модель не підтримує tool-calling, Track B (крос-перевірка CV) ускладнюється. Мітигація: структурна guardrail поза LLM (на рівні routing layer) -- перевірений підхід."
                : "If the current model doesn't support tool-calling, Track B (CV cross-reference) gets harder. Mitigation: structural guardrail outside the LLM (at the routing layer, on the parsed CV) -- a proven approach.",
            },
            {
              level: 'low',
              badge: 'Design dependency',
              title: ua ? 'Відсутня' : 'None',
              text: ua
                ? 'Всі зміни -- промпт + backend + не-візуальний рубрик. UX-покращення для рекрутерів -- у quick-wins (дизайнер не потрібен).'
                : 'All changes are prompt + backend + non-visual rubric. Recruiter-side UX improvements live in the quick-wins (no designer needed).',
            },
          ]} />
        </DocBlock>

      </DocSection>

      {/* ── 04 ──────────────────────────────────────────────────────────────── */}
      <DocSection num="04" title={ua ? 'Бонус: Quick-wins для паралельного відвантаження' : 'Bonus: Quick-Wins to Ship Alongside'}>

        <DocBlock title={ua ? 'QW-1. Фікс промпту -- витік рейту (1 BE × 0.5 дня + QA 0.5 дня)' : 'QW-1. Rate-Leak Prompt Fix (1 BE × 0.5d + QA 0.5d)'}>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong className="text-foreground">{ua ? 'Що:' : 'What:'}</strong>{' '}
            {ua
              ? "Оновити системний промпт явною політикою: 'Ніколи не розкривай діапазони рейтів або типові цифри. Якщо запитують, відбий: «Рейт -- частина обговорення офферу з рекрутером. Який рейт шукаєте ВИ?»' Додати regression test на 23 відомих транскрипти (вибірка Марини)."
              : "Update system prompt with explicit policy: \"Never disclose rate ranges or typical numbers. If asked, deflect: 'Rate is part of the offer discussion with the recruiter. What rate are YOU looking for?'\" Add a regression test on 23 known-case transcripts (Maryna's pull)."
            }
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong className="text-foreground">{ua ? 'Метрика:' : 'Metric:'}</strong>{' '}
            {ua
              ? '% дзвінків з розкриттям рейту. Ціль <2% протягом тижня (30 дзвінків вручну, потім keyword detector по транскриптах).'
              : '% of calls with rate disclosure. Target <2% within one week (sample 30 calls manually, then keyword detector across transcripts).'
            }
          </p>
          <Callout variant="primary" title={ua ? 'Вплив' : 'Impact'}>
            {ua
              ? 'Відновлюємо маржу на 5–6 офферах/міс. При $5/год дельта × 40 год × 4 тижні = $800/dev/міс → ±$4–5K/міс базово + compounding зі зростанням.'
              : 'Restore margin on 5–6 offers/mo. At $5/h delta × 40h × 4w = $800/dev/mo → ±$4–5K/mo base + compounding as we scale.'
            }
          </Callout>
        </DocBlock>

        <DocBlock title={ua ? 'QW-2. Bulk-confirm + sticky filter для Flagged for Decline (1 FE × 2 дні)' : 'QW-2. Flagged for Decline Bulk-Confirm + Sticky Filter (1 FE × 2d)'}>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong className="text-foreground">{ua ? 'Що:' : 'What:'}</strong>{' '}
            {ua
              ? "Чекбокси поруч з кожним кейсом + кнопка 'Підтвердити обрані' + клавіатурні скорочення ('C' -- підтвердити, 'O' -- перенести на review). Фільтр 'показати тільки DISQUAL, scamScore 90–100'. Override rate лише 7% → 93% флагів коректні, можна безпечно прискорити."
              : "Checkboxes next to each case + \"Confirm selected\" button + keyboard shortcuts ('C' to confirm, 'O' to override to review). Filter \"show only DISQUAL, scamScore 90–100\". Override rate is only 7% → 93% of flags are correct, safe to accelerate."
            }
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">{ua ? 'Метрика:' : 'Metric:'}</strong>{' '}
            {ua
              ? 'Медіанний час на один Flagged for Decline кейс. Ціль <1 хв (зараз 4 хв). Економить ±12 год/міс часу рекрутерів = ємність на ±30 додаткових Need Review кейсів.'
              : 'Median time per Flagged for Decline case. Target <1 min (down from 4 min). Saves ±12h/mo of recruiter time = capacity for ±30 additional Need Review cases.'
            }
          </p>
        </DocBlock>

        <DocBlock title={ua ? 'QW-3. Пріоритизація Need Review + soft SLA (1 FE + 1 BE × 3 дні)' : 'QW-3. Need Review Prioritization + Soft SLA (1 FE + 1 BE × 3d)'}>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong className="text-foreground">{ua ? 'Що:' : 'What:'}</strong>{' '}
            {ua
              ? "Додати формулу пріоритизації, яка сортує кейси за двома сигналами -- як довго чекають + наскільки ймовірний advance (Mark Pass + Coderbyte Pass = high). Рекрутер бачить пріоритетні кейси вгорі черги з бейджем 'Likely Advance'. Кандидати, які чекають більше 5 днів, отримують автоматичний email: 'Ще на розгляді, очікуйте оновлення до [дата+3]' -- сигнал довіри, не жорстке SLA."
              : "Add a priority formula that sorts cases by two signals -- how long they've waited + how likely they are to advance (Mark Pass + Coderbyte Pass = high). Recruiter sees high-priority cases at the top of the queue, with a \"Likely Advance\" badge on easy wins. Candidates waiting more than 5 days get an automatic email: \"Still under review, expect an update by [date+3]\" -- a trust signal, not a hard SLA."
            }
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">{ua ? 'Метрика:' : 'Metric:'}</strong>{' '}
            {ua
              ? 'Медіанний час у черзі <5 днів; <10% кейсів чекають >7 днів. Підвищення задоволеності кандидатів.'
              : 'Median time-in-queue <5 days; <10% of cases waiting >7 days. Lift in candidate satisfaction.'
            }
          </p>
        </DocBlock>

        <DocBlock title={ua ? 'Один сюрприз + одне питання до команди перед Днем 0' : 'One Surprise + One Question Before Day 0'}>
          <Callout variant="warning" title={ua ? 'Сюрприз' : 'Surprise'}>
            {ua
              ? <>Mark Reject + Coderbyte Pass overridden у 73% випадків, тоді як Mark Pass + Coderbyte Reject -- лише у 8%. Mark одночасно надто суворий на граничних кейсах (Андрій: кандидат відхилений через паузу 8 сек) і надто м'який на основному шляху (50% хибно-позитивних в auto-advance). Це не зсунутий поріг -- шумна межа рішень. Виправляється рубриком, а не зміщенням cutoff.<br /><br />
              Бонус: стадія 2, 'project preferences', має найвищий відтік (38%) -- хоча це найнейтральніша стадія в дзвінку. Mark тисне на конкретику, і гнучкі кандидати йдуть. Відтік конверсії в несподіваному місці.</>
              : <>Mark Reject + Coderbyte Pass is overridden 73% of the time, while Mark Pass + Coderbyte Reject only 8%. Mark is simultaneously too strict on edge cases (Andrii: a candidate rejected for an 8-sec pause) and too lenient on the main path (50% false positives in auto-advance). This isn't a shifted threshold -- it's a noisy decision boundary. Fixed with a rubric, not by moving the cutoff.<br /><br />
              Bonus: stage 2, "project preferences," has the highest drop (38%) -- even though it's the most neutral stage in the call. Mark pushes for specifics, and flexible candidates walk away. A conversion leak in an unexpected place.</>
            }
          </Callout>
          <Callout variant="primary" title={ua ? 'Питання до команди на День 0' : 'Question to the team on Day 0'}>
            {ua
              ? <>"Чи є вже labeled dataset дзвінків Mark із рішеннями рекрутерів (з повного post-call review)? Якщо ні -- це блокер #1, і ми будуємо його на тижні 1. Якщо так -- де він, який розмір, які мітки?"<br /><br />
              Без eval set неможливо вимірювати precision/recall при будь-яких змінах -- кожне 'покращення промпту' стає wishful thinking. Бонусне питання: який LLM / voice стек у Mark, і він підтримує tool-calling? Це визначає реалізованість Track B.</>
              : <>"Is there already a labeled dataset of Mark calls with ground-truth recruiter decisions (from full post-call review)? If not -- that's blocker #1, and we build it in week 1. If yes -- where is it, what size, what labels?"<br /><br />
              Without an eval set, we can't measure precision/recall on any change -- every "prompt improvement" becomes wishful thinking. Bonus question: what's Mark's LLM / voice stack, and does it support tool-calling? That determines the feasibility of Track B.</>
            }
          </Callout>
        </DocBlock>

        <DocBlock title={ua ? "Що я не знаю" : "What I Don't Know"}>
          <DocRisks items={[
            {
              level: 'watch',
              badge: 'Sampling',
              title: ua ? 'Як насправді відбиралися 30 з 60 QC зразків' : 'How the 30 of 60 QC sample was actually selected',
              text: ua
                ? "Рандомно чи відбирались 'підозрілі' -- впливає на 50% baseline. Валідація: рандомний QC по всій auto-advance популяції на тижні 1."
                : 'Random or cherry-picked as suspicious -- affects the 50% baseline. Validation: run random QC across the full auto-advance population in week 1.',
            },
            {
              level: 'watch',
              badge: 'Unclear reasons',
              title: ua ? 'Реальний розподіл причин Mark Unclear' : 'Real breakdown of Mark Unclear reasons',
              text: ua
                ? "Юлія 'з 9 з 10' -- занадто мала вибірка; потрібна категоризація по 100+ кейсах."
                : "Yulia's \"9 of 10\" is too small; we need categorization across 100+ cases.",
            },
            {
              level: 'watch',
              badge: 'Call cost',
              title: ua ? 'Вартість одного дзвінка Mark (Vapi.ai + токени)' : 'Cost of one Mark call (Vapi.ai + tokens)',
              text: ua
                ? 'Впливає на пріоритизацію retry-on-tech-issue.'
                : 'Affects how we prioritize retry-on-tech-issue.',
            },
            {
              level: 'watch',
              badge: 'Marketing push',
              title: ua ? 'Вплив маркетингового push (×3 обсяг) на якість реєстрацій' : 'Effect of the 3× volume marketing push on signup quality',
              text: ua
                ? 'Потрібна сегментація по каналах, інакше baseline відтік частково пояснюється ним, а не Mark.'
                : 'Needs segmentation by channel, otherwise baseline drop-off is partly explained by it, not by Mark.',
            },
          ]} />
        </DocBlock>

      </DocSection>

    </DocLayout>
  )
}
