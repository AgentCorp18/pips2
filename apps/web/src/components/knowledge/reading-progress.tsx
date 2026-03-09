'use client'

import { BookOpen, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ReadingProgressProps = {
  title: string
  totalItems: number
  completedItems: number
  className?: string
}

export const ReadingProgress = ({
  title,
  totalItems,
  completedItems,
  className,
}: ReadingProgressProps) => {
  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  const isComplete = percentage >= 100

  // SVG progress ring dimensions
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <Card data-testid="reading-progress" className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BookOpen size={14} className="text-[var(--color-primary)]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {/* Progress Ring */}
          <div
            className="relative flex h-16 w-16 shrink-0 items-center justify-center"
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${completedItems} of ${totalItems} items completed`}
          >
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
              <circle
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <span
              className="absolute text-xs font-bold text-[var(--color-text-primary)]"
              data-testid="progress-percentage"
            >
              {percentage}%
            </span>
          </div>

          {/* Progress details */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {completedItems} of {totalItems} completed
              </span>
              {isComplete && (
                <CheckCircle size={14} className="text-green-500" data-testid="complete-check" />
              )}
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                data-testid="progress-bar"
                className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            {isComplete && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                All done! Great job.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
