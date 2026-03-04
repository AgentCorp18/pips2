import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScenarioRunner } from '@/components/training/scenario-runner'
import { PRACTICE_SCENARIOS } from './scenarios'

type ScenarioPageProps = {
  params: Promise<{ scenarioSlug: string }>
}

const ScenarioPage = async ({ params }: ScenarioPageProps) => {
  const { scenarioSlug } = await params
  const scenario = PRACTICE_SCENARIOS[scenarioSlug]

  if (!scenario) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/training" className="hover:text-[var(--color-primary)]">
          Training
        </Link>
        <span>/</span>
        <Link href="/training" className="hover:text-[var(--color-primary)]">
          Practice
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">{scenario.title}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{scenario.title}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{scenario.description}</p>
        <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
          <span className="flex items-center gap-1">
            <Clock size={12} />~{scenario.estimatedMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Target size={12} />
            {scenario.steps.length} steps
          </span>
        </div>
      </div>

      <ScenarioRunner scenario={scenario} />

      <div className="pt-4">
        <Link href="/training">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={14} />
            Back to Training
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default ScenarioPage
