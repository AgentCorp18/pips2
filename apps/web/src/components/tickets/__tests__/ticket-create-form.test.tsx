import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

vi.mock('@/components/ui/ai-assist-button', () => ({
  AiAssistButton: () => <button data-testid="ai-assist-mock">AI</button>,
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

const expandFullForm = () => {
  fireEvent.click(screen.getByTestId('toggle-full-form'))
}

/* ============================================================
   Tests
   ============================================================ */

describe('TicketCreateForm', () => {
  beforeEach(() => {
    mockFormAction.mockReset()
    mockUseActionState.mockReturnValue([{}, mockFormAction, false])
  })

  /* ---- Quick Create section ---- */

  it('renders quick create section', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByTestId('quick-create-section')).toBeInTheDocument()
  })

  it('renders "Quick Create" label', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByText('Quick Create')).toBeInTheDocument()
  })

  it('renders quick create input with correct placeholder', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByTestId('quick-create-title-input')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument()
  })

  it('renders quick create submit button', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByTestId('quick-create-submit')).toBeInTheDocument()
  })

  it('renders hidden type/priority/status inputs for quick create', () => {
    render(<TicketCreateForm {...defaultProps} />)
    const form = screen.getByTestId('quick-create-section').querySelector('form')
    expect(form).toBeInTheDocument()
    const typeInput = form?.querySelector('input[name="type"]') as HTMLInputElement
    expect(typeInput?.value).toBe('task')
    const priorityInput = form?.querySelector('input[name="priority"]') as HTMLInputElement
    expect(priorityInput?.value).toBe('medium')
    const statusInput = form?.querySelector('input[name="status"]') as HTMLInputElement
    expect(statusInput?.value).toBe('backlog')
  })

  /* ---- Toggle full form ---- */

  it('renders toggle button', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByTestId('toggle-full-form')).toBeInTheDocument()
  })

  it('full form is hidden by default', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.queryByTestId('full-create-form')).not.toBeInTheDocument()
  })

  it('shows full form when toggle is clicked', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByTestId('full-create-form')).toBeInTheDocument()
  })

  it('toggle text changes when expanded', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expect(screen.getByText('Show full form')).toBeInTheDocument()
    expandFullForm()
    expect(screen.getByText('Hide full form')).toBeInTheDocument()
  })

  /* ---- Full form: Basic rendering ---- */

  it('renders the title input field in full form', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByLabelText(/^Title/)).toBeInTheDocument()
  })

  it('renders the title input with required attribute', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByLabelText(/^Title/)).toBeRequired()
  })

  it('renders the description textarea', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('renders the due date input', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument()
  })

  it('renders the tags input', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByLabelText('Tags')).toBeInTheDocument()
  })

  it('renders Type select trigger', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByLabelText('Type')).toBeInTheDocument()
  })

  it('renders Priority select trigger', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByLabelText('Priority')).toBeInTheDocument()
  })

  it('renders Status select trigger', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
  })

  it('renders Assignee select trigger', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByLabelText('Assignee')).toBeInTheDocument()
  })

  it('renders Project select trigger', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByLabelText('Project')).toBeInTheDocument()
  })

  it('renders the submit button with "Create Ticket" text', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByRole('button', { name: 'Create Ticket' })).toBeInTheDocument()
  })

  /* ---- Labels ---- */

  it('renders all expected labels in full form', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByLabelText(/^Title/)).toBeInTheDocument()
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
    expandFullForm()
    const hiddens = document.querySelectorAll('input[name="parent_id"]')
    expect(hiddens.length).toBeGreaterThanOrEqual(1)
    const hidden = hiddens[0] as HTMLInputElement
    expect(hidden.type).toBe('hidden')
    expect(hidden.value).toBe('parent-123')
  })

  it('does not render hidden parent_id input when parentId is not provided', () => {
    render(<TicketCreateForm {...defaultProps} />)
    const hidden = document.querySelector('input[name="parent_id"]')
    expect(hidden).not.toBeInTheDocument()
  })

  /* ---- Pending state ---- */

  it('shows "Creating..." and disables quick create button when pending', () => {
    mockUseActionState.mockReturnValue([{}, mockFormAction, true])

    render(<TicketCreateForm {...defaultProps} />)

    const button = screen.getByTestId('quick-create-submit')
    expect(button).toHaveTextContent('Creating...')
    expect(button).toBeDisabled()
  })

  /* ---- Error display ---- */

  it('renders top-level error alert when state has error', () => {
    mockUseActionState.mockReturnValue([{ error: 'Something went wrong' }, mockFormAction, false])

    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Something went wrong')
  })

  it('renders field-level error for title', () => {
    mockUseActionState.mockReturnValue([
      { fieldErrors: { title: 'Title is required' } },
      mockFormAction,
      false,
    ])

    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByText('Title is required')).toBeInTheDocument()
  })

  /* ---- Placeholders ---- */

  it('shows placeholder text for description', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByPlaceholderText('Detailed description...')).toBeInTheDocument()
  })

  it('shows placeholder text for tags', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByPlaceholderText('Comma-separated tags')).toBeInTheDocument()
  })

  /* ---- Form input names ---- */

  it('title input has correct name attribute', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    const input = screen.getByLabelText(/^Title/)
    expect(input).toHaveAttribute('name', 'title')
  })

  it('description textarea has correct name attribute', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    const textarea = screen.getByLabelText('Description')
    expect(textarea).toHaveAttribute('name', 'description')
  })

  /* ---- aria-required ---- */

  it('title input has aria-required attribute', () => {
    render(<TicketCreateForm {...defaultProps} />)
    expandFullForm()
    expect(screen.getByLabelText(/^Title/)).toHaveAttribute('aria-required', 'true')
  })

  /* ---- Empty members/projects ---- */

  it('renders without error when members list is empty', () => {
    render(<TicketCreateForm members={[]} projects={projects} />)
    expandFullForm()
    expect(screen.getByLabelText('Assignee')).toBeInTheDocument()
  })

  it('renders without error when projects list is empty', () => {
    render(<TicketCreateForm members={members} projects={[]} />)
    expandFullForm()
    expect(screen.getByLabelText('Project')).toBeInTheDocument()
  })
})
