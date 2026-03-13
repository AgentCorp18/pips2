import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks
   ============================================================ */

const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

const mockStreamText = vi.fn()

vi.mock('ai', () => ({
  streamText: (...args: unknown[]) => mockStreamText(...args),
}))

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn((model: string) => ({ modelId: model })),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 9, resetAt: Date.now() + 60_000 })),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { POST } from './route'
import { checkRateLimit } from '@/lib/rate-limit'

/* ============================================================
   Helpers
   ============================================================ */

const makeRequest = (body: Record<string, unknown>) =>
  new Request('http://localhost/api/ai/assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

/* ============================================================
   Tests
   ============================================================ */

describe('POST /api/ai/assist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = 'test-key'
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    })
    mockStreamText.mockReturnValue({
      toTextStreamResponse: () => new Response('streamed text', { status: 200 }),
    })
  })

  it('returns 503 when ANTHROPIC_API_KEY is not set', async () => {
    delete process.env.ANTHROPIC_API_KEY
    const response = await POST(makeRequest({ prompt: 'test', fieldType: 'general' }))
    const body = await response.json()
    expect(response.status).toBe(503)
    expect(body.error).toContain('ANTHROPIC_API_KEY')
  })

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const response = await POST(makeRequest({ prompt: 'test', fieldType: 'general' }))
    const body = await response.json()
    expect(response.status).toBe(401)
    expect(body.error).toBe('Authentication required')
  })

  it('returns 400 for invalid JSON body', async () => {
    const request = new Request('http://localhost/api/ai/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    })
    const response = await POST(request)
    const body = await response.json()
    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid request body')
  })

  it('returns 400 when prompt is missing', async () => {
    const response = await POST(makeRequest({ fieldType: 'general' }))
    const body = await response.json()
    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid payload')
  })

  it('returns 400 when fieldType is missing', async () => {
    const response = await POST(makeRequest({ prompt: 'test' }))
    const body = await response.json()
    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid payload')
  })

  it('calls streamText with correct model and system prompt for problem_statement', async () => {
    await POST(makeRequest({ prompt: 'help me', fieldType: 'problem_statement', context: '' }))
    expect(mockStreamText).toHaveBeenCalledTimes(1)
    const args = mockStreamText.mock.calls[0]![0]
    expect(args.system).toContain('problem statement')
    expect(args.prompt).toBe('help me')
    expect(args.maxOutputTokens).toBe(1024)
  })

  it('includes context in system prompt when provided', async () => {
    await POST(makeRequest({ prompt: 'help me', fieldType: 'general', context: 'Project Alpha' }))
    const args = mockStreamText.mock.calls[0]![0]
    expect(args.system).toContain('Project Alpha')
  })

  it('falls back to general prompt for unknown fieldType', async () => {
    await POST(makeRequest({ prompt: 'test', fieldType: 'unknown_type', context: '' }))
    const args = mockStreamText.mock.calls[0]![0]
    expect(args.system).toContain('improve and expand')
  })

  it('returns a streaming response on success', async () => {
    const response = await POST(makeRequest({ prompt: 'test', fieldType: 'general', context: '' }))
    expect(response.status).toBe(200)
  })

  it('uses root_cause system prompt for root_cause fieldType', async () => {
    await POST(makeRequest({ prompt: 'help', fieldType: 'root_cause', context: '' }))
    const args = mockStreamText.mock.calls[0]![0]
    expect(args.system).toContain('5-Why')
  })

  it('uses solution system prompt for solution fieldType', async () => {
    await POST(makeRequest({ prompt: 'help', fieldType: 'solution', context: '' }))
    const args = mockStreamText.mock.calls[0]![0]
    expect(args.system).toContain('generate solutions')
  })

  it('uses lessons_learned system prompt for lessons_learned fieldType', async () => {
    await POST(makeRequest({ prompt: 'help', fieldType: 'lessons_learned', context: '' }))
    const args = mockStreamText.mock.calls[0]![0]
    expect(args.system).toContain('lessons learned')
  })

  it('includes tone instruction in system prompt', async () => {
    await POST(makeRequest({ prompt: 'test', fieldType: 'general', context: '', tone: 'concise' }))
    const args = mockStreamText.mock.calls[0]![0]
    expect(args.system).toContain('brief and to the point')
    expect(args.maxOutputTokens).toBe(512)
  })

  it('uses higher token limit for detailed tone', async () => {
    await POST(makeRequest({ prompt: 'test', fieldType: 'general', context: '', tone: 'detailed' }))
    const args = mockStreamText.mock.calls[0]![0]
    expect(args.system).toContain('thorough and comprehensive')
    expect(args.maxOutputTokens).toBe(2048)
  })

  it('defaults tone to professional when not specified', async () => {
    await POST(makeRequest({ prompt: 'test', fieldType: 'general', context: '' }))
    const args = mockStreamText.mock.calls[0]![0]
    expect(args.system).toContain('professional, business-appropriate')
  })

  it('includes plain text instruction in system prompt', async () => {
    await POST(makeRequest({ prompt: 'test', fieldType: 'general', context: '' }))
    const args = mockStreamText.mock.calls[0]![0]
    expect(args.system).toContain('plain text only')
  })

  it('returns 429 when rate limit is exceeded', async () => {
    vi.mocked(checkRateLimit).mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    })
    const response = await POST(makeRequest({ prompt: 'test', fieldType: 'general', context: '' }))
    const body = await response.json()
    expect(response.status).toBe(429)
    expect(body.error).toContain('Too many requests')
    expect(response.headers.get('Retry-After')).toBeTruthy()
  })
})
