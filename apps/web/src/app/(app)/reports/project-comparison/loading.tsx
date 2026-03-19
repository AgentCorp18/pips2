import { Skeleton } from '@/components/ui/skeleton'

const ProjectComparisonLoading = () => {
  return (
    <div className="mx-auto max-w-[var(--content-max-width)] space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  )
}

export default ProjectComparisonLoading
