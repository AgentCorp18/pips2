# PIPS 2.0 — Project Instructions

## Section 0: Work Coordination Protocol

### Before Starting Work

1. Read this file completely
2. Check `docs/AGENT_STATUS_BOARD.md` for current system state
3. Check `docs/work-log/` for the latest session entry
4. Understand what's been built and what's in progress
5. Update the work log BEFORE starting your task

### After Completing Work

1. Run quality gates:

pnpm typecheck && pnpm lint && pnpm test

2. Update the work log with what you completed
3. Update `docs/AGENT_STATUS_BOARD.md` if task status changed
4. Note any blockers or decisions needed

### Work Log Format

- Location: `docs/work-log/YYYY-MM-DD.md`
- Update the current day's log, create a new one if the date changed
- Mark completed items with `[x]`
- Mark in-progress items with `[-]`
- Mark pending items with `[ ]`

---

# Section 0.1: Multi-Agent Environment

This project operates using multiple AI agents working in parallel.

Agents specialize in different domains.

Current agent roles include:

- Product Strategy Agent
- Product Manager Agent
- UX Design Agent
- Customer Insights Agent
- Project Manager Agent (Control Tower)
- Development Lead Agent
- QA Agent
- DevOps Agent
- Chief Architect Agent
- System Architect Agent
- Data Analytics Agent

Agents must respect domain ownership.

If a decision belongs to another domain, escalate rather than guessing.

Agent coordination rules are defined in:

docs/planning/AI_AGENT_COORDINATION.md

Agent seeding documents are defined in:

docs/AGENTS/

---

# Section 0.2: Control Tower Coordination

The **Project Manager Agent operates as the system's Control Tower**.

Responsibilities include:

- task dispatch
- milestone sequencing
- merge queue coordination
- cross-agent conflict resolution
- system stability monitoring

Other agents should not begin new work unless:

- it appears in the task list
- it is dispatched by the Control Tower
- the work scope is clearly defined

If uncertain about task priority, defer to the Control Tower.

---

# Section 1: Project Overview

PIPS 2.0 is a multi-tenant SaaS web application that embeds a **6-step process improvement methodology** into enterprise project management and ticketing software.

The goal is to help teams systematically identify problems, analyze causes, generate solutions, execute improvements, and measure outcomes.

---

## The 6 PIPS Steps

1. **Identify** — Define measurable problem statements
2. **Analyze** — Root cause analysis (fishbone, 5-why, force-field)
3. **Generate** — Brainstorm solutions (brainwriting, brainstorming)
4. **Select & Plan** — Decision matrices, weighted voting, RACI, implementation planning
5. **Implement** — Execute with milestones, checklists, progress tracking
6. **Evaluate** — Measure results, lessons learned, cycle back to Step 1

---

# Section 2: Tech Stack

| Layer         | Technology               | Notes                                        |
| ------------- | ------------------------ | -------------------------------------------- |
| Framework     | Next.js 15 (App Router)  | `apps/web/`                                  |
| Language      | TypeScript (strict mode) | Zero `any` types                             |
| UI Components | shadcn/ui + Radix        | Customized with PIPS design tokens           |
| Styling       | Tailwind CSS             | Extended with PIPS colors                    |
| State         | Zustand                  | Complex client state                         |
| Backend       | Supabase                 | Postgres, Auth, RLS, Storage, Edge Functions |
| Hosting       | Vercel                   | Preview deploys per PR                       |
| Payments      | Stripe                   | Not in MVP                                   |
| Email         | Resend                   | Transactional email                          |
| Monitoring    | Sentry                   | Error tracking                               |
| Testing       | Vitest + Playwright      | Unit + E2E                                   |
| Monorepo      | Turborepo + pnpm         | apps + packages                              |

---

# Section 3: Code Conventions

- Functional components with arrow functions
- Named exports only (no default exports)
- 2-space indentation
- Path aliases: `@/` → `apps/web/src`
- Files under 200 lines when possible
- Co-locate related files (component + hook + types)
- Zod schemas for all data validation
- Server Components by default
- `'use client'` only when necessary
- Server Actions for mutations
- API routes for webhooks and external APIs

