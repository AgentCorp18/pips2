import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore, useTotalUnread } from '../chat-store'
import { renderHook, act } from '@testing-library/react'

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
    const message = {
      id: 'msg-1',
      channel_id: 'ch-1',
      org_id: 'org-1',
      author_id: 'user-1',
      body: 'Hello!',
      mentions: [],
      edited_at: null,
      deleted_at: null,
      created_at: '2026-01-01T00:00:00Z',
    }

    act(() => {
      useChatStore.getState().appendMessage('ch-1', message)
    })

    const messages = useChatStore.getState().messages['ch-1']
    expect(messages).toHaveLength(1)
    expect(messages?.[0]?.body).toBe('Hello!')
  })

  it('updateMessage modifies an existing message', () => {
    const message = {
      id: 'msg-1',
      channel_id: 'ch-1',
      org_id: 'org-1',
      author_id: 'user-1',
      body: 'Hello!',
      mentions: [],
      edited_at: null,
      deleted_at: null,
      created_at: '2026-01-01T00:00:00Z',
    }

    act(() => {
      useChatStore.getState().appendMessage('ch-1', message)
      useChatStore.getState().updateMessage('ch-1', 'msg-1', { body: 'Updated!' })
    })

    const messages = useChatStore.getState().messages['ch-1']
    expect(messages?.[0]?.body).toBe('Updated!')
  })

  it('prependMessages adds older messages to the front', () => {
    const msg1 = {
      id: 'msg-1',
      channel_id: 'ch-1',
      org_id: 'org-1',
      author_id: 'user-1',
      body: 'Newer',
      mentions: [],
      edited_at: null,
      deleted_at: null,
      created_at: '2026-01-02T00:00:00Z',
    }
    const msg0 = {
      id: 'msg-0',
      channel_id: 'ch-1',
      org_id: 'org-1',
      author_id: 'user-1',
      body: 'Older',
      mentions: [],
      edited_at: null,
      deleted_at: null,
      created_at: '2026-01-01T00:00:00Z',
    }

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

  it('clear resets all state', () => {
    act(() => {
      useChatStore.getState().setActiveChannel('ch-1')
      useChatStore.getState().incrementUnread('ch-1')
      useChatStore.getState().setDraft('ch-1', 'draft')
      useChatStore.getState().clear()
    })

    const state = useChatStore.getState()
    expect(state.activeChannelId).toBeNull()
    expect(state.channels).toEqual([])
    expect(state.messages).toEqual({})
    expect(state.unreadCounts).toEqual({})
    expect(state.drafts).toEqual({})
    expect(state.isLoaded).toBe(false)
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
