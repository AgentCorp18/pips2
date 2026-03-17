import type { Metadata } from 'next'
import { listAllUsers } from '../actions'
import { UsersTable } from './users-table'

export const metadata: Metadata = {
  title: 'Admin — Users — PIPS',
  description: 'Manage platform users.',
}

const AdminUsersPage = async () => {
  let users: Awaited<ReturnType<typeof listAllUsers>> = []

  try {
    users = await listAllUsers()
  } catch (err) {
    console.error('[AdminUsersPage] Failed to load users:', err)
  }

  return (
    <div className="mx-auto max-w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Users
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {users.length} user{users.length !== 1 ? 's' : ''} across all organizations
        </p>
      </div>

      <UsersTable initialUsers={users} />
    </div>
  )
}

export default AdminUsersPage
