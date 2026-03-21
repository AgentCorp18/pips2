import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export const ProjectsLoading = () => {
  return (
    <div className="mx-auto max-w-full px-4">
      {/* Header — matches flex-col sm:flex-row layout */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="mt-1 h-4 w-52" />
        </div>
        <div className="flex items-center gap-3">
          {/* Export button */}
          <Skeleton className="h-9 w-20 rounded-[var(--radius-md)]" />
          {/* View toggle (3 icons) */}
          <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
          {/* Browse Templates button */}
          <Skeleton className="h-9 w-36 rounded-[var(--radius-md)]" />
          {/* New Project button */}
          <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
        </div>
      </div>

      {/* Step stripe */}
      <Skeleton className="mb-6 h-1 w-full rounded-full" />

      {/* Filter bar — sort/filter chips */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      {/* Project cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              {/* Title row with depth badge */}
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
              <Skeleton className="mt-1 h-4 w-full" />
              <Skeleton className="mt-0.5 h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Step progress dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-3 w-3 rounded-full" />
                ))}
              </div>
              {/* Meta: owner + status badge */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              {/* Target date */}
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ProjectsLoading
