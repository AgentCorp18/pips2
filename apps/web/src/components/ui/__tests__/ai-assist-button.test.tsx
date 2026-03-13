import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { AiAssistButton } from '../ai-assist-button'

/* ============================================================
   Mocks
   ============================================================ */

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

/* ============================================================
   Helpers
   ============================================================ */

const defaultProps = {
  fieldType: 'general',
  context: 'test context',
  onAccept: vi.fn(),
}

const TestWrapper = ({
  value = '',
  ...props
}: { value?: string } & Partial<typeof defaultProps>) => {
  const ref = createRef<HTMLTextAreaElement>()
  const mergedProps = { ...defaultProps, ...props }

  return (
    <>
      <textarea ref={ref} defaultValue={value} data-testid="target-textarea" />
      <AiAssistButton fieldRef={ref} {...mergedProps} />
    </>
  )
}

const createStreamResponse = (text: string) => ({
  ok: true,
  body: {
    getReader: () => ({
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode(text),
        })
        .mockResolvedValueOnce({ done: true, value: undefined }),
    }),
  },
})

/* ============================================================
   Tests
   ============================================================ */

describe('AiAssistButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the trigger button', () => {
    render(<TestWrapper />)
    expect(screen.getByTestId('ai-assist-button')).toBeInTheDocument()
  })

  it('opens the dialog when clicked', async () => {
    const user = userEvent.setup()
    render(<TestWrapper />)
    await user.click(screen.getByTestId('ai-assist-button'))
    expect(screen.getByText('AI Writing Assistant')).toBeInTheDocument()
  })

  it('shows Generate and Improve buttons in the dialog', async () => {
    const user = userEvent.setup()
    render(<TestWrapper />)
    await user.click(screen.getByTestId('ai-assist-button'))
    expect(screen.getByTestId('ai-generate-btn')).toBeInTheDocument()
    expect(screen.getByTestId('ai-improve-btn')).toBeInTheDocument()
  })

  it('shows tone selector', async () => {
    const user = userEvent.setup()
    render(<TestWrapper />)
    await user.click(screen.getByTestId('ai-assist-button'))
    expect(screen.getByTestId('tone-selector')).toBeInTheDocument()
    expect(screen.getByText('Professional')).toBeInTheDocument()
  })

  it('shows Cancel and Accept buttons in the dialog', async () => {
    const user = userEvent.setup()
    render(<TestWrapper />)
    await user.click(screen.getByTestId('ai-assist-button'))
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByTestId('ai-accept-btn')).toBeInTheDocument()
  })

  it('disables Accept button when there is no completion', async () => {
    const user = userEvent.setup()
    render(<TestWrapper />)
    await user.click(screen.getByTestId('ai-assist-button'))
    expect(screen.getByTestId('ai-accept-btn')).toBeDisabled()
  })

  it('disables Improve button when textarea is empty', async () => {
    const user = userEvent.setup()
    render(<TestWrapper value="" />)
    await user.click(screen.getByTestId('ai-assist-button'))
    expect(screen.getByTestId('ai-improve-btn')).toBeDisabled()
  })

  it('shows current text label when textarea has content', async () => {
    const user = userEvent.setup()
    render(<TestWrapper value="existing text here" />)
    await user.click(screen.getByTestId('ai-assist-button'))
    expect(screen.getAllByText('existing text here').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Current text')).toBeInTheDocument()
  })

  it('calls fetch with correct endpoint and tone when Generate is clicked', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue(createStreamResponse('AI response'))

    render(<TestWrapper />)
    await user.click(screen.getByTestId('ai-assist-button'))
    await user.click(screen.getByTestId('ai-generate-btn'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/ai/assist',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"tone":"professional"'),
        }),
      )
    })
  })

  it('shows error message when API returns an error', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'API key not configured' }),
    })

    render(<TestWrapper />)
    await user.click(screen.getByTestId('ai-assist-button'))
    await user.click(screen.getByTestId('ai-generate-btn'))

    await waitFor(() => {
      expect(screen.getByText('API key not configured')).toBeInTheDocument()
    })
  })

  it('closes the dialog when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<TestWrapper />)
    await user.click(screen.getByTestId('ai-assist-button'))
    expect(screen.getByText('AI Writing Assistant')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    await waitFor(() => {
      expect(screen.queryByText('AI Writing Assistant')).not.toBeInTheDocument()
    })
  })

  it('shows editable textarea after generation', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue(createStreamResponse('Generated content'))

    render(<TestWrapper />)
    await user.click(screen.getByTestId('ai-assist-button'))
    await user.click(screen.getByTestId('ai-generate-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('ai-output-editor')).toBeInTheDocument()
    })
  })

  it('shows regenerate button after generation', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue(createStreamResponse('Generated content'))

    render(<TestWrapper />)
    await user.click(screen.getByTestId('ai-assist-button'))
    await user.click(screen.getByTestId('ai-generate-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('ai-regenerate-btn')).toBeInTheDocument()
    })
  })

  it('shows refine input after generation', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue(createStreamResponse('Generated content'))

    render(<TestWrapper />)
    await user.click(screen.getByTestId('ai-assist-button'))
    await user.click(screen.getByTestId('ai-generate-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('ai-refine-input')).toBeInTheDocument()
    })
  })

  it('calls onAccept with edited text and closes dialog', async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn()
    mockFetch.mockResolvedValue(createStreamResponse('Generated content'))

    render(<TestWrapper onAccept={onAccept} />)
    await user.click(screen.getByTestId('ai-assist-button'))
    await user.click(screen.getByTestId('ai-generate-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('ai-accept-btn')).not.toBeDisabled()
    })

    // Edit the output
    const editor = screen.getByTestId('ai-output-editor')
    await user.clear(editor)
    await user.type(editor, 'Edited content')

    await user.click(screen.getByTestId('ai-accept-btn'))
    expect(onAccept).toHaveBeenCalledWith('Edited content')
  })

  it('sends refine request with user feedback', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(createStreamResponse('First draft'))
      .mockResolvedValueOnce(createStreamResponse('Refined version'))

    render(<TestWrapper />)
    await user.click(screen.getByTestId('ai-assist-button'))
    await user.click(screen.getByTestId('ai-generate-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('ai-refine-input')).toBeInTheDocument()
    })

    const refineInput = screen.getByTestId('ai-refine-input')
    await user.type(refineInput, 'Make it shorter')
    await user.click(screen.getByTestId('ai-refine-btn'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenLastCalledWith(
        '/api/ai/assist',
        expect.objectContaining({
          body: expect.stringContaining('Make it shorter'),
        }),
      )
    })
  })
})
