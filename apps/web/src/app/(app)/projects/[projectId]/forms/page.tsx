import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { STEP_CONTENT } from '@pips/shared'
import type { PipsStepNumber } from '@pips/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/** Map form_type (DB value) to URL slug (directory name) */
const FORM_TYPE_TO_SLUG: Record<string, string> = {
  problem_statement: 'problem_statement',
  impact_assessment: 'impact_assessment',
  fishbone: 'fishbone',
  five_why: 'five_why',
  force_field: 'force_field',
  checksheet: 'checksheet',
  brainstorming: 'brainstorming',
  brainwriting: 'brainwriting',
  paired_comparisons: 'paired_comparisons',
  criteria_matrix: 'criteria-matrix',
  raci: 'raci',
  implementation_plan: 'implementation-plan',
  milestone_tracker: 'milestone-tracker',
  implementation_checklist: 'implementation-checklist',
  before_after: 'before-after',
  evaluation: 'evaluation',
  lessons_learned: 'lessons-learned',
  balance_sheet: 'balance_sheet',
}

const STEP_NUMBERS: PipsStepNumber[] = [1, 2, 3, 4, 5, 6]

const ProjectFormsPage = async ({ params }: { params: Promise<{ projectId: string }> }) => {
  const { projectId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, current_step')
    .eq('id', projectId)
    .single()

  if (!project) {
    notFound()
  }

  const { data: forms } = await supabase
    .from('project_forms')
    .select('form_type, step_number, data')
    .eq('project_id', projectId)

  const filledForms = new Set(
    (forms ?? [])
      .filter((f) => {
        const data = f.data as Record<string, unknown> | null
        return data && Object.keys(data).length > 0
      })
      .map((f) => `${f.step_number}-${f.form_type}`),
  )

  return (
    <div className="space-y-6">
      {STEP_NUMBERS.map((stepNum) => {
        const content = STEP_CONTENT[stepNum]
        const filledCount = content.forms.filter((f) =>
          filledForms.has(`${stepNum}-${f.type}`),
        ).length

        return (
          <Card key={stepNum}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`step-${stepNum} flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white`}
                  style={{ backgroundColor: `var(--color-step-${stepNum})` }}
                >
                  {stepNum}
                </div>
                <CardTitle className="text-base">
                  Step {stepNum}: {content.title}
                </CardTitle>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {filledCount} / {content.forms.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {content.forms.map((form) => {
                  const isFilled = filledForms.has(`${stepNum}-${form.type}`)
                  const slug = FORM_TYPE_TO_SLUG[form.type] ?? form.type

                  return (
                    <Link
                      key={form.type}
                      href={`/projects/${projectId}/steps/${stepNum}/forms/${slug}`}
                      className={cn(
                        'flex items-center justify-between rounded-[var(--radius-md)] border px-4 py-3 transition-all hover:bg-[var(--color-surface-secondary)]',
                        isFilled
                          ? 'border-[var(--color-success)] bg-[var(--color-success-subtle)]'
                          : 'border-[var(--color-border)]',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {isFilled ? (
                          <CheckCircle2 size={18} className="text-[var(--color-success)]" />
                        ) : (
                          <Circle size={18} className="text-[var(--color-text-tertiary)]" />
                        )}
                        <div>
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {form.name}
                          </span>
                          <p className="text-xs text-[var(--color-text-tertiary)]">
                            {form.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {form.required && (
                          <Badge variant="secondary" className="text-[10px]">
                            Required
                          </Badge>
                        )}
                        <ArrowRight size={14} className="text-[var(--color-text-tertiary)]" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default ProjectFormsPage
