import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

const ChapterLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading chapter"
      data-testid="loading-skeleton"
    >
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Reading progress bar */}
      <Skeleton className="mb-6 h-1 w-full rounded-full" />

      {/* Chapter title */}
      <div className="mb-8">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>

      {/* Content body */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />

          {/* Spacer for paragraph break */}
          <div className="py-2" />

          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>

      {/* Navigation footer */}
      <div className="mt-6 flex items-center justify-between">
        <Skeleton className="h-10 w-32 rounded-[var(--radius-md)]" />
        <Skeleton className="h-10 w-32 rounded-[var(--radius-md)]" />
      </div>
    </div>
  )
}

export default ChapterLoading
