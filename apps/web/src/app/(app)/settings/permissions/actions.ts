'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { PERMISSIONS, type Permission } from '@pips/shared'
import type { OrgRole } from '@pips/shared'

interface ActionResult {
  success: boolean
  error?: string
}

export type PermissionOverride = {
  role: OrgRole
  permission: string
  allowed: boolean
}

/** Fetch all permission overrides for the current org */
export const getPermissionOverrides = async (orgId: string): Promise<PermissionOverride[]> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('org_permission_overrides')
    .select('role, permission, allowed')
    .eq('org_id', orgId)

  if (error) {
    console.error('Failed to fetch permission overrides:', error.message)
    return []
  }

  return (data ?? []).map((d) => ({
    role: d.role as OrgRole,
    permission: d.permission as string,
    allowed: d.allowed as boolean,
  }))
}

/** Toggle a permission override for a role in the org */
export const togglePermissionOverride = async (
  orgId: string,
  role: OrgRole,
  permission: string,
  allowed: boolean,
): Promise<ActionResult> => {
  try {
    // Only owners can modify permission overrides
    await requirePermission(orgId, 'org.delete')

    // Validate the permission exists
    if (!(permission in PERMISSIONS)) {
      return { success: false, error: 'Invalid permission' }
    }

    // Cannot modify owner permissions — owners always have everything
    if (role === 'owner') {
      return { success: false, error: 'Cannot modify owner permissions' }
    }

    // Check if this is the default value — if so, remove the override
    const defaultRoles = PERMISSIONS[permission as Permission] as readonly string[]
    const isDefault = defaultRoles.includes(role)

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    if (allowed === isDefault) {
      // Remove override — revert to default
      await supabase
        .from('org_permission_overrides')
        .delete()
        .eq('org_id', orgId)
        .eq('role', role)
        .eq('permission', permission)
    } else {
      // Upsert the override
      const { error } = await supabase.from('org_permission_overrides').upsert(
        {
          org_id: orgId,
          role,
          permission,
          allowed,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'org_id,role,permission' },
      )

      if (error) {
        console.error('Failed to toggle permission override:', error.message)
        return { success: false, error: 'Failed to update permission' }
      }
    }

    revalidatePath('/settings/permissions')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

/** Reset all permission overrides for the org back to defaults */
export const resetPermissionOverrides = async (orgId: string): Promise<ActionResult> => {
  try {
    await requirePermission(orgId, 'org.delete')

    const supabase = await createClient()

    const { error } = await supabase.from('org_permission_overrides').delete().eq('org_id', orgId)

    if (error) {
      console.error('Failed to reset overrides:', error.message)
      return { success: false, error: 'Failed to reset permissions' }
    }

    revalidatePath('/settings/permissions')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}
