import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TicketCreateForm } from '../ticket-create-form'

/* ============================================================
   Mocks
   ============================================================ */

const { mockFormAction, mockUseActionState } = vi.hoisted(() => ({
  mockFormAction: vi.fn(),
  mockUseActionState: vi.fn(),
}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useActionState: mockUseActionState,
  }
})

vi.mock('@/app/(app)/tickets/actions', () => ({
  createTicket: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

/* ============================================================
   Helpers
   ============================================================ */

const members = [
  { user_id: 'user-1', display_name: 'Alice' },
  { user_id: 'user-2', display_name: 'Bob' },
]

const projects = [
  { id: 'proj-1', name: 'Reduce Cycle Time' },
  { id: 'proj-2', name: 'Quality Improvement' },
]

const defaultProps = {
  members,
  projects,
}

/* ============================================================
   Tests
   ============================================================ */

describe('TicketCreateForm', () => {
  beforeEach(() => {
    mockFormAction.mockReset()
    mockUseActionState.mockReturnValue([{}, mockFormAction, false])
  })

  /* ---- Basic rendering ---- */

  it('renders the form element', () => {
    render(<TicketCreateForm {...defaultProps} />)
    const form = document.querySelector('form')
    expect(form).toBeInTheDocument()
  })

  it('renders the title input field', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByLabelText('Title *')).toBeInTheDocument()
  })

  it('renders the title input with required attribute', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByLabelText('Title *')).toBeRequired()
  })

  it('renders the description textarea', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('renders the due date input', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument()
  })

  it('renders the tags input', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByLabelText('Tags')).toBeInTheDocument()
  })

  it('renders Type select trigger', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByLabelText('Type')).toBeInTheDocument()
  })

  it('renders Priority select trigger', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByLabelText('Priority')).toBeInTheDocument()
  })

  it('renders Status select trigger', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
  })

  it('renders Assignee select trigger', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByLabelText('Assignee')).toBeInTheDocument()
  })

  it('renders Project select trigger', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByLabelText('Project')).toBeInTheDocument()
  })

  it('renders the submit button with "Create Ticket" text', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Create Ticket' })).toBeInTheDocument()
  })

  /* ---- Labels ---- */

  it('renders all expected labels', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByText('Title *')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Priority')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Assignee')).toBeInTheDocument()
    expect(screen.getByText('Project')).toBeInTheDocument()
    expect(screen.getByText('Due Date')).toBeInTheDocument()
    expect(screen.getByText('Tags')).toBeInTheDocument()
  })

  /* ---- Parent ID handling ---- */

  it('renders hidden parent_id input when parentId is provided', () => {
    render(<TicketCreateForm {...defaultProps} parentId="parent-123" />)
    const hidden = document.querySelector('input[name="parent_id"]') as HTMLInputElement
    expect(hidden).toBeInTheDocument()
    expect(hidden.type).toBe('hidden')
    expect(hidden.value).toBe('parent-123')
  })

  it('does not render hidden parent_id input when parentId is not provided', () => {
    render(<TicketCreateForm {...defaultProps} />)
    const hidden = document.querySelector('input[name="parent_id"]')
    expect(hidden).not.toBeInTheDocument()
  })

  /* ---- Pending state ---- */

  it('shows "Creating..." and disables button when pending', () => {
    mockUseActionState.mockReturnValue([{}, mockFormAction, true])

    render(<TicketCreateForm {...defaultProps} />)

    const button = screen.getByRole('button', { name: 'Creating...' })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('submit button is enabled when not pending', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Create Ticket' })).not.toBeDisabled()
  })

  /* ---- Error display ---- */

  it('renders top-level error alert when state has error', () => {
    mockUseActionState.mockReturnValue([{ error: 'Something went wrong' }, mockFormAction, false])

    render(<TicketCreateForm {...defaultProps} />)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Something went wrong')
  })

  it('does not render error alert when no error exists', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders field-level error for title', () => {
    mockUseActionState.mockReturnValue([
      { fieldErrors: { title: 'Title is required' } },
      mockFormAction,
      false,
    ])

    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByText('Title is required')).toBeInTheDocument()
  })

  it('sets aria-invalid on title input when title field error exists', () => {
    mockUseActionState.mockReturnValue([
      { fieldErrors: { title: 'Title is required' } },
      mockFormAction,
      false,
    ])

    render(<TicketCreateForm {...defaultProps} />)
    const titleInput = screen.getByLabelText('Title *')
    expect(titleInput).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets aria-describedby on title input when title field error exists', () => {
    mockUseActionState.mockReturnValue([
      { fieldErrors: { title: 'Title is required' } },
      mockFormAction,
      false,
    ])

    render(<TicketCreateForm {...defaultProps} />)
    const titleInput = screen.getByLabelText('Title *')
    expect(titleInput).toHaveAttribute('aria-describedby', 'title-error')
  })

  it('renders field-level error for description', () => {
    mockUseActionState.mockReturnValue([
      { fieldErrors: { description: 'Description too long' } },
      mockFormAction,
      false,
    ])

    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByText('Description too long')).toBeInTheDocument()
  })

  it('renders field-level error for due date', () => {
    mockUseActionState.mockReturnValue([
      { fieldErrors: { due_date: 'Invalid date' } },
      mockFormAction,
      false,
    ])

    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByText('Invalid date')).toBeInTheDocument()
  })

  /* ---- Placeholders ---- */

  it('shows placeholder text for title', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByPlaceholderText('Brief summary of the ticket')).toBeInTheDocument()
  })

  it('shows placeholder text for description', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByPlaceholderText('Detailed description...')).toBeInTheDocument()
  })

  it('shows placeholder text for tags', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByPlaceholderText('Comma-separated tags')).toBeInTheDocument()
  })

  /* ---- Form input names ---- */

  it('title input has correct name attribute', () => {
    render(<TicketCreateForm {...defaultProps} />)
    const input = screen.getByLabelText('Title *')
    expect(input).toHaveAttribute('name', 'title')
  })

  it('description textarea has correct name attribute', () => {
    render(<TicketCreateForm {...defaultProps} />)
    const textarea = screen.getByLabelText('Description')
    expect(textarea).toHaveAttribute('name', 'description')
  })

  it('due date input has correct name attribute via DatePicker hidden input', () => {
    render(<TicketCreateForm {...defaultProps} />)
    // DatePicker renders a hidden input with the name and a button trigger
    const hiddenInput = document.querySelector('input[name="due_date"]') as HTMLInputElement
    expect(hiddenInput).toBeInTheDocument()
    expect(hiddenInput.type).toBe('hidden')
    // The visible trigger button is linked via label
    const trigger = screen.getByLabelText('Due Date')
    expect(trigger).toBeInTheDocument()
  })

  it('tags input has correct name attribute', () => {
    render(<TicketCreateForm {...defaultProps} />)
    const input = screen.getByLabelText('Tags')
    expect(input).toHaveAttribute('name', 'tags')
  })

  /* ---- aria-required ---- */

  it('title input has aria-required attribute', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByLabelText('Title *')).toHaveAttribute('aria-required', 'true')
  })

  /* ---- Empty members/projects ---- */

  it('renders without error when members list is empty', () => {
    render(<TicketCreateForm members={[]} projects={projects} />)
    expect(screen.getByLabelText('Assignee')).toBeInTheDocument()
  })

  it('renders without error when projects list is empty', () => {
    render(<TicketCreateForm members={members} projects={[]} />)
    expect(screen.getByLabelText('Project')).toBeInTheDocument()
  })

  /* ---- Multiple field errors ---- */

  it('renders multiple field errors simultaneously', () => {
    mockUseActionState.mockReturnValue([
      {
        error: 'Validation failed',
        fieldErrors: {
          title: 'Title is required',
          description: 'Description too long',
          due_date: 'Invalid date format',
        },
      },
      mockFormAction,
      false,
    ])

    render(<TicketCreateForm {...defaultProps} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Validation failed')
    expect(screen.getByText('Title is required')).toBeInTheDocument()
    expect(screen.getByText('Description too long')).toBeInTheDocument()
    expect(screen.getByText('Invalid date format')).toBeInTheDocument()
  })
})
