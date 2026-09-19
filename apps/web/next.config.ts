import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'
import withBundleAnalyzer from '@next/bundle-analyzer'

const analyzeBundles = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Content-Security-Policy.
 *
 * script-src:
 * - 'unsafe-eval' is required by React Refresh in development only. It is
 *   dropped in production, where nothing in the bundle evaluates strings.
 * - 'unsafe-inline' is still present because Next.js emits inline bootstrap
 *   scripts and the theme bootstrap in app/layout.tsx runs inline. Removing it
 *   requires the nonce migration described below, which changes every rendered
 *   page and therefore wants a staged rollout rather than a silent flip:
 *     1. generate a per-request nonce in middleware and expose it as a request
 *        header, 2. read it in app/layout.tsx and pass it to the inline script
 *        (note this opts the layout into dynamic rendering), 3. emit the policy
 *        from middleware with 'nonce-<value>' and 'strict-dynamic',
 *        4. ship as Content-Security-Policy-Report-Only first and watch for
 *        violations, 5. enforce and delete 'unsafe-inline'.
 *
 * The remaining directives below are already at their strict values;
 * object-src, base-uri and form-action are pinned so an injected <base> or
 * <form> cannot redirect navigation or submissions off-origin.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline'",
    ...(isProduction ? [] : ["'unsafe-eval'"]),
    'https://va.vercel-scripts.com https://vercel.live',
  ].join(' '),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io https://vitals.vercel-insights.com https://va.vercel-scripts.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy,
  },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ]
  },
}

export default analyzeBundles(
  withSentryConfig(nextConfig, {
    // Sentry organization and project slugs (placeholders until configured)
    org: 'pips-app',
    project: 'pips-web',

    // Suppress Sentry build logs in CI output
    silent: true,

    // Disable source map upload until a valid DSN and auth token are set
    sourcemaps: {
      disable: true,
    },
  }),
)
