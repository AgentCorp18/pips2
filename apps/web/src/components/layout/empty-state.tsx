import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--color-primary-subtle)' }}
      >
        <Icon size={24} style={{ color: 'var(--color-primary)' }} />
      </div>
      <h3 className="mb-1 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      <p
        className="mb-6 max-w-sm text-center text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {description}
      </p>
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}
