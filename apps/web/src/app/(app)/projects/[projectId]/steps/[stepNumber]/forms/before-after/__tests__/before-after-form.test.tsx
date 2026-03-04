import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BeforeAfterForm } from '../before-after-form'

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

describe('BeforeAfterForm', () => {
  it('renders Before & After Comparison title', () => {
    render(<BeforeAfterForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Before & After Comparison')).toBeTruthy()
  })

  it('renders description', () => {
    render(<BeforeAfterForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Compare baseline metrics/)).toBeTruthy()
  })

  it('renders coaching text', () => {
    render(<BeforeAfterForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/For each metric, enter the baseline/)).toBeTruthy()
  })

  it('renders table headers', () => {
    render(<BeforeAfterForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Metric')).toBeTruthy()
    expect(screen.getByText('Unit')).toBeTruthy()
    expect(screen.getByText('Before')).toBeTruthy()
    expect(screen.getByText('After')).toBeTruthy()
    expect(screen.getByText('Improvement')).toBeTruthy()
  })

  it('renders Add Metric button', () => {
    render(<BeforeAfterForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Add Metric')).toBeTruthy()
  })

  it('renders Summary label', () => {
    render(<BeforeAfterForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Summary')).toBeTruthy()
  })
})
