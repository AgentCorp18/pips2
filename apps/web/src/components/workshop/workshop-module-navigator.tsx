'use client'

import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { WorkshopModule } from '@/app/(app)/knowledge/workshop/actions'

type ModuleNavigatorProps = {
  modules: WorkshopModule[]
  currentIndex: number
  showControls?: boolean
  onNavigate?: (index: number) => void
}

export const WorkshopModuleNavigator = ({
  modules,
  currentIndex,
  showControls = false,
  onNavigate,
}: ModuleNavigatorProps) => {
  const current = modules[currentIndex]
  const canGoBack = currentIndex > 0
  const canGoForward = currentIndex < modules.length - 1

  return (
    <div className="space-y-3">
      {/* Current module highlight */}
      {current && (
        <div className="rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary)]/5 p-3">
          <p className="text-xs font-medium text-[var(--color-primary)]">
            Module {currentIndex + 1} of {modules.length}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
            {current.title}
          </h3>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-xs text-[var(--color-text-tertiary)]">{current.duration}</span>
            {current.notes && (
              <span className="text-xs text-[var(--color-text-secondary)]">{current.notes}</span>
            )}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      {showControls && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoBack}
            onClick={() => onNavigate?.(currentIndex - 1)}
          >
            <ChevronLeft size={14} />
            Previous
          </Button>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {currentIndex + 1} / {modules.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoForward}
            onClick={() => onNavigate?.(currentIndex + 1)}
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
      )}

      {/* Module list */}
      <div className="space-y-1">
        {modules.map((mod, i) => (
          <button
            key={i}
            type="button"
            onClick={() => showControls && onNavigate?.(i)}
            disabled={!showControls}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
              i === currentIndex
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                : i < currentIndex
                  ? 'text-[var(--color-text-tertiary)]'
                  : 'text-[var(--color-text-secondary)]'
            } ${showControls ? 'cursor-pointer hover:bg-[var(--color-surface-secondary)]' : 'cursor-default'}`}
          >
            {i < currentIndex ? (
              <CheckCircle2 size={12} className="shrink-0 text-emerald-500" />
            ) : (
              <Circle
                size={12}
                className={`shrink-0 ${i === currentIndex ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-tertiary)]'}`}
              />
            )}
            <span className="flex-1 truncate">{mod.title}</span>
            <span className="shrink-0 text-[var(--color-text-tertiary)]">{mod.duration}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
