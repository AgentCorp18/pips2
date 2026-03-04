# PIPS 2.0 — Test Strategy

> **Version:** 1.0 — Created 2026-03-04
> **Author:** QA Agent (Claude Opus 4.6)
> **Status:** Active
> **Companion Docs:** `QA_AGENT.md`, `DEVELOPMENT_TASK_LIST.md`, `MVP_SPECIFICATION.md`, `TECHNICAL_PLAN.md`
> **Quality Gates:** `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e && pnpm build`

---

## Table of Contents

1. [Current Test Coverage Analysis](#1-current-test-coverage-analysis)
2. [Test Type Strategy](#2-test-type-strategy)
3. [Test Tooling](#3-test-tooling)
4. [Coverage Targets by Feature Area](#4-coverage-targets-by-feature-area)
5. [Quality Gates and CI Pipeline](#5-quality-gates-and-ci-pipeline)
6. [Regression Testing Strategy](#6-regression-testing-strategy)
7. [E2E Test Scenarios by User Flow](#7-e2e-test-scenarios-by-user-flow)
8. [Test Data Management](#8-test-data-management)
9. [Performance Testing Plan](#9-performance-testing-plan)
10. [Security Testing Plan](#10-security-testing-plan)
11. [Accessibility Testing Plan](#11-accessibility-testing-plan)
12. [Release Readiness Checklist](#12-release-readiness-checklist)
13. [Test Gap Analysis](#13-test-gap-analysis)

---

## 1. Current Test Coverage Analysis

### 1.1 Summary (as of 2026-03-04)

| Metric                     | Count | Notes                                              |
| -------------------------- | ----- | -------------------------------------------------- |
| Unit test files            | 56    | Vitest + jsdom environment                         |
| Unit tests passing         | 896   | Across all test files                              |
| E2E spec files             | 18    | Playwright + Chromium                              |
| E2E tests defined          | 160   | 47 currently failing against prod (selector drift) |
| Type errors                | 0     | `tsc --noEmit` clean                               |
| Lint errors                | 0     | 20 warnings (acceptable)                           |
| Vitest coverage thresholds | 40%   | Statements, branches, functions, lines             |

### 1.2 Unit Test File Inventory

Tests are co-located under `__tests__/` directories adjacent to source files.

#### Server Actions (14 files)

| File                                                                       | Module             | Coverage Area                                       |
| -------------------------------------------------------------------------- | ------------------ | --------------------------------------------------- |
| `app/(auth)/__tests__/actions.test.ts`                                     | Auth               | Login, signup, password reset, verification         |
| `app/(app)/dashboard/__tests__/actions.test.ts`                            | Dashboard          | Stats, recent activity, projects-by-step            |
| `app/(app)/notifications/__tests__/actions.test.ts`                        | Notifications      | Fetch, mark-read, mark-all-read                     |
| `app/(app)/onboarding/__tests__/actions.test.ts`                           | Onboarding         | Org creation, slug validation                       |
| `app/(app)/profile/__tests__/actions.test.ts`                              | Profile            | Update display name, avatar, prefs                  |
| `app/(app)/projects/[projectId]/__tests__/actions.test.ts`                 | Projects           | CRUD, step advancement, status changes              |
| `app/(app)/projects/[projectId]/steps/.../forms/__tests__/actions.test.ts` | PIPS Forms         | Form save, form load, auto-save                     |
| `app/(app)/projects/new/__tests__/actions.test.ts`                         | Project Creation   | Create project, 6-step auto-creation                |
| `app/(app)/search/__tests__/actions.test.ts`                               | Search             | Global search across projects and tickets           |
| `app/(app)/settings/__tests__/actions.test.ts`                             | Settings           | Org settings CRUD                                   |
| `app/(app)/settings/audit-log/__tests__/actions.test.ts`                   | Audit Log          | Audit log queries, permission checks                |
| `app/(app)/settings/members/__tests__/actions.test.ts`                     | Members            | Invite, role change, remove, permission enforcement |
| `app/(app)/settings/notifications/__tests__/actions.test.ts`               | Notification Prefs | Toggle email/in-app preferences                     |
| `app/(app)/tickets/__tests__/actions.test.ts`                              | Tickets            | CRUD, status transitions, comments, assignment      |

#### Component Tests (20 files)

| File                                                            | Component          | Coverage Area                                   |
| --------------------------------------------------------------- | ------------------ | ----------------------------------------------- |
| `components/__tests__/export-csv-button.test.tsx`               | CSV Export         | Button render, click handler, data formatting   |
| `components/__tests__/recent-activity.test.tsx`                 | Recent Activity    | Activity feed rendering, empty state            |
| `components/__tests__/stat-cards.test.tsx`                      | Stat Cards         | Dashboard metric cards rendering                |
| `components/__tests__/ticket-empty-state.test.tsx`              | Ticket Empty State | Empty state display and CTA                     |
| `components/knowledge/__tests__/bookmark-button.test.tsx`       | Bookmark Button    | Toggle, optimistic update                       |
| `components/knowledge/__tests__/knowledge-hub-landing.test.tsx` | Knowledge Hub      | 4-pillar render, search bar, bookmarks, history |
| `components/layout/__tests__/command-palette.test.tsx`          | Command Palette    | Keyboard shortcut, search, navigation           |
| `components/layout/__tests__/empty-state.test.tsx`              | Empty State        | Rendering with title, description, action       |
| `components/layout/__tests__/error-boundary.test.tsx`           | Error Boundary     | Error catch, fallback render                    |
| `components/layout/__tests__/notification-bell.test.tsx`        | Notification Bell  | Unread count, dropdown, mark-as-read            |
| `components/layout/__tests__/skeleton.test.tsx`                 | Skeleton           | Loading states                                  |
| `components/layout/__tests__/user-menu.test.tsx`                | User Menu          | Avatar, dropdown, logout                        |
| `components/pips/__tests__/form-shell.test.tsx`                 | Form Shell         | Auto-save, save/load, Cadence Bar slot          |
| `components/pips/__tests__/form-textarea.test.tsx`              | Form Textarea      | Input, character count                          |
| `components/pips/__tests__/linked-tickets.test.tsx`             | Linked Tickets     | Ticket linking UI                               |
| `components/pips/__tests__/permission-gate.test.tsx`            | Permission Gate    | Role-based conditional rendering                |
| `components/pips/__tests__/project-card.test.tsx`               | Project Card       | Card rendering, step progress                   |
| `components/pips/__tests__/project-tabs.test.tsx`               | Project Tabs       | Tab navigation, active state                    |
| `components/pips/__tests__/step-stepper.test.tsx`               | Step Stepper       | 6-step display, current step, click navigation  |
| `components/tickets/__tests__/comment-section.test.tsx`         | Comments           | Add, edit, delete, @mentions                    |
| `components/tickets/__tests__/kanban-card.test.tsx`             | Kanban Card        | Card rendering, priority badge, assignee        |
| `components/tickets/__tests__/ticket-card.test.tsx`             | Ticket Card        | Card rendering, fields display                  |
| `components/tickets/__tests__/ticket-config.test.ts`            | Ticket Config      | Status workflow config, priority config         |
| `components/tickets/__tests__/ticket-create-form.test.tsx`      | Ticket Create      | Form validation, submission                     |
| `components/training/__tests__/training-landing.test.tsx`       | Training Landing   | Path cards, descriptions                        |
| `components/training/__tests__/training-module-card.test.tsx`   | Module Card        | Module display, progress indicator              |
| `components/training/__tests__/training-progress-ring.test.tsx` | Progress Ring      | SVG ring, percentage                            |

#### Library/Utility Tests (10 files)

| File                                     | Module           | Coverage Area                                                     |
| ---------------------------------------- | ---------------- | ----------------------------------------------------------------- |
| `lib/__tests__/content-taxonomy.test.ts` | Content Taxonomy | Tag matching, pillar classification, Cadence Bar context building |
| `lib/__tests__/csv.test.ts`              | CSV Export       | CSV generation, escaping, formatting                              |
| `lib/__tests__/form-schemas.test.ts`     | Form Schemas     | All 18 PIPS form Zod schemas (valid, invalid, edge cases)         |
| `lib/__tests__/logger.test.ts`           | Logger           | Structured logging, log levels                                    |
| `lib/__tests__/permissions.test.ts`      | Permissions      | Server-side RBAC helpers, requirePermission                       |
| `lib/__tests__/sentry-config.test.ts`    | Sentry           | Configuration validation                                          |
| `lib/__tests__/shared-constants.test.ts` | Shared Constants | PIPS steps, colors, brand tokens                                  |
| `lib/__tests__/shared-types.test.ts`     | Shared Types     | Type guards, narrowing                                            |
| `lib/__tests__/utils.test.ts`            | Utilities        | cn(), date helpers, slug generation                               |
| `lib/__tests__/validations.test.ts`      | Validations      | Auth, org, project, ticket, comment Zod schemas                   |

#### Other Tests (2 files)

| File                                      | Module         | Coverage Area                           |
| ----------------------------------------- | -------------- | --------------------------------------- |
| `__tests__/middleware.test.ts`            | Middleware     | Auth token refresh, redirect logic      |
| `stores/__tests__/org-store.test.ts`      | Org Store      | Zustand store, set/get org, hydration   |
| `app/api/health/route.test.ts`            | Health Check   | API route response                      |
| `app/api/health/ping/route.test.ts`       | Ping           | API route response                      |
| `hooks/__tests__/use-permissions.test.ts` | usePermissions | Hook role resolution, permission checks |

### 1.3 E2E Test File Inventory

All E2E specs are in `apps/web/tests/e2e/` using Playwright.

| Spec File                   | Area         | Key Flows                                     |
| --------------------------- | ------------ | --------------------------------------------- |
| `auth-flow.spec.ts`         | Auth         | Signup, login, logout, session persistence    |
| `auth.spec.ts`              | Auth         | Login form, error handling, redirect          |
| `csv-pdf-export.spec.ts`    | Export       | CSV download, PDF generation                  |
| `dashboard.spec.ts`         | Dashboard    | Widget rendering, navigation, stat accuracy   |
| `invite-flow.spec.ts`       | Invitations  | Send invite, accept, role assignment          |
| `kanban-board.spec.ts`      | Kanban       | Drag-and-drop, column rendering, card display |
| `landing.spec.ts`           | Landing Page | Marketing page rendering, navigation          |
| `navigation.spec.ts`        | Navigation   | Sidebar links, breadcrumbs, URL routing       |
| `onboarding.spec.ts`        | Onboarding   | Org creation, slug validation, redirect       |
| `pips-forms.spec.ts`        | PIPS Forms   | Form rendering, data entry, auto-save         |
| `profile-suite.spec.ts`     | Profile      | Edit name, avatar, notification prefs         |
| `project-crud.spec.ts`      | Projects     | Create, read, update, delete projects         |
| `project-lifecycle.spec.ts` | Projects     | Full 6-step workflow, step advancement        |
| `search-and-nav.spec.ts`    | Search       | Cmd+K, search results, navigation             |
| `settings-suite.spec.ts`    | Settings     | Org settings, audit log, member management    |
| `team-management.spec.ts`   | Teams        | Create team, add/remove members               |
| `ticket-crud.spec.ts`       | Tickets      | Create, detail, comment, edit, list           |
| `ticket-workflow.spec.ts`   | Tickets      | Status transitions, board interaction         |

### 1.4 E2E Test Infrastructure

| Component      | File                        | Purpose                                                                                   |
| -------------- | --------------------------- | ----------------------------------------------------------------------------------------- |
| Auth Fixture   | `helpers/auth-fixture.ts`   | Creates fresh Supabase user per test, provides `testUser`, `authenticatedPage`, `orgPage` |
| Test Factories | `helpers/test-factories.ts` | Generates test data (projects, tickets, teams, orgs)                                      |
| Supabase Admin | `helpers/supabase-admin.ts` | Service-role client for user creation/deletion, data queries                              |

---

## 2. Test Type Strategy

### 2.1 Test Pyramid

The PIPS 2.0 test strategy follows a standard test pyramid, weighted toward unit tests for fast feedback and confidence, with integration and E2E tests covering critical paths.

```
         /\
        /  \        E2E Tests (~160)
       / E2E\       Real browser, real Supabase, real auth
      /------\
     /        \     Integration Tests (planned)
    / Integr.  \    Server actions + Supabase client, no browser
   /------------\
  /              \  Unit Tests (~896)
 /  Unit + Comp.  \ Zod schemas, utils, components, hooks, stores
/------------------\
```

### 2.2 Unit Tests

**Scope:** Individual functions, Zod schemas, React components (shallow), custom hooks, Zustand stores, utility functions.

**Framework:** Vitest with jsdom environment.

**Patterns used in this codebase:**

- `vi.mock()` for module mocking (Supabase client, Next.js navigation, sonner toast)
- `vi.hoisted()` for mock variables referenced before import
- `render()` + `screen` queries from `@testing-library/react`
- `fireEvent` and `act` for user interactions
- Proxy-based Supabase chain mocking (see `tickets/__tests__/actions.test.ts`)
- `safeParse` assertions for Zod schema tests

**Expectations:**

- Every Zod validation schema has positive and negative test cases
- Every server action has happy path + error path tests
- Every interactive component has render + interaction tests
- Every custom hook has behavior tests
- Every utility function has input/output tests

### 2.3 Component Tests

**Scope:** React components rendered in isolation with mocked dependencies.

**Framework:** Vitest + React Testing Library.

**Approach:**

- Render component with representative props
- Assert visible elements (text, roles, test IDs)
- Simulate user interactions (click, type, keyboard)
- Assert callback invocations and state changes
- Mock external dependencies (Supabase, router, toast)

**Component categories requiring tests:**

| Category             | Examples                                            | Priority |
| -------------------- | --------------------------------------------------- | -------- |
| PIPS Step Forms      | Fishbone, 5-Why, Criteria Matrix, Brainstorming     | P0       |
| Ticket Components    | Kanban Card, Ticket Detail, Comment Section         | P0       |
| Layout Components    | Sidebar, Header, Command Palette, Notification Bell | P1       |
| Dashboard Widgets    | Stat Cards, Activity Feed, Projects-by-Step Chart   | P1       |
| Knowledge Components | Bookmark Button, Content Reader, Cadence Bar        | P1       |
| Training Components  | Landing, Module Card, Progress Ring, Exercise UI    | P2       |
| Auth Components      | Login Form, Signup Form, Password Reset             | P2       |

### 2.4 Integration Tests

**Scope:** Server actions interacting with a real or closely mocked Supabase client. Tests the full server-side path from action invocation through database query to return value.

**Framework:** Vitest (same as unit, but with heavier mocking or test database).

**Current state:** Integration tests are effectively combined with unit tests. Server action tests mock the Supabase client using a Proxy-based chain pattern. True integration tests against a real database are not yet implemented.

**Planned approach:**

- Use Supabase local development (Docker) for integration tests
- Run migrations, seed data, execute server actions, assert database state
- Test RLS enforcement by switching between user JWTs
- Test database triggers (audit log, notifications, search vector updates)

### 2.5 End-to-End Tests

**Scope:** Full user workflows through a real browser against the deployed application.

**Framework:** Playwright with Chromium.

**Test categories:**

| Category            | Test Count | Status                            |
| ------------------- | ---------- | --------------------------------- |
| Authentication      | 2 specs    | BUILT (selector alignment needed) |
| Onboarding          | 1 spec     | BUILT                             |
| Projects            | 2 specs    | BUILT                             |
| Tickets             | 2 specs    | BUILT                             |
| Dashboard           | 1 spec     | BUILT                             |
| Kanban Board        | 1 spec     | BUILT                             |
| Teams               | 1 spec     | BUILT                             |
| Settings            | 1 spec     | BUILT                             |
| Profile             | 1 spec     | BUILT                             |
| Invitations         | 1 spec     | BUILT                             |
| Search & Navigation | 2 specs    | BUILT                             |
| PIPS Forms          | 1 spec     | BUILT                             |
| CSV/PDF Export      | 1 spec     | BUILT                             |
| Landing Page        | 1 spec     | BUILT                             |
| Knowledge Hub       | 0 specs    | NOT BUILT                         |
| Training Mode       | 0 specs    | NOT BUILT                         |
| Workshop            | 0 specs    | NOT BUILT                         |

**E2E execution modes:**

- **Local:** `pnpm exec playwright test` against `http://localhost:3000`
- **CI:** GitHub Actions workflow (`e2e.yml`) against `https://pips-app.vercel.app`
- **Manual trigger:** `workflow_dispatch` with configurable `base_url`

### 2.6 Performance Tests

**Current state:** Not implemented.

**Planned approach:** See [Section 9: Performance Testing Plan](#9-performance-testing-plan).

### 2.7 Security Tests

**Current state:** RLS policies are tested indirectly through server action mocks. No dedicated security test suite exists.

**Planned approach:** See [Section 10: Security Testing Plan](#10-security-testing-plan).

### 2.8 Accessibility Tests

**Current state:** shadcn/ui provides baseline accessibility via Radix primitives. No automated a11y testing exists.

**Planned approach:** See [Section 11: Accessibility Testing Plan](#11-accessibility-testing-plan).

---

## 3. Test Tooling

### 3.1 Vitest Configuration

**Config file:** `apps/web/vitest.config.ts`

| Setting             | Value                                                   | Rationale                                           |
| ------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| Environment         | `jsdom`                                                 | Browser-like DOM for component tests                |
| Setup file          | `src/test-setup.ts`                                     | Global mocks, RTL cleanup                           |
| Globals             | `true`                                                  | `describe`, `it`, `expect` available without import |
| Include pattern     | `src/**/*.test.{ts,tsx}`                                | Co-located tests                                    |
| Coverage provider   | `v8`                                                    | Fast, built-in                                      |
| Coverage reporters  | `text`, `text-summary`, `lcov`, `json-summary`          | Console + CI artifact                               |
| Coverage thresholds | 40% (all metrics)                                       | Current baseline; target increase to 60%            |
| Coverage excludes   | Test files, layouts, pages, `ui/`                       | Focus on business logic                             |
| Path aliases        | `@/` -> `src/`, `@pips/shared` -> `packages/shared/src` | Match app aliases                                   |

### 3.2 Playwright Configuration

**Config file:** `apps/web/playwright.config.ts`

| Setting            | Value                                      | Rationale                         |
| ------------------ | ------------------------------------------ | --------------------------------- |
| Test directory     | `./tests/e2e`                              | Separate from unit tests          |
| Fully parallel     | `true`                                     | Maximize CI speed                 |
| Forbid `test.only` | CI only                                    | Prevent accidental focus in CI    |
| Retries            | 2 in CI, 0 locally                         | Account for flakiness in CI       |
| Workers            | 1 in CI, auto locally                      | Prevent resource contention in CI |
| Reporter           | `html`                                     | Visual test report                |
| Base URL           | `process.env.BASE_URL` or `localhost:3000` | Configurable per environment      |
| Screenshot         | `only-on-failure`                          | Debug failing tests               |
| Trace              | `on-first-retry`                           | Detailed replay on failure        |
| Browser            | Chromium only                              | MVP testing scope                 |

### 3.3 Testing Patterns and Conventions

#### Mock Patterns

**Supabase Client Mock (Proxy-based chain):**

```typescript
// Track sequential from() calls
let fromCallIndex = 0
let fromResults: Array<{ data?: unknown; error?: unknown }> = []

const createChainForIndex = (idx: number) => {
  const terminal = () => Promise.resolve(fromResults[idx] ?? { data: null, error: null })
  const chain: Record<string, unknown> = {}
  return new Proxy(chain, {
    get(_target, prop) {
      if (prop === 'then') {
        const p = terminal()
        return p.then.bind(p)
      }
      return (..._args: unknown[]) => proxy
    },
  })
}
```

This pattern allows mocking complex Supabase query chains (`.from().select().eq().order()`) without specifying every chained method.

**Next.js Module Mocks:**

```typescript
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
```

**E2E Auth Fixture:**

```typescript
export const test = base.extend<AuthFixtures>({
  testUser: [
    async ({}, use) => {
      const user = await createTestUser()
      await use(user)
      await deleteTestUser(user.id)
    },
    { scope: 'test' },
  ],
  authenticatedPage: [
    async ({ page, testUser }, use) => {
      // Login via UI, wait for redirect
      await use(page)
    },
    { scope: 'test' },
  ],
})
```

#### File Naming Conventions

- Unit tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.spec.ts`
- Test helpers: `helpers/` subdirectory
- Test setup: `test-setup.ts`

#### Test Organization

- Co-located `__tests__/` directories adjacent to source files
- One test file per source module (actions, component, hook, etc.)
- Descriptive `describe` blocks matching module structure
- Test names follow `it('does X when Y')` pattern

---

## 4. Coverage Targets by Feature Area

### 4.1 MVP Core (BUILT)

| Feature Area                            | Unit Tests                       | E2E Tests           | Current Status | Target                               |
| --------------------------------------- | -------------------------------- | ------------------- | -------------- | ------------------------------------ |
| Auth (login, signup, password reset)    | 1 action file                    | 2 spec files        | GOOD           | Maintain; add MFA tests when built   |
| Onboarding (org creation)               | 1 action file                    | 1 spec file         | GOOD           | Maintain                             |
| Organizations (RBAC, members, settings) | 3 action files                   | 1 spec file         | GOOD           | Add role escalation tests            |
| Projects (CRUD, 6-step workflow)        | 2 action files                   | 2 spec files        | GOOD           | Add step completion criteria tests   |
| PIPS Forms (18 form types)              | 1 schema file, 1 component file  | 1 spec file         | MODERATE       | Add per-form-type rendering tests    |
| Tickets (CRUD, workflow, comments)      | 1 action file, 5 component files | 2 spec files        | GOOD           | Maintain                             |
| Kanban Board                            | 1 component file                 | 1 spec file         | GOOD           | Add drag-and-drop edge cases         |
| Dashboard                               | 1 action file, 3 component files | 1 spec file         | GOOD           | Maintain                             |
| Teams                                   | 0 component files                | 1 spec file         | MODERATE       | Add team component unit tests        |
| Invitations                             | 0 dedicated files                | 1 spec file         | MODERATE       | Add invitation action unit tests     |
| Notifications                           | 1 action file, 1 component file  | 0 specs             | MODERATE       | Add E2E for notification flow        |
| Search                                  | 1 action file, 1 component file  | 1 spec file         | GOOD           | Maintain                             |
| Audit Log                               | 1 action file                    | 0 specs             | LOW            | Add audit log E2E if UI viewer built |
| Profile                                 | 1 action file                    | 1 spec file         | GOOD           | Maintain                             |
| CSV/PDF Export                          | 1 component file, 1 lib file     | 1 spec file         | GOOD           | Maintain                             |
| Middleware                              | 1 test file                      | implicit in all E2E | GOOD           | Maintain                             |
| Permissions                             | 2 test files                     | implicit in actions | GOOD           | Maintain                             |

### 4.2 Knowledge Hub (BUILT)

| Feature Area          | Unit Tests             | E2E Tests | Current Status | Target                                 |
| --------------------- | ---------------------- | --------- | -------------- | -------------------------------------- |
| Content Taxonomy      | 1 test file (46 tests) | 0 specs   | MODERATE       | Add E2E for pillar navigation          |
| Knowledge Hub Landing | 1 component test       | 0 specs   | LOW            | Add E2E: search, pillar nav, bookmarks |
| Bookmark Button       | 1 component test       | 0 specs   | LOW            | Add E2E: bookmark toggle               |
| Content Reader        | 0 tests                | 0 specs   | NOT COVERED    | Add component + E2E tests              |
| Cadence Bar           | 0 dedicated tests      | 0 specs   | NOT COVERED    | Add unit tests for context building    |
| Reading Sessions      | 0 tests                | 0 specs   | NOT COVERED    | Add server action tests                |
| Content Read History  | 0 tests                | 0 specs   | NOT COVERED    | Add server action tests                |
| FTS Search            | 0 dedicated tests      | 0 specs   | NOT COVERED    | Add E2E for Knowledge Hub search       |

**Knowledge Hub coverage needed:**

- Unit tests for Cadence Bar context builder (`buildProductContext`, `matchContentNodes`)
- Component tests for Content Reader, Markdown renderer
- Server action tests for reading sessions, bookmarks, read history
- E2E spec: `knowledge-hub.spec.ts` covering pillar navigation, content reading, FTS search, bookmark CRUD, reading session persistence

### 4.3 Training Mode (SCAFFOLDED)

| Feature Area           | Unit Tests       | E2E Tests | Current Status | Target                         |
| ---------------------- | ---------------- | --------- | -------------- | ------------------------------ |
| Training Landing       | 1 component test | 0 specs   | LOW            | Add E2E for path browsing      |
| Training Module Card   | 1 component test | 0 specs   | LOW            | Add E2E for module navigation  |
| Training Progress Ring | 1 component test | 0 specs   | LOW            | Included in module E2E         |
| Path Detail Pages      | 0 tests          | 0 specs   | NOT COVERED    | Add page rendering tests       |
| Module Detail Pages    | 0 tests          | 0 specs   | NOT COVERED    | Add page rendering tests       |
| Exercise Components    | 0 tests          | 0 specs   | NOT COVERED    | Add exercise interaction tests |
| Progress Tracking      | 0 tests          | 0 specs   | NOT COVERED    | Add server action tests        |
| Exercise Submission    | 0 tests          | 0 specs   | NOT COVERED    | Add server action tests        |

**Training Mode coverage needed:**

- Component tests for all 7 training components (4 exercise types + path/module/progress pages)
- Server action tests for progress tracking, exercise data persistence
- E2E spec: `training-mode.spec.ts` covering path browsing, module navigation, exercise completion, progress dashboard

### 4.4 Workshop Facilitation (SCAFFOLDED)

| Feature Area      | Unit Tests | E2E Tests | Current Status | Target                        |
| ----------------- | ---------- | --------- | -------------- | ----------------------------- |
| Workshop Sessions | 0 tests    | 0 specs   | NOT COVERED    | Build after UI is functional  |
| Session CRUD      | 0 tests    | 0 specs   | NOT COVERED    | Server action tests           |
| Timer/Realtime    | 0 tests    | 0 specs   | NOT COVERED    | Component + integration tests |
| Presentation Mode | 0 tests    | 0 specs   | NOT COVERED    | E2E when built                |

**Workshop coverage needed (after UI is built):**

- Server action tests for workshop session CRUD
- Component tests for timer, presentation mode, participant list
- Integration tests for Supabase Realtime subscription
- E2E spec: `workshop.spec.ts` covering session creation, timer interaction, participant join

### 4.5 Marketing / SEO (BUILT)

| Feature Area            | Unit Tests   | E2E Tests   | Current Status | Target                          |
| ----------------------- | ------------ | ----------- | -------------- | ------------------------------- |
| Step Pages (6)          | 0 tests      | 0 specs     | NOT COVERED    | Add rendering smoke tests       |
| Tool Pages (22)         | 0 tests      | 0 specs     | NOT COVERED    | Add rendering smoke tests       |
| Book Preview Pages (20) | 0 tests      | 0 specs     | NOT COVERED    | Add rendering smoke tests       |
| Glossary Pages (35)     | 0 tests      | 0 specs     | NOT COVERED    | Add rendering smoke tests       |
| Template Pages (17)     | 0 tests      | 0 specs     | NOT COVERED    | Add rendering smoke tests       |
| Sitemap                 | 0 tests      | 0 specs     | NOT COVERED    | Add URL completeness test       |
| Robots.txt              | 0 tests      | 0 specs     | NOT COVERED    | Add rule validation test        |
| JSON-LD                 | 0 tests      | 0 specs     | NOT COVERED    | Add structured data validation  |
| Landing Page            | 0 unit tests | 1 spec file | LOW            | Maintain E2E, add JSON-LD tests |

**Marketing/SEO coverage needed:**

- Smoke tests for static page rendering (batch test all marketing routes)
- Sitemap URL completeness test (verify all 83+ pages present)
- JSON-LD structured data validation (schema.org compliance)
- Robots.txt rule verification
- E2E spec: `marketing-pages.spec.ts` covering navigation between marketing pages, link integrity

---

## 5. Quality Gates and CI Pipeline

### 5.1 CI Pipeline (GitHub Actions)

**Workflow: `ci.yml`** — Runs on push to `main`/`develop` and all PRs.

```
┌───────────┐
│  install   │  pnpm install --frozen-lockfile
└─────┬─────┘
      │
      ├──────────────────┐
      ▼                  ▼
┌───────────┐     ┌───────────┐
│ typecheck  │     │   lint    │    (parallel)
│ tsc --noEmit│    │ eslint    │
└─────┬─────┘     │ format    │
      │           └─────┬─────┘
      │                 │
      └────────┬────────┘
               ▼
         ┌───────────┐
         │   build    │   pnpm build
         └───────────┘

  (parallel with typecheck/lint)
┌───────────┐
│   test     │  pnpm test -- --coverage
│ (upload    │  coverage artifact saved 7 days
│  coverage) │
└───────────┘
```

**Workflow: `e2e.yml`** — Runs on PRs to `main` and manual dispatch.

```
┌───────────┐
│  install   │  pnpm install --frozen-lockfile
└─────┬─────┘
      ▼
┌───────────────┐
│  install      │  playwright install --with-deps chromium
│  browsers     │
└─────┬─────────┘
      ▼
┌───────────────┐
│  run e2e      │  pnpm exec playwright test
│  (upload      │  report + traces on failure
│   report)     │
└───────────────┘
```

**Workflow: `deploy-preview.yml`** — Vercel preview deploy per PR.

**Workflow: `migration-check.yml`** — SQL migration lint.

### 5.2 Quality Gate Definitions

| Gate        | Command                   | Blocking                           | Threshold                   |
| ----------- | ------------------------- | ---------------------------------- | --------------------------- |
| Type Safety | `pnpm typecheck`          | YES — merge blocked                | 0 errors                    |
| Lint        | `pnpm lint`               | YES — merge blocked                | 0 errors                    |
| Format      | `pnpm format:check`       | YES — merge blocked                | 0 violations                |
| Unit Tests  | `pnpm test`               | YES — merge blocked                | 0 failures                  |
| Coverage    | `pnpm test -- --coverage` | SOFT — reported, not blocking      | 40% threshold (target: 60%) |
| Build       | `pnpm build`              | YES — merge blocked                | Successful build            |
| E2E Tests   | `pnpm test:e2e`           | YES — merge blocked on PRs to main | 0 failures                  |

### 5.3 Local Developer Quality Gates

Before committing, all agents and developers must run:

```bash
pnpm typecheck && pnpm lint && pnpm test
```

Before creating a PR, additionally run:

```bash
pnpm build
```

E2E tests are run in CI or manually:

```bash
pnpm exec playwright test                                    # against localhost
BASE_URL=https://pips-app.vercel.app pnpm exec playwright test  # against prod
```

### 5.4 Coverage Threshold Roadmap

| Phase                | Threshold         | Timeline                   |
| -------------------- | ----------------- | -------------------------- |
| Current (MVP)        | 40% (all metrics) | Now                        |
| Phase 5 (Workshop)   | 50% (all metrics) | After Workshop UI is built |
| Phase 6 (Polish)     | 60% (all metrics) | Before beta launch         |
| Phase 7 (Enterprise) | 70% (all metrics) | Before paid tier launch    |

---

## 6. Regression Testing Strategy

### 6.1 Principles

1. **Every bug fix includes a regression test.** The test must reproduce the bug (fail first), then verify the fix (pass after).
2. **E2E tests are the regression safety net.** All 18 E2E spec files are run before any merge to `main`.
3. **Schema changes trigger full test suite.** Any migration change requires `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
4. **Selector drift is treated as a bug.** When E2E tests fail due to DOM changes, fixing the selectors is a P1 task.

### 6.2 Known Regression Risks

| Area                 | Risk                                                          | Mitigation                                                                  |
| -------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `name` vs `title`    | DB column is `title`, frontend uses `name`                    | Systemic fix in 16 files (committed `ec07af7`). Action tests cover mapping. |
| DatePicker           | Multiple DatePicker implementations caused render issues      | Consolidated to single component. Component test exists.                    |
| RLS policy recursion | `org_members` SELECT policy caused infinite recursion         | Dedicated migration fix (`20260303240000`). Integration tests needed.       |
| Profile trigger      | Profile creation on signup failed with missing `display_name` | Trigger fix migration (`20260303220000`). E2E signup tests cover this.      |
| Ticket redirect      | After creation, redirect used wrong path                      | Server action test + E2E test cover this.                                   |
| Audit log actor      | Showed "System" instead of user name                          | Server action mock test covers actor resolution.                            |

### 6.3 Regression Test Execution

| Trigger        | What Runs                              | Blocking                 |
| -------------- | -------------------------------------- | ------------------------ |
| Every commit   | `typecheck + lint + test` (local)      | Developer responsibility |
| Push to branch | `typecheck + lint + test + build` (CI) | PR blocked on failure    |
| PR to `main`   | All CI jobs + E2E suite                | Merge blocked on failure |
| Post-deploy    | E2E suite against production URL       | Alert but not blocking   |
| Weekly         | Full E2E + manual smoke test           | PM review required       |

---

## 7. E2E Test Scenarios by User Flow

### 7.1 Critical User Flows (P0)

These flows represent the core value proposition and must never break.

#### Flow 1: New User to First Project

```
Signup → Verify Email → Create Org → Land on Dashboard → Create Project →
Complete Step 1 (Problem Statement) → Auto-save → View in Project List
```

**Covered by:** `auth-flow.spec.ts`, `onboarding.spec.ts`, `project-crud.spec.ts`
**Gap:** Step 1 form completion not tested end-to-end.

#### Flow 2: Full 6-Step PIPS Lifecycle

```
Create Project → Step 1: Problem Statement + Impact →
Step 2: Fishbone + 5-Why → Step 3: Brainstorming →
Step 4: Criteria Matrix + Implementation Plan →
Step 5: Ticket Creation + Board → Step 6: Evaluation + Complete
```

**Covered by:** `project-lifecycle.spec.ts`, `pips-forms.spec.ts`
**Gap:** Full end-to-end traversal of all 6 steps with form completion is not fully wired.

#### Flow 3: Ticket Lifecycle

```
Create Ticket → Assign to User → Move through Statuses on Board →
Add Comment with @mention → Mark Done
```

**Covered by:** `ticket-crud.spec.ts`, `ticket-workflow.spec.ts`, `kanban-board.spec.ts`
**Gap:** @mention notification delivery not tested.

#### Flow 4: Team Collaboration

```
Owner invites User → User accepts → User joins org →
Owner assigns user to team → User sees assigned tickets
```

**Covered by:** `invite-flow.spec.ts`, `team-management.spec.ts`
**Gap:** End-to-end from invitation email to team assignment not fully connected.

### 7.2 Important User Flows (P1)

#### Flow 5: Knowledge Hub Discovery

```
Navigate to Knowledge Hub → Browse pillars → Read content →
Bookmark an article → Search for topic → Return via bookmark
```

**Covered by:** Not covered.
**Needed:** `knowledge-hub.spec.ts`

#### Flow 6: Dashboard Overview

```
Login → View dashboard → See stat cards → See projects-by-step chart →
See recent activity → Click quick action "New Project"
```

**Covered by:** `dashboard.spec.ts`
**Status:** Adequate.

#### Flow 7: Search and Navigate

```
Press Cmd+K → Type search query → See results grouped by type →
Click result → Navigate to entity
```

**Covered by:** `search-and-nav.spec.ts`
**Status:** Adequate.

#### Flow 8: Settings and Admin

```
Navigate to settings → Update org name → View audit log →
Manage members → Change role → Remove member
```

**Covered by:** `settings-suite.spec.ts`
**Status:** Adequate.

### 7.3 Secondary User Flows (P2)

#### Flow 9: Training Path Completion

```
Navigate to Training → Browse paths → Select path →
View module list → Start exercise → Complete exercise →
Track progress → Complete module
```

**Covered by:** Not covered.
**Needed:** `training-mode.spec.ts` (after full wiring)

#### Flow 10: Workshop Facilitation

```
Create session → Set agenda → Start timer → Participants join →
Capture results → End session
```

**Covered by:** Not covered.
**Needed:** `workshop.spec.ts` (after UI is built)

#### Flow 11: Data Export

```
Navigate to project → Export to CSV → Download file →
Export to PDF → Download file
```

**Covered by:** `csv-pdf-export.spec.ts`
**Status:** Adequate.

#### Flow 12: Marketing Page Funnel

```
Land on homepage → Browse methodology steps → View tool page →
Click "Start Free Trial" → Arrive at signup
```

**Covered by:** `landing.spec.ts` (partial)
**Gap:** Full funnel from marketing to signup not traced.

---

## 8. Test Data Management

### 8.1 Unit Test Data

**Approach:** Inline test data within each test file. No shared fixture files for unit tests.

**Patterns:**

- Zod schema tests use inline valid/invalid objects
- Component tests use inline prop objects
- Server action tests configure `fromResults[]` array per test case

**Guidelines:**

- Use realistic but minimal data (not lorem ipsum)
- Include boundary values (empty strings, max length, zero, negative)
- Name test data descriptively (`validProjectInput`, `missingTitleInput`)

### 8.2 E2E Test Data

**Approach:** Per-test user creation and cleanup via auth fixture.

**User Management:**

```
Test Start → createTestUser() → Use in test → deleteTestUser() → Test End
```

- Each test gets a fresh Supabase user (no cross-test contamination)
- User is created via Supabase Admin API (service role key)
- User is deleted after test completes (even on failure)

**Data Creation:**

- Data is created through the UI during tests (not pre-seeded)
- Unique identifiers include `Date.now()` to avoid collisions
- Example: `E2E Title Only ${Date.now()}`

**Test Factories:**

- `test-factories.ts` provides helper functions for creating projects, tickets, teams
- Factories use the Supabase Admin client for direct database insertion when UI creation is too slow

### 8.3 Seed Data

**File:** `supabase/seed.sql`

**Contents:**

- 1 test user (`marc@example.com` / `TestPassword1`)
- 1 organization ("PIPS Demo", slug: "pips-demo")
- 1 org_member (owner role)
- 1 team ("Core Team")
- 1 sample project (Parking Lot Scenario, all 6 steps populated)
- 5 sample tickets linked to the project

**Content Seed Data:**

- 205 content nodes (seeded via `scripts/seed-content.ts`)
- 4 training paths, 27 modules, 59 exercises (seeded via `scripts/seed-training.ts`)

**Guidelines:**

- Seed data is for local development only, not for automated tests
- E2E tests must not depend on seed data existence
- Content seed data is required for Knowledge Hub and Training Mode E2E tests

### 8.4 Test Environment Variables

| Variable                    | Used By             | Source                    |
| --------------------------- | ------------------- | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`  | E2E                 | `.env.local` or CI secret |
| `SUPABASE_SERVICE_ROLE_KEY` | E2E (admin client)  | `.env.local` or CI secret |
| `E2E_USER_EMAIL`            | E2E (fallback auth) | `.env.local` or CI secret |
| `E2E_USER_PASSWORD`         | E2E (fallback auth) | `.env.local` or CI secret |
| `BASE_URL`                  | E2E                 | CLI override or CI secret |

---

## 9. Performance Testing Plan

### 9.1 Performance Targets

| Metric                         | Target             | Measurement Method |
| ------------------------------ | ------------------ | ------------------ |
| Time to Interactive (TTI)      | < 3s on 4G         | Lighthouse CI      |
| Largest Contentful Paint (LCP) | < 2.5s             | Lighthouse CI      |
| First Input Delay (FID)        | < 100ms            | Lighthouse CI      |
| Cumulative Layout Shift (CLS)  | < 0.1              | Lighthouse CI      |
| Server Action Response (p95)   | < 500ms            | Vercel Analytics   |
| Dashboard Load (authenticated) | < 2s               | Playwright timing  |
| Kanban Board (50 tickets)      | < 1.5s             | Playwright timing  |
| Global Search (debounced)      | < 300ms response   | Playwright timing  |
| Form Auto-save                 | < 200ms round trip | Playwright timing  |

### 9.2 Performance Test Types

#### Lighthouse CI (Automated)

- Run Lighthouse against key pages in CI
- Pages to test: landing page, dashboard, project detail, ticket board, Knowledge Hub
- Block merge if LCP or CLS regress beyond thresholds
- **Tool:** `@lhci/cli` integrated into GitHub Actions

#### Load Testing (Manual, Pre-Launch)

- Simulate 50 concurrent users creating tickets
- Simulate 20 concurrent PIPS form saves
- Simulate search with 1000+ tickets in database
- **Tool:** k6 (Grafana Labs) or Artillery

#### Database Query Performance

- Monitor slow queries via Supabase Dashboard
- Add `EXPLAIN ANALYZE` for complex queries (project list with steps, ticket board with filters)
- Ensure all WHERE clauses on `org_id` use indexes
- Target: no query exceeds 100ms at 1000 rows per table

### 9.3 Performance Testing Schedule

| Phase       | Activity                               | Tool               |
| ----------- | -------------------------------------- | ------------------ |
| Every PR    | Lighthouse CI on landing + dashboard   | GitHub Action      |
| Pre-release | Full Lighthouse audit on all key pages | Manual + CI        |
| Beta launch | Load test with simulated users         | k6                 |
| Monthly     | Query performance audit via Supabase   | Supabase Dashboard |

---

## 10. Security Testing Plan

### 10.1 RLS Policy Testing

RLS is the foundation of multi-tenancy security. Every table with `org_id` must have RLS policies that prevent cross-tenant data access.

**Testing approach:**

| Test Category             | Method                                                                           | Priority |
| ------------------------- | -------------------------------------------------------------------------------- | -------- |
| Cross-org data isolation  | Create 2 orgs, verify User A cannot read Org B data                              | P0       |
| Role enforcement          | Verify each role (owner, admin, manager, member, viewer) has correct permissions | P0       |
| Audit log access          | Verify only owner/admin can read audit_log                                       | P1       |
| Knowledge Hub public read | Verify content_nodes readable without org context                                | P1       |
| User-scoped data          | Verify bookmarks, reading sessions, training progress are user-only              | P1       |
| Service role bypass       | Verify admin client bypasses RLS correctly for system operations                 | P1       |

**Implementation plan:**

1. Create integration test file: `lib/__tests__/rls-policies.test.ts`
2. Use Supabase local development with 2 test users in 2 different orgs
3. For each table, assert:
   - User A SELECT returns only Org A data
   - User A INSERT with Org B `org_id` fails
   - User A UPDATE on Org B row fails
   - User A DELETE on Org B row fails

### 10.2 Auth Boundary Testing

| Test                                   | Expected Result                                   | Priority |
| -------------------------------------- | ------------------------------------------------- | -------- |
| Unauthenticated access to `/dashboard` | Redirect to `/login`                              | P0       |
| Unauthenticated access to `/projects`  | Redirect to `/login`                              | P0       |
| Unauthenticated access to `/api/v1/*`  | 401 response                                      | P0       |
| Expired JWT                            | Auto-refresh via middleware, or redirect to login | P0       |
| Invalid JWT                            | Redirect to `/login`                              | P0       |
| Invitation token reuse                 | Rejected (token consumed)                         | P1       |
| Expired invitation                     | Error message, cannot join                        | P1       |
| Password reset token reuse             | Rejected                                          | P1       |

**Covered by:** `auth-flow.spec.ts` (partial), `project-lifecycle.spec.ts` (redirect test)
**Gap:** Explicit token expiration and reuse tests not implemented.

### 10.3 Input Validation Testing

| Test Area              | Approach                                                                            | Priority |
| ---------------------- | ----------------------------------------------------------------------------------- | -------- |
| SQL injection          | Zod schemas + parameterized Supabase queries prevent injection. Verify via fuzzing. | P1       |
| XSS in comments        | Verify `@mentions` and comment body are sanitized before rendering                  | P1       |
| XSS in form data       | Verify JSONB data rendered in forms is escaped                                      | P1       |
| File upload validation | Verify avatar upload rejects non-image files and oversized files                    | P2       |
| Slug injection         | Verify org slug regex enforcement (`^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$`)             | P1       |

**Covered by:** `validations.test.ts` (Zod schema tests)
**Gap:** XSS rendering tests, file upload validation tests.

### 10.4 Rate Limiting Testing

| Endpoint        | Limit               | Test                                   |
| --------------- | ------------------- | -------------------------------------- |
| Login attempts  | 5 per 15 minutes    | Verify lockout after 5 failed attempts |
| Password reset  | 3 per hour          | Verify throttling                      |
| Invitation send | 10 per hour per org | Verify rate limit error                |

**Covered by:** Not covered.
**Implementation:** Add to E2E tests or dedicated security test suite.

### 10.5 Security Testing Schedule

| Phase       | Activity                                                |
| ----------- | ------------------------------------------------------- |
| Every PR    | Zod schema tests + type checking (blocks invalid input) |
| Pre-release | RLS policy integration tests (manual or automated)      |
| Beta launch | Full auth boundary audit + manual penetration test      |
| Quarterly   | Dependency vulnerability scan (`pnpm audit`)            |

---

## 11. Accessibility Testing Plan

### 11.1 Accessibility Standards

**Target:** WCAG 2.1 Level AA compliance.

**Baseline:** shadcn/ui components built on Radix primitives provide keyboard navigation, ARIA attributes, and focus management out of the box.

### 11.2 Automated Accessibility Testing

**Tool:** `@axe-core/playwright` integrated into E2E tests.

**Approach:**

```typescript
import AxeBuilder from '@axe-core/playwright'

test('dashboard has no a11y violations', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard')
  const results = await new AxeBuilder({ page: authenticatedPage }).analyze()
  expect(results.violations).toEqual([])
})
```

**Pages to audit:**

| Page                       | Priority | Rationale                           |
| -------------------------- | -------- | ----------------------------------- |
| Login / Signup             | P0       | First user contact                  |
| Dashboard                  | P0       | Primary landing page                |
| Project Detail (Step View) | P0       | Core workflow                       |
| Kanban Board               | P0       | Heavy interactivity (drag-and-drop) |
| PIPS Forms (all 18)        | P0       | Core data entry                     |
| Ticket Detail              | P1       | Comment thread, status changes      |
| Knowledge Hub              | P1       | Reading experience                  |
| Command Palette            | P1       | Keyboard-driven                     |
| Settings                   | P2       | Admin function                      |
| Marketing Pages            | P2       | Public-facing                       |

### 11.3 Manual Accessibility Testing

**Keyboard navigation checklist:**

- [ ] All interactive elements reachable via Tab
- [ ] Tab order follows visual layout
- [ ] Focus indicators visible on all focused elements
- [ ] Escape closes modals, dropdowns, command palette
- [ ] Enter/Space activates buttons and links
- [ ] Arrow keys navigate within menus and dropdowns
- [ ] Kanban drag-and-drop has keyboard alternative

**Screen reader testing:**

- [ ] All images have alt text
- [ ] Form labels associated with inputs (htmlFor/id or aria-labelledby)
- [ ] Error messages announced to screen readers (aria-live)
- [ ] Step stepper announces current step
- [ ] Notification badge count announced
- [ ] Toast messages announced (aria-live="polite")

### 11.4 Accessibility Testing Schedule

| Phase       | Activity                                            |
| ----------- | --------------------------------------------------- |
| Every PR    | Axe-core integration in E2E tests (automated)       |
| Pre-release | Keyboard navigation audit on all P0 pages           |
| Beta launch | Screen reader test (VoiceOver + NVDA) on core flows |
| Quarterly   | Full WCAG 2.1 AA compliance review                  |

---

## 12. Release Readiness Checklist

### 12.1 Pre-Release Quality Gates

Every release must satisfy all of the following before deployment to production.

**Automated Gates (blocking):**

- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm format:check` — 0 violations
- [ ] `pnpm test` — 0 failures, coverage above threshold
- [ ] `pnpm build` — successful build
- [ ] `pnpm test:e2e` — 0 failures against staging/preview URL

**Manual Gates (blocking for major releases):**

- [ ] Manual smoke test of 4 critical user flows (see Section 7.1)
- [ ] Database migration reviewed and tested locally
- [ ] No P0/Critical open bugs
- [ ] RLS policy verification for any new tables
- [ ] Performance: no LCP regression on key pages

**Documentation Gates (non-blocking):**

- [ ] Work log updated with release contents
- [ ] Agent Status Board updated
- [ ] CHANGELOG entry written (if applicable)

### 12.2 Deployment Verification

After deploying to production:

- [ ] Health check endpoint responds (`/api/health`)
- [ ] E2E test suite passes against production URL
- [ ] Login and org creation work
- [ ] Existing data loads correctly (no migration side effects)
- [ ] Sentry receives test error (verify error tracking is active)
- [ ] Email delivery works (send test invitation)

### 12.3 Rollback Criteria

Immediately rollback if any of the following occur post-deploy:

- Login or signup is broken
- Data loss or corruption detected
- RLS bypass (cross-tenant data visible)
- Build errors causing 500s on critical pages
- Sentry error rate exceeds 10x baseline

---

## 13. Test Gap Analysis

### 13.1 Critical Gaps (P0 — Must Fix)

| Gap                       | Area          | Risk                                                  | Recommended Action                                                                            |
| ------------------------- | ------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| E2E selector drift        | All E2E specs | 47 tests failing due to DOM changes                   | Add `data-testid` attributes to all interactive elements. Fix selectors in all 18 spec files. |
| No Knowledge Hub E2E      | Knowledge Hub | Hub is BUILT but untested end-to-end                  | Create `knowledge-hub.spec.ts` with pillar navigation, FTS search, bookmark, reading session  |
| No Cadence Bar unit tests | Cadence Bar   | Context builder logic untested                        | Add tests for `buildProductContext()` and `matchContentNodes()`                               |
| No RLS integration tests  | Security      | Cross-tenant isolation verified only by manual checks | Create `rls-policies.test.ts` with multi-user multi-org scenarios                             |

### 13.2 High Priority Gaps (P1 — Should Fix)

| Gap                                     | Area           | Risk                                              | Recommended Action                                                                 |
| --------------------------------------- | -------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| No Training Mode E2E                    | Training       | Scaffolded but no workflow tested                 | Create `training-mode.spec.ts` after full wiring                                   |
| No notification E2E                     | Notifications  | Bell + dropdown tested in component only          | Add notification delivery assertions to ticket/project E2E flows                   |
| No individual PIPS form component tests | 18 PIPS Forms  | Only `form-shell.test.tsx` exists for wrapper     | Add component tests for fishbone, 5-why, criteria matrix, brainstorming at minimum |
| No invitation server action tests       | Invitations    | Only E2E coverage exists                          | Add `invitations/__tests__/actions.test.ts`                                        |
| No team component tests                 | Teams          | Only E2E coverage exists                          | Add team list and team detail component tests                                      |
| No content reader tests                 | Knowledge Hub  | Reader component untested                         | Add rendering + markdown parsing tests                                             |
| No reading session action tests         | Knowledge Hub  | Scroll position persistence untested              | Add server action tests for session CRUD                                           |
| Missing `data-testid` attributes        | All components | E2E selectors fragile; rely on text/role matching | Systematic audit and addition of `data-testid` to interactive elements             |

### 13.3 Medium Priority Gaps (P2 — Plan For)

| Gap                             | Area      | Risk                                        | Recommended Action                                |
| ------------------------------- | --------- | ------------------------------------------- | ------------------------------------------------- |
| No accessibility tests          | All pages | WCAG compliance unverified                  | Integrate axe-core into E2E specs for P0 pages    |
| No performance tests            | All pages | Performance regressions undetected          | Add Lighthouse CI to GitHub Actions               |
| No marketing page smoke tests   | Marketing | 83+ pages untested; broken links undetected | Add batch rendering test for all marketing routes |
| No JSON-LD validation           | SEO       | Structured data correctness unverified      | Add schema.org validation test                    |
| No rate limiting tests          | Auth      | Brute force protection unverified           | Add login throttling E2E test                     |
| No file upload validation tests | Profile   | Malicious file upload unblocked             | Add avatar upload boundary tests                  |
| No sitemap completeness test    | SEO       | Missing pages in sitemap                    | Add URL count and route matching test             |
| No Workshop tests               | Workshop  | UI not built yet                            | Plan tests alongside Workshop UI development      |

### 13.4 Low Priority Gaps (P3 — Nice to Have)

| Gap                             | Area        | Risk                          | Recommended Action                                   |
| ------------------------------- | ----------- | ----------------------------- | ---------------------------------------------------- |
| No cross-browser E2E            | E2E         | Only Chromium tested          | Add Firefox and Safari projects to Playwright config |
| No mobile viewport E2E          | E2E         | Responsive issues undetected  | Add mobile viewport project to Playwright config     |
| No visual regression tests      | UI          | Visual regressions undetected | Integrate Percy or Playwright screenshot comparison  |
| No load testing                 | Performance | Scalability unknown           | Run k6 load tests before paid tier launch            |
| No API response time monitoring | Performance | Slow endpoints undetected     | Integrate Vercel Speed Insights or custom monitoring |

### 13.5 Prioritized Remediation Plan

**Phase 5 (Workshop, next sprint):**

1. Fix all 47 failing E2E tests (selector alignment + `data-testid` addition) — P0
2. Create `knowledge-hub.spec.ts` — P0
3. Add Cadence Bar unit tests — P0
4. Create RLS integration test suite — P0
5. Add PIPS form component tests (fishbone, 5-why, criteria matrix, brainstorming) — P1
6. Add invitation and team unit tests — P1

**Phase 6 (Polish):**

7. Create `training-mode.spec.ts` — P1 (after full wiring)
8. Integrate axe-core accessibility tests — P2
9. Add Lighthouse CI — P2
10. Add marketing page smoke tests — P2
11. Raise coverage threshold to 60% — P2

**Post-launch:**

12. Cross-browser E2E (Firefox, Safari) — P3
13. Mobile viewport E2E — P3
14. Load testing with k6 — P3
15. Visual regression testing — P3
