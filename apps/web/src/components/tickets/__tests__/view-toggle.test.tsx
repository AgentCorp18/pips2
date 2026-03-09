import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ViewToggle } from '../view-toggle'

const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}))

describe('ViewToggle', () => {
  beforeEach(() => {
    mockPush.mockReset()
  })

  it('renders Table button', () => {
    render(<ViewToggle current="table" />)
    expect(screen.getByText('Table')).toBeTruthy()
  })

  it('renders Cards button', () => {
    render(<ViewToggle current="table" />)
    expect(screen.getByText('Cards')).toBeTruthy()
  })

  it('has aria-label on Table button', () => {
    render(<ViewToggle current="table" />)
    expect(screen.getByLabelText('Table view')).toBeTruthy()
  })

  it('has aria-label on Cards button', () => {
    render(<ViewToggle current="cards" />)
    expect(screen.getByLabelText('Card view')).toBeTruthy()
  })

  it('navigates to table view on Table click', () => {
    render(<ViewToggle current="cards" />)
    fireEvent.click(screen.getByText('Table'))
    expect(mockPush).toHaveBeenCalledWith('/tickets?view=table')
  })

  it('navigates to cards view on Cards click', () => {
    render(<ViewToggle current="table" />)
    fireEvent.click(screen.getByText('Cards'))
    expect(mockPush).toHaveBeenCalledWith('/tickets?view=cards')
  })

  it('renders Board button', () => {
    render(<ViewToggle current="table" />)
    expect(screen.getByText('Board')).toBeTruthy()
  })

  it('has aria-label on Board button', () => {
    render(<ViewToggle current="table" />)
    expect(screen.getByLabelText('Board view')).toBeTruthy()
  })

  it('navigates to board view on Board click', () => {
    render(<ViewToggle current="table" />)
    fireEvent.click(screen.getByText('Board'))
    expect(mockPush).toHaveBeenCalledWith('/tickets?view=board')
  })

  it('highlights Board button when current is board', () => {
    render(<ViewToggle current="board" />)
    expect(screen.getByTestId('view-toggle-board')).toBeTruthy()
  })

  it('uses custom basePath for navigation', () => {
    render(<ViewToggle current="cards" basePath="/projects" />)
    fireEvent.click(screen.getByText('Table'))
    expect(mockPush).toHaveBeenCalledWith('/projects?view=table')
  })

  it('uses custom basePath for board navigation', () => {
    render(<ViewToggle current="table" basePath="/projects" />)
    fireEvent.click(screen.getByText('Board'))
    expect(mockPush).toHaveBeenCalledWith('/projects?view=board')
  })
})
