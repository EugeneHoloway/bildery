'use client'

import { DocLayout }    from '@/components/doc/DocLayout'
import { DocSection }   from '@/components/doc/DocSection'
import { DocBlock }     from '@/components/doc/DocBlock'
import { Callout }      from '@/components/doc/Callout'
import { DocFlow }      from '@/components/doc/DocFlow'
import { DocRisks }     from '@/components/doc/DocRisks'
import { DocTable, DocTableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/doc/DocTable'
import { Badge }        from '@/components/ui/badge'

export default function Page() {
  return (
    <DocLayout
      title="Vetting Flow Iteration | Lemon.io"
      breadcrumbLabel="Sandbox"
      breadcrumbHref="/sandbox"
      tags={[
        { label: 'PM Test Task',      type: 'tag' },
        { label: 'Vetting Flow',      type: 'tag' },
        { label: 'AI Interviewer',    type: 'tag' },
      ]}
      description="Problem inventory, root-cause analysis of Mark's 50% false-positive rate, and a 4-week hardening plan | By Yevhenii Holovei"
      footnote="PM Test Task -- Vetting Flow Iteration | Author: Yevhenii Holovei | Focus: Mark Evaluation & Rubric Hardening | Goal: lift auto-advance precision 50% → 80%+"
    >

      {/* 01 -- Problem Inventory */}
      <DocSection num="01" title="Problem Inventory & Prioritization">

        <DocBlock
          title="Framework: Impact × Confidence × Urgency / Effort"
          subtitle="Where: Impact = effect on 4 business metrics (throughput: hires/month, recruiter capacity, candidate trust, margin per hire) · Confidence = is the problem proven? · Urgency = will the impact grow if we delay? · Effort = engineering weeks (2 BE + 1 FE + 1 QA, no designer)"
        >
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Problem</TableHead>
                <TableHead>What suffers</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead>Effort</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">1</TableCell>
                <TableCell>Mark Pass is broken: 50% of auto-advance candidates downgraded after recruiter QC. (English / role-claims / skill-probe stages).</TableCell>
                <TableCell>Recruiter capacity, throughput vs 150/mo goal</TableCell>
                <TableCell>15 of 30 reviewed downgraded to Reject (50%): Olena: 5 cases of Mark Pass with A2 English in a single week; Yulia: Mark passes scripted answers (3+ similar caught in standup notes)</TableCell>
                <TableCell>±4 weeks</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-destructive-bg text-destructive border-destructive/30 text-xs pointer-events-none whitespace-nowrap">
                    P0 Top
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">2</TableCell>
                <TableCell>Mark discloses the internal rate range to candidates (74%).</TableCell>
                <TableCell>Margin per hire, ~5–6 lost offers/mo</TableCell>
                <TableCell>Maryna: 17 of 23 cases (74%) in the past 30 days. After hearing the range, candidates push for the top of it instead of their original ask. 5–6 lost offers based on Maryna's estimate.</TableCell>
                <TableCell>±0.5 day (prompt change)</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-destructive-bg text-destructive border-destructive/30 text-xs pointer-events-none whitespace-nowrap">
                    P0 Quick-win
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">3</TableCell>
                <TableCell>Mark call completion only 54% (hangups 27% + tech issues 13% + agent-ended 6%). Biggest drop (38%) on stage 2/8 -- "project preferences".</TableCell>
                <TableCell>Top-of-funnel conversion, candidate trust</TableCell>
                <TableCell>736 lost out of 1600 · candidate quotes call it "pushy" · no retry after tech failures (208 candidates)</TableCell>
                <TableCell>±2–3 weeks (stage-2 prompt fix + retry for tech-issue)</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-brand-bg text-brand border-brand/30 text-xs pointer-events-none whitespace-nowrap">
                    P1
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">4</TableCell>
                <TableCell>Need Review queue overflow: 160 of 400 waiting up to 14 days. No SLA, FIFO, no prioritization.</TableCell>
                <TableCell>Candidate trust, time-to-matching</TableCell>
                <TableCell>Olena: "queue grows by 20–25/day, we clear 8–10" · Kostyantyн: "I don't know the priority order"</TableCell>
                <TableCell>±1–2 weeks (scoring engine + SLA)</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-brand-bg text-brand border-brand/30 text-xs pointer-events-none whitespace-nowrap">
                    P1
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">5</TableCell>
                <TableCell>Mark Reject false positives: 73% override rate on Mark Reject + Coderbyte Pass. Mark is overly strict on pauses and re-asks.</TableCell>
                <TableCell>Throughput (false rejects)</TableCell>
                <TableCell>11 of 15 overridden · Andrii: 8-sec pause → Mark flagged "shady"</TableCell>
                <TableCell>±1 week (Reject criteria + regression test)</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-brand-bg text-brand border-brand/30 text-xs pointer-events-none whitespace-nowrap">
                    P1 Low volume
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">6</TableCell>
                <TableCell>Flagged for Decline (FfD) queue is just rubber-stamping: 16 h/mo on manual confirmation, while override rate is only 7%.</TableCell>
                <TableCell>Recruiter capacity</TableCell>
                <TableCell>Andrii: 2.5 h/day; 4 screens per candidate</TableCell>
                <TableCell>±2 days (bulk-confirm UI + filter)</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-success-bg text-success border-success-border text-xs pointer-events-none whitespace-nowrap">
                    P2 Quick-win
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">7</TableCell>
                <TableCell>QC UI: no filter by routing decision, no stage indexing in transcripts. Recruiter spends more time finding the call than doing the QC itself.</TableCell>
                <TableCell>Recruiter capacity</TableCell>
                <TableCell>Yulia + Maryna feedback; Maryna gave up on QC mid-way</TableCell>
                <TableCell>±1 week (routing filter + stage indexing)</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-success-bg text-success border-success-border text-xs pointer-events-none whitespace-nowrap">
                    P2 Quick-win
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">8</TableCell>
                <TableCell>Voice/TTS + content quality: robotic, "Cuber-NEE-ties", "React Jessup", "Redux in Node.js". No retry mechanism on the 208 tech-issue calls.</TableCell>
                <TableCell>Candidate trust, top-of-funnel</TableCell>
                <TableCell>12 "stressful" vs 16 "loved it" (mixed); 8 "call dropped, can't redo"</TableCell>
                <TableCell>±1 day (pronunciation + question QA)</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-success-bg text-success border-success-border text-xs pointer-events-none whitespace-nowrap">
                    P2
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </DocTable>

          <Callout variant="warning" title="Why #1 = Mark Pass precision (and not Rate leak)">
            Mark Pass precision is the structural problem: as long as auto-advance produces 50% false positives, recruiters must QC every Mark Pass -- automation frees no capacity, and 150 hires/month stays out of reach. The rate leak is more urgent and easier to fix, so we ship it as a P0 quick-win. But it's a local fix, not a structural one.
          </Callout>
        </DocBlock>

      </DocSection>

      {/* 02 -- Root Cause */}
      <DocSection num="02" title="Root Cause of Top Priority">

        <DocBlock title="Mark Pass precision 50% -- Hypothesis">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Mark isn't "slightly miscalibrated". 3 of its 8 stages are fundamentally broken: English check, role/seniority claims, and skills probe. This isn't a threshold problem -- it's a missing rubric and no cross-validation against the CV.
          </p>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>Intro</TableCell>
                <TableCell>English check is a hidden sub-check within all stages but first signals are here</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>Project preferences</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-destructive-bg text-destructive border-destructive/30 text-xs pointer-events-none">
                    UX issue (38% drop)
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>3</TableCell>
                <TableCell>Role clarification</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-destructive-bg text-destructive border-destructive/30 text-xs pointer-events-none">
                    Broken -- No Claims vs CV check
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>4</TableCell>
                <TableCell>Skills verification</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-destructive-bg text-destructive border-destructive/30 text-xs pointer-events-none">
                    Broken -- Mark accepts templated answers
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>5</TableCell>
                <TableCell>Rate discussion</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-brand-bg text-brand border-brand/30 text-xs pointer-events-none">
                    Leak (shares internal range -- Problem #2)
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>6</TableCell>
                <TableCell>Availability & logistics</TableCell>
                <TableCell><Badge variant="outline" className="bg-success-bg text-success border-success-border text-xs pointer-events-none">Ok</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>7</TableCell>
                <TableCell>Soft skills probe</TableCell>
                <TableCell><Badge variant="outline" className="bg-success-bg text-success border-success-border text-xs pointer-events-none">Ok</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>8</TableCell>
                <TableCell>Close</TableCell>
                <TableCell><Badge variant="outline" className="bg-success-bg text-success border-success-border text-xs pointer-events-none">Ok</Badge></TableCell>
              </TableRow>
            </TableBody>
          </DocTable>
        </DocBlock>

        <DocBlock title="Chain of Reasoning: Mark's 3 Broken Stages">
          <DocRisks items={[
            {
              level: 'high',
              badge: 'English check',
              title: 'No explicit rubric -- first signals at Intro',
              text: 'English check isn\'t a named stage in the spec -- the check is implicit, with first signals captured at Intro. By default, Voice LLMs judge "answered vs. didn\'t answer," not fluency level. Without a 3-tier rubric (A1-2 / B1 / B2+) tied to conversational triggers, Mark doesn\'t catch the level of English. → Olena: 5 Mark Pass cases with A2 English in one week.',
            },
            {
              level: 'high',
              badge: 'Role clarification',
              title: "Doesn't cross-check claims against the CV",
              text: "Mark receives structured profile data from the parsed CV, but the prompt doesn't require comparing \"candidate claims senior\" against graduation_year + employment history. → Olena: a candidate claiming senior 2 years after graduation with zero prior experience passed.",
            },
            {
              level: 'high',
              badge: 'Skill probe',
              title: 'Accepts generic answers -- classic LLM failure mode',
              text: 'Yulia caught a Mark Pass on: "Yes, I have extensive experience in React. I have worked on many React projects." Keyword + affirmative tone → Pass, with no follow-up probe ("give me an example of a bug you fixed," "a trade-off you faced"). Cooperative agent rewards a lot of text > quality.',
            },
          ]} />
        </DocBlock>

        <DocBlock title="Quantitative Confirmation">
          <DocRisks items={[
            {
              level: 'high',
              badge: 'Auto-advance',
              title: 'Auto-advance = 50% precision',
              text: 'Auto-advance (AI-trusted fast-track) = Mark Pass + Coderbyte Pass + clean scam score. Of the 60 auto-advance cases, 30 were QC\'d → 15 downgraded to Reject (50% precision). That\'s ±30 false positives per month × 20 min = ±10h of wasted recruiter time, plus extra load on the downstream tech interview.',
            },
            {
              level: 'watch',
              badge: 'Need Review',
              title: '120 advance decisions out of Need Review -- no QC run',
              text: '50% advance rate -- no QC has been run on these. Yulia: 9 out of 10 (??) Mark Unclear cases were just candidates asking to repeat the question. True precision is likely similar to auto-advance.',
            },
            {
              level: 'watch',
              badge: 'Asymmetric error',
              title: 'Asymmetric error -- noisy decision boundary',
              text: 'Mark Reject + Coderbyte Pass is overridden 73% of the time, while Mark Pass + Coderbyte Reject is overridden only 8%. Mark is simultaneously too strict on edge cases and too lenient on the main path. This isn\'t a shifted threshold -- it\'s a noisy decision boundary. Fixed with a rubric, not by moving the cutoff.',
            },
          ]} />
        </DocBlock>

        <DocBlock title="Counter-Evidence (Considered and Rejected)">
          <DocRisks items={[
            {
              level: 'low',
              badge: 'Sampling bias',
              title: 'QC sampling bias',
              text: 'The 30 of 60 samples may have been hand-picked as "suspicious" rather than drawn at random. Validation: in week 1, run random QC across the full auto-advance population to validate the baseline.',
            },
            {
              level: 'low',
              badge: 'Coderbyte',
              title: 'Is Coderbyte to blame?',
              text: 'No. It tests coding ability, which is orthogonal to the English / seniority / skill-probe failure modes.',
            },
            {
              level: 'low',
              badge: 'Recruiter bias',
              title: 'Are recruiters being too strict?',
              text: 'Candidate quotes objectively confirm templated answers and fake seniority -- these aren\'t recruiter judgment calls, they\'re observable failure modes.',
            },
          ]} />
        </DocBlock>

        <DocBlock>
          <Callout variant="primary" title="Why this blocks the umbrella goal">
            Throughput is 104 of 150 = 69%. Recruiter capacity is at 53% utilization (3,400 of 6,400 min) -- there's potential, but it's eaten by mandatory QC on every Mark Pass. Lift precision to 90% → drop the QC → expand auto-advance share from 9% to 25%+ → free up capacity for new calls. Mark precision = the key unlock.
          </Callout>
        </DocBlock>

      </DocSection>

      {/* 03 -- What I'd Build */}
      <DocSection num="03" title="What I'd Build or Change">

        <DocBlock title="Focus: Mark Evaluation and Rubric Hardening">
          <Callout variant="primary">
            Goal: lift auto-advance precision from 50% to &gt;80% in 4 weeks, without growing the recruiter QC.
          </Callout>
        </DocBlock>

        <DocBlock title="Phase 1: Evaluation -- week 1 (1 BE + QA)">
          <DocFlow steps={[
            {
              num: '1',
              title: 'Build labeled eval dataset (200 transcripts)',
              text: 'Stratified: 50 auto-advance + 50 Need Review + 50 Flagged for Decline + 50 hangups. Ground truth = recruiter QC verdict + post-recruiter-call decision.',
            },
            {
              num: '2',
              title: "Run Mark's current prompt against the golden set",
              text: 'Produce stage-level baseline precision/recall (English check, role clarification, skills verification, rate, soft skills). Build a dashboard.',
            },
          ]} />
        </DocBlock>

        <DocBlock title="Phase 2: Targeted Fixes -- weeks 2–3 (parallel tracks)">
          <DocFlow steps={[
            {
              num: 'A',
              title: 'English rubric (1 BE)',
              text: 'Add an explicit 3-step English check to the prompt + a post-call LLM-judge (A1-2 / B1 / B2+ classifier) running on the transcript. If the judge returns ≤ B1 → downgrade Pass → Unclear.',
            },
            {
              num: 'B',
              title: 'CV cross-reference (1 BE)',
              text: 'A hard structural guardrail at the routing-engine level. If the candidate claims "senior/lead" AND (current_year − graduation_year < 4 OR total_employment < 4) → force Unclear, even when Mark returns Pass. Not an LLM call -- a plain rule on the parsed CV. Cheaper and more reliable.',
            },
            {
              num: 'C',
              title: 'Skill probe quality (shared)',
              text: 'For every claimed skill, require a concrete example ("tell me about a problem you solved"). A post-call LLM-judge scores the substance (specific / templated / uncertain). Templated → downgrade.',
            },
            {
              num: '/',
              title: 'A/B routing layer (1 BE, ~3d)',
              text: 'The spec says "no A/B infra" -- without it, we can\'t validate before we ship. A minimal hash-router (candidate_id % 100) is in scope.',
            },
          ]} />
        </DocBlock>

        <DocBlock title="Phase 3: Shadow + Ship -- week 4">
          <DocFlow steps={[
            {
              num: '1',
              title: 'Shadow mode',
              text: "The new prompt runs in parallel with production on live traffic; its decision is logged but not acted on.",
            },
            {
              num: '2',
              title: 'Ship criteria',
              text: 'If auto-advance precision hits ≥80% AND Mark Reject precision hits ≥75% (or +20pp over baseline) → ramp to 50% via A/B → full ship a week later. Otherwise -- another 2-week iteration.',
            },
          ]} />
        </DocBlock>

        <DocBlock title="Metrics We Track">
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Baseline</TableHead>
                <TableHead>4-week target</TableHead>
                <TableHead>Quarterly target</TableHead>
                <TableHead>Why</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">Auto-advance precision (post-QC pass rate)</TableCell>
                <TableCell>50%</TableCell>
                <TableCell>≥80%</TableCell>
                <TableCell>≥90%</TableCell>
                <TableCell>North-star</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Mark Reject precision (1 − override rate on Mark Rej + Coderbyte Pass)</TableCell>
                <TableCell>27%</TableCell>
                <TableCell>≥75%</TableCell>
                <TableCell>≥90%</TableCell>
                <TableCell>Anti-bias</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Mark Unclear precision (% Unclear = true)</TableCell>
                <TableCell>~10% (??)</TableCell>
                <TableCell>≥60%</TableCell>
                <TableCell>≥80%</TableCell>
                <TableCell>Queue load →</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Recruiter hours per vetted dev</TableCell>
                <TableCell>1.3h</TableCell>
                <TableCell>1.1h</TableCell>
                <TableCell>≤1.0h</TableCell>
                <TableCell>Capacity</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Hires/month</TableCell>
                <TableCell>104</TableCell>
                <TableCell>120</TableCell>
                <TableCell>150</TableCell>
                <TableCell>Umbrella</TableCell>
              </TableRow>
            </TableBody>
          </DocTable>
        </DocBlock>

        <DocBlock title="Dependencies and Risks">
          <DocRisks items={[
            {
              level: 'high',
              badge: 'A/B layer',
              title: 'Required -- already in Phase 2 scope',
              text: "Without it, there's no way to validate before shipping. If engineering tells us it's \"3 weeks, not 3 days\" → we ship with shadow-only validation (worse, but workable).",
            },
            {
              level: 'watch',
              badge: "Mark's LLM stack",
              title: 'Tool-calling support affects Track B feasibility',
              text: "If the current model doesn't support tool-calling, Track B (CV cross-reference) gets harder. Mitigation: structural guardrail outside the LLM (at the routing layer, on the parsed CV) -- a proven approach.",
            },
            {
              level: 'low',
              badge: 'Design dependency',
              title: 'None',
              text: 'All changes are prompt + backend + non-visual rubric. Recruiter-side UX improvements live in the quick-wins (no designer needed).',
            },
          ]} />
        </DocBlock>

      </DocSection>

      {/* 04 -- Bonus */}
      <DocSection num="04" title="Bonus: Quick-Wins to Ship Alongside">

        <DocBlock title="QW-1. Rate-Leak Prompt Fix (1 BE × 0.5d + QA 0.5d)">
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong className="text-foreground">What:</strong> Update system prompt with explicit policy: "Never disclose rate ranges or typical numbers. If asked, deflect: 'Rate is part of the offer discussion with the recruiter. What rate are YOU looking for?'" Add a regression test on 23 known-case transcripts (Maryna's pull).
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong className="text-foreground">Metric:</strong> % of calls with rate disclosure. Target &lt;2% within one week (sample 30 calls manually, then keyword detector across transcripts).
          </p>
          <Callout variant="primary" title="Impact">
            Restore margin on 5–6 offers/mo. At $5/h delta × 40h × 4w = $800/dev/mo → ±$4–5K/mo base + compounding as we scale.
          </Callout>
        </DocBlock>

        <DocBlock title="QW-2. Flagged for Decline Bulk-Confirm + Sticky Filter (1 FE × 2d)">
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong className="text-foreground">What:</strong> Checkboxes next to each case + "Confirm selected" button + keyboard shortcuts ('C' to confirm, 'O' to override to review). Filter "show only DISQUAL, scamScore 90–100". Override rate is only 7% → 93% of flags are correct, safe to accelerate.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Metric:</strong> Median time per Flagged for Decline case. Target &lt;1 min (down from 4 min). Saves ±12h/mo of recruiter time = capacity for ±30 additional Need Review cases.
          </p>
        </DocBlock>

        <DocBlock title="QW-3. Need Review Prioritization + Soft SLA (1 FE + 1 BE × 3d)">
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong className="text-foreground">What:</strong> Add a priority formula that sorts cases by two signals -- how long they've waited + how likely they are to advance (Mark Pass + Coderbyte Pass = high). Recruiter sees high-priority cases at the top of the queue, with a "Likely Advance" badge on easy wins. Candidates waiting more than 5 days get an automatic email: "Still under review, expect an update by [date+3]" -- a trust signal, not a hard SLA.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Metric:</strong> Median time-in-queue &lt;5 days; &lt;10% of cases waiting &gt;7 days. Lift in candidate satisfaction.
          </p>
        </DocBlock>

        <DocBlock title="One Surprise + One Question Before Day 0">
          <Callout variant="warning" title="Surprise">
            Mark Reject + Coderbyte Pass is overridden 73% of the time, while Mark Pass + Coderbyte Reject only 8%. Mark is simultaneously too strict on edge cases (Andrii: a candidate rejected for an 8-sec pause) and too lenient on the main path (50% false positives in auto-advance). This isn't a shifted threshold -- it's a noisy decision boundary. Fixed with a rubric, not by moving the cutoff.<br /><br />
            Bonus: stage 2, "project preferences," has the highest drop (38%) -- even though it's the most neutral stage in the call. Mark pushes for specifics, and flexible candidates walk away. A conversion leak in an unexpected place.
          </Callout>
          <Callout variant="primary" title="Question to the team on Day 0">
            "Is there already a labeled dataset of Mark calls with ground-truth recruiter decisions (from full post-call review)? If not -- that's blocker #1, and we build it in week 1. If yes -- where is it, what size, what labels?"<br /><br />
            Without an eval set, we can't measure precision/recall on any change -- every "prompt improvement" becomes wishful thinking. Bonus question: what's Mark's LLM / voice stack, and does it support tool-calling? That determines the feasibility of Track B.
          </Callout>
        </DocBlock>

        <DocBlock title="What I Don't Know">
          <DocRisks items={[
            {
              level: 'watch',
              badge: 'Sampling',
              title: 'How the 30 of 60 QC sample was actually selected',
              text: 'Random or cherry-picked as suspicious -- affects the 50% baseline. Validation: run random QC across the full auto-advance population in week 1.',
            },
            {
              level: 'watch',
              badge: 'Unclear reasons',
              title: 'Real breakdown of Mark Unclear reasons',
              text: "Yulia's \"9 of 10\" is too small; we need categorization across 100+ cases.",
            },
            {
              level: 'watch',
              badge: 'Call cost',
              title: 'Cost of one Mark call (Vapi.ai + tokens)',
              text: 'Affects how we prioritize retry-on-tech-issue.',
            },
            {
              level: 'watch',
              badge: 'Marketing push',
              title: 'Effect of the 3× volume marketing push on signup quality',
              text: 'Needs segmentation by channel, otherwise baseline drop-off is partly explained by it, not by Mark.',
            },
          ]} />
        </DocBlock>

      </DocSection>

    </DocLayout>
  )
}
