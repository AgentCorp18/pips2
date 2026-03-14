import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getInitiativeDetail, getInitiativeProgress } from '@/app/(app)/initiatives/actions'
import { InitiativeProgressBar } from '@/components/initiatives/initiative-progress-bar'
import { Button } from '@/components/ui/button'
import { Target, ArrowLeft, Pencil, FolderKanban, Calendar, User, TrendingUp } from 'lucide-react'
import type { InitiativeStatus } from '@/types/initiatives'

type Props = {
  params: Promise<{ initiativeId: string }>
}

export const metadata: Metadata = {
  title: 'Initiative | PIPS',
}

const STATUS_STYLES: Record<InitiativeStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  active: { label: 'Active', className: 'bg-green-100 text-green-700' },
  on_hold: { label: 'On Hold', className: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', className: 'bg-blue-100 text-blue-700' },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-500' },
}

const InitiativeDetailPage = async ({ params }: Props) => {
  const { initiativeId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ initiative, error }, progress] = await Promise.all([
    getInitiativeDetail(initiativeId),
    getInitiativeProgress(initiativeId),
  ])

  if (error || !initiative) notFound()

  const statusStyle = STATUS_STYLES[initiative.status]

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-10">
      {/* Breadcrumb */}
      <Link
        href="/initiatives"
        className="inline-flex items-center gap-1 text-sm hover:underline"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <ArrowLeft size={14} />
        Back to Initiatives
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${initiative.color}20`, color: initiative.color }}
          >
            <Target size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="font-display text-2xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {initiative.title}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.className}`}
              >
                {statusStyle.label}
              </span>
            </div>
            {initiative.description && (
              <p
                className="mt-1 max-w-2xl text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {initiative.description}
              </p>
            )}
          </div>
        </div>
        <Link href={`/initiatives/${initiativeId}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil size={14} className="mr-1.5" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Meta cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {initiative.objective && (
          <MetaCard icon={Target} label="Objective" value={initiative.objective} />
        )}
        {initiative.target_metric && (
          <MetaCard icon={TrendingUp} label="Target Metric" value={initiative.target_metric} />
        )}
        <MetaCard icon={User} label="Owner" value={initiative.owner.display_name} />
        {initiative.target_end && (
          <MetaCard
            icon={Calendar}
            label="Target End"
            value={new Date(initiative.target_end).toLocaleDateString()}
          />
        )}
      </div>

      {/* Measurement */}
      {(initiative.baseline_value || initiative.target_value || initiative.current_value) && (
        <div
          className="rounded-[var(--radius-lg)] border p-5"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2
            className="mb-3 text-sm font-semibold uppercase tracking-wide"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Measurement
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {initiative.baseline_value && (
              <div>
                <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Baseline
                </div>
                <div
                  className="text-lg font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {initiative.baseline_value}
                </div>
              </div>
            )}
            {initiative.current_value && (
              <div>
                <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Current
                </div>
                <div className="text-lg font-semibold" style={{ color: initiative.color }}>
                  {initiative.current_value}
                </div>
              </div>
            )}
            {initiative.target_value && (
              <div>
                <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Target
                </div>
                <div
                  className="text-lg font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {initiative.target_value}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress */}
      <div
        className="rounded-[var(--radius-lg)] border p-5"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <h2
          className="mb-4 text-sm font-semibold uppercase tracking-wide"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Progress
        </h2>
        <InitiativeProgressBar progress={progress} color={initiative.color} />
      </div>

      {/* Projects */}
      <div
        className="rounded-[var(--radius-lg)] border p-5"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Projects ({initiative.project_count})
          </h2>
        </div>

        {initiative.projects.length === 0 ? (
          <p className="py-4 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            No projects linked to this initiative yet.
          </p>
        ) : (
          <div className="space-y-2">
            {initiative.projects.map((ip) => {
              const project = ip.project as {
                id: string
                title: string
                status: string
                current_step: string | null
                priority: string
              }
              return (
                <Link
                  key={ip.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center gap-3">
                    <FolderKanban size={16} style={{ color: 'var(--color-primary)' }} />
                    <div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {project.title}
                      </span>
                      {ip.notes && (
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          {ip.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs capitalize"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {project.status}
                    </span>
                    {project.current_step && (
                      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        Step: {project.current_step.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Tags */}
      {initiative.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {initiative.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-3 py-1 text-xs"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

const MetaCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  value: string
}) => (
  <div className="rounded-lg border p-4" style={{ borderColor: 'var(--color-border)' }}>
    <div
      className="mb-1 flex items-center gap-1.5 text-xs"
      style={{ color: 'var(--color-text-tertiary)' }}
    >
      <Icon size={12} />
      {label}
    </div>
    <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
      {value}
    </div>
  </div>
)

export default InitiativeDetailPage
