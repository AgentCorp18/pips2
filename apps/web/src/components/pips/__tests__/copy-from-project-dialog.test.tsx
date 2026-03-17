import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyFromProjectDialog } from '../copy-from-project-dialog'

/* ============================================================
   Mocks
   ============================================================ */

const { mockListProjectsWithForm, mockCopyFormFromProject, mockToast } = vi.hoisted(() => ({
  mockListProjectsWithForm: vi.fn(),
  mockCopyFormFromProject: vi.fn(),
  mockToast: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/actions', () => ({
  listProjectsWithForm: (...args: unknown[]) => mockListProjectsWithForm(...args),
  copyFormFromProject: (...args: unknown[]) => mockCopyFormFromProject(...args),
}))

vi.mock('sonner', () => ({
  toast: mockToast,
}))

/* ============================================================
   Helpers
   ============================================================ */

const defaultProps = {
  projectId: 'proj-target',
  stepNumber: 2,
  formType: 'fishbone',
  onCopied: vi.fn(),
}

const sampleProjects = [
  { id: 'proj-1', title: 'Project Alpha' },
  { id: 'proj-2', title: 'Project Beta' },
]

/* ============================================================
   Tests
   ============================================================ */

describe('CopyFromProjectDialog', () => {
  beforeEach(() => {
    mockListProjectsWithForm.mockReset()
    mockCopyFormFromProject.mockReset()
    mockToast.error.mockReset()
    mockToast.success.mockReset()
    defaultProps.onCopied = vi.fn()
  })

  it('renders the trigger button', () => {
    mockListProjectsWithForm.mockResolvedValue(sampleProjects)
    render(<CopyFromProjectDialog {...defaultProps} />)
    expect(screen.getByTestId('copy-from-project-trigger')).toBeInTheDocument()
    expect(screen.getByText('Copy from Project')).toBeInTheDocument()
  })

  it('opens the dialog and shows loading state when trigger is clicked', async () => {
    const user = userEvent.setup()
    // Keep the promise pending so we can observe the loading state
    let resolveProjects!: (val: typeof sampleProjects) => void
    mockListProjectsWithForm.mockReturnValue(
      new Promise<typeof sampleProjects>((resolve) => {
        resolveProjects = resolve
      }),
    )

    render(<CopyFromProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('copy-from-project-trigger'))

    expect(screen.getByTestId('copy-from-project-loading')).toBeInTheDocument()

    // Resolve so the component can clean up
    resolveProjects(sampleProjects)
    await waitFor(() => {
      expect(screen.queryByTestId('copy-from-project-loading')).not.toBeInTheDocument()
    })
  })

  it('calls listProjectsWithForm with correct args on open', async () => {
    const user = userEvent.setup()
    mockListProjectsWithForm.mockResolvedValue(sampleProjects)

    render(<CopyFromProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('copy-from-project-trigger'))

    await waitFor(() => {
      expect(mockListProjectsWithForm).toHaveBeenCalledWith(
        defaultProps.stepNumber,
        defaultProps.formType,
        defaultProps.projectId,
      )
    })
  })

  it('shows project list after loading', async () => {
    const user = userEvent.setup()
    mockListProjectsWithForm.mockResolvedValue(sampleProjects)

    render(<CopyFromProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('copy-from-project-trigger'))

    await waitFor(() => {
      expect(screen.getByTestId('copy-from-project-list')).toBeInTheDocument()
    })

    expect(screen.getByText('Project Alpha')).toBeInTheDocument()
    expect(screen.getByText('Project Beta')).toBeInTheDocument()
  })

  it('shows empty state when no projects have this form', async () => {
    const user = userEvent.setup()
    mockListProjectsWithForm.mockResolvedValue([])

    render(<CopyFromProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('copy-from-project-trigger'))

    await waitFor(() => {
      expect(screen.getByTestId('copy-from-project-empty')).toBeInTheDocument()
    })

    expect(screen.getByText(/No other projects have this form filled out yet/i)).toBeInTheDocument()
  })

  it('Copy button is disabled when no project is selected', async () => {
    const user = userEvent.setup()
    mockListProjectsWithForm.mockResolvedValue(sampleProjects)

    render(<CopyFromProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('copy-from-project-trigger'))

    await waitFor(() => {
      expect(screen.getByTestId('copy-from-project-list')).toBeInTheDocument()
    })

    expect(screen.getByTestId('copy-from-project-confirm')).toBeDisabled()
  })

  it('enables Copy button after selecting a project', async () => {
    const user = userEvent.setup()
    mockListProjectsWithForm.mockResolvedValue(sampleProjects)

    render(<CopyFromProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('copy-from-project-trigger'))

    await waitFor(() => {
      expect(screen.getByTestId('copy-source-project-proj-1')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('copy-source-project-proj-1'))
    expect(screen.getByTestId('copy-from-project-confirm')).not.toBeDisabled()
  })

  it('calls copyFormFromProject with correct args on confirm', async () => {
    const user = userEvent.setup()
    mockListProjectsWithForm.mockResolvedValue(sampleProjects)
    mockCopyFormFromProject.mockResolvedValue({ success: true })

    render(<CopyFromProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('copy-from-project-trigger'))

    await waitFor(() => {
      expect(screen.getByTestId('copy-source-project-proj-1')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('copy-source-project-proj-1'))
    await user.click(screen.getByTestId('copy-from-project-confirm'))

    await waitFor(() => {
      expect(mockCopyFormFromProject).toHaveBeenCalledWith(
        'proj-1',
        defaultProps.projectId,
        defaultProps.stepNumber,
        defaultProps.formType,
      )
    })
  })

  it('shows success toast and calls onCopied after successful copy', async () => {
    const user = userEvent.setup()
    const onCopied = vi.fn()
    mockListProjectsWithForm.mockResolvedValue(sampleProjects)
    mockCopyFormFromProject.mockResolvedValue({ success: true })

    render(<CopyFromProjectDialog {...defaultProps} onCopied={onCopied} />)
    await user.click(screen.getByTestId('copy-from-project-trigger'))

    await waitFor(() => {
      expect(screen.getByTestId('copy-source-project-proj-1')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('copy-source-project-proj-1'))
    await user.click(screen.getByTestId('copy-from-project-confirm'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Form data copied successfully')
      expect(onCopied).toHaveBeenCalled()
    })
  })

  it('shows error toast when copy fails with an error message', async () => {
    const user = userEvent.setup()
    mockListProjectsWithForm.mockResolvedValue(sampleProjects)
    mockCopyFormFromProject.mockResolvedValue({ success: false, error: 'Source form not found' })

    render(<CopyFromProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('copy-from-project-trigger'))

    await waitFor(() => {
      expect(screen.getByTestId('copy-source-project-proj-1')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('copy-source-project-proj-1'))
    await user.click(screen.getByTestId('copy-from-project-confirm'))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Source form not found')
    })
  })

  it('shows generic error toast when copy fails without an error message', async () => {
    const user = userEvent.setup()
    mockListProjectsWithForm.mockResolvedValue(sampleProjects)
    mockCopyFormFromProject.mockResolvedValue({ success: false })

    render(<CopyFromProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('copy-from-project-trigger'))

    await waitFor(() => {
      expect(screen.getByTestId('copy-source-project-proj-1')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('copy-source-project-proj-1'))
    await user.click(screen.getByTestId('copy-from-project-confirm'))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to copy form data')
    })
  })

  it('does not call onCopied when copy fails', async () => {
    const user = userEvent.setup()
    const onCopied = vi.fn()
    mockListProjectsWithForm.mockResolvedValue(sampleProjects)
    mockCopyFormFromProject.mockResolvedValue({ success: false, error: 'Copy failed' })

    render(<CopyFromProjectDialog {...defaultProps} onCopied={onCopied} />)
    await user.click(screen.getByTestId('copy-from-project-trigger'))

    await waitFor(() => {
      expect(screen.getByTestId('copy-source-project-proj-1')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('copy-source-project-proj-1'))
    await user.click(screen.getByTestId('copy-from-project-confirm'))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled()
    })
    expect(onCopied).not.toHaveBeenCalled()
  })

  it('shows error toast when listProjectsWithForm throws', async () => {
    const user = userEvent.setup()
    mockListProjectsWithForm.mockRejectedValue(new Error('Network error'))

    render(<CopyFromProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('copy-from-project-trigger'))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to load projects')
    })
  })

  it('closes dialog when Cancel is clicked', async () => {
    const user = userEvent.setup()
    mockListProjectsWithForm.mockResolvedValue(sampleProjects)

    render(<CopyFromProjectDialog {...defaultProps} />)
    await user.click(screen.getByTestId('copy-from-project-trigger'))

    // Wait for the dialog content (Cancel button) to appear
    await waitFor(() => {
      expect(screen.getByTestId('copy-from-project-cancel')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('copy-from-project-cancel'))

    await waitFor(() => {
      expect(screen.queryByTestId('copy-from-project-cancel')).not.toBeInTheDocument()
    })
  })
})
