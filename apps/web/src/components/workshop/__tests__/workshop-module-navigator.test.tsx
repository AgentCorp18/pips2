import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { WorkshopModuleNavigator } from '../workshop-module-navigator'

const MODULES = [
  { title: 'Introduction', duration: '10 min', notes: 'Welcome participants' },
  { title: 'Root Cause Analysis', duration: '20 min', notes: '' },
  { title: 'Action Planning', duration: '15 min', notes: 'Wrap up' },
]

describe('WorkshopModuleNavigator', () => {
  it('renders data-testid on container', () => {
    render(<WorkshopModuleNavigator modules={MODULES} currentIndex={0} />)
    expect(screen.getByTestId('module-navigator')).toBeTruthy()
  })

  it('renders current module highlight', () => {
    render(<WorkshopModuleNavigator modules={MODULES} currentIndex={0} />)
    const current = screen.getByTestId('current-module')
    expect(current).toBeTruthy()
    expect(within(current).getByText('Introduction')).toBeTruthy()
  })

  it('shows module position indicator', () => {
    render(<WorkshopModuleNavigator modules={MODULES} currentIndex={1} />)
    expect(screen.getByText('Module 2 of 3')).toBeTruthy()
  })

  it('renders module duration in current module', () => {
    render(<WorkshopModuleNavigator modules={MODULES} currentIndex={0} />)
    const current = screen.getByTestId('current-module')
    expect(within(current).getByText('10 min')).toBeTruthy()
  })

  it('renders module notes when present', () => {
    render(<WorkshopModuleNavigator modules={MODULES} currentIndex={0} />)
    expect(screen.getByText('Welcome participants')).toBeTruthy()
  })

  it('renders all module items in nav', () => {
    render(<WorkshopModuleNavigator modules={MODULES} currentIndex={0} />)
    const nav = screen.getByLabelText('Workshop modules')
    expect(nav.tagName).toBe('NAV')
    expect(screen.getByTestId('module-item-0')).toBeTruthy()
    expect(screen.getByTestId('module-item-1')).toBeTruthy()
    expect(screen.getByTestId('module-item-2')).toBeTruthy()
  })

  it('sets aria-current on active module', () => {
    render(<WorkshopModuleNavigator modules={MODULES} currentIndex={1} />)
    expect(screen.getByTestId('module-item-1').getAttribute('aria-current')).toBe('step')
    expect(screen.getByTestId('module-item-0').getAttribute('aria-current')).toBeNull()
  })

  it('disables module buttons when showControls is false', () => {
    render(<WorkshopModuleNavigator modules={MODULES} currentIndex={0} />)
    expect((screen.getByTestId('module-item-0') as HTMLButtonElement).disabled).toBe(true)
  })

  it('does not render navigation buttons without showControls', () => {
    render(<WorkshopModuleNavigator modules={MODULES} currentIndex={0} />)
    expect(screen.queryByText('Previous')).toBeNull()
    expect(screen.queryByText('Next')).toBeNull()
  })

  it('renders navigation buttons with showControls', () => {
    render(
      <WorkshopModuleNavigator
        modules={MODULES}
        currentIndex={1}
        showControls
        onNavigate={vi.fn()}
      />,
    )
    expect(screen.getByText('Previous')).toBeTruthy()
    expect(screen.getByText('Next')).toBeTruthy()
  })

  it('disables Previous on first module', () => {
    render(
      <WorkshopModuleNavigator
        modules={MODULES}
        currentIndex={0}
        showControls
        onNavigate={vi.fn()}
      />,
    )
    expect(screen.getByText('Previous').closest('button')?.disabled).toBe(true)
  })

  it('disables Next on last module', () => {
    render(
      <WorkshopModuleNavigator
        modules={MODULES}
        currentIndex={2}
        showControls
        onNavigate={vi.fn()}
      />,
    )
    expect(screen.getByText('Next').closest('button')?.disabled).toBe(true)
  })

  it('calls onNavigate with correct index on Previous click', () => {
    const onNavigate = vi.fn()
    render(
      <WorkshopModuleNavigator
        modules={MODULES}
        currentIndex={1}
        showControls
        onNavigate={onNavigate}
      />,
    )
    fireEvent.click(screen.getByText('Previous'))
    expect(onNavigate).toHaveBeenCalledWith(0)
  })

  it('calls onNavigate with correct index on Next click', () => {
    const onNavigate = vi.fn()
    render(
      <WorkshopModuleNavigator
        modules={MODULES}
        currentIndex={1}
        showControls
        onNavigate={onNavigate}
      />,
    )
    fireEvent.click(screen.getByText('Next'))
    expect(onNavigate).toHaveBeenCalledWith(2)
  })

  it('calls onNavigate when clicking a module item with showControls', () => {
    const onNavigate = vi.fn()
    render(
      <WorkshopModuleNavigator
        modules={MODULES}
        currentIndex={0}
        showControls
        onNavigate={onNavigate}
      />,
    )
    fireEvent.click(screen.getByTestId('module-item-2'))
    expect(onNavigate).toHaveBeenCalledWith(2)
  })

  it('shows counter text in navigation', () => {
    render(
      <WorkshopModuleNavigator
        modules={MODULES}
        currentIndex={1}
        showControls
        onNavigate={vi.fn()}
      />,
    )
    expect(screen.getByText('2 / 3')).toBeTruthy()
  })
})
