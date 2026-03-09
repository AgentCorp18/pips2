import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const TeamDetailLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)] space-y-6"
      aria-busy="true"
      aria-label="Loading team detail"
      data-testid="loading-skeleton"
    >
      {/* Back link */}
      <Skeleton className="h-4 w-24" />

      {/* Team header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="mt-1 h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
      </div>

      {/* Team info */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        </CardContent>
      </Card>

      {/* Members list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-32 rounded-[var(--radius-md)]" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1 h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default TeamDetailLoading
