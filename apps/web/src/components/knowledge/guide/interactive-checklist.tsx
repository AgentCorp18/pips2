'use client'

import { useState, useCallback } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type InteractiveChecklistProps = {
  stepNumber: number
  items: string[]
  className?: string
}

const storageKey = (step: number) => `pips-guide-checklist-${step}`

const loadChecked = (step: number): Set<number> => {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(storageKey(step))
    if (!raw) return new Set()
    const arr: number[] = JSON.parse(raw)
    return new Set(arr)
  } catch {
    return new Set()
  }
}

export const InteractiveChecklist = ({
  stepNumber,
  items,
  className,
}: InteractiveChecklistProps) => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(() => loadChecked(stepNumber))

  const toggle = useCallback(
    (index: number) => {
      setCheckedItems((prev) => {
        const next = new Set(prev)
        if (next.has(index)) {
          next.delete(index)
        } else {
          next.add(index)
        }
        localStorage.setItem(storageKey(stepNumber), JSON.stringify([...next]))
        return next
      })
    },
    [stepNumber],
  )

  const completed = checkedItems.size
  const total = items.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div data-testid="interactive-checklist" className={cn('space-y-3', className)}>
      {/* Progress */}
      <div data-testid="checklist-progress" className="space-y-1.5">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {completed} of {total} completed
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-[var(--color-primary,#4F46E5)] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <ul className="space-y-2">
        {items.map((item, index) => {
          const checked = checkedItems.has(index)
          return (
            <li key={index}>
              <label
                data-testid={`checklist-item-${index}`}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors',
                  checked
                    ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                    : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                    checked
                      ? 'border-[var(--color-primary,#4F46E5)] bg-[var(--color-primary,#4F46E5)] text-white'
                      : 'border-gray-300 dark:border-gray-600',
                  )}
                >
                  {checked && <Check size={14} strokeWidth={3} />}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggle(index)}
                  aria-label={item}
                />
                <span
                  className={cn(
                    'text-sm leading-relaxed',
                    checked && 'text-[var(--color-text-secondary)] line-through',
                  )}
                >
                  {item}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
