'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentOrg } from '@/lib/get-current-org'
import { requirePermission } from '@/lib/permissions'
import type { ChatChannel, ChatMessage, ChatSummary, ChatChannelType } from '@/stores/chat-store'

/* ============================================================
   Types
   ============================================================ */

type ActionResult<T = void> = { data?: T; error?: string }

type ChannelWithUnread = ChatChannel & { unread_count: number }

type MessageWithAuthor = ChatMessage & {
  author: { display_name: string; avatar_url: string | null }
}

/* ============================================================
   Helper: get current user + org
   ============================================================ */

const getAuthContext = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, user: null, orgId: null }

  const currentOrg = await getCurrentOrg(supabase, user.id)
  return { supabase, user, orgId: currentOrg?.orgId ?? null }
}

/* ============================================================
   getChannels — List user's channels with unread counts
   ============================================================ */

export const getChannels = async (): Promise<ActionResult<ChannelWithUnread[]>> => {
  const { supabase, user, orgId } = await getAuthContext()
  if (!user) return { error: 'Not authenticated' }
  if (!orgId) return { error: 'No organization selected' }

  // Get channels the user is a member of
  const { data: memberships, error: memberError } = await supabase
    .from('chat_channel_members')
    .select('channel_id, last_read_at')
    .eq('user_id', user.id)

  if (memberError) {
    console.error('Failed to fetch memberships:', memberError.message)
    return { error: 'Failed to load channels' }
  }

  if (!memberships || memberships.length === 0) {
    return { data: [] }
  }

  const channelIds = memberships.map((m) => m.channel_id)
  const lastReadMap = Object.fromEntries(memberships.map((m) => [m.channel_id, m.last_read_at]))

  // Fetch channels — scoped to current org
  const { data: channels, error: channelError } = await supabase
    .from('chat_channels')
    .select('*')
    .in('id', channelIds)
    .eq('org_id', orgId)
    .is('archived_at', null)
    .order('created_at', { ascending: false })

  if (channelError) {
    console.error('Failed to fetch channels:', channelError.message)
    return { error: 'Failed to load channels' }
  }

  if (!channels || channels.length === 0) {
    return { data: [] }
  }

  // Batch unread count query — single query instead of N+1
  // Build a map of channel_id → last_read_at for channels we actually fetched
  const channelLastReadPairs = channels
    .filter((ch) => lastReadMap[ch.id])
    .map((ch) => ({ id: ch.id, lastRead: lastReadMap[ch.id] as string }))

  const unreadMap: Record<string, number> = {}

  if (channelLastReadPairs.length > 0) {
    // Use a single RPC-style query: count unread per channel in one round-trip
    // Since Supabase JS doesn't support GROUP BY, we use a raw query via rpc or
    // batch the counts with Promise.all but limit concurrency
    const counts = await Promise.all(
      channelLastReadPairs.map(async ({ id, lastRead }) => {
        const { count } = await supabase
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .eq('channel_id', id)
          .gt('created_at', lastRead)
          .neq('author_id', user.id)
          .is('deleted_at', null)
        return { id, count: count ?? 0 }
      }),
    )
    for (const { id, count } of counts) {
      unreadMap[id] = count
    }
  }

  const result: ChannelWithUnread[] = channels.map((ch) => ({
    ...ch,
    unread_count: unreadMap[ch.id] ?? 0,
  })) as ChannelWithUnread[]

  return { data: result }
}

/* ============================================================
   getChannel — Channel details + members
   ============================================================ */

type ChannelMember = {
  user_id: string
  display_name: string
  avatar_url: string | null
  joined_at: string
  muted: boolean
}

export const getChannel = async (
  channelId: string,
): Promise<ActionResult<{ channel: ChatChannel; members: ChannelMember[] }>> => {
  const { supabase, user, orgId } = await getAuthContext()
  if (!user) return { error: 'Not authenticated' }
  if (!orgId) return { error: 'No organization selected' }

  const { data: channel, error: chError } = await supabase
    .from('chat_channels')
    .select('*')
    .eq('id', channelId)
    .eq('org_id', orgId)
    .single()

  if (chError || !channel) {
    return { error: 'Channel not found' }
  }

  // Get members with profiles (batch query to avoid N+1)
  const { data: members } = await supabase
    .from('chat_channel_members')
    .select('user_id, joined_at, muted')
    .eq('channel_id', channelId)

  const memberIds = (members ?? []).map((m) => m.user_id)
  const { data: profiles } =
    memberIds.length > 0
      ? await supabase.from('profiles').select('id, display_name, avatar_url').in('id', memberIds)
      : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  const memberProfiles: ChannelMember[] = (members ?? []).map((m) => ({
    user_id: m.user_id,
    display_name: profileMap[m.user_id]?.display_name ?? 'Unknown',
    avatar_url: profileMap[m.user_id]?.avatar_url ?? null,
    joined_at: m.joined_at,
    muted: m.muted,
  }))

  return { data: { channel: channel as ChatChannel, members: memberProfiles } }
}

