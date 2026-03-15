import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const SettingsLoading = () => {
  return (
    <div aria-busy="true" aria-label="Loading settings">
      {/* Page heading skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="mt-1 h-4 w-72" />
      </div>

      <div className="space-y-6">
        {/* Organization card skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Org name field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-9 w-full rounded-[var(--radius-md)]" />
            </div>

            {/* URL slug field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full rounded-[var(--radius-md)]" />
              <Skeleton className="h-3 w-56" />
            </div>

            <Skeleton className="h-px w-full" />

            {/* Logo upload area */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-24 w-full rounded-[var(--radius-md)]" />
            </div>
          </CardContent>
        </Card>

        {/* Preferences card skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 2-column grid of dropdowns */}
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-full rounded-[var(--radius-md)]" />
                </div>
              ))}
            </div>

            {/* Ticket prefix field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-48 rounded-[var(--radius-md)]" />
              <Skeleton className="h-3 w-64" />
            </div>
          </CardContent>
        </Card>

        {/* Save button skeleton */}
        <div className="flex justify-end">
          <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
        </div>
      </div>
    </div>
  )
}

export default SettingsLoading
