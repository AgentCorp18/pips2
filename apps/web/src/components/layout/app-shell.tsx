'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Ticket,
  Users,
  Settings,
  Menu,
  X,
  BookOpen,
  GraduationCap,
  BarChart3,
  FileText,
  MessageSquare,
  Target,
  Shield,
} from 'lucide-react'
import { CommandPalette } from '@/components/layout/command-palette'
import { NotificationBell } from '@/components/layout/notification-bell'
import { UserMenu } from '@/components/layout/user-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { OrgSwitcher } from '@/components/layout/org-switcher'
import { useMounted } from '@/hooks/use-mounted'
import type { UserOrg } from '@/app/(app)/actions'

type NavItem = { label: string; href: string; icon: typeof LayoutDashboard; shortcut?: string }
type NavGroup = { section: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    section: 'Work',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, shortcut: 'g d' },
      { label: 'Initiatives', href: '/initiatives', icon: Target, shortcut: 'g i' },
      { label: 'Projects', href: '/projects', icon: FolderKanban, shortcut: 'g p' },
      { label: 'Tickets', href: '/tickets', icon: Ticket, shortcut: 'g t' },
    ],
  },
  {
    section: 'Learn',
    items: [
      { label: 'Knowledge', href: '/knowledge', icon: BookOpen, shortcut: 'g k' },
      { label: 'Training', href: '/training', icon: GraduationCap },
    ],
  },
  {
    section: 'Collaborate',
    items: [
      { label: 'Chat', href: '/chat', icon: MessageSquare, shortcut: 'g c' },
      { label: 'Forms', href: '/forms', icon: FileText },
      { label: 'Teams', href: '/teams', icon: Users },
    ],
  },
  {
    section: 'Admin',
    items: [
      { label: 'Reports', href: '/reports', icon: BarChart3 },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

// Shortcut map for keyboard navigation
const SHORTCUT_MAP: Record<string, string> = {}
for (const group of NAV_GROUPS) {
  for (const item of group.items) {
    if (item.shortcut) {
      const key = item.shortcut.split(' ')[1]!
      SHORTCUT_MAP[key] = item.href
    }
  }
}

const MOBILE_BREAKPOINT = 768

type AppShellProps = {
  children: React.ReactNode
  orgs: UserOrg[]
  currentOrgId: string
  isAdmin?: boolean
}

export const AppShell = ({ children, orgs, currentOrgId, isAdmin }: AppShellProps) => {
  const pathname = usePathname()
  const mounted = useMounted()
  const [commandOpen, setCommandOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport — only after mount to avoid hydration mismatch
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

  // Keyboard shortcuts: Cmd+K for search, g+<key> for navigation
  const [gKeyPending, setGKeyPending] = useState(false)

  useEffect(() => {
    let gTimeout: ReturnType<typeof setTimeout> | null = null

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't fire shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }

      // Cmd+K / Ctrl+K → search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen((prev) => !prev)
        return
      }

      // g+<key> navigation shortcuts
      if (gKeyPending && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const dest = SHORTCUT_MAP[e.key]
        if (dest) {
          e.preventDefault()
          window.location.href = dest
        }
        setGKeyPending(false)
        if (gTimeout) clearTimeout(gTimeout)
        return
      }

      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setGKeyPending(true)
        if (gTimeout) clearTimeout(gTimeout)
        gTimeout = setTimeout(() => setGKeyPending(false), 1500)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (gTimeout) clearTimeout(gTimeout)
    }
  }, [gKeyPending])

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
      {/* Skip to main content — visible on focus for keyboard users */}
      <a
        href="#main-content"
        className="fixed left-2 top-2 z-[100] -translate-y-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Mobile sidebar backdrop */}
      {mounted && isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Sidebar"
        className={`${
          mounted && isMobile
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
            <Link
              href="/"
              aria-label="Visit PIPS marketing website"
              className="flex items-center gap-2 rounded-[var(--radius-md)] opacity-90 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-ring)]"
            >
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {/* Step dot pips — decorative */}
                <span className="step-1 pip-dot pip-dot--sm" />
                <span className="step-2 pip-dot pip-dot--sm" />
                <span className="step-3 pip-dot pip-dot--sm" />
                <span className="step-4 pip-dot pip-dot--sm" />
                <span className="step-5 pip-dot pip-dot--sm" />
                <span className="step-6 pip-dot pip-dot--sm" />
              </div>
              <span className="text-lg font-bold tracking-wide">PIPS</span>
            </Link>
          </div>
          {mounted && isMobile && (
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

        <div className="step-gradient-stripe" aria-hidden="true" />

        {/* Org switcher — below logo stripe, above navigation */}
        <div className="px-3 py-2">
          <OrgSwitcher orgs={orgs} currentOrgId={currentOrgId} />
        </div>

        {/* Navigation — grouped by section */}
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-2">
          {NAV_GROUPS.map((group, groupIdx) => (
            <div key={group.section} className={groupIdx > 0 ? 'mt-4' : ''}>
              <p
                className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--sidebar-foreground)', opacity: 0.45 }}
                data-testid={`nav-group-${group.section.toLowerCase()}`}
              >
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={mounted && isMobile ? closeSidebar : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      data-testid={`nav-link-${item.label.toLowerCase()}`}
                      className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-all hover:bg-[var(--sidebar-accent)] hover:opacity-100 ${
                        isActive ? 'bg-[var(--sidebar-accent)] opacity-100' : 'opacity-70'
                      }`}
                    >
                      <Icon size={20} aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && (
                        <kbd className="hidden text-[10px] opacity-40 lg:inline" aria-hidden="true">
                          {item.shortcut}
                        </kbd>
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Keyboard shortcut overlay */}
        {gKeyPending && (
          <div
            className="mx-3 mb-2 rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-2 text-center text-xs"
            style={{ color: 'var(--sidebar-foreground)' }}
            data-testid="shortcut-overlay"
            aria-live="polite"
          >
            Press a key: <strong>d</strong>=Dashboard <strong>p</strong>=Projects <strong>t</strong>
            =Tickets <strong>i</strong>=Initiatives <strong>k</strong>=Knowledge <strong>c</strong>
            =Chat
          </div>
        )}

        {/* Admin link — only shown to system admins */}
        {isAdmin && (
          <div className="border-t border-[var(--sidebar-border)] px-3 py-2">
            <a
              href="/admin"
              data-testid="nav-link-admin"
              className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium opacity-70 transition-all hover:bg-[var(--sidebar-accent)] hover:opacity-100"
            >
              <Shield size={20} aria-hidden="true" />
              Admin
            </a>
          </div>
        )}

        {/* Theme toggle */}
        <div className="border-t border-[var(--sidebar-border)] px-3 py-3">
          <ThemeToggle />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="shrink-0 flex h-[var(--topbar-height)] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger menu */}
            {mounted && isMobile && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="rounded-[var(--radius-md)] p-2.5 transition-colors hover:bg-[var(--color-surface-secondary)]"
                aria-label="Open sidebar"
              >
                <Menu size={20} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            )}

            {/* Search trigger — opens command palette */}
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Search projects, tickets (Ctrl+K)"
              data-testid="search-trigger"
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

        {/* Page content — sole scroll container for app pages */}
        <main id="main-content" className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Command Palette (Cmd+K) */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
