import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const KnowledgeLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading Knowledge Hub"
    >
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      {/* Continue Reading section */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-2 w-full rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pillars grid */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="mt-1 h-4 w-full" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KnowledgeLoading
