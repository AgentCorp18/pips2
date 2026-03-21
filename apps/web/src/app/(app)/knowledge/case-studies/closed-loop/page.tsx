import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Closed-Loop Case Study | PIPS',
  description:
    'How the PIPS team ran a full 6-step improvement cycle on its own application during beta testing and shipped 5 features in a single session.',
}
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  Search,
  Lightbulb,
  BarChart3,
  Hammer,
  TrendingUp,
  Repeat,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContentBreadcrumb } from '@/components/knowledge/content-breadcrumb'
import { Callout } from '@/components/knowledge/callout'
import { KeyTakeaway } from '@/components/knowledge/key-takeaway'

// ---------------------------------------------------------------------------
// Step color constants matching the PIPS brand
// ---------------------------------------------------------------------------
const STEP_COLORS = {
  1: '#2563EB', // Signal Blue
  2: '#D97706', // Insight Amber
  3: '#059669', // Spark Green
  4: '#4338CA', // Blueprint Indigo
  5: '#CA8A04', // Action Gold
  6: '#0891B2', // Loop Teal
}

// ---------------------------------------------------------------------------
// Data for the criteria matrix table
// ---------------------------------------------------------------------------
const CRITERIA = [
  { name: 'User Impact', weight: 9 },
  { name: 'Ease of Implementation', weight: 7 },
  { name: 'Low Risk', weight: 5 },
  { name: 'Speed to Ship', weight: 6 },
]

