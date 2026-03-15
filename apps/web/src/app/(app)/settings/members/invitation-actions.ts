'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'

interface ActionResult {
  success: boolean
  error?: string
}

/** Revoke a pending invitation */
export const revokeInvitation = async (
  orgId: string,
  invitationId: string,
): Promise<ActionResult> => {
  try {
    await requirePermission(orgId, 'org.members.manage')

    const supabase = await createClient()

    const { error } = await supabase
      .from('org_invitations')
      .update({ status: 'revoked' })
      .eq('id', invitationId)
      .eq('org_id', orgId)
      .eq('status', 'pending')

    if (error) {
      console.error('Failed to revoke invitation:', error.message)
      return { success: false, error: 'Failed to revoke invitation' }
    }

    revalidatePath('/settings/members')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}
