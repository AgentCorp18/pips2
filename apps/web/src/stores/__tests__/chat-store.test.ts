import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore, useTotalUnread } from '../chat-store'
import type { ChatMessage } from '../chat-store'
import { renderHook, act } from '@testing-library/react'

/** Minimal valid ChatMessage factory — avoids repeating all required fields. */
const makeMsg = (overrides: Partial<ChatMessage> & { id: string; body: string }): ChatMessage => ({
  channel_id: 'ch-1',
  org_id: 'org-1',
  author_id: 'user-1',
  mentions: [],
  edited_at: null,
  deleted_at: null,
  created_at: '2026-01-01T00:00:00Z',
  reply_to_id: null,
  reply_count: 0,
  ...overrides,
})

describe('useChatStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useChatStore.getState().clear()
  })

  it('initializes with empty state', () => {
    const state = useChatStore.getState()
    expect(state.activeChannelId).toBeNull()
    expect(state.channels).toEqual([])
    expect(state.messages).toEqual({})
    expect(state.unreadCounts).toEqual({})
    expect(state.isLoaded).toBe(false)
    expect(state.threadMessages).toEqual({})
    expect(state.activeThreadId).toBeNull()
  })

  it('setActiveChannel updates the active channel', () => {
    act(() => {
      useChatStore.getState().setActiveChannel('ch-1')
    })
    expect(useChatStore.getState().activeChannelId).toBe('ch-1')
  })

  it('setChannels stores channels and marks as loaded', () => {
    const channels = [
      {
        id: 'ch-1',
        org_id: 'org-1',
        type: 'custom' as const,
        name: 'General',
        entity_id: null,
        created_by: 'user-1',
        archived_at: null,
        created_at: '2026-01-01',
      },
    ]

    act(() => {
      useChatStore.getState().setChannels(channels)
    })

    const state = useChatStore.getState()
    expect(state.channels).toHaveLength(1)
    expect(state.channels[0]?.name).toBe('General')
    expect(state.isLoaded).toBe(true)
  })

  it('appendMessage adds a message to a channel', () => {
    const message = makeMsg({ id: 'msg-1', body: 'Hello!' })

    act(() => {
      useChatStore.getState().appendMessage('ch-1', message)
    })

    const messages = useChatStore.getState().messages['ch-1']
    expect(messages).toHaveLength(1)
    expect(messages?.[0]?.body).toBe('Hello!')
  })

  it('updateMessage modifies an existing message', () => {
    const message = makeMsg({ id: 'msg-1', body: 'Hello!' })

    act(() => {
      useChatStore.getState().appendMessage('ch-1', message)
      useChatStore.getState().updateMessage('ch-1', 'msg-1', { body: 'Updated!' })
    })

    const messages = useChatStore.getState().messages['ch-1']
    expect(messages?.[0]?.body).toBe('Updated!')
  })

  it('prependMessages adds older messages to the front', () => {
    const msg1 = makeMsg({ id: 'msg-1', body: 'Newer', created_at: '2026-01-02T00:00:00Z' })
    const msg0 = makeMsg({ id: 'msg-0', body: 'Older', created_at: '2026-01-01T00:00:00Z' })

    act(() => {
      useChatStore.getState().appendMessage('ch-1', msg1)
      useChatStore.getState().prependMessages('ch-1', [msg0])
    })

    const messages = useChatStore.getState().messages['ch-1']
    expect(messages).toHaveLength(2)
    expect(messages?.[0]?.body).toBe('Older')
    expect(messages?.[1]?.body).toBe('Newer')
  })

  it('incrementUnread increases unread count', () => {
    act(() => {
      useChatStore.getState().incrementUnread('ch-1')
      useChatStore.getState().incrementUnread('ch-1')
    })

    expect(useChatStore.getState().unreadCounts['ch-1']).toBe(2)
  })

  it('clearUnread resets unread count for a channel', () => {
    act(() => {
      useChatStore.getState().incrementUnread('ch-1')
      useChatStore.getState().incrementUnread('ch-1')
      useChatStore.getState().clearUnread('ch-1')
    })

    expect(useChatStore.getState().unreadCounts['ch-1']).toBe(0)
  })

  it('setDraft stores compose draft per channel', () => {
    act(() => {
      useChatStore.getState().setDraft('ch-1', 'Hello')
      useChatStore.getState().setDraft('ch-2', 'World')
    })

    const state = useChatStore.getState()
    expect(state.drafts['ch-1']).toBe('Hello')
    expect(state.drafts['ch-2']).toBe('World')
  })

  it('clear resets all state including thread state', () => {
    act(() => {
      useChatStore.getState().setActiveChannel('ch-1')
      useChatStore.getState().incrementUnread('ch-1')
      useChatStore.getState().setDraft('ch-1', 'draft')
      useChatStore.getState().setActiveThread('msg-1')
      useChatStore.getState().setThreadMessages('msg-1', [makeMsg({ id: 'r-1', body: 'Reply' })])
      useChatStore.getState().clear()
    })

    const state = useChatStore.getState()
    expect(state.activeChannelId).toBeNull()
    expect(state.channels).toEqual([])
    expect(state.messages).toEqual({})
    expect(state.unreadCounts).toEqual({})
    expect(state.drafts).toEqual({})
    expect(state.isLoaded).toBe(false)
    expect(state.threadMessages).toEqual({})
    expect(state.activeThreadId).toBeNull()
  })

  /* ============================================================
     Thread actions
     ============================================================ */

  it('setActiveThread sets activeThreadId', () => {
    act(() => {
      useChatStore.getState().setActiveThread('msg-parent')
    })
    expect(useChatStore.getState().activeThreadId).toBe('msg-parent')
  })

  it('setActiveThread can clear activeThreadId with null', () => {
    act(() => {
      useChatStore.getState().setActiveThread('msg-parent')
      useChatStore.getState().setActiveThread(null)
    })
    expect(useChatStore.getState().activeThreadId).toBeNull()
  })

  it('setThreadMessages stores messages keyed by parent message ID', () => {
    const replies = [
      makeMsg({ id: 'r-1', body: 'First reply', reply_to_id: 'msg-parent' }),
      makeMsg({ id: 'r-2', body: 'Second reply', reply_to_id: 'msg-parent' }),
    ]

    act(() => {
      useChatStore.getState().setThreadMessages('msg-parent', replies)
    })

    const stored = useChatStore.getState().threadMessages['msg-parent']
    expect(stored).toHaveLength(2)
    expect(stored?.[0]?.body).toBe('First reply')
    expect(stored?.[1]?.body).toBe('Second reply')
  })

  it('appendThreadMessage adds a reply to the correct thread', () => {
    const reply1 = makeMsg({ id: 'r-1', body: 'First reply', reply_to_id: 'msg-parent' })
    const reply2 = makeMsg({ id: 'r-2', body: 'Second reply', reply_to_id: 'msg-parent' })

    act(() => {
      useChatStore.getState().appendThreadMessage('msg-parent', reply1)
      useChatStore.getState().appendThreadMessage('msg-parent', reply2)
    })

    const stored = useChatStore.getState().threadMessages['msg-parent']
    expect(stored).toHaveLength(2)
    expect(stored?.[1]?.body).toBe('Second reply')
  })

  it('appendThreadMessage does not affect other threads', () => {
    const reply = makeMsg({ id: 'r-1', body: 'Reply', reply_to_id: 'msg-a' })

    act(() => {
      useChatStore.getState().appendThreadMessage('msg-a', reply)
    })

    expect(useChatStore.getState().threadMessages['msg-b']).toBeUndefined()
  })

  it('updateThreadMessage updates the correct message in the correct thread', () => {
    const reply = makeMsg({ id: 'r-1', body: 'Original', reply_to_id: 'msg-parent' })

    act(() => {
      useChatStore.getState().setThreadMessages('msg-parent', [reply])
      useChatStore.getState().updateThreadMessage('msg-parent', 'r-1', { body: 'Edited' })
    })

    const stored = useChatStore.getState().threadMessages['msg-parent']
    expect(stored?.[0]?.body).toBe('Edited')
  })

  it('updateThreadMessage does not affect other messages in same thread', () => {
    const r1 = makeMsg({ id: 'r-1', body: 'First', reply_to_id: 'msg-parent' })
    const r2 = makeMsg({ id: 'r-2', body: 'Second', reply_to_id: 'msg-parent' })

    act(() => {
      useChatStore.getState().setThreadMessages('msg-parent', [r1, r2])
      useChatStore.getState().updateThreadMessage('msg-parent', 'r-1', { body: 'Edited first' })
    })

    const stored = useChatStore.getState().threadMessages['msg-parent']
    expect(stored?.[0]?.body).toBe('Edited first')
    expect(stored?.[1]?.body).toBe('Second')
  })

  it('updateReplyCount increments reply_count on the parent message in main channel', () => {
    const parent = makeMsg({ id: 'msg-parent', body: 'Parent', reply_count: 0 })

    act(() => {
      useChatStore.getState().setMessages('ch-1', [parent])
      useChatStore.getState().updateReplyCount('ch-1', 'msg-parent', 1)
    })

    const msgs = useChatStore.getState().messages['ch-1']
    expect(msgs?.[0]?.reply_count).toBe(1)
  })

  it('updateReplyCount decrements reply_count on the parent message', () => {
    const parent = makeMsg({ id: 'msg-parent', body: 'Parent', reply_count: 3 })

    act(() => {
      useChatStore.getState().setMessages('ch-1', [parent])
      useChatStore.getState().updateReplyCount('ch-1', 'msg-parent', -1)
    })

    const msgs = useChatStore.getState().messages['ch-1']
    expect(msgs?.[0]?.reply_count).toBe(2)
  })

  it('updateReplyCount does not decrement reply_count below zero', () => {
    const parent = makeMsg({ id: 'msg-parent', body: 'Parent', reply_count: 0 })

    act(() => {
      useChatStore.getState().setMessages('ch-1', [parent])
      useChatStore.getState().updateReplyCount('ch-1', 'msg-parent', -1)
    })

    const msgs = useChatStore.getState().messages['ch-1']
    expect(msgs?.[0]?.reply_count).toBe(0)
  })

  it('updateReplyCount only affects the specified parent message', () => {
    const parent = makeMsg({ id: 'msg-parent', body: 'Parent', reply_count: 1 })
    const other = makeMsg({ id: 'msg-other', body: 'Other', reply_count: 5 })

    act(() => {
      useChatStore.getState().setMessages('ch-1', [parent, other])
      useChatStore.getState().updateReplyCount('ch-1', 'msg-parent', 1)
    })

    const msgs = useChatStore.getState().messages['ch-1']
    expect(msgs?.[0]?.reply_count).toBe(2)
    expect(msgs?.[1]?.reply_count).toBe(5) // unchanged
  })
})

describe('useTotalUnread', () => {
  beforeEach(() => {
    useChatStore.getState().clear()
  })

  it('returns 0 when no unread counts', () => {
    const { result } = renderHook(() => useTotalUnread())
    expect(result.current).toBe(0)
  })

  it('sums unread counts across channels', () => {
    act(() => {
      useChatStore.getState().setUnreadCount('ch-1', 3)
      useChatStore.getState().setUnreadCount('ch-2', 5)
    })

    const { result } = renderHook(() => useTotalUnread())
    expect(result.current).toBe(8)
  })
})
