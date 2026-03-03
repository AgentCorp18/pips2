import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const AppNotFound = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          >
            <FileQuestion size={32} style={{ color: 'var(--color-primary)' }} />
          </div>

          <h2 className="mb-2 text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Page not found
          </h2>

          <p
            className="mb-6 max-w-sm text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            The page you are looking for does not exist or has been moved.
          </p>

          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default AppNotFound
