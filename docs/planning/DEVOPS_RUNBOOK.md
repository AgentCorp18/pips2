# PIPS 2.0 -- DevOps & Infrastructure Runbook

> **Version:** 1.0.0
> **Date:** 2026-03-02
> **Status:** Draft
> **Author:** Marc Albers + Claude
> **Companion doc:** `AGENT_COORDINATION_PLAN.md` (defines how agents use this infrastructure)

---

## Table of Contents

1. [Day-1 Setup Guide](#1-day-1-setup-guide)
2. [Environment Management](#2-environment-management)
3. [Database Operations](#3-database-operations)
4. [CI/CD Pipeline](#4-cicd-pipeline)
5. [Deployment Procedures](#5-deployment-procedures)
6. [Monitoring & Alerting](#6-monitoring--alerting)
7. [Security Operations](#7-security-operations)
8. [Performance Operations](#8-performance-operations)
9. [Operational Playbooks](#9-operational-playbooks)
10. [Agent-Specific Infrastructure](#10-agent-specific-infrastructure)
11. [Cost Management](#11-cost-management)

---

## 1. Day-1 Setup Guide

This section walks through every step required to go from zero to a working development environment with CI/CD, preview deployments, and production infrastructure. Follow these in order.

### 1.1 Repository Setup

#### Create GitHub Repository

```bash
# Create the private repo under the AlberaMarc org
gh repo create AlberaMarc/pips2 --private --description "PIPS 2.0 - Methodology-embedded project management SaaS" --clone
cd pips2
```

#### Initialize Monorepo with Turborepo + pnpm Workspaces

```bash
# Initialize pnpm
pnpm init

# Install Turborepo as a dev dependency
pnpm add -D turbo
```

Create `pnpm-workspace.yaml`:

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

Create `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "globalEnv": [
    "NODE_ENV",
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SENTRY_DSN",
    "NEXT_PUBLIC_APP_NAME"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test:unit": {
      "dependsOn": ["^build"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "cache": false
    },
    "clean": {
      "cache": false
    }
  }
}
```

Update root `package.json`:

```json
{
  "name": "pips2",
  "private": true,
  "packageManager": "pnpm@9.15.4",
  "engines": {
    "node": ">=22.0.0"
  },
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "lint:fix": "turbo lint -- --fix",
    "typecheck": "turbo typecheck",
    "test:unit": "turbo test:unit",
    "test:e2e": "turbo test:e2e",
    "clean": "turbo clean",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:reset": "supabase db reset",
    "db:migration:new": "supabase migration new",
    "db:push": "supabase db push",
    "db:lint": "supabase db lint",
    "db:types": "supabase gen types typescript --local > packages/shared/src/types/database.ts",
    "db:seed": "supabase db reset --seed-only",
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.1.0",
    "lint-staged": "^15.4.0",
    "prettier": "^3.4.0",
    "turbo": "^2.4.0"
  }
}
```

#### Create Directory Structure

```bash
# Create all directories
mkdir -p apps/web
mkdir -p packages/shared/src/types
mkdir -p packages/shared/src/utils
mkdir -p packages/shared/src/constants
mkdir -p supabase/migrations
mkdir -p supabase/functions
mkdir -p tests/e2e
mkdir -p tests/integration
mkdir -p .github/workflows
```

#### Configure ESLint + Prettier

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

Create `.prettierignore`:

```
node_modules
.next
.turbo
dist
coverage
playwright-report
supabase/.temp
pnpm-lock.yaml
```

Root `.eslintrc.json` (workspace root):

```json
{
  "root": true,
  "extends": ["eslint:recommended"],
  "ignorePatterns": ["node_modules/", ".next/", "dist/", ".turbo/", "coverage/"]
}
```

#### Set Up Husky + lint-staged

```bash
# Install husky
pnpm exec husky init

# The init command creates .husky/pre-commit
```

Update `.husky/pre-commit`:

```bash
pnpm exec lint-staged
```

Add `lint-staged` config to root `package.json` (add this key):

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md,yaml,yml}": ["prettier --write"],
    "supabase/migrations/*.sql": ["supabase db lint"]
  }
}
```

#### Create .gitignore

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build output
.next/
dist/
.turbo/
out/

# Testing
coverage/
playwright-report/
test-results/

# Environment
.env
.env.local
.env.*.local
!.env.example

# Supabase
supabase/.temp/
supabase/.branches/

# IDE
.vscode/settings.json
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Sentry
.sentryclirc

# Debug
npm-debug.log*
pnpm-debug.log*
```

#### Create .nvmrc

```
22
```

#### Create Initial CLAUDE.md

```markdown
# PIPS 2.0 - CLAUDE.md

## Section 0: Work Coordination Protocol

### Before Starting Any Work
1. Read `docs/planning/AGENT_COORDINATION_PLAN.md` for your assigned work item
2. Check `WORK_LOG.md` for current status and recent changes
3. Run `git pull origin develop` to get latest changes

### Work Item Lifecycle
1. Create branch: `agent/<work-item-id>-<short-description>`
2. Do the work in your worktree
3. Run full validation: `pnpm typecheck && pnpm lint && pnpm test:unit && pnpm build`
4. Commit with conventional commits: `feat(scope): description`
5. Push and create PR to `develop`
6. Update `WORK_LOG.md` with what you did

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: feat, fix, refactor, test, chore, docs, style, perf
Scopes: auth, tickets, projects, pips, teams, integrations, ui, db, api, ci

### Migration Naming Convention
`YYYYMMDDHHMMSS_<description>.sql`

Agents creating migrations must use timestamps at least 1 minute apart.
Check existing migrations before creating a new one:
```bash
ls supabase/migrations/
```

## Project Overview

- **App**: Multi-tenant SaaS for process improvement methodology (PIPS)
- **Stack**: Next.js 15 (App Router), Supabase, Stripe, Vercel
- **Language**: TypeScript strict mode
- **Monorepo**: Turborepo + pnpm workspaces
- **Testing**: Vitest (unit), Playwright (e2e)

## Code Style

- Functional components with arrow functions
- Named exports (not default exports)
- 2-space indentation
- Path aliases: `@/*` for `apps/web/src/*`
- Keep files under 200 lines
- Co-locate component + hook + types

## Architecture Rules

- Every database table MUST have RLS policies
- Every API route MUST validate input with Zod
- Every mutation MUST be audited (triggers handle this)
- All data is org-scoped via `org_id` column
- Server Components for data fetching; Client Components only for interactivity
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client

## Key Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build all packages
pnpm typecheck        # TypeScript check (tsc --noEmit)
pnpm lint             # ESLint
pnpm test:unit        # Vitest
pnpm test:e2e         # Playwright
pnpm db:start         # Start local Supabase
pnpm db:reset         # Reset local DB (replay all migrations + seed)
pnpm db:types         # Regenerate TypeScript types from schema
pnpm db:migration:new # Create new migration file
```

## Environment Variables

See `.env.example` for all required variables.
Copy to `.env.local` for local development.
Never commit `.env.local` or any file containing secrets.
```

#### First Commit

```bash
git add -A
git commit -m "chore: initialize monorepo with Turborepo + pnpm workspaces

- Root package.json with workspace scripts
- turbo.json pipeline configuration
- ESLint + Prettier config
- Husky + lint-staged pre-commit hooks
- Directory structure for apps/web, packages/shared, supabase, tests
- .gitignore, .nvmrc, CLAUDE.md
- pnpm-workspace.yaml"

git branch -M main
git push -u origin main
```

### 1.2 Next.js App Setup

```bash
cd apps/web

# Create Next.js app (in current directory)
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm

# Verify it works
pnpm dev
# Expected: Next.js 15 running at http://localhost:3000
```

#### Configure TypeScript (strict mode + path aliases)

Update `apps/web/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "~/*": ["../../*"]
    },
    "baseUrl": "."
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### Install Core Dependencies

```bash
cd apps/web

# UI Framework
pnpm add @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react

# State Management
pnpm add zustand

# Forms + Validation
pnpm add react-hook-form @hookform/resolvers zod

# Supabase
pnpm add @supabase/supabase-js @supabase/ssr

# Date utilities
pnpm add date-fns

# Dev dependencies
pnpm add -D @types/node
```

#### Install and Configure shadcn/ui

```bash
cd apps/web

pnpm dlx shadcn@latest init
```

When prompted, select:
- Style: **New York**
- Base color: **Zinc**
- CSS variables: **Yes**

This creates `components.json` and updates your Tailwind config. Then install commonly-needed components:

```bash
pnpm dlx shadcn@latest add button input label card dialog dropdown-menu select tabs toast avatar badge separator sheet skeleton table textarea tooltip popover command
```

#### Tailwind CSS Custom Config

Update `apps/web/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // PIPS step colors
        'pips-identify': '#ef4444',
        'pips-analyze': '#f97316',
        'pips-generate': '#eab308',
        'pips-select': '#22c55e',
        'pips-implement': '#3b82f6',
        'pips-evaluate': '#8b5cf6',
        // Brand colors (from org_settings, defaults here)
        brand: {
          primary: 'var(--brand-primary, #06b6d4)',
          secondary: 'var(--brand-secondary, #8b5cf6)',
        },
        // shadcn/ui colors (CSS variables)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

```bash
# Install the animation plugin
cd apps/web
pnpm add -D tailwindcss-animate
```

#### Configure next.config.ts

Create `apps/web/next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,

  // Transpile monorepo packages
  transpilePackages: ['@pips2/shared'],

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https://*.supabase.co",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://vitals.vercel-insights.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/login',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
```

#### apps/web/package.json Scripts

Add these scripts to the web app's `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:e2e": "playwright test",
    "clean": "rm -rf .next .turbo node_modules"
  }
}
```

#### Environment Variable Setup

Create `apps/web/.env.example`:

```bash
# ============================================================
# PIPS 2.0 Environment Variables
# ============================================================
# Copy this file to .env.local and fill in the values.
# NEVER commit .env.local to git.
# ============================================================

# --- App ---
# The public URL of the application (no trailing slash)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Display name shown in the UI and emails
NEXT_PUBLIC_APP_NAME=PIPS

# --- Supabase ---
# Found in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
# Service role key - NEVER expose to client. Server-side only.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# --- Stripe ---
# Found in: Stripe Dashboard > Developers > API keys
# Use test keys (sk_test_, pk_test_) for local/staging
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# Found in: Stripe Dashboard > Developers > Webhooks > Signing secret
STRIPE_WEBHOOK_SECRET=whsec_...

# --- Stripe Price IDs ---
# Created via Stripe Dashboard or API. See Section 1.5.
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_ANNUAL=price_...
STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_...
STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_ANNUAL=price_...

# --- Resend (Email) ---
# Found in: Resend Dashboard > API Keys
RESEND_API_KEY=re_...
# The "from" address for transactional emails
RESEND_FROM_EMAIL=noreply@yourdomain.com

# --- Sentry ---
# Found in: Sentry Dashboard > Project Settings > Client Keys (DSN)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
# Found in: Sentry Dashboard > Settings > Auth Tokens
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=pips2

# --- Upstash Redis (Rate Limiting) ---
# Found in: Upstash Console > Redis Database > REST API
UPSTASH_REDIS_URL=https://...upstash.io
UPSTASH_REDIS_TOKEN=...

# --- Vercel (set automatically in Vercel deployments) ---
# VERCEL_URL is auto-set by Vercel. Do not set locally.
# VERCEL_ENV is auto-set by Vercel (production/preview/development).
```

Copy to local:

```bash
cp apps/web/.env.example apps/web/.env.local
# Then edit .env.local with your actual values
```

#### Set Up Vitest

```bash
cd apps/web
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

Create `apps/web/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.d.ts', 'src/**/types.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Create `apps/web/src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest';
```

#### Set Up Playwright

```bash
cd apps/web
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps chromium
```

Create `apps/web/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../../tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm --filter @pips2/web dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
      },
});
```

### 1.3 Supabase Setup

#### Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Select your organization
4. Project name: `pips2-production` (for prod) or `pips2-staging` (for staging)
5. Database password: generate a strong one, store it in your password manager
6. Region: choose closest to your users (e.g., `us-east-1`)
7. Plan: **Pro** (required for PITR, branching, and connection pooling)

#### Install Supabase CLI

```bash
# Install globally
pnpm add -g supabase

# Verify
supabase --version
# Expected: 2.x.x

# Login to Supabase
supabase login
# This opens a browser to authenticate via the Supabase dashboard
```

#### Initialize Supabase Locally

```bash
# From the monorepo root
supabase init

# This creates supabase/config.toml
# Start local Supabase (requires Docker running)
supabase start

# Expected output:
# Started supabase local development setup.
#
#          API URL: http://127.0.0.1:54321
#      GraphQL URL: http://127.0.0.1:54321/graphql/v1
#   S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
#           DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
#       Studio URL: http://127.0.0.1:54323
#     Inbucket URL: http://127.0.0.1:54324
#       JWT secret: super-secret-jwt-token-with-at-least-32-characters
#         anon key: eyJ...
#   service_role key: eyJ...
```

Update `supabase/config.toml` with project-specific settings:

```toml
[project]
id = "your-project-ref"

[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

[studio]
enabled = true
port = 54323

[inbucket]
enabled = true
port = 54324

[storage]
enabled = true
file_size_limit = "50MiB"

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = [
  "http://localhost:3000/auth/callback",
  "https://*.vercel.app/auth/callback"
]

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[auth.external.google]
enabled = false

[auth.external.github]
enabled = false
```

#### Link to Remote Project

```bash
# Link local CLI to your remote Supabase project
supabase link --project-ref <your-project-ref>
# Enter your database password when prompted
```

#### Create Supabase Client Files

Create `apps/web/src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@pips2/shared/types/database';

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

Create `apps/web/src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@pips2/shared/types/database';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    },
  );
};
```

Create `apps/web/src/lib/supabase/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session - important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users from protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/(app)') ||
    request.nextUrl.pathname.match(/^\/[a-z0-9-]+\/(projects|tickets|teams|members|settings|integrations)/);

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
};
```

Create `apps/web/src/lib/supabase/service.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@pips2/shared/types/database';

// Service role client - bypasses RLS. Use ONLY in:
// - API routes that need admin access
// - Webhook handlers
// - Cron jobs / edge functions
// NEVER import this in client components or server components
export const createServiceClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
```

Create `apps/web/src/middleware.ts`:

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export const middleware = async (request: NextRequest) => {
  return await updateSession(request);
};

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

#### Create Initial Migration

```bash
supabase migration new initial_schema
```

This creates `supabase/migrations/YYYYMMDDHHMMSS_initial_schema.sql`. Paste the full schema SQL from the Technical Plan (sections 3.2 through 3.8 -- extensions, enums, tables, triggers, RLS policies, audit functions). The schema is already documented in `TECHNICAL_PLAN.md` sections 3.2-3.8.

#### Set Up Storage Buckets

Create `supabase/migrations/YYYYMMDDHHMMSS_storage_buckets.sql`:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('logos', 'logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']),
  ('attachments', 'attachments', false, 52428800, ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv', 'text/plain'
  ]),
  ('exports', 'exports', false, 104857600, ARRAY['application/zip', 'application/json', 'text/csv']);

-- Storage RLS policies
-- Avatars: public read, authenticated write for own avatar
CREATE POLICY "Public avatar read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Logos: public read, org admins can write
CREATE POLICY "Public logo read" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "Org admins can upload logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos'
    AND auth.uid() IS NOT NULL
  );

-- Attachments: org members can read, members can write
CREATE POLICY "Org members can read attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'attachments'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] IN (
      SELECT org_id::text FROM org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'attachments'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] IN (
      SELECT org_id::text FROM org_members WHERE user_id = auth.uid()
    )
  );

-- Exports: only the user who created the export can read it
CREATE POLICY "Users can read their own exports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'exports'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

#### Seed Data

Create `supabase/seed.sql`:

```sql
-- ============================================================
-- Development Seed Data
-- Run with: supabase db reset (applies migrations then seed)
-- ============================================================

-- Note: auth.users are created via Supabase Auth API, not direct SQL.
-- The seed assumes you'll create test users via the auth API or Supabase Studio.
-- After creating users, their profiles are auto-created by the trigger.

-- Example: After creating users via Auth, insert test org data:
-- (These UUIDs are placeholders -- replace after creating auth users)

-- INSERT INTO organizations (id, name, slug, plan, created_by, max_members)
-- VALUES (
--   'a0000000-0000-0000-0000-000000000001',
--   'Acme Corp',
--   'acme',
--   'professional',
--   '<user-uuid-here>',
--   50
-- );

-- For automated testing, use the Supabase service role to create auth users:
-- See tests/integration/helpers/seed.ts for programmatic seeding
```

#### Apply Migrations Locally

```bash
# Reset local database (drops all data, replays all migrations, runs seed)
supabase db reset

# Expected output:
# Resetting database...
# Applying migration 20260302XXXXXX_initial_schema.sql...
# Applying migration 20260302XXXXXX_storage_buckets.sql...
# Seeding data from supabase/seed.sql...
# Finished supabase db reset.
```

#### Generate TypeScript Types

```bash
# Generate types from local schema
supabase gen types typescript --local > packages/shared/src/types/database.ts

# Or from remote (linked project)
supabase gen types typescript --linked > packages/shared/src/types/database.ts
```

### 1.4 Vercel Setup

#### Connect GitHub Repo to Vercel

1. Go to https://vercel.com/new
2. Import the `AlberaMarc/pips2` repository
3. Framework preset: **Next.js**
4. Root directory: `apps/web`
5. Build command: `cd ../.. && pnpm turbo build --filter=@pips2/web`
6. Install command: `pnpm install --frozen-lockfile`
7. Output directory: `.next`

#### Configure Build Settings in Vercel Dashboard

Go to **Project Settings > General**:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Build Command | `cd ../.. && pnpm turbo build --filter=@pips2/web` |
| Install Command | `pnpm install --frozen-lockfile` |
| Node.js Version | 22.x |

#### Set Environment Variables in Vercel

Go to **Project Settings > Environment Variables** and add each variable from `.env.example`. Set them for the appropriate environments:

| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | `https://app.pips2.com` | `https://$VERCEL_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | prod URL | staging URL | `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod key | staging key | local key |
| `SUPABASE_SERVICE_ROLE_KEY` | prod key | staging key | local key |
| `STRIPE_SECRET_KEY` | `sk_live_...` | `sk_test_...` | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | `pk_test_...` | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | prod webhook | test webhook | test webhook |
| `RESEND_API_KEY` | prod key | test key | test key |
| `NEXT_PUBLIC_SENTRY_DSN` | prod DSN | same | same |
| `SENTRY_AUTH_TOKEN` | token | token | token |
| `UPSTASH_REDIS_URL` | prod URL | staging URL | staging URL |
| `UPSTASH_REDIS_TOKEN` | prod token | staging token | staging token |

#### Configure Preview Deployments

In **Project Settings > Git**:
- Enable **Automatic Preview Deployments** for all branches
- Enable **Comment on Pull Requests** (posts deployment URL as PR comment)

#### Set Up Custom Domain (When Ready)

```bash
# Via Vercel CLI
pnpm add -g vercel
vercel login

# Add custom domain
vercel domains add app.pips2.com

# Vercel will provide DNS records to configure:
# Type: CNAME
# Name: app
# Value: cname.vercel-dns.com

# Or for apex domain:
# Type: A
# Value: 76.76.21.21
```

#### Configure vercel.json (Optional)

Create `apps/web/vercel.json` if you need custom rewrites or headers beyond `next.config.ts`:

```json
{
  "framework": "nextjs",
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=@pips2/web"
}
```

### 1.5 Stripe Setup

#### Create Products and Prices

```bash
# Use the Stripe CLI or Dashboard.
# Install Stripe CLI if needed:
# https://docs.stripe.com/stripe-cli

# Login
stripe login

# Create products and prices for each tier

# --- Starter Plan ---
stripe products create \
  --name="PIPS Starter" \
  --description="For small teams getting started with structured improvement"

# Note the product ID (prod_...) from the output, then:
stripe prices create \
  --product=prod_STARTER_ID \
  --unit-amount=1200 \
  --currency=usd \
  --recurring[interval]=month \
  --nickname="Starter Monthly"

stripe prices create \
  --product=prod_STARTER_ID \
  --unit-amount=11520 \
  --currency=usd \
  --recurring[interval]=year \
  --nickname="Starter Annual"

# --- Professional Plan ---
stripe products create \
  --name="PIPS Professional" \
  --description="For growing teams with advanced PIPS features"

stripe prices create \
  --product=prod_PRO_ID \
  --unit-amount=2900 \
  --currency=usd \
  --recurring[interval]=month \
  --nickname="Professional Monthly"

stripe prices create \
  --product=prod_PRO_ID \
  --unit-amount=27840 \
  --currency=usd \
  --recurring[interval]=year \
  --nickname="Professional Annual"

# --- Enterprise Plan ---
stripe products create \
  --name="PIPS Enterprise" \
  --description="For large organizations with SSO, integrations, and white-label"

stripe prices create \
  --product=prod_ENT_ID \
  --unit-amount=4500 \
  --currency=usd \
  --recurring[interval]=month \
  --nickname="Enterprise Monthly"

stripe prices create \
  --product=prod_ENT_ID \
  --unit-amount=43200 \
  --currency=usd \
  --recurring[interval]=year \
  --nickname="Enterprise Annual"
```

Save the price IDs in your `.env.local`:

```bash
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_ANNUAL=price_...
STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_...
STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_ANNUAL=price_...
```

#### Set Up Webhook Endpoint

In **Stripe Dashboard > Developers > Webhooks**:

1. Click **Add endpoint**
2. Endpoint URL: `https://app.pips2.com/api/v1/webhooks/stripe`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.updated`
4. Copy the **Signing secret** (`whsec_...`) to your env vars

For local development, use the Stripe CLI to forward events:

```bash
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
# This prints a webhook signing secret (whsec_...) for local use
# Set STRIPE_WEBHOOK_SECRET in .env.local to this value
```

#### Configure Customer Portal

In **Stripe Dashboard > Settings > Billing > Customer portal**:

1. Enable the customer portal
2. Configure allowed actions:
   - Update payment method: **Enabled**
   - Cancel subscriptions: **Enabled** (with proration)
   - Switch plans: **Enabled** (upgrade and downgrade)
   - Update billing information: **Enabled**
   - View invoice history: **Enabled**
3. Set the return URL: `https://app.pips2.com/settings/billing`

#### Test Mode vs Live Mode

| Concern | Test Mode | Live Mode |
|---------|-----------|-----------|
| **API Keys** | `sk_test_...` / `pk_test_...` | `sk_live_...` / `pk_live_...` |
| **Used in** | Local dev, preview, staging | Production only |
| **Test cards** | `4242 4242 4242 4242` (success) | Real cards |
| **Webhook endpoint** | `localhost` via CLI forward | Production URL |
| **Dashboard toggle** | Top-left "Test mode" toggle | Same |

### 1.6 Monitoring Setup

#### Sentry Setup

```bash
cd apps/web

# Install Sentry SDK
pnpm add @sentry/nextjs

# Run the Sentry wizard (creates config files)
pnpm exec sentry-wizard --integration nextjs
```

The wizard creates:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Updates `next.config.ts` to wrap with `withSentryConfig`

Verify `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
  environment: process.env.VERCEL_ENV ?? 'development',
});
```

#### Error Boundary

Create `apps/web/src/components/error-boundary.tsx`:

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              An unexpected error occurred. Our team has been notified.
            </p>
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </body>
    </html>
  );
};
```

#### Vercel Analytics

```bash
cd apps/web
pnpm add @vercel/analytics @vercel/speed-insights
```

Add to root layout (`apps/web/src/app/layout.tsx`):

```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Inside the layout JSX:
// <Analytics />
// <SpeedInsights />
```

#### Uptime Monitoring

**Recommended**: Better Uptime (free tier available) or Vercel's built-in monitoring.

Configure health check URL: `https://app.pips2.com/api/v1/health`
Check interval: 60 seconds
Alert channels: Email + optional Slack webhook

### 1.7 Email Setup (Resend)

#### Account and API Key

1. Go to https://resend.com/signup
2. Create account and verify email
3. Go to **API Keys** > **Create API Key**
4. Name: `pips2-production`, Permission: **Full access**
5. Copy the key (`re_...`) to your env vars

#### Domain Verification

In **Resend Dashboard > Domains**:

1. Click **Add Domain**
2. Enter your domain (e.g., `pips2.com`)
3. Resend provides DNS records to add:
   - `TXT` record for SPF
   - `TXT` record for DKIM
   - `MX` record (optional, for receiving)
4. Add the records to your DNS provider
5. Click **Verify** in Resend dashboard

#### Install React Email

```bash
cd apps/web
pnpm add resend @react-email/components react-email
```

Create `apps/web/src/lib/email/resend.ts`:

```typescript
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  react,
}: {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}) => {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'PIPS <noreply@pips2.com>',
    to,
    subject,
    react,
  });

  if (error) {
    console.error('Email send failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
};
```

---

## 2. Environment Management

### 2.1 Complete Environment Variables Reference

| Variable | Description | Where to Get It | Environments |
|----------|-------------|-----------------|-------------|
| `NEXT_PUBLIC_APP_URL` | Public app URL (no trailing slash) | You define it | All |
| `NEXT_PUBLIC_APP_NAME` | App display name | You define it | All |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | Supabase Dashboard > Settings > API | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard > Settings > API | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) | Supabase Dashboard > Settings > API | Server only |
| `STRIPE_SECRET_KEY` | Stripe secret API key | Stripe Dashboard > Developers > API keys | Server only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Stripe Dashboard > Developers > API keys | All |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Stripe Dashboard > Developers > Webhooks | Server only |
| `STRIPE_PRICE_STARTER_MONTHLY` | Stripe price ID for Starter monthly | Stripe Dashboard > Products | Server only |
| `STRIPE_PRICE_STARTER_ANNUAL` | Stripe price ID for Starter annual | Stripe Dashboard > Products | Server only |
| `STRIPE_PRICE_PROFESSIONAL_MONTHLY` | Stripe price ID for Professional monthly | Stripe Dashboard > Products | Server only |
| `STRIPE_PRICE_PROFESSIONAL_ANNUAL` | Stripe price ID for Professional annual | Stripe Dashboard > Products | Server only |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | Stripe price ID for Enterprise monthly | Stripe Dashboard > Products | Server only |
| `STRIPE_PRICE_ENTERPRISE_ANNUAL` | Stripe price ID for Enterprise annual | Stripe Dashboard > Products | Server only |
| `RESEND_API_KEY` | Resend email API key | Resend Dashboard > API Keys | Server only |
| `RESEND_FROM_EMAIL` | "From" address for emails | Your verified domain | Server only |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry Data Source Name | Sentry > Project Settings > Client Keys | All |
| `SENTRY_AUTH_TOKEN` | Sentry auth token (for source maps) | Sentry > Settings > Auth Tokens | CI/CD only |
| `SENTRY_ORG` | Sentry organization slug | Sentry Dashboard URL | CI/CD only |
| `SENTRY_PROJECT` | Sentry project slug | Sentry Dashboard URL | CI/CD only |
| `UPSTASH_REDIS_URL` | Upstash Redis REST URL | Upstash Console > Database > REST API | Server only |
| `UPSTASH_REDIS_TOKEN` | Upstash Redis REST token | Upstash Console > Database > REST API | Server only |

### 2.2 Environment Strategy

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       ENVIRONMENT TOPOLOGY                                │
│                                                                           │
│  LOCAL DEV          PREVIEW/PR           STAGING           PRODUCTION    │
│  ──────────         ──────────           ───────           ──────────    │
│  localhost:3000     pr-123.vercel.app    staging.pips2.com app.pips2.com │
│  Supabase local     Supabase staging*    Supabase staging  Supabase prod │
│  Stripe test keys   Stripe test keys     Stripe test keys  Stripe live   │
│  Resend test        Resend test          Resend test       Resend prod   │
│  Sentry dev         Sentry staging       Sentry staging    Sentry prod   │
│                                                                           │
│  .env.local         Vercel env vars      Vercel env vars   Vercel env    │
│                     (Preview scope)      (Preview scope)   (Production)  │
│                                                                           │
│  * Preview deployments share the staging Supabase project.               │
│    Use Supabase branching for DB isolation when available.               │
└──────────────────────────────────────────────────────────────────────────┘
```

#### Local Development

- Config file: `apps/web/.env.local` (git-ignored)
- Database: Supabase local via Docker (`supabase start`)
- Stripe: Test mode keys, webhook forwarded via `stripe listen`
- Email: Inbucket (local email server at `http://127.0.0.1:54324`)
- Start everything:

```bash
# Terminal 1: Start Supabase
supabase start

# Terminal 2: Start Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe

# Terminal 3: Start dev server
pnpm dev
```

#### Preview / PR Deployments

- Every PR gets a Vercel preview deployment automatically
- URL format: `pips2-<hash>-alberamarcs-projects.vercel.app`
- Uses staging Supabase project (shared database)
- Stripe test keys
- Vercel posts deployment URL as a PR comment

#### Staging

- Dedicated Vercel deployment on the `develop` branch
- Uses staging Supabase project
- Stripe test keys
- Used for QA validation before production
- Custom domain: `staging.pips2.com` (when ready)

#### Production

- Deployed from `main` branch on Vercel
- Uses production Supabase project
- Stripe live keys
- Custom domain: `app.pips2.com`
- Sentry release tracking enabled

#### Secrets Management

| Where | What | Rotation |
|-------|------|----------|
| **Vercel Environment Variables** | All env vars per environment | Quarterly or on compromise |
| **GitHub Secrets** | `VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`, `SENTRY_AUTH_TOKEN` | Quarterly |
| **Supabase Dashboard** | Database password, service role key | On compromise only (regenerate via dashboard) |
| **Stripe Dashboard** | API keys, webhook secrets | On compromise (roll keys in dashboard) |
| **Local `.env.local`** | Developer's local copy of all vars | As needed |

Key rotation procedure:

```bash
# 1. Generate new key in the service dashboard
# 2. Update Vercel env vars (all environments that use it)
# 3. Trigger a redeployment
vercel --prod
# 4. Verify the deployment works
# 5. Revoke the old key in the service dashboard
# 6. Update .env.local for local dev
```

---

## 3. Database Operations

### 3.1 Migration Strategy

#### File Naming Convention

```
supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

Examples:
- `20260302120000_initial_schema.sql`
- `20260302120100_storage_buckets.sql`
- `20260305093000_add_ticket_labels.sql`

The timestamp prefix ensures correct ordering. The Supabase CLI generates this automatically:

```bash
supabase migration new add_ticket_labels
# Creates: supabase/migrations/20260302XXXXXX_add_ticket_labels.sql
```

#### Creating a New Migration

```bash
# Step 1: Create the migration file
supabase migration new <description>

# Step 2: Edit the generated SQL file
# Add your DDL statements, RLS policies, indexes

# Step 3: Test locally
supabase db reset          # Replays ALL migrations from scratch
supabase db lint           # Check for common issues

# Step 4: Regenerate TypeScript types
pnpm db:types

# Step 5: Commit the migration + updated types
git add supabase/migrations/ packages/shared/src/types/database.ts
git commit -m "feat(db): add ticket labels table"
```

#### Applying Migrations

```bash
# LOCAL: Reset replays all migrations + seed
supabase db reset

# STAGING/PRODUCTION: Push new migrations to linked project
supabase db push

# DRY RUN (see what would be applied without applying)
supabase db push --dry-run
```

#### Migration Review Checklist

Before merging any migration PR, verify:

- [ ] **RLS policies included**: Every new table has `ENABLE ROW LEVEL SECURITY` and at least SELECT/INSERT/UPDATE/DELETE policies
- [ ] **Indexes added**: Any column used in WHERE, JOIN, or ORDER BY has an index
- [ ] **Backward compatible**: No dropped columns, no renamed columns, no changed types without a migration path
- [ ] **Nullable new columns**: New columns added to existing tables are `NULL`able or have a `DEFAULT`
- [ ] **No data loss**: UPDATE/DELETE statements include WHERE clauses
- [ ] **Tested locally**: `supabase db reset` succeeds with the new migration
- [ ] **Types regenerated**: `packages/shared/src/types/database.ts` is updated

#### Rollback Procedures

Supabase migrations are forward-only. To "undo" a migration:

```bash
# Create a new migration that reverses the changes
supabase migration new revert_ticket_labels

# In the new file, write the reverse SQL:
# DROP TABLE IF EXISTS ticket_labels;
# DROP INDEX IF EXISTS idx_...;

# Apply
supabase db reset  # local
supabase db push   # remote
```

For emergency production rollbacks, use Supabase's Point-in-Time Recovery (PITR):

1. Go to **Supabase Dashboard > Database > Backups**
2. Select **Point in Time Recovery**
3. Choose a timestamp before the bad migration
4. This restores the entire database to that point

**Warning**: PITR is destructive -- it reverts ALL changes since the selected timestamp, not just the migration.

#### Agent Coordination for Migrations

When multiple agents create migrations in parallel:

1. **Timestamp isolation**: Each agent must check existing migration timestamps before creating a new one. Leave at least 60 seconds between timestamps.
2. **No overlapping tables**: Two agents should never modify the same table in concurrent migrations. Coordinate via the Agent Coordination Plan.
3. **Conflict resolution**: If two migrations touch the same table, one must be rebased. The later-merged PR must update its migration timestamp and ensure it applies cleanly after the earlier one.

```bash
# Check existing migrations before creating a new one
ls -la supabase/migrations/

# If another agent's migration exists with a close timestamp,
# wait or use a later timestamp:
supabase migration new my_change
# Then manually rename the file if needed to ensure ordering
```

### 3.2 Seed Data

#### Development Seed Strategy

The seed script (`supabase/seed.sql`) creates a realistic development dataset. Since Supabase auth users cannot be created via SQL directly, seeding uses a two-step process:

Create `tests/integration/helpers/seed.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role for admin operations
);

export const seedDevData = async () => {
  // 1. Create test users via auth API
  const users = [
    { email: 'admin@acme-test.com', password: 'Test1234!', name: 'Alice Admin' },
    { email: 'manager@acme-test.com', password: 'Test1234!', name: 'Bob Manager' },
    { email: 'member@acme-test.com', password: 'Test1234!', name: 'Carol Member' },
    { email: 'viewer@acme-test.com', password: 'Test1234!', name: 'Dave Viewer' },
  ];

  const createdUsers = [];
  for (const user of users) {
    const { data } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.name },
    });
    if (data.user) createdUsers.push(data.user);
  }

  // 2. Create test organization
  const { data: org } = await supabase
    .from('organizations')
    .insert({
      name: 'Acme Test Corp',
      slug: 'acme-test',
      plan: 'professional',
      created_by: createdUsers[0].id,
      max_members: 50,
    })
    .select()
    .single();

  // 3. Add members with roles
  const roles = ['owner', 'admin', 'member', 'viewer'] as const;
  for (let i = 0; i < createdUsers.length; i++) {
    await supabase.from('org_members').insert({
      org_id: org!.id,
      user_id: createdUsers[i].id,
      role: roles[i],
    });
  }

  // 4. Create org settings
  await supabase.from('org_settings').insert({
    org_id: org!.id,
    primary_color: '#06b6d4',
    secondary_color: '#8b5cf6',
  });

  // 5. Create a sample team
  const { data: team } = await supabase
    .from('teams')
    .insert({
      org_id: org!.id,
      name: 'Quality Team',
      created_by: createdUsers[0].id,
    })
    .select()
    .single();

  // 6. Create a sample PIPS project
  await supabase.from('projects').insert({
    org_id: org!.id,
    title: 'Reduce Customer Complaint Response Time',
    description: 'Customer complaints are taking an average of 72 hours to resolve. Target is 24 hours.',
    status: 'active',
    current_step: 'analyze',
    owner_id: createdUsers[1].id,
    team_id: team!.id,
    problem_statement: 'Customer complaint response time averages 72 hours, exceeding our 24-hour SLA.',
    priority: 'high',
  });

  console.log('Seed data created successfully');
  console.log('Test accounts:');
  users.forEach((u) => console.log(`  ${u.email} / ${u.password} (${u.name})`));
};
```

#### Reset to Clean State

```bash
# Full reset: drop everything, replay migrations, run seed
supabase db reset

