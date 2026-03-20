import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { ArrowLeft, GitCompare, FolderKanban } from 'lucide-react'
import { ProjectComparisonClient } from '@/components/reports/project-comparison-client'
import { getProjectComparison, getProjectListForComparison } from '../actions'
import { ReportEmptyState } from '@/components/reports/report-empty-state'

export const metadata: Metadata = {
  title: 'Project Comparison',
  description:
    'Compare 2–5 projects side-by-side across cycle time, methodology depth, tickets, and ROI.',
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const ProjectComparisonPage = async ({ searchParams }: PageProps) => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentOrg = await getCurrentOrg(supabase, user.id)

  if (!currentOrg) {
    redirect('/onboarding')
  }

  const orgId = currentOrg.orgId

  // Parse selected project IDs from URL search params
  const resolvedParams = await searchParams
  const rawIds = resolvedParams['ids']
  const rawIdsStr = Array.isArray(rawIds) ? rawIds[0] : (rawIds ?? '')
  const selectedIds = rawIdsStr
    ? rawIdsStr
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
        .slice(0, 5)
    : []

  const [projectList, comparisonData] = await Promise.all([
    getProjectListForComparison(orgId),
    selectedIds.length >= 2
      ? getProjectComparison(orgId, selectedIds)
      : Promise.resolve({ projects: [] }),
  ])

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/reports"
          className="mb-3 inline-flex items-center gap-1 text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back to Reports
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
          >
            <GitCompare size={18} style={{ color: '#4F46E5' }} />
          </div>
          <div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
              data-testid="project-comparison-heading"
            >
              Project Comparison
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Select 2–5 projects to compare cycle time, depth score, tickets, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* Fewer than 2 projects guard */}
      {projectList.length < 2 ? (
        <ReportEmptyState
          icon={FolderKanban}
          title={
            projectList.length === 0 ? 'No projects yet' : 'Need at least 2 projects to compare'
          }
          description={
            projectList.length === 0
              ? 'Create at least two projects to use the comparison tool.'
              : 'Create one more project to start comparing side-by-side.'
          }
          actionLabel="Create Project"
          actionHref="/projects/new"
        />
      ) : (
        /* Client-side interactive comparison */
        <ProjectComparisonClient
          projectList={projectList}
          initialComparison={comparisonData.projects}
          initialSelectedIds={selectedIds}
        />
      )}
    </div>
  )
}

export default ProjectComparisonPage
