import { describe, it, expect } from 'vitest'
import { formatTime } from '../use-workshop-realtime'

describe('formatTime', () => {
  it('formats 0 seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formats seconds under a minute', () => {
    expect(formatTime(45)).toBe('00:45')
  })

  it('formats exact minutes', () => {
    expect(formatTime(300)).toBe('05:00')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('02:05')
  })

  it('formats hours', () => {
    expect(formatTime(3661)).toBe('01:01:01')
  })

  it('formats large values', () => {
    expect(formatTime(7200)).toBe('02:00:00')
  })

  it('pads single digits', () => {
    expect(formatTime(61)).toBe('01:01')
  })

  it('handles 59 seconds', () => {
    expect(formatTime(59)).toBe('00:59')
  })

  it('handles 1 hour exactly', () => {
    expect(formatTime(3600)).toBe('01:00:00')
  })
})
