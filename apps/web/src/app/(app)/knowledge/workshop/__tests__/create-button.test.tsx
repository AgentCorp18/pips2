import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkshopCreateButton } from '../_create-button'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('./actions', () => ({
  createSession: vi.fn().mockResolvedValue({ success: true, data: { id: 's-1' } }),
}))

describe('WorkshopCreateButton', () => {
  it('renders New Session button initially', () => {
    render(<WorkshopCreateButton />)
    expect(screen.getByText('New Session')).toBeTruthy()
  })

  it('shows template picker on click', () => {
    render(<WorkshopCreateButton />)
    fireEvent.click(screen.getByText('New Session'))
    expect(screen.getByText('Create Workshop Session')).toBeTruthy()
  })

  it('shows template description text', () => {
    render(<WorkshopCreateButton />)
    fireEvent.click(screen.getByText('New Session'))
    expect(screen.getByText(/Choose a template or start from scratch/)).toBeTruthy()
  })

  it('shows Blank Session option', () => {
    render(<WorkshopCreateButton />)
    fireEvent.click(screen.getByText('New Session'))
    expect(screen.getByText('Blank Session')).toBeTruthy()
  })

  it('shows Cancel button in picker', () => {
    render(<WorkshopCreateButton />)
    fireEvent.click(screen.getByText('New Session'))
    expect(screen.getByText('Cancel')).toBeTruthy()
  })

  it('closes picker on Cancel click', () => {
    render(<WorkshopCreateButton />)
    fireEvent.click(screen.getByText('New Session'))
    expect(screen.getByText('Create Workshop Session')).toBeTruthy()
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Create Workshop Session')).toBeNull()
  })
})
