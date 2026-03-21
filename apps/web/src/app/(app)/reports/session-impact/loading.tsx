import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const SessionImpactLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading Session Impact Summary"
    >
      {/* Back link */}
      <div className="mb-6">
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Hero banner */}
      <div
        className="mb-8 overflow-hidden rounded-2xl p-8 md:p-12"
        style={{ background: 'linear-gradient(135deg, #1B1340 0%, #4338CA 50%, #4F46E5 100%)' }}
      >
        <Skeleton className="mb-4 h-6 w-36 opacity-30" />
        <Skeleton className="mb-3 h-12 w-72 opacity-40" />
        <Skeleton className="mb-2 h-8 w-48 opacity-35" />
        <Skeleton className="mb-8 h-4 w-80 opacity-25" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <Skeleton className="h-8 w-20 opacity-40" />
              <Skeleton className="mt-2 h-3 w-28 opacity-30" />
            </div>
          ))}
        </div>
      </div>

      {/* By the numbers grid */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-5"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <Skeleton className="h-10 w-16" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Achievement timeline */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Top achievements grid */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex items-start gap-4 p-4">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  )
}

export default SessionImpactLoading
