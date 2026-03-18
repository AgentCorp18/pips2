import { Skeleton } from '@/components/ui/skeleton'

const NewProjectLoading = () => {
  return (
    <div className="mx-auto max-w-[var(--content-max-width)] space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
      <div className="space-y-3 mt-6">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  )
}

export default NewProjectLoading
