import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const ProfileLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading Profile"
    >
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      {/* Avatar section */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-10 w-full rounded-[var(--radius-md)]" />
          </div>
          <div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-2 h-10 w-full rounded-[var(--radius-md)]" />
          </div>
          <Skeleton className="h-10 w-32 rounded-[var(--radius-md)]" />
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileLoading
