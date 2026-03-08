'use client'

import type { ReactNode } from 'react'
import { Lightbulb, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type CalloutVariant = 'tip' | 'warning' | 'note' | 'success'

type CalloutProps = {
  variant?: CalloutVariant
  title?: string
  children: ReactNode
  className?: string
}

const VARIANT_CONFIG: Record<
  CalloutVariant,
  {
    icon: typeof Lightbulb
    borderColor: string
    bgColor: string
    iconColor: string
    titleColor: string
    defaultTitle: string
  }
> = {
  tip: {
    icon: Lightbulb,
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-700 dark:text-blue-400',
    defaultTitle: 'Tip',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-l-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-700 dark:text-amber-400',
    defaultTitle: 'Warning',
  },
  note: {
    icon: Info,
    borderColor: 'border-l-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/30',
    iconColor: 'text-gray-400',
    titleColor: 'text-gray-600 dark:text-gray-400',
    defaultTitle: 'Note',
  },
  success: {
    icon: CheckCircle,
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    iconColor: 'text-green-500',
    titleColor: 'text-green-700 dark:text-green-400',
    defaultTitle: 'Success',
  },
}

export const Callout = ({ variant = 'note', title, children, className }: CalloutProps) => {
  const config = VARIANT_CONFIG[variant]
  const Icon = config.icon
  const displayTitle = title ?? config.defaultTitle

  return (
    <div
      data-testid={`callout-${variant}`}
      className={cn('rounded-r-lg border-l-4 p-4', config.borderColor, config.bgColor, className)}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className={cn('mt-0.5 shrink-0', config.iconColor)} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-semibold', config.titleColor)}>{displayTitle}</p>
          <div className="mt-1 text-sm text-[var(--color-text-secondary)]">{children}</div>
        </div>
      </div>
    </div>
  )
}
