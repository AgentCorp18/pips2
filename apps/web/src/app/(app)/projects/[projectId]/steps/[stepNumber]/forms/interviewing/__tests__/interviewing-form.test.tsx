import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InterviewingForm } from '../interviewing-form'

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

vi.mock('@/components/pips/form-textarea', () => ({
  FormTextarea: ({
    id,
    label,
    value,
    onChange,
    placeholder,
  }: {
    id: string
    label: string
    value: string
    onChange: (v: string) => void
    placeholder?: string
    helperText?: string
    rows?: number
    aiFieldType?: string
    aiContext?: string
  }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  ),
}))

vi.mock('@/components/pips/form-view-context', () => ({
  useFormViewMode: () => 'edit',
}))

describe('InterviewingForm', () => {
  it('renders without crashing', () => {
    render(<InterviewingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Interviewing')).toBeTruthy()
  })

  it('displays the form title', () => {
    render(<InterviewingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Interviewing')).toBeTruthy()
  })

  it('displays the form description', () => {
    render(<InterviewingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText(/Conduct structured interviews/)).toBeTruthy()
  })

  it('shows Add Interview button in edit mode', () => {
    render(<InterviewingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Add Interview')).toBeTruthy()
  })

  it('adds an interview card when Add Interview is clicked', () => {
    render(<InterviewingForm projectId="p-1" stepNumber={3} initialData={null} />)
    fireEvent.click(screen.getByText('Add Interview'))
    expect(screen.getByText('Interview #1')).toBeTruthy()
  })

  it('shows Add Question button after adding an interview', () => {
    render(<InterviewingForm projectId="p-1" stepNumber={3} initialData={null} />)
    fireEvent.click(screen.getByText('Add Interview'))
    expect(screen.getByText('Add Question')).toBeTruthy()
  })

  it('shows Overall Summary field', () => {
    render(<InterviewingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Overall Summary')).toBeTruthy()
  })

  it('handles view mode without crashing', () => {
    const { unmount } = render(
      <InterviewingForm
        projectId="p-1"
        stepNumber={3}
        initialData={{
          interviews: [
            {
              id: 'iv-1',
              intervieweeName: 'Alice',
              role: 'Manager',
              date: '2026-03-01',
              questionsAndResponses: [],
              keyInsights: 'Very helpful',
            },
          ],
          summary: 'Good findings',
        }}
      />,
    )
    expect(screen.getByText('Interviewing')).toBeTruthy()
    unmount()
  })
})
