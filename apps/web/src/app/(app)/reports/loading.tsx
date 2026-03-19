import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const ReportsLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading Reports"
    >
      {/* Page header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>

      {/* Hero KPI banner skeleton */}
      <div
        className="mb-8 overflow-hidden rounded-xl p-6 md:p-8"
        style={{ background: 'linear-gradient(135deg, #1B1340 0%, #4F46E5 100%)' }}
      >
        <Skeleton className="mb-2 h-4 w-36 opacity-30" />
        <Skeleton className="mb-6 h-7 w-56 opacity-40" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-10 w-20 opacity-40" />
              <Skeleton className="mt-2 h-3 w-28 opacity-30" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-2 h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-20" />
          </Card>
        ))}
      </div>

      {/* Report categories */}
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, sectionIdx) => (
          <section key={sectionIdx}>
            <div className="mb-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-1 h-4 w-56" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, cardIdx) => (
                <Card key={cardIdx}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                    <Skeleton className="mt-3 h-5 w-32" />
                    <Skeleton className="mt-1 h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-5 w-28 rounded-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default ReportsLoading
