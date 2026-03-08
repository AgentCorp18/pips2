import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.fn()

vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = { send: mockSend }
    },
  }
})

import { sendEmail } from '../send'

describe('sendEmail', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    mockSend.mockReset()
  })

  it('returns error when RESEND_API_KEY is not set', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
    })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Email service not configured')
  })

  it('sends email successfully when API key is set', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Test Body</p>',
    })
    expect(result.success).toBe(true)
    expect(result.id).toBe('msg-123')
  })

  it('accepts an array of recipients', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    mockSend.mockResolvedValue({ data: { id: 'msg-456' }, error: null })
    const result = await sendEmail({
      to: ['a@test.com', 'b@test.com'],
      subject: 'Test',
      html: '<p>Test</p>',
    })
    expect(result.success).toBe(true)
  })

  it('handles Resend API errors', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    mockSend.mockResolvedValue({ data: null, error: { message: 'Rate limited' } })
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
    })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Rate limited')
  })

  it('handles unexpected exceptions', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    mockSend.mockRejectedValue(new Error('Network error'))
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
    })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Network error')
  })
})
