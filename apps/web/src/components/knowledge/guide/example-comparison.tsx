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

/** Bold recognized labels like "As-Is:", "Desired State:", "Gap:", "Impact:", "Root Cause:" */
const formatDescription = (text: string) => {
  const labelPattern =
    /\b(As-Is|Desired State|Gap|Impact|Root Cause|Problem|Area|Financial Impact|Risk Priority Number|Key Causes|Selected|Ideas Generated|Top Solution|Solutions Evaluated|Solution|Tasks|Timeline|Milestones|Overall Progress|Checklist|Summary|Goals Achieved|Details|Next Steps|Key Takeaways|Went Well):/g

  const parts = text.split(labelPattern)
  if (parts.length <= 1)
    return <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>

  return (
    <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
      {parts.map((part, i) => {
        if (i % 2 === 1) return null // label — rendered with next segment
        const label = i > 0 ? parts[i - 1] : null
        const content = part.trim()
        if (!content && !label) return null
        return (
          <p key={i}>
            {label && <strong className="text-[var(--color-text-primary)]">{label}:</strong>}{' '}
            {content}
          </p>
        )
      })}
    </div>
  )
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
          {formatDescription(good.description)}
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
          {formatDescription(bad.description)}
        </CardContent>
      </Card>
    </div>
  )
}
