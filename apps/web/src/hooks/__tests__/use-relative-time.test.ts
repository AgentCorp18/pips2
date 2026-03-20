import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRelativeTime } from '../use-relative-time'

/* ============================================================
   Tests — useRelativeTime
   ============================================================ */

describe('useRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty string when date is null', () => {
    const { result } = renderHook(() => useRelativeTime(null))
    expect(result.current).toBe('')
  })

  it('returns "just now" when saved less than 10 seconds ago', () => {
    const date = new Date()
    vi.setSystemTime(date.getTime() + 5000)
    const { result } = renderHook(() => useRelativeTime(date))
    expect(result.current).toBe('just now')
  })

  it('returns seconds when saved between 10 and 59 seconds ago', () => {
    const date = new Date()
    vi.setSystemTime(date.getTime() + 30000)
    const { result } = renderHook(() => useRelativeTime(date))
    expect(result.current).toBe('30 sec ago')
  })

  it('returns "1 min ago" when saved exactly 1 minute ago', () => {
    const date = new Date()
    vi.setSystemTime(date.getTime() + 60000)
    const { result } = renderHook(() => useRelativeTime(date))
    expect(result.current).toBe('1 min ago')
  })

  it('returns "N min ago" when saved 2-59 minutes ago', () => {
    const date = new Date()
    vi.setSystemTime(date.getTime() + 5 * 60 * 1000)
    const { result } = renderHook(() => useRelativeTime(date))
    expect(result.current).toBe('5 min ago')
  })

  it('returns "1 hour ago" when saved exactly 1 hour ago', () => {
    const date = new Date()
    vi.setSystemTime(date.getTime() + 60 * 60 * 1000)
    const { result } = renderHook(() => useRelativeTime(date))
    expect(result.current).toBe('1 hour ago')
  })

  it('returns "N hours ago" when saved 2+ hours ago', () => {
    const date = new Date()
    vi.setSystemTime(date.getTime() + 3 * 60 * 60 * 1000)
    const { result } = renderHook(() => useRelativeTime(date))
    expect(result.current).toBe('3 hours ago')
  })

  it('updates label after 30-second interval fires', () => {
    const date = new Date()
    // Start at 5 seconds after save (just now)
    vi.setSystemTime(date.getTime() + 5000)
    const { result } = renderHook(() => useRelativeTime(date))
    expect(result.current).toBe('just now')

    // Advance 30 seconds — interval fires, now 35 seconds after save
    act(() => {
      vi.advanceTimersByTime(30000)
    })
    expect(result.current).toBe('35 sec ago')
  })

  it('clears interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const date = new Date()
    const { unmount } = renderHook(() => useRelativeTime(date))
    unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('does not set interval when date is null', () => {
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
    renderHook(() => useRelativeTime(null))
    expect(setIntervalSpy).not.toHaveBeenCalled()
  })
})
