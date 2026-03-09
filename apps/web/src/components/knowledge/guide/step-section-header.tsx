import { cn } from '@/lib/utils'

type StepSectionHeaderProps = {
  stepNumber: number
  stepName: string
  stepColor: string
  guidingQuestion: string
  className?: string
}

export const StepSectionHeader = ({
  stepNumber,
  stepName,
  stepColor,
  guidingQuestion,
  className,
}: StepSectionHeaderProps) => {
  return (
    <div
      data-testid="step-section-header"
      className={cn('w-full rounded-lg px-6 py-8 md:px-10', className)}
      style={{ backgroundColor: `${stepColor}1A` }}
    >
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
          style={{ backgroundColor: stepColor }}
          aria-hidden="true"
        >
          {stepNumber}
        </div>
        <div className="min-w-0">
          <h2
            className="text-2xl font-bold tracking-tight md:text-3xl"
            style={{ fontFamily: 'var(--font-display)', color: stepColor }}
          >
            Step {stepNumber}: {stepName}
          </h2>
          <p className="mt-1 text-base italic text-muted-foreground">{guidingQuestion}</p>
        </div>
      </div>
    </div>
  )
}
