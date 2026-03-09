import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const StepGuideLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading step guide"
      data-testid="loading-skeleton"
    >
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Step header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      {/* Anchor navigation */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Objective section */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>

      {/* Diagram section */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full rounded-[var(--radius-md)]" />
        </CardContent>
      </Card>

      {/* Key questions section */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-2">
              <Skeleton className="mt-1 h-4 w-4 shrink-0" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tools section */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-20" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-28 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StepGuideLoading
