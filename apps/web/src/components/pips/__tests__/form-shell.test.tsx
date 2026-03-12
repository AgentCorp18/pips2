import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { z } from 'zod'
import { FormShell, type FormShellProps } from '../form-shell'

/* ============================================================
   Mocks
   ============================================================ */

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const { mockSaveFormData, mockToast } = vi.hoisted(() => ({
  mockSaveFormData: vi.fn(),
  mockToast: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/actions', () => ({
  saveFormData: (...args: unknown[]) => mockSaveFormData(...args),
}))

vi.mock('sonner', () => ({
  toast: mockToast,
}))

vi.mock('@/components/knowledge-cadence/knowledge-cadence-bar', () => ({
  KnowledgeCadenceBar: () => <div data-testid="cadence-bar" />,
}))

/* ============================================================
   Helpers
   ============================================================ */

const dataDrivenProps: FormShellProps = {
  projectId: 'proj-1',
  stepNumber: 2,
  formType: 'root_cause',
  title: 'Root Cause Analysis',
  description: 'Identify the root causes of the problem',
  children: <div data-testid="child-content">Form fields here</div>,
  data: { cause: 'Process variation' },
}

const callbackProps: FormShellProps = {
  stepNumber: 4,
  title: 'Decision Matrix',
  description: 'Select the best solution',
  children: <div data-testid="child-content">Decision form</div>,
  onSave: vi.fn().mockResolvedValue({ success: true }),
  isDirty: false,
}

/* ============================================================
   Tests — Rendering (no timers needed)
   ============================================================ */

