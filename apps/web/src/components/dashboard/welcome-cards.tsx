'use client'

import Link from 'next/link'
import {
  BookOpen,
  FolderKanban,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Circle,
  FlaskConical,
  X,
} from 'lucide-react'
import { useOnboardingProgress } from '@/hooks/use-onboarding-progress'

type OnboardingStep = 'read-overview' | 'explore-sample' | 'create-project' | 'invite-member'

const steps: Array<{
  key: OnboardingStep
  title: string
  description: string
  href: string
  icon: typeof BookOpen
  color: string
}> = [
  {
    key: 'read-overview',
    title: 'Read the 2-minute overview',
    description: 'Learn how the PIPS 6-step methodology works and why it drives results.',
    href: '/knowledge/guide/getting-started',
    icon: BookOpen,
    color: 'var(--color-step-1)',
  },
  {
    key: 'explore-sample',
    title: 'Explore the sample project',
    description: 'See a fully worked example of a PIPS improvement project from start to finish.',
    href: '/projects',
    icon: FlaskConical,
    color: 'var(--color-step-3)',
  },
  {
    key: 'create-project',
    title: 'Create your first project',
    description: 'Start your own improvement project — you can always edit later.',
    href: '/projects/new',
    icon: FolderKanban,
    color: 'var(--color-step-4)',
  },
  {
    key: 'invite-member',
    title: 'Invite a team member',
    description: 'Process improvement is a team sport. Add someone to collaborate with.',
    href: '/settings/members',
    icon: UserPlus,
    color: 'var(--color-step-6)',
  },
]

export const WelcomeCards = () => {
  const { isStepComplete, completeStep, dismiss, allComplete } = useOnboardingProgress()

  if (allComplete) return null

  // Find the first incomplete step
  const currentStepIndex = steps.findIndex((s) => !isStepComplete(s.key))

  return (
    <div data-testid="welcome-cards" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
            data-testid="welcome-cards-heading"
          >
            Your first 30 minutes with PIPS
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Complete these steps to get the most out of your workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]"
          aria-label="Dismiss onboarding"
          data-testid="dismiss-onboarding"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div
            key={step.key}
            className="h-1.5 flex-1 rounded-full"
            style={{
              backgroundColor: isStepComplete(step.key)
                ? 'var(--color-success)'
                : i === currentStepIndex
                  ? 'var(--color-primary)'
                  : 'var(--color-surface-secondary)',
            }}
          />
        ))}
        <span className="ml-1 text-xs text-[var(--color-text-tertiary)]">
          {steps.filter((s) => isStepComplete(s.key)).length}/{steps.length}
        </span>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => {
          const completed = isStepComplete(step.key)
          const isCurrent = index === currentStepIndex
          const isLocked = index > currentStepIndex && !completed
          const Icon = step.icon

          return (
            <div
              key={step.key}
              data-testid={`onboarding-step-${step.key}`}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all ${
                completed
                  ? 'border-[var(--color-success)] bg-[var(--color-success-subtle)] opacity-60'
                  : isCurrent
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)]'
                    : 'border-[var(--color-border)] opacity-50'
              }`}
            >
              <div className="shrink-0">
                {completed ? (
                  <CheckCircle2 size={20} className="text-[var(--color-success)]" />
                ) : (
                  <Circle
                    size={20}
                    style={{ color: isCurrent ? step.color : 'var(--color-text-tertiary)' }}
                  />
                )}
              </div>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${step.color}14` }}
              >
                <Icon size={16} style={{ color: step.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{step.title}</p>
                {isCurrent && (
                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    {step.description}
                  </p>
                )}
              </div>
              {isCurrent && !completed && (
                <Link
                  href={step.href}
                  onClick={() => completeStep(step.key)}
                  className="flex shrink-0 items-center gap-1 rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)]"
                  data-testid={`onboarding-action-${step.key}`}
                >
                  Go
                  <ArrowRight size={12} />
                </Link>
              )}
              {completed && <span className="text-xs text-[var(--color-success)]">Done</span>}
              {isLocked && (
                <span className="text-xs text-[var(--color-text-tertiary)]">Up next</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