# Seed only (keep current schema, re-run seed data)
supabase db reset --seed-only
```

### 3.3 Backup & Recovery

#### Supabase Automatic Backups

| Plan | Backup Frequency | Retention | PITR |
|------|-----------------|-----------|------|
| Free | Daily | 7 days | No |
| Pro | Daily | 7 days | Yes (7 days) |
| Team | Daily | 14 days | Yes (14 days) |
| Enterprise | Daily | 30 days | Yes (30 days) |

**Recommendation**: Use Pro plan minimum. Enable PITR for production.

#### Manual Backup

```bash
# Dump the remote database
supabase db dump --linked > backups/pips2_$(date +%Y%m%d_%H%M%S).sql

# Dump data only (no schema)
supabase db dump --linked --data-only > backups/pips2_data_$(date +%Y%m%d_%H%M%S).sql

# Dump specific schema
pg_dump "$DATABASE_URL" --schema=public --no-owner > backups/schema_backup.sql
```

#### Point-in-Time Recovery Procedure

1. Go to **Supabase Dashboard > Database > Backups > Point in Time**
2. Select the target recovery time
3. Click **Restore** -- this creates a new database branch
4. Verify data integrity in the restored branch
5. If correct, promote the branch to production
6. Update Vercel env vars if the connection string changed
7. Trigger a Vercel redeployment

#### Recovery Time Objectives

| Metric | Target | How |
|--------|--------|-----|
| **RPO** (Recovery Point Objective) | 5 minutes | PITR with WAL archiving |
| **RTO** (Recovery Time Objective) | 1 hour | Restore from backup + redeploy |
| **MTTR** (Mean Time to Recover) | 30 minutes | Automated health checks + runbook |

### 3.4 Database Monitoring

#### Query Performance

Monitor via **Supabase Dashboard > Database > Query Performance**:

- Watch for queries exceeding 100ms
- Check for sequential scans on large tables (missing indexes)
- Review connection count (stay below pooler limit)

#### Connection Pool Monitoring

Supabase uses PgBouncer for connection pooling:

```bash
# Check current connections (via Supabase SQL editor)
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
SELECT count(*) FROM pg_stat_activity WHERE state = 'idle';
```

Limits by plan:
- Free: 20 direct, 200 pooled
- Pro: 60 direct, 400 pooled
- Team: 100 direct, 600 pooled

#### Storage Usage Alerts

Set up alerts in Supabase Dashboard > Database > Disk usage.
Pro plan includes 8GB; alert at 6GB (75%).

---

## 4. CI/CD Pipeline

### 4.1 GitHub Actions Workflows

#### ci.yml -- Runs on Every PR

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '22'
  PNPM_VERSION: '9'

jobs:
  install:
    name: Install Dependencies
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - uses: actions/cache/save@v4
        with:
          path: |
            node_modules
            apps/*/node_modules
            packages/*/node_modules
          key: modules-${{ hashFiles('pnpm-lock.yaml') }}

  typecheck:
    name: TypeScript Check
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - uses: actions/cache/restore@v4
        with:
          path: |
            node_modules
            apps/*/node_modules
            packages/*/node_modules
          key: modules-${{ hashFiles('pnpm-lock.yaml') }}
      - run: pnpm typecheck

  lint:
    name: Lint
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - uses: actions/cache/restore@v4
        with:
          path: |
            node_modules
            apps/*/node_modules
            packages/*/node_modules
          key: modules-${{ hashFiles('pnpm-lock.yaml') }}
      - run: pnpm lint
      - run: pnpm format:check

  test:
    name: Unit Tests
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - uses: actions/cache/restore@v4
        with:
          path: |
            node_modules
            apps/*/node_modules
            packages/*/node_modules
          key: modules-${{ hashFiles('pnpm-lock.yaml') }}
      - run: pnpm test:unit -- --coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: apps/web/coverage/
          retention-days: 14

  build:
    name: Build
    needs: [typecheck, lint]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - uses: actions/cache/restore@v4
        with:
          path: |
            node_modules
            apps/*/node_modules
            packages/*/node_modules
          key: modules-${{ hashFiles('pnpm-lock.yaml') }}
      - run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_test_placeholder
          NEXT_PUBLIC_SENTRY_DSN: https://placeholder@sentry.io/0
          NEXT_PUBLIC_APP_URL: https://placeholder.vercel.app
          NEXT_PUBLIC_APP_NAME: PIPS

  migration-check:
    name: Migration Check
    if: contains(github.event.pull_request.labels.*.name, 'database') || github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - run: supabase db lint
      - run: supabase init
      - run: supabase db start
      - run: supabase db reset
        env:
          SUPABASE_DB_PORT: 54322

  bundle-size:
    name: Bundle Size Check
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - uses: actions/cache/restore@v4
        with:
          path: |
            node_modules
            apps/*/node_modules
            packages/*/node_modules
          key: modules-${{ hashFiles('pnpm-lock.yaml') }}
      - run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_test_placeholder
          NEXT_PUBLIC_SENTRY_DSN: https://placeholder@sentry.io/0
          NEXT_PUBLIC_APP_URL: https://placeholder.vercel.app
          NEXT_PUBLIC_APP_NAME: PIPS
          ANALYZE: true
      - name: Check bundle size
        run: |
          # Check if the initial JS bundle exceeds 200KB
          BUNDLE_SIZE=$(du -sb apps/web/.next/static/chunks/ | cut -f1)
          MAX_SIZE=204800  # 200KB in bytes
          echo "Bundle size: $BUNDLE_SIZE bytes (max: $MAX_SIZE)"
          if [ "$BUNDLE_SIZE" -gt "$MAX_SIZE" ]; then
            echo "::warning::Bundle size ($BUNDLE_SIZE bytes) exceeds budget ($MAX_SIZE bytes)"
          fi
```

