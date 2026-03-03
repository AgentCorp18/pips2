import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Ticket, CheckCircle2, Clock, Target } from 'lucide-react'

type OverviewStatsProps = {
  ticketsCreated: number
  ticketsCompleted: number
  daysActive: number
  stepsCompleted: number
}

export const OverviewStats = ({
  ticketsCreated,
  ticketsCompleted,
  daysActive,
  stepsCompleted,
}: OverviewStatsProps) => {
  const stats = [
    {
      label: 'Tickets Created',
      value: ticketsCreated,
      sub: 'total tickets',
      icon: Ticket,
    },
    {
      label: 'Tickets Completed',
      value: ticketsCompleted,
      sub: 'marked done',
      icon: CheckCircle2,
    },
    {
      label: 'Days Active',
      value: daysActive,
      sub: 'since created',
      icon: Clock,
    },
    {
      label: 'Steps Completed',
      value: `${stepsCompleted} / 6`,
      sub: 'PIPS steps',
      icon: Target,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                <Icon size={16} />
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{stat.sub}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
