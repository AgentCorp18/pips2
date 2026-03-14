import Link from 'next/link'
import { Rocket, ArrowRight, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ContentBreadcrumb } from '@/components/knowledge/content-breadcrumb'
import { GETTING_STARTED_STEPS } from '@pips/shared'

const GettingStartedPage = () => {
  return (
    <div data-testid="getting-started-page" className="mx-auto max-w-4xl space-y-6">
      {/* Breadcrumb */}
      <ContentBreadcrumb
        items={[
          { label: 'Knowledge Hub', href: '/knowledge' },
          { label: 'Guide', href: '/knowledge/guide' },
          { label: 'Getting Started', href: '/knowledge/guide/getting-started' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'var(--color-step-3-subtle)' }}
        >
          <Rocket size={20} className="text-[var(--color-step-3)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Getting Started with PIPS
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            From team assembly to your first improvement cycle
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-0">
        {GETTING_STARTED_STEPS.map((item, index) => {
          const isLast = index === GETTING_STARTED_STEPS.length - 1
          return (
            <div
              key={item.step}
              data-testid={`getting-started-step-${index}`}
              className="relative flex gap-4 pb-8"
            >
              {/* Vertical line + circle */}
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
                  {item.step}
                </div>
                {!isLast && <div className="w-0.5 grow bg-[var(--color-primary)]/20" />}
              </div>

              {/* Content */}
              <div className="space-y-2 pb-2 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                    {item.title}
                  </h3>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Clock size={12} />
                    {item.duration}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {item.description}
                </p>
                {item.tips.length > 0 && (
                  <ul className="space-y-1">
                    {item.tips.map((tip) => (
                      <li
                        key={tip}
                        className="flex items-start gap-2 text-sm text-[var(--color-text-tertiary)]"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-text-tertiary)]" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className="rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-6 text-center">
        <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
          Ready to begin?
        </h3>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          Create your first PIPS project and start your improvement journey.
        </p>
        <Button asChild>
          <Link href="/projects">
            Create your first project
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export { GettingStartedPage }
export default GettingStartedPage
