import { cn } from '@/lib/utils'
import { parseRichText } from '@/components/knowledge/guide/rich-text'

type WhyThisMattersProps = {
  heading: string
  paragraphs: string[]
  stepColor: string
  className?: string
}

export const WhyThisMatters = ({
  heading,
  paragraphs,
  stepColor,
  className,
}: WhyThisMattersProps) => {
  return (
    <div
      data-testid="why-this-matters"
      className={cn('rounded-r-lg border-l-4 p-5', className)}
      style={{
        borderLeftColor: stepColor,
        backgroundColor: `${stepColor}0D`,
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: stepColor }}>
        Why This Step Matters
      </p>
      <p className="mt-2 text-base font-semibold text-[var(--color-text-primary)]">{heading}</p>
      {paragraphs.map((text, i) => (
        <p key={i} className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {parseRichText(text)}
        </p>
      ))}
    </div>
  )
}
