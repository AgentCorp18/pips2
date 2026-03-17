import type { Metadata } from 'next'
import { listAllOrgs } from '../actions'
import { OrgsTable } from './orgs-table'

export const metadata: Metadata = {
  title: 'Admin — Organizations — PIPS',
  description: 'Manage platform organizations.',
}

const AdminOrgsPage = async () => {
  let orgs: Awaited<ReturnType<typeof listAllOrgs>> = []

  try {
    orgs = await listAllOrgs()
  } catch (err) {
    console.error('[AdminOrgsPage] Failed to load orgs:', err)
  }

  return (
    <div className="mx-auto max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Organizations
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {orgs.length} organization{orgs.length !== 1 ? 's' : ''} on the platform
        </p>
      </div>

      <OrgsTable initialOrgs={orgs} />
    </div>
  )
}

export default AdminOrgsPage
