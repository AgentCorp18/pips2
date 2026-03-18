import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { PIPS_STEPS, STEP_CONTENT } from '@pips/shared'
import type { PipsStepNumber } from '@pips/shared'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Forms',
  description: 'Practice PIPS forms independently in sandbox mode.',
}

/** Map form type slug to URL-safe slug (underscores → hyphens) */
const toUrlSlug = (formType: string) => formType.replace(/_/g, '-')

const FormsPage = () => {
  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          >
            <FileText size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
              data-testid="forms-page-heading"
            >
              Forms
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Practice any PIPS form independently — your work saves locally in your browser.
            </p>
          </div>
        </div>
      </div>

      <div className="step-gradient-stripe mb-6 rounded-full" />

      <div className="space-y-8">
        {PIPS_STEPS.map((step) => {
          const content = STEP_CONTENT[step.number as PipsStepNumber]
          return (
            <div key={step.number}>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: step.color }}
                >
                  {step.number}
                </span>
                <h2
                  className="text-base font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Step {step.number}: {step.name}
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {content.forms.map((form) => (
                  <Link
                    key={form.type}
                    href={`/forms/sandbox/${toUrlSlug(form.type)}`}
                    className="group block"
                  >
                    <Card className="h-full transition-all hover:shadow-[var(--shadow-low)] group-hover:border-[var(--color-primary-light)]">
                      <CardContent className="flex h-full flex-col justify-between gap-2 p-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium group-hover:text-[var(--color-primary)]">
                              {form.name}
                            </p>
                            <Badge variant="outline" className="text-[9px]">
                              Sandbox
                            </Badge>
                          </div>
                          <p
                            className="mt-1 text-xs leading-relaxed"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {form.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: step.color }}
                          />
                          <span
                            className="text-[10px]"
                            style={{ color: 'var(--color-text-tertiary)' }}
                          >
                            Step {step.number}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FormsPage