---

# Section 4: Brand Identity

| Token   | Value   | Usage                |
| ------- | ------- | -------------------- |
| Primary | #4F46E5 | Buttons, links       |
| Deep    | #1B1340 | Sidebar backgrounds  |
| Accent  | #F59E0B | Attention highlights |
| Surface | #F0EDFA | Card backgrounds     |

### Step Colors

| Step   | Color   |
| ------ | ------- |
| Step 1 | #3B82F6 |
| Step 2 | #F59E0B |
| Step 3 | #10B981 |
| Step 4 | #6366F1 |
| Step 5 | #CA8A04 |
| Step 6 | #0891B2 |

### Typography

Headline: DM Serif Display  
Body: DM Sans  
Mono: JetBrains Mono

### UI Tokens

Border radius: 10px default, 20px pills  
Shadows: violet tinted rgba(#1B1340)

---

# Section 5: Project Structure

pips2.0/
├── apps/
│ └── web/
│ ├── app/
│ │ ├── (auth)/
│ │ ├── (marketing)/
│ │ └── (app)/
│ │ ├── dashboard/
│ │ ├── projects/
│ │ ├── tickets/
│ │ ├── teams/
│ │ └── settings/
│ ├── components/
│ │ ├── ui/
│ │ ├── pips/
│ │ ├── tickets/
│ │ └── layout/
│ ├── hooks/
│ ├── lib/
│ │ ├── supabase/
│ │ ├── utils.ts
│ │ └── validations.ts
│ ├── stores/
│ └── types/
├── packages/
│ └── shared/
├── supabase/
│ ├── migrations/
│ ├── functions/
│ └── seed.sql
├── tests/
│ ├── e2e/
│ └── integration/
├── docs/
│ ├── planning/
│ ├── mockups/
│ └── work-log/
└── .github/
└── workflows/

---

# Section 6: Database Conventions

- Every table has `org_id` for multi-tenancy
- Row Level Security enabled on all tables
- `created_at` and `updated_at` timestamps
- Soft delete using `archived_at`
- UUID primary keys
- Postgres enums for statuses and roles
- JSONB for flexible structured data
- Migration format:

YYYYMMDDHHMMSS_description.sql

For parallel agents:

Use **10-minute timestamp spacing** between migrations.

---

# Section 7: Testing Requirements

The following must always pass:

pnpm tsc --noEmit
pnpm lint
pnpm test

E2E tests:

pnpm exec playwright test

Testing expectations:

- Components → render + interaction tests
- API → happy path + error cases
- E2E → real workflows

---

# Section 8: Planning References

Planning documents live in:

docs/planning/

Key files:

PROJECT_INDEX.md — system navigation guide  
MVP_SPECIFICATION.md — definitive MVP scope  
TECHNICAL_PLAN.md — architecture + schema  
DEVOPS_RUNBOOK.md — deployment setup  
AI_AGENT_COORDINATION.md — multi-agent rules  
BRAND_GUIDE_V2.md — design tokens  
UX_FLOWS.md — user journeys  
CONTENT_MIGRATION.md — template migration specs

---

# Section 8.1: Planning Document Protection

Planning documents define system intent and must remain stable.

Agents must **not modify planning documents unless they are the designated owner**.

If a planning document appears incorrect:

1. Document the issue
2. Propose a correction
3. Escalate to the document owner
4. Await approval before editing

Ownership rules are defined in:

docs/planning/AI_AGENT_COORDINATION.md

---

# Section 9: Git Conventions

Branch naming:

feature/description  
fix/description  
chore/description

Agent branches:

agent/{phase}-{feature}

Commit style:

feat(scope): description

Rules:

- Never force push to main
- PR required for merges
- CI must pass before merge

---

# Section 10: System Goal

The goal of the PIPS 2.0 system is to deliver a stable, scalable SaaS product that embeds structured process improvement into everyday work.

The AI agent system exists to enable:

- parallel development
- clear ownership
- predictable delivery
- high quality releases
