'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { useMounted } from '@/hooks/use-mounted'

const CYCLE: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']

const ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const

const LABELS = {
  light: 'Switch to dark mode',
  dark: 'Switch to system mode',
  system: 'Switch to light mode',
} as const

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  // Before mount, render the "system" icon to match SSR output
  const displayTheme = mounted ? theme : 'system'
  const Icon = ICONS[displayTheme]

  const cycle = () => {
    const idx = CYCLE.indexOf(theme)
    const next = CYCLE[(idx + 1) % CYCLE.length] ?? 'system'
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium opacity-70 transition-all hover:bg-[var(--sidebar-accent)] hover:opacity-100"
      aria-label={LABELS[displayTheme]}
      title={LABELS[displayTheme]}
    >
      <Icon size={20} />
      <span>
        {displayTheme === 'light' ? 'Light' : displayTheme === 'dark' ? 'Dark' : 'System'}
      </span>
    </button>
  )
}
