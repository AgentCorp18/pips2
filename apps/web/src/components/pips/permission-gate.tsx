'use client'

import { usePermissions } from '@/hooks/use-permissions'
import type { Permission, OrgRole } from '@pips/shared'

interface PermissionGateProps {
  role: OrgRole | null
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const PermissionGate = ({
  role,
  permission,
  children,
  fallback = null,
}: PermissionGateProps) => {
  const { can } = usePermissions(role)
  return can(permission) ? <>{children}</> : <>{fallback}</>
}
