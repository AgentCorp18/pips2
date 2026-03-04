'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, Circle, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

type ScenarioStep = { step: number; title: string; description: string; prompt: string }

type ScenarioData = {
  slug: string
  title: string
  description: string
  context: string
  steps: ScenarioStep[]
}

const STEP_COLORS: Record<number, string> = {
  1: '#3B82F6',
  2: '#F59E0B',
  3: '#10B981',
  4: '#6366F1',
  5: '#CA8A04',
  6: '#0891B2',
}
const STEP_LABELS: Record<number, string> = {
  1: 'Identify',
  2: 'Analyze',
  3: 'Generate',
  4: 'Select & Plan',
  5: 'Implement',
  6: 'Evaluate',
}

export const ScenarioRunner = ({ scenario }: { scenario: ScenarioData }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const activeStep = scenario.steps[currentStep]
  const allDone = completedSteps.size === scenario.steps.length

  const handleSubmitStep = () => {
    if (!activeStep || !responses[currentStep]?.trim()) return
    const updated = new Set(completedSteps)
    updated.add(currentStep)
    setCompletedSteps(updated)

    if (currentStep < scenario.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  return (
    <div className="space-y-6" data-testid="scenario-runner">
      {/* Scenario context */}
      <Card>
        <CardContent className="space-y-3 py-5">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-[var(--color-primary)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Scenario Context
            </h3>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {scenario.context}
          </p>
        </CardContent>
      </Card>

      {/* Step progress */}
      <nav aria-label="Scenario steps" className="flex items-center gap-2">
        {scenario.steps.map((step, index) => {
          const isDone = completedSteps.has(index)
          const isCurrent = index === currentStep
          const color = STEP_COLORS[step.step] ?? '#6366F1'

          return (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentStep(index)}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Step ${step.step}: ${STEP_LABELS[step.step] ?? ''}${isDone ? ' (completed)' : ''}`}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                isCurrent ? 'ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: isDone ? color + '20' : isCurrent ? color + '15' : 'transparent',
                color: color,
                borderColor: color,
                ...(isCurrent ? { ringColor: color } : {}),
              }}
            >
              {isDone ? (
                <CheckCircle2 size={12} aria-hidden="true" />
              ) : (
                <Circle size={12} aria-hidden="true" />
              )}
              Step {step.step}
            </button>
          )
        })}
      </nav>

      {/* Active step */}
      {activeStep && !allDone && (
        <Card>
          <CardContent className="space-y-4 py-5">
            <div className="flex items-center gap-2">
              <Badge
                style={{
                  backgroundColor: (STEP_COLORS[activeStep.step] ?? '#6366F1') + '20',
                  color: STEP_COLORS[activeStep.step] ?? '#6366F1',
                }}
              >
                Step {activeStep.step} — {STEP_LABELS[activeStep.step] ?? ''}
              </Badge>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                {activeStep.title}
              </h3>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">{activeStep.description}</p>
            <div className="rounded-lg bg-[var(--color-surface-secondary)] p-4 text-sm text-[var(--color-text-primary)]">
              {activeStep.prompt}
            </div>
            <Textarea
              value={responses[currentStep] ?? ''}
              onChange={(e) => setResponses({ ...responses, [currentStep]: e.target.value })}
              placeholder="Write your response here..."
              aria-label={`Response for Step ${activeStep.step}: ${activeStep.title}`}
              className="min-h-[120px] text-sm"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitStep}
                disabled={!responses[currentStep]?.trim()}
                size="sm"
                className="gap-2"
              >
                {currentStep < scenario.steps.length - 1 ? (
                  <>
                    Next Step <ArrowRight size={14} />
                  </>
                ) : (
                  <>
                    Complete Scenario <CheckCircle2 size={14} />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion */}
      {allDone && (
        <Card className="border-emerald-200 bg-emerald-50" role="alert">
          <CardContent className="space-y-3 py-6 text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-600" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-emerald-800">Scenario Complete!</h3>
            <p className="text-sm text-emerald-700">
              You have worked through all {scenario.steps.length} steps of this practice scenario.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step responses review */}
      {completedSteps.size > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Your Responses</h3>
          {scenario.steps.map((step, index) => {
            if (!completedSteps.has(index)) return null
            return (
              <Card key={index} className="border-emerald-200/50">
                <CardContent className="py-3">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    <span className="font-medium text-[var(--color-text-primary)]">
                      Step {step.step}: {step.title}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[var(--color-text-secondary)] line-clamp-3">
                    {responses[index]}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