#### e2e.yml -- E2E Tests on PRs to Main

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  pull_request:
    branches: [main]

concurrency:
  group: e2e-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '22'
  PNPM_VERSION: '9'

jobs:
  e2e:
    name: Playwright E2E
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Start Supabase
        uses: supabase/setup-cli@v1
        with:
          version: latest
      - run: supabase start

      - name: Build application
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.LOCAL_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_test_placeholder
          NEXT_PUBLIC_SENTRY_DSN: ''
          NEXT_PUBLIC_APP_URL: http://localhost:3000
          NEXT_PUBLIC_APP_NAME: PIPS

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000
          NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.LOCAL_SUPABASE_SERVICE_KEY }}

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

#### deploy-production.yml -- Production Deployment

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

concurrency:
  group: deploy-production
  cancel-in-progress: false  # Never cancel a production deploy mid-flight

env:
  NODE_VERSION: '22'
  PNPM_VERSION: '9'

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      # Run database migrations BEFORE deploying new code
      - name: Apply database migrations
        uses: supabase/setup-cli@v1
        with:
          version: latest
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      - run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}

      # Vercel handles the actual deployment via Git integration
      # This step verifies the deployment succeeded
      - name: Wait for Vercel deployment
        run: |
          echo "Vercel deploys automatically on push to main."
          echo "Check https://vercel.com/alberamarcs-projects/pips2/deployments for status."

      # Create Sentry release
      - name: Create Sentry Release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
        with:
          environment: production
          version: ${{ github.sha }}

  smoke-test:
    name: Post-Deploy Smoke Test
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - name: Health check
        run: |
          for i in 1 2 3 4 5; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://app.pips2.com/api/v1/health)
            if [ "$STATUS" = "200" ]; then
              echo "Health check passed (attempt $i)"
              exit 0
            fi
            echo "Health check returned $STATUS (attempt $i/5), retrying in 30s..."
            sleep 30
          done
          echo "Health check failed after 5 attempts"
          exit 1
