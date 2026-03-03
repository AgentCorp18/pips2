import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

/* ============================================================
   cn() — class name merging utility
   ============================================================ */

describe('cn', () => {
  it('merges simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('returns empty string with no arguments', () => {
    expect(cn()).toBe('')
  })

  it('handles a single class name', () => {
    expect(cn('hello')).toBe('hello')
  })

  it('filters out falsy values', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar')
  })

  it('handles conditional class names via object syntax', () => {
    expect(cn({ 'bg-red': true, 'text-white': true, hidden: false })).toBe('bg-red text-white')
  })

  it('handles array inputs', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('merges conflicting Tailwind classes (last wins)', () => {
    const result = cn('px-2', 'px-4')
    expect(result).toBe('px-4')
  })

  it('merges conflicting Tailwind background classes', () => {
    const result = cn('bg-red-500', 'bg-blue-500')
    expect(result).toBe('bg-blue-500')
  })

  it('keeps non-conflicting Tailwind classes', () => {
    const result = cn('px-2', 'py-4', 'text-sm')
    expect(result).toBe('px-2 py-4 text-sm')
  })

  it('handles mix of strings, objects, and arrays', () => {
    const result = cn('base', { active: true, disabled: false }, ['extra'])
    expect(result).toBe('base active extra')
  })

  it('preserves non-Tailwind duplicate class names', () => {
    const result = cn('foo', 'foo')
    expect(result).toBe('foo foo')
  })

  it('resolves Tailwind variant conflicts (last wins)', () => {
    const result = cn('hover:bg-red-500', 'hover:bg-blue-500')
    expect(result).toBe('hover:bg-blue-500')
  })

  it('handles empty strings gracefully', () => {
    expect(cn('', 'foo', '', 'bar')).toBe('foo bar')
  })
})
