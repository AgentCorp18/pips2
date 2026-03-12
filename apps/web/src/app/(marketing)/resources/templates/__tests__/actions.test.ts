import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Import after vi.mock declarations are hoisted
   ============================================================ */

import { requestTemplateDownload } from '../actions'
import type { TemplateDownloadState } from '../actions'

/* ============================================================
   Helpers
   ============================================================ */

const initialState: TemplateDownloadState = {
  success: false,
  error: null,
  templateId: null,
}

const makeFormData = (fields: Record<string, string>): FormData => {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value)
  }
  return fd
}

/* ============================================================
   requestTemplateDownload
   ============================================================ */

describe('requestTemplateDownload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  it('returns coming-soon error with valid email and templateId', async () => {
    const fd = makeFormData({
      email: 'user@example.com',
      templateId: 'tmpl-001',
    })

    const result = await requestTemplateDownload(initialState, fd)

    expect(result).toEqual({
      success: false,
      error: 'Template downloads are coming soon. Please check back later.',
      templateId: null,
    })
  })

  it('does not log anything when validation passes (feature not implemented)', async () => {
    const fd = makeFormData({
      email: 'user@example.com',
      templateId: 'tmpl-002',
    })

    await requestTemplateDownload(initialState, fd)

    expect(console.info).not.toHaveBeenCalled()
  })

  it('returns error for invalid email', async () => {
    const fd = makeFormData({
      email: 'not-an-email',
      templateId: 'tmpl-001',
    })

    const result = await requestTemplateDownload(initialState, fd)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Please enter a valid email address')
    expect(result.templateId).toBeNull()
  })

  it('returns error when email is missing', async () => {
    const fd = makeFormData({
      templateId: 'tmpl-001',
    })

    const result = await requestTemplateDownload(initialState, fd)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
    expect(result.templateId).toBeNull()
  })

  it('returns error when templateId is missing', async () => {
    const fd = makeFormData({
      email: 'user@example.com',
    })

    const result = await requestTemplateDownload(initialState, fd)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
    expect(result.templateId).toBeNull()
  })

  it('returns error when templateId is empty string', async () => {
    const fd = makeFormData({
      email: 'user@example.com',
      templateId: '',
    })

    const result = await requestTemplateDownload(initialState, fd)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Template ID is required')
    expect(result.templateId).toBeNull()
  })

  it('returns error when both fields are missing', async () => {
    const fd = new FormData()

    const result = await requestTemplateDownload(initialState, fd)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
    expect(result.templateId).toBeNull()
  })

  it('does not log when validation fails', async () => {
    const fd = makeFormData({
      email: 'bad',
      templateId: '',
    })

    await requestTemplateDownload(initialState, fd)

    expect(console.info).not.toHaveBeenCalled()
  })

  it('ignores _prevState parameter', async () => {
    const prevState: TemplateDownloadState = {
      success: true,
      error: 'old error',
      templateId: 'old-tmpl',
    }
    const fd = makeFormData({
      email: 'user@example.com',
      templateId: 'tmpl-new',
    })

    const result = await requestTemplateDownload(prevState, fd)

    expect(result).toEqual({
      success: false,
      error: 'Template downloads are coming soon. Please check back later.',
      templateId: null,
    })
  })
})