```

#### migration-check.yml -- Validates SQL Migrations

```yaml
# .github/workflows/migration-check.yml
name: Migration Validation

on:
  pull_request:
    paths:
      - 'supabase/migrations/**'

jobs:
  validate:
    name: Validate Migrations
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Start local Supabase
        run: |
          supabase start
          supabase db reset

      - name: Lint migrations
        run: supabase db lint

      - name: Check RLS policies
        run: |
          # Verify all public tables have RLS enabled
          TABLES_WITHOUT_RLS=$(supabase db execute --local "
            SELECT schemaname || '.' || tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename NOT IN ('schema_migrations')
            AND tablename NOT IN (
              SELECT tablename FROM pg_tables t
              JOIN pg_class c ON c.relname = t.tablename
              WHERE c.relrowsecurity = true
            );
          ")
          if [ -n "$TABLES_WITHOUT_RLS" ]; then
            echo "::error::Tables without RLS: $TABLES_WITHOUT_RLS"
            exit 1
          fi
          echo "All public tables have RLS enabled."

      - name: Check for breaking changes
        run: |
          # Compare new migrations against the base branch
          git diff origin/${{ github.base_ref }}..HEAD -- supabase/migrations/ | \
            grep -E "^(\+.*(DROP|ALTER.*DROP|ALTER.*TYPE|ALTER.*RENAME))" && \
            echo "::warning::Potentially breaking migration detected. Review carefully." || \
            echo "No breaking changes detected."
```

### 4.2 Branch Strategy

```
main (protected)
  │
  ├── develop (integration branch)
  │     │
  │     ├── feature/auth-signup
  │     ├── feature/ticket-board
  │     ├── agent/WI-001-pips-step-forms
  │     ├── agent/WI-002-ticket-api
  │     ├── fix/login-redirect
  │     └── chore/update-dependencies
  │
  └── hotfix/critical-auth-bug (branches from main, merges to main + develop)
```

**Branch protection rules** (configure in GitHub > Settings > Branches):

`main`:
- Require pull request reviews: 1 approval
- Require status checks: `typecheck`, `lint`, `test`, `build`
- Require branches to be up to date before merging
- Do not allow force pushes
- Do not allow deletions

`develop`:
- Require status checks: `typecheck`, `lint`, `test`, `build`
- Allow force pushes: No
- Allow deletions: No

### 4.3 PR Automation

#### PR Template

Create `.github/pull_request_template.md`:

```markdown
## Summary

<!-- Brief description of what this PR does -->

## Type

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Test
- [ ] Chore
- [ ] Database migration

## Changes

<!-- Bulleted list of specific changes -->

## Testing

- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] E2E tests added (if user-facing)

