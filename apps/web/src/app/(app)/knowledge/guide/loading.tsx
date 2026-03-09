import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

const GuideLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading guide"
      data-testid="loading-skeleton"
    >
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Hero placeholder */}
      <div className="mb-8 rounded-[var(--radius-md)] bg-[var(--color-deep,#1B1340)] p-8 text-center">
        <Skeleton className="mx-auto h-10 w-72 bg-white/10" />
        <Skeleton className="mx-auto mt-4 h-5 w-96 bg-white/10" />
        <Skeleton className="mx-auto mt-8 h-48 w-48 rounded-full bg-white/10" />
      </div>

      {/* Philosophy section */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-2 p-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Step cards */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-36" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default GuideLoading
