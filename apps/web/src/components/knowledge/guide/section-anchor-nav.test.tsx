import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SectionAnchorNav } from './section-anchor-nav'

const mockSections = [
  { id: 'overview', label: 'Overview' },
  { id: 'tools', label: 'Tools' },
  { id: 'examples', label: 'Examples' },
]

// Mock IntersectionObserver
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

beforeEach(() => {
  mockObserve.mockReset()
  mockDisconnect.mockReset()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockIntersectionObserver = vi.fn(function (this: any) {
    this.observe = mockObserve
    this.unobserve = vi.fn()
    this.disconnect = mockDisconnect
    this.root = null
    this.rootMargin = ''
    this.thresholds = []
    this.takeRecords = vi.fn().mockReturnValue([])
  })

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

describe('SectionAnchorNav', () => {
  it('renders without crashing', () => {
    render(<SectionAnchorNav sections={mockSections} />)
    expect(screen.getByTestId('section-anchor-nav')).toBeInTheDocument()
  })

  it('renders all section links', () => {
    render(<SectionAnchorNav sections={mockSections} />)
    for (const section of mockSections) {
      const links = screen.getAllByTestId(`anchor-link-${section.id}`)
      expect(links.length).toBeGreaterThan(0)
    }
  })

  it('displays section labels', () => {
    render(<SectionAnchorNav sections={mockSections} />)
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Tools').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Examples').length).toBeGreaterThan(0)
  })

  it('falls back to scrollIntoView when no main container exists', async () => {
    const user = userEvent.setup()
    const mockElement = document.createElement('div')
    mockElement.id = 'tools'
    mockElement.scrollIntoView = vi.fn()
    document.body.appendChild(mockElement)

    render(<SectionAnchorNav sections={mockSections} />)
    const buttons = screen.getAllByTestId('anchor-link-tools')
    await user.click(buttons[0]!)

    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
    })

    document.body.removeChild(mockElement)
  })

  it('scrolls within main container when present', async () => {
    const user = userEvent.setup()

    // Create a <main> scroll container matching the app layout
    const mainEl = document.createElement('main')
    mainEl.id = 'main-content'
    mainEl.scrollTo = vi.fn()
    mainEl.getBoundingClientRect = vi.fn().mockReturnValue({ top: 0 })
    document.body.appendChild(mainEl)

    const mockElement = document.createElement('div')
    mockElement.id = 'tools'
    mockElement.scrollIntoView = vi.fn()
    mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ top: 200 })
    mainEl.appendChild(mockElement)

    render(<SectionAnchorNav sections={mockSections} />)
    const buttons = screen.getAllByTestId('anchor-link-tools')
    await user.click(buttons[0]!)

    // Should use scrollTo on the container, NOT scrollIntoView
    expect(mainEl.scrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: 'smooth',
    })
    expect(mockElement.scrollIntoView).not.toHaveBeenCalled()

    document.body.removeChild(mainEl)
  })

  it('sets up IntersectionObserver', () => {
    render(<SectionAnchorNav sections={mockSections} />)
    expect(IntersectionObserver).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<SectionAnchorNav sections={mockSections} className="my-nav" />)
    expect(screen.getByTestId('section-anchor-nav')).toHaveClass('my-nav')
  })

  it('has accessible role navigation', () => {
    render(<SectionAnchorNav sections={mockSections} />)
    const nav = screen.getByTestId('section-anchor-nav')
    expect(nav.getAttribute('aria-label')).toBe('Section navigation')
  })
})