describe('FormShell', () => {
  beforeEach(() => {
    mockSaveFormData.mockReset()
    mockToast.error.mockReset()
    mockToast.success.mockReset()
  })

  it('renders children', () => {
    render(<FormShell {...dataDrivenProps} />)
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('renders the form title', () => {
    render(<FormShell {...dataDrivenProps} />)
    expect(screen.getByText('Root Cause Analysis')).toBeInTheDocument()
  })

  it('renders the form description', () => {
    render(<FormShell {...dataDrivenProps} />)
    expect(screen.getByText('Identify the root causes of the problem')).toBeInTheDocument()
  })

  it('renders the Save button', () => {
    render(<FormShell {...dataDrivenProps} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('renders Back to step link when projectId is provided', () => {
    render(<FormShell {...dataDrivenProps} />)
    const link = screen.getByText('Back to step')
    expect(link.closest('a')).toHaveAttribute('href', '/projects/proj-1/steps/2')
  })

  it('does not render Back link when projectId is not provided', () => {
    render(<FormShell {...callbackProps} />)
    expect(screen.queryByText('Back to step')).not.toBeInTheDocument()
  })

  it('renders Required badge when required is true', () => {
    render(<FormShell {...dataDrivenProps} required />)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('does not render Required badge by default', () => {
    render(<FormShell {...dataDrivenProps} />)
    expect(screen.queryByText('Required')).not.toBeInTheDocument()
  })

  it('shows idle state (no status text) initially when data has not changed', () => {
    render(<FormShell {...dataDrivenProps} />)
    expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument()
  })

  it('shows "Unsaved changes" when data changes from last saved', () => {
    const { rerender } = render(<FormShell {...dataDrivenProps} />)
    rerender(<FormShell {...dataDrivenProps} data={{ cause: 'New cause' }} />)
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
  })

  it('shows "Unsaved changes" in callback mode when isDirty is true', () => {
    render(<FormShell {...callbackProps} isDirty />)
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
  })
})

/* ============================================================
   Tests — Debounce auto-save (fake timers)
   ============================================================ */

describe('FormShell auto-save', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockSaveFormData.mockReset()
    mockToast.error.mockReset()
    mockToast.success.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('auto-saves after 2-second debounce when data changes', async () => {
    mockSaveFormData.mockResolvedValue({ success: true })

    const { rerender } = render(<FormShell {...dataDrivenProps} />)
    rerender(<FormShell {...dataDrivenProps} data={{ cause: 'Updated cause' }} />)

    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100)
    })

    expect(mockSaveFormData).toHaveBeenCalledWith('proj-1', 2, 'root_cause', {
      cause: 'Updated cause',
    })
  })

  it('shows "Saving..." while save is in progress', async () => {
    let resolveSave!: (val: { success: boolean }) => void
    mockSaveFormData.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve
      }),
    )

    const { rerender } = render(<FormShell {...dataDrivenProps} />)
    rerender(<FormShell {...dataDrivenProps} data={{ cause: 'Changed' }} />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100)
    })

    expect(screen.getByText('Saving...')).toBeInTheDocument()

    await act(async () => {
      resolveSave({ success: true })
    })

    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('shows error toast when data-driven save fails', async () => {
    mockSaveFormData.mockResolvedValue({ success: false, error: 'Database error' })

    const { rerender } = render(<FormShell {...dataDrivenProps} />)
    rerender(<FormShell {...dataDrivenProps} data={{ cause: 'Failing data' }} />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100)
    })

    expect(mockToast.error).toHaveBeenCalledWith('Database error')
  })

  it('shows generic error message when error string is missing', async () => {
    mockSaveFormData.mockResolvedValue({ success: false })

    const { rerender } = render(<FormShell {...dataDrivenProps} />)
    rerender(<FormShell {...dataDrivenProps} data={{ cause: 'Fail no msg' }} />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100)
    })

    expect(mockToast.error).toHaveBeenCalledWith('Failed to save')
  })

  it('calls onSaveSuccess callback after successful data-driven save', async () => {
    mockSaveFormData.mockResolvedValue({ success: true })
    const onSaveSuccess = vi.fn()

    const { rerender } = render(<FormShell {...dataDrivenProps} onSaveSuccess={onSaveSuccess} />)
    rerender(
      <FormShell {...dataDrivenProps} data={{ cause: 'New' }} onSaveSuccess={onSaveSuccess} />,
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100)
    })

    expect(onSaveSuccess).toHaveBeenCalled()
  })

  it('auto-saves via callback when isDirty becomes true', async () => {
    const onSave = vi.fn().mockResolvedValue({ success: true })

    const { rerender } = render(<FormShell {...callbackProps} onSave={onSave} isDirty={false} />)
    rerender(<FormShell {...callbackProps} onSave={onSave} isDirty />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100)
    })

    expect(onSave).toHaveBeenCalled()
  })

  it('shows error toast when callback save returns an error', async () => {
    const onSave = vi.fn().mockResolvedValue({ error: 'Validation failed' })

    const { rerender } = render(<FormShell {...callbackProps} onSave={onSave} isDirty={false} />)
    rerender(<FormShell {...callbackProps} onSave={onSave} isDirty />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100)
    })

    expect(mockToast.error).toHaveBeenCalledWith('Validation failed')
  })

  it('resets debounce timer on rapid data changes', async () => {
    mockSaveFormData.mockResolvedValue({ success: true })

    const { rerender } = render(<FormShell {...dataDrivenProps} />)

    // First change
    rerender(<FormShell {...dataDrivenProps} data={{ cause: 'Change 1' }} />)

    // Advance 1.5 seconds (not enough to trigger)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })

    // Second change before debounce fires
    rerender(<FormShell {...dataDrivenProps} data={{ cause: 'Change 2' }} />)

    // Advance another 1.5 seconds (still not enough from second change)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })

    // saveFormData should not have been called yet (debounce restarted)
    expect(mockSaveFormData).not.toHaveBeenCalled()

    // Advance remaining time
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })

    expect(mockSaveFormData).toHaveBeenCalledTimes(1)
    expect(mockSaveFormData).toHaveBeenCalledWith('proj-1', 2, 'root_cause', { cause: 'Change 2' })
  })
})

/* ============================================================
   Tests — Manual save (real timers)
   ============================================================ */

