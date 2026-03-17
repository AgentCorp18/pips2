import type { Metadata } from 'next'
import {
  Users,
  UserCheck,
  ShieldCheck,
  UserX,
  Building2,
  FolderKanban,
  Ticket,
  FileText,
} from 'lucide-react'
import { getAdminDashboardStats } from './actions'
import type { PlatformStats } from './actions'

export const metadata: Metadata = {
  title: 'Admin Dashboard — PIPS',
  description: 'Platform-level admin dashboard for PIPS.',
}

type StatCardConfig = {
  label: string
  key: keyof PlatformStats
  icon: React.ElementType
  color: string
  bgColor: string
}

const STAT_CARDS: StatCardConfig[] = [
  {
    label: 'Total Users',
    key: 'totalUsers',
    icon: Users,
    color: '#2563EB',
    bgColor: 'rgba(37, 99, 235, 0.08)',
  },
  {
    label: 'Active Users',
    key: 'activeUsers',
    icon: UserCheck,
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.08)',
  },
  {
    label: 'System Admins',
    key: 'systemAdmins',
    icon: ShieldCheck,
    color: '#7C3AED',
    bgColor: 'rgba(124, 58, 237, 0.08)',
  },
  {
    label: 'Deactivated',
    key: 'deactivatedUsers',
    icon: UserX,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.08)',
  },
  {
    label: 'Organizations',
    key: 'totalOrgs',
    icon: Building2,
    color: '#4338CA',
    bgColor: 'rgba(67, 56, 202, 0.08)',
  },
  {
    label: 'Projects',
    key: 'totalProjects',
    icon: FolderKanban,
    color: '#D97706',
    bgColor: 'rgba(217, 119, 6, 0.08)',
  },
  {
    label: 'Tickets',
    key: 'totalTickets',
    icon: Ticket,
    color: '#0891B2',
    bgColor: 'rgba(8, 145, 178, 0.08)',
  },
  {
    label: 'Forms',
    key: 'totalForms',
    icon: FileText,
    color: '#0E7490',
    bgColor: 'rgba(14, 116, 144, 0.08)',
  },
]

const AdminDashboardPage = async () => {
  let stats: PlatformStats = {
    totalUsers: 0,
    activeUsers: 0,
    deactivatedUsers: 0,
    systemAdmins: 0,
    totalOrgs: 0,
    totalProjects: 0,
    totalTickets: 0,
    totalForms: 0,
  }

  try {
    stats = await getAdminDashboardStats()
  } catch (err) {
    console.error('[AdminDashboard] Failed to load stats:', err)
  }

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Platform Overview
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          System-wide statistics across all organizations and users.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          const value = stats[card.key]
          return (
            <div
              key={card.key}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-5"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-low)',
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <Icon size={18} style={{ color: card.color }} aria-hidden="true" />
                </div>
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {card.label}
                </span>
              </div>
              <div
                className="text-3xl font-bold tabular-nums"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {value.toLocaleString()}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminDashboardPage
