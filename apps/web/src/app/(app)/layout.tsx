'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Ticket,
  Users,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { CommandPalette } from '@/components/layout/command-palette'
import { NotificationBell } from '@/components/layout/notification-bell'
import { UserMenu } from '@/components/layout/user-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Tickets', href: '/tickets', icon: Ticket },
  { label: 'Teams', href: '/teams', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const MOBILE_BREAKPOINT = 768

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [commandOpen, setCommandOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Mobile sidebar backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={closeSidebar}
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeSidebar()
          }}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] transform transition-transform duration-200 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'flex w-[var(--sidebar-width)]'
        } flex-col border-r border-[var(--color-border)] bg-[var(--sidebar)]`}
        style={{ color: 'var(--sidebar-foreground)' }}
      >
        {/* Logo area */}
        <div className="flex h-[var(--topbar-height)] items-center justify-between gap-2 px-6">
          <div className="flex items-center gap-2">
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
          {isMobile && (
            <button
              type="button"
              onClick={closeSidebar}
              className="rounded-[var(--radius-md)] p-1.5 opacity-70 hover:opacity-100"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
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
                onClick={isMobile ? closeSidebar : undefined}
                className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium opacity-70 transition-all hover:bg-[var(--sidebar-accent)] hover:opacity-100"
              >
                <Icon size={20} />
                {item.label}
              </a>
            )
          })}
        </nav>

        {/* Theme toggle */}
        <div className="border-t border-[var(--sidebar-border)] px-3 py-3">
          <ThemeToggle />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-[var(--topbar-height)] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger menu */}
            {isMobile && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="rounded-[var(--radius-md)] p-1.5 transition-colors hover:bg-[var(--color-surface-secondary)]"
                aria-label="Open sidebar"
              >
                <Menu size={20} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            )}

            {/* Search trigger — opens command palette */}
            <button
              type="button"
              onClick={openCommandPalette}
              className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 py-1.5 transition-colors hover:border-[var(--color-primary)]"
            >
              <Search size={16} className="text-[var(--color-text-tertiary)]" />
              <span className="hidden text-sm text-[var(--color-text-tertiary)] sm:inline">
                Search projects, tickets...
              </span>
              <kbd className="ml-2 hidden rounded border border-[var(--color-border)] px-1.5 py-0.5 text-xs text-[var(--color-text-tertiary)] sm:inline">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <NotificationBell />

            <UserMenu />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>

      {/* Command Palette (Cmd+K) */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}

export default AppLayout
