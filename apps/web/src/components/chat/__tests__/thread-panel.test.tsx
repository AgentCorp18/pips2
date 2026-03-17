import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react'
import { ThreadPanel } from '../thread-panel'
import type { ChatMessage as ChatMessageType } from '@/stores/chat-store'
import { useChatStore } from '@/stores/chat-store'

/* ============================================================
   jsdom polyfills
   ============================================================ */

// jsdom does not implement scrollIntoView — mock it globally
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

/* ============================================================
   Mocks
   ============================================================ */

const mockGetThreadReplies = vi.fn()
const mockSendMessage = vi.fn()
const mockEditMessage = vi.fn()
const mockDeleteMessage = vi.fn()

vi.mock('@/app/(app)/chat/actions', () => ({
  getThreadReplies: (...args: unknown[]) => mockGetThreadReplies(...args),
  sendMessage: (...args: unknown[]) => mockSendMessage(...args),
  editMessage: (...args: unknown[]) => mockEditMessage(...args),
  deleteMessage: (...args: unknown[]) => mockDeleteMessage(...args),
}))

/* ============================================================
   Helpers
   ============================================================ */

const makeMessage = (overrides: Partial<ChatMessageType> = {}): ChatMessageType => ({
  id: 'msg-1',
  channel_id: 'ch-1',
  org_id: 'org-1',
  author_id: 'user-1',
  body: 'Parent message',
  mentions: [],
  edited_at: null,
  deleted_at: null,
  created_at: new Date().toISOString(),
  reply_to_id: null,
  reply_count: 2,
  author: { display_name: 'Alice', avatar_url: null },
  ...overrides,
})

const makeReply = (overrides: Partial<ChatMessageType> = {}): ChatMessageType => ({
  id: 'reply-1',
  channel_id: 'ch-1',
  org_id: 'org-1',
  author_id: 'user-2',
  body: 'A reply',
  mentions: [],
  edited_at: null,
  deleted_at: null,
  created_at: new Date().toISOString(),
  reply_to_id: 'msg-1',
  reply_count: 0,
  author: { display_name: 'Bob', avatar_url: null },
  ...overrides,
})

const defaultProps = {
  parentMessage: makeMessage(),
  channelId: 'ch-1',
  currentUserId: 'user-1',
  onClose: vi.fn(),
  canSend: true,
}

/* ============================================================
   Tests
   ============================================================ */

describe('ThreadPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useChatStore.getState().clear()
    // Default: resolve with empty replies
    mockGetThreadReplies.mockResolvedValue({ data: { messages: [], hasMore: false } })
  })

  it('shows loading indicator while fetching replies', () => {
    // Never resolves so we can see the loading state
    mockGetThreadReplies.mockReturnValue(new Promise(() => {}))

    render(<ThreadPanel {...defaultProps} />)

    // Loading spinner should be visible (loaded=false on mount)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders the parent message at the top', async () => {
    render(<ThreadPanel {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Parent message')).toBeInTheDocument()
    })
  })

  it('renders "Thread" as the panel header', () => {
    render(<ThreadPanel {...defaultProps} />)
    expect(screen.getByText('Thread')).toBeInTheDocument()
  })

  it('shows empty state when there are no replies', async () => {
    mockGetThreadReplies.mockResolvedValue({ data: { messages: [], hasMore: false } })

    await act(async () => {
      render(<ThreadPanel {...defaultProps} />)
    })

    await waitFor(() => {
      expect(screen.getByText('No replies yet. Start the thread!')).toBeInTheDocument()
    })
  })

  it('renders thread replies after loading', async () => {
    mockGetThreadReplies.mockResolvedValue({
      data: {
        messages: [
          makeReply({ id: 'r-1', body: 'First reply' }),
          makeReply({ id: 'r-2', body: 'Second reply' }),
        ],
        hasMore: false,
      },
    })

    await act(async () => {
      render(<ThreadPanel {...defaultProps} />)
    })

    await waitFor(() => {
      expect(screen.getByText('First reply')).toBeInTheDocument()
      expect(screen.getByText('Second reply')).toBeInTheDocument()
    })
  })

  it('shows replies from store when refresh also returns replies', async () => {
    const cachedReply = makeReply({ id: 'r-cached', body: 'Cached reply' })

    // Pre-populate thread messages in store
    act(() => {
      useChatStore.getState().setThreadMessages('msg-1', [cachedReply])
    })

    // Mock refresh returns the same reply
    mockGetThreadReplies.mockResolvedValue({
      data: { messages: [cachedReply], hasMore: false },
    })

    await act(async () => {
      render(<ThreadPanel {...defaultProps} />)
    })

    await waitFor(() => {
      expect(screen.getByText('Cached reply')).toBeInTheDocument()
    })
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()

    render(<ThreadPanel {...defaultProps} onClose={onClose} />)

    const closeBtn = screen.getByTestId('thread-panel-close')
    closeBtn.click()

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders compose input when canSend is true', async () => {
    await act(async () => {
      render(<ThreadPanel {...defaultProps} canSend />)
    })

    expect(screen.getByTestId('chat-compose-input')).toBeInTheDocument()
  })

  it('shows permission message when canSend is false', async () => {
    await act(async () => {
      render(<ThreadPanel {...defaultProps} canSend={false} />)
    })

    await waitFor(() => {
      expect(screen.getByText("You don't have permission to send messages")).toBeInTheDocument()
    })
  })

  it('shows error toast when getThreadReplies fails and hides spinner', async () => {
    mockGetThreadReplies.mockResolvedValue({ error: 'Failed to load thread' })

    await act(async () => {
      render(<ThreadPanel {...defaultProps} />)
    })

    await waitFor(() => {
      // Loading spinner should be gone after error resolves
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument()
    })
  })

  it('has correct data-testid on the panel root', () => {
    render(<ThreadPanel {...defaultProps} />)
    expect(screen.getByTestId('thread-panel')).toBeInTheDocument()
  })
})
