'use client'

import { useState } from 'react'
import { Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { archiveProject } from '@/app/(app)/projects/actions'

type ArchiveProjectButtonProps = {
  projectId: string
  projectName: string
}

export const ArchiveProjectButton = ({ projectId, projectName }: ArchiveProjectButtonProps) => {
  const [isPending, setIsPending] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    // Prevent navigation to the project page (card wraps in a Link)
    e.preventDefault()
    e.stopPropagation()

    if (isPending) return

    setIsPending(true)
    try {
      const result = await archiveProject(projectId)
      if (result.error) {
        console.error('Archive failed:', result.error)
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-secondary)]"
            aria-label={`Archive ${projectName}`}
            data-testid={`archive-project-${projectId}`}
            onClick={handleClick}
            disabled={isPending}
          >
            <Archive size={14} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Archive project</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
