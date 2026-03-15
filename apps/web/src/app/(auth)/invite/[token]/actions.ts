'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/* ============================================================
   Types
   ============================================================ */

export interface InvitationData {
  id: string
  email: string
  role: string
  status: string
  expires_at: string
  org_name: string
  inviter_name: string
}

export type InvitationResult =
  | { status: 'valid'; invitation: InvitationData; isLoggedIn: boolean; userEmail: string | null }
  | { status: 'expired' }
  | { status: 'already_accepted' }
  | { status: 'revoked' }
  | { status: 'not_found' }

export interface ActionResult {
  success: boolean
  error?: string
}

/* ============================================================
   Validation
   ============================================================ */

const tokenSchema = z.string().min(1).max(128)

/* ============================================================
   getInvitation — Fetch invitation details by token
   ============================================================ */

export const getInvitation = async (token: string): Promise<InvitationResult> => {
  const parsed = tokenSchema.safeParse(token)
  if (!parsed.success) return { status: 'not_found' }

  const admin = createAdminClient()

  const { data: invitation } = await admin
    .from('org_invitations')
    .select('id, email, role, status, expires_at, org_id, invited_by')
    .eq('token', parsed.data)
    .single()

  if (!invitation) return { status: 'not_found' }

  if (invitation.status === 'accepted') return { status: 'already_accepted' }
  if (invitation.status === 'revoked') return { status: 'revoked' }

  // Check expiry
  const expiresAt = new Date(invitation.expires_at as string)
  if (expiresAt < new Date()) return { status: 'expired' }

  if (invitation.status !== 'pending') return { status: 'not_found' }

  // Fetch org name
  const { data: org } = await admin
    .from('organizations')
    .select('name')
    .eq('id', invitation.org_id)
    .single()

  // Fetch inviter name
  const { data: inviter } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', invitation.invited_by)
    .single()

  // Check if the current user is logged in
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return {
    status: 'valid',
    invitation: {
      id: invitation.id as string,
      email: invitation.email as string,
      role: invitation.role as string,
      status: invitation.status as string,
      expires_at: invitation.expires_at as string,
      org_name: (org?.name as string) ?? 'Unknown Organization',
      inviter_name: (inviter?.full_name as string) ?? 'A team member',
    },
    isLoggedIn: !!user,
    userEmail: user?.email ?? null,
  }
}

/* ============================================================
   acceptInvitation — Add user to org and mark accepted
   ============================================================ */

export const acceptInvitation = async (token: string): Promise<ActionResult> => {
  const parsed = tokenSchema.safeParse(token)
  if (!parsed.success) return { success: false, error: 'Invalid token' }

  // Require the user to be logged in
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'You must be logged in to accept an invitation' }

  const admin = createAdminClient()

  // Fetch the invitation
  const { data: invitation } = await admin
    .from('org_invitations')
    .select('id, org_id, email, role, status, expires_at')
    .eq('token', parsed.data)
    .single()

  if (!invitation) return { success: false, error: 'Invitation not found' }
  if (invitation.status !== 'pending')
    return { success: false, error: 'Invitation is no longer valid' }

  const expiresAt = new Date(invitation.expires_at as string)
  if (expiresAt < new Date()) return { success: false, error: 'This invitation has expired' }

  // Verify the user's email matches the invitation
  if (user.email !== invitation.email) {
    return {
      success: false,
      error: `This invitation was sent to ${invitation.email}. Please log in with that email address.`,
    }
  }

  // Check if already a member of this specific org
  const { data: existingMember } = await admin
    .from('org_members')
    .select('id')
    .eq('org_id', invitation.org_id)
    .eq('user_id', user.id)
    .single()

  if (existingMember) {
    // Mark invitation as accepted anyway
    await admin.from('org_invitations').update({ status: 'accepted' }).eq('id', invitation.id)

    redirect('/dashboard')
  }

  // Guard against multi-org membership (not yet supported)
  const { data: anyMembership } = await admin
    .from('org_members')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (anyMembership) {
    return {
      success: false,
      error: 'You are already a member of an organization. Multi-org support is coming soon.',
    }
  }

  // Add user to the organization
  const { error: memberError } = await admin.from('org_members').insert({
    org_id: invitation.org_id as string,
    user_id: user.id,
    role: invitation.role as string,
  })

  if (memberError) {
    console.error('Failed to add member to org:', memberError.message)
    return { success: false, error: 'Failed to join the organization. Please try again.' }
  }

  // Auto-enroll the new member in the org's General channel (non-critical)
  const { data: generalChannel } = await admin
    .from('chat_channels')
    .select('id')
    .eq('org_id', invitation.org_id as string)
    .eq('type', 'org')
    .eq('name', 'General')
    .is('archived_at', null)
    .maybeSingle()

  if (generalChannel) {
    const { error: channelMemberError } = await admin
      .from('chat_channel_members')
      .insert({ channel_id: generalChannel.id, user_id: user.id })

    if (channelMemberError) {
      console.error('Failed to add new member to General channel:', channelMemberError.message)
    }
  }

  // Mark invitation as accepted
  await admin.from('org_invitations').update({ status: 'accepted' }).eq('id', invitation.id)

  redirect('/dashboard')
}

/* ============================================================
   declineInvitation — Mark invitation as revoked
   ============================================================ */

export const declineInvitation = async (token: string): Promise<ActionResult> => {
  const parsed = tokenSchema.safeParse(token)
  if (!parsed.success) return { success: false, error: 'Invalid token' }

  // Require the user to be logged in
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'You must be logged in to decline an invitation' }

  const admin = createAdminClient()

  const { data: invitation } = await admin
    .from('org_invitations')
    .select('id, email, status')
    .eq('token', parsed.data)
    .single()

  if (!invitation) return { success: false, error: 'Invitation not found' }
  if (invitation.status !== 'pending') {
    return { success: false, error: 'Invitation is no longer valid' }
  }

  // Verify the user's email matches the invitation
  if (user.email !== invitation.email) {
    return {
      success: false,
      error: `This invitation was sent to ${invitation.email}. Please log in with that email address.`,
    }
  }

  const { error } = await admin
    .from('org_invitations')
    .update({ status: 'revoked' })
    .eq('id', invitation.id)

  if (error) {
    console.error('Failed to decline invitation:', error.message)
    return { success: false, error: 'Failed to decline invitation. Please try again.' }
  }

  return { success: true }
}
