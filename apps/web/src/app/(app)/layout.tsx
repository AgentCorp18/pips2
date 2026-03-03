'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard,
  FolderKanban,
  Ticket,
  Users,
  Settings,
} from 'lucide-react'
import { CommandPalette } from '@/components/layout/command-palette'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Tickets', href: '/tickets', icon: Ticket },
  { label: 'Teams', href: '/teams', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [commandOpen, setCommandOpen] = useState(false)

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const openCommandPalette = useCallback(() => {
    setCommandOpen(true)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Sidebar */}
      <aside
        className="flex w-[var(--sidebar-width)] flex-col border-r border-[var(--color-border)] bg-[var(--sidebar)]"
        style={{ color: 'var(--sidebar-foreground)' }}
      >
        {/* Logo area */}
        <div className="flex h-[var(--topbar-height)] items-center gap-2 px-6">
          <div className="flex items-center gap-1.5">
            {/* Step dot pips */}
            <span className="step-1 pip-dot pip-dot--sm" />
            <span className="step-2 pip-dot pip-dot--sm" />
            <span className="step-3 pip-dot pip-dot--sm" />
            <span className="step-4 pip-dot pip-dot--sm" />
            <span className="step-5 pip-dot pip-dot--sm" />
            <span className="step-6 pip-dot pip-dot--sm" />
          </div>
          <span className="text-lg font-bold tracking-wide">PIPS</span>
        </div>

        <div className="step-gradient-stripe" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium opacity-70 transition-all hover:bg-[var(--sidebar-accent)] hover:opacity-100"
              >
                <Icon size={20} />
                {item.label}
              </a>
            )
          })}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-[var(--topbar-height)] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
          {/* Search trigger — opens command palette */}
          <button
            type="button"
            onClick={openCommandPalette}
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 py-1.5 transition-colors hover:border-[var(--color-primary)]"
          >
            <Search size={16} className="text-[var(--color-text-tertiary)]" />
            <span className="text-sm text-[var(--color-text-tertiary)]">
              Search projects, tickets...
            </span>
            <kbd className="ml-8 rounded border border-[var(--color-border)] px-1.5 py-0.5 text-xs text-[var(--color-text-tertiary)]">
              ⌘K
            </kbd>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative rounded-[var(--radius-md)] p-2 hover:bg-[var(--color-surface-secondary)]"
            >
              <Bell size={20} className="text-[var(--color-text-secondary)]" />
            </button>

            {/* User avatar placeholder */}
            <button
              type="button"
              className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 hover:bg-[var(--color-surface-secondary)]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
                U
              </div>
              <ChevronDown size={16} className="text-[var(--color-text-tertiary)]" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      {/* Command Palette (Cmd+K) */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}

export default AppLayout
