import { create } from 'zustand'

/* ============================================================
   Types
   ============================================================ */

export type ChatChannelType = 'org' | 'project' | 'ticket' | 'team' | 'direct' | 'custom'

export type ChatChannel = {
  id: string
  org_id: string
  type: ChatChannelType
  name: string | null
  entity_id: string | null
  created_by: string
  archived_at: string | null
  created_at: string
  member_count?: number
}

export type ChatMessage = {
  id: string
  channel_id: string
  org_id: string
  author_id: string
  body: string
  mentions: string[]
  edited_at: string | null
  deleted_at: string | null
  created_at: string
  /** Threading: UUID of the parent message this is a reply to (null = top-level) */
  reply_to_id: string | null
  /** Threading: count of non-deleted replies to this message */
  reply_count: number
  /** Joined author profile for display */
  author?: {
    display_name: string
    avatar_url: string | null
  }
}

export type ChatSummary = {
  id: string
  channel_id: string
  summary: string
  from_message_id: string | null
  to_message_id: string | null
  created_at: string
}

/* ============================================================
   Store
   ============================================================ */

type ChatState = {
  /** Currently viewed channel */
  activeChannelId: string | null
  /** Channel list */
  channels: ChatChannel[]
  /** Messages keyed by channel ID */
  messages: Record<string, ChatMessage[]>
  /** Thread messages keyed by parent message ID */
  threadMessages: Record<string, ChatMessage[]>
  /** Currently open thread's parent message ID */
  activeThreadId: string | null
  /** Unread counts keyed by channel ID */
  unreadCounts: Record<string, number>
  /** Compose draft keyed by channel ID */
  drafts: Record<string, string>
  /** Whether channels have been loaded */
  isLoaded: boolean

  /* Actions */
  setActiveChannel: (channelId: string | null) => void
  setChannels: (channels: ChatChannel[]) => void
  addChannel: (channel: ChatChannel) => void
  setMessages: (channelId: string, messages: ChatMessage[]) => void
  appendMessage: (channelId: string, message: ChatMessage) => void
  updateMessage: (channelId: string, messageId: string, updates: Partial<ChatMessage>) => void
  prependMessages: (channelId: string, messages: ChatMessage[]) => void
  setUnreadCount: (channelId: string, count: number) => void
  incrementUnread: (channelId: string) => void
  clearUnread: (channelId: string) => void
  setDraft: (channelId: string, text: string) => void
  setLoaded: (loaded: boolean) => void
  clear: () => void
  /* Thread actions */
  setActiveThread: (parentMessageId: string | null) => void
  setThreadMessages: (parentMessageId: string, messages: ChatMessage[]) => void
  appendThreadMessage: (parentMessageId: string, message: ChatMessage) => void
  updateThreadMessage: (
    parentMessageId: string,
    messageId: string,
    updates: Partial<ChatMessage>,
  ) => void
  updateReplyCount: (channelId: string, parentMessageId: string, delta: number) => void
}

export const useChatStore = create<ChatState>((set) => ({
  activeChannelId: null,
  channels: [],
  messages: {},
  threadMessages: {},
  activeThreadId: null,
  unreadCounts: {},
  drafts: {},
  isLoaded: false,

  setActiveChannel: (channelId) => set({ activeChannelId: channelId }),

  setChannels: (channels) =>
    set((state) => {
      // Clean up stale unread counts for channels the user is no longer a member of
      const validIds = new Set(channels.map((c) => c.id))
      const unreadCounts = { ...state.unreadCounts }
      for (const id of Object.keys(unreadCounts)) {
        if (!validIds.has(id)) {
          delete unreadCounts[id]
        }
      }
      return { channels, isLoaded: true, unreadCounts }
    }),

  addChannel: (channel) => set((state) => ({ channels: [channel, ...state.channels] })),

  setMessages: (channelId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [channelId]: messages },
    })),

  appendMessage: (channelId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] ?? []), message],
      },
    })),

  updateMessage: (channelId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).map((m) =>
          m.id === messageId ? { ...m, ...updates } : m,
        ),
      },
    })),

  prependMessages: (channelId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [...messages, ...(state.messages[channelId] ?? [])],
      },
    })),

  setUnreadCount: (channelId, count) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [channelId]: count },
    })),

  incrementUnread: (channelId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [channelId]: (state.unreadCounts[channelId] ?? 0) + 1,
      },
    })),

  clearUnread: (channelId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [channelId]: 0 },
    })),

  setDraft: (channelId, text) =>
    set((state) => ({
      drafts: { ...state.drafts, [channelId]: text },
    })),

  setLoaded: (loaded) => set({ isLoaded: loaded }),

  clear: () =>
    set({
      activeChannelId: null,
      channels: [],
      messages: {},
      threadMessages: {},
      activeThreadId: null,
      unreadCounts: {},
      drafts: {},
      isLoaded: false,
    }),

  /* Thread actions */

  setActiveThread: (parentMessageId) => set({ activeThreadId: parentMessageId }),

  setThreadMessages: (parentMessageId, messages) =>
    set((state) => ({
      threadMessages: { ...state.threadMessages, [parentMessageId]: messages },
    })),

  appendThreadMessage: (parentMessageId, message) =>
    set((state) => ({
      threadMessages: {
        ...state.threadMessages,
        [parentMessageId]: [...(state.threadMessages[parentMessageId] ?? []), message],
      },
    })),

  updateThreadMessage: (parentMessageId, messageId, updates) =>
    set((state) => ({
      threadMessages: {
        ...state.threadMessages,
        [parentMessageId]: (state.threadMessages[parentMessageId] ?? []).map((m) =>
          m.id === messageId ? { ...m, ...updates } : m,
        ),
      },
    })),

  updateReplyCount: (channelId, parentMessageId, delta) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).map((m) =>
          m.id === parentMessageId ? { ...m, reply_count: Math.max(0, m.reply_count + delta) } : m,
        ),
      },
    })),
}))

/** Total unread count across all channels */
export const useTotalUnread = (): number => {
  const unreadCounts = useChatStore((s) => s.unreadCounts)
  return Object.values(unreadCounts).reduce((sum, c) => sum + c, 0)
}
