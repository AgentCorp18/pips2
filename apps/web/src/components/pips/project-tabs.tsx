'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Columns3, FileText } from 'lucide-react'

type ProjectTabsProps = {
  projectId: string
}

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '' },
  { key: 'board', label: 'Board', icon: Columns3, href: '/board' },
  { key: 'forms', label: 'Forms', icon: FileText, href: '/forms' },
] as const

export const ProjectTabs = ({ projectId }: ProjectTabsProps) => {
  const pathname = usePathname()
  const basePath = `/projects/${projectId}`

  const activeTab = (() => {
    if (pathname === basePath || pathname === `${basePath}/`) return 'overview'
    if (pathname.startsWith(`${basePath}/board`)) return 'board'
    if (pathname.startsWith(`${basePath}/forms`)) return 'forms'
    return null
  })()

  return (
    <nav className="flex gap-1 rounded-[var(--radius-lg)] bg-[var(--color-surface-secondary)] p-1">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key
        const Icon = tab.icon

        return (
          <Link
            key={tab.key}
            href={`${basePath}${tab.href}`}
            className={cn(
              'flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-all',
              isActive
                ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            )}
          >
            <Icon size={16} />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
