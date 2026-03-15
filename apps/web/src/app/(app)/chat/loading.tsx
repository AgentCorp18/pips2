import { Skeleton } from '@/components/ui/skeleton'

const ChatLoading = () => {
  return (
    <div
      className="flex h-[calc(100vh-var(--topbar-height)-3rem)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]"
      aria-busy="true"
      aria-label="Loading chat"
    >
      {/* Channel sidebar skeleton */}
      <div className="flex w-64 flex-shrink-0 flex-col border-r border-[var(--color-border)]">
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

      {/* Main content area — empty state skeleton */}
      <div className="hidden flex-1 flex-col items-center justify-center md:flex">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="mt-4 h-5 w-28" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>
    </div>
  )
}

export default ChatLoading
