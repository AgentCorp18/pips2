import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Presentations | PIPS',
  description:
    'Five principles for communicating PIPS improvement results clearly and compellingly to leadership.',
}
import {
  Presentation,
  TrendingUp,
  BarChart3,
  BookOpen,
  Users,
  ArrowRight,
  Lightbulb,
  CalendarCheck,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContentBreadcrumb } from '@/components/knowledge/content-breadcrumb'

const PRINCIPLES = [
  {
    name: 'Lead with Impact',
    description:
      'Open with the business result your audience cares about most. If cycle time dropped 30%, say so in the first 60 seconds. Hook their attention before diving into methodology.',
    icon: <TrendingUp size={20} />,
  },
  {
    name: 'Show the Data',
    description:
      'Use before-and-after comparisons to make improvement tangible. Charts, tables, and KPI dashboards turn abstract claims into evidence. Let the numbers speak for themselves.',
    icon: <BarChart3 size={20} />,
  },
  {
    name: 'Tell the Story',
    description:
      'Structure your presentation as a narrative arc: the problem (pain), the analysis (discovery), the solution (action), and the result (impact). Stories are remembered long after slides are forgotten.',
    icon: <BookOpen size={20} />,
  },
  {
    name: 'Acknowledge the Team',
    description:
      'Credit the people who did the work. Name specific contributions — "Sarah identified the root cause in Step 2" — rather than generic praise. Recognition builds a culture of improvement.',
    icon: <Users size={20} />,
  },
  {
    name: 'Propose Next Steps',
    description:
      'End with a forward-looking recommendation. Should the team standardize the solution, iterate on it, or start a new cycle? Give leadership a clear decision to make, not an open-ended question.',
    icon: <ArrowRight size={20} />,
  },
]

const TIPS = [
  'Rehearse with someone outside the team — if they understand it, leadership will too.',
  'Keep slides minimal: one idea per slide, large fonts, and visuals over text.',
  'Prepare for the "so what?" question on every data point you present.',
  'Have a one-page executive summary ready for leaders who skip the meeting.',
  'Time your presentation to 60% of the allotted slot — leave room for questions.',
]

const PresentationsPage = () => {
  return (
    <div data-testid="presentations-page" className="mx-auto max-w-4xl space-y-6">
      {/* Breadcrumb */}
      <ContentBreadcrumb
        items={[
          { label: 'Knowledge Hub', href: '/knowledge' },
          { label: 'Guide', href: '/knowledge/guide' },
          { label: 'Presentations', href: '/knowledge/guide/presentations' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'var(--color-step-4-subtle)' }}
        >
          <Presentation size={20} className="text-[var(--color-step-4)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Presenting to Leadership
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Communicate improvement results clearly and compellingly
          </p>
        </div>
      </div>

      {/* Intro */}
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
        The best improvement work fails if leadership never hears about it. Presenting results
        effectively is what turns a one-time project into organizational change. These five
        principles help you translate your team&apos;s analytical work into a narrative that
        resonates with decision-makers.
      </p>

      {/* Principle Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PRINCIPLES.map((p, index) => (
          <Card key={p.name} data-testid={`presentation-principle-${index}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-step-4)]"
                  style={{ backgroundColor: 'var(--color-step-4-subtle)' }}
                >
                  {p.icon}
                </div>
                <CardTitle className="text-base">{p.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {p.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* When to Present to Leadership */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-step-4)]"
              style={{ backgroundColor: 'var(--color-step-4-subtle)' }}
            >
              <CalendarCheck size={20} />
            </div>
            <CardTitle className="text-base">When to Present to Leadership</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Schedule leadership updates at these key moments in your PIPS cycle:
          </p>
          <ol className="space-y-2">
            {[
              'After Step 1 — Share the problem statement and get buy-in on scope and resources',
              'After Step 2 — Present root cause findings to validate the analysis direction',
              'After Step 4 — Get approval on the selected solution and implementation plan',
              'During Step 5 — Provide brief weekly progress updates (email or 5-minute stand-up)',
              'After Step 6 — Present the full before-and-after results and lessons learned',
              'At project completion — Celebrate results and propose the next improvement cycle',
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)]"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: 'var(--color-step-4)' }}
                >
                  {i + 1}
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* One-Pager Reference */}
      <Link href="/export">
        <Card className="cursor-pointer transition-all hover:shadow-md hover:border-[var(--color-primary)]">
          <CardContent className="flex items-center gap-4 py-5">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'rgba(79, 70, 229, 0.08)' }}
            >
              <FileText size={20} className="text-[var(--color-primary)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Generate a One-Pager PDF
              </h3>
              <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                Export a project summary as a polished one-page PDF — perfect for leadership
                briefings, stakeholder updates, and project archives.
              </p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-[var(--color-text-tertiary)]" />
          </CardContent>
        </Card>
      </Link>

      {/* Tips Section */}
      <Card className="border-amber-200/50">
        <CardContent className="flex gap-3 py-5">
          <Lightbulb size={20} className="mt-0.5 shrink-0 text-amber-500" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Preparation Tips
            </h3>
            <ul className="space-y-1.5">
              {TIPS.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { PresentationsPage }
export default PresentationsPage
