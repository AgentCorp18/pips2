'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type ExpandableSectionProps = {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export const ExpandableSection = ({
  title,
  children,
  defaultOpen = false,
  className,
}: ExpandableSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div
      data-testid="expandable-section"
      className={cn(
        'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-secondary)]"
      >
        {title}
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && (
        <div
          data-testid="expandable-content"
          className="border-t border-[var(--color-border)] px-4 py-3"
        >
          {children}
        </div>
      )}
    </div>
  )
}