const FEATURES_SCORED = [
  { id: 'F11', name: 'Project Column', scores: [9, 8, 9, 8], total: 126 },
  { id: 'F9', name: 'Bulk Ticket Ops', scores: [8, 6, 6, 7], total: 108 },
  { id: 'F10', name: 'Progress Bars', scores: [7, 8, 8, 7], total: 100 },
  { id: 'F6', name: 'Form Duplication', scores: [7, 7, 8, 6], total: 97 },
  { id: 'F5', name: 'Form Templates', scores: [8, 5, 6, 6], total: 89 },
  { id: 'F7', name: 'Overdue Digest', scores: [6, 7, 7, 7], total: 88 },
  { id: 'F8', name: 'Chat Threading', scores: [5, 4, 5, 5], total: 67 },
]

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
const ClosedLoopCaseStudyPage = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-12">
      {/* Breadcrumbs */}
      <ContentBreadcrumb
        items={[
          { label: 'Knowledge Hub', href: '/knowledge' },
          { label: 'Case Studies', href: '/knowledge/case-studies' },
          { label: 'The Closed Loop', href: '/knowledge/case-studies/closed-loop' },
        ]}
      />

      {/* Hero / Title */}
      <header className="border-b border-[var(--color-border)] pb-8">
        <Badge
          className="mb-3 text-xs"
          style={{
            backgroundColor: `${STEP_COLORS[6]}15`,
            color: STEP_COLORS[6],
            borderColor: STEP_COLORS[6],
          }}
        >
          Case Study
        </Badge>
        <h1
          className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-4xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          The Closed Loop: Using PIPS to Improve PIPS
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
          How the PIPS team ran a full 6-step improvement cycle on its own application during beta
          testing — finding 12 improvement areas, scoring them with a weighted criteria matrix, and
          shipping 5 features in a single session.
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            12 min read
          </span>
          <span>March 2026</span>
          <span>Beta Testing Sprint</span>
        </div>
      </header>

      {/* Executive Summary */}
      <section>
        <h2
          className="mb-4 text-2xl font-bold text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Executive Summary
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <p>
            After reaching feature completeness on the PIPS 2.0 platform, the team faced a critical
            question: does the methodology we built actually work when applied to a real system
            under real conditions? To answer this, we ran the PIPS 6-step cycle on the PIPS
            application itself — stress-testing the platform with production-scale data (469 forms,
            433 tickets, 2,000+ chat messages across 5 projects) and using the methodology to
            identify, analyze, and fix the problems we found.
          </p>
          <p>
            The result was decisive. In a single working session, the team identified 12 improvement
            areas through structured analysis, scored 7 shortlisted features using a weighted
            criteria matrix, and shipped 5 features plus a bug fix — all while following the PIPS
            process end-to-end. The application went from requiring 6-8 hours of manual form filling
            per project to offering bulk operations, cross-project duplication, and automated
            digests. Test suite integrity was maintained at 2,869 passing tests with zero type
            errors.
          </p>
          <p>
            This case study documents each step of the cycle and the lessons learned. It serves as
            both a validation of the PIPS methodology and a template for teams looking to run their
            own improvement cycles.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section>
        <h2
          className="mb-4 text-2xl font-bold text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          The Problem
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <p>
            PIPS 2.0 had reached MVP completeness: all 6 methodology steps were functional, the
            knowledge hub was populated with 15 book chapters, and the platform supported
            multi-tenant organizations with full RBAC. But MVP means &ldquo;minimum viable&rdquo; —
            and beta testing with realistic data volumes exposed workflow pain points that
            small-scale testing had missed.
          </p>
        </div>

        {/* Data cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Forms Saved', value: '469' },
            { label: 'Tickets Created', value: '433' },
            { label: 'Chat Messages', value: '2,000+' },
            { label: 'Projects Active', value: '5' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold text-[var(--color-primary)]">{stat.value}</p>
                <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <p>The beta test revealed three categories of friction:</p>
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong className="text-[var(--color-text-primary)]">Data entry overhead:</strong>{' '}
              Each project required 6-8 hours of manual form filling with no way to copy forms
              between projects or create templates from existing work.
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">Visibility gaps:</strong> With 51
              projects on one page and no pagination, and 11-column ticket tables overflowing on
              laptop screens, users struggled to find and manage their work.
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">Operational friction:</strong> No
              bulk operations for tickets, no overdue notifications, and chat channels lacked search
              — making coordination harder as the system grew.
            </li>
          </ul>
        </div>
      </section>

      {/* The Methodology Applied */}
      <section>
        <h2
          className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          The Methodology Applied
        </h2>

        {/* STEP 1 */}
        <StepSection
          number={1}
          name="Identify"
          color={STEP_COLORS[1]}
          icon={Target}
          subtitle="Define the problem with data"
        >
          <p>
            The team began by stress-testing the application with production-scale data. Rather than
            relying on intuition about what needed improvement, the approach was systematic:
            populate the PIPS Demo Company with realistic volumes (51 projects, 435 tickets, 112
            sub-tickets, 469 forms, 14 chat channels, 2,000+ messages) and observe where the
            workflow broke down.
          </p>
          <Callout variant="note" title="Problem Statement">
            The PIPS application requires 6-8 hours of manual form filling per project with no
            templates, no bulk operations, and insufficient visibility features for teams managing
            more than 10 projects simultaneously.
          </Callout>
          <p className="mt-4">
            This framing was critical: it was measurable (hours of manual work), specific (named the
            missing capabilities), and scoped (focused on workflow efficiency rather than trying to
            fix everything at once).
          </p>
        </StepSection>

        {/* STEP 2 */}
        <StepSection
          number={2}
          name="Analyze"
          color={STEP_COLORS[2]}
          icon={Search}
          subtitle="Find the root causes"
        >
          <p>
            The team performed a fishbone analysis across six standard categories, identifying
            causes in each:
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              {
                category: 'People',
                causes: 'Solo operator; no user feedback loop during MVP build',
              },
              {
                category: 'Process',
                causes: 'Feature breadth prioritized over workflow depth; no templates system',
              },
              {
                category: 'Equipment',
                causes: 'No bulk APIs; 11-column ticket table overflows on 1366px screens',
              },
              {
                category: 'Materials',
                causes: '469 forms locked in individual projects; no cross-project sharing',
              },
              {
                category: 'Environment',
                causes: 'Small-scale testing masked data volume issues',
              },
              {
                category: 'Management',
                causes: 'MVP timeline forced ship-first, polish-later approach',
              },
            ].map((item) => (
              <Card key={item.category} className="border-l-4 border-l-[var(--color-step-2)]">
                <CardContent className="py-3">
                  <p className="text-xs font-semibold text-[var(--color-step-2)]">
                    {item.category}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{item.causes}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mt-4">A 5-Why analysis drove deeper into the root cause:</p>
          <ol className="ml-4 mt-2 list-decimal space-y-1 text-xs">
            <li>
              <em>Why is form filling slow?</em> — No templates or duplication.
            </li>
            <li>
              <em>Why no templates?</em> — MVP prioritized feature breadth.
            </li>
            <li>
              <em>Why feature breadth?</em> — Need to validate the full methodology end-to-end.
            </li>
            <li>
              <em>Why validate end-to-end first?</em> — The 6-step integrity is the product&rsquo;s
              core value proposition.
            </li>
            <li>
              <em>Why not both?</em> — Limited development capacity during MVP sprint.
            </li>
          </ol>

          <KeyTakeaway stepColor={STEP_COLORS[2]}>
            The root cause was not a mistake — it was a deliberate MVP trade-off that had served its
            purpose. The system now needed a second pass focused on workflow efficiency.
          </KeyTakeaway>
        </StepSection>

        {/* STEP 3 */}
        <StepSection
          number={3}
          name="Generate"
          color={STEP_COLORS[3]}
          icon={Lightbulb}
          subtitle="Brainstorm solutions without judgment"
        >
          <p>
            Following the &ldquo;expand then contract&rdquo; principle, the team brainstormed 12
            improvement ideas without filtering:
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
            {[
              'F1: Project pagination with sort/filter',
              'F2: Ticket table column picker',
              'F3: Dashboard widget customization',
              'F4: Chat search and pinned channels',
              'F5: Form templates library',
              'F6: Cross-project form duplication',
              'F7: Overdue ticket digest emails',
              'F8: Chat threading and replies',
              'F9: Bulk ticket operations',
              'F10: Initiative progress bars',
              'F11: Project column in ticket table',
              'F12: Notification bulk dismiss',
            ].map((idea) => (
              <div
                key={idea}
                className="flex items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-secondary)]"
              >
                <Lightbulb size={12} className="shrink-0 text-[var(--color-step-3)]" />
                {idea}
              </div>
            ))}
          </div>
          <p className="mt-4">
            From 12 ideas, the team shortlisted 7 that were feasible within the sprint: F5, F6, F7,
            F8, F9, F10, and F11. The remaining 5 (F1-F4, F12) were deferred to dedicated future
            cycles — not discarded, but tracked as tickets in the PIPS app itself.
          </p>
        </StepSection>

        {/* STEP 4 */}
        <StepSection
          number={4}
          name="Select & Plan"
          color={STEP_COLORS[4]}
          icon={BarChart3}
          subtitle="Score options against weighted criteria"
        >
          <p>
            The team defined four evaluation criteria with importance weights, then scored each
            shortlisted feature on a 1-9 scale:
          </p>

          {/* Criteria matrix table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-2 pr-3 text-left font-semibold text-[var(--color-text-primary)]">
                    Feature
                  </th>
                  {CRITERIA.map((c) => (
                    <th
                      key={c.name}
                      className="px-2 py-2 text-center font-semibold text-[var(--color-text-primary)]"
                    >
                      <div>{c.name}</div>
                      <div className="font-normal text-[var(--color-text-tertiary)]">
                        (x{c.weight})
                      </div>
                    </th>
                  ))}
                  <th className="py-2 pl-2 text-center font-semibold text-[var(--color-text-primary)]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES_SCORED.map((f, i) => (
                  <tr
                    key={f.id}
                    className={`border-b border-[var(--color-border)] ${i === 0 ? 'bg-[var(--color-primary)]/5' : ''}`}
                  >
                    <td className="py-2 pr-3 text-[var(--color-text-primary)]">
                      <span className="font-medium">{f.id}</span>{' '}
                      <span className="text-[var(--color-text-secondary)]">{f.name}</span>
                    </td>
                    {f.scores.map((score, si) => (
                      <td
                        key={si}
                        className="px-2 py-2 text-center text-[var(--color-text-secondary)]"
                      >
                        {score}
                      </td>
                    ))}
                    <td
                      className={`py-2 pl-2 text-center font-bold ${i === 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}
                    >
                      {f.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4">
            The matrix produced a clear ranking. F11 (Project Column) scored highest at 126/135 due
            to high user impact and low implementation risk. F8 (Chat Threading) scored lowest at
            67/135 — valuable but architecturally complex. The team committed to implementing the
            top 5 features (F11, F9, F10, F6, F7) and deferring F5 and F8 to their own cycles.
          </p>

          <Callout variant="tip" title="Why this works">
            The criteria matrix removes &ldquo;loudest voice wins&rdquo; decision-making. By
            assigning weights before scoring, the team pre-committed to what matters most. The math
            does the arguing.
          </Callout>
        </StepSection>

        {/* STEP 5 */}
        <StepSection
          number={5}
          name="Implement"
          color={STEP_COLORS[5]}
          icon={Hammer}
          subtitle="Execute the plan"
        >
          <p>
            With priorities set, the team implemented features in order of matrix ranking. Each
            feature followed a consistent pattern: implement, write tests, verify all 2,869 existing
            tests still pass, commit.
          </p>

          <div className="mt-4 space-y-3">
            {[
              {
                id: 'F11',
                name: 'Project Column in Ticket Table',
                commit: '866b2ad',
                description:
                  'Added a project name column to the ticket table so users can see which project each ticket belongs to without opening it. Clickable link navigates to the project.',
              },
              {
                id: 'F10',
                name: 'Color-Coded Initiative Progress Bars',
                commit: 'f2251ba',
                description:
                  'Initiative cards now show a multi-segment progress bar broken down by ticket status (To Do, In Progress, Done) with distinct colors. At-a-glance project health.',
              },
              {
                id: 'F6',
                name: 'Cross-Project Form Duplication API',
                commit: '9fd6faa',
                description:
                  'Two new server actions — listProjectsWithForm() and copyFormFromProject() — enable users to find and copy any form from any project in their org. Eliminates re-entry of recurring problem analyses.',
              },
              {
                id: 'F9',
                name: 'Bulk Ticket Operations with Action Bar',
                commit: 'fbda9ab',
                description:
                  'Multi-select checkboxes on the ticket table with a floating action bar. Supports bulk status change, priority change, and assignment. Handles 50+ tickets at once.',
              },
              {
                id: 'F7',
                name: 'Overdue Ticket Digest Email',
                commit: 'fbda9ab',
                description:
                  'A daily cron-triggered Edge Function scans for tickets past their due date and sends a digest email via Resend. Includes ticket title, project, days overdue, and direct links.',
              },
            ].map((feature) => (
              <Card
                key={feature.id}
                className="border-l-4"
                style={{ borderLeftColor: STEP_COLORS[5] }}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      className="text-[10px]"
                      style={{
                        backgroundColor: `${STEP_COLORS[5]}15`,
                        color: STEP_COLORS[5],
                      }}
                    >
                      {feature.id}
                    </Badge>
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {feature.name}
                    </h4>
                    <code className="ml-auto text-[10px] text-[var(--color-text-tertiary)]">
                      {feature.commit}
                    </code>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mt-4">
            Additionally, a bug fix was shipped for the unsaved changes dialog (commit 5d20844) —
            the <code className="text-xs">beforeunload</code> handler was reading stale state. The
            fix used a sync ref (<code className="text-xs">isDirtyRef</code>) so the handler always
            reads the latest value.
          </p>
        </StepSection>

        {/* STEP 6 */}
        <StepSection
          number={6}
          name="Evaluate"
          color={STEP_COLORS[6]}
          icon={TrendingUp}
          subtitle="Measure results and close the loop"
        >
          <p>
            The team evaluated results against the original problem statement and the 6 objectives
            set during planning:
          </p>

          <div className="mt-4 space-y-2">
            {[
              { objective: 'Reduce form entry overhead with duplication', met: true },
              { objective: 'Add bulk ticket operations', met: true },
              { objective: 'Improve initiative visibility with progress bars', met: true },
              { objective: 'Add project context to ticket table', met: true },
              { objective: 'Implement overdue notification system', met: true },
              { objective: 'Ship form templates library', met: false },
            ].map((obj) => (
              <div
                key={obj.objective}
                className="flex items-center gap-3 rounded-md border border-[var(--color-border)] px-3 py-2"
              >
                {obj.met ? (
                  <CheckCircle size={16} className="shrink-0 text-emerald-500" />
                ) : (
                  <AlertTriangle size={16} className="shrink-0 text-amber-500" />
                )}
                <span
                  className={`text-xs ${obj.met ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'}`}
                >
                  {obj.objective}
                  {!obj.met && ' (deferred to own cycle)'}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4">
            <strong className="text-[var(--color-text-primary)]">5 of 6 objectives met</strong> —
            the only deferral (form templates) was a deliberate decision based on the criteria
            matrix, not a failure. It scored below the cut line and was logged as a ticket for the
            next sprint.
          </p>
        </StepSection>
      </section>

      {/* Results: Before & After */}
      <section>
        <h2
          className="mb-4 text-2xl font-bold text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Results: Before & After
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="border-l-4 border-l-red-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-600">Before</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                <li>6-8 hours manual form filling per project</li>
                <li>No way to copy work between projects</li>
                <li>Tickets managed one at a time</li>
                <li>No overdue notifications</li>
                <li>No project context in ticket table</li>
                <li>No initiative health visibility</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-emerald-600">After</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                <li>Cross-project form duplication (minutes, not hours)</li>
                <li>Copy any form from any project in the org</li>
                <li>Bulk operations: 50+ tickets at once</li>
                <li>Daily overdue digest emails via cron</li>
                <li>Project column with clickable navigation</li>
                <li>Color-coded progress bars on every initiative</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quality metrics */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">2,869</p>
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">Tests Passing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">0</p>
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">Type Errors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-[var(--color-primary)]">5+1</p>
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">Features + Bug Fix</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Review Findings */}
      <section>
        <h2
          className="mb-4 text-2xl font-bold text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Team Review: 6 New Findings
        </h2>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          After implementation, a team review surfaced 6 additional findings — demonstrating the
          &ldquo;close the loop&rdquo; principle in action. Each finding became a ticket for the
          next cycle:
        </p>
        <div className="space-y-2">
          {[
            'Projects page still needs pagination (51 projects on one page)',
            'Ticket table has 11 columns — needs a column picker for laptop screens',
            'Chat channels need search and pin functionality',
            'Notification center needs bulk dismiss (92+ unread)',
            'Dashboard Recent Activity shows "System created" for SQL-inserted entries',
            'Form templates library still needed for true template workflow',
          ].map((finding, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-md border border-[var(--color-border)] px-3 py-2"
            >
              <Repeat size={14} className="mt-0.5 shrink-0 text-[var(--color-step-6)]" />
              <span className="text-xs text-[var(--color-text-secondary)]">{finding}</span>
            </div>
          ))}
        </div>

        <KeyTakeaway stepColor={STEP_COLORS[6]}>
          Every improvement cycle reveals the next cycle. This is not a flaw in the process — it{' '}
          <em>is</em> the process. PIPS is designed to generate continuous improvement, not a
          one-time fix.
        </KeyTakeaway>
      </section>

      {/* Lessons Learned */}
      <section>
        <h2
          className="mb-4 text-2xl font-bold text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Lessons Learned
        </h2>
        <div className="space-y-4">
          {[
            {
              title: '1. Test with production-scale data, not demo data',
              body: 'Small test datasets hide real workflow problems. The PIPS app worked perfectly with 5 tickets; it showed its seams at 433. If you want to find the problems users will hit, use the data volumes users will have.',
            },
            {
              title: '2. The criteria matrix removes politics from prioritization',
              body: 'Without the matrix, the team might have chased the most exciting feature (chat threading) instead of the highest-impact one (project column). Pre-committing to weighted criteria before scoring ensures the math decides, not enthusiasm or seniority.',
            },
            {
              title: '3. Deferring is not failing',
              body: 'Form templates (F5) and chat threading (F8) were both valuable ideas. Deferring them was a data-driven decision, not a compromise. Each was logged as a ticket with full context so the next cycle starts informed, not from scratch.',
            },
            {
              title: '4. Ship quality, not quantity',
              body: 'Every feature shipped with full tests, zero type errors, and backward compatibility. Rushing to ship all 7 features would have introduced technical debt. The 5 that shipped work correctly; the 2 deferred will get the same treatment.',
            },
            {
              title: '5. "Eating your own dog food" is the strongest validation',
              body: "Using PIPS to improve PIPS created a virtuous cycle: the team experienced every pain point firsthand, the methodology proved itself under real conditions, and the improvements directly benefited the team's own workflow. If your product is a process tool, use it on your own process.",
            },
            {
              title: '6. Step 6 is the beginning, not the end',
              body: 'The evaluation step surfaced 6 new findings — each one a potential starting point for the next improvement cycle. The "closed loop" is not a circle that returns to the same point; it is a spiral that returns to the same questions at a higher level.',
            },
            {
              title: '7. Structure beats heroics',
              body: 'Shipping 5 features in a single session sounds impressive, but it was not heroic — it was the natural output of a structured process. The fishbone told us where to look, the brainstorm gave us options, the matrix told us what to build first, and the implementation plan kept execution focused.',
            },
          ].map((lesson) => (
            <Card key={lesson.title}>
              <CardContent className="py-4">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {lesson.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  {lesson.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How to Replicate */}
      <section>
        <h2
          className="mb-4 text-2xl font-bold text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          How to Replicate This in Your Organization
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <p>
            This case study is not unique to software development. Any team can run a PIPS cycle on
            their own process. Here is how:
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {[
            {
              step: 1,
              action: 'Pick a process you own and use daily',
              detail:
                'The best candidates are processes your team finds frustrating or slow. You already have the domain knowledge; PIPS gives you the structure.',
            },
            {
              step: 2,
              action: 'Stress-test it with realistic volumes',
              detail:
                'Do not evaluate your process under ideal conditions. Use real data, real timelines, and real team sizes. The friction points will emerge.',
            },
            {
              step: 3,
              action: 'Write a measurable problem statement',
              detail:
                'Vague problems get vague solutions. Quantify the pain: hours wasted, error rates, missed deadlines, rework frequency.',
            },
            {
              step: 4,
              action: 'Run the fishbone before brainstorming',
              detail:
                'Analyze causes across all 6 categories before generating solutions. This prevents jumping to the first idea and ensures you address root causes.',
            },
            {
              step: 5,
              action: 'Use the criteria matrix to prioritize',
              detail:
                'Define criteria and weights before scoring. Let the numbers rank your options. Implement in order of score, not excitement.',
            },
            {
              step: 6,
              action: 'Evaluate honestly and capture what comes next',
              detail:
                'Measure results against your original problem statement. Document what worked, what did not, and what new problems emerged. These feed your next cycle.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex gap-4 rounded-lg border border-[var(--color-border)] p-4"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: STEP_COLORS[item.step as keyof typeof STEP_COLORS] }}
              >
                {item.step}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {item.action}
                </h4>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section
        className="rounded-xl border-2 border-[var(--color-primary)] p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-subtle) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-start gap-4">
          <Repeat size={28} className="mt-1 shrink-0 text-[var(--color-primary)]" />
          <div>
            <h2
              className="text-xl font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The Loop Continues
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              The 6 findings from the team review have already been logged as tickets in the PIPS
              app. The next cycle will pick up where this one left off — with a clear problem
              statement, full context from this evaluation, and a proven methodology to guide the
              work. That is the closed loop: every ending is a beginning.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/knowledge/guide">
                <Badge
                  className="cursor-pointer px-3 py-1 text-xs transition-opacity hover:opacity-80"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                >
                  Explore the Methodology
                  <ArrowRight size={12} className="ml-1" />
                </Badge>
              </Link>
              <Link href="/knowledge/guide/tools">
                <Badge
                  variant="outline"
                  className="cursor-pointer px-3 py-1 text-xs transition-opacity hover:opacity-80"
                >
                  Browse Tools Library
                  <ArrowRight size={12} className="ml-1" />
                </Badge>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step Section Component
// ---------------------------------------------------------------------------
type StepSectionProps = {
  number: number
  name: string
  color: string
  icon: typeof Target
  subtitle: string
  children: React.ReactNode
}

const StepSection = ({ number, name, color, icon: Icon, subtitle, children }: StepSectionProps) => {
  return (
    <div className="mt-8 first:mt-0">
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {number}
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
            Step {number}: {name}
          </h3>
          <p className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
            <Icon size={12} style={{ color }} />
            {subtitle}
          </p>
        </div>
      </div>
      <div className="space-y-3 pl-[52px] text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {children}
      </div>
    </div>
  )
}

export { ClosedLoopCaseStudyPage as default }
