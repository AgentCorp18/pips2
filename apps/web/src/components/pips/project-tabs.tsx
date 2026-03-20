'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Columns3, FileText } from 'lucide-react'

type ProjectTabsProps = {
  projectId: string
  /** Controls which tabs are shown. Simple projects hide the Forms tab. */
  projectType?: 'pips' | 'simple'
}

const ALL_TABS = [
  {
    key: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    href: '',
    showFor: ['pips', 'simple'],
  },
  { key: 'board', label: 'Board', icon: Columns3, href: '/board', showFor: ['pips', 'simple'] },
  { key: 'forms', label: 'Forms', icon: FileText, href: '/forms', showFor: ['pips'] },
] as const

export const ProjectTabs = ({ projectId, projectType = 'pips' }: ProjectTabsProps) => {
  const pathname = usePathname()
  const basePath = `/projects/${projectId}`

  const activeTab = (() => {
    if (pathname.startsWith(`${basePath}/board`)) return 'board'
    if (pathname.startsWith(`${basePath}/forms`)) return 'forms'
    // Steps and overview are all part of the Overview tab
    return 'overview'
  })()

  const visibleTabs = ALL_TABS.filter((tab) =>
    (tab.showFor as readonly string[]).includes(projectType),
  )

  return (
    <nav className="flex gap-1 rounded-[var(--radius-lg)] bg-[var(--color-surface-secondary)] p-1">
      {visibleTabs.map((tab) => {
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
