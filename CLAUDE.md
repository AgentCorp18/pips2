# PIPS 2.0 — Project Instructions

## Section 0: Work Coordination Protocol

### Before Starting Work

1. Read this file completely
2. Check `docs/work-log/` for the latest session entry
3. Understand what's been built and what's in progress
4. Update the work log BEFORE starting your task

### After Completing Work

1. Run quality gates: `pnpm typecheck && pnpm lint && pnpm test`
2. Update the work log with what you completed
3. Note any blockers or decisions needed

### Work Log Format

- Location: `docs/work-log/YYYY-MM-DD.md`
- Update the current day's log, create a new one if the date changed
- Mark completed items with [x], in-progress with [-], pending with [ ]

## Section 1: Project Overview

PIPS 2.0 is a multi-tenant SaaS web application that embeds a 6-step process improvement methodology into enterprise project management and ticketing software.

**The 6 PIPS Steps:**

1. Identify — Define measurable problem statements
2. Analyze — Root cause analysis (fishbone, 5-why, force-field)
3. Generate — Brainstorm solutions (brainwriting, brainstorming)
4. Select & Plan — Decision matrices, weighted voting, RACI, implementation planning
5. Implement — Execute with milestones, checklists, progress tracking
6. Evaluate — Measure results, lessons learned, cycle back to Step 1

## Section 2: Tech Stack

| Layer         | Technology               | Notes                                                  |
| ------------- | ------------------------ | ------------------------------------------------------ |
| Framework     | Next.js 15 (App Router)  | `apps/web/`                                            |
| Language      | TypeScript (strict mode) | Zero `any` types                                       |
| UI Components | shadcn/ui + Radix        | Customized with PIPS design tokens                     |
| Styling       | Tailwind CSS             | Extended with PIPS colors                              |
| State         | Zustand                  | For complex client-side state                          |
| Backend       | Supabase                 | Postgres, Auth, RLS, Storage, Edge Functions, Realtime |
| Hosting       | Vercel                   | Preview deploys per PR                                 |
| Payments      | Stripe                   | Not in MVP (free beta)                                 |
| Email         | Resend                   | Transactional emails                                   |
| Monitoring    | Sentry                   | Error tracking                                         |
| Testing       | Vitest + Playwright      | Unit/integration + E2E                                 |
| Monorepo      | Turborepo + pnpm         | `apps/` + `packages/`                                  |

## Section 3: Code Conventions

- **Functional components** with arrow functions
- **Named exports** (not default exports)
- **2-space indentation**
- **Path aliases**: `@/` for `apps/web/src/`
- **Files < 200 lines** preferred
- **Co-locate** related files (component + hook + types)
- **Zod schemas** for all data validation
- **Server Components** by default; `'use client'` only when needed
- **Server Actions** for mutations; API routes for webhooks and external APIs

## Section 4: Brand Identity

