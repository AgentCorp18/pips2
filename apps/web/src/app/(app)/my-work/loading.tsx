import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

const MyWorkLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading My Work"
    >
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      {/* Ticket groups */}
      {Array.from({ length: 4 }).map((_, groupIdx) => (
        <div key={groupIdx} className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-3 py-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default MyWorkLoading
