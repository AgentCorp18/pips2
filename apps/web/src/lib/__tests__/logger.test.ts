import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLogger, type LogEntry } from '../logger'

describe('createLogger', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('logs with the correct level', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const log = createLogger('debug')

    log.info('test message')

    expect(spy).toHaveBeenCalledOnce()
    const output = spy.mock.calls[0]?.[0] as string
    expect(output).toBeDefined()
  })

  it('includes a valid ISO timestamp in JSON output', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const log = createLogger('debug')

    const entry = log.info('timestamp check')

    expect(entry).toBeDefined()
    const parsed = entry as LogEntry
    expect(parsed.timestamp).toBeDefined()
    expect(new Date(parsed.timestamp).toISOString()).toBe(parsed.timestamp)
  })

  it('spreads context into the log entry', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const log = createLogger('debug')

    const entry = log.info('with context', { userId: '123', action: 'login' }) as LogEntry

    expect(entry.userId).toBe('123')
    expect(entry.action).toBe('login')
    expect(entry.level).toBe('info')
    expect(entry.message).toBe('with context')
  })

  it('suppresses debug messages when level is info', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const log = createLogger('info')

    const entry = log.debug('should be suppressed')

    expect(entry).toBeUndefined()
    expect(spy).not.toHaveBeenCalled()
  })

  it('allows warn and error when level is warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const log = createLogger('warn')

    log.info('suppressed')
    log.warn('visible warning')
    log.error('visible error')

    expect(logSpy).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledOnce()
    expect(errorSpy).toHaveBeenCalledOnce()
  })

  it('uses console.warn for warn level and console.error for error level', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const log = createLogger('debug')

    log.warn('a warning')
    log.error('an error')

    expect(warnSpy).toHaveBeenCalledOnce()
    expect(errorSpy).toHaveBeenCalledOnce()
  })

  it('returns the log entry object from each method', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const log = createLogger('debug')

    const debugEntry = log.debug('d') as LogEntry
    const infoEntry = log.info('i') as LogEntry
    const warnEntry = log.warn('w') as LogEntry
    const errorEntry = log.error('e') as LogEntry

    expect(debugEntry.level).toBe('debug')
    expect(infoEntry.level).toBe('info')
    expect(warnEntry.level).toBe('warn')
    expect(errorEntry.level).toBe('error')
  })
})
