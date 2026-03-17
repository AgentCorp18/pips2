import { redirect } from 'next/navigation'
import { requireSystemAdmin } from '@/lib/permissions'
import { AdminShell } from './admin-shell'

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  try {
    await requireSystemAdmin()
  } catch {
    redirect('/dashboard')
  }
  return <AdminShell>{children}</AdminShell>
}

export default AdminLayout