## Database

- [ ] No database changes
- [ ] Migration included (reviewed for RLS, indexes, backward compatibility)
- [ ] Types regenerated (`pnpm db:types`)

## Checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test:unit` passes
- [ ] `pnpm build` succeeds
- [ ] No sensitive data in diff (secrets, PII)
```

#### Auto-Labeling

Create `.github/labeler.yml`:

```yaml
database:
  - changed-files:
    - any-glob-to-any-file: 'supabase/migrations/**'

frontend:
  - changed-files:
    - any-glob-to-any-file: 'apps/web/src/components/**'
    - any-glob-to-any-file: 'apps/web/src/app/**'

api:
  - changed-files:
    - any-glob-to-any-file: 'apps/web/src/app/api/**'

ci:
  - changed-files:
    - any-glob-to-any-file: '.github/workflows/**'

deps:
  - changed-files:
    - any-glob-to-any-file: '**/package.json'
    - any-glob-to-any-file: 'pnpm-lock.yaml'

tests:
  - changed-files:
    - any-glob-to-any-file: '**/*.test.{ts,tsx}'
    - any-glob-to-any-file: '**/*.spec.{ts,tsx}'
    - any-glob-to-any-file: 'tests/**'
```

Create `.github/workflows/labeler.yml`:

```yaml
name: PR Labeler

