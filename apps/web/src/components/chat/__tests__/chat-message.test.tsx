import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatMessage } from '../chat-message'
import type { ChatMessage as ChatMessageType } from '@/stores/chat-store'

/* ============================================================
   Helpers
   ============================================================ */

const makeMessage = (overrides: Partial<ChatMessageType> = {}): ChatMessageType => ({
  id: 'msg-1',
  channel_id: 'ch-1',
  org_id: 'org-1',
  author_id: 'user-1',
  body: 'Hello world',
  mentions: [],
  edited_at: null,
  deleted_at: null,
  created_at: new Date().toISOString(),
  reply_to_id: null,
  reply_count: 0,
  author: { display_name: 'Alice', avatar_url: null },
  ...overrides,
})

const noop = async () => {}

/* ============================================================
   Tests
   ============================================================ */

describe('ChatMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders message body and author name', () => {
    render(
      <ChatMessage message={makeMessage()} currentUserId="user-2" onEdit={noop} onDelete={noop} />,
    )
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('shows "This message was deleted" for deleted messages', () => {
    render(
      <ChatMessage
        message={makeMessage({ deleted_at: '2026-01-01T00:00:00Z' })}
        currentUserId="user-2"
        onEdit={noop}
        onDelete={noop}
      />,
    )
    expect(screen.getByText('This message was deleted')).toBeInTheDocument()
    expect(screen.queryByText('Hello world')).not.toBeInTheDocument()
  })

  it('shows edit and delete buttons for own messages', () => {
    render(
      <ChatMessage
        message={makeMessage({ author_id: 'user-1' })}
        currentUserId="user-1"
        onEdit={noop}
        onDelete={noop}
      />,
    )
    expect(screen.getByLabelText('Edit message')).toBeInTheDocument()
    expect(screen.getByLabelText('Delete message')).toBeInTheDocument()
  })

  it('does not show edit and delete buttons for other messages', () => {
    render(
      <ChatMessage
        message={makeMessage({ author_id: 'user-2' })}
        currentUserId="user-1"
        onEdit={noop}
        onDelete={noop}
      />,
    )
    expect(screen.queryByLabelText('Edit message')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Delete message')).not.toBeInTheDocument()
  })

  /* ============================================================
     Reply count badge
     ============================================================ */

  it('shows reply count badge when replyCount > 0', () => {
    render(
      <ChatMessage
        message={makeMessage({ reply_count: 3 })}
        currentUserId="user-2"
        onEdit={noop}
        onDelete={noop}
      />,
    )
    const badge = screen.getByTestId('reply-count-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('3 replies')
  })

  it('shows singular "reply" for exactly 1 reply', () => {
    render(
      <ChatMessage
        message={makeMessage({ reply_count: 1 })}
        currentUserId="user-2"
        onEdit={noop}
        onDelete={noop}
      />,
    )
    const badge = screen.getByTestId('reply-count-badge')
    expect(badge).toHaveTextContent('1 reply')
  })

  it('hides reply count badge when reply_count is 0', () => {
    render(
      <ChatMessage
        message={makeMessage({ reply_count: 0 })}
        currentUserId="user-2"
        onEdit={noop}
        onDelete={noop}
      />,
    )
    expect(screen.queryByTestId('reply-count-badge')).not.toBeInTheDocument()
  })

  it('calls onReply with message ID when reply count badge is clicked', () => {
    const onReply = vi.fn()
    render(
      <ChatMessage
        message={makeMessage({ id: 'msg-42', reply_count: 2 })}
        currentUserId="user-2"
        onEdit={noop}
        onDelete={noop}
        onReply={onReply}
      />,
    )
    fireEvent.click(screen.getByTestId('reply-count-badge'))
    expect(onReply).toHaveBeenCalledWith('msg-42')
  })

  /* ============================================================
     Reply button in hover actions
     ============================================================ */

  it('shows reply button when onReply prop is provided', () => {
    const onReply = vi.fn()
    render(
      <ChatMessage
        message={makeMessage()}
        currentUserId="user-2"
        onEdit={noop}
        onDelete={noop}
        onReply={onReply}
      />,
    )
    expect(screen.getByLabelText('Reply in thread')).toBeInTheDocument()
  })

  it('hides reply button when onReply prop is not provided', () => {
    render(
      <ChatMessage message={makeMessage()} currentUserId="user-2" onEdit={noop} onDelete={noop} />,
    )
    expect(screen.queryByLabelText('Reply in thread')).not.toBeInTheDocument()
  })

  it('calls onReply with message ID when reply button is clicked', () => {
    const onReply = vi.fn()
    render(
      <ChatMessage
        message={makeMessage({ id: 'msg-99' })}
        currentUserId="user-2"
        onEdit={noop}
        onDelete={noop}
        onReply={onReply}
      />,
    )
    fireEvent.click(screen.getByLabelText('Reply in thread'))
    expect(onReply).toHaveBeenCalledWith('msg-99')
  })

  it('hides reply button for deleted messages', () => {
    const onReply = vi.fn()
    render(
      <ChatMessage
        message={makeMessage({ deleted_at: '2026-01-01T00:00:00Z' })}
        currentUserId="user-2"
        onEdit={noop}
        onDelete={noop}
        onReply={onReply}
      />,
    )
    // Deleted messages render a placeholder text, not the full message UI
    expect(screen.queryByLabelText('Reply in thread')).not.toBeInTheDocument()
  })

  it('shows (edited) label for edited messages', () => {
    render(
      <ChatMessage
        message={makeMessage({ edited_at: '2026-01-01T01:00:00Z' })}
        currentUserId="user-2"
        onEdit={noop}
        onDelete={noop}
      />,
    )
    expect(screen.getByText('(edited)')).toBeInTheDocument()
  })
})
