import Link from 'next/link'
import { TriangleAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type ComplianceAlert = {
  belowCount: number
  threshold: number
}

type MethodologyComplianceAlertProps = {
  alert: ComplianceAlert
}

export const MethodologyComplianceAlert = ({ alert }: MethodologyComplianceAlertProps) => {
  const { belowCount, threshold } = alert

  return (
    <Card
      className="border-[var(--color-border)]"
      data-testid="methodology-compliance-alert"
      style={{ borderColor: 'var(--color-warning, #F59E0B)' }}
    >
      <CardContent className="flex items-start gap-3 py-4">
        <TriangleAlert
          size={18}
          className="mt-0.5 shrink-0"
          style={{ color: 'var(--color-warning, #F59E0B)' }}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {belowCount} {belowCount === 1 ? 'project' : 'projects'} below methodology depth
            threshold ({threshold}%)
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            These active projects have not met the minimum methodology depth set for your
            organization.{' '}
            <Link
              href={`/projects?min_depth_below=${threshold}`}
              className="underline"
              style={{ color: 'var(--color-primary)' }}
              data-testid="methodology-compliance-alert-link"
            >
              View projects
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
