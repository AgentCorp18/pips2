# AI Agent Coordination Plan -- PIPS 2.0

> **Version:** 1.0
> **Created:** 2026-03-03
> **Author:** Marc Albers + Claude Opus 4.6
> **Status:** Active
> **Repo:** AlberaMarc/pips2 (private)

This document defines how multiple Claude Code agents collaborate to build PIPS 2.0
in parallel without stepping on each other, duplicating work, or introducing merge conflicts.
It is the single source of truth for agent coordination across all development phases.

---

## Table of Contents

1. [Agent Strategy Overview](#1-agent-strategy-overview)
2. [Repository Structure for Collaboration](#2-repository-structure-for-collaboration)
3. [Worktree Strategy](#3-worktree-strategy)
4. [Task Decomposition -- All Phases](#4-task-decomposition----all-phases)
5. [Agent Types & Specializations](#5-agent-types--specializations)
6. [Context Management](#6-context-management)
7. [Quality Assurance Protocol](#7-quality-assurance-protocol)
8. [Merge & Integration Protocol](#8-merge--integration-protocol)
9. [Session Management](#9-session-management)
10. [Communication Protocols](#10-communication-protocols)
11. [File Ownership Matrix](#11-file-ownership-matrix)
12. [Scaling Plan](#12-scaling-plan)
13. [Templates](#13-templates)
14. [Anti-Patterns](#14-anti-patterns)

---

## 1. Agent Strategy Overview

### 1.1 When to Use Agents vs Direct Work

**Use agents (parallel) when:**
- Work items have clear file boundaries (different directories, different DB tables)
- Tasks are independent or have a clear dependency chain
- You need throughput: multiple features built simultaneously
- The phase has well-defined acceptance criteria

**Work directly (single session) when:**
- Debugging a cross-cutting issue that touches many files unpredictably
- Making architectural decisions that affect the whole codebase
- Resolving merge conflicts from agent PRs
- Performing initial project scaffolding (first 30 minutes of Phase 0)
- Reviewing and approving agent PRs

**Rule of thumb:** If you can write the task prompt in under 5 minutes and the agent
does not need to ask clarifying questions, it is a good agent task.

### 1.2 Parallelization Principles

1. **File-level isolation is king.** Two agents must never edit the same file simultaneously.
   If they need to, sequence them: Agent A finishes, merges, then Agent B starts from
   the updated main.

2. **Schema before UI, types before implementation.** Database migrations and shared types
   are sequential bottlenecks. Schedule them first, then fan out.

3. **Test in the same agent session.** Every agent writes and runs tests for its own work.
   Never defer testing to a separate "test agent" for the same feature.

4. **Max parallelism = min(available worktrees, independent tasks).** Do not create more
   agents than you have truly independent work items.

5. **Merge frequently.** Agents on long tasks (4+ hours) should commit and push regularly.
   No agent should accumulate more than ~500 lines of uncommitted changes.

### 1.3 Risk Management

| Risk | Mitigation |
|------|-----------|
| Merge conflicts | File ownership matrix (Section 11), branch naming, merge order rules |
| Duplicated work | Status board checked at session start, work log updated before starting |
| Context drift | Root CLAUDE.md as single source of truth, work log entries after each task |
| Broken main branch | Quality gates before merge (Section 7), integration tests after merge |
| Agent going off-track | Clear task prompts with explicit file scope, pre/post conditions |
| Migration ordering | Timestamp-based with 10-minute gaps between concurrent agents |
| Type errors cascading | `packages/shared/` types are sequential; only one agent edits shared types at a time |

### 1.4 Quality Gates Before Merge

Every agent PR must pass all of these before merge approval:

```
1. tsc --noEmit                    # Zero type errors
2. pnpm lint                       # Zero lint warnings
3. pnpm test                       # All tests pass (unit + integration)
4. pnpm test:e2e (if applicable)   # Playwright e2e for UI changes
5. Bundle size check               # No unexpected size increases
6. Security review                 # RLS policies for new tables, input validation
7. Accessibility check             # aria-labels, keyboard nav, color contrast
```

If any gate fails, the agent fixes the issue before requesting merge. Never merge
a PR that fails type checking, even if "it works at runtime."

---

## 2. Repository Structure for Collaboration

### 2.1 Root CLAUDE.md Design

The root `CLAUDE.md` at `pips2/CLAUDE.md` is the most important file in the repository.
Every agent reads it first. It must contain:

```markdown
# PIPS 2.0 -- Claude Code Instructions

## Section 0: Coordination Protocol
- Read `docs/work-log/` for current project state
- Check `docs/planning/AI_AGENT_COORDINATION.md` for full protocol
- Update work log BEFORE and AFTER each task
- Never edit files outside your assigned scope

## Section 1: Tech Stack
- Next.js 15 (App Router), TypeScript strict, Supabase, Vercel
- Styling: Tailwind + shadcn/ui
- Fonts: DM Sans (body), DM Serif Display (headings)
- State: Zustand stores in apps/web/stores/
- Testing: Vitest (unit), Playwright (e2e)
- Monorepo: Turborepo + pnpm

## Section 2: Code Style
- Functional components with arrow functions
- Named exports (not default exports)
- 2-space indentation
- Path aliases: @/* for apps/web/*, ~/shared/* for packages/shared/*
- Files under 200 lines preferred
- Co-locate component + hook + types + test

## Section 3: Git Conventions
- Branch: agent/{phase}-{feature} (e.g., agent/p0-auth-flows)
- Commits: imperative mood, concise
- Always work on feature branches
- Never force push to main

## Section 4: Commands
- pnpm dev          # Start dev server
- pnpm build        # Production build
- pnpm lint         # ESLint
- pnpm test         # Vitest
- pnpm test:e2e     # Playwright
- tsc --noEmit      # Type check
- pnpm db:migrate   # Run Supabase migrations
- pnpm db:types     # Generate TypeScript types from DB schema

## Section 5: Current Phase
[Updated as project progresses]
- Active phase: Phase 0
- See docs/planning/PRODUCT_ROADMAP.md for full roadmap
- See docs/work-log/ for session history
```

### 2.2 Directory-Level CLAUDE.md Files

Place focused CLAUDE.md files in key directories so agents working in that area
get additional context without overloading the root file.

```
pips2/
├── CLAUDE.md                          # Root -- every agent reads this
├── apps/web/CLAUDE.md                 # Next.js app conventions
├── apps/web/app/CLAUDE.md             # App Router routing rules
├── apps/web/components/CLAUDE.md      # Component patterns, shadcn usage
├── apps/web/stores/CLAUDE.md          # Zustand store patterns
├── packages/shared/CLAUDE.md          # Shared types rules
├── supabase/CLAUDE.md                 # Migration conventions, RLS rules
├── supabase/functions/CLAUDE.md       # Edge Function patterns
└── tests/CLAUDE.md                    # Testing conventions
```

**Example: `apps/web/components/CLAUDE.md`**

```markdown
# Component Conventions

## File Structure
Each component gets its own directory:
  components/
    button/
      button.tsx          # Component
      button.test.tsx     # Tests
      use-button.ts       # Hook (if needed)
      button.types.ts     # Types (if complex)
      index.ts            # Re-exports

## Patterns
- Use shadcn/ui as base, extend with Tailwind
- DM Sans for body text, DM Serif Display for headings
- All interactive elements need aria-labels
- Use React.memo for list items and expensive renders
- Export from index.ts: `export { Button } from './button'`

## Do NOT
- Create global CSS files (use Tailwind)
- Import from other component internals (only from index.ts)
- Put business logic in components (use hooks/stores)
```

**Example: `supabase/CLAUDE.md`**

```markdown
# Supabase Conventions

## Migrations
- File naming: YYYYMMDDHHMMSS_description.sql
- When multiple agents create migrations in parallel, space timestamps
  10 minutes apart (Agent A: XX:00:00, Agent B: XX:10:00, etc.)
- Every table MUST have RLS enabled
- Every table MUST have created_at, updated_at columns
- Multi-tenant: every user-facing table has org_id with RLS policy

## RLS Policy Pattern
CREATE POLICY "users can view own org data"
  ON table_name FOR SELECT
  USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

## Edge Functions
- One function per file in supabase/functions/
- Use Deno, import from https://deno.land/std
- Always validate input with Zod
- Always check auth: const user = supabase.auth.getUser()
```

### 2.3 Work Log Format

Work logs live at `docs/work-log/YYYY-MM-DD.md`. One file per day, multiple entries.

```markdown
# Work Log -- 2026-03-03

## Session 1 (09:00-12:00) -- Marc + 3 agents

### Agent A: Schema Agent (worktree: agent/p0-schema)
- **Task:** Create core database schema (orgs, profiles, projects, steps)
- **Status:** COMPLETE
- **Files changed:**
  - supabase/migrations/20260303090000_core_schema.sql (new)
  - supabase/migrations/20260303090100_rls_policies.sql (new)
  - packages/shared/src/types/database.ts (new)
- **Tests:** 12 migration tests passing
- **PR:** #1 (merged)
- **Notes:** Added org_id to all tables, RLS enforced

### Agent B: Scaffold Agent (worktree: agent/p0-scaffold)
- **Task:** Next.js project setup, CI/CD, linting
- **Status:** COMPLETE
- **Files changed:**
  - apps/web/app/layout.tsx (new)
  - apps/web/app/page.tsx (new)
  - .github/workflows/ci.yml (new)
  - [12 more files]
- **Tests:** Build passes, lint passes
- **PR:** #2 (merged after #1)
- **Notes:** Turbo configured, pnpm workspaces set up

### Agent C: Design System Agent (worktree: agent/p0-design-system)
- **Task:** Core UI components (Button, Input, Card, Modal)
- **Status:** IN PROGRESS (80%)
- **Blockers:** None
- **Next:** Finish Modal component, write tests
```

### 2.4 How Agents Discover Project State

Every agent session starts with this discovery sequence:

```
1. Read pips2/CLAUDE.md                       # Project rules
2. Read docs/work-log/ (latest file)          # What happened recently
3. Read docs/planning/PRODUCT_ROADMAP.md      # Where we are in the roadmap
4. Run: git log --oneline -20                 # Recent commits
5. Run: git branch -a                         # Active branches
6. Run: tsc --noEmit                          # Current type health
7. Run: pnpm test                             # Current test health
```

This takes ~2 minutes and ensures the agent has full situational awareness.

---

## 3. Worktree Strategy

### 3.1 When to Use Worktrees

**Always use worktrees when:**
- Running 2+ agents in parallel
- An agent's task will take more than 30 minutes
- The task involves creating or modifying 3+ files

**Skip worktrees when:**
- Quick single-file fix (under 5 minutes)
- Only reading/analyzing code (no changes)
- Running a single agent for a quick task

### 3.2 Branch Naming Convention

```
agent/{phase}-{feature}
```

Examples:
```
agent/p0-schema              # Phase 0, database schema
agent/p0-auth-flows          # Phase 0, authentication
agent/p0-design-system       # Phase 0, UI components
agent/p1-pips-workflow        # Phase 1, PIPS 6-step flow
agent/p1-dashboard           # Phase 1, main dashboard
agent/p2-kanban              # Phase 2, Kanban board
agent/p3-analytics-charts    # Phase 3, chart components
agent/p4-jira-integration    # Phase 4, Jira connector
agent/p5-white-label         # Phase 5, theming engine
agent/p6-ai-assistant        # Phase 6, AI features
```

Rules:
- Always lowercase
- Hyphens between words
- Phase prefix for ordering
- Descriptive but short (under 30 characters after `agent/`)

### 3.3 Worktree Lifecycle

```
STEP 1: CREATE
  Command:  claude --worktree agent/p0-schema
  Result:   Creates .claude/worktrees/agent-p0-schema/
            with a new branch based on current HEAD

STEP 2: WORK
  Agent works within the worktree directory.
  Commits frequently (every 30-60 minutes or after each logical unit).
  Updates work log entries as tasks complete.

STEP 3: TEST
  Agent runs full quality gate suite:
    tsc --noEmit
    pnpm lint
    pnpm test
    pnpm test:e2e (if UI changes)

STEP 4: PUSH & PR
  git push -u origin agent/p0-schema
  gh pr create --title "P0: Core database schema" \
    --body "$(cat <<'EOF'
  ## Summary
  - Created core tables: orgs, profiles, projects, steps
  - RLS policies for multi-tenancy
  - Generated TypeScript types

  ## Test plan
  - [ ] Migration applies cleanly
  - [ ] RLS policies tested
  - [ ] Types match schema
  EOF
  )"

STEP 5: REVIEW
  Marc reviews the PR (or another agent runs /code-review).
  Fix any issues in the same worktree.

STEP 6: MERGE
  Merge via GitHub PR (squash merge preferred for clean history).
  Other agents rebase onto updated main:
    git fetch origin
    git rebase origin/main

STEP 7: CLEANUP
  The worktree is cleaned up on session exit (Claude Code prompts).
  Or manually:
    git worktree remove .claude/worktrees/agent-p0-schema
    git branch -d agent/p0-schema
```

### 3.4 File Isolation Rules

Each worktree agent is assigned a file scope. The agent must NOT edit files outside
this scope. If it needs a change outside scope, it documents the need in the work log
and the coordinating session (Marc) handles it.

Example scopes:

| Agent | Owns (can edit) | Shared (read-only) |
|-------|----------------|-------------------|
| Schema Agent | `supabase/migrations/`, `packages/shared/src/types/database.ts` | Everything else |
| Component Agent | `apps/web/components/{assigned}/` | `packages/shared/`, other components |
| API Agent | `apps/web/app/api/`, `supabase/functions/` | Schema types, components |
| Test Agent | `tests/e2e/`, `tests/integration/` | Everything (read-only for source) |

### 3.5 Merge Coordination Protocol

When multiple agents finish around the same time:

```
1. MERGE ORDER: Schema changes first, then shared types, then API, then UI, then tests.
2. REBASE CHAIN: After each merge, remaining agents rebase:
     Agent B: git fetch origin && git rebase origin/main
     Agent C: git fetch origin && git rebase origin/main
3. CONFLICT RESOLUTION: If rebase has conflicts, the agent pauses and reports.
   Marc resolves or instructs the agent.
4. RE-TEST: After rebase, re-run quality gates before pushing.
```

### 3.6 Maximum Concurrent Worktrees

- **Phase 0-1:** 2-4 concurrent worktrees (foundation is more sequential)
- **Phase 2-3:** 4-6 concurrent worktrees (features are more independent)
- **Phase 4-5:** 6-8 concurrent worktrees (integrations are highly parallel)
- **Phase 6:** 2-4 concurrent worktrees (AI features have cross-cutting concerns)

Hard limit: **8 worktrees.** Beyond this, context management overhead exceeds
the parallelism benefit. You spend more time coordinating than building.

---

## 4. Task Decomposition -- All Phases

### Phase 0: Foundation (Est. 20-30 agent-hours)

This phase is the most sequential because everything depends on the schema and scaffold.

```
WAVE 1 (parallel pair):
  Agent A: Project Scaffold         Agent B: Database Schema
  ────────────────────────         ──────────────────────────
  - Turborepo + pnpm setup         - Core tables (orgs, profiles,
  - Next.js 15 app scaffold          projects, steps, tickets)
  - TypeScript strict config        - RLS policies for multi-tenancy
  - ESLint + Prettier config        - Seed data
  - Tailwind + shadcn/ui setup     - Migration files
  - CI/CD pipeline (.github/)       - Type generation script
  - Vercel config                   - supabase/CLAUDE.md
  - Root CLAUDE.md
  Est: 3-4 hours                    Est: 3-4 hours
  Scope: apps/web/*, config files   Scope: supabase/*, packages/shared/types/
  Depends on: nothing               Depends on: nothing

WAVE 2 (parallel pair, after WAVE 1 merges):
  Agent C: Design System            Agent D: Auth Flows
  ────────────────────────         ──────────────────────────
  - Button, Input, Select, Card     - Supabase Auth config
  - Modal, Toast, Sidebar           - Login / Register pages
  - Typography (DM Sans/Serif)      - Password reset flow
  - Loading states, skeletons       - Email verification
  - Theme tokens (colors, spacing)  - Session management
  - Component tests (Vitest)        - Auth middleware
  - Storybook setup (optional)      - Protected route wrapper
  - components/CLAUDE.md            - Profile setup flow
  Est: 4-5 hours                    Est: 3-4 hours
  Scope: apps/web/components/ui/    Scope: apps/web/app/(auth)/,
         apps/web/lib/theme/                 apps/web/lib/supabase/,
                                             apps/web/stores/auth-store.ts
  Depends on: Agent A (scaffold)    Depends on: Agent A + Agent B

WAVE 3 (parallel pair, after WAVE 2):
  Agent E: Multi-Tenancy            Agent F: Navigation & Layout
  ────────────────────────         ──────────────────────────
  - Org creation flow               - App shell layout
  - Org switcher component          - Sidebar navigation
  - Invite system (email)           - Breadcrumbs
  - Role assignment (owner/admin/   - Top bar (user menu, org switcher)
    member/viewer)                  - Mobile responsive layout
  - Org settings page               - 404, 500, loading pages
  - Org-scoped middleware            - Keyboard shortcuts
  Est: 3-4 hours                    Est: 3-4 hours
  Scope: apps/web/app/(app)/org/,   Scope: apps/web/app/(app)/layout.tsx,
         apps/web/stores/org-store,          apps/web/components/layout/
         supabase/functions/invite/
  Depends on: Agent C + Agent D     Depends on: Agent C + Agent D
```

**Phase 0 Dependency Graph:**
```
Agent A (Scaffold) ──┬──→ Agent C (Design) ──┬──→ Agent E (Multi-Tenant)
                     │                        │
Agent B (Schema)   ──┴──→ Agent D (Auth)    ──┴──→ Agent F (Nav & Layout)
```

Total: 6 agents across 3 waves. ~20-25 agent-hours.

---

### Phase 1: MVP -- PIPS 6-Step Workflow (Est. 30-40 agent-hours)

The core product: implementing the PIPS methodology as a guided workflow.

```
WAVE 1 (3 parallel agents):
  Agent A: Project CRUD             Agent B: PIPS Step Engine        Agent C: Dashboard
  ──────────────────────           ──────────────────────           ──────────────────
  - Project creation form           - Step 1: Problem Definition     - Project list view
  - Project settings page           - Step 2: Investigation          - Recent activity feed
  - Project deletion (soft)         - Step 3: Problem Analysis       - Quick stats cards
  - Project archive/restore         - Step 4: Solution Design        - Search/filter projects
  - Project member management       - Step 5: Implementation Plan    - Project status badges
  - Project status tracking         - Step 6: Sustain & Monitor      - Empty states
  Est: 4-5 hours                    - Step navigation/validation     Est: 3-4 hours
  Scope: apps/web/app/(app)/        - Progress persistence           Scope: apps/web/app/(app)/
         projects/,                 - Step completion rules                  dashboard/,
         apps/web/stores/           Est: 6-8 hours                          apps/web/components/
         project-store.ts           Scope: apps/web/app/(app)/              dashboard/
  Depends on: Phase 0                      projects/[id]/steps/,
                                           apps/web/stores/
                                           step-store.ts,
                                           packages/shared/src/
                                           types/steps.ts
                                    Depends on: Phase 0 + Agent A schema

WAVE 2 (3 parallel agents, after WAVE 1):
  Agent D: Form Builder             Agent E: Team Management        Agent F: Basic Tickets
  ──────────────────────           ──────────────────────           ──────────────────
  - Dynamic form rendering          - Team list/create/edit          - Ticket creation form
  - Field types: text, number,      - Team member management         - Ticket list view
    select, date, file upload       - Team-project assignment        - Ticket detail page
  - Validation (Zod schemas)        - Team roles & permissions       - Status workflow (open/
  - Auto-save (debounced)           - Team activity log                in-progress/done/closed)
  - Form templates per step         Est: 3-4 hours                   - Priority levels
  - Rich text editor (Tiptap)       Scope: apps/web/app/(app)/       - Assignee selection
  Est: 5-6 hours                           teams/,                   Est: 4-5 hours
  Scope: apps/web/components/              apps/web/stores/          Scope: apps/web/app/(app)/
         forms/,                           team-store.ts                    projects/[id]/tickets/,
         apps/web/lib/                                                      apps/web/stores/
         form-utils.ts                                                      ticket-store.ts
  Depends on: WAVE 1                Depends on: WAVE 1              Depends on: WAVE 1

WAVE 3 (2 parallel agents, after WAVE 2):
  Agent G: Notifications            Agent H: Integration Tests
  ──────────────────────           ──────────────────────
  - In-app notification system      - E2E: full PIPS 6-step flow
  - Notification bell + dropdown    - E2E: project lifecycle
  - Email notifications (Resend)    - E2E: team management
  - Notification preferences        - Integration: form save/load
  - Real-time via Supabase          - Integration: ticket workflow
  Est: 3-4 hours                    - Performance baselines
  Scope: apps/web/components/       Est: 4-5 hours
         notifications/,            Scope: tests/e2e/,
         supabase/functions/                tests/integration/
         notify/
  Depends on: WAVE 2                Depends on: WAVE 2
```

**Phase 1 Dependency Graph:**
```
                    ┌──→ Agent D (Forms)    ──┐
Agent A (Projects)──┤                         ├──→ Agent G (Notifications)
                    ├──→ Agent E (Teams)    ──┤
Agent B (Steps)   ──┤                         ├──→ Agent H (E2E Tests)
                    └──→ Agent F (Tickets)  ──┘
Agent C (Dashboard)─────────────────────────────→ (merges independently)
```

Total: 8 agents across 3 waves. ~30-40 agent-hours.

---

### Phase 2: Full Ticketing System (Est. 35-45 agent-hours)

```
WAVE 1 (4 parallel agents):
  Agent A: Parent/Child Tickets     Agent B: Kanban Board
  ──────────────────────           ──────────────────────
  - Subtask creation                - Drag-and-drop columns
  - Parent ticket rollup stats      - Status column config
  - Tree view of ticket hierarchy   - Card component (priority,
  - Dependency tracking               assignee, labels)
  - Bulk operations on children     - Swimlane grouping option
  Est: 4-5 hours                    - Virtual scrolling for perf
  Scope: apps/web/app/(app)/        Est: 5-6 hours
         projects/[id]/tickets/,    Scope: apps/web/components/
         packages/shared/src/              kanban/,
         types/tickets.ts                  apps/web/app/(app)/
  Depends on: Phase 1                      projects/[id]/board/
                                    Depends on: Phase 1

  Agent C: Search & Filters         Agent D: Ticket Detail V2
  ──────────────────────           ──────────────────────
  - Full-text search (Postgres)     - Activity timeline
  - Advanced filter builder         - Comment thread (threaded)
  - Saved filter views              - File attachments
  - Filter URL serialization        - Time tracking
  - Search results highlighting     - Custom fields
  Est: 4-5 hours                    - Watchers/subscribers
  Scope: apps/web/components/       Est: 5-6 hours
         search/,                   Scope: apps/web/app/(app)/
         apps/web/lib/search/,             projects/[id]/tickets/
         supabase/migrations/              [ticketId]/,
         (search index)                    supabase/functions/
  Depends on: Phase 1                      upload/
                                    Depends on: Phase 1

WAVE 2 (3 parallel agents, after WAVE 1):
  Agent E: Bulk Operations          Agent F: Notification V2       Agent G: Ticket E2E
  ──────────────────────           ──────────────────────         ──────────────────
  - Multi-select tickets            - @mentions in comments        - E2E: Kanban drag/drop
  - Bulk status change              - Subscription rules           - E2E: parent/child CRUD
  - Bulk reassign                   - Digest emails (daily/weekly) - E2E: search & filter
  - Bulk label/priority             - Webhook notifications        - E2E: bulk operations
  - CSV export                      - Real-time ticket updates     - E2E: file attachments
  Est: 3-4 hours                    Est: 3-4 hours                 - Performance regression
  Scope: apps/web/components/       Scope: supabase/functions/     Est: 4-5 hours
         tickets/bulk/,                    notify-v2/,             Scope: tests/e2e/tickets/,
         apps/web/app/api/                 apps/web/components/           tests/integration/
         tickets/bulk/                     notifications/
  Depends on: WAVE 1                Depends on: WAVE 1             Depends on: WAVE 1
```

Total: 7 agents across 2 waves. ~35-45 agent-hours.

---

### Phase 3: Analytics & Reporting (Est. 25-35 agent-hours)

```
WAVE 1 (3 parallel agents):
  Agent A: Analytics Engine         Agent B: Dashboard Charts       Agent C: Report Builder
  ──────────────────────           ──────────────────────          ──────────────────
  - Metrics calculation service     - Project health gauge          - Report templates
  - Data aggregation queries        - Step completion funnel         - Custom date ranges
  - Time-series data storage        - Ticket velocity chart          - Org-wide vs project
  - Caching layer (Redis or         - Team workload distribution    - Scheduled reports
    Postgres materialized views)    - Burndown/burnup charts         - Export: PDF, CSV, XLSX
  - API endpoints for metrics       - Charts: Recharts or            Est: 5-6 hours
  Est: 5-6 hours                      Victory (TBD)                 Scope: apps/web/app/(app)/
  Scope: apps/web/lib/analytics/,   Est: 4-5 hours                         reports/,
         supabase/functions/        Scope: apps/web/components/            apps/web/lib/export/,
         analytics/,                       charts/,                        supabase/functions/
         supabase/migrations/              apps/web/app/(app)/            report/
         (materialized views)              analytics/
  Depends on: Phase 1-2             Depends on: Agent A            Depends on: Agent A

WAVE 2 (2 parallel agents, after WAVE 1):
  Agent D: Executive Dashboard      Agent E: Analytics Tests
  ──────────────────────           ──────────────────────
  - Org-level summary view          - Unit: metric calculations
  - KPI cards with trends           - Integration: aggregation queries
  - Comparison (period over period) - E2E: dashboard interactions
  - Export executive summary         - E2E: report generation
  - Shareable dashboard links        - Performance: query timing
  Est: 4-5 hours                     Est: 3-4 hours
  Scope: apps/web/app/(app)/        Scope: tests/
         analytics/executive/
  Depends on: WAVE 1                Depends on: WAVE 1
```

Total: 5 agents across 2 waves. ~25-35 agent-hours.

---

### Phase 4: Integrations (Est. 35-50 agent-hours)

Integrations are highly parallel -- each external system is independent.

```
WAVE 1 (4 parallel agents):
  Agent A: Public REST API          Agent B: Jira Integration       Agent C: Azure DevOps       Agent D: Webhook System
  ──────────────────────           ──────────────────────          ──────────────────          ──────────────────
  - API key management              - OAuth2 flow with Jira         - OAuth2 flow with ADO      - Webhook registration
  - Rate limiting middleware        - Issue sync (bidirectional)    - Work item sync             - Event types catalog
  - OpenAPI spec generation         - Status mapping config         - Status mapping config      - Payload signing
  - Versioned endpoints (/v1/)      - Field mapping config          - Field mapping config       - Retry logic (exp backoff)
  - API documentation page          - Conflict resolution           - Conflict resolution        - Webhook logs/history
  - Pagination, filtering           - Sync status dashboard         - Sync status dashboard      - Test endpoint
  Est: 6-8 hours                    Est: 6-8 hours                  Est: 6-8 hours               Est: 4-5 hours
  Scope: apps/web/app/api/v1/,     Scope: apps/web/app/(app)/     Scope: apps/web/app/(app)/   Scope: apps/web/app/api/
         apps/web/lib/api/,                integrations/jira/,            integrations/ado/,            webhooks/,
         packages/shared/src/              supabase/functions/            supabase/functions/           supabase/functions/
         types/api.ts                      jira-sync/                     ado-sync/                     webhook/
  Depends on: Phase 1-2             Depends on: Phase 1-2           Depends on: Phase 1-2        Depends on: Phase 1-2

WAVE 2 (3 parallel agents, after WAVE 1):
  Agent E: Slack Integration        Agent F: Email Integration      Agent G: Integration Tests
  ──────────────────────           ──────────────────────          ──────────────────
  - Slack app + bot setup           - Email-to-ticket creation      - E2E: API CRUD operations
  - Ticket notifications            - Email notifications (Resend)  - Integration: Jira sync mock
  - Slash commands (/pips)          - Email templates               - Integration: ADO sync mock
  - Channel-project linking         - Unsubscribe management        - Integration: webhook delivery
  Est: 4-5 hours                    Est: 3-4 hours                  - Load testing: API endpoints
  Scope: apps/web/app/api/         Scope: supabase/functions/      Est: 5-6 hours
         slack/,                           email/,                 Scope: tests/
         supabase/functions/               apps/web/app/(app)/
         slack/                            settings/email/
  Depends on: WAVE 1                Depends on: WAVE 1              Depends on: WAVE 1
```

Total: 7 agents across 2 waves. ~35-50 agent-hours.

---

### Phase 5: White-Label & Enterprise (Est. 30-40 agent-hours)

```
WAVE 1 (3 parallel agents):
  Agent A: Theming Engine           Agent B: SSO (SAML/OIDC)       Agent C: Advanced RBAC
  ──────────────────────           ──────────────────────          ──────────────────
  - Theme configuration schema      - SAML 2.0 IdP integration     - Permission system overhaul
  - CSS custom properties runtime   - OIDC provider support         - Custom role creation
  - Logo/brand upload + storage     - SSO-only enforcement          - Granular permissions matrix
  - Preview mode                    - Just-in-time provisioning     - Permission inheritance
  - Theme inheritance (org → proj)  - Directory sync (SCIM)         - API permission scopes
  - Built-in theme presets          Est: 6-8 hours                  Est: 5-6 hours
  Est: 5-6 hours                    Scope: apps/web/app/(auth)/    Scope: packages/shared/src/
  Scope: apps/web/lib/theme/,             sso/,                          types/permissions.ts,
         apps/web/app/(app)/               supabase/functions/            apps/web/lib/rbac/,
         settings/branding/                sso/,                          supabase/migrations/
                                           apps/web/lib/auth/             (permission tables)
  Depends on: Phase 0-2             Depends on: Phase 0             Depends on: Phase 0-2

WAVE 2 (3 parallel agents, after WAVE 1):
  Agent D: Audit Logging            Agent E: Data Residency         Agent F: Enterprise Tests
  ──────────────────────           ──────────────────────          ──────────────────
  - Audit event capture             - Region selector per org       - E2E: theme switching
  - Audit log viewer/search         - Data isolation enforcement    - E2E: SSO flows (mocked IdP)
  - Export audit logs (CSV/JSON)    - Compliance dashboard          - E2E: RBAC permission checks
  - Retention policies              - Data export (GDPR)            - E2E: audit log generation
  - Admin audit dashboard           - Data deletion workflows       - Security: penetration testing
  Est: 4-5 hours                    Est: 4-5 hours                  Est: 5-6 hours
  Scope: apps/web/app/(app)/       Scope: supabase/functions/      Scope: tests/
         settings/audit/,                  data-residency/,
         supabase/functions/               apps/web/app/(app)/
         audit/                            settings/compliance/
  Depends on: WAVE 1                Depends on: WAVE 1              Depends on: WAVE 1
```

Total: 6 agents across 2 waves. ~30-40 agent-hours.

---

### Phase 6: AI Features (Est. 20-30 agent-hours)

AI features have more cross-cutting concerns, so parallelism is more limited.

```
WAVE 1 (2 parallel agents):
  Agent A: AI Infrastructure        Agent B: AI Problem Analysis
  ──────────────────────           ──────────────────────
  - Claude API client setup         - Root cause suggestion engine
  - Token usage tracking            - Problem classification
  - Prompt template system          - Similar past problems search
  - Rate limiting per org           - Investigation checklist
  - AI usage dashboard                generator
  - Cost allocation per project     - "Ask AI" sidebar component
  Est: 4-5 hours                    Est: 5-6 hours
  Scope: apps/web/lib/ai/,         Scope: apps/web/components/ai/,
         supabase/functions/ai/,           apps/web/app/(app)/
         packages/shared/src/              projects/[id]/steps/
         types/ai.ts                       (AI integration points)
  Depends on: Phase 1               Depends on: Agent A (partial)

WAVE 2 (3 parallel agents, after WAVE 1):
  Agent C: AI Solution Generator    Agent D: AI Report Writer       Agent E: AI Tests
  ──────────────────────           ──────────────────────          ──────────────────
  - Solution brainstorming          - Auto-generate PIPS reports    - Unit: prompt templates
  - Implementation plan drafts      - Executive summary generation  - Integration: Claude API mock
  - Risk assessment suggestions     - Trend narrative generation    - E2E: AI sidebar interactions
  - Resource estimation             - Natural language querying      - Cost: token usage tracking
  Est: 4-5 hours                    Est: 4-5 hours                  Est: 3-4 hours
  Scope: apps/web/components/ai/   Scope: supabase/functions/      Scope: tests/
         solution/,                        ai-report/,
         supabase/functions/               apps/web/app/(app)/
         ai-solution/                      reports/ai/
  Depends on: WAVE 1                Depends on: WAVE 1              Depends on: WAVE 1
```

Total: 5 agents across 2 waves. ~20-30 agent-hours.

---

### Full Project Summary

| Phase | Agents | Waves | Est. Hours | Key Bottleneck |
|-------|--------|-------|-----------|----------------|
| 0: Foundation | 6 | 3 | 20-25 | Schema must complete before auth |
| 1: MVP | 8 | 3 | 30-40 | PIPS step engine is complex |
| 2: Ticketing | 7 | 2 | 35-45 | Kanban drag-drop complexity |
| 3: Analytics | 5 | 2 | 25-35 | Materialized views design |
| 4: Integrations | 7 | 2 | 35-50 | External API rate limits |
| 5: Enterprise | 6 | 2 | 30-40 | SSO/SAML complexity |
| 6: AI Features | 5 | 2 | 20-30 | Prompt engineering iteration |
| **Total** | **44 tasks** | **16 waves** | **195-265** | |

---

## 5. Agent Types & Specializations

### 5.1 Schema Agent

**Purpose:** Database schema design, migrations, RLS policies, type generation.

| Attribute | Details |
|-----------|---------|
| **Owns** | `supabase/migrations/`, `supabase/seed.sql`, `packages/shared/src/types/database.ts` |
| **Never touches** | `apps/web/components/`, `apps/web/app/`, `tests/e2e/` |
| **Pre-conditions** | Supabase project exists, `supabase/config.toml` configured |
| **Post-conditions** | Migrations apply cleanly (`pnpm db:migrate`), types generated (`pnpm db:types`), RLS policies tested |
| **Skills** | SQL, Postgres, Supabase RLS, Zod schema validation |

**Checklist before completion:**
- [ ] Every table has `id`, `created_at`, `updated_at` columns
- [ ] Every user-facing table has `org_id` column with RLS
- [ ] RLS policies tested with different user roles
- [ ] Seed data creates test org + users
- [ ] `packages/shared/src/types/database.ts` matches schema exactly
- [ ] Migration timestamp does not collide with concurrent agents

---

### 5.2 Component Agent

**Purpose:** Building UI components with shadcn/ui + Tailwind.

| Attribute | Details |
|-----------|---------|
| **Owns** | `apps/web/components/{assigned-scope}/` |
| **Never touches** | `supabase/`, `packages/shared/src/types/database.ts`, other agents' component directories |
| **Pre-conditions** | Design system tokens exist, shadcn/ui installed, Tailwind configured |
| **Post-conditions** | Components render correctly, tests pass, accessible (aria-labels), responsive |
| **Skills** | React, TypeScript, Tailwind, shadcn/ui, accessibility |

**Checklist before completion:**
- [ ] Component has unit test (Vitest + React Testing Library)
- [ ] All interactive elements have `aria-label` or `aria-labelledby`
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Responsive at mobile (375px), tablet (768px), desktop (1280px)
- [ ] Uses DM Sans for body, DM Serif Display for headings
- [ ] Named export from `index.ts`
- [ ] Props typed with explicit interface (not inline)
- [ ] Loading and error states handled

---

### 5.3 API Agent

**Purpose:** Server-side routes, Supabase Edge Functions, data fetching.

| Attribute | Details |
|-----------|---------|
| **Owns** | `apps/web/app/api/`, `supabase/functions/`, `apps/web/lib/api/` |
| **Never touches** | `apps/web/components/`, `apps/web/stores/` (reads types from shared) |
| **Pre-conditions** | Database schema finalized, shared types available |
| **Post-conditions** | API endpoints tested, error handling consistent, auth enforced |
| **Skills** | Next.js API routes, Supabase Edge Functions, Zod validation |

**Checklist before completion:**
- [ ] Input validated with Zod (never trust client data)
- [ ] Auth checked on every endpoint (`auth.getUser()`)
- [ ] Org-scoped queries use RLS (never bypass with service role in app code)
- [ ] Error responses follow consistent format: `{ error: string, code: string }`
- [ ] Rate limiting on public endpoints
- [ ] Integration tests cover happy path + error cases

---

### 5.4 Integration Agent

**Purpose:** Third-party service integrations (Jira, Azure DevOps, Slack, etc.).

| Attribute | Details |
|-----------|---------|
| **Owns** | `apps/web/app/(app)/integrations/{service}/`, `supabase/functions/{service}-sync/` |
| **Never touches** | Core schema, other integrations, shared types (unless adding integration-specific types) |
| **Pre-conditions** | Core ticketing system complete (Phase 1-2), API authentication working |
| **Post-conditions** | OAuth flow works, bidirectional sync tested, conflict resolution defined |
| **Skills** | OAuth2, REST APIs, webhook handling, conflict resolution |

**Checklist before completion:**
- [ ] OAuth2 token refresh implemented
- [ ] Webhook signature validation
- [ ] Sync conflict resolution documented
- [ ] Rate limiting respects external API limits
- [ ] Sync status visible in UI
- [ ] Error recovery (retry with exponential backoff)
- [ ] Integration can be disconnected cleanly

---

### 5.5 Test Agent

**Purpose:** End-to-end tests, integration tests, performance testing.

| Attribute | Details |
|-----------|---------|
| **Owns** | `tests/e2e/`, `tests/integration/`, `tests/performance/` |
| **Never touches** | Source code (read-only access to everything) |
| **Pre-conditions** | Features are complete and merged to the branch being tested |
| **Post-conditions** | All tests pass, edge cases covered, performance baselines set |
| **Skills** | Playwright, Vitest, performance testing, test design |

**Checklist before completion:**
- [ ] Happy path e2e for every user flow
- [ ] Error/edge case coverage (empty states, max limits, invalid input)
- [ ] Authentication edge cases (expired session, wrong org)
- [ ] Performance baseline recorded (page load, API response time)
- [ ] Tests run in CI without flakiness (no random timeouts)
- [ ] Test data setup/teardown is clean (no test pollution)

---

### 5.6 DevOps Agent

**Purpose:** CI/CD pipelines, infrastructure, monitoring, deployment.

| Attribute | Details |
|-----------|---------|
| **Owns** | `.github/workflows/`, `vercel.json`, monitoring configs, `Dockerfile` (if any) |
| **Never touches** | Application code, database schema |
| **Pre-conditions** | GitHub repo exists, Vercel project connected, Supabase project exists |
| **Post-conditions** | CI passes on push, preview deployments work, monitoring alerts configured |
| **Skills** | GitHub Actions, Vercel, Sentry, Supabase CLI |

**Checklist before completion:**
- [ ] CI runs: lint, type check, unit tests, build
- [ ] Preview deployments on PR creation
- [ ] Production deployment on merge to main
- [ ] Sentry configured with source maps
- [ ] Environment variables documented (not committed)
- [ ] Database migration runs in CI for schema validation

---

### 5.7 Docs Agent

**Purpose:** API documentation, user guides, developer onboarding docs.

| Attribute | Details |
|-----------|---------|
| **Owns** | `docs/` (except `docs/work-log/` and `docs/planning/`) |
| **Never touches** | Source code, tests, infrastructure |
| **Pre-conditions** | Features are complete enough to document |
| **Post-conditions** | Docs are accurate, examples work, API docs match OpenAPI spec |
| **Skills** | Technical writing, OpenAPI, MDX |

**Note:** Docs agents are used sparingly. Most documentation is written by the agent
that builds the feature. The Docs Agent is for comprehensive documentation passes
at the end of a phase.

---

### 5.8 Review Agent

**Purpose:** Code review, security audit, performance review.

| Attribute | Details |
|-----------|---------|
| **Owns** | Nothing (read-only for all files) |
| **Never touches** | Any file (review agents do not write code) |
| **Pre-conditions** | PR exists with passing CI |
| **Post-conditions** | Review comments posted, approval or change requests |
| **Skills** | `/code-review`, `/security-audit`, `/insecure-defaults`, `/sharp-edges` |

**Review checklist:**
- [ ] No hardcoded secrets or credentials
- [ ] RLS policies cover all new tables
- [ ] Input validation on all user inputs
- [ ] Error handling is consistent
- [ ] No N+1 query patterns
- [ ] Accessibility requirements met
- [ ] TypeScript strict mode satisfied (no `any` casts)
- [ ] File sizes under 200 lines
- [ ] Tests exist for new functionality

---

## 6. Context Management

### 6.1 CLAUDE.md Layering

Context flows from general to specific. An agent working on a Kanban component reads:

```
1. pips2/CLAUDE.md                              # Project-wide rules
2. apps/web/CLAUDE.md                           # Next.js conventions
3. apps/web/components/CLAUDE.md                # Component patterns
4. apps/web/components/kanban/CLAUDE.md         # Kanban-specific notes (if exists)
```

Each deeper level adds context, never contradicts a higher level.

**When to create a directory CLAUDE.md:**
- The directory has 5+ files
- There are non-obvious conventions specific to that area
- Multiple agents will work in that directory across sessions

**When NOT to create one:**
- Single-file directory
- Conventions are already covered by a parent CLAUDE.md
- The directory is temporary

### 6.2 Status Board Format

Maintain a status board at `docs/STATUS.md`:

```markdown
# PIPS 2.0 -- Status Board

Last updated: 2026-03-03 14:30 UTC

## Current Phase: Phase 1 (MVP)

### Active Work
| Agent | Branch | Task | Status | ETA |
|-------|--------|------|--------|-----|
| A | agent/p1-projects | Project CRUD | IN PROGRESS (60%) | 2h |
| B | agent/p1-steps | PIPS Step Engine | IN PROGRESS (30%) | 4h |
| C | agent/p1-dashboard | Dashboard | BLOCKED (needs project types) | -- |

### Recently Completed
| Agent | Branch | Task | PR | Merged |
|-------|--------|------|----|--------|
| -- | agent/p0-schema | Core schema | #1 | 2026-03-03 09:00 |
| -- | agent/p0-scaffold | App scaffold | #2 | 2026-03-03 09:30 |

### Blockers
- Agent C needs `ProjectListItem` type from Agent A (tracked in work log)

### Next Up (Queued)
- Form Builder (after Step Engine merges)
- Team Management (after Project CRUD merges)
- Basic Tickets (after Project CRUD merges)
```

### 6.3 Agent Task Prompt Template

When dispatching an agent, use this structure:

```
## Task: [Task Name]
Branch: agent/{phase}-{feature}

### Context
- Current phase: Phase X
- Read: pips2/CLAUDE.md, [relevant directory CLAUDE.md files]
- Latest work log: docs/work-log/YYYY-MM-DD.md
- Related PRs: #N, #M (already merged)

### Objective
[1-3 sentences describing what to build]

### Scope (files you MAY edit)
- apps/web/app/(app)/[path]/
- apps/web/components/[path]/
- apps/web/stores/[store].ts
- [specific migration file if needed]

### Scope (files you must NOT edit)
- supabase/migrations/ (unless specifically assigned)
- packages/shared/src/types/database.ts (Schema Agent only)
- Other agents' component directories

### Acceptance Criteria
1. [Specific criterion 1]
2. [Specific criterion 2]
3. All quality gates pass (tsc, lint, test)
4. Work log updated with completion summary

### Dependencies
- Requires: [merged PR or available type/component]
- Blocks: [what other work depends on this]

### Notes
- [Any architectural decisions already made]
- [Design references or mockups]
- [Performance constraints]
```

### 6.4 Passing Context Between Related Agents

When Agent A produces output that Agent B needs:

**Option 1: Merge first (preferred)**
Agent A merges. Agent B starts from updated main. Clean and simple.

**Option 2: Shared types file (when merge is not yet possible)**
Agent A creates types in `packages/shared/src/types/` and pushes. Agent B
cherry-picks or reads the type file from Agent A's branch:
```bash
git fetch origin agent/p1-projects
git show origin/agent/p1-projects:packages/shared/src/types/projects.ts
```

**Option 3: Work log handoff**
Agent A documents the interface contract in the work log:
```markdown
### Interface Contract: ProjectListItem
Agent B (Dashboard) needs this type from Agent A (Projects):
  interface ProjectListItem {
    id: string;
    name: string;
    status: 'active' | 'archived' | 'completed';
    stepProgress: number; // 0-100
    updatedAt: string;
  }
Agent A will export from: packages/shared/src/types/projects.ts
```

Agent B can define a temporary local type matching this contract, then replace it
when Agent A merges.

---

## 7. Quality Assurance Protocol

### 7.1 Mandatory Quality Gates

Every agent must run these before marking a task as complete:

```bash
# Gate 1: Type Safety
pnpm tsc --noEmit
# Expected: 0 errors
# If errors in OTHER files (not yours), document them but do not fix.
# If errors in YOUR files, fix them.

# Gate 2: Linting
pnpm lint
# Expected: 0 errors, 0 warnings
# Auto-fix what you can: pnpm lint --fix
# Manual fix for remaining issues.

# Gate 3: Unit Tests
pnpm test
# Expected: All tests pass, including your new tests.
# Minimum coverage for new code: functions 80%, branches 70%.

# Gate 4: E2E Tests (if you changed UI)
pnpm test:e2e
# Expected: All tests pass.
# Write at least 1 happy-path e2e for each new user flow.

# Gate 5: Build
pnpm build
# Expected: Build succeeds without warnings.
# Check bundle size: no single route > 200KB JS.
```

### 7.2 Manual Review Checklist

After automated gates pass, the agent self-reviews:

**Security:**
- [ ] No secrets or credentials in code
- [ ] All database queries go through RLS (no `.from('table').select()` without auth)
- [ ] User input validated server-side with Zod
- [ ] File uploads have type/size restrictions
- [ ] CORS configured correctly on API routes
- [ ] No `dangerouslySetInnerHTML` without sanitization

**Accessibility:**
- [ ] All images have `alt` text
- [ ] All form inputs have associated labels
- [ ] Interactive elements have focus indicators
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Screen reader tested (or at minimum, aria-labels present)
- [ ] Page has logical heading hierarchy (h1 > h2 > h3)

**Performance:**
- [ ] No unnecessary re-renders (React.memo where appropriate)
- [ ] Images optimized (Next.js Image component with proper sizing)
- [ ] Database queries use indexes for filtered columns
- [ ] No N+1 query patterns (use joins or batch fetching)
- [ ] Pagination for lists over 50 items
- [ ] Debounced search/filter inputs

**Code Quality:**
- [ ] Files under 200 lines
- [ ] No `any` type assertions
- [ ] Named exports from index files
- [ ] Error boundaries around complex components
- [ ] Loading and error states for async operations
- [ ] Console.log statements removed

### 7.3 Test Requirements by Feature Type

| Feature Type | Unit Tests | Integration Tests | E2E Tests |
|-------------|-----------|------------------|-----------|
| Database migration | Migration up/down | RLS policy tests | -- |
| API endpoint | Input validation | Request/response cycle | -- |
| UI component | Render + interaction | -- | User flow |
| Store (Zustand) | State transitions | -- | -- |
| Edge Function | Input/output | Auth + error handling | -- |
| Integration (Jira, etc.) | Mocked API calls | Sync flow with mocks | OAuth flow |

---

## 8. Merge & Integration Protocol

### 8.1 Branch Naming and Commit Message Format

**Branch naming:**
```
agent/{phase}-{feature}

Examples:
  agent/p0-schema
  agent/p1-pips-steps
  agent/p2-kanban-board
  agent/p4-jira-sync
```

**Commit message format:**
```
{type}({scope}): {description}

Types: feat, fix, refactor, test, chore, docs, style, perf
Scope: schema, auth, dashboard, tickets, kanban, api, ci, etc.

Examples:
  feat(schema): add core tables for orgs, projects, and steps
  feat(auth): implement login and registration with Supabase Auth
  fix(kanban): prevent card duplication on rapid drag-drop
  test(tickets): add e2e tests for ticket lifecycle
  chore(ci): add Playwright to GitHub Actions workflow
  refactor(api): extract validation middleware from route handlers
```

**Commit body (optional, for complex changes):**
```
feat(schema): add core tables for orgs, projects, and steps

- Created 8 tables: orgs, profiles, projects, steps, tickets,
  comments, attachments, audit_log
- RLS policies enforce org_id scoping on all user-facing tables
- Seed data creates 2 test orgs with sample projects
- Generated TypeScript types in packages/shared/

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### 8.2 PR Template for Agent PRs

Every agent PR uses this template. Save it at `.github/pull_request_template.md`:

```markdown
## Summary
<!-- 1-3 bullet points describing what this PR does -->

## Phase & Task
- Phase: [0-6]
- Task: [from AI_AGENT_COORDINATION.md]
- Agent type: [Schema/Component/API/etc.]

## Changes
<!-- List key files changed with brief descriptions -->

## Testing
- [ ] `tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes (N new tests added)
- [ ] `pnpm test:e2e` passes (if UI changes)
- [ ] `pnpm build` succeeds

## Security
- [ ] RLS policies added/updated for new tables
- [ ] Input validation with Zod on new endpoints
- [ ] No hardcoded secrets

## Accessibility
- [ ] aria-labels on interactive elements
- [ ] Keyboard navigation tested
- [ ] Color contrast meets WCAG AA

## Screenshots
<!-- Before/after screenshots for UI changes -->

## Dependencies
- Depends on: [PR #N or "none"]
- Blocks: [PR #M or "none"]

---
Generated with Claude Code (agent/{branch-name})
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### 8.3 Merge Order Rules

When multiple PRs are ready to merge, follow this order:

```
PRIORITY 1: Schema/migration changes
  - These change the database and affect everything downstream.
  - Merge one at a time. Run migrations. Verify.

PRIORITY 2: Shared types (packages/shared/)
  - These affect type checking across the monorepo.
  - Merge after schema. Run tsc --noEmit on full project.

PRIORITY 3: API routes / Edge Functions
  - These depend on schema and types.
  - Can merge multiple in parallel IF they touch different routes.

PRIORITY 4: Stores (Zustand)
  - These depend on types and API endpoints.
  - Can merge multiple in parallel IF they are different stores.

PRIORITY 5: UI Components
  - These depend on everything above.
  - Can merge multiple in parallel IF they are in different directories.

PRIORITY 6: Tests
  - These depend on everything being stable.
  - Merge last. If tests fail after merge, fix immediately.

PRIORITY 7: Documentation / CI changes
  - Lowest risk. Merge anytime.
```

### 8.4 Integration Testing After Merge

After each merge wave, run a full integration check:

```bash
# 1. Pull latest main
git checkout main && git pull

# 2. Install dependencies (in case lock file changed)
pnpm install

# 3. Generate types from latest schema
pnpm db:types

# 4. Full quality gate
pnpm tsc --noEmit
pnpm lint
pnpm test
pnpm build

# 5. E2E if UI changed
pnpm test:e2e

# 6. Verify dev server starts
pnpm dev
# Check manually: pages load, no console errors
```

If anything fails, stop merging. Fix the issue before continuing.

### 8.5 Rollback Procedure

If a merge breaks main:

```bash
# Option 1: Revert the PR (preferred -- creates new commit, preserves history)
gh pr list --state merged --limit 5  # Find the PR number
git revert -m 1 <merge-commit-sha>
git push origin main

# Option 2: If multiple PRs need reverting
git log --oneline --merges -10  # Find the last good merge
git revert -m 1 <bad-merge-1>
git revert -m 1 <bad-merge-2>
git push origin main

# NEVER DO: git reset --hard (destroys history)
# NEVER DO: git push --force main (destroys others' history)
```

After rollback:
1. Create a fix branch from the reverted PR
2. Fix the issue
3. Re-merge through normal PR process

---

## 9. Session Management

### 9.1 Session Start Briefing

Every new development session (whether 1 agent or 8) starts with Marc running
this checklist:

```bash
# 1. Check project health
cd C:/Users/marca/Projects/pips2
git status
git log --oneline -10
pnpm tsc --noEmit
pnpm test

# 2. Review latest work log
# Read docs/work-log/YYYY-MM-DD.md (most recent)

# 3. Check for stale branches
git branch -a | grep agent/

# 4. Review open PRs
gh pr list

# 5. Update status board
# Edit docs/STATUS.md with current state

# 6. Plan today's work
# Decide which agents to dispatch, in what order
# Write task prompts (Section 6.3 template)
```

### 9.2 Handoff Work Log Entries

When a session ends (or an agent completes), record:

```markdown
## Session End: [Agent/Session Name] -- [Time]

### Completed
- [x] Task 1 description
- [x] Task 2 description

### Not Completed
- [ ] Task 3 (reason: blocked on X)

### Files Changed
- path/to/file1.ts (new)
- path/to/file2.ts (modified)

### State of the Branch
- Branch: agent/p1-feature
- Last commit: abc123 "feat(feature): description"
- Tests: 45 passing, 0 failing
- Type errors: 0
- PR: #N (open/merged)

### Handoff Notes
- [Important context for the next session]
- [Decisions made and why]
- [Known issues or tech debt introduced]

### Next Steps
1. [What should happen next]
2. [In what order]
```

### 9.3 Resume Protocol

When resuming work on an existing branch:

```bash
# 1. Check current state
git status
git log --oneline -5

# 2. Sync with main (pick up changes from other merged agents)
git fetch origin
git rebase origin/main
# If conflicts: resolve, then git rebase --continue

# 3. Run quality gates to verify state
pnpm tsc --noEmit
pnpm test

# 4. Read the handoff notes from the work log
# Continue from where the previous session left off
```

### 9.4 Overnight Autonomous Session Rules

For overnight sessions with multiple agents running unattended:

```
RULES:
1. Max 4 agents for overnight (reduced from daytime max of 8)
2. Each agent must have a COMPLETE task prompt (no ambiguity)
3. Each agent must have EXPLICIT file scope (no overlaps)
4. Agents merge to their own branches only (never to main)
5. Main branch merges happen in the morning review
6. Each agent updates the work log before exiting
7. If an agent encounters an error it cannot resolve, it:
   a. Documents the error in the work log
   b. Commits what it has so far
   c. Exits cleanly (does not attempt risky fixes)

MORNING REVIEW CHECKLIST:
- [ ] Read all agent work logs from overnight
- [ ] Check each agent's branch: tsc, lint, test
- [ ] Review diffs: gh pr diff #N
- [ ] Merge in correct order (Section 8.3)
- [ ] Run full integration test after merges
- [ ] Update status board
- [ ] Plan next batch of work
```

### 9.5 Morning Review Checklist (Detailed)

```bash
# 1. Check what agents produced overnight
gh pr list --state open

# 2. For each PR, review quickly
gh pr view #N
gh pr diff #N

# 3. Check each branch's health
for branch in agent/p1-projects agent/p1-steps agent/p1-dashboard; do
  echo "=== $branch ==="
  git checkout $branch
  pnpm tsc --noEmit
  pnpm test
  echo ""
done
git checkout main

# 4. Merge in order (schema first, then types, then API, then UI)
gh pr merge #N --squash  # Schema PR
git pull
gh pr merge #M --squash  # Types PR
git pull
# ... continue in order

# 5. Full integration test
pnpm tsc --noEmit && pnpm lint && pnpm test && pnpm build

# 6. Update work log and status board
```

---

## 10. Communication Protocols

### 10.1 Progress Reporting Format

Agents report progress in the work log using this format:

```markdown
### Progress Update: [Agent] -- [Time]
- **Task:** [Brief description]
- **Progress:** [X]% complete
- **Current:** [What I'm working on right now]
- **Completed:** [Bullet list of done items]
- **Remaining:** [Bullet list of todo items]
- **Blockers:** [None / description]
- **ETA:** [Estimated time to completion]
```

### 10.2 Blocker Escalation

When an agent hits a blocker, it should:

```markdown
### BLOCKER: [Agent] -- [Time]
- **Blocked by:** [Description -- missing type, failing test, merge conflict, etc.]
- **Impact:** [What I cannot do until this is resolved]
- **Workaround attempted:** [What I tried, if anything]
- **Suggested resolution:**
  1. [Option A]
  2. [Option B]
- **Waiting for:** [Marc / Agent X merge / dependency]
```

**Severity levels:**
- **SOFT BLOCK:** Agent can work on other parts of the task and come back later.
  Document in work log and continue.
- **HARD BLOCK:** Agent cannot proceed at all. Document, commit current work,
  and exit. Marc resolves in the next session.

### 10.3 Decision Request Format

When an agent needs an architectural or design decision:

```markdown
### DECISION NEEDED: [Topic]
- **Context:** [Why this decision is needed]
- **Options:**
  1. **Option A:** [Description]
     - Pro: [advantage]
     - Con: [disadvantage]
  2. **Option B:** [Description]
     - Pro: [advantage]
     - Con: [disadvantage]
- **Recommendation:** [Option X, because...]
- **Impact if deferred:** [Can I continue without this decision? What do I assume?]
```

For overnight agents: always pick the simpler option and document the choice.
Marc can revise in the morning.

### 10.4 End-of-Session Summary Template

Every agent session ends with this summary in the work log:

```markdown
## Session Summary: [Agent/Session Name]
**Date:** [Date]
**Duration:** [Start -- End]
**Branch:** [agent/px-feature]
**PR:** [#N or "not yet created"]

### Accomplishments
- [Bullet list of completed items]

### Metrics
- Files created: [N]
- Files modified: [N]
- Tests added: [N]
- Tests passing: [N/N]
- Type errors: [0]
- Lint warnings: [0]
- Lines of code: [~N]

### Key Decisions Made
- [Decision 1: chose X over Y because Z]

### Known Issues / Tech Debt
- [Issue 1: description, priority]

### Handoff to Next Session
- [What the next agent/session needs to know]
- [Any partially completed work]
- [Suggested next steps]
```

---

## 11. File Ownership Matrix

### 11.1 Directory Ownership by Agent Type

```
DIRECTORY                              PRIMARY OWNER        SECONDARY (with permission)
─────────────────────────────────────  ──────────────────  ─────────────────────────────
pips2/CLAUDE.md                        Marc (direct)        --
pips2/package.json                     DevOps Agent         --
pips2/turbo.json                       DevOps Agent         --
pips2/pnpm-workspace.yaml              DevOps Agent         --
pips2/.github/                         DevOps Agent         --
pips2/docs/work-log/                   ALL agents           --
pips2/docs/planning/                   Marc (direct)        --
pips2/docs/STATUS.md                   ALL agents           --

apps/web/app/(auth)/                   API Agent (auth)     Component Agent
apps/web/app/(app)/dashboard/          Component Agent      --
apps/web/app/(app)/projects/           Component Agent      API Agent (API routes)
apps/web/app/(app)/projects/[id]/      Component Agent      --
  steps/                               Component Agent      --
  tickets/                             Component Agent      --
  board/                               Component Agent      --
apps/web/app/(app)/teams/              Component Agent      --
apps/web/app/(app)/analytics/          Component Agent      --
apps/web/app/(app)/reports/            Component Agent      API Agent
apps/web/app/(app)/settings/           Component Agent      --
apps/web/app/(app)/integrations/       Integration Agent    --
apps/web/app/api/                      API Agent            Integration Agent (for /api/webhooks/)
apps/web/app/layout.tsx                Component Agent      --
apps/web/app/page.tsx                  Component Agent      --

apps/web/components/ui/                Component Agent      --
apps/web/components/layout/            Component Agent      --
apps/web/components/forms/             Component Agent      --
apps/web/components/charts/            Component Agent      --
apps/web/components/kanban/            Component Agent      --
apps/web/components/tickets/           Component Agent      --
apps/web/components/notifications/     Component Agent      --
apps/web/components/search/            Component Agent      --
apps/web/components/ai/               Component Agent      --

apps/web/hooks/                        Component Agent      API Agent
apps/web/stores/                       Component Agent      --
apps/web/lib/supabase/                 API Agent            --
apps/web/lib/api/                      API Agent            --
apps/web/lib/ai/                       API Agent (AI)       --
apps/web/lib/theme/                    Component Agent      --
apps/web/lib/analytics/                API Agent            --
apps/web/lib/rbac/                     API Agent            --
apps/web/lib/export/                   API Agent            --
apps/web/types/                        API Agent            Component Agent

packages/shared/src/types/database.ts  Schema Agent ONLY    --
packages/shared/src/types/*.ts         Schema/API Agent     Component Agent (read-only)
packages/shared/src/utils/             API Agent            Component Agent

supabase/migrations/                   Schema Agent ONLY    --
supabase/functions/                    API Agent            Integration Agent
supabase/seed.sql                      Schema Agent         --
supabase/config.toml                   DevOps Agent         --

tests/e2e/                             Test Agent           Component Agent (for co-located tests)
tests/integration/                     Test Agent           API Agent
tests/performance/                     Test Agent           --
```

### 11.2 Shared File Rules

These files are edited by multiple agents and require extra coordination:

**`pnpm-lock.yaml`:**
- Auto-generated. Never edit manually.
- If two agents add different dependencies, merge conflicts are resolved by
  running `pnpm install` on the merged branch.

**`package.json` (root and workspace):**
- Only one agent adds dependencies per merge wave.
- If two agents need to add dependencies, the second agent rebases after the
  first merges, then adds its dependencies.

**`packages/shared/src/types/database.ts`:**
- Schema Agent has exclusive write access.
- Other agents read this file but never edit it.
- If a non-schema agent needs a type change, they document it in the work log
  and the schema agent handles it.

**`apps/web/app/(app)/layout.tsx`:**
- This file is edited rarely, usually only in Phase 0 (navigation setup).
- If multiple agents need to modify the layout, coordinate explicitly.

### 11.3 Migration Ordering Convention

When multiple agents create migrations in the same session:

```
RULE: Space timestamps 10 minutes apart.

Session with 3 agents creating migrations:
  Agent A (Schema):      20260303090000_core_tables.sql
  Agent B (Auth):        20260303091000_auth_profiles.sql     (+10 min)
  Agent C (Tickets):     20260303092000_ticket_tables.sql     (+20 min)

This ensures:
  1. Migrations run in a deterministic order.
  2. No timestamp collisions.
  3. Dependencies are respected (Agent A's tables exist before Agent B references them).
```

**Pre-assigned timestamp slots for parallel sessions:**

| Slot | Timestamp Offset | Assigned To |
|------|-----------------|-------------|
| 1 | XX:00:00 | Schema Agent (always first) |
| 2 | XX:10:00 | Second agent |
| 3 | XX:20:00 | Third agent |
| 4 | XX:30:00 | Fourth agent |
| 5 | XX:40:00 | Fifth agent |
| 6 | XX:50:00 | Sixth agent |

If an agent needs multiple migration files, use sub-minute increments:
```
20260303090000_core_tables.sql
20260303090001_core_indexes.sql
20260303090002_core_rls.sql
```

---

## 12. Scaling Plan

### 12.1 Phase 0-1: Conservative (2-4 Concurrent Agents)

**Rationale:** Foundation and MVP have the most interdependencies. Schema changes
ripple through everything. Getting the architecture right matters more than speed.

```
Wave size:     2 agents (Phase 0 Wave 1), then 2-3 per wave
Merge cadence: After every wave (every 3-4 hours)
Review style:  Marc reviews every PR
Monitoring:    Check agents every 30-60 minutes
```

**Scaling triggers (move to 3-4 agents):**
- Schema is stable and merged
- Shared types are published
- CI pipeline is green and reliable
- No merge conflicts in the last 2 waves

### 12.2 Phase 2-3: Moderate (4-6 Concurrent Agents)

**Rationale:** Ticketing features and analytics are more modular. Components own
their own directories. Less cross-cutting risk.

```
Wave size:     3-4 agents per wave
Merge cadence: Every 2-3 hours
Review style:  Marc reviews critical PRs, Review Agent handles routine ones
Monitoring:    Check agents every 60 minutes, use status board
```

**Scaling triggers (move to 5-6 agents):**
- No merge conflicts in the last 3 waves
- All quality gates consistently pass
- Work log updates are consistent and useful
- Main branch has been stable for 2+ days

### 12.3 Phase 4-5: Aggressive (6-8 Concurrent Agents)

**Rationale:** Integrations are almost entirely independent (Jira agent never
touches Slack agent's files). Enterprise features like theming, SSO, and RBAC
also have clean boundaries.

```
Wave size:     4-6 agents per wave
Merge cadence: Continuous (merge when ready, no waiting for waves)
Review style:  Review Agent + Marc for security-sensitive PRs only
Monitoring:    Status board checked every 2 hours
```

**Scaling triggers (move to 7-8 agents):**
- Integration agents demonstrate clean isolation
- CI runs in under 10 minutes
- Zero regressions in the last week
- Overnight sessions consistently produce clean PRs

### 12.4 Phase 6: Conservative Again (2-4 Concurrent Agents)

**Rationale:** AI features have cross-cutting concerns (prompt templates,
token tracking, cost allocation). The AI infrastructure agent must finish
before specialized AI agents can start.

```
Wave size:     2 agents per wave
Merge cadence: After every wave
Review style:  Marc reviews all AI PRs (prompt quality, cost implications)
Monitoring:    Active monitoring (AI features need more iteration)
```

### 12.5 When to Scale Back

Reduce concurrent agents when:

- **Merge conflicts appear in 2+ consecutive waves.** This means file ownership
  boundaries are not clean enough. Pause, reassess boundaries, then resume with
  fewer agents.

- **Quality gates fail after merge.** If integrating agent PRs breaks the build,
  the agents are not testing thoroughly enough. Reduce count, increase review.

- **Work log entries are missing or sparse.** This means context is being lost.
  Fewer agents with better documentation beats more agents with chaos.

- **Agent tasks take 2x longer than estimated.** This usually means the task
  prompt was not specific enough. Pause, improve prompts, then re-dispatch.

- **Marc cannot keep up with reviews.** If 6 PRs land at once and Marc cannot
  review them all in a reasonable time, reduce to match review capacity.

---

## 13. Templates

### 13.1 Agent Task Prompt Template

Copy-paste this when dispatching an agent:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AGENT TASK PROMPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Task:       [Short name]
Branch:     agent/[phase]-[feature]
Phase:      [0-6]
Agent Type: [Schema/Component/API/Integration/Test/DevOps]
Priority:   [High/Medium/Low]
Est. Time:  [X hours]

── CONTEXT ──────────────────────────────────────

Read these files first:
  1. pips2/CLAUDE.md
  2. docs/work-log/[latest].md
  3. [relevant directory CLAUDE.md]
  4. docs/planning/AI_AGENT_COORDINATION.md (Section [N])

Current state:
  - Phase [X] is [status]
  - These PRs are already merged: #[N], #[M]
  - These agents are running in parallel: [list]

── OBJECTIVE ────────────────────────────────────

[2-5 sentences describing exactly what to build.
 Be specific about behavior, not just files.]

── FILE SCOPE ───────────────────────────────────

You MAY create/edit:
  - [explicit paths]

You must NOT edit:
  - [explicit paths]
  - Any file not listed above

── ACCEPTANCE CRITERIA ──────────────────────────

1. [Specific measurable criterion]
2. [Specific measurable criterion]
3. [Specific measurable criterion]
4. tsc --noEmit: 0 errors
5. pnpm lint: 0 errors
6. pnpm test: all pass, [N]+ new tests
7. Work log updated: docs/work-log/[date].md

── DEPENDENCIES ─────────────────────────────────

Requires (already merged):
  - [PR #N: description]

Blocks (will need your output):
  - [Agent Y: description]

── ARCHITECTURAL NOTES ──────────────────────────

- [Pattern to follow]
- [Decision already made]
- [Anti-pattern to avoid]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 13.2 Work Log Entry Template

```markdown
## [Session/Agent Name] -- [Date] [Time Range]

### Task
[Brief description of the assigned task]

### Branch
`agent/[phase]-[feature]`

### Status
[COMPLETE / IN PROGRESS (X%) / BLOCKED / ABANDONED]

### Changes
| File | Action | Description |
|------|--------|-------------|
| path/to/file.ts | new | [what it does] |
| path/to/other.ts | modified | [what changed] |

### Tests
- New tests added: [N]
- Total tests passing: [N/N]
- Type errors: [0]
- Lint warnings: [0]

### Decisions Made
- [Decision: chose X because Y]

### Blockers
- [None / description]

### PR
- PR #[N]: [title] ([open/merged/draft])

### Handoff Notes
- [What the next person needs to know]
- [Partially completed work]
- [Suggested next steps]
```

### 13.3 PR Description Template

```markdown
## Summary
- [Bullet 1: what this PR does]
- [Bullet 2: key implementation detail]
- [Bullet 3: any notable decisions]

## Phase & Task
- **Phase:** [0-6]
- **Task:** [from coordination plan]
- **Agent:** [type] on branch `agent/[branch]`

## Changes
- `path/to/file.ts` -- [description]
- `path/to/file.ts` -- [description]

## Testing
- [N] new unit tests
- [N] new e2e tests (if applicable)
- All quality gates pass:
  - [x] `tsc --noEmit`
  - [x] `pnpm lint`
  - [x] `pnpm test`
  - [x] `pnpm build`

## Security
- [x] RLS policies for new tables
- [x] Input validation on endpoints
- [x] No hardcoded secrets

## Screenshots
[Before/after for UI changes, or "N/A -- no UI changes"]

## Dependencies
- **Requires:** [#N merged / none]
- **Blocks:** [#M / none]

## Test Plan
- [ ] [Specific test step 1]
- [ ] [Specific test step 2]
- [ ] [Specific test step 3]

---
Generated with Claude Code (`agent/[branch]`)
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### 13.4 Session Kickoff Checklist

Run this at the start of every development session:

```markdown
# Session Kickoff -- [Date]

## Pre-Flight Checks
- [ ] `git status` -- working tree clean
- [ ] `git pull origin main` -- up to date
- [ ] `pnpm install` -- dependencies current
- [ ] `pnpm tsc --noEmit` -- 0 type errors
- [ ] `pnpm test` -- all tests pass
- [ ] `pnpm build` -- build succeeds

## Context Review
- [ ] Read latest work log entry: `docs/work-log/[latest].md`
- [ ] Read status board: `docs/STATUS.md`
- [ ] Check open PRs: `gh pr list`
- [ ] Check stale branches: `git branch -a | grep agent/`

## Session Planning
- [ ] Identify 2-6 independent tasks for this session
- [ ] Write task prompts for each agent (Section 13.1 template)
- [ ] Verify file scope has no overlaps between agents
- [ ] Assign migration timestamp slots (Section 11.3)

## Agent Dispatch
- [ ] Agent 1: [task] on branch `agent/[branch]`
- [ ] Agent 2: [task] on branch `agent/[branch]`
- [ ] Agent 3: [task] on branch `agent/[branch]`
- [ ] [more as needed]

## Monitoring Plan
- Check-in frequency: every [30/60/120] minutes
- Merge strategy: [wave-based / continuous]
- Review approach: [Marc reviews all / Review Agent + Marc]
```

### 13.5 CLAUDE.md Template for New Directories

When an agent creates a new significant directory, it should also create a CLAUDE.md:

```markdown
# [Directory Name] Conventions

## Purpose
[1-2 sentences explaining what this directory contains and why]

## File Structure
[Show the expected file organization]

## Patterns
- [Pattern 1: e.g., "Use React.memo for list item components"]
- [Pattern 2: e.g., "Export all public APIs from index.ts"]
- [Pattern 3: e.g., "Co-locate tests with source files"]

## Dependencies
- Imports from: [list allowed import sources]
- Imported by: [list who consumes this directory]

## Do NOT
- [Anti-pattern 1]
- [Anti-pattern 2]

## Owner
- Primary: [Agent type]
- Phase: [When this directory was created]
```

### 13.6 End-of-Day Summary Template

```markdown
# End of Day Summary -- [Date]

## Session Overview
- Duration: [start -- end]
- Agents dispatched: [N]
- PRs created: [N]
- PRs merged: [N]

## Completed Tasks
1. [Task] -- PR #[N] (merged)
2. [Task] -- PR #[N] (merged)
3. [Task] -- PR #[N] (open, ready for review)

## Metrics
- Tests added today: [N]
- Total tests: [N]
- Type errors: [0]
- Lint warnings: [0]
- Build status: [passing]

## Key Decisions
- [Decision 1]
- [Decision 2]

## Blockers / Issues
- [None / description]

## Plan for Next Session
1. [Priority 1 task]
2. [Priority 2 task]
3. [Priority 3 task]

## Notes for Future Me
- [Anything I need to remember]
```

---

## 14. Anti-Patterns

### 14.1 Overlapping File Edits

**Problem:** Two agents edit the same file simultaneously. When they merge,
one agent's changes are lost or create conflicts.

**Prevention:**
- The file ownership matrix (Section 11) defines who owns what.
- Task prompts include explicit "MAY edit" and "must NOT edit" sections.
- If an agent needs to edit a file outside its scope, it documents the need
  in the work log and stops. Marc or another agent handles it.

**Recovery:**
- If conflicts appear, resolve manually on main. Never let an agent
  "auto-resolve" conflicts.

---

### 14.2 Missing Tests

**Problem:** An agent ships code without tests. Future agents break
the untested code without realizing it.

**Prevention:**
- Quality gate: `pnpm test` must pass, and new code must have tests.
- Acceptance criteria always include a test count: "5+ new tests."
- PR template includes a testing checkbox.

**Recovery:**
- If untested code is found, dispatch a Test Agent to cover it before
  continuing with dependent work.

---

### 14.3 Context Window Overflow

**Problem:** An agent tries to read too many files and loses context on
its actual task. Especially dangerous with large schema files or
comprehensive CLAUDE.md files.

**Prevention:**
- Keep CLAUDE.md files focused and concise (under 100 lines each).
- Task prompts tell the agent exactly which files to read (not "read everything").
- Break large tasks into smaller chunks (2-4 hours max).
- Agents should read files relevant to their scope, not the entire codebase.

**Symptoms:**
- Agent starts repeating itself
- Agent "forgets" earlier decisions
- Agent produces inconsistent code (different patterns in same PR)
- Agent takes much longer than estimated

**Recovery:**
- If an agent seems to lose context, commit what it has, start a new session
  with a focused task prompt for the remaining work.

---

### 14.4 Ignoring Type Errors

**Problem:** An agent uses `any` type assertions, `@ts-ignore`, or `as unknown as X`
to bypass TypeScript errors instead of fixing them properly.

**Prevention:**
- CLAUDE.md explicitly forbids `any` (except in test mocks where unavoidable).
- Quality gate: `tsc --noEmit` with strict mode catches these.
- PR review explicitly checks for type assertions.

**Examples of bad patterns:**
```typescript
// BAD: Suppressing errors
// @ts-ignore
const data = response.data;

// BAD: Unsafe casting
const user = data as any as User;

// BAD: Lazy typing
const handleClick = (e: any) => { ... };
```

**Correct patterns:**
```typescript
// GOOD: Proper typing
const data: ApiResponse = response.data;

// GOOD: Type guard
if (isUser(data)) {
  const user: User = data;
}

// GOOD: Explicit event type
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { ... };
```

---

### 14.5 Skipping RLS Policies

**Problem:** A table is created without Row Level Security policies. Any
authenticated user can read/write any org's data.

**Prevention:**
- Schema Agent checklist requires RLS on every table.
- `supabase/CLAUDE.md` includes the RLS pattern.
- Integration tests verify that cross-org queries return empty results.

**Template for every new table:**
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "users can view own org data"
  ON table_name FOR SELECT
  USING (org_id = (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  ));

-- Insert policy
CREATE POLICY "users can insert own org data"
  ON table_name FOR INSERT
  WITH CHECK (org_id = (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  ));

-- Update policy
CREATE POLICY "users can update own org data"
  ON table_name FOR UPDATE
  USING (org_id = (
    SELECT org_id FROM profiles WHERE id = auth.uid()
  ));

-- Delete policy (restrict to admins)
CREATE POLICY "admins can delete own org data"
  ON table_name FOR DELETE
  USING (
    org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('owner', 'admin')
  );
```

---

### 14.6 Ignoring Migration Dependencies

**Problem:** Agent B creates a migration that references a table from Agent A's
migration, but Agent A has not merged yet. The migration fails in CI.

**Prevention:**
- Wave-based execution: dependent agents wait for the prerequisite to merge.
- Migration timestamp slots (Section 11.3) enforce ordering.
- Each agent's task prompt lists its dependencies explicitly.

**Recovery:**
- If a migration fails due to missing tables, do not modify the migration file.
  Instead, wait for the dependency to merge, then rebase and re-run.

---

### 14.7 Monolithic Components

**Problem:** An agent creates a single 500-line React component instead of
composing smaller pieces.

**Prevention:**
- CLAUDE.md rule: files under 200 lines preferred.
- PR review checks component size.
- Component Agent checklist requires decomposition.

**Example -- bad:**
```
components/
  kanban-board.tsx     # 450 lines: board + columns + cards + drag logic
```

**Example -- good:**
```
components/kanban/
  kanban-board.tsx     # 80 lines: layout + column rendering
  kanban-column.tsx    # 60 lines: column + card rendering
  kanban-card.tsx      # 50 lines: card display
  use-kanban-drag.ts   # 70 lines: drag-and-drop logic
  kanban.types.ts      # 30 lines: type definitions
  index.ts             # 5 lines: re-exports
```

---

### 14.8 Hardcoded Configuration

**Problem:** An agent hardcodes a Supabase URL, Stripe key, or other
environment-specific value directly in the source code.

**Prevention:**
- All configuration must come from environment variables.
- `apps/web/lib/env.ts` validates and exports all env vars.
- PR review scans for string literals that look like URLs, keys, or secrets.

**Pattern:**
```typescript
// apps/web/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  RESEND_API_KEY: z.string().startsWith('re_'),
  SENTRY_DSN: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

---

### 14.9 Inconsistent Error Handling

**Problem:** Different agents handle errors differently -- some throw,
some return null, some use Result types, some use try/catch with no logging.

**Prevention:**
- Root CLAUDE.md defines the error handling pattern for the project.
- All API routes use the same error response format.
- All Zustand stores handle async errors the same way.

**Standardized patterns:**

```typescript
// API Route error response (always this format)
return NextResponse.json(
  { error: 'Human-readable message', code: 'MACHINE_CODE' },
  { status: 400 }
);

// Zustand store async action
const fetchProjects = async () => {
  set({ loading: true, error: null });
  try {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    set({ projects: data, loading: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    set({ error: message, loading: false });
    // Log to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(err);
    }
  }
};

// Edge Function error handling
try {
  // ... function logic
} catch (err) {
  console.error('Function name:', err);
  return new Response(
    JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}
```

---

### 14.10 Premature Optimization

**Problem:** An agent spends hours optimizing a query or component that has
not been proven to be a bottleneck.

**Prevention:**
- Task prompts focus on functionality first: "make it work, make it right,
  make it fast" -- in that order.
- Performance optimization is a separate task, scheduled after the feature
  works correctly.
- Only optimize when data shows a problem (slow query log, large bundle, janky UI).

**Acceptable early optimizations:**
- Using indexes on columns used in WHERE clauses (cheap to add, expensive to forget)
- React.memo on list item components (known pattern, low cost)
- Pagination for lists (required for correctness, not just performance)

**Premature optimizations to avoid:**
- Complex caching layers before measuring query performance
- Virtualized lists for <100 items
- Code splitting for routes with <50KB JS
- Web Workers for computations that take <100ms

---

### 14.11 Diverging from the Plan

**Problem:** An agent decides to "improve" the architecture by adding
a pattern not in the plan (e.g., GraphQL when the plan says REST, or
Redux when the plan says Zustand).

**Prevention:**
- Task prompt is explicit about patterns and technologies.
- CLAUDE.md lists the approved tech stack.
- If an agent thinks the plan should change, it documents a Decision Request
  (Section 10.3) instead of unilaterally changing direction.

---

### 14.12 Not Updating the Work Log

**Problem:** An agent finishes its task but does not update the work log.
The next session has no idea what was done, what state things are in,
or what the agent decided along the way.

**Prevention:**
- Acceptance criteria always include: "Work log updated."
- Task prompt starts with "Update work log at start" and ends with
  "Update work log at completion."
- Morning review checks that all overnight agents wrote work log entries.

**Recovery:**
- If a work log entry is missing, reconstruct it from `git log` and
  `git diff` before starting new work on that branch.

---

### 14.13 Creating Unnecessary Abstractions

**Problem:** An agent creates a generic `BaseService`, `AbstractRepository`,
or `FactoryFactory` for a feature that has exactly one implementation.

**Prevention:**
- CLAUDE.md: "No abstraction is better than the wrong abstraction."
- Build the concrete implementation first. Extract abstractions only when
  you have 3+ similar implementations (Rule of Three).
- Task prompts should specify: "Keep it simple. One implementation. No
  abstract base classes."

---

### 14.14 Stale Branches

**Problem:** An agent branch lives for days without merging. It falls
far behind main and the eventual merge is painful.

**Prevention:**
- Agents push and create PRs as soon as their task is complete.
- Marc merges PRs within the same session whenever possible.
- Branches older than 48 hours are flagged in the morning review.
- If a branch cannot merge cleanly, it is easier to cherry-pick the
  changes onto a fresh branch from main than to resolve complex conflicts.

**Morning check for stale branches:**
```bash
# Show branches with their last commit date
git for-each-ref --sort=-committerdate --format='%(refname:short) %(committerdate:relative)' refs/heads/agent/
```

---

## Appendix A: Quick Reference Card

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PIPS 2.0 -- AGENT QUICK REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BRANCH NAMING     agent/{phase}-{feature}
COMMIT FORMAT     {type}({scope}): {description}
MERGE ORDER       schema → types → api → stores → ui → tests
MAX PARALLEL      4-8 agents (phase-dependent)
MIGRATION GAP     10 minutes between concurrent agents

QUALITY GATES (run before every PR):
  tsc --noEmit       # 0 errors
  pnpm lint          # 0 warnings
  pnpm test          # all pass
  pnpm build         # succeeds

EVERY TABLE NEEDS:
  id, created_at, updated_at, org_id, RLS policies

EVERY COMPONENT NEEDS:
  unit test, aria-labels, loading state, error state

EVERY API ROUTE NEEDS:
  auth check, Zod validation, consistent error format

FILES TO READ FIRST:
  1. pips2/CLAUDE.md
  2. docs/work-log/ (latest)
  3. docs/STATUS.md
  4. [directory CLAUDE.md for your scope]

FILES TO UPDATE LAST:
  1. docs/work-log/ (your completion entry)
  2. docs/STATUS.md (your task status)

NEVER:
  - Edit files outside your scope
  - Force push to main
  - Use `any` type
  - Skip RLS policies
  - Merge without quality gates
  - Start without reading the work log

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Appendix B: Command Cheat Sheet

```bash
# === PROJECT COMMANDS ===
pnpm dev                    # Start dev server (all workspaces)
pnpm build                  # Production build
pnpm lint                   # ESLint check
pnpm lint --fix             # Auto-fix lint issues
pnpm test                   # Run Vitest
pnpm test:e2e               # Run Playwright
tsc --noEmit                # Type check without emitting

# === SUPABASE COMMANDS ===
pnpm db:migrate             # Apply migrations
pnpm db:types               # Generate TS types from schema
supabase start              # Start local Supabase
supabase stop               # Stop local Supabase
supabase db reset            # Reset local DB (destructive)

# === GIT COMMANDS (for agents) ===
git checkout -b agent/p0-schema          # Create agent branch
git add [specific files]                 # Stage (never git add .)
git commit -m "feat(schema): ..."        # Commit
git push -u origin agent/p0-schema       # Push + track
gh pr create --title "..." --body "..."  # Create PR

# === WORKTREE COMMANDS ===
claude --worktree agent/p0-schema        # Create worktree via Claude
git worktree list                        # List active worktrees
git worktree remove [path]               # Clean up worktree

# === MONITORING COMMANDS ===
gh pr list                               # Open PRs
gh pr view #N                            # View PR details
gh pr diff #N                            # View PR changes
git log --oneline -20                    # Recent commits
git branch -a | grep agent/             # Active agent branches
```

---

## Appendix C: Estimated Total Project Timeline

Assuming 6-8 productive hours per day with agents:

| Phase | Est. Agent-Hours | Calendar Days (with agents) | Calendar Days (solo) |
|-------|-----------------|---------------------------|---------------------|
| 0: Foundation | 20-25 | 3-4 days | 8-10 days |
| 1: MVP | 30-40 | 5-7 days | 15-20 days |
| 2: Ticketing | 35-45 | 5-7 days | 18-22 days |
| 3: Analytics | 25-35 | 4-5 days | 12-16 days |
| 4: Integrations | 35-50 | 5-7 days | 18-25 days |
| 5: Enterprise | 30-40 | 5-7 days | 15-20 days |
| 6: AI Features | 20-30 | 3-5 days | 10-15 days |
| **Total** | **195-265** | **30-42 days** | **96-128 days** |

Agent parallelism provides roughly a **3x speed multiplier** over solo development,
accounting for coordination overhead.

---

*This document is a living plan. Update it as the project evolves, patterns
emerge, and the team learns what works best.*