on:
  pull_request_target:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/labeler@v5
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## 5. Deployment Procedures

### 5.1 Standard Deployment (Feature)

```
1. Developer creates PR from feature/* or agent/* to develop
   └── CI runs: typecheck, lint, test, build
   └── Vercel creates preview deployment
   └── PR review

2. PR approved and merged to develop
   └── Vercel auto-deploys to staging
   └── Verify on staging.pips2.com

3. Create PR from develop to main
   └── E2E tests run against preview
   └── Final review

4. PR merged to main
   └── deploy-production.yml runs:
       ├── Database migrations applied
       ├── Vercel deploys to production
       ├── Sentry release created
       └── Smoke test runs

5. Post-deploy verification
   └── Check https://app.pips2.com/api/v1/health
   └── Check Sentry for new errors
   └── Check Vercel Analytics for anomalies
```

### 5.2 Hotfix Deployment

For critical production issues that cannot wait for the normal flow:

```bash
# 1. Branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-auth-bug

# 2. Make the fix, test locally
# ... fix code ...
pnpm typecheck && pnpm lint && pnpm test:unit

# 3. Push and create PR directly to main
git push -u origin hotfix/critical-auth-bug
gh pr create --base main --title "fix(auth): resolve critical login failure" \
  --body "Emergency hotfix for production login failure. Backport to develop required."

# 4. Get expedited review (1 approval still required)

# 5. Merge to main (auto-deploys to production)

# 6. Backport to develop
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

### 5.3 Database Migration Deployment

**Pre-deployment checklist:**

- [ ] Migration tested locally with `supabase db reset`
- [ ] Migration tested with production-like data volume
- [ ] Rollback migration prepared (in case of failure)
- [ ] Application code compatible with both old and new schema
- [ ] Deployment window communicated (if breaking change)

**Execution:**

```bash
# 1. Link to the target project
supabase link --project-ref <project-ref>

# 2. Dry run to see what will be applied
supabase db push --dry-run

# 3. Apply the migration
supabase db push

# 4. Verify with a spot-check query
supabase db execute --linked "SELECT count(*) FROM <new_table>;"
```

### 5.4 Rollback Procedures

#### Application Rollback (Vercel)

Vercel supports instant rollback to any previous deployment:

1. Go to **Vercel Dashboard > Deployments**
2. Find the last known-good deployment
3. Click the three-dot menu > **Promote to Production**
4. The rollback is instant (no rebuild needed)

```bash
# Or via CLI:
vercel rollback
```

#### Database Rollback

Option A: **Reverse migration** (preferred for simple changes)
```bash
supabase migration new revert_bad_change
# Write reverse SQL
supabase db push
```

Option B: **Point-in-Time Recovery** (for complex/data-loss scenarios)
1. Supabase Dashboard > Database > Backups > Point in Time
2. Select timestamp before the bad migration
3. Restore
4. Update env vars if connection string changed
5. Redeploy application

#### Full Rollback (App + Database)

1. Rollback the database first (reverse migration or PITR)
2. Rollback the application on Vercel
3. Verify health check passes
4. Monitor Sentry for errors
5. Communicate status to stakeholders

**Outage Communication Template:**

```
Subject: [PIPS 2.0] Service Disruption - [Date]

Status: [Investigating / Identified / Resolved]

What happened:
[Brief description]

Impact:
[Who was affected and how]

Timeline:
- HH:MM UTC - Issue detected
- HH:MM UTC - Root cause identified
- HH:MM UTC - Fix deployed
- HH:MM UTC - Service restored

Root cause:
[Technical explanation]

Next steps:
[Preventive measures]
```

---

## 6. Monitoring & Alerting

### 6.1 Health Checks

Create `apps/web/src/app/api/v1/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

type HealthStatus = {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: { status: string; latency_ms: number };
    supabase_auth: { status: string };
    stripe: { status: string };
    resend: { status: string };
  };
};

