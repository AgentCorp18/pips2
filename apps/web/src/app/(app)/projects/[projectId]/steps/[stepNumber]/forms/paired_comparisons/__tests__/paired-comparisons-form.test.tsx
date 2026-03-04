import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PairedComparisonsForm } from '../paired-comparisons-form'

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

describe('PairedComparisonsForm', () => {
  it('renders Paired Comparisons title', () => {
    render(<PairedComparisonsForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Paired Comparisons')).toBeTruthy()
  })

  it('renders description', () => {
    render(<PairedComparisonsForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Compare options systematically in pairs/)).toBeTruthy()
  })

  it('renders coaching prompt', () => {
    render(<PairedComparisonsForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Add the options you want to compare/)).toBeTruthy()
  })

  it('renders Options to Compare heading', () => {
    render(<PairedComparisonsForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Options to Compare')).toBeTruthy()
  })

  it('renders Add Option button', () => {
    render(<PairedComparisonsForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Add Option')).toBeTruthy()
  })

  it('does not render matchups section when no options', () => {
    render(<PairedComparisonsForm projectId="p-1" initialData={null} />)
    expect(screen.queryByText('Pairwise Matchups')).toBeNull()
  })

  it('does not render rankings when no options', () => {
    render(<PairedComparisonsForm projectId="p-1" initialData={null} />)
    expect(screen.queryByText('Rankings')).toBeNull()
  })
})
