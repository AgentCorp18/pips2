'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Shield,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react'
import { useMounted } from '@/hooks/use-mounted'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { label: 'Audit Log', href: '/admin/audit-log', icon: FileText },
]

const MOBILE_BREAKPOINT = 768

type AdminShellProps = {
  children: React.ReactNode
}

export const AdminShell = ({ children }: AdminShellProps) => {
  const pathname = usePathname()
  const mounted = useMounted()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Skip to main content */}
      <a
        href="#admin-main-content"
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
        aria-label="Admin Sidebar"
        className={`${
          mounted && isMobile
            ? `fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] transform transition-transform duration-200 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'flex w-[var(--sidebar-width)]'
        } flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]`}
        style={{ color: 'var(--sidebar-foreground)' }}
      >
        {/* Logo area */}
        <div className="flex h-[var(--topbar-height)] items-center justify-between gap-2 px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-purple-600/20">
              <Shield size={18} className="text-purple-400" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold tracking-wide">PIPS Admin</span>
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

        {/* Step color gradient stripe */}
        <div
          className="h-[3px] w-full shrink-0"
          style={{
            background:
              'linear-gradient(90deg, #2563EB 0%, #D97706 20%, #059669 40%, #4338CA 60%, #CA8A04 80%, #0891B2 100%)',
          }}
          aria-hidden="true"
        />

        {/* Back to App link */}
        <div className="border-b border-[var(--sidebar-border)] px-3 py-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium opacity-70 transition-all hover:bg-[var(--sidebar-accent)] hover:opacity-100"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to App
          </Link>
        </div>

        {/* Navigation */}
        <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-3 py-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            // Exact match for /admin, prefix match for sub-pages
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={mounted && isMobile ? closeSidebar : undefined}
                aria-current={isActive ? 'page' : undefined}
                data-testid={`admin-nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
                className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-all hover:bg-[var(--sidebar-accent)] hover:opacity-100 ${
                  isActive ? 'bg-[var(--sidebar-accent)] opacity-100' : 'opacity-70'
                }`}
              >
                <Icon size={20} aria-hidden="true" />
                {item.label}
              </a>
            )
          })}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-[var(--topbar-height)] shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
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
            <div className="flex items-center gap-2">
              <Shield
                size={16}
                style={{ color: 'var(--color-text-secondary)' }}
                aria-hidden="true"
              />
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Platform Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main id="admin-main-content" className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
