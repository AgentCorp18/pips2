import type { Metadata } from 'next'
import { getAdminAuditLog } from '../actions'
import { AuditLogTable } from './audit-log-table'

export const metadata: Metadata = {
  title: 'Admin — Audit Log — PIPS',
  description: 'Platform admin audit log.',
}

const AdminAuditLogPage = async () => {
  let entries: Awaited<ReturnType<typeof getAdminAuditLog>>['entries'] = []
  let total = 0

  try {
    const result = await getAdminAuditLog(1)
    entries = result.entries
    total = result.total
  } catch (err) {
    console.error('[AdminAuditLogPage] Failed to load audit log:', err)
  }

  return (
    <div className="mx-auto max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Audit Log
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {total.toLocaleString()} entries total — all admin actions are recorded here.
        </p>
      </div>

      <AuditLogTable initialEntries={entries} initialTotal={total} initialPage={1} />
    </div>
  )
}

export default AdminAuditLogPage
