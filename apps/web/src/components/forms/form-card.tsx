import Link from 'next/link'
import { BookOpen, Calendar, User, FolderOpen, Hash } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type FormCardProps = {
  id: string
  formDisplayName: string
  stepNumber: number
  stepName: string
  stepColor: string
  projectName: string
  projectId: string
  creatorName: string
  updatedAt: string
  dataFieldCount: number
  formSlug: string
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const FormCard = ({
  id,
  formDisplayName,
  stepNumber,
  stepName,
  stepColor,
  projectName,
  projectId,
  creatorName,
  updatedAt,
  dataFieldCount,
  formSlug,
}: FormCardProps) => {
  const formPath = `/projects/${projectId}/steps/${stepNumber}/forms/${formSlug}`
  const knowledgePath = `/knowledge/guide/tools/${formSlug}`

  return (
    <Card
      className="group relative h-full overflow-hidden transition-all hover:shadow-[var(--shadow-low)] hover:border-[var(--color-primary-light)]"
      data-testid={`form-card-${id}`}
    >
      {/* Step color stripe */}
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: stepColor }} />

      <CardContent className="flex h-full flex-col gap-3 p-4 pt-5">
        {/* Form name */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={formPath}
            className="flex-1 text-sm font-semibold leading-tight group-hover:text-[var(--color-primary)] transition-colors"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {formDisplayName}
          </Link>
          <Link
            href={knowledgePath}
            className="shrink-0 rounded p-0.5 hover:bg-[var(--color-surface)] transition-colors"
            title="View knowledge guide"
            aria-label={`Knowledge guide for ${formDisplayName}`}
          >
            <BookOpen size={14} style={{ color: 'var(--color-text-tertiary)' }} />
          </Link>
        </div>

        {/* Step badge */}
        <div className="flex items-center gap-1.5">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: stepColor }}
          >
            {stepNumber}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Step {stepNumber}: {stepName}
          </span>
        </div>

        {/* Meta rows */}
        <div className="mt-auto space-y-1.5">
          <div className="flex items-center gap-1.5">
            <FolderOpen size={12} style={{ color: 'var(--color-text-tertiary)' }} />
            <Link
              href={`/projects/${projectId}`}
              className="truncate text-xs hover:underline"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {projectName}
            </Link>
          </div>
          <div className="flex items-center gap-1.5">
            <User size={12} style={{ color: 'var(--color-text-tertiary)' }} />
            <span className="truncate text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {creatorName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} style={{ color: 'var(--color-text-tertiary)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {formatDate(updatedAt)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Hash size={12} style={{ color: 'var(--color-text-tertiary)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {dataFieldCount} fields
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
