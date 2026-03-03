import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

// Only initialize Sentry when a DSN is configured
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',

    // Performance monitoring: sample 10% of transactions
    tracesSampleRate: 0.1,

    // Session Replay: disabled by default, capture 100% of sessions with errors
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    integrations: [Sentry.replayIntegration()],
  })
}
