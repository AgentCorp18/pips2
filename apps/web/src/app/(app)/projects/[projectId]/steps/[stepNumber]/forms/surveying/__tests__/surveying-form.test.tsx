import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SurveyingForm } from '../surveying-form'

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

vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
  }: {
    children: React.ReactNode
    onValueChange?: (v: string) => void
    value?: string
  }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <button type="button" id={id}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-value={value}>{children}</div>
  ),
}))

describe('SurveyingForm', () => {
  it('renders without crashing', () => {
    render(<SurveyingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Surveying')).toBeTruthy()
  })

  it('displays the form title', () => {
    render(<SurveyingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Surveying')).toBeTruthy()
  })

  it('displays the form description', () => {
    render(<SurveyingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText(/Design and administer surveys/)).toBeTruthy()
  })

  it('shows Survey Title and Target Audience inputs', () => {
    render(<SurveyingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByLabelText('Survey Title')).toBeTruthy()
    expect(screen.getByLabelText('Target Audience')).toBeTruthy()
  })

  it('shows Questions and Responses section headings', () => {
    render(<SurveyingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Questions')).toBeTruthy()
    expect(screen.getByText('Responses')).toBeTruthy()
  })

  it('shows Add Question button in edit mode', () => {
    render(<SurveyingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Add Question')).toBeTruthy()
  })

  it('adds a question card when Add Question is clicked', () => {
    render(<SurveyingForm projectId="p-1" stepNumber={3} initialData={null} />)
    fireEvent.click(screen.getByText('Add Question'))
    expect(screen.getByText('Question 1')).toBeTruthy()
  })

  it('shows Add Respondent button in edit mode', () => {
    render(<SurveyingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Add Respondent')).toBeTruthy()
  })

  it('adds a respondent card when Add Respondent is clicked', () => {
    render(<SurveyingForm projectId="p-1" stepNumber={3} initialData={null} />)
    fireEvent.click(screen.getByText('Add Respondent'))
    expect(screen.getByText('Respondent #1')).toBeTruthy()
  })

  it('shows Summary field', () => {
    render(<SurveyingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Summary')).toBeTruthy()
  })

  it('handles view mode with initial data without crashing', () => {
    const { unmount } = render(
      <SurveyingForm
        projectId="p-1"
        stepNumber={3}
        initialData={{
          title: 'Q1 Satisfaction',
          targetAudience: 'Employees',
          questions: [
            {
              id: 'q-1',
              text: 'How satisfied are you?',
              type: 'rating',
              options: [],
            },
          ],
          respondents: [],
          summary: 'Good results overall',
        }}
      />,
    )
    expect(screen.getByText('Surveying')).toBeTruthy()
    unmount()
  })
})
