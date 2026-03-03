import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommentSection } from '../comment-section'

/* ============================================================
   Mocks
   ============================================================ */

vi.mock('@/app/(app)/tickets/[ticketId]/comment-actions', () => ({
  addComment: vi.fn().mockResolvedValue(undefined),
  updateComment: vi.fn().mockResolvedValue(undefined),
  deleteComment: vi.fn().mockResolvedValue(undefined),
}))

/* ============================================================
   Helpers
   ============================================================ */

const currentUserId = 'user-1'

const sampleComments = [
  {
    id: 'c-1',
    body: 'This looks good!',
    edited_at: null,
    created_at: '2026-03-01T10:00:00Z',
    author_id: 'user-1',
    author: {
      id: 'user-1',
      display_name: 'Alice',
      avatar_url: null,
    },
  },
  {
    id: 'c-2',
    body: 'I have some concerns.',
    edited_at: '2026-03-01T12:00:00Z',
    created_at: '2026-03-01T11:00:00Z',
    author_id: 'user-2',
    author: {
      id: 'user-2',
      display_name: 'Bob',
      avatar_url: 'https://example.com/bob.jpg',
    },
  },
]

const members = [
  { user_id: 'user-1', display_name: 'Alice' },
  { user_id: 'user-2', display_name: 'Bob' },
]

/* ============================================================
   Tests
   ============================================================ */

describe('CommentSection', () => {
  it('renders the comment count in the heading', () => {
    render(
      <CommentSection
        ticketId="t-1"
        comments={sampleComments}
        currentUserId={currentUserId}
        members={members}
      />,
    )
    expect(screen.getByText('Comments (2)')).toBeInTheDocument()
  })

  it('renders all comment bodies', () => {
    render(
      <CommentSection
        ticketId="t-1"
        comments={sampleComments}
        currentUserId={currentUserId}
        members={members}
      />,
    )
    expect(screen.getByText('This looks good!')).toBeInTheDocument()
    expect(screen.getByText('I have some concerns.')).toBeInTheDocument()
  })

  it('renders author display names', () => {
    render(
      <CommentSection
        ticketId="t-1"
        comments={sampleComments}
        currentUserId={currentUserId}
        members={members}
      />,
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows (edited) label for edited comments', () => {
    render(
      <CommentSection
        ticketId="t-1"
        comments={sampleComments}
        currentUserId={currentUserId}
        members={members}
      />,
    )
    expect(screen.getByText(/\(edited\)/)).toBeInTheDocument()
  })

  it('shows empty state when no comments', () => {
    render(
      <CommentSection
        ticketId="t-1"
        comments={[]}
        currentUserId={currentUserId}
        members={members}
      />,
    )
    expect(screen.getByText('No comments yet. Be the first to comment.')).toBeInTheDocument()
  })

  it('renders the comment textarea with placeholder', () => {
    render(
      <CommentSection
        ticketId="t-1"
        comments={[]}
        currentUserId={currentUserId}
        members={members}
      />,
    )
    expect(
      screen.getByPlaceholderText('Write a comment... Use @ to mention someone'),
    ).toBeInTheDocument()
  })

  it('renders the Comment submit button', () => {
    render(
      <CommentSection
        ticketId="t-1"
        comments={[]}
        currentUserId={currentUserId}
        members={members}
      />,
    )
    expect(screen.getByRole('button', { name: 'Comment' })).toBeInTheDocument()
  })

  it('disables the Comment button when textarea is empty', () => {
    render(
      <CommentSection
        ticketId="t-1"
        comments={[]}
        currentUserId={currentUserId}
        members={members}
      />,
    )
    expect(screen.getByRole('button', { name: 'Comment' })).toBeDisabled()
  })

  it('enables the Comment button when textarea has text', () => {
    render(
      <CommentSection
        ticketId="t-1"
        comments={[]}
        currentUserId={currentUserId}
        members={members}
      />,
    )
    const textarea = screen.getByPlaceholderText('Write a comment... Use @ to mention someone')
    fireEvent.change(textarea, { target: { value: 'Hello team' } })
    expect(screen.getByRole('button', { name: 'Comment' })).not.toBeDisabled()
  })

  it('renders avatar image when author has avatar_url', () => {
    render(
      <CommentSection
        ticketId="t-1"
        comments={sampleComments}
        currentUserId={currentUserId}
        members={members}
      />,
    )
    const img = screen.getByAltText('Bob')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/bob.jpg')
  })

  it('renders initial letter when author has no avatar', () => {
    render(
      <CommentSection
        ticketId="t-1"
        comments={sampleComments}
        currentUserId={currentUserId}
        members={members}
      />,
    )
    // Alice has no avatar, should show "A"
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('shows the Ctrl+Enter hint text', () => {
    render(
      <CommentSection
        ticketId="t-1"
        comments={[]}
        currentUserId={currentUserId}
        members={members}
      />,
    )
    expect(screen.getByText('Ctrl+Enter to submit')).toBeInTheDocument()
  })

  it('renders comment count as 0 when no comments', () => {
    render(
      <CommentSection
        ticketId="t-1"
        comments={[]}
        currentUserId={currentUserId}
        members={members}
      />,
    )
    expect(screen.getByText('Comments (0)')).toBeInTheDocument()
  })
})
