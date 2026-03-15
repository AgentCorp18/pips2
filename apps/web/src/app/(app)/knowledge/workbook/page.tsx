import Link from 'next/link'
import { ClipboardList, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PIPS_STEPS } from '@pips/shared'
import { STEP_CONTENT } from '@pips/shared'

const WorkbookPage = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'var(--color-step-2-subtle)' }}
        >
          <ClipboardList size={20} className="text-[var(--color-step-2)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Workbook</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Hands-on practice — exercises, templates, and form-based activities
          </p>
        </div>
      </div>

      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/knowledge" className="hover:text-[var(--color-primary)]">
          Knowledge Hub
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">Workbook</span>
      </nav>

      {/* Step exercises */}
      <div className="space-y-4">
        {PIPS_STEPS.map((step) => {
          const content = STEP_CONTENT[step.number as 1 | 2 | 3 | 4 | 5 | 6]
          return (
            <Card key={step.number}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.number}
                  </div>
                  <CardTitle className="text-base">
                    Step {step.number}: {step.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {content.forms.map((form) => (
                    <Link
                      key={form.type}
                      href={`/knowledge/workbook/${step.number}`}
                      className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 transition-colors hover:bg-[var(--color-surface-secondary)]"
                    >
                      <div>
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                          {form.name}
                        </span>
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                          {form.description}
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-[var(--color-text-tertiary)]" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default WorkbookPage
