import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => {
  return (
    <div className="mx-auto max-w-[var(--content-max-width)] space-y-6" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  )
}

export default Loading
