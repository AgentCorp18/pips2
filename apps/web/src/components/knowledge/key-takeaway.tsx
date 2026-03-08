import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type KeyTakeawayProps = {
  children: ReactNode
  stepColor?: string
  className?: string
}

export const KeyTakeaway = ({ children, stepColor, className }: KeyTakeawayProps) => {
  const borderColor = stepColor ?? 'var(--color-primary)'

  return (
    <div
      data-testid="key-takeaway"
      className={cn('rounded-lg border-2 p-5', className)}
      style={{
        borderColor,
        background: `linear-gradient(135deg, ${borderColor}08 0%, ${borderColor}03 100%)`,
      }}
    >
      <div className="flex items-start gap-3">
        <Sparkles
          size={20}
          className="mt-0.5 shrink-0"
          style={{ color: borderColor }}
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold" style={{ color: borderColor }}>
            Key Takeaway
          </p>
          <div className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
