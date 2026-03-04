import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BulkActionsBar } from '../bulk-actions-bar'

vi.mock('@/app/(app)/tickets/actions', () => ({
  bulkUpdateTickets: vi.fn(),
  bulkDeleteTickets: vi.fn(),
}))

vi.mock('@/components/tickets/ticket-config', () => ({
  STATUS_CONFIG: {
    open: { label: 'Open' },
    in_progress: { label: 'In Progress' },
    done: { label: 'Done' },
    cancelled: { label: 'Cancelled' },
  },
  PRIORITY_CONFIG: {
    critical: { label: 'Critical' },
    high: { label: 'High' },
    medium: { label: 'Medium' },
    low: { label: 'Low' },
    none: { label: 'None' },
  },
  ALL_STATUSES: ['open', 'in_progress', 'done', 'cancelled'],
  ALL_PRIORITIES: ['critical', 'high', 'medium', 'low', 'none'],
}))

describe('BulkActionsBar', () => {
  const onClear = vi.fn()

  it('renders selected count for single ticket', () => {
    render(<BulkActionsBar selectedIds={['id-1']} onClear={onClear} />)
    expect(screen.getByText('1 selected')).toBeTruthy()
  })

  it('renders selected count for multiple tickets', () => {
    render(<BulkActionsBar selectedIds={['id-1', 'id-2', 'id-3']} onClear={onClear} />)
    expect(screen.getByText('3 selected')).toBeTruthy()
  })

  it('renders toolbar role', () => {
    render(<BulkActionsBar selectedIds={['id-1']} onClear={onClear} />)
    expect(screen.getByRole('toolbar')).toBeTruthy()
  })

  it('has descriptive aria-label', () => {
    render(<BulkActionsBar selectedIds={['id-1', 'id-2']} onClear={onClear} />)
    const toolbar = screen.getByRole('toolbar')
    expect(toolbar.getAttribute('aria-label')).toBe('Bulk actions for 2 selected tickets')
  })

  it('singular aria-label for single ticket', () => {
    render(<BulkActionsBar selectedIds={['id-1']} onClear={onClear} />)
    const toolbar = screen.getByRole('toolbar')
    expect(toolbar.getAttribute('aria-label')).toBe('Bulk actions for 1 selected ticket')
  })

  it('renders Delete button', () => {
    render(<BulkActionsBar selectedIds={['id-1']} onClear={onClear} />)
    expect(screen.getByText('Delete')).toBeTruthy()
  })

  it('renders Clear button', () => {
    render(<BulkActionsBar selectedIds={['id-1']} onClear={onClear} />)
    expect(screen.getByText('Clear')).toBeTruthy()
  })

  it('calls onClear when Clear clicked', () => {
    const clearFn = vi.fn()
    render(<BulkActionsBar selectedIds={['id-1']} onClear={clearFn} />)
    screen.getByText('Clear').click()
    expect(clearFn).toHaveBeenCalled()
  })

  it('renders status select trigger', () => {
    render(<BulkActionsBar selectedIds={['id-1']} onClear={onClear} />)
    expect(screen.getByLabelText('Set status for selected tickets')).toBeTruthy()
  })

  it('renders priority select trigger', () => {
    render(<BulkActionsBar selectedIds={['id-1']} onClear={onClear} />)
    expect(screen.getByLabelText('Set priority for selected tickets')).toBeTruthy()
  })
})
