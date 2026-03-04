import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Users, Clock, BookOpen, Target, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { STEP_CONTENT } from '@pips/shared'
import type { PipsStepNumber } from '@pips/shared'
import { getContentForContext } from '../../../actions'
import { WORKSHOP_MODULE_DATA } from '../../module-data'

type WorkshopModulePageProps = {
  params: Promise<{ slug: string }>
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  Advanced: 'bg-red-50 text-red-700 border-red-200',
}

const WorkshopModulePage = async ({ params }: WorkshopModulePageProps) => {
  const { slug } = await params
  const mod = WORKSHOP_MODULE_DATA[slug]

  if (!mod) {
    notFound()
  }

  const relatedContent = await getContentForContext(mod.contentStepTags, [])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'rgba(8, 145, 178, 0.08)' }}
        >
          <Users size={20} className="text-[#0891B2]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{mod.title}</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{mod.description}</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/knowledge" className="hover:text-[var(--color-primary)]">
          Knowledge Hub
        </Link>
        <span>/</span>
        <Link href="/knowledge/workshop" className="hover:text-[var(--color-primary)]">
          Workshop
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">{mod.title}</span>
      </nav>

      {/* Module meta */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
          <Clock size={14} />
          {mod.duration}
        </span>
        <Badge variant="outline" className={`text-xs ${DIFFICULTY_COLORS[mod.difficulty] ?? ''}`}>
          {mod.difficulty}
        </Badge>
        {mod.steps.length > 0 && (
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {mod.steps.length === 1
              ? `PIPS Step ${mod.steps[0]}`
              : `PIPS Steps ${mod.steps.join(' & ')}`}
          </span>
        )}
      </div>

      {/* Objectives */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target size={14} className="text-[var(--color-primary)]" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {mod.objectives.map((obj, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                {obj}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Agenda */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-[var(--color-primary)]" />
            Session Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mod.agenda.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2"
              >
                <span className="shrink-0 rounded bg-[var(--color-surface-secondary)] px-1.5 py-0.5 text-xs font-mono font-medium text-[var(--color-text-tertiary)]">
                  {item.duration}
                </span>
                <div className="flex-1">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {item.activity}
                  </span>
                  {item.notes && (
                    <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Materials needed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Materials Needed</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {mod.materials.map((material, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-text-tertiary)]" />
                {material}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Facilitator notes */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertCircle size={14} className="text-amber-600" />
            Facilitator Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mod.facilitatorNotes.map((note, i) => (
              <li key={i} className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {note}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Step guide links */}
      {mod.steps.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen size={14} className="text-[var(--color-primary)]" />
              Related Step Guides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mod.steps.map((stepNum) => {
                const stepContent = STEP_CONTENT[stepNum as PipsStepNumber]
                return (
                  <Link
                    key={stepNum}
                    href={`/knowledge/guide/step/${stepNum}`}
                    className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 transition-colors hover:bg-[var(--color-surface-secondary)]"
                  >
                    <div>
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        Step {stepNum}: {stepContent.title}
                      </span>
                      <p className="text-xs text-[var(--color-text-tertiary)]">
                        {stepContent.objective}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related book content */}
      {relatedContent.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen size={14} className="text-[var(--color-primary)]" />
              Related Reading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {relatedContent.slice(0, 5).map((node) => (
                <Link
                  key={node.id}
                  href={`/knowledge/book/${node.slug}`}
                  className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 transition-colors hover:bg-[var(--color-surface-secondary)]"
                >
                  <div>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {node.title}
                    </span>
                    <p className="line-clamp-1 text-xs text-[var(--color-text-tertiary)]">
                      {node.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Practice scenarios */}
      {mod.practiceScenarios.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target size={14} className="text-[var(--color-primary)]" />
              Practice Scenarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mod.practiceScenarios.map((scenario) => (
                <Link
                  key={scenario.slug}
                  href={`/training/practice/${scenario.slug}`}
                  className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 transition-colors hover:bg-[var(--color-surface-secondary)]"
                >
                  <div>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {scenario.title}
                    </span>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {scenario.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default WorkshopModulePage
