import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InteractiveChecklist } from './interactive-checklist'

const items = ['Define the problem', 'Gather data', 'Identify root cause']

let store: Record<string, string> = {}

const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key]
  }),
  clear: vi.fn(() => {
    store = {}
  }),
  get length() {
    return Object.keys(store).length
  },
  key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
}

beforeEach(() => {
  store = {}
  vi.stubGlobal('localStorage', localStorageMock)
  vi.clearAllMocks()
})

describe('InteractiveChecklist', () => {
  it('renders with data-testid', () => {
    render(<InteractiveChecklist stepNumber={1} items={items} />)
    expect(screen.getByTestId('interactive-checklist')).toBeInTheDocument()
  })

  it('renders all items', () => {
    render(<InteractiveChecklist stepNumber={1} items={items} />)
    items.forEach((item, i) => {
      expect(screen.getByTestId(`checklist-item-${i}`)).toBeInTheDocument()
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('renders progress indicator', () => {
    render(<InteractiveChecklist stepNumber={1} items={items} />)
    expect(screen.getByTestId('checklist-progress')).toBeInTheDocument()
    expect(screen.getByText(/0 of 3 completed/)).toBeInTheDocument()
  })

  it('toggles item on click', () => {
    render(<InteractiveChecklist stepNumber={1} items={items} />)
    const checkbox = screen.getByLabelText('Define the problem')
    fireEvent.click(checkbox)
    expect(screen.getByText(/1 of 3 completed/)).toBeInTheDocument()
  })

  it('persists to localStorage', () => {
    render(<InteractiveChecklist stepNumber={2} items={items} />)
    const checkbox = screen.getByLabelText('Gather data')
    fireEvent.click(checkbox)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'pips-guide-checklist-2',
      expect.any(String),
    )
    const stored = store['pips-guide-checklist-2']
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored!)
    expect(parsed).toContain(1)
  })

  it('loads checked items from localStorage', () => {
    store['pips-guide-checklist-1'] = JSON.stringify([0, 2])
    render(<InteractiveChecklist stepNumber={1} items={items} />)
    expect(screen.getByText(/2 of 3 completed/)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<InteractiveChecklist stepNumber={1} items={items} className="my-class" />)
    expect(screen.getByTestId('interactive-checklist')).toHaveClass('my-class')
  })

  it('unchecks a checked item', () => {
    store['pips-guide-checklist-1'] = JSON.stringify([0])
    render(<InteractiveChecklist stepNumber={1} items={items} />)
    expect(screen.getByText(/1 of 3 completed/)).toBeInTheDocument()
    const checkbox = screen.getByLabelText('Define the problem')
    fireEvent.click(checkbox)
    expect(screen.getByText(/0 of 3 completed/)).toBeInTheDocument()
  })
})
