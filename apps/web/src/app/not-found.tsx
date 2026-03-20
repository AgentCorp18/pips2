import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <FileQuestion size={48} className="text-[var(--color-text-tertiary)]" />
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Page not found
      </h1>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  )
}

export default NotFound