| Token         | Value                           | Usage                           |
| ------------- | ------------------------------- | ------------------------------- |
| Primary       | `#4F46E5` (Indigo-violet)       | Buttons, links, active states   |
| Deep          | `#1B1340` (Dark violet)         | Dark backgrounds, sidebar       |
| Accent        | `#F59E0B` (Amber)               | Highlights, warnings, attention |
| Surface       | `#F0EDFA` (Cloud)               | Card backgrounds, hover states  |
| Step 1        | `#3B82F6` (Blue)                | Identify                        |
| Step 2        | `#F59E0B` (Amber)               | Analyze                         |
| Step 3        | `#10B981` (Emerald)             | Generate                        |
| Step 4        | `#6366F1` (Indigo)              | Select & Plan                   |
| Step 5        | `#CA8A04` (Gold)                | Implement                       |
| Step 6        | `#0891B2` (Teal)                | Evaluate                        |
| Headline Font | DM Serif Display                | Marketing, hero, display text   |
| Body Font     | DM Sans                         | Everything else                 |
| Mono Font     | JetBrains Mono                  | Code, data, ticket IDs          |
| Border Radius | 10px default, 20px pills        |                                 |
| Shadows       | Violet-tinted (rgba of #1B1340) |                                 |

## Section 5: Project Structure

```
pips2.0/
├── apps/
│   └── web/                    # Next.js 15 application
│       ├── app/                # App Router
│       │   ├── (auth)/         # Auth pages (login, signup, etc.)
│       │   ├── (marketing)/    # Public pages (landing, pricing)
│       │   └── (app)/          # Authenticated app
│       │       ├── dashboard/
│       │       ├── projects/
│       │       ├── tickets/
│       │       ├── teams/
│       │       └── settings/
│       ├── components/         # Shared React components
│       │   ├── ui/             # shadcn/ui base components
│       │   ├── pips/           # PIPS-specific components
│       │   ├── tickets/        # Ticket components
│       │   └── layout/         # Layout components
│       ├── hooks/              # Custom hooks
│       ├── lib/                # Utilities
│       │   ├── supabase/       # Supabase clients
│       │   ├── utils.ts        # General utilities
│       │   └── validations.ts  # Zod schemas
│       ├── stores/             # Zustand stores
│       └── types/              # TypeScript types
├── packages/
│   └── shared/                 # Shared types, constants
├── supabase/
│   ├── migrations/             # SQL migrations (YYYYMMDDHHMMSS_name.sql)
│   ├── functions/              # Edge Functions
│   └── seed.sql                # Dev seed data
├── tests/
│   ├── e2e/                    # Playwright tests
│   └── integration/            # Integration tests
├── docs/
│   ├── planning/               # Planning documents (read-only reference)
│   ├── mockups/                # HTML brand mockups
│   └── work-log/               # Daily work logs
└── .github/
    └── workflows/              # CI/CD
```

## Section 6: Database Conventions

- **Multi-tenancy**: Every user-facing table has `org_id` column with RLS policy
- **RLS**: Every table has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- **Timestamps**: `created_at` and `updated_at` on every table (with trigger)
- **Soft delete**: Use `archived_at` timestamp, not hard delete
- **UUIDs**: Primary keys are `uuid DEFAULT gen_random_uuid()`
- **Enums**: Use Postgres enums for fixed sets (roles, statuses, priorities)
- **JSONB**: Use for flexible form data (`project_forms.data`)
- **Migration naming**: `YYYYMMDDHHMMSS_description.sql`
- **Migration ordering for parallel agents**: Use 10-minute timestamp gaps

## Section 7: Testing Requirements

- `tsc --noEmit` must pass (zero type errors)
- `pnpm lint` must pass (zero ESLint errors)
- `pnpm test` must pass (all Vitest tests green — currently 832/832)
- `pnpm exec playwright test` for E2E tests (currently 160 tests across 18 specs)
- New features need tests (components: render + interaction, API: happy path + error)
- E2E tests use custom fixtures in `tests/e2e/helpers/`: `testUser`, `authenticatedPage`, `orgPage`
- Test factories in `tests/e2e/helpers/test-factories.ts` for server-side data creation
- **DB column note**: `projects` table column is `title`, not `name`. Server actions map form field `name` to `title`.

## Section 8: Planning References

All planning documents are in `docs/planning/`. Key files:

- **Start here**: `PROJECT_INDEX.md` — Overview and navigation guide
- **What to build**: `MVP_SPECIFICATION.md` — Definitive MVP build guide
- **How to build**: `TECHNICAL_PLAN.md` — Architecture, schema, APIs
- **How to set up**: `DEVOPS_RUNBOOK.md` — Day-1 setup, CI/CD, deployment
- **How agents work**: `AI_AGENT_COORDINATION.md` — Worktree strategy, task decomposition
- **How it looks**: `BRAND_GUIDE_V2.md` — Visual identity, design tokens
- **UX patterns**: `UX_FLOWS.md` — User journeys, screen descriptions
- **Existing content**: `CONTENT_MIGRATION.md` — Form template migration specs

## Section 9: Git Conventions

- **Branch naming**: `feature/description`, `fix/description`, `chore/description`
- **Agent branches**: `agent/{phase}-{feature}`
- **Commit messages**: Imperative mood, type prefix: `feat(scope): description`
- **Never force push to main**
- **PR required for main merges**