export const GET = async () => {
  const checks: HealthStatus['checks'] = {
    database: { status: 'unknown', latency_ms: 0 },
    supabase_auth: { status: 'unknown' },
    stripe: { status: 'unknown' },
    resend: { status: 'unknown' },
  };

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // Database check
  try {
    const start = Date.now();
    const supabase = createServiceClient();
    const { error } = await supabase.from('organizations').select('id').limit(1);
    checks.database = {
      status: error ? 'error' : 'ok',
      latency_ms: Date.now() - start,
    };
    if (error) overallStatus = 'degraded';
  } catch {
    checks.database = { status: 'error', latency_ms: -1 };
    overallStatus = 'unhealthy';
  }

  // Supabase Auth check
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    checks.supabase_auth = { status: error ? 'error' : 'ok' };
    if (error) overallStatus = 'degraded';
  } catch {
    checks.supabase_auth = { status: 'error' };
    overallStatus = 'degraded';
  }

  // Stripe check (lightweight)
  try {
    const res = await fetch('https://api.stripe.com/v1/balance', {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    });
    checks.stripe = { status: res.ok ? 'ok' : 'error' };
    if (!res.ok) overallStatus = 'degraded';
  } catch {
    checks.stripe = { status: 'error' };
    overallStatus = 'degraded';
  }

  // Resend check (lightweight)
  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    });
    checks.resend = { status: res.ok ? 'ok' : 'error' };
    if (!res.ok) overallStatus = 'degraded';
  } catch {
    checks.resend = { status: 'error' };
    overallStatus = 'degraded';
  }

  const response: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
    checks,
  };

  return NextResponse.json(response, {
    status: overallStatus === 'unhealthy' ? 503 : 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
};
```

### 6.2 Alerting Rules

| Alert | Threshold | Severity | Channel |
|-------|-----------|----------|---------|
| Error rate spike | >10 errors/minute (new) | P1 | Email + Sentry |
| Health check failure | 2 consecutive failures | P0 | Email |
| API response time | p95 > 2 seconds | P2 | Sentry |
| Database connections | > 80% of pool limit | P1 | Email |
| Stripe webhook failure | 3 consecutive failures | P1 | Email |
| Build failure on main | Any failure | P1 | GitHub notification |
| SSL certificate expiry | < 14 days | P2 | Email |
| Storage usage | > 75% of plan limit | P3 | Email |
| Disk usage (Supabase) | > 80% of plan limit | P2 | Email |

### 6.3 Logging Strategy

#### Structured Logging Format

```typescript
// lib/logger.ts
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  // NEVER include: passwords, tokens, PII, credit card numbers
};

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context,
    }));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      context,
    }));
  },
  error: (message: string, error?: Error, context?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined,
      context,
    }));
  },
};
```

#### What to Log vs. Not Log

**Log these:**
- API request method, path, status code, duration
- Authentication events (login, logout, failed attempts)
- Business events (org created, subscription changed, project completed)
- Error details (stack traces, error codes)
- External service calls (Stripe, Resend, integrations) with status

**Never log these:**
- Passwords or password hashes
- API keys, tokens, secrets
- Credit card numbers or payment details
- Full email bodies
- Personal data beyond what is needed for debugging (SSN, DOB, etc.)
- Request/response bodies containing user content (log only metadata)

#### Log Retention

| Source | Retention | Access |
|--------|-----------|--------|
| Vercel Function Logs | 1 hour (free), 3 days (Pro) | Vercel Dashboard > Logs |
| Supabase Postgres Logs | 7 days | Supabase Dashboard > Logs |
| Sentry Events | 90 days | Sentry Dashboard |
| Audit Log (database) | 2 years | Application UI (admin only) |

---

## 7. Security Operations

### 7.1 Security Checklist

Run this checklist quarterly or before any major release:

- [ ] **HTTPS everywhere**: Verify all endpoints redirect HTTP to HTTPS
- [ ] **CSP headers**: Verify Content-Security-Policy in `next.config.ts`
- [ ] **CORS**: No wildcard (`*`) origins in API routes
- [ ] **Rate limiting**: Verify rate limits are active on all public endpoints
- [ ] **Dependency audit**: `pnpm audit` shows no critical/high vulnerabilities
- [ ] **RLS verification**: Run RLS integration tests (cross-tenant isolation)
- [ ] **Environment variable audit**: No secrets in client-side code or git history
- [ ] **API key rotation**: All keys rotated within the last 90 days
- [ ] **Supabase RLS**: Every public table has RLS enabled (run migration-check SQL)
- [ ] **No `dangerouslySetInnerHTML`** without DOMPurify sanitization
- [ ] **File upload validation**: MIME type + file size limits enforced
- [ ] **SQL injection**: All database queries use parameterized queries (Supabase client does this)
- [ ] **Auth token expiry**: JWT access tokens expire within 1 hour

```bash
# Quick security scan commands
pnpm audit                          # Check for vulnerable dependencies
pnpm exec tsc --noEmit              # Type safety check
grep -r "dangerouslySetInnerHTML" apps/web/src/  # Find unsafe HTML injection
grep -r "SUPABASE_SERVICE_ROLE" apps/web/src/components/  # Service key leak check
grep -r "sk_live_" apps/web/src/    # Live Stripe key leak check
```

### 7.2 Incident Response

#### Severity Levels

| Level | Definition | Response Time | Examples |
|-------|-----------|---------------|----------|
| **P0** | Service completely down | 15 minutes | Database unreachable, auth broken, app crashes on load |
| **P1** | Major feature broken | 1 hour | Payments failing, data not saving, cross-tenant data leak |
| **P2** | Minor feature broken | 4 hours | Email not sending, one integration down, slow queries |
| **P3** | Cosmetic / non-urgent | 24 hours | UI glitch, typo, non-critical error in logs |

#### Response Procedure

```
1. DETECT: Alert received (Sentry, health check, user report)
2. ACKNOWLEDGE: Assign an owner. Update status page if applicable.
3. TRIAGE: Determine severity (P0-P3)
4. INVESTIGATE: Check logs (Vercel, Supabase, Sentry)
5. MITIGATE: Apply temporary fix (rollback, feature flag, rate limit)
6. RESOLVE: Deploy permanent fix
7. COMMUNICATE: Notify affected users
8. REVIEW: Post-incident review within 48 hours
```

---

## 8. Performance Operations

### 8.1 Performance Budgets

| Metric | Target | Tool |
|--------|--------|------|
| **LCP** (Largest Contentful Paint) | < 2.5 seconds | Vercel Analytics |
| **FID** (First Input Delay) | < 100 ms | Vercel Analytics |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Vercel Analytics |
| **TTFB** (Time to First Byte) | < 200 ms | Vercel Analytics |
| **Initial JS bundle** | < 200 KB (gzipped) | Build output |
| **API response time (p50)** | < 200 ms | Sentry Performance |
| **API response time (p95)** | < 500 ms | Sentry Performance |
| **API response time (p99)** | < 1 second | Sentry Performance |
| **Database query time** | < 100 ms (common queries) | Supabase Dashboard |
| **Lighthouse Performance** | > 90 | Lighthouse CI |

### 8.2 Performance Monitoring

#### Core Web Vitals

Tracked automatically by `@vercel/speed-insights` (added in Section 1.6). View at:
**Vercel Dashboard > Analytics > Web Vitals**

#### Real User Monitoring (RUM)

Vercel Analytics provides RUM automatically. For custom metrics:

```typescript
// lib/performance.ts
export const reportWebVitals = (metric: { name: string; value: number; id: string }) => {
  // Send to analytics
  if (typeof window !== 'undefined' && 'sendBeacon' in navigator) {
    navigator.sendBeacon('/api/v1/analytics/vitals', JSON.stringify(metric));
  }
};
```

#### Database Query Analysis

Check slow queries in **Supabase Dashboard > Database > Query Performance**.

Common optimizations:
- Add indexes on columns used in WHERE/JOIN/ORDER BY
- Use `SELECT` only the columns you need (not `SELECT *`)
- Use pagination (`LIMIT`/`OFFSET` or cursor-based)
- Use materialized views for expensive aggregations

---

## 9. Operational Playbooks

### 9.1 Common Operations

#### Add a New Environment Variable

```bash
# 1. Add to .env.example with documentation comment
# 2. Add to .env.local for local dev
# 3. Add to Vercel (all environments that need it):
#    Vercel Dashboard > Project Settings > Environment Variables
# 4. Add to turbo.json globalEnv if it starts with NEXT_PUBLIC_
# 5. Update CLAUDE.md if agents need to know about it
# 6. Trigger redeployment if already deployed:
vercel --prod
```

#### Create a New Database Migration

```bash
# 1. Create migration file
supabase migration new <descriptive_name>

# 2. Edit the SQL file
# - Add table/column definitions
# - Add RLS policies for new tables
# - Add indexes
# - Keep backward-compatible

# 3. Test locally
supabase db reset

# 4. Regenerate types
pnpm db:types

# 5. Commit both migration and types
git add supabase/migrations/ packages/shared/src/types/database.ts
git commit -m "feat(db): <description>"
```

#### Add a New Supabase Edge Function

```bash
# 1. Create the function
supabase functions new <function-name>

# 2. Edit supabase/functions/<function-name>/index.ts
# 3. Test locally
supabase functions serve <function-name> --env-file .env.local

# 4. Deploy
supabase functions deploy <function-name>
```

#### Onboard a New Developer or Agent

1. Grant GitHub repo access (`AlberaMarc/pips2`)
2. Share the `.env.local` values (via secure channel, never email)
3. Developer runs:

```bash
git clone git@github.com:AlberaMarc/pips2.git
cd pips2
pnpm install
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with provided values
supabase start
pnpm dev
```

4. Verify: `http://localhost:3000` loads without errors

### 9.2 Troubleshooting Guide

#### "Deployment Failed"

```bash
# Check Vercel build logs
vercel logs <deployment-url>

# Common causes:
# 1. TypeScript error → run `pnpm typecheck` locally
# 2. Missing env var → check Vercel env vars match .env.example
# 3. Build timeout → check for infinite loops or large imports
# 4. Dependency issue → delete node_modules, pnpm install --frozen-lockfile
```

#### "Database Connection Refused"

```bash
# Local:
supabase status          # Check if local Supabase is running
supabase start           # Start it if not
docker ps                # Verify Docker containers are running

# Remote:
# Check Supabase Dashboard > Database > Connection Pooling
# Verify DATABASE_URL and connection string in env vars
# Check if IP allowlist is blocking your IP
```

#### "Auth Not Working"

```bash
# Check Supabase Auth config:
# Dashboard > Authentication > Configuration

# Common issues:
# 1. Site URL mismatch (must match NEXT_PUBLIC_APP_URL)
# 2. Redirect URL not in allowlist
# 3. Email confirmation required but not sent (check Inbucket locally)
# 4. Cookie not set (check middleware.ts is running)
# 5. JWT expired (check token refresh in middleware)
```

#### "Stripe Webhook Failing"

```bash
# Check webhook logs:
stripe events list --limit 10

# Common issues:
# 1. Wrong webhook secret → verify STRIPE_WEBHOOK_SECRET
# 2. Endpoint URL wrong → check Stripe Dashboard > Webhooks
# 3. Signature validation failing → ensure raw body is used (not parsed JSON)
# 4. Endpoint returning non-2xx → check API route logs in Vercel

# Test locally:
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
stripe trigger checkout.session.completed
```

#### "RLS Blocking Valid Queries"

```bash
# Debug RLS policies in Supabase SQL editor:

-- Check which policies exist on a table
SELECT * FROM pg_policies WHERE tablename = 'tickets';

-- Test as a specific user (run in SQL editor with service role)
SET request.jwt.claim.sub = '<user-uuid>';
SET role TO 'authenticated';
SELECT * FROM tickets WHERE org_id = '<org-uuid>';
RESET role;

-- Common issues:
-- 1. User is not in org_members for the target org
-- 2. Policy uses auth.uid() but JWT is expired
-- 3. INSERT policy requires reporter_id = auth.uid() but you set a different value
-- 4. Missing policy for the operation (e.g., no UPDATE policy)
```

#### "Build Timeout"

```bash
# Vercel Pro plan has 45-minute build timeout.
# Common causes:
# 1. Large dependency tree → check bundle analyzer
# 2. Static page generation taking too long → reduce getStaticPaths
# 3. Image optimization → use external image CDN

# Optimize:
pnpm build 2>&1 | tail -50  # See what's taking long
ANALYZE=true pnpm build      # Generate bundle analysis
```

---

## 10. Agent-Specific Infrastructure

### 10.1 Worktree Infrastructure

Agents use git worktrees for isolation. Each agent works in its own worktree with its own branch.

