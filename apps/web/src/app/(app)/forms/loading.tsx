import { Skeleton } from '@/components/ui/skeleton'

const FormsLoading = () => (
  <div className="mx-auto max-w-full px-4">
    <Skeleton className="mb-4 h-10 w-48" />
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
    <Skeleton className="mb-4 h-10 w-full" />
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  </div>
)

export default FormsLoading