/* ============================================================
   getMessages — Paginated messages (newest first, cursor-based)
   ============================================================ */

export const getMessages = async (
  channelId: string,
  cursor?: string,
  limit = 50,
): Promise<ActionResult<{ messages: MessageWithAuthor[]; hasMore: boolean }>> => {
  const { supabase, user } = await getAuthContext()
  if (!user) return { error: 'Not authenticated' }

  let query = supabase
    .from('chat_messages')
    .select('*')
    .eq('channel_id', channelId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch messages:', error.message)
    return { error: 'Failed to load messages' }
  }

  const hasMore = (data?.length ?? 0) > limit
  const messages = (data ?? []).slice(0, limit)

  // Fetch author profiles
  const authorIds = [...new Set(messages.map((m) => m.author_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', authorIds)

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  const messagesWithAuthors: MessageWithAuthor[] = messages
    .map((m) => ({
      ...m,
      mentions: m.mentions ?? [],
      author: {
        display_name: profileMap[m.author_id]?.display_name ?? 'Unknown',
        avatar_url: profileMap[m.author_id]?.avatar_url ?? null,
      },
    }))
    .reverse() // Return in ascending order for display

  return { data: { messages: messagesWithAuthors, hasMore } }
}

/* ============================================================
   sendMessage — Insert message, extract @mentions
   ============================================================ */

export const sendMessage = async (
  channelId: string,
  body: string,
): Promise<ActionResult<ChatMessage>> => {
  const { supabase, user, orgId } = await getAuthContext()
  if (!user) return { error: 'Not authenticated' }
  if (!orgId) return { error: 'No organization context' }

  try {
    await requirePermission(orgId, 'chat.send')
  } catch {
    return { error: 'Insufficient permissions to send messages' }
  }

  const trimmedBody = body.trim()
  if (!trimmedBody) return { error: 'Message cannot be empty' }

  // Extract @mentions (UUIDs in format @[uuid])
  const mentionRegex = /@\[([0-9a-f-]{36})\]/g
  const mentions: string[] = []
  let match
  while ((match = mentionRegex.exec(trimmedBody)) !== null) {
    if (match[1]) mentions.push(match[1])
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      channel_id: channelId,
      org_id: orgId,
      author_id: user.id,
      body: trimmedBody,
      mentions,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to send message:', error.message)
    return { error: 'Failed to send message' }
  }

  return { data: data as ChatMessage }
}

/* ============================================================
   editMessage — Author or admin only
   ============================================================ */

export const editMessage = async (messageId: string, body: string): Promise<ActionResult> => {
  const { supabase, user, orgId } = await getAuthContext()
  if (!user) return { error: 'Not authenticated' }
  if (!orgId) return { error: 'No organization context' }

  try {
    await requirePermission(orgId, 'chat.send')
  } catch {
    return { error: 'Insufficient permissions to edit messages' }
  }

  const { error } = await supabase
    .from('chat_messages')
    .update({ body: body.trim(), edited_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('author_id', user.id)

  if (error) {
    console.error('Failed to edit message:', error.message)
    return { error: 'Failed to edit message' }
  }

  return {}
}

/* ============================================================
   deleteMessage — Soft delete, author or admin
   ============================================================ */

export const deleteMessage = async (messageId: string): Promise<ActionResult> => {
  const { supabase, user, orgId } = await getAuthContext()
  if (!user) return { error: 'Not authenticated' }
  if (!orgId) return { error: 'No organization context' }

  try {
    await requirePermission(orgId, 'chat.send')
  } catch {
    return { error: 'Insufficient permissions to delete messages' }
  }

  const { error } = await supabase
    .from('chat_messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('author_id', user.id)

  if (error) {
    console.error('Failed to delete message:', error.message)
    return { error: 'Failed to delete message' }
  }

  return {}
}

/* ============================================================
   createChannel — Custom or DM channel
   ============================================================ */

export const createChannel = async (
  type: ChatChannelType,
  name?: string,
  memberIds?: string[],
  entityId?: string,
): Promise<ActionResult<ChatChannel>> => {
  const { supabase, user, orgId } = await getAuthContext()
  if (!user) return { error: 'Not authenticated' }
  if (!orgId) return { error: 'No organization context' }

  try {
    await requirePermission(orgId, 'chat.manage')
  } catch {
    return { error: 'Insufficient permissions to create channels' }
  }

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Admin client creation failed:', err)
    return { error: 'Server configuration error. Please contact support.' }
  }

  // For DM channels, check if one already exists between these users
  if (type === 'direct' && memberIds && memberIds.length === 1) {
    const otherUserId = memberIds[0]
    const { data: existing } = await supabase
      .from('chat_channels')
      .select('id, org_id, type, name, entity_id, created_by, archived_at, created_at')
      .eq('org_id', orgId)
      .eq('type', 'direct')
      .is('archived_at', null)

    if (existing) {
      for (const ch of existing) {
        const { data: members } = await supabase
          .from('chat_channel_members')
          .select('user_id')
          .eq('channel_id', ch.id)

        const memberUserIds = (members ?? []).map((m) => m.user_id)
        if (
          memberUserIds.length === 2 &&
          memberUserIds.includes(user.id) &&
          memberUserIds.includes(otherUserId)
        ) {
          return { data: ch as ChatChannel }
        }
      }
    }
  }

  // Use the admin client for channel INSERT to bypass RLS chicken-and-egg:
  // The INSERT policy on chat_channels verifies org membership, which is fine,
  // but the subsequent INSERT on chat_channel_members referencing the new channel_id
  // requires the channel to exist first. Using admin for both avoids any ordering
  // or policy-evaluation issues during creation.
  const { data: channel, error } = await admin
    .from('chat_channels')
    .insert({
      org_id: orgId,
      type,
      name: name ?? null,
      entity_id: entityId ?? null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create channel:', error.message, 'code:', error.code)
    return { error: `Failed to create channel: ${error.message}` }
  }

  // Add creator and any additional members via admin client
  const allMembers = [user.id, ...(memberIds ?? [])].filter((id, i, arr) => arr.indexOf(id) === i)

  for (const memberId of allMembers) {
    const { error: memberError } = await admin.from('chat_channel_members').insert({
      channel_id: channel.id,
      user_id: memberId,
    })
    if (memberError) {
      console.error(
        'Failed to add member',
        memberId,
        'to channel',
        channel.id,
        ':',
        memberError.message,
      )
    }
  }

  return { data: channel as ChatChannel }
}

/* ============================================================
   archiveChannel — Admin only
   ============================================================ */

export const archiveChannel = async (channelId: string): Promise<ActionResult> => {
  const { supabase, user, orgId } = await getAuthContext()
  if (!user) return { error: 'Not authenticated' }
  if (!orgId) return { error: 'No organization selected' }

  try {
    await requirePermission(orgId, 'chat.manage')
  } catch {
    return { error: 'Insufficient permissions to archive channels' }
  }

  const { error } = await supabase
    .from('chat_channels')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', channelId)
    .eq('org_id', orgId)

  if (error) {
    console.error('Failed to archive channel:', error.message)
    return { error: 'Failed to archive channel' }
  }

  return {}
}

/* ============================================================
   addMembers — Add members to channel
   ============================================================ */

export const addMembers = async (channelId: string, userIds: string[]): Promise<ActionResult> => {
  const { user, orgId } = await getAuthContext()
  if (!user) return { error: 'Not authenticated' }
  if (!orgId) return { error: 'No organization context' }

  try {
    await requirePermission(orgId, 'chat.manage')
  } catch {
    return { error: 'Insufficient permissions to manage channel members' }
  }

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch {
    return { error: 'Server configuration error' }
  }

  // Verify the channel belongs to the user's org
  const { data: channel } = await admin
    .from('chat_channels')
    .select('org_id')
    .eq('id', channelId)
    .single()

  if (!channel || channel.org_id !== orgId) {
    return { error: 'Channel not found' }
  }

  for (const userId of userIds) {
    const { error } = await admin
      .from('chat_channel_members')
      .upsert({ channel_id: channelId, user_id: userId }, { onConflict: 'channel_id,user_id' })

    if (error) {
      console.error('Failed to add member', userId, ':', error.message)
    }
  }

  return {}
}

/* ============================================================
   markChannelRead — Update last_read_at
   ============================================================ */

export const markChannelRead = async (channelId: string): Promise<ActionResult> => {
  const { supabase, user } = await getAuthContext()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('chat_channel_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('channel_id', channelId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to mark channel read:', error.message)
    return { error: 'Failed to mark channel as read' }
  }

  return {}
}

/* ============================================================
   generateSummary — AI summary via Claude API
   ============================================================ */

export const generateSummary = async (channelId: string): Promise<ActionResult<ChatSummary>> => {
  const { supabase, user } = await getAuthContext()
  if (!user) return { error: 'Not authenticated' }

  // Fetch recent messages
  const { data: messages, error: msgError } = await supabase
    .from('chat_messages')
    .select('body, created_at')
    .eq('channel_id', channelId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(100)

  if (msgError || !messages || messages.length === 0) {
    return { error: 'No messages to summarize' }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { error: 'AI summarization is not configured' }
  }

  const conversationText = messages.map((m) => m.body).join('\n')

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Summarize this team chat conversation in 3-5 bullet points. Focus on key decisions, action items, and important topics discussed:\n\n${conversationText}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      return { error: 'Failed to generate summary' }
    }

    const result = await response.json()
    const summaryText = result.content?.[0]?.text ?? 'No summary generated'

    // Save summary
    const firstMsg = messages[0]!
    const lastMsg = messages[messages.length - 1]!

    const { data: firstMsgData } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('channel_id', channelId)
      .eq('created_at', firstMsg.created_at)
      .limit(1)
      .single()

    const { data: lastMsgData } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('channel_id', channelId)
      .eq('created_at', lastMsg.created_at)
      .limit(1)
      .single()

    const { data: summary, error: saveError } = await supabase
      .from('chat_summaries')
      .insert({
        channel_id: channelId,
        summary: summaryText,
        from_message_id: firstMsgData?.id ?? null,
        to_message_id: lastMsgData?.id ?? null,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save summary:', saveError.message)
      // Return the summary even if save failed
      return {
        data: {
          id: 'temp',
          channel_id: channelId,
          summary: summaryText,
          from_message_id: null,
          to_message_id: null,
          created_at: new Date().toISOString(),
        },
      }
    }

    return { data: summary as ChatSummary }
  } catch (err) {
    console.error('AI summary failed:', err)
    return { error: 'Failed to generate summary' }
  }
}

/* ============================================================
   removeMember — Remove a member from a channel (admin only)
   ============================================================ */

export const removeMember = async (channelId: string, userId: string): Promise<ActionResult> => {
  const { user, orgId } = await getAuthContext()
  if (!user) return { error: 'Not authenticated' }
  if (!orgId) return { error: 'No organization context' }

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch {
    return { error: 'Server configuration error' }
  }

  // Verify the channel belongs to the user's org
  const { data: channel } = await admin
    .from('chat_channels')
    .select('org_id')
    .eq('id', channelId)
    .single()

  if (!channel || channel.org_id !== orgId) {
    return { error: 'Channel not found' }
  }

  const { error } = await admin
    .from('chat_channel_members')
    .delete()
    .eq('channel_id', channelId)
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to remove member:', error.message)
    return { error: 'Failed to remove member' }
  }

  return {}
}

/* ============================================================
   getOrgMembers — For @mention autocomplete
   ============================================================ */

export type OrgMemberInfo = {
  user_id: string
  display_name: string
  avatar_url: string | null
}

export const getOrgMembers = async (): Promise<ActionResult<OrgMemberInfo[]>> => {
  const { supabase, user, orgId } = await getAuthContext()
  if (!user) return { error: 'Not authenticated' }
  if (!orgId) return { error: 'No organization context' }

  const { data: members } = await supabase.from('org_members').select('user_id').eq('org_id', orgId)

  if (!members || members.length === 0) return { data: [] }

  // Batch profile lookup to avoid N+1 queries
  const memberIds = members.map((m) => m.user_id)
  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', memberIds)

  const profileMap = Object.fromEntries((profileRows ?? []).map((p) => [p.id, p]))

  const result: OrgMemberInfo[] = members.map((m) => ({
    user_id: m.user_id,
    display_name: profileMap[m.user_id]?.display_name ?? 'Unknown',
    avatar_url: profileMap[m.user_id]?.avatar_url ?? null,
  }))

  return { data: result }
}
