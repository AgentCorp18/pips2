'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { canManageRole, ROLE_LABELS, type OrgRole } from '@pips/shared'
import { sendEmail } from '@/lib/email/send'
import { invitationTemplate } from '@/lib/email/invitation'

interface ActionResult {
  success: boolean
  error?: string
}

export const changeMemberRole = async (
  orgId: string,
  memberId: string,
  newRole: OrgRole,
): Promise<ActionResult> => {
  try {
    const actorRole = await requirePermission(orgId, 'org.members.manage')
    const supabase = await createClient()

    // Fetch the target member's current role
    const { data: target } = await supabase
      .from('org_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('org_id', orgId)
      .single()

    if (!target) return { success: false, error: 'Member not found' }

    const targetRole = target.role as OrgRole

    // Cannot change role of someone at or above your level
    if (!canManageRole(actorRole, targetRole)) {
      return { success: false, error: 'Cannot change role of this member' }
    }

    // Cannot promote someone to your level or above
    if (!canManageRole(actorRole, newRole)) {
      return { success: false, error: 'Cannot assign a role at or above your own' }
    }

    // Prevent removing the last owner
    if (targetRole === 'owner') {
      const { count } = await supabase
        .from('org_members')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('role', 'owner')

      if ((count ?? 0) <= 1) {
        return { success: false, error: 'Cannot change the role of the last owner' }
      }
    }

    const { error } = await supabase
      .from('org_members')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', memberId)
      .eq('org_id', orgId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/settings/members')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export const removeMember = async (orgId: string, memberId: string): Promise<ActionResult> => {
  try {
    const actorRole = await requirePermission(orgId, 'org.members.manage')
    const supabase = await createClient()

    // Fetch the target member
    const { data: target } = await supabase
      .from('org_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('org_id', orgId)
      .single()

    if (!target) return { success: false, error: 'Member not found' }

    const targetRole = target.role as OrgRole

    // Cannot remove someone at or above your level
    if (!canManageRole(actorRole, targetRole)) {
      return { success: false, error: 'Cannot remove this member' }
    }

    // Prevent removing the last owner
    if (targetRole === 'owner') {
      const { count } = await supabase
        .from('org_members')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('role', 'owner')

      if ((count ?? 0) <= 1) {
        return { success: false, error: 'Cannot remove the last owner' }
      }
    }

    // Check actor is not removing themselves
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user?.id === target.user_id) {
      return { success: false, error: 'Cannot remove yourself' }
    }

    const { error } = await supabase
      .from('org_members')
      .delete()
      .eq('id', memberId)
      .eq('org_id', orgId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/settings/members')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export const inviteMember = async (
  orgId: string,
  email: string,
  role: OrgRole,
): Promise<ActionResult> => {
  try {
    const actorRole = await requirePermission(orgId, 'org.members.manage')

    // Cannot invite someone to a role at or above your level
    if (!canManageRole(actorRole, role)) {
      return { success: false, error: 'Cannot invite a member with a role at or above your own' }
    }

    const supabase = await createClient()

    // Check if already a member (by email via profiles)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (profile) {
      const { data: existing } = await supabase
        .from('org_members')
        .select('id')
        .eq('org_id', orgId)
        .eq('user_id', profile.id)
        .single()

      if (existing) {
        return { success: false, error: 'User is already a member of this organization' }
      }
    }

    // Check for an existing pending invitation
    const { data: pendingInvite } = await supabase
      .from('org_invitations')
      .select('id')
      .eq('org_id', orgId)
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (pendingInvite) {
      return { success: false, error: 'An invitation is already pending for this email' }
    }

    // Get the inviter profile and org name
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single()

    // Create the invitation record
    const { data: invitation, error } = await supabase
      .from('org_invitations')
      .insert({
        org_id: orgId,
        email,
        role,
        invited_by: user.id,
      })
      .select('token')
      .single()

    if (error) return { success: false, error: error.message }

    // Send invitation email (non-blocking — don't fail the action if email fails)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/invite/${invitation.token}`

    const html = invitationTemplate({
      recipientEmail: email,
      orgName: org?.name ?? 'an organization',
      role: ROLE_LABELS[role],
      inviterName: (inviterProfile?.full_name as string) ?? 'A team member',
      acceptUrl: inviteUrl,
    })

    await sendEmail({
      to: email,
      subject: `PIPS — You've been invited to join ${org?.name ?? 'an organization'}`,
      html,
    })

    revalidatePath('/settings/members')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}
