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
}

export const useChatStore = create<ChatState>((set) => ({
  activeChannelId: null,
  channels: [],
  messages: {},
  unreadCounts: {},
  drafts: {},
  isLoaded: false,

  setActiveChannel: (channelId) => set({ activeChannelId: channelId }),

  setChannels: (channels) => set({ channels, isLoaded: true }),

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
      unreadCounts: {},
      drafts: {},
      isLoaded: false,
    }),
}))

/** Total unread count across all channels */
export const useTotalUnread = (): number => {
  const unreadCounts = useChatStore((s) => s.unreadCounts)
  return Object.values(unreadCounts).reduce((sum, c) => sum + c, 0)
}
