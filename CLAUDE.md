## Project

PIPS 2.0 — Multi-tenant SaaS embedding a 6-step process improvement methodology into project management.

## Stack

- Next.js 16 (App Router), TypeScript strict, Tailwind CSS, shadcn/ui + Radix
- Supabase (Postgres, Auth, RLS, Edge Functions), Zustand
- Turborepo + pnpm monorepo
- Vitest + Playwright, Vercel hosting, Resend email, Sentry monitoring

## Structure

- apps/web/app/(auth|marketing|app)/ — Route groups
- apps/web/components/ui/ — shadcn/ui, components/pips/ — PIPS step components
- apps/web/hooks/, stores/, lib/ — React hooks, Zustand, utilities
- packages/shared/ — Shared types/utils
- supabase/migrations/ — SQL migrations (YYYYMMDDHHMMSS format)
- docs/planning/ — PROJECT_INDEX.md, MVP_SPECIFICATION.md, TECHNICAL_PLAN.md
- tests/e2e/ — Playwright E2E tests

## Commands

- Dev: `pnpm dev`
- Type check: `pnpm tsc --noEmit`
- Lint: `pnpm lint`
- Test: `pnpm test`
- E2E: `pnpm exec playwright test`
- Build: `pnpm build`

## Verification

IMPORTANT: After every change, run in this order:

1. `pnpm tsc --noEmit` — fix ALL type errors before proceeding
2. `pnpm test` — fix failing tests
3. `pnpm lint` — fix lint errors

## Conventions

- Zero `any` types — TypeScript strict
- Server Components by default, `'use client'` only when necessary
- Server Actions for mutations, API routes for webhooks
- Zod schemas for all data validation
- Path alias: @/ maps to apps/web/src
- Every table has org_id for multi-tenancy, RLS on ALL tables
- UUID primary keys, soft delete via archived_at
- For brand colors/typography: see .claude/rules/brand.md
- For multi-agent coordination: see .claude/rules/multi-agent.md

## Route Scaffolding Checklist

Every new route segment MUST include:

1. `page.tsx` — the page component (Server Component by default)
2. `loading.tsx` — skeleton loading state using `<Skeleton>` from shadcn/ui
3. `error.tsx` — error boundary using `ErrorBoundaryCard` from `@/components/layout/error-boundary`

Server Action Security Checklist (every `'use server'` file):

1. `getAuthContext()` or `createClient()` + `getUser()` — verify authentication
2. `requirePermission(orgId, permission)` — verify authorization
3. Verify entity belongs to user's org (defense-in-depth)
4. Zod schema validation on all user input
5. Return structured `{ error: string }` on failure, not throw

## Don'ts

- Don't edit .env files — use Vercel env vars for production
- Don't edit supabase/migrations/ directly — migrations require careful sequencing
- Don't skip type checking — 3,185+ unit tests must continue passing
- Don't use default exports — named exports only

## Work Tracking — MANDATORY (Hard Gate)

**NO WORK may be performed unless it is first captured in the PIPS app (pips-app.vercel.app).** This is a BLOCKING requirement — not optional, not "nice to have." ALL planning, development, investigation, analysis, decisions, discussions, and handoffs MUST be documented in the app.

Full instructions: `.claude/rules/multi-agent.md`

### Required workflow:

1. **Before work**: Create Initiative/Project + Ticket in PIPS app. No ticket = no work.
2. **During work**: Update ticket status, add comments with progress/decisions/findings, post in chat channels for coordination, fill out PIPS step forms for non-trivial problems
3. **After work**: Close ticket with summary + PR link, fill out Step 6 evaluation forms
4. **Discoveries**: Create tickets immediately for bugs found or improvement ideas
5. **Handoffs**: Post in ticket chat channel with context before reassigning

## Gotchas

- Supabase client uses .trim() on env vars to prevent \n corruption
- RLS functions user_org_ids() and user_has_org_role() are SECURITY DEFINER
- Onboarding uses admin client (service role) to bypass RLS for first org creation
- E2E test cleanup requires deleting audit_log before organizations (FK constraint)
- FormData.get() returns null but Zod .optional() expects undefined — use ?? undefined
