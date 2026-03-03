import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

const webRoot = path.resolve(__dirname, '../../..')

/**
 * Validates that Sentry config files exist and have the expected shape.
 * We read the file contents and check for required patterns rather than
 * importing them directly (which would trigger Sentry.init side effects).
 */
describe('Sentry configuration files', () => {
  const configFiles = [
    'sentry.client.config.ts',
    'sentry.server.config.ts',
    'sentry.edge.config.ts',
  ]

  for (const file of configFiles) {
    describe(file, () => {
      let content: string

      beforeEach(() => {
        content = fs.readFileSync(path.join(webRoot, file), 'utf-8')
      })

      it('exists and is readable', () => {
        expect(content).toBeTruthy()
      })

      it('imports from @sentry/nextjs', () => {
        expect(content).toContain("from '@sentry/nextjs'")
      })

      it('reads DSN from NEXT_PUBLIC_SENTRY_DSN env var', () => {
        expect(content).toContain('NEXT_PUBLIC_SENTRY_DSN')
      })

      it('guards init behind a DSN check', () => {
        // Ensure Sentry.init is only called when dsn is truthy
        expect(content).toMatch(/if\s*\(\s*dsn\s*\)/)
      })

      it('sets environment from NEXT_PUBLIC_VERCEL_ENV with development fallback', () => {
        expect(content).toContain("process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'")
      })

      it('configures tracesSampleRate at 0.1', () => {
        expect(content).toContain('tracesSampleRate: 0.1')
      })
    })
  }

  describe('sentry.client.config.ts (client-specific)', () => {
    let content: string

    beforeEach(() => {
      content = fs.readFileSync(path.join(webRoot, 'sentry.client.config.ts'), 'utf-8')
    })

    it('disables session replay by default', () => {
      expect(content).toContain('replaysSessionSampleRate: 0')
    })

    it('captures 100% of error replays', () => {
      expect(content).toContain('replaysOnErrorSampleRate: 1.0')
    })

    it('includes the replay integration', () => {
      expect(content).toContain('replayIntegration')
    })
  })
})

describe('Sentry instrumentation hook', () => {
  let content: string

  beforeEach(() => {
    content = fs.readFileSync(path.join(webRoot, 'src/instrumentation.ts'), 'utf-8')
  })

  it('exists and is readable', () => {
    expect(content).toBeTruthy()
  })

  it('exports a register function', () => {
    expect(content).toMatch(/export\s+(const|async\s+function)\s+register/)
  })

  it('exports an onRequestError handler', () => {
    expect(content).toMatch(/export\s+(const|async\s+function)\s+onRequestError/)
  })

  it('imports server config for nodejs runtime', () => {
    expect(content).toContain("NEXT_RUNTIME === 'nodejs'")
    expect(content).toContain('sentry.server.config')
  })

  it('imports edge config for edge runtime', () => {
    expect(content).toContain("NEXT_RUNTIME === 'edge'")
    expect(content).toContain('sentry.edge.config')
  })
})

describe('next.config.ts Sentry integration', () => {
  let content: string

  beforeEach(() => {
    content = fs.readFileSync(path.join(webRoot, 'next.config.ts'), 'utf-8')
  })

  it('imports withSentryConfig', () => {
    expect(content).toContain("import { withSentryConfig } from '@sentry/nextjs'")
  })

  it('wraps the config with withSentryConfig', () => {
    expect(content).toContain('withSentryConfig(nextConfig')
  })

  it('sets org and project placeholders', () => {
    expect(content).toContain("org: 'pips-app'")
    expect(content).toContain("project: 'pips-web'")
  })

  it('suppresses build logs', () => {
    expect(content).toContain('silent: true')
  })

  it('disables source map upload', () => {
    expect(content).toContain('disable: true')
  })
})

describe('global-error.tsx', () => {
  let content: string

  beforeEach(() => {
    content = fs.readFileSync(path.join(webRoot, 'src/app/global-error.tsx'), 'utf-8')
  })

  it('is a client component', () => {
    expect(content).toContain("'use client'")
  })

  it('imports Sentry for error reporting', () => {
    expect(content).toContain("from '@sentry/nextjs'")
  })

  it('calls Sentry.captureException', () => {
    expect(content).toContain('Sentry.captureException(error)')
  })

  it('provides a reset button', () => {
    expect(content).toContain('reset')
    expect(content).toContain('Try again')
  })
})

describe('.env.example', () => {
  let content: string

  beforeEach(() => {
    content = fs.readFileSync(path.join(webRoot, '.env.example'), 'utf-8')
  })

  it('includes NEXT_PUBLIC_SENTRY_DSN', () => {
    expect(content).toContain('NEXT_PUBLIC_SENTRY_DSN=')
  })

  it('includes SENTRY_AUTH_TOKEN', () => {
    expect(content).toContain('SENTRY_AUTH_TOKEN=')
  })
})

describe('Sentry is optional (no DSN)', () => {
  it('client config does not call init when DSN is empty', () => {
    const initMock = vi.fn()
    vi.doMock('@sentry/nextjs', () => ({
      init: initMock,
      replayIntegration: vi.fn(),
    }))

    // Simulate empty DSN — the config file checks `if (dsn)` before calling init
    // Since we cannot safely import the config (it has top-level side effects),
    // we verify the guard pattern exists
    const content = fs.readFileSync(path.join(webRoot, 'sentry.client.config.ts'), 'utf-8')

    // The init call is inside an `if (dsn)` block
    const dsnCheck = content.indexOf('if (dsn)')
    const initCall = content.indexOf('Sentry.init(')
    expect(dsnCheck).toBeGreaterThan(-1)
    expect(initCall).toBeGreaterThan(dsnCheck)

    vi.doUnmock('@sentry/nextjs')
  })
})
