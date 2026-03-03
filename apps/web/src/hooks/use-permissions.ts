'use client'

import { hasPermission, type Permission, type OrgRole } from '@pips/shared'

export const usePermissions = (role: OrgRole | null) => {
  const can = (permission: Permission): boolean => {
    if (!role) return false
    return hasPermission(role, permission)
  }

  return { can, role }
}