```bash
# Creating a worktree for an agent
git worktree add .claude/worktrees/wi-001 -b agent/WI-001-auth-signup develop

# The agent works in .claude/worktrees/wi-001/
# It has its own working directory but shares the git history

# When done, clean up
git worktree remove .claude/worktrees/wi-001
git branch -d agent/WI-001-auth-signup  # Only after PR is merged
```

#### Worktree + CI Interaction

- Each worktree pushes to its own branch
- Pushing creates a PR, which triggers CI (typecheck, lint, test, build)
- Vercel creates a preview deployment per PR
- Preview URL is posted as a PR comment

#### Database Isolation for Agents

Agents share the local Supabase instance. To avoid conflicts:

1. Each agent's seed data uses unique org slugs (e.g., `agent-wi-001-org`)
2. Agents creating migrations must check existing timestamps
3. Agents should not modify shared seed data

For full isolation (if Supabase branching is enabled on the Pro plan):

```bash
# Create a database branch for the agent
supabase branches create agent-wi-001

# The branch gets its own database with the current schema
# Agent can make schema changes without affecting others

# When done, merge the branch
supabase branches merge agent-wi-001
```

### 10.2 Agent CI Requirements

Every agent PR must pass these checks before merge:

1. **TypeScript**: `pnpm typecheck` (zero errors)
2. **Lint**: `pnpm lint` (zero errors)
3. **Tests**: `pnpm test:unit` (all passing)
4. **Build**: `pnpm build` (successful)
5. **Format**: `pnpm format:check` (all files formatted)

Agent commits must use conventional commit format:

```
feat(tickets): add ticket creation API route

- POST /api/v1/tickets with Zod validation
- RLS policies enforce org_id scoping
- Unit tests for happy path and error cases

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 10.3 Shared Resources

| Resource | Shared? | Notes |
|----------|---------|-------|
| GitHub repo | Yes | All agents push to the same repo, different branches |
| Supabase project (local) | Yes | One local instance, agents use unique test data |
| Supabase project (staging) | Yes | Shared staging database |
| Supabase project (production) | Yes | Only main branch deploys here |
| Vercel project | Yes | Each PR gets its own preview deployment |
| Stripe (test mode) | Yes | Shared test account |
| Sentry project | Yes | Errors tagged by environment/version |
| Upstash Redis | Yes | Namespaced by key prefix |

**Preventing Resource Contention:**

- **Database migrations**: Agents must coordinate via the Agent Coordination Plan. No two agents modify the same table concurrently.
- **Env vars**: Only the project owner (Marc) adds new env vars to Vercel/GitHub. Agents document needed vars in their PR description.
- **Shared constants**: Changes to `packages/shared/` should be coordinated -- one agent at a time.

---

## 11. Cost Management

### 11.1 Service Pricing Summary

| Service | Plan | Monthly Cost | Notes |
|---------|------|-------------|-------|
| **Vercel** | Pro | $20/member | Includes 100GB bandwidth, 1TB edge, 100 hrs serverless |
| **Supabase** | Pro | $25/project | 8GB storage, 50GB bandwidth, 500MB RAM, PITR |
| **Stripe** | Pay-as-you-go | 2.9% + $0.30/txn | No monthly fee. Volume discounts available. |
| **Resend** | Free tier | $0 | 3,000 emails/month. Pro at $20/mo for 50K emails. |
| **Sentry** | Developer | $0 | 5K errors/month. Team at $26/mo for 50K errors. |
| **Upstash Redis** | Pay-as-you-go | ~$0-10 | 10K commands/day free. $0.20 per 100K commands after. |
| **GitHub** | Free (private repos) | $0 | 2,000 CI minutes/month free. |
| **Domain** | Annual | ~$12/year | Standard .com domain |
| **Better Uptime** | Free | $0 | 5 monitors. Pro at $20/mo for 50 monitors. |

### 11.2 Monthly Cost Projections

| Scale | Vercel | Supabase | Stripe Fees | Resend | Sentry | Total |
|-------|--------|----------|-------------|--------|--------|-------|
| **Pre-launch** (dev only) | $20 | $25 | $0 | $0 | $0 | ~$45/mo |
| **10 users** (5 orgs) | $20 | $25 | ~$15 | $0 | $0 | ~$60/mo |
| **100 users** (20 orgs) | $20 | $25 | ~$150 | $0 | $0 | ~$195/mo |
| **1,000 users** (100 orgs) | $20 | $25-75* | ~$1,500 | $20 | $26 | ~$1,590-1,640/mo |
| **5,000 users** (500 orgs) | $20** | $75-150* | ~$7,500 | $20 | $26 | ~$7,640-7,715/mo |

\* Supabase scales with storage and compute needs. May need Team plan ($599/mo) at scale.
\** Vercel may need Enterprise at very high traffic. Pro includes generous limits.

### 11.3 Cost Optimization Recommendations

1. **Use Vercel ISR and caching** aggressively for marketing pages and static content to minimize serverless function invocations.

2. **Use Supabase connection pooling** (PgBouncer) to maximize database connections per dollar.

3. **Stripe annual billing** reduces transaction count (12 charges/year vs. monthly). Offer annual discount (20% off) to encourage annual plans.

4. **Resend free tier** covers 3,000 emails/month. At 100 orgs sending ~10 emails/month each = 1,000 emails. Free tier is sufficient until ~300 emails/day.

5. **Sentry sampling**: Set `tracesSampleRate: 0.1` in production to reduce event volume by 90%.

6. **Image optimization**: Use Vercel Image Optimization (included) instead of third-party CDN.

7. **Monitor Supabase storage**: Attachments can grow quickly. Implement file retention policies (auto-delete exports after 30 days).

8. **GitHub Actions**: Free tier includes 2,000 minutes/month. Cache pnpm dependencies to reduce CI time (already configured in workflows).

---

## Appendix A: Quick Reference Commands

```bash
# === Development ===
pnpm dev                     # Start dev server
pnpm build                   # Build all
pnpm typecheck               # TypeScript check
pnpm lint                    # ESLint
pnpm test:unit               # Run unit tests
pnpm test:e2e                # Run E2E tests

# === Database ===
supabase start               # Start local Supabase
supabase stop                # Stop local Supabase
supabase status              # Check Supabase status
supabase db reset             # Reset database (replay migrations + seed)
supabase migration new <name> # Create new migration
supabase db push              # Push migrations to remote
supabase db push --dry-run    # Preview what would be pushed
supabase db lint              # Lint SQL migrations
pnpm db:types                 # Regenerate TypeScript types

# === Stripe ===
stripe login                  # Authenticate Stripe CLI
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
stripe trigger checkout.session.completed
stripe events list --limit 10
stripe products list
stripe prices list

# === Git ===
git checkout -b feature/description develop
git push -u origin feature/description
gh pr create --base develop --title "feat: description"
gh pr list
gh pr checks <pr-number>

# === Vercel ===
vercel                        # Deploy preview
vercel --prod                 # Deploy production
vercel logs <url>             # View deployment logs
vercel rollback               # Rollback production
vercel env ls                 # List environment variables
```

## Appendix B: File Inventory

Key files created or referenced in this runbook:

| File | Purpose |
|------|---------|
| `package.json` | Root workspace scripts |
| `pnpm-workspace.yaml` | Monorepo workspace definition |
| `turbo.json` | Build pipeline configuration |
| `.prettierrc` | Code formatting rules |
| `.eslintrc.json` | Linting rules |
| `.husky/pre-commit` | Pre-commit hook (lint-staged) |
| `.gitignore` | Git ignore rules |
| `.nvmrc` | Node.js version |
| `CLAUDE.md` | AI agent instructions |
| `apps/web/.env.example` | Environment variable template |
| `apps/web/next.config.ts` | Next.js configuration |
| `apps/web/tsconfig.json` | TypeScript configuration |
| `apps/web/tailwind.config.ts` | Tailwind CSS configuration |
| `apps/web/vitest.config.ts` | Test configuration |
| `apps/web/playwright.config.ts` | E2E test configuration |
| `apps/web/src/middleware.ts` | Next.js middleware (auth, routing) |
| `apps/web/src/lib/supabase/client.ts` | Browser Supabase client |
| `apps/web/src/lib/supabase/server.ts` | Server Component Supabase client |
| `apps/web/src/lib/supabase/middleware.ts` | Middleware Supabase client |
| `apps/web/src/lib/supabase/service.ts` | Service role Supabase client |
| `apps/web/src/lib/email/resend.ts` | Email sending utility |
| `apps/web/src/lib/logger.ts` | Structured logging |
| `apps/web/src/app/api/v1/health/route.ts` | Health check endpoint |
| `apps/web/src/components/error-boundary.tsx` | Global error boundary |
| `supabase/config.toml` | Local Supabase configuration |
| `supabase/seed.sql` | Development seed data |
| `supabase/migrations/` | Database migration files |
| `.github/workflows/ci.yml` | CI pipeline |
| `.github/workflows/e2e.yml` | E2E test pipeline |
| `.github/workflows/deploy-production.yml` | Production deployment |
| `.github/workflows/migration-check.yml` | Migration validation |
| `.github/workflows/labeler.yml` | PR auto-labeling |
| `.github/pull_request_template.md` | PR template |
| `.github/labeler.yml` | Label rules |

---

> **End of DevOps Runbook v1.0.0**
> Next review: After Phase 0 completion (adjust based on lessons learned)
