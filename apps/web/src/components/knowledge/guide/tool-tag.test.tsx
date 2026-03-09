import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToolTag } from './tool-tag'

const defaultProps = {
  toolSlug: 'fishbone-diagram',
  toolName: 'Fishbone Diagram',
}

describe('ToolTag', () => {
  it('renders without crashing', () => {
    render(<ToolTag {...defaultProps} />)
    expect(screen.getByTestId('tool-tag')).toBeInTheDocument()
  })

  it('displays tool name', () => {
    render(<ToolTag {...defaultProps} />)
    expect(screen.getByText('Fishbone Diagram')).toBeInTheDocument()
  })

  it('opens popover on click', async () => {
    const user = userEvent.setup()
    render(<ToolTag {...defaultProps} description="A root cause analysis tool" />)
    await user.click(screen.getByTestId('tool-tag'))
    expect(screen.getByTestId('tool-tag-popover')).toBeInTheDocument()
  })

  it('shows description in popover', async () => {
    const user = userEvent.setup()
    render(<ToolTag {...defaultProps} description="A root cause analysis tool" />)
    await user.click(screen.getByTestId('tool-tag'))
    expect(screen.getByText('A root cause analysis tool')).toBeInTheDocument()
  })

  it('shows learn more link in popover', async () => {
    const user = userEvent.setup()
    render(<ToolTag {...defaultProps} />)
    await user.click(screen.getByTestId('tool-tag'))
    const link = screen.getByText('Learn more')
    expect(link.closest('a')).toHaveAttribute('href', '/knowledge/guide/tools/fishbone-diagram')
  })

  it('applies step color when stepNumber provided', () => {
    render(<ToolTag {...defaultProps} stepNumber={2} />)
    const badge = screen.getByText('Fishbone Diagram').closest('[data-slot="badge"]')
    expect(badge?.getAttribute('style')).toContain('border-color')
  })

  it('renders without step color when stepNumber is not provided', () => {
    render(<ToolTag {...defaultProps} />)
    const badge = screen.getByText('Fishbone Diagram').closest('[data-slot="badge"]')
    expect(badge?.getAttribute('style')).toBeNull()
  })

  it('applies custom className', () => {
    render(<ToolTag {...defaultProps} className="my-custom" />)
    expect(screen.getByTestId('tool-tag')).toHaveClass('my-custom')
  })
})
