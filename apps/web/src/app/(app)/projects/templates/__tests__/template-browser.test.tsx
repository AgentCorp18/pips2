import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

/* ============================================================
   Mocks
   ============================================================ */

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('../actions', () => ({
  applyTemplate: vi.fn().mockResolvedValue({ projectId: 'proj-test-123' }),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { TemplateBrowser } from '../template-browser'
import { SYSTEM_TEMPLATES } from '@/lib/form-templates'

/* ============================================================
   Tests
   ============================================================ */

describe('TemplateBrowser', () => {
  it('renders all filter tabs', () => {
    render(<TemplateBrowser />)
    expect(screen.getByTestId('filter-tab-all')).toBeTruthy()
    expect(screen.getByTestId('filter-tab-manufacturing')).toBeTruthy()
    expect(screen.getByTestId('filter-tab-customer_service')).toBeTruthy()
    expect(screen.getByTestId('filter-tab-it')).toBeTruthy()
    expect(screen.getByTestId('filter-tab-hr')).toBeTruthy()
    expect(screen.getByTestId('filter-tab-quality')).toBeTruthy()
  })

  it('shows all templates by default (all tab selected)', () => {
    render(<TemplateBrowser />)
    const grid = screen.getByTestId('template-grid')
    // All 10 templates should be visible
    expect(grid.children).toHaveLength(SYSTEM_TEMPLATES.length)
  })

  it('renders a card for each system template', () => {
    render(<TemplateBrowser />)
    for (const template of SYSTEM_TEMPLATES) {
      expect(screen.getByTestId(`template-card-${template.id}`)).toBeTruthy()
    }
  })

  it('renders template names', () => {
    render(<TemplateBrowser />)
    expect(screen.getByText('Manufacturing Defect Reduction')).toBeTruthy()
    expect(screen.getByText('Customer Service Response Time')).toBeTruthy()
  })

  it('renders "Use Template" button for each template', () => {
    render(<TemplateBrowser />)
    for (const template of SYSTEM_TEMPLATES) {
      expect(screen.getByTestId(`template-card-use-${template.id}`)).toBeTruthy()
    }
  })

  it('renders vertical badges on template cards', () => {
    render(<TemplateBrowser />)
    const mfgTemplate = SYSTEM_TEMPLATES.find((t) => t.vertical === 'manufacturing')!
    expect(screen.getByTestId(`template-card-badge-${mfgTemplate.id}`)).toBeTruthy()
  })

  it('filters to manufacturing templates only when manufacturing tab is clicked', () => {
    render(<TemplateBrowser />)
    fireEvent.click(screen.getByTestId('filter-tab-manufacturing'))

    const mfgTemplates = SYSTEM_TEMPLATES.filter((t) => t.vertical === 'manufacturing')
    const nonMfgTemplates = SYSTEM_TEMPLATES.filter((t) => t.vertical !== 'manufacturing')

    for (const t of mfgTemplates) {
      expect(screen.getByTestId(`template-card-${t.id}`)).toBeTruthy()
    }
    for (const t of nonMfgTemplates) {
      expect(screen.queryByTestId(`template-card-${t.id}`)).toBeNull()
    }
  })

  it('filters to customer_service templates only when customer_service tab is clicked', () => {
    render(<TemplateBrowser />)
    fireEvent.click(screen.getByTestId('filter-tab-customer_service'))

    const csTemplates = SYSTEM_TEMPLATES.filter((t) => t.vertical === 'customer_service')
    const nonCsTemplates = SYSTEM_TEMPLATES.filter((t) => t.vertical !== 'customer_service')

    for (const t of csTemplates) {
      expect(screen.getByTestId(`template-card-${t.id}`)).toBeTruthy()
    }
    for (const t of nonCsTemplates) {
      expect(screen.queryByTestId(`template-card-${t.id}`)).toBeNull()
    }
  })

  it('filters to hr templates only when hr tab is clicked', () => {
    render(<TemplateBrowser />)
    fireEvent.click(screen.getByTestId('filter-tab-hr'))

    const hrTemplates = SYSTEM_TEMPLATES.filter((t) => t.vertical === 'hr')
    const nonHrTemplates = SYSTEM_TEMPLATES.filter((t) => t.vertical !== 'hr')

    for (const t of hrTemplates) {
      expect(screen.getByTestId(`template-card-${t.id}`)).toBeTruthy()
    }
    for (const t of nonHrTemplates) {
      expect(screen.queryByTestId(`template-card-${t.id}`)).toBeNull()
    }
  })

  it('filters to it templates only when it tab is clicked', () => {
    render(<TemplateBrowser />)
    fireEvent.click(screen.getByTestId('filter-tab-it'))

    const itTemplates = SYSTEM_TEMPLATES.filter((t) => t.vertical === 'it')
    const nonItTemplates = SYSTEM_TEMPLATES.filter((t) => t.vertical !== 'it')

    for (const t of itTemplates) {
      expect(screen.getByTestId(`template-card-${t.id}`)).toBeTruthy()
    }
    for (const t of nonItTemplates) {
      expect(screen.queryByTestId(`template-card-${t.id}`)).toBeNull()
    }
  })

  it('returns to all templates when all tab is clicked after filtering', () => {
    render(<TemplateBrowser />)
    fireEvent.click(screen.getByTestId('filter-tab-hr'))
    fireEvent.click(screen.getByTestId('filter-tab-all'))

    const grid = screen.getByTestId('template-grid')
    expect(grid.children).toHaveLength(SYSTEM_TEMPLATES.length)
  })

  it('marks the active filter tab with aria-selected=true', () => {
    render(<TemplateBrowser />)
    const allTab = screen.getByTestId('filter-tab-all')
    expect(allTab.getAttribute('aria-selected')).toBe('true')

    fireEvent.click(screen.getByTestId('filter-tab-manufacturing'))
    expect(screen.getByTestId('filter-tab-manufacturing').getAttribute('aria-selected')).toBe('true')
    expect(screen.getByTestId('filter-tab-all').getAttribute('aria-selected')).toBe('false')
  })

  it('opens the apply dialog when "Use Template" is clicked', () => {
    render(<TemplateBrowser />)
    const firstTemplate = SYSTEM_TEMPLATES[0]!
    fireEvent.click(screen.getByTestId(`template-card-use-${firstTemplate.id}`))
    // Dialog title should appear
    expect(screen.getByTestId('apply-dialog-title')).toBeTruthy()
    expect(screen.getByTestId('apply-dialog-title').textContent).toBe(firstTemplate.name)
  })

  it('shows the forms list in the dialog', () => {
    render(<TemplateBrowser />)
    const firstTemplate = SYSTEM_TEMPLATES[0]!
    fireEvent.click(screen.getByTestId(`template-card-use-${firstTemplate.id}`))
    expect(screen.getByTestId('apply-dialog-forms-list')).toBeTruthy()
  })

  it('shows the project name input in the dialog', () => {
    render(<TemplateBrowser />)
    fireEvent.click(screen.getByTestId(`template-card-use-${SYSTEM_TEMPLATES[0]!.id}`))
    expect(screen.getByTestId('template-project-name-input')).toBeTruthy()
  })

  it('shows create button disabled when project name is empty', () => {
    render(<TemplateBrowser />)
    fireEvent.click(screen.getByTestId(`template-card-use-${SYSTEM_TEMPLATES[0]!.id}`))
    const submitBtn = screen.getByTestId('apply-dialog-submit')
    expect(submitBtn).toBeDisabled()
  })

  it('enables create button when project name is typed', () => {
    render(<TemplateBrowser />)
    fireEvent.click(screen.getByTestId(`template-card-use-${SYSTEM_TEMPLATES[0]!.id}`))
    const input = screen.getByTestId('template-project-name-input')
    fireEvent.change(input, { target: { value: 'My New Project' } })
    const submitBtn = screen.getByTestId('apply-dialog-submit')
    expect(submitBtn).not.toBeDisabled()
  })

  it('closes the dialog when cancel is clicked', () => {
    render(<TemplateBrowser />)
    fireEvent.click(screen.getByTestId(`template-card-use-${SYSTEM_TEMPLATES[0]!.id}`))
    expect(screen.getByTestId('apply-dialog-title')).toBeTruthy()
    fireEvent.click(screen.getByTestId('apply-dialog-cancel'))
    // Dialog should be closed (title no longer in DOM)
    expect(screen.queryByTestId('apply-dialog-title')).toBeNull()
  })

  it('shows validation error when name is too short on submit', () => {
    render(<TemplateBrowser />)
    fireEvent.click(screen.getByTestId(`template-card-use-${SYSTEM_TEMPLATES[0]!.id}`))
    const input = screen.getByTestId('template-project-name-input')
    fireEvent.change(input, { target: { value: 'AB' } })
    const submitBtn = screen.getByTestId('apply-dialog-submit')
    fireEvent.click(submitBtn)
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('Project name must be at least 3 characters')).toBeTruthy()
  })

  it('renders vertical badge in dialog', () => {
    render(<TemplateBrowser />)
    fireEvent.click(screen.getByTestId(`template-card-use-${SYSTEM_TEMPLATES[0]!.id}`))
    expect(screen.getByTestId('apply-dialog-vertical-badge')).toBeTruthy()
  })
})
