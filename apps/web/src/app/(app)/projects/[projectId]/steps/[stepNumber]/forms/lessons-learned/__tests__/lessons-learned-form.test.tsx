import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LessonsLearnedForm } from '../lessons-learned-form'

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

describe('LessonsLearnedForm', () => {
  it('renders Lessons Learned title', () => {
    render(<LessonsLearnedForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Lessons Learned')).toBeTruthy()
  })

  it('renders description', () => {
    render(<LessonsLearnedForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Document insights, successes/)).toBeTruthy()
  })

  it('renders coaching text', () => {
    render(<LessonsLearnedForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Reflect on the project as a team/)).toBeTruthy()
  })

  it('renders What Went Well section', () => {
    render(<LessonsLearnedForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('What Went Well')).toBeTruthy()
  })

  it('renders Could Be Improved section', () => {
    render(<LessonsLearnedForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Could Be Improved')).toBeTruthy()
  })

  it('renders Action Items label', () => {
    render(<LessonsLearnedForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Action Items')).toBeTruthy()
  })

  it('renders Add Action button', () => {
    render(<LessonsLearnedForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Add Action')).toBeTruthy()
  })

  it('renders Key Takeaways label', () => {
    render(<LessonsLearnedForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Key Takeaways')).toBeTruthy()
  })

  it('renders empty state for action items', () => {
    render(<LessonsLearnedForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/No action items yet/)).toBeTruthy()
  })
})
