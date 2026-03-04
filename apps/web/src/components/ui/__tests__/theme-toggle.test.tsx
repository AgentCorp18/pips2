import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '../theme-toggle'

const mockSetTheme = vi.fn()
let mockTheme = 'system' as 'light' | 'dark' | 'system'

vi.mock('@/hooks/use-mounted', () => ({
  useMounted: () => true,
}))

vi.mock('@/components/theme-provider', () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: mockSetTheme }),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockSetTheme.mockReset()
    mockTheme = 'system'
  })

  it('renders a button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeTruthy()
  })

  it('shows System label when theme is system', () => {
    render(<ThemeToggle />)
    expect(screen.getByText('System')).toBeTruthy()
  })

  it('shows Light label when theme is light', () => {
    mockTheme = 'light'
    render(<ThemeToggle />)
    expect(screen.getByText('Light')).toBeTruthy()
  })

  it('shows Dark label when theme is dark', () => {
    mockTheme = 'dark'
    render(<ThemeToggle />)
    expect(screen.getByText('Dark')).toBeTruthy()
  })

  it('has aria-label for system theme', () => {
    render(<ThemeToggle />)
    expect(screen.getByLabelText('Switch to light mode')).toBeTruthy()
  })

  it('has aria-label for light theme', () => {
    mockTheme = 'light'
    render(<ThemeToggle />)
    expect(screen.getByLabelText('Switch to dark mode')).toBeTruthy()
  })

  it('cycles from light to dark on click', () => {
    mockTheme = 'light'
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('cycles from dark to system on click', () => {
    mockTheme = 'dark'
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockSetTheme).toHaveBeenCalledWith('system')
  })

  it('cycles from system to light on click', () => {
    mockTheme = 'system'
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})
