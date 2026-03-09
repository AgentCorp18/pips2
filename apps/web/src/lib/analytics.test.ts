import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockTrack = vi.fn()
const mockHeaders = vi.fn()

vi.mock('@vercel/analytics/server', () => ({
  track: (...args: unknown[]) => mockTrack(...args),
}))

vi.mock('next/headers', () => ({
  headers: () => mockHeaders(),
}))

import { trackServerEvent } from './analytics'

describe('trackServerEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls server track with event name and properties', async () => {
    const fakeHeaders = new Headers({ 'x-test': 'value' })
    mockHeaders.mockResolvedValue(fakeHeaders)
    mockTrack.mockResolvedValue(undefined)

    await trackServerEvent('test-event', { key: 'value' })

    expect(mockHeaders).toHaveBeenCalled()
    expect(mockTrack).toHaveBeenCalledWith('test-event', { key: 'value' }, { headers: fakeHeaders })
  })

  it('passes empty object when no properties provided', async () => {
    const fakeHeaders = new Headers()
    mockHeaders.mockResolvedValue(fakeHeaders)
    mockTrack.mockResolvedValue(undefined)

    await trackServerEvent('simple-event')

    expect(mockTrack).toHaveBeenCalledWith('simple-event', {}, { headers: fakeHeaders })
  })

  it('silently catches errors without throwing', async () => {
    mockHeaders.mockRejectedValue(new Error('headers failed'))

    await expect(trackServerEvent('fail-event')).resolves.toBeUndefined()
  })

  it('silently catches track errors', async () => {
    const fakeHeaders = new Headers()
    mockHeaders.mockResolvedValue(fakeHeaders)
    mockTrack.mockRejectedValue(new Error('track failed'))

    await expect(trackServerEvent('fail-event', { x: 1 })).resolves.toBeUndefined()
  })
})
