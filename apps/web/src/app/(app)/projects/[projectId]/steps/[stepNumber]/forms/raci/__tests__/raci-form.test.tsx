import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RaciForm } from '../raci-form'

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

describe('RaciForm', () => {
  it('renders RACI Chart title', () => {
    render(<RaciForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('RACI Chart')).toBeTruthy()
  })

  it('renders description', () => {
    render(<RaciForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Assign clear roles for each activity/)).toBeTruthy()
  })

  it('renders RACI legend items', () => {
    render(<RaciForm projectId="p-1" initialData={null} />)
    // Legend items have text split: <span>R</span> = Responsible
    expect(screen.getByText('R')).toBeTruthy()
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.getByText('C')).toBeTruthy()
    expect(screen.getByText('I')).toBeTruthy()
  })

  it('renders Activity table header', () => {
    render(<RaciForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Activity')).toBeTruthy()
  })

  it('renders Add Activity button', () => {
    render(<RaciForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Add Activity')).toBeTruthy()
  })

  it('renders Add Person button', () => {
    render(<RaciForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Add Person')).toBeTruthy()
  })

  it('renders coaching text', () => {
    render(<RaciForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/List your activities/)).toBeTruthy()
  })
})
