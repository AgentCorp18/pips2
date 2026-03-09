'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Building2, Users, Bell, ScrollText, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const SETTINGS_NAV_ITEMS = [
  { label: 'General', href: '/settings', icon: Building2 },
  { label: 'Members', href: '/settings/members', icon: Users },
  { label: 'Notifications', href: '/settings/notifications', icon: Bell },
  { label: 'Security', href: '/settings/security', icon: Shield },
  { label: 'Audit Log', href: '/settings/audit-log', icon: ScrollText },
]

export const SettingsNav = () => {
  const pathname = usePathname()

  return (
    <nav className="mb-6 flex gap-1 border-b border-[var(--color-border)]">
      {SETTINGS_NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === '/settings' ? pathname === '/settings' : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-tertiary)] hover:border-[var(--color-border)] hover:text-[var(--color-text-secondary)]',
            )}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
