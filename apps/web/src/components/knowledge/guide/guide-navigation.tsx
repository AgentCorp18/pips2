import Link from 'next/link'
import { ChevronLeft, ChevronRight, Wrench, Users, BookOpen, BookText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PIPS_STEPS } from '@pips/shared'
import { PipsCycleDiagram } from './pips-cycle-diagram'

type GuideNavigationProps = {
  currentStep: number
  totalSteps?: number
  className?: string
}

const QUICK_LINKS = [
  { href: '/knowledge/guide/tools', label: 'Tools Library', icon: Wrench },
  { href: '/knowledge/guide/roles', label: 'Roles', icon: Users },
  { href: '/knowledge/guide/getting-started', label: 'Getting Started', icon: BookOpen },
  { href: '/knowledge/guide/glossary', label: 'Glossary', icon: BookText },
] as const

export const GuideNavigation = ({
  currentStep,
  totalSteps = 6,
  className,
}: GuideNavigationProps) => {
  const prevStep = currentStep > 1 ? currentStep - 1 : null
  const nextStep = currentStep < totalSteps ? currentStep + 1 : null
  const isLastStep = currentStep === totalSteps

  const prevStepData = prevStep ? PIPS_STEPS[prevStep - 1] : null
  const nextStepData = nextStep ? PIPS_STEPS[nextStep - 1] : null
  const startOverData = PIPS_STEPS[0]

  return (
    <nav
      data-testid="guide-navigation"
      className={cn('w-full space-y-6', className)}
      aria-label="Guide navigation"
    >
      {/* Prev / Diagram / Next */}
      <div className="flex items-center justify-between gap-4">
        {/* Previous */}
        {prevStepData ? (
          <Link
            href={`/knowledge/guide/step/${prevStep}`}
            data-testid="guide-nav-prev"
            className="group flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: prevStepData.color }}
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">
              Step {prevStep}: {prevStepData.name}
            </span>
            <span className="sm:hidden">Prev</span>
          </Link>
        ) : (
          <div data-testid="guide-nav-prev" />
        )}

        {/* Center diagram */}
        <div className="hidden sm:block">
          <PipsCycleDiagram size="sm" activeStep={currentStep} />
        </div>

        {/* Next or Start Over */}
        {nextStepData ? (
          <Link
            href={`/knowledge/guide/step/${nextStep}`}
            data-testid="guide-nav-next"
            className="group flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: nextStepData.color }}
          >
            <span className="hidden sm:inline">
              Step {nextStep}: {nextStepData.name}
            </span>
            <span className="sm:hidden">Next</span>
            <ChevronRight size={16} />
          </Link>
        ) : isLastStep ? (
          <Link
            href="/knowledge/guide/step/1"
            data-testid="guide-nav-next"
            className="group flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: startOverData.color }}
          >
            <span className="hidden sm:inline">Start Over &rarr; Step 1: {startOverData.name}</span>
            <span className="sm:hidden">Start Over</span>
            <ChevronRight size={16} />
          </Link>
        ) : (
          <div data-testid="guide-nav-next" />
        )}
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap items-center justify-center gap-3 border-t pt-4">
        {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Icon size={14} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
