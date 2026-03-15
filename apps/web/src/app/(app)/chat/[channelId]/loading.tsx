import { Skeleton } from '@/components/ui/skeleton'

const ChannelLoading = () => {
  return (
    <div
      className="flex h-[calc(100vh-var(--topbar-height)-3rem)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]"
      aria-busy="true"
      aria-label="Loading channel"
    >
      {/* Channel sidebar skeleton — hidden on mobile */}
      <div className="hidden w-64 flex-shrink-0 flex-col border-r border-[var(--color-border)] md:flex">
        {/* Sidebar header */}
        <div className="border-b border-[var(--color-border)] p-4">
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Channel list items */}
        <div className="flex-1 space-y-1 p-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-2">
              <Skeleton className="h-4 w-4 rounded-sm" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>

        {/* Create channel button area */}
        <div className="border-t border-[var(--color-border)] p-2">
          <Skeleton className="h-8 w-full rounded-[var(--radius-md)]" />
        </div>
      </div>

      {/* Message thread skeleton */}
      <div className="flex flex-1 flex-col">
        {/* Thread header */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <Skeleton className="h-5 w-5 rounded-sm" />
          <Skeleton className="h-5 w-36" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-[var(--radius-md)]" />
            <Skeleton className="h-7 w-7 rounded-[var(--radius-md)]" />
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 space-y-4 overflow-hidden p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className={`h-4 ${i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-1/2' : 'w-2/3'}`} />
                {i % 2 === 0 && <Skeleton className="h-4 w-2/5" />}
              </div>
            </div>
          ))}
        </div>

        {/* Message input skeleton */}
        <div className="border-t border-[var(--color-border)] p-4">
          <Skeleton className="h-10 w-full rounded-[var(--radius-md)]" />
        </div>
      </div>
    </div>
  )
}

export default ChannelLoading
