import { cn } from '@/lib/utils'

type SkeletonProps = React.ComponentProps<'div'>

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface-secondary)]',
        className,
      )}
      {...props}
    />
  )
}
