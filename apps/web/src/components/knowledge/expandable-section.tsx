'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ChevronDown,
  Target,
  Users,
  AlertTriangle,
  Zap,
  Wrench,
  MessageCircle,
  Sparkles,
  Layers,
  Lightbulb,
  Handshake,
  Shield,
  ClipboardList,
  Rocket,
  Timer,
  RefreshCw,
  FlaskConical,
  MessageSquare,
  GitBranch,
  Search,
  Share2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  target: Target,
  users: Users,
  'alert-triangle': AlertTriangle,
  zap: Zap,
  wrench: Wrench,
  'message-circle': MessageCircle,
  sparkles: Sparkles,
  layers: Layers,
  lightbulb: Lightbulb,
  handshake: Handshake,
  shield: Shield,
  'clipboard-list': ClipboardList,
  rocket: Rocket,
  timer: Timer,
  'refresh-cw': RefreshCw,
  'flask-conical': FlaskConical,
  'message-square': MessageSquare,
  'git-branch': GitBranch,
  search: Search,
  'share-2': Share2,
}

type ExpandableSectionProps = {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
  subtitle?: string
  icon?: string
  accentColor?: string
}

export const ExpandableSection = ({
  title,
  children,
  defaultOpen = false,
  className,
  subtitle,
  icon,
  accentColor,
}: ExpandableSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const IconComponent = icon ? ICON_MAP[icon] : undefined

  return (
    <div
      data-testid="expandable-section"
      className={cn(
        'group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-shadow duration-200 hover:shadow-sm',
        isOpen && 'shadow-sm',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="expandable-content"
        className="flex w-full items-center gap-3 rounded-xl px-4 py-4 text-left outline-none transition-colors hover:bg-[var(--color-surface-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-inset"
      >
        {IconComponent && (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: accentColor ? `${accentColor}14` : 'var(--color-surface-secondary)',
              color: accentColor ?? 'var(--color-text-tertiary)',
            }}
          >
            <IconComponent size={18} aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[var(--color-text-primary)]">
            {title}
          </span>
          {subtitle && (
            <span className="mt-0.5 block text-xs leading-snug text-[var(--color-text-tertiary)]">
              {subtitle}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn(
            'shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && (
        <div
          id="expandable-content"
          data-testid="expandable-content"
          className="border-t border-[var(--color-border)] px-4 py-4"
          style={accentColor ? { borderTopColor: `${accentColor}30` } : undefined}
        >
          <div className={cn(IconComponent && 'pl-12')}>{children}</div>
        </div>
      )}
    </div>
  )
}
