import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UnsavedChangesDialog } from '../unsaved-changes-dialog'

/* ============================================================
   Helpers
   ============================================================ */

const renderDialog = (
  overrides: Partial<React.ComponentProps<typeof UnsavedChangesDialog>> = {},
) => {
  const defaults = {
    open: true,
    onDiscard: vi.fn(),
    onKeepEditing: vi.fn(),
  }
  const props = { ...defaults, ...overrides }
  return { ...render(<UnsavedChangesDialog {...props} />), props }
}

/* ============================================================
   Tests
   ============================================================ */

describe('UnsavedChangesDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when open is false', () => {
    renderDialog({ open: false })
    expect(screen.queryByTestId('unsaved-changes-dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog when open is true', () => {
    renderDialog()
    expect(screen.getByTestId('unsaved-changes-dialog')).toBeInTheDocument()
  })

  it('shows the correct title', () => {
    renderDialog()
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument()
  })

  it('shows the correct description', () => {
    renderDialog()
    expect(screen.getByText(/if you leave now your changes will be lost/i)).toBeInTheDocument()
  })

  it('renders a Discard button', () => {
    renderDialog()
    expect(screen.getByTestId('discard-changes-button')).toBeInTheDocument()
  })

  it('renders a Keep Editing button', () => {
    renderDialog()
    expect(screen.getByTestId('keep-editing-button')).toBeInTheDocument()
  })

  it('calls onDiscard when Discard button is clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderDialog()
    await user.click(screen.getByTestId('discard-changes-button'))
    expect(props.onDiscard).toHaveBeenCalledOnce()
  })

  it('calls onKeepEditing when Keep Editing button is clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderDialog()
    await user.click(screen.getByTestId('keep-editing-button'))
    expect(props.onKeepEditing).toHaveBeenCalledOnce()
  })
})
