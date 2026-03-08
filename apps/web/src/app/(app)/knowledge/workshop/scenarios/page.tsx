import Link from 'next/link'
import { Target, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WORKSHOP_MODULE_DATA } from '../module-data'

// ---------------------------------------------------------------------------
// Collect all practice scenarios from every workshop module
// ---------------------------------------------------------------------------

type ScenarioWithSource = {
  slug: string
  title: string
  description: string
  moduleSlug: string
  moduleTitle: string
  difficulty: string
}

const getAllScenarios = (): ScenarioWithSource[] => {
  const scenarios: ScenarioWithSource[] = []

  for (const mod of Object.values(WORKSHOP_MODULE_DATA)) {
    for (const scenario of mod.practiceScenarios) {
      scenarios.push({
        slug: scenario.slug,
        title: scenario.title,
        description: scenario.description,
        moduleSlug: mod.slug,
        moduleTitle: mod.title,
        difficulty: mod.difficulty,
      })
    }
  }

  return scenarios
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'text-emerald-600',
  Intermediate: 'text-amber-600',
  Advanced: 'text-red-600',
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const ScenariosPage = () => {
  const scenarios = getAllScenarios()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'rgba(8, 145, 178, 0.08)' }}
        >
          <Target size={20} className="text-[#0891B2]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Practice Scenarios
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Real-world case studies for team practice across all workshop modules
          </p>
        </div>
      </div>

      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/knowledge" className="hover:text-[var(--color-primary)]">
          Knowledge Hub
        </Link>
        <span>/</span>
        <Link href="/knowledge/workshop" className="hover:text-[var(--color-primary)]">
          Workshop
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">Scenarios</span>
      </nav>

      <div className="grid gap-4 sm:grid-cols-2">
        {scenarios.map((scenario) => (
          <Link key={scenario.slug} href={`/training/practice/${scenario.slug}`}>
            <Card className="group h-full cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-sm">
              <CardContent className="flex h-full flex-col justify-between py-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {scenario.moduleTitle}
                    </Badge>
                    <span
                      className={`text-[10px] font-medium ${DIFFICULTY_COLORS[scenario.difficulty] ?? ''}`}
                    >
                      {scenario.difficulty}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    {scenario.title}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    {scenario.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-[var(--color-primary)] opacity-0 transition-opacity group-hover:opacity-100">
                  Start practice
                  <ArrowRight size={12} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {scenarios.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-8 text-center">
          <Target size={24} className="mx-auto text-[var(--color-text-tertiary)]" />
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            No practice scenarios available yet.
          </p>
        </div>
      )}
    </div>
  )
}

export default ScenariosPage
