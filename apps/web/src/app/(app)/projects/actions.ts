'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth, checkPermission } from '@/lib/action-utils'
import type { ActionResult } from '@/lib/action-utils'

/** Archive a project — sets status to 'archived' */
export const archiveProject = async (projectId: string): Promise<ActionResult> => {
  const auth = await requireAuth()
  if (!auth.success) return { error: auth.error }
  const { supabase, orgId } = auth.ctx

  const permError = await checkPermission(orgId, 'project.update')
  if (permError) return { error: permError }

  // Verify the project belongs to the user's org
  const { data: project } = await supabase
    .from('projects')
    .select('id, org_id')
    .eq('id', projectId)
    .eq('org_id', orgId)
    .single()

  if (!project) {
    return { error: 'Project not found' }
  }

  const { error: updateError } = await supabase
    .from('projects')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('org_id', orgId)

  if (updateError) {
    return { error: 'Failed to archive project' }
  }

  revalidatePath('/projects')
  return {}
}
