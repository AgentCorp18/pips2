'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PIPS_STEPS } from '@pips/shared'
import { cn } from '@/lib/utils'

type ToolTagProps = {
  toolSlug: string
  toolName: string
  description?: string
  stepNumber?: number
  className?: string
}

export const ToolTag = ({
  toolSlug,
  toolName,
  description,
  stepNumber,
  className,
}: ToolTagProps) => {
  const stepColor = stepNumber ? PIPS_STEPS[stepNumber - 1]?.color : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button data-testid="tool-tag" className={cn('cursor-pointer', className)}>
          <Badge
            variant="outline"
            className="gap-1 transition-colors hover:bg-accent"
            style={
              stepColor
                ? {
                    borderColor: stepColor,
                    color: stepColor,
                  }
                : undefined
            }
          >
            {toolName}
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent data-testid="tool-tag-popover" className="w-64" align="start">
        <div className="space-y-2">
          <p className="text-sm font-semibold">{toolName}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <Link
            href={`/knowledge/guide/tools/${toolSlug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Learn more
            <ExternalLink size={14} />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
