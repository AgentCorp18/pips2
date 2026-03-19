import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, TicketCheck, AlertTriangle, CheckCircle2, Users } from 'lucide-react'
import type { DashboardStats } from '@/app/(app)/dashboard/actions'

type StatCardsProps = {
  stats: DashboardStats
}

type CardDef = {
  key: keyof DashboardStats
  title: string
  icon: typeof FolderKanban
  color: string
  testId: string
  accentWhenPositive?: string
  href?: string
}

const CARDS: CardDef[] = [
  {
    key: 'totalProjects',
    title: 'Total Projects',
    icon: FolderKanban,
    color: 'var(--color-step-1)',
    testId: 'stat-total-projects',
    href: '/projects',
  },
  {
    key: 'openTickets',
    title: 'Open Tickets',
    icon: TicketCheck,
    color: 'var(--color-step-2)',
    testId: 'stat-open-tickets',
    href: '/tickets?status=todo&status=in_progress&status=in_review&status=blocked',
  },
  {
    key: 'overdueTickets',
    title: 'Overdue',
    icon: AlertTriangle,
    color: 'var(--color-step-2)',
    accentWhenPositive: 'var(--color-signal-red)',
    testId: 'stat-overdue',
    href: '/tickets?quick=overdue',
  },
  {
    key: 'completedThisMonth',
    title: 'Completed This Month',
    icon: CheckCircle2,
    color: 'var(--color-step-3)',
    testId: 'stat-completed',
    href: '/tickets?status=done',
  },
  {
    key: 'teamMembers',
    title: 'Team Members',
    icon: Users,
    color: 'var(--color-step-4)',
    testId: 'stat-team-members',
    href: '/settings/members',
  },
]

export const StatCards = ({ stats }: StatCardsProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {CARDS.map((card) => {
        const Icon = card.icon
        const value = stats[card.key]
        const isOverduePositive = card.key === 'overdueTickets' && value > 0
        const iconColor = isOverduePositive ? card.accentWhenPositive : card.color

        const inner = (
          <Card data-testid={card.testId}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {card.title}
              </CardTitle>
              <Icon size={18} style={{ color: iconColor }} />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                style={{
                  color: isOverduePositive
                    ? 'var(--color-signal-red)'
                    : 'var(--color-text-primary)',
                }}
              >
                {value}
              </div>
            </CardContent>
          </Card>
        )

        if (card.href) {
          return (
            <Link key={card.key} href={card.href} className="transition-opacity hover:opacity-80">
              {inner}
            </Link>
          )
        }

        // For non-linked cards, wrap in a fragment with key
        return <div key={card.key}>{inner}</div>
      })}
    </div>
  )
}
