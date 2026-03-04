import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ImplementationChecklistForm } from '../implementation-checklist-form'

vi.mock('@/components/pips/form-shell', () => ({
  FormShell: ({
    children,
    title,
    description,
  }: {
    children: React.ReactNode
    title: string
    description: string
  }) => (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  ),
}))

vi.mock('../actions', () => ({
  saveFormData: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('./checklist-ticket-actions', () => ({
  createTicketsFromChecklist: vi.fn().mockResolvedValue({ created: 0 }),
}))

describe('ImplementationChecklistForm', () => {
  it('renders Implementation Checklist title', () => {
    render(<ImplementationChecklistForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Implementation Checklist')).toBeTruthy()
  })

  it('renders description', () => {
    render(<ImplementationChecklistForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Track detailed tasks with status/)).toBeTruthy()
  })

  it('renders coaching text', () => {
    render(<ImplementationChecklistForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Track each task as you execute/)).toBeTruthy()
  })

  it('renders Add Item button', () => {
    render(<ImplementationChecklistForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Add Item')).toBeTruthy()
  })

  it('renders empty state when no items', () => {
    render(<ImplementationChecklistForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/No items yet/)).toBeTruthy()
  })

  it('does not render progress bar when no items', () => {
    const { container } = render(<ImplementationChecklistForm projectId="p-1" initialData={null} />)
    expect(container.querySelector('[class*="rounded-full bg-muted"]')).toBeNull()
  })
})
