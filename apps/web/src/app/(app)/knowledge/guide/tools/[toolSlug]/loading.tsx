import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const ToolDetailLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading tool detail"
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

      {/* Tool header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-56" />
        <div className="mt-3 flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>

      {/* Overview card */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-28" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>

      {/* When to use card */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </CardContent>
      </Card>

      {/* Related steps */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ToolDetailLoading
