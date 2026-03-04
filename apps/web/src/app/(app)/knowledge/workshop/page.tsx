import Link from 'next/link'
import { Users, ArrowRight, Clock, Target, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getOrgSessions } from './actions'
import { WorkshopCreateButton } from './_create-button'

const WORKSHOP_MODULES = [
  {
    slug: 'intro-to-pips',
    title: 'Introduction to PIPS',
    description: 'Overview of the methodology, principles, and team roles',
    duration: '45 min',
    difficulty: 'Beginner',
  },
  {
    slug: 'identify-workshop',
    title: 'Step 1: Identify Workshop',
    description: 'Hands-on problem statement writing with team facilitation',
    duration: '90 min',
    difficulty: 'Beginner',
  },
  {
    slug: 'root-cause-workshop',
    title: 'Step 2: Root Cause Analysis',
    description: 'Fishbone diagrams, 5-Why, and force field analysis in teams',
    duration: '90 min',
    difficulty: 'Intermediate',
  },
  {
    slug: 'ideation-workshop',
    title: 'Step 3: Ideation Workshop',
    description: 'Brainstorming and brainwriting 6-3-5 facilitation',
    duration: '60 min',
    difficulty: 'Beginner',
  },
  {
    slug: 'selection-planning',
    title: 'Step 4: Selection & Planning',
    description: 'Criteria matrices, RACI charts, and implementation planning',
    duration: '120 min',
    difficulty: 'Intermediate',
  },
  {
    slug: 'facilitator-masterclass',
    title: "Facilitator's Masterclass",
    description: 'Advanced facilitation techniques, dealing with resistance, and time management',
    duration: '3 hours',
    difficulty: 'Advanced',
  },
]

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'text-emerald-600',
  Intermediate: 'text-amber-600',
  Advanced: 'text-red-600',
}

const STATUS_BADGE: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  draft: { label: 'Draft', variant: 'outline' },
  active: { label: 'Live', variant: 'default' },
  paused: { label: 'Paused', variant: 'secondary' },
  completed: { label: 'Done', variant: 'outline' },
}

const WorkshopPage = async () => {
  const sessions = await getOrgSessions()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'rgba(8, 145, 178, 0.08)' }}
        >
          <Users size={20} className="text-[#0891B2]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Workshop</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Facilitation in action — timed sessions, team scenarios, and facilitator guides
          </p>
        </div>
      </div>

      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/knowledge" className="hover:text-[var(--color-primary)]">
          Knowledge Hub
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">Workshop</span>
      </nav>

      {/* Live Sessions */}
      {sessions.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Your Sessions
            </h2>
            <WorkshopCreateButton />
          </div>
          <div className="space-y-2">
            {sessions.map((session) => {
              const badge = STATUS_BADGE[session.status] ?? {
                label: 'Draft',
                variant: 'outline' as const,
              }
              return (
                <Link key={session.id} href={`/knowledge/workshop/${session.id}`}>
                  <Card className="group cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-sm">
                    <CardContent className="flex items-center justify-between py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={badge.variant} className="text-[10px]">
                            {badge.label}
                          </Badge>
                          <h3 className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                            {session.title}
                          </h3>
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
                          {session.modules.length} modules &middot; {session.participant_count}{' '}
                          participants
                        </p>
                      </div>
                      <ArrowRight
                        size={14}
                        className="shrink-0 text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                      />
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-8 text-center">
          <Users size={24} className="mx-auto text-[var(--color-text-tertiary)]" />
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            No workshop sessions yet. Create one from a template to get started.
          </p>
          <div className="mt-3">
            <WorkshopCreateButton />
          </div>
        </div>
      )}

      {/* Workshop Modules */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
          Workshop Modules
        </h2>
        <div className="space-y-3">
          {WORKSHOP_MODULES.map((module) => (
            <Link key={module.slug} href={`/knowledge/workshop/modules/${module.slug}`}>
              <Card className="group cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-sm">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                      {module.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
                      {module.description}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                        <Clock size={11} />
                        {module.duration}
                      </span>
                      <span
                        className={`text-xs font-medium ${DIFFICULTY_COLORS[module.difficulty] ?? ''}`}
                      >
                        {module.difficulty}
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/knowledge/workshop/scenarios">
          <Card className="cursor-pointer transition-all hover:border-[var(--color-primary)]">
            <CardContent className="flex items-center gap-3 py-4">
              <Target size={16} className="text-[var(--color-text-tertiary)]" />
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                  Practice Scenarios
                </h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  Real-world case studies for team practice
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/knowledge/workshop/facilitator">
          <Card className="cursor-pointer transition-all hover:border-[var(--color-primary)]">
            <CardContent className="flex items-center gap-3 py-4">
              <Award size={16} className="text-[var(--color-text-tertiary)]" />
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                  Facilitator Guides
                </h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  Step-by-step facilitation scripts and timing
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export default WorkshopPage
