import { Shield, Compass, Edit3, Clock, Mic, Users, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContentBreadcrumb } from '@/components/knowledge/content-breadcrumb'
import { GUIDE_ROLES } from '@pips/shared'

const ROLE_ICONS: Record<string, React.ReactNode> = {
  shield: <Shield size={24} />,
  compass: <Compass size={24} />,
  'edit-3': <Edit3 size={24} />,
  clock: <Clock size={24} />,
  mic: <Mic size={24} />,
  users: <Users size={24} />,
}

const ROLE_COLORS: Record<string, string> = {
  Leader: 'var(--color-step-1)',
  'Process Guide': 'var(--color-step-2)',
  Scribe: 'var(--color-step-3)',
  Timekeeper: 'var(--color-step-4)',
  Presenter: 'var(--color-step-5)',
  Facilitator: 'var(--color-step-6)',
}

const ROLE_COLORS_SUBTLE: Record<string, string> = {
  Leader: 'var(--color-step-1-subtle)',
  'Process Guide': 'var(--color-step-2-subtle)',
  Scribe: 'var(--color-step-3-subtle)',
  Timekeeper: 'var(--color-step-4-subtle)',
  Presenter: 'var(--color-step-5-subtle)',
  Facilitator: 'var(--color-step-6-subtle)',
}

const RolesPage = () => {
  return (
    <div data-testid="roles-page" className="mx-auto max-w-4xl space-y-6">
      {/* Breadcrumb */}
      <ContentBreadcrumb
        items={[
          { label: 'Knowledge Hub', href: '/knowledge' },
          { label: 'Guide', href: '/knowledge/guide' },
          { label: 'Roles', href: '/knowledge/guide/roles' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'rgba(79, 70, 229, 0.08)' }}
        >
          <Users size={20} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Roles & Responsibilities
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Every successful PIPS team depends on clearly defined roles
          </p>
        </div>
      </div>

      {/* Intro */}
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
        A PIPS improvement team works best when every member has a clear role. These six roles
        ensure workshops run smoothly, decisions are documented, and results reach the people who
        need them. On larger teams each role is filled by a different person; on smaller teams one
        person may hold two or three roles.
      </p>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {GUIDE_ROLES.map((role, index) => {
          const roleColor = ROLE_COLORS[role.title] ?? 'var(--color-primary)'
          const roleColorSubtle = ROLE_COLORS_SUBTLE[role.title] ?? 'var(--color-primary-subtle)'
          return (
            <Card key={role.title} data-testid={`role-card-${index}`} className="overflow-hidden">
              <div className="h-1.5" style={{ backgroundColor: roleColor }} />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{ backgroundColor: roleColorSubtle, color: roleColor }}
                  >
                    {ROLE_ICONS[role.icon] ?? <Users size={24} />}
                  </div>
                  <CardTitle className="text-base">{role.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-[var(--color-text-secondary)]">{role.description}</p>
                <ul className="space-y-1.5">
                  {role.responsibilities.map((r) => (
                    <li
                      key={r}
                      className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Adaptation Section */}
      <Card className="border-[var(--color-primary)]/20">
        <CardContent className="flex gap-3 py-5">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Adapting Roles for Small Teams
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              If your team has fewer than six members, combine complementary roles. The most common
              pairings are <strong>Leader + Presenter</strong> (the sponsor already has stakeholder
              relationships), <strong>Process Guide + Facilitator</strong> (both focus on running
              productive sessions), and <strong>Scribe + Timekeeper</strong> (documentation and
              pacing go hand-in-hand). The key rule: never combine a role that <em>generates</em>{' '}
              content with one that <em>facilitates</em> it — the Process Guide should not also be
              the Scribe, as capturing ideas while steering discussion is nearly impossible.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { RolesPage }
export default RolesPage
