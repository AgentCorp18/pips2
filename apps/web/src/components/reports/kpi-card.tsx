import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

export type KpiCardProps = {
  title: string
  value: string | number
  icon: LucideIcon
  color?: string
  subtitle?: string
  tooltip?: string
}

export const KpiCard = ({ title, value, icon: Icon, color, subtitle, tooltip }: KpiCardProps) => {
  return (
    <Card title={tooltip}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {title}
        </CardTitle>
        <Icon size={18} style={{ color: color ?? 'var(--color-text-tertiary)' }} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