describe('FormShell manual save', () => {
  beforeEach(() => {
    mockSaveFormData.mockReset()
    mockToast.error.mockReset()
    mockToast.success.mockReset()
  })

  it('triggers save immediately when Save button is clicked', async () => {
    mockSaveFormData.mockResolvedValue({ success: true })

    const { rerender } = render(<FormShell {...dataDrivenProps} />)
    rerender(<FormShell {...dataDrivenProps} data={{ cause: 'Manual save data' }} />)

    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(mockSaveFormData).toHaveBeenCalled()
    })
  })

  it('shows success toast after manual save', async () => {
    mockSaveFormData.mockResolvedValue({ success: true })

    const { rerender } = render(<FormShell {...dataDrivenProps} />)
    rerender(<FormShell {...dataDrivenProps} data={{ cause: 'Toast test' }} />)

    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Saved')
    })
  })

  it('disables Save button while saving is in progress', async () => {
    let resolveSave!: (val: { success: boolean }) => void
    mockSaveFormData.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve
      }),
    )

    const { rerender } = render(<FormShell {...dataDrivenProps} />)
    rerender(<FormShell {...dataDrivenProps} data={{ cause: 'Disabled test' }} />)

    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
    })

    await act(async () => {
      resolveSave({ success: true })
    })
  })

  it('shows error toast (not success toast) when manual save fails', async () => {
    mockSaveFormData.mockResolvedValue({ success: false, error: 'Server error' })

    const { rerender } = render(<FormShell {...dataDrivenProps} />)
    rerender(<FormShell {...dataDrivenProps} data={{ cause: 'Error test' }} />)

    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Server error')
    })
    expect(mockToast.success).not.toHaveBeenCalled()
  })
})

/* ============================================================
   Tests — Concurrent save protection (AbortController)
   ============================================================ */

describe('FormShell concurrent save protection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockSaveFormData.mockReset()
    mockToast.error.mockReset()
    mockToast.success.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('suppresses stale error from a first auto-save aborted by a second auto-save', async () => {
    // First auto-save is slow and eventually fails with an error.
    // Before it completes, a second auto-save starts (cancelling the first).
    // When the first finally resolves with an error, the abort guard should
    // prevent the error toast — only the second save's outcome counts.
    let resolveFirst!: (val: { success: boolean; error?: string }) => void

    mockSaveFormData
      .mockReturnValueOnce(
        new Promise((r) => {
          resolveFirst = r
        }),
      )
      .mockResolvedValueOnce({ success: true })

    const { rerender } = render(<FormShell {...dataDrivenProps} />)

    // Trigger first auto-save after 2s debounce
    rerender(<FormShell {...dataDrivenProps} data={{ cause: 'First' }} />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100)
    })
    // First save is now in-flight (saveState === 'saving')

    // Immediately change data again to queue second auto-save
    rerender(<FormShell {...dataDrivenProps} data={{ cause: 'Second' }} />)
    // Advance 2s — second auto-save fires, aborting the first
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100)
    })

    // Now resolve the first save with a failure — should be silently ignored
    await act(async () => {
      resolveFirst({ success: false, error: 'Stale network error' })
    })

    // The error from the aborted first save must NOT be shown
    expect(mockToast.error).not.toHaveBeenCalled()

    // saveFormData was called twice
    expect(mockSaveFormData).toHaveBeenCalledTimes(2)
  })
})

/* ============================================================
   Tests — Zod schema validation of initialData (BUG 3)
   ============================================================ */

describe('FormShell schema validation', () => {
  beforeEach(() => {
    mockSaveFormData.mockReset()
    mockToast.error.mockReset()
    mockToast.success.mockReset()
  })

  const testSchema = z.object({
    cause: z.string().default('default-cause'),
    severity: z.number().default(1),
  })

  it('uses data as-is when it passes schema validation', () => {
    render(
      <FormShell
        {...dataDrivenProps}
        data={{ cause: 'valid-cause', severity: 3 }}
        schema={testSchema}
      />,
    )
    // No error thrown; data is accepted
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('falls back to schema defaults when data has an invalid shape', () => {
    // Data with a wrong type for 'severity' — should fail safeParse
    render(
      <FormShell
        {...dataDrivenProps}
        data={{ cause: 'valid', severity: 'not-a-number' }}
        schema={testSchema}
      />,
    )
    // Component should render without crashing (fallback to defaults)
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('renders without schema prop (backward compatible)', () => {
    render(<FormShell {...dataDrivenProps} data={{ cause: 'no schema' }} />)
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })
})
