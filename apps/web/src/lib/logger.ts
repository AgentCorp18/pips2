export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const isValidLogLevel = (value: unknown): value is LogLevel =>
  typeof value === 'string' && value in LOG_LEVEL_PRIORITY

const getDefaultLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL
  return isValidLogLevel(envLevel) ? envLevel : 'info'
}

const isDev = process.env.NODE_ENV === 'development'

export type LogEntry = {
  level: LogLevel
  message: string
  timestamp: string
  [key: string]: unknown
}

const consoleMethod: Record<LogLevel, 'log' | 'warn' | 'error'> = {
  debug: 'log',
  info: 'log',
  warn: 'warn',
  error: 'error',
}

export const createLogger = (minLevel?: LogLevel) => {
  const threshold = LOG_LEVEL_PRIORITY[minLevel ?? getDefaultLevel()]

  const log = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
    if (LOG_LEVEL_PRIORITY[level] < threshold) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...context,
    }

    const method = consoleMethod[level]

    if (isDev) {
      const prefix = `[${entry.timestamp}] ${level.toUpperCase()}`
      const ctx = context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : ''
      console[method](`${prefix}: ${message}${ctx}`)
    } else {
      console[method](JSON.stringify(entry))
    }

    return entry
  }

  return {
    debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
    info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
    warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
    error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
  }
}

export const logger = createLogger()
