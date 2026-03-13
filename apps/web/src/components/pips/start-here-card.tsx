import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Sparkles } from 'lucide-react'

type StartHereCardProps = {
  projectId: string
}

export const StartHereCard = ({ projectId }: StartHereCardProps) => (
  <Card
    className="border-2 border-[var(--color-primary)] bg-[var(--color-primary-subtle)]"
    data-testid="start-here-card"
  >
    <CardContent className="flex items-center gap-4 py-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]">
        <Sparkles size={24} className="text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          Start here: Define your problem
        </h3>
        <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
          Every PIPS project begins with a clear Problem Statement. This 20-minute exercise sets the
          foundation for everything that follows.
        </p>
      </div>
      <Link
        href={`/projects/${projectId}/steps/1/forms/problem_statement`}
        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        data-testid="start-here-link"
      >
        Begin Step 1
        <ArrowRight size={14} />
      </Link>
    </CardContent>
  </Card>
)
