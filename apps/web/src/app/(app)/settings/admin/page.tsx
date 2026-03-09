import type { Metadata } from 'next'
import { ShieldAlert } from 'lucide-react'
import { getAdminData } from './actions'
import { AdminDashboard } from './admin-dashboard'

export const metadata: Metadata = {
  title: 'Admin - PIPS',
  description: 'Organization administration dashboard',
}

const AdminPage = async () => {
  const data = await getAdminData()

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--color-error-subtle)' }}
        >
          <ShieldAlert size={28} style={{ color: 'var(--color-error)' }} />
        </div>
        <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Access Denied
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          You need owner or admin privileges to view this page.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
          data-testid="admin-page-heading"
        >
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Organization overview — members, teams, projects, and activity
        </p>
      </div>

      <AdminDashboard
        stats={data.stats}
        members={data.members}
        teams={data.teams}
        projects={data.projects}
      />
    </div>
  )
}

export default AdminPage
