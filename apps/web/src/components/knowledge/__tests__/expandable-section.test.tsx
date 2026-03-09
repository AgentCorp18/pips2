import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpandableSection } from '../expandable-section'

describe('ExpandableSection', () => {
  it('renders title', () => {
    render(<ExpandableSection title="Test Title">Content</ExpandableSection>)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('is collapsed by default', () => {
    render(<ExpandableSection title="Title">Hidden Content</ExpandableSection>)
    expect(screen.queryByTestId('expandable-content')).not.toBeInTheDocument()
  })

  it('expands on click', async () => {
    const user = userEvent.setup()
    render(<ExpandableSection title="Title">Expanded Content</ExpandableSection>)

    await user.click(screen.getByText('Title'))
    expect(screen.getByTestId('expandable-content')).toBeInTheDocument()
    expect(screen.getByText('Expanded Content')).toBeInTheDocument()
  })

  it('collapses on second click', async () => {
    const user = userEvent.setup()
    render(<ExpandableSection title="Title">Content</ExpandableSection>)

    await user.click(screen.getByText('Title'))
    expect(screen.getByTestId('expandable-content')).toBeInTheDocument()

    await user.click(screen.getByText('Title'))
    expect(screen.queryByTestId('expandable-content')).not.toBeInTheDocument()
  })

  it('respects defaultOpen=true', () => {
    render(
      <ExpandableSection title="Title" defaultOpen>
        Visible Content
      </ExpandableSection>,
    )
    expect(screen.getByTestId('expandable-content')).toBeInTheDocument()
    expect(screen.getByText('Visible Content')).toBeInTheDocument()
  })

  it('has correct aria-expanded attribute', async () => {
    const user = userEvent.setup()
    render(<ExpandableSection title="Title">Content</ExpandableSection>)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('applies custom className', () => {
    render(
      <ExpandableSection title="Title" className="custom-class">
        Content
      </ExpandableSection>,
    )
    expect(screen.getByTestId('expandable-section')).toHaveClass('custom-class')
  })

  it('renders subtitle when provided', () => {
    render(
      <ExpandableSection title="Title" subtitle="A helpful teaser line">
        Content
      </ExpandableSection>,
    )
    expect(screen.getByText('A helpful teaser line')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(
      <ExpandableSection title="Title" icon="target">
        Content
      </ExpandableSection>,
    )
    // The icon container div should be present
    const button = screen.getByRole('button')
    const iconContainer = button.querySelector('div')
    expect(iconContainer).toBeInTheDocument()
  })

  it('does not render icon container when icon is not provided', () => {
    render(<ExpandableSection title="Title">Content</ExpandableSection>)
    const button = screen.getByRole('button')
    // No icon container div inside button - only the text spans and chevron
    const divs = button.querySelectorAll(':scope > div')
    // Should have the text container div but no icon container
    expect(divs.length).toBe(1)
  })

  it('applies accent color to icon container', () => {
    render(
      <ExpandableSection title="Title" icon="target" accentColor="#3B82F6">
        Content
      </ExpandableSection>,
    )
    const button = screen.getByRole('button')
    const iconContainer = button.querySelector('div')
    expect(iconContainer).toHaveStyle({ color: '#3B82F6' })
  })
})
