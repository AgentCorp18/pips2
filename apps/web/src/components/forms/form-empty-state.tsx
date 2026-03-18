import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const FormEmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16">
    <div
      className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
      style={{ backgroundColor: 'var(--color-primary-subtle)' }}
    >
      <FileText size={36} style={{ color: 'var(--color-primary)' }} />
    </div>
    <h3 className="mb-2 text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
      No forms found
    </h3>
    <p
      className="mb-8 max-w-md text-center text-sm"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      Start by creating a project and filling out PIPS forms, or try sandbox mode to practice.
    </p>
    <div className="flex items-center gap-3">
      <Button asChild className="gap-2">
        <Link href="/projects/new">Create Project</Link>
      </Button>
      <Button asChild variant="outline" className="gap-2">
        <Link href="/forms?view=sandbox">Try Sandbox</Link>
      </Button>
    </div>
  </div>
)
