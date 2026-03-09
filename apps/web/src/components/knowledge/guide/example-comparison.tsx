import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ExampleItem = {
  title: string
  description: string
}

type ExampleComparisonProps = {
  good: ExampleItem
  bad: ExampleItem
  className?: string
}

export const ExampleComparison = ({ good, bad, className }: ExampleComparisonProps) => {
  return (
    <div
      data-testid="example-comparison"
      className={cn('grid grid-cols-1 gap-4 md:grid-cols-2', className)}
    >
      <Card data-testid="good-example" className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 size={18} aria-hidden="true" />
            Good Example
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{good.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{good.description}</p>
        </CardContent>
      </Card>

      <Card data-testid="bad-example" className="border-l-4 border-l-amber-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <XCircle size={18} aria-hidden="true" />
            Poor Example
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{bad.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{bad.description}</p>
        </CardContent>
      </Card>
    </div>
  )
}
