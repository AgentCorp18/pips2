import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CloneProjectDialog } from '../clone-project-dialog'

/* ============================================================
   Mocks
   ============================================================ */

const { mockCloneProject, mockPush, mockToast } = vi.hoisted(() => ({
  mockCloneProject: vi.fn(),
  mockPush: vi.fn(),
  mockToast: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('@/app/(app)/projects/actions', () => ({
  cloneProject: (...args: unknown[]) => mockCloneProject(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: mockToast,
}))

/* ============================================================
   Helpers
   ============================================================ */

const defaultProps = {
  projectId: 'proj-1',
  projectName: 'My Test Project',
}

/* ============================================================
   Tests
   ============================================================ */

describe('CloneProjectDialog', () => {
  beforeEach(() => {
    mockCloneProject.mockReset()
    mockPush.mockReset()
    mockToast.error.mockReset()
    mockToast.success.mockReset()
  })

  it('renders the Clone trigger button', () => {
    render(<CloneProjectDialog {...defaultProps} />)
    expect(screen.getByTestId('clone-project-trigger')).toBeInTheDocument()
    expect(screen.getByText('Clone')).toBeInTheDocument()
  })

  it('opens the dialog when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<CloneProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('clone-project-trigger'))
    expect(screen.getByTestId('clone-project-dialog')).toBeInTheDocument()
  })

  it('shows project name in dialog title', async () => {
    const user = userEvent.setup()
    render(<CloneProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('clone-project-trigger'))
    // The title contains the project name in quotes
    expect(screen.getByText(/Clone.*My Test Project/)).toBeInTheDocument()
  })

  it('shows title input with placeholder', async () => {
    const user = userEvent.setup()
    render(<CloneProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('clone-project-trigger'))
    const input = screen.getByTestId('clone-project-title-input')
    expect(input).toBeInTheDocument()
    expect((input as HTMLInputElement).placeholder).toBe('My Test Project — Copy')
  })

  it('shows copy forms checkbox checked by default', async () => {
    const user = userEvent.setup()
    render(<CloneProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('clone-project-trigger'))
    const checkbox = screen.getByTestId('clone-project-copy-forms-checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('shows Cancel and Clone buttons', async () => {
    const user = userEvent.setup()
    render(<CloneProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('clone-project-trigger'))
    expect(screen.getByTestId('clone-project-cancel')).toBeInTheDocument()
    expect(screen.getByTestId('clone-project-confirm')).toBeInTheDocument()
  })

  it('closes dialog when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<CloneProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('clone-project-trigger'))
    await user.click(screen.getByTestId('clone-project-cancel'))
    await waitFor(() => {
      expect(screen.queryByTestId('clone-project-dialog')).not.toBeInTheDocument()
    })
  })

  it('calls cloneProject with default options when confirmed', async () => {
    const user = userEvent.setup()
    mockCloneProject.mockResolvedValue({ data: { projectId: 'new-proj-1' } })
    render(<CloneProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('clone-project-trigger'))
    await user.click(screen.getByTestId('clone-project-confirm'))
    await waitFor(() => {
      expect(mockCloneProject).toHaveBeenCalledWith('proj-1', {
        copyForms: true,
        title: undefined,
      })
    })
  })

  it('calls cloneProject with custom title when provided', async () => {
    const user = userEvent.setup()
    mockCloneProject.mockResolvedValue({ data: { projectId: 'new-proj-2' } })
    render(<CloneProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('clone-project-trigger'))
    await user.type(screen.getByTestId('clone-project-title-input'), 'New Custom Title')
    await user.click(screen.getByTestId('clone-project-confirm'))
    await waitFor(() => {
      expect(mockCloneProject).toHaveBeenCalledWith('proj-1', {
        copyForms: true,
        title: 'New Custom Title',
      })
    })
  })

  it('calls cloneProject with copyForms=false when checkbox unchecked', async () => {
    const user = userEvent.setup()
    mockCloneProject.mockResolvedValue({ data: { projectId: 'new-proj-3' } })
    render(<CloneProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('clone-project-trigger'))
    await user.click(screen.getByTestId('clone-project-copy-forms-checkbox'))
    await user.click(screen.getByTestId('clone-project-confirm'))
    await waitFor(() => {
      expect(mockCloneProject).toHaveBeenCalledWith('proj-1', {
        copyForms: false,
        title: undefined,
      })
    })
  })

  it('redirects to new project on success', async () => {
    const user = userEvent.setup()
    mockCloneProject.mockResolvedValue({ data: { projectId: 'new-proj-123' } })
    render(<CloneProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('clone-project-trigger'))
    await user.click(screen.getByTestId('clone-project-confirm'))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/projects/new-proj-123')
    })
  })

  it('shows success toast on successful clone', async () => {
    const user = userEvent.setup()
    mockCloneProject.mockResolvedValue({ data: { projectId: 'new-proj-124' } })
    render(<CloneProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('clone-project-trigger'))
    await user.click(screen.getByTestId('clone-project-confirm'))
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Project cloned successfully')
    })
  })

  it('shows error toast when cloneProject returns an error', async () => {
    const user = userEvent.setup()
    mockCloneProject.mockResolvedValue({ error: 'Failed to create cloned project' })
    render(<CloneProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('clone-project-trigger'))
    await user.click(screen.getByTestId('clone-project-confirm'))
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to create cloned project')
    })
  })

  it('shows error toast on unexpected exception', async () => {
    const user = userEvent.setup()
    mockCloneProject.mockRejectedValue(new Error('Network error'))
    render(<CloneProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('clone-project-trigger'))
    await user.click(screen.getByTestId('clone-project-confirm'))
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to clone project')
    })
  })

  it('resets form state after closing and reopening dialog', async () => {
    const user = userEvent.setup()
    render(<CloneProjectDialog {...defaultProps} />)
    // Open, type title, uncheck copy forms
    await user.click(screen.getByTestId('clone-project-trigger'))
    await user.type(screen.getByTestId('clone-project-title-input'), 'Changed Title')
    await user.click(screen.getByTestId('clone-project-copy-forms-checkbox'))
    // Close
    await user.click(screen.getByTestId('clone-project-cancel'))
    await waitFor(() => {
      expect(screen.queryByTestId('clone-project-dialog')).not.toBeInTheDocument()
    })
    // Reopen — state should be reset
    await user.click(screen.getByTestId('clone-project-trigger'))
    const input = screen.getByTestId('clone-project-title-input') as HTMLInputElement
    expect(input.value).toBe('')
    const checkbox = screen.getByTestId('clone-project-copy-forms-checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })
})
