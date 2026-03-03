import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, TicketCheck, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { DashboardStats } from '@/app/(app)/dashboard/actions'

type StatCardsProps = {
  stats: DashboardStats
}

const CARDS = [
  {
    key: 'activeProjects' as const,
    title: 'Active Projects',
    icon: FolderKanban,
    color: 'var(--color-step-1)',
  },
  {
    key: 'openTickets' as const,
    title: 'Open Tickets',
    icon: TicketCheck,
    color: 'var(--color-step-2)',
  },
  {
    key: 'overdueTickets' as const,
    title: 'Overdue',
    icon: AlertTriangle,
    color: 'var(--color-step-2)',
    accentWhenPositive: '#EF4444',
  },
  {
    key: 'completedThisMonth' as const,
    title: 'Completed This Month',
    icon: CheckCircle2,
    color: 'var(--color-step-3)',
  },
]

export const StatCards = ({ stats }: StatCardsProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon
        const value = stats[card.key]
        const isOverduePositive = card.key === 'overdueTickets' && value > 0
        const iconColor = isOverduePositive ? card.accentWhenPositive : card.color

        return (
          <Card key={card.key}>
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
                  color: isOverduePositive ? '#EF4444' : 'var(--color-text-primary)',
                }}
              >
                {value}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
