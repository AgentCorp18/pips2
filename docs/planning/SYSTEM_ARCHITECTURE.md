# PIPS 2.0 — System Architecture

> **Version:** 1.0
> **Created:** March 3, 2026
> **Author:** System Architect Agent (Claude Opus 4.6)
> **Status:** Current — documents the ACTUAL deployed system
> **Production URL:** https://pips-app.vercel.app
> **Supabase Project:** `cmrribhjgfybbxhrsxqi` (us-east-2)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [System Topology](#2-system-topology)
3. [Repository Architecture](#3-repository-architecture)
4. [Domain Model](#4-domain-model)
5. [Data Architecture](#5-data-architecture)
6. [Component Architecture](#6-component-architecture)
7. [API Architecture](#7-api-architecture)
8. [Integration Architecture](#8-integration-architecture)
9. [Security Architecture](#9-security-architecture)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Observability Architecture](#11-observability-architecture)
12. [Scaling Strategy](#12-scaling-strategy)

---

## 1. System Overview

PIPS 2.0 is a multi-tenant SaaS web application that embeds a 6-step process improvement methodology (Identify, Analyze, Generate, Select & Plan, Implement, Evaluate) into enterprise project management and ticketing software.

### Core Capabilities (Deployed)

- **6-step PIPS workflow** — guided projects with objectives, prompts, 18 interactive forms, completion criteria, and step gating
- **Ticketing system** — Kanban board, list view, parent/child tickets, auto-sequenced IDs (`ORG-123`), filters, comments
- **Multi-tenancy** — shared-schema with RLS, org-scoped data isolation, 5-role RBAC
- **Knowledge Hub** — 4-pillar content system (Book, Guide, Workbook, Workshop), 205 content nodes, full-text search, bookmarks, reading sessions
- **Training Mode** — training paths, modules, exercises, per-user progress tracking
- **Team management** — teams with lead/member roles, cross-team membership, project assignment
- **Notifications** — in-app bell with unread count, email notifications via Resend
- **Dashboard** — project health metrics, projects-by-step chart, recent activity feed
- **Global search** — Cmd/Ctrl+K command palette, Postgres FTS across projects and tickets
- **Dark mode** — CSS variable-based theming with light/dark toggle
- **CSV/PDF export** — project and ticket data export

### Technology Stack

| Layer            | Technology                                      | Version |
| ---------------- | ----------------------------------------------- | ------- |
| Framework        | Next.js (App Router)                            | 16.x    |
| Language         | TypeScript (strict)                             | 5.x     |
| UI Components    | shadcn/ui + Radix                               | Latest  |
| Styling          | Tailwind CSS v4                                 | 4.x     |
| Client State     | Zustand                                         | 5.x     |
| Backend/Database | Supabase (Postgres + Auth + Storage + Realtime) | Latest  |
| Hosting          | Vercel                                          | Pro     |
| Email            | Resend                                          | Latest  |
| Monitoring       | Sentry                                          | Latest  |
| Unit Tests       | Vitest                                          | Latest  |
| E2E Tests        | Playwright                                      | Latest  |
| Monorepo         | Turborepo + pnpm                                | Latest  |
| Validation       | Zod                                             | Latest  |
| Forms            | React Hook Form + Zod                           | Latest  |
| Charts           | Recharts                                        | 2.x     |
| Icons            | Lucide React                                    | Latest  |

### Design Principles

1. **Org-scoped everything** — every data entity belongs to an organization via `org_id`
2. **Server Components first** — RSC for data fetching; `'use client'` only for interactivity
3. **Server Actions for mutations** — API routes reserved for webhooks and external APIs
4. **Type safety end-to-end** — Zod at API boundaries, TypeScript strict, no `any` types
5. **Audit everything** — database triggers log every mutation to `audit_log`
6. **Progressive disclosure** — guided prompts and methodology content surfaced contextually

---

## 2. System Topology

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                  │
│                                                                    │
│   Browser (Desktop)    Browser (Mobile)    Future: PWA / API      │
│   Next.js RSC + CSR    Responsive Layout   External Systems       │
│                                                                    │
└──────────────┬──────────────────┬─────────────────────────────────┘
               │                  │
               ▼                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                    EDGE LAYER — Vercel                             │
│                                                                    │
│  ┌────────────────────────────────────────────────────────┐       │
│  │  Next.js App Router                                     │       │
│  │                                                         │       │
│  │  ┌──────────┐ ┌──────────────┐ ┌───────────────────┐  │       │
│  │  │  Pages/   │ │   Server     │ │  Server Actions   │  │       │
│  │  │  Layouts  │ │  Components  │ │  (mutations)      │  │       │
│  │  └──────────┘ └──────────────┘ └───────────────────┘  │       │
│  │                                                         │       │
│  │  ┌──────────────────┐  ┌──────────────────────────┐   │       │
│  │  │  Middleware       │  │  API Routes              │   │       │
│  │  │  (auth refresh)   │  │  /api/health             │   │       │
│  │  │                   │  │  /api/notifications/email │   │       │
│  │  └──────────────────┘  └──────────────────────────┘   │       │
│  └────────────────────────────────────────────────────────┘       │
│                                                                    │
│  Vercel Edge Network: CDN, SSL, auto-scaling                      │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                  BACKEND — Supabase (us-east-2)                    │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐      │
│  │  Auth         │  │  Realtime    │  │  Storage           │      │
│  │  Email/Pass   │  │  (reserved)  │  │  Avatars, logos    │      │
│  │  JWT + RLS    │  │              │  │  Attachments       │      │
│  └──────────────┘  └──────────────┘  └────────────────────┘      │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  PostgreSQL 15+                                            │    │
│  │                                                            │    │
│  │  22 tables  ·  11 enums  ·  RLS on every table            │    │
│  │  12 migrations  ·  FTS (tsvector + ts_rank)               │    │
│  │  JSONB for forms  ·  Audit triggers  ·  Auto-timestamps   │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                               │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                        │
│  │  Resend   │  │  Sentry  │  │  Stripe  │                        │
│  │  Email    │  │  Errors  │  │ (future) │                        │
│  └──────────┘  └──────────┘  └──────────┘                        │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action (browser)
    │
    ▼
Next.js Middleware ──► Refresh Supabase session (getUser)
    │
    ▼
Server Component / Server Action
    │
    ├──► createClient() ──► Supabase with user JWT (RLS enforced)
    │
    ├──► createAdminClient() ──► Supabase with service role (bypasses RLS)
    │         (only for: invitation acceptance, system operations)
    │
    └──► Postgres executes query with RLS policies checking org_id
              │
              ├──► Audit trigger fires ──► INSERT into audit_log
              │
              └──► Notification trigger fires ──► INSERT into notifications
```

---

## 3. Repository Architecture

```
pips2.0/
├── apps/
│   └── web/                          # Next.js 16 application
│       ├── src/
│       │   ├── app/                  # App Router (pages, layouts, actions)
│       │   │   ├── (auth)/           # Auth pages (login, signup, forgot, reset, invite)
│       │   │   ├── (marketing)/      # Public pages (landing, methodology, book)
│       │   │   ├── (app)/            # Authenticated app shell
│       │   │   │   ├── dashboard/    # Org dashboard with metrics
│       │   │   │   ├── projects/     # PIPS projects + 6-step workflow
│       │   │   │   ├── tickets/      # Ticket list, board, detail
│       │   │   │   ├── knowledge/    # Knowledge Hub (4 pillars)
│       │   │   │   ├── training/     # Training paths and exercises
│       │   │   │   ├── teams/        # Team CRUD
│       │   │   │   ├── settings/     # Org settings, members, audit log
│       │   │   │   ├── my-work/      # Personal task view
│       │   │   │   ├── profile/      # User profile
│       │   │   │   ├── search/       # Search results
│       │   │   │   ├── notifications/# Notification list
│       │   │   │   ├── onboarding/   # Post-signup org creation
│       │   │   │   └── export/       # CSV/PDF export actions
│       │   │   └── api/              # Route handlers (health, email webhook)
│       │   ├── components/           # Shared React components
│       │   │   ├── ui/               # shadcn/ui primitives (30+ components)
│       │   │   ├── pips/             # PIPS-specific (stepper, form-shell, project-card)
│       │   │   ├── tickets/          # Ticket components (kanban, card, filters, comments)
│       │   │   ├── layout/           # App shell (command-palette, notification-bell, user-menu)
│       │   │   ├── dashboard/        # Dashboard widgets (stat-cards, chart, activity)
│       │   │   ├── knowledge/        # Knowledge Hub (bookmark, reader, markdown)
│       │   │   ├── knowledge-cadence/# Cadence bar
│       │   │   ├── training/         # Training components (landing, progress-ring)
│       │   │   └── landing/          # Marketing page sections
│       │   ├── hooks/                # Custom hooks (use-mounted, use-permissions)
│       │   ├── stores/               # Zustand stores (org-store)
│       │   ├── lib/                  # Utilities
│       │   │   ├── supabase/         # Client factories (server, client, admin, middleware)
│       │   │   ├── email/            # Email templates and send helper (Resend)
│       │   │   ├── validations.ts    # Zod schemas (auth, org, project, ticket, comment)
│       │   │   ├── form-schemas.ts   # PIPS form Zod schemas (18 form types)
│       │   │   ├── permissions.ts    # Server-side permission helpers
│       │   │   ├── csv.ts            # CSV export utility
│       │   │   ├── pdf.ts            # PDF export utility
│       │   │   ├── logger.ts         # Structured logging
│       │   │   └── utils.ts          # General utilities
│       │   └── types/                # TypeScript type definitions
│       └── public/                   # Static assets
│
├── packages/
│   └── shared/                       # Shared types and constants
│       └── src/
│           ├── types.ts              # Organization, UserProfile, OrgRole, etc.
│           ├── constants.ts          # PIPS steps, colors, brand tokens
│           ├── permissions.ts        # RBAC matrix, hasPermission, canManageRole
│           ├── content-taxonomy.ts   # Knowledge Hub content types and tags
│           ├── step-content.ts       # 6-step methodology content (objectives, forms, criteria)
│           └── index.ts              # Barrel export
│
├── supabase/
│   ├── migrations/                   # 12 SQL migrations (YYYYMMDDHHMMSS format)
│   │   ├── 20260303000000_initial_schema.sql         # Core schema (22 tables, enums, RLS)
│   │   ├── 20260303120000_notification_triggers.sql  # Notification trigger functions
│   │   ├── 20260303180000_security_hardening.sql     # Security fixes
│   │   ├── 20260303190000_fix_audit_trigger.sql      # Audit trigger fix
│   │   ├── 20260303200000_notification_preferences.sql
│   │   ├── 20260303210000_ticket_parent_child.sql    # Parent/child ticket support
│   │   ├── 20260303220000_fix_profile_trigger.sql
│   │   ├── 20260303230000_fix_org_creation_rls.sql
│   │   ├── 20260303240000_fix_org_members_rls_recursion.sql
│   │   ├── 20260303250000_fix_profile_display_name.sql
│   │   ├── 20260304000000_knowledge_hub_tables.sql   # Knowledge Hub + Training + Workshop
│   │   └── (future migrations follow same naming)
│   ├── functions/                    # Supabase Edge Functions (reserved, unused in MVP)
│   └── seed.sql                      # Dev seed data
│
├── scripts/
│   ├── compile-content.ts            # Parses PIPS Book markdown into ContentNode JSON
│   ├── seed-content.ts               # Seeds content_nodes into Supabase
│   └── output/
│       └── content-nodes.json        # 205 compiled content nodes
│
├── tests/
│   └── e2e/                          # Playwright E2E tests (18 specs, 160 tests)
│       ├── helpers/
│       │   ├── auth-fixture.ts       # Authenticated test fixture
│       │   ├── test-factories.ts     # Server-side data creation
│       │   └── supabase-admin.ts     # Admin query helpers
│       └── *.spec.ts                 # Test spec files
│
├── docs/
│   ├── planning/                     # 17 planning documents (read-only reference)
│   ├── mockups/                      # 3 HTML brand mockups
│   └── work-log/                     # Daily work session logs
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Typecheck + lint + test + build
│       ├── e2e.yml                   # Playwright E2E against prod
│       ├── deploy-preview.yml        # Vercel preview deploy
│       └── migration-check.yml       # SQL migration lint
│
├── turbo.json                        # Turborepo task config
├── pnpm-workspace.yaml               # Workspace: apps/* + packages/*
├── vercel.json                       # Vercel config (turbo-ignore)
└── CLAUDE.md                         # Project instructions for AI agents
```

### Responsibilities

| Directory         | Responsibility                                     | Dependency Rule                |
| ----------------- | -------------------------------------------------- | ------------------------------ |
| `apps/web`        | UI, routing, server actions, API routes            | Imports from `packages/shared` |
| `packages/shared` | Types, constants, RBAC logic, content taxonomy     | No app-level imports           |
| `supabase/`       | Database schema, RLS policies, triggers, seed data | Standalone SQL                 |
| `scripts/`        | Content compilation and seeding pipelines          | Standalone scripts             |
| `tests/e2e/`      | End-to-end browser tests                           | Depends on running app         |
| `docs/`           | Planning, mockups, work logs                       | Read-only reference            |

---

## 4. Domain Model

### Entity Relationship Diagram

```
                        ┌──────────────┐
                        │   profiles   │
                        │  (auth.users)│
                        └──────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
     ┌────────────┐   ┌──────────────┐   ┌───────────────┐
     │   org_     │   │   org_       │   │  notifications │
     │  members   │◄──│ invitations  │   └───────────────┘
     └─────┬──────┘   └──────────────┘
           │
           ▼
   ┌───────────────┐
   │ organizations │ ◄─── Top-level tenant
   └───────┬───────┘
           │
     ┌─────┼──────────────┬──────────────┬──────────────┐
     │     │              │              │              │
     ▼     ▼              ▼              ▼              ▼
┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  org_  │ │  teams   │ │ projects │ │ tickets  │ │ audit_   │
│settings│ └────┬─────┘ └────┬─────┘ └────┬─────┘ │  log     │
└────────┘      │            │            │        └──────────┘
                ▼            │            │
          ┌──────────┐       │            │
          │  team_   │       │            ├──► ticket_relations
          │ members  │       │            ├──► ticket_transitions
          └──────────┘       │            ├──► comments
                             │            └──► file_attachments
                             │
                    ┌────────┼────────┐
                    │        │        │
                    ▼        ▼        ▼
             ┌──────────┐ ┌──────┐ ┌──────────────┐
             │ project_ │ │project│ │ project_     │
             │ members  │ │_steps │ │   forms      │
             └──────────┘ └──────┘ │ (18 types)   │
                                   └──────────────┘
```

### Core Domain Objects

**Organization** — Top-level tenant. All data is scoped to an org via `org_id`. Has a unique slug used in identification (currently flat routing, not slug-in-URL). Tracks plan tier (free/starter/professional/enterprise) and Stripe references.

**Profile** — Extends Supabase `auth.users`. Created automatically on signup via database trigger. Contains display name, avatar, timezone. A profile can belong to multiple organizations.

**Org Member** — Join table linking profiles to organizations with a role. Roles: `owner`, `admin`, `manager`, `member`, `viewer`. Exactly one row per user per org. The role determines permissions across the entire RBAC system.

**Project** — A PIPS process improvement cycle. Tracks 6 steps via the `current_step` enum and `project_steps` rows. Has owner, team, priority, target dates, and a problem statement. Statuses: `draft`, `active`, `on_hold`, `completed`, `archived`. Full-text searchable via `search_vector`.

**Project Step** — One row per step per project (6 rows created on project creation). Stores step-specific data as JSONB. Tracks status: `not_started`, `in_progress`, `completed`, `skipped`.

**Project Form** — An instance of a PIPS tool within a step. The `form_type` discriminator identifies the tool (e.g., `fishbone`, `five_why`, `criteria_matrix`). The `data` column stores form-specific JSONB. Multiple forms of the same type can exist per step.

**Ticket** — Atomic unit of work. Can be standalone or linked to a project/step. Auto-sequenced per org (`sequence_number`). Types: `pips_project`, `task`, `bug`, `feature`, `general`. Full Kanban workflow: `backlog` > `todo` > `in_progress` > `in_review` > `done`. Supports parent/child hierarchy.

**Team** — Named group within an org. Members can have `lead` or `member` roles. Teams are assignable to projects.

**Comment** — Polymorphic: can attach to a ticket, project, or project step (exactly one target enforced via CHECK constraint). Supports threading via `parent_id` and `@mentions` via `mentions[]`.

**Notification** — Per-user notification with type, title, body, and entity reference. Types: `ticket_assigned`, `ticket_updated`, `ticket_commented`, `project_updated`, `mention`, `invitation`, `system`. Tracks `read_at` and `email_sent`.

**Audit Log** — Immutable append-only log. Populated by database triggers on INSERT/UPDATE/DELETE of key tables. Stores `org_id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_data`, `new_data`.

**Content Node** — Knowledge Hub content unit. Belongs to a `pillar` (book, guide, workbook, workshop). Has markdown body, tags (JSONB with steps, tools, roles, principles, difficulty), and FTS via generated `search_vector` column. Global catalog — no RLS (public read).

### The 6-Step PIPS Methodology

| Step | Name          | DB Enum       | Color               | Key Forms                                                                         |
| ---- | ------------- | ------------- | ------------------- | --------------------------------------------------------------------------------- |
| 1    | Identify      | `identify`    | `#2563EB` (Blue)    | Problem Statement, Impact Assessment                                              |
| 2    | Analyze       | `analyze`     | `#D97706` (Amber)   | Fishbone, 5-Why, Force Field, Checksheet                                          |
| 3    | Generate      | `generate`    | `#059669` (Emerald) | Brainstorming, Brainwriting                                                       |
| 4    | Select & Plan | `select_plan` | `#4338CA` (Indigo)  | Criteria Matrix, Paired Comparisons, RACI, Cost-Benefit, Implementation Checklist |
| 5    | Implement     | `implement`   | `#CA8A04` (Gold)    | Implementation Plan, Milestone Tracker                                            |
| 6    | Evaluate      | `evaluate`    | `#0891B2` (Teal)    | Before/After, Evaluation, Lessons Learned, Balance Sheet                          |

### The 18 PIPS Forms

All forms are stored in `project_forms` with `form_type` as discriminator and `data` as JSONB. Each form has a Zod schema defined in `apps/web/src/lib/form-schemas.ts`.

| #   | Form Type ID               | Name                        | PIPS Step | Route Segment               |
| --- | -------------------------- | --------------------------- | --------- | --------------------------- |
| 1   | `problem_statement`        | Problem Statement           | 1         | `problem_statement/`        |
| 2   | `impact_assessment`        | Impact Assessment           | 1         | `impact_assessment/`        |
| 3   | `fishbone`                 | Fishbone (Ishikawa) Diagram | 2         | `fishbone/`                 |
| 4   | `five_why`                 | 5-Why Analysis              | 2         | `five_why/`                 |
| 5   | `force_field`              | Force Field Analysis        | 2         | `force_field/`              |
| 6   | `checksheet`               | Checksheet                  | 2         | `checksheet/`               |
| 7   | `brainstorming`            | Brainstorming               | 3         | `brainstorming/`            |
| 8   | `brainwriting`             | Brainwriting                | 3         | `brainwriting/`             |
| 9   | `criteria_matrix`          | Criteria Rating Matrix      | 4         | `criteria-matrix/`          |
| 10  | `paired_comparisons`       | Paired Comparisons          | 4         | `paired_comparisons/`       |
| 11  | `cost_benefit`             | Cost-Benefit Analysis       | 4         | `cost-benefit/`             |
| 12  | `raci`                     | RACI Matrix                 | 4         | `raci/`                     |
| 13  | `implementation_checklist` | Implementation Checklist    | 4-5       | `implementation-checklist/` |
| 14  | `implementation_plan`      | Implementation Plan         | 5         | `implementation-plan/`      |
| 15  | `milestone_tracker`        | Milestone Tracker           | 5         | `milestone-tracker/`        |
| 16  | `before_after`             | Before/After Comparison     | 6         | `before-after/`             |
| 17  | `evaluation`               | Evaluation                  | 6         | `evaluation/`               |
| 18  | `lessons_learned`          | Lessons Learned             | 6         | `lessons-learned/`          |
| 19  | `balance_sheet`            | Balance Sheet               | 6         | `balance_sheet/`            |

Each form route lives at: `apps/web/src/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/{route-segment}/`

Each form has a `page.tsx` (server component) and a `*-form.tsx` (client component with auto-save).

---

## 5. Data Architecture

### Schema Strategy

- **Single shared schema** — all tenants share the `public` schema
- **`org_id` on every tenant-facing table** — enforced via RLS policies
- **UUIDs** as primary keys (`gen_random_uuid()`)
- **Timestamps** — `created_at` and `updated_at` on every table (auto-updated via trigger)
- **Soft delete** — `archived_at` timestamp (projects use status `archived`)
- **JSONB** — used for flexible form data (`project_forms.data`, `project_steps.data`), feature flags (`org_settings.features`), and content tags (`content_nodes.tags`)
- **Postgres enums** — 11 enums for fixed sets (roles, statuses, priorities, steps, providers)

### Tables (32 total)

**Core (12):** `profiles`, `organizations`, `org_members`, `org_invitations`, `org_settings`, `teams`, `team_members`, `projects`, `project_members`, `project_steps`, `project_forms`, `tickets`

**Ticket System (3):** `ticket_relations`, `ticket_transitions`, `comments`

**Cross-Cutting (5):** `file_attachments`, `notifications`, `audit_log`, `integration_connections`, `org_api_keys`

**Webhooks (2):** `webhook_subscriptions`, `webhook_deliveries`

**Knowledge Hub (4):** `content_nodes`, `reading_sessions`, `content_bookmarks`, `content_read_history`

**Training (4):** `training_paths`, `training_modules`, `training_exercises`, `training_progress`, `training_exercise_data`

**Workshop (1):** `workshop_sessions`

### Multi-Tenant RLS Strategy

Every table with tenant data has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`. The pattern uses `EXISTS` subqueries against `org_members` to verify the authenticated user belongs to the org.

**Standard org-scoped SELECT policy:**

```sql
CREATE POLICY "Org members can view projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = projects.org_id
        AND org_members.user_id = auth.uid()
    )
  );
```

**Role-restricted WRITE policy (manager+):**

```sql
CREATE POLICY "Manager+ can create teams"
  ON teams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = teams.org_id
        AND org_members.user_id = auth.uid()
        AND org_members.role IN ('owner', 'admin', 'manager')
    )
  );
```

**User-scoped tables (no org_id):**

```sql
-- Knowledge Hub: user's own data only
CREATE POLICY "Users can view own bookmarks"
  ON content_bookmarks FOR SELECT
  USING (user_id = auth.uid());
```

**Global catalog tables (no RLS):** `content_nodes`, `training_paths`, `training_modules`, `training_exercises` — these are populated by the content pipeline and are readable by all authenticated users.

### Key Indexes

| Table           | Index                           | Type                            | Purpose              |
| --------------- | ------------------------------- | ------------------------------- | -------------------- |
| `projects`      | `idx_projects_search`           | GIN(search_vector)              | Full-text search     |
| `tickets`       | `idx_tickets_search`            | GIN(search_vector)              | Full-text search     |
| `tickets`       | `idx_tickets_org_sequence`      | UNIQUE(org_id, sequence_number) | Ticket ID generation |
| `tickets`       | `idx_tickets_status`            | B-tree(org_id, status)          | Board queries        |
| `content_nodes` | `idx_content_nodes_search`      | GIN(search_vector)              | Knowledge search     |
| `content_nodes` | `idx_content_nodes_tags`        | GIN(tags)                       | Tag filtering        |
| `notifications` | `idx_notifications_user_unread` | Partial (read_at IS NULL)       | Unread count         |
| `org_members`   | `idx_org_members_user`          | B-tree(user_id)                 | RLS policy lookups   |

### Full-Text Search

Three entities support FTS via auto-populated `tsvector` columns:

- **Projects** — weighted: title (A), description (B), problem_statement (B)
- **Tickets** — weighted: title (A), description (B)
- **Content Nodes** — weighted: title (A), summary (B), body_md (C); uses `GENERATED ALWAYS AS ... STORED`

### Migration Rules

1. Files named `YYYYMMDDHHMMSS_description.sql`
2. Applied via `supabase db push` (production) or `supabase db reset` (local)
3. Parallel agent migrations use 10-minute timestamp gaps
4. Every migration is idempotent and additive (no destructive DDL without explicit intent)
5. SQL linting via `supabase db lint` in CI and pre-commit hook

---

## 6. Component Architecture

### UI Layer Structure

```
components/
├── ui/              # shadcn/ui primitives (button, card, dialog, input, etc.)
│                      Rule: No business logic. Pure presentation.
│
├── layout/          # App shell components
│   ├── command-palette.tsx      # Cmd+K search overlay
│   ├── notification-bell.tsx    # Header notification icon + dropdown
│   ├── user-menu.tsx            # Avatar dropdown (profile, settings, logout)
│   ├── empty-state.tsx          # Reusable empty-state pattern
│   └── error-boundary.tsx       # React error boundary
│
├── pips/            # PIPS methodology components
│   ├── step-stepper.tsx         # Horizontal 6-step progress indicator
│   ├── step-view.tsx            # Step content wrapper with methodology sidebar
│   ├── form-shell.tsx           # Shared form wrapper (auto-save, header, actions)
│   ├── form-textarea.tsx        # Textarea with character count
│   ├── project-card.tsx         # Project card for lists
│   ├── project-tabs.tsx         # Overview/Board/Forms tab navigation
│   ├── linked-tickets.tsx       # Tickets linked to a project step
│   ├── permission-gate.tsx      # Conditional rendering by role
│   └── export-projects-button.tsx
│
├── tickets/         # Ticketing components
│   ├── kanban-board.tsx         # Drag-and-drop board
│   ├── kanban-card.tsx          # Board ticket card
│   ├── ticket-list-table.tsx    # Sortable table view
│   ├── ticket-create-form.tsx   # New ticket dialog
│   ├── ticket-detail-client.tsx # Full ticket detail view
│   ├── comment-section.tsx      # Threaded comments
│   ├── board-filters.tsx        # Board filter bar
│   ├── ticket-filter-panel.tsx  # Advanced filter panel
│   ├── bulk-actions-bar.tsx     # Multi-select actions
│   └── sub-tickets.tsx          # Child ticket list
│
├── dashboard/       # Dashboard widgets
│   ├── stat-cards.tsx           # Active projects, open tickets, overdue
│   ├── projects-by-step-chart.tsx  # Recharts bar chart
│   └── recent-activity.tsx      # Activity feed
│
├── knowledge/       # Knowledge Hub
│   ├── knowledge-hub-landing.tsx  # Hub landing page
│   ├── content-reader.tsx       # Content display with markdown
│   ├── bookmark-button.tsx      # Bookmark toggle
│   └── markdown-content.tsx     # Markdown renderer
│
├── knowledge-cadence/
│   └── knowledge-cadence-bar.tsx  # Contextual content suggestions
│
├── training/        # Training mode
│   ├── training-landing.tsx     # Training hub landing
│   └── training-progress-ring.tsx  # Circular progress indicator
│
└── landing/         # Marketing page sections
    ├── hero-section.tsx
    ├── features-section.tsx
    ├── methodology-section.tsx
    ├── how-it-works-section.tsx
    ├── cta-section.tsx
    ├── landing-nav.tsx
    └── landing-footer.tsx
```

### Dependency Rules

1. `ui/` components import nothing from `pips/`, `tickets/`, etc. (base layer)
2. Domain components (`pips/`, `tickets/`, `dashboard/`) import from `ui/` and `@pips/shared`
3. Page-level components (`app/`) import from any component directory
4. Server Components are default; `'use client'` is added only for interactivity (forms, drag-drop, state)
5. Co-located `__tests__/` directories for component tests

### State Management

**Zustand** is used for complex client-side state that must persist across navigations:

- `org-store.ts` — current organization context (id, name, slug, role, settings, branding)

**Server state** is managed via Server Components and Server Actions — no client-side caching layer (no React Query, no SWR). Data is fetched fresh on each navigation via RSC.

### Hooks

| Hook             | File                       | Purpose                                                   |
| ---------------- | -------------------------- | --------------------------------------------------------- |
| `useMounted`     | `hooks/use-mounted.ts`     | Prevents hydration mismatch for client-only rendering     |
| `usePermissions` | `hooks/use-permissions.ts` | Client-side role/permission checks (reads from org-store) |

---

## 7. API Architecture

### Server Actions (Primary Mutation Pattern)

Server Actions are the primary mutation mechanism. They live co-located with their pages as `actions.ts` files.

**Pattern:**

```
apps/web/src/app/(app)/{feature}/actions.ts

export const createProject = async (formData: FormData) => {
  // 1. Parse and validate with Zod
  // 2. Get authenticated user via createClient()
  // 3. Check permissions via requirePermission()
  // 4. Execute Supabase mutation (RLS enforced)
  // 5. revalidatePath() for cache invalidation
  // 6. Return { success, data } or { success: false, error }
}
```

**Server Action locations:**

| Feature         | Actions File                                 | Key Actions                                          |
| --------------- | -------------------------------------------- | ---------------------------------------------------- |
| Auth            | `(auth)/actions.ts`                          | login, signup, forgotPassword, resetPassword         |
| Onboarding      | `onboarding/actions.ts`                      | createOrganization                                   |
| Dashboard       | `dashboard/actions.ts`                       | getDashboardData, createSampleProject                |
| Projects        | `projects/new/actions.ts`                    | createProject                                        |
| Project Detail  | `projects/[projectId]/actions.ts`            | updateProject, advanceStep, getProjectData           |
| Forms           | `projects/.../forms/actions.ts`              | saveFormData, getFormData                            |
| Tickets         | `tickets/actions.ts`                         | createTicket, updateTicket, deleteTicket, getTickets |
| Ticket Comments | `tickets/[ticketId]/comment-actions.ts`      | addComment, updateComment, deleteComment             |
| Teams           | `teams/actions.ts`                           | createTeam, updateTeam, deleteTeam, addMember        |
| Settings        | `settings/actions.ts`                        | updateOrgSettings                                    |
| Members         | `settings/members/actions.ts`                | inviteMember, updateMemberRole, removeMember         |
| Notifications   | `notifications/actions.ts`                   | markAsRead, markAllAsRead                            |
| Search          | `search/actions.ts`                          | globalSearch                                         |
| Profile         | `profile/actions.ts`                         | updateProfile                                        |
| Knowledge       | `knowledge/actions.ts`                       | toggleBookmark, updateReadingSession                 |
| Training        | `training/actions.ts`                        | updateTrainingProgress                               |
| Audit Log       | `settings/audit-log/actions.ts`              | getAuditLog                                          |
| Export          | `export/actions.ts`, `export/pdf-actions.ts` | exportCSV, exportPDF                                 |

### API Routes (Webhooks and Health)

API route handlers are used only for endpoints that cannot be Server Actions:

| Route                      | Method | Purpose                                |
| -------------------------- | ------ | -------------------------------------- |
| `/api/health`              | GET    | Health check (returns 200 + status)    |
| `/api/health/ping`         | GET    | Lightweight ping (Vercel uptime check) |
| `/api/notifications/email` | POST   | Email notification webhook handler     |

### Validation Pattern

All mutations use Zod schemas defined in two files:

- `lib/validations.ts` — auth, org, project, ticket, comment schemas
- `lib/form-schemas.ts` — 18 PIPS form type schemas (fishbone, 5-why, etc.)

**Validation flow:**

```
FormData/Input → Zod parse → Type-safe data → Server Action → Supabase
```

Invalid data returns `{ success: false, error: string }` without touching the database.

### Error Handling Pattern

Server Actions return a consistent shape:

```typescript
type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string }
```

Unrecoverable errors (auth failures, network issues) are caught and logged via `console.error`. The UI displays error messages via toast notifications or inline error states.

---

## 8. Integration Architecture

### Current State (MVP)

No external integrations are active. Schema and enums exist for future implementation:

- `integration_connections` table with `config` JSONB
- `integration_provider` enum: `'jira'`, `'azure_devops'`, `'aha'`
- `sync_direction` enum: `'inbound'`, `'outbound'`, `'bidirectional'`
- Ticket `external_id`, `external_url`, `external_source` columns
- `org_api_keys` table for API key management
- `webhook_subscriptions` and `webhook_deliveries` tables

### Planned Integrations (Post-MVP)

| Integration  | Phase    | Mechanism                                                                           |
| ------------ | -------- | ----------------------------------------------------------------------------------- |
| Jira         | Phase 4  | Bidirectional ticket sync via REST API + webhooks                                   |
| Azure DevOps | Phase 4  | Work item sync via REST API                                                         |
| AHA!         | Phase 4  | Roadmap sync via REST API                                                           |
| Slack/Teams  | Phase 4  | Notification forwarding, ticket creation from messages                              |
| Stripe       | Phase 2+ | Subscription billing (schema ready: `stripe_customer_id`, `stripe_subscription_id`) |
| Zapier/Make  | Phase 4+ | No-code integration via webhook events                                              |

### Email System (Active)

**Provider:** Resend

**Implementation:** `apps/web/src/lib/email/`

| File                 | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| `send.ts`            | Send helper — wraps Resend API, fails silently if no API key |
| `base-template.ts`   | Shared HTML email wrapper with PIPS branding                 |
| `invitation.ts`      | Org invitation email template                                |
| `welcome.ts`         | Post-signup welcome email                                    |
| `ticket-assigned.ts` | Ticket assignment notification                               |
| `mention.ts`         | @mention notification                                        |
| `project-updated.ts` | Project status change notification                           |
| `index.ts`           | Barrel export                                                |

Emails are triggered by Server Actions (not database triggers) to maintain control over timing and content. The `sendEmail` function fails gracefully when `RESEND_API_KEY` is not set.

### Content Pipeline (Active)

The Knowledge Hub content is populated via a compile-then-seed pipeline:

```
PIPS Book Markdown files (../PIPS/Book/*.md)
         │
         ▼
scripts/compile-content.ts
  - Parses markdown on ## headings
  - Tags sections with steps, tools, principles
  - Calculates estimated read time
  - Outputs: scripts/output/content-nodes.json (205 nodes)
         │
         ▼
scripts/seed-content.ts
  - Reads content-nodes.json
  - Upserts into content_nodes table (admin client, bypasses RLS)
  - FTS search_vector auto-populated via GENERATED ALWAYS AS column
```

---

## 9. Security Architecture

### Authentication

**Provider:** Supabase Auth (email/password)

**Flow:**

1. User signs up with email + password → Supabase creates `auth.users` row
2. Database trigger `on_auth_user_created` creates matching `profiles` row
3. Login returns JWT (access token + refresh token)
4. Middleware refreshes session on every request via `supabase.auth.getUser()`
5. JWT contains `auth.uid()` used in all RLS policies

**Session Management:**

- Access token: 1-hour expiry, auto-refreshed by middleware
- Refresh token: 30-day expiry
- Cookies managed via `@supabase/ssr` (server-side rendering compatible)

### Authorization (RBAC)

**5 roles with hierarchical permissions:**

| Permission                | Owner | Admin | Manager | Member | Viewer |
| ------------------------- | ----- | ----- | ------- | ------ | ------ |
| `org.delete`              | Y     |       |         |        |        |
| `org.billing`             | Y     |       |         |        |        |
| `org.members.manage`      | Y     | Y     |         |        |        |
| `org.teams.manage`        | Y     | Y     | Y       |        |        |
| `org.integrations.manage` | Y     | Y     |         |        |        |
| `project.create`          | Y     | Y     | Y       | Y      |        |
| `project.update`          | Y     | Y     | Y       |        |        |
| `ticket.create`           | Y     | Y     | Y       | Y      |        |
| `ticket.assign`           | Y     | Y     | Y       | Y      |        |
| `ticket.comment`          | Y     | Y     | Y       | Y      |        |
| `step.complete`           | Y     | Y     | Y       |        |        |
| `step.override`           | Y     | Y     | Y       |        |        |
| `data.view`               | Y     | Y     | Y       | Y      | Y      |
| `profile.edit`            | Y     | Y     | Y       | Y      | Y      |

**Enforcement layers:**

1. **Database (RLS)** — Policies check `org_members.role` for write operations
2. **Server Actions** — `requirePermission(orgId, permission)` throws before mutation
3. **UI** — `<PermissionGate permission="...">` hides unauthorized controls
4. **Hierarchy check** — `canManageRole(actorRole, targetRole)` prevents privilege escalation

### Row-Level Security

RLS is enabled on every table. 22 core tables + 10 Knowledge Hub/Training/Workshop tables all have RLS policies.

**Policy categories:**

| Category              | Pattern                                                                    | Tables                                                              |
| --------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Org-scoped read       | `EXISTS(org_members WHERE org_id = table.org_id AND user_id = auth.uid())` | projects, tickets, teams, comments, etc.                            |
| Role-restricted write | Same + `AND role IN (...)`                                                 | teams (manager+), settings (admin+), members (admin+)               |
| User-scoped           | `user_id = auth.uid()`                                                     | reading_sessions, content_bookmarks, training_progress              |
| Global read           | No RLS                                                                     | content_nodes, training_paths, training_modules, training_exercises |
| Audit read            | Restricted to owner/admin                                                  | audit_log                                                           |

### API Security

- **Server Actions** are not exposed as public HTTP endpoints — they run server-side only
- **API routes** (`/api/health/*`) do not require auth (health checks)
- **Email webhook** (`/api/notifications/email`) is internal-only
- **Supabase admin client** bypasses RLS — used only for system operations (invitation acceptance) via `SUPABASE_SERVICE_ROLE_KEY`
- **CORS** is managed by Vercel (same-origin by default)

### Input Validation

All user input is validated with Zod before database operations:

- Auth inputs: email format, password length (8-72 chars)
- Org slug: regex `^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$`
- Ticket title: 1-500 chars, description: max 10,000 chars
- Comments: 1-10,000 chars
- Form data: per-type Zod schemas with defaults

### File Upload Security

- **Supabase Storage** for avatars, logos, attachments
- Avatar max: 5 MB
- Bucket-level access policies (not yet fully configured for production)

---

## 10. Deployment Architecture

### CI/CD Pipeline

**4 GitHub Actions workflows:**

| Workflow              | Trigger                             | Jobs                                                |
| --------------------- | ----------------------------------- | --------------------------------------------------- |
| `ci.yml`              | Push to main/develop, PRs           | install, typecheck, lint, format:check, test, build |
| `e2e.yml`             | Manual/scheduled                    | Playwright against production                       |
| `deploy-preview.yml`  | PR to main                          | Vercel preview deployment                           |
| `migration-check.yml` | PRs touching `supabase/migrations/` | SQL lint check                                      |

**CI job dependency graph:**

```
install ──► typecheck ──┐
       └──► lint ───────┤──► build
       └──► test        │
```

### Vercel Deployment

- **Production:** auto-deploy on push to `main`
- **Preview:** auto-deploy on PR creation
- **Build command:** `turbo build` (Turborepo orchestrates `packages/shared` build first)
- **Framework:** Next.js (auto-detected by Vercel)
- **Node.js:** 22+
- **`turbo-ignore`** — Vercel skips builds when irrelevant files change

### Environment Variables

| Variable                             | Environment | Purpose                         |
| ------------------------------------ | ----------- | ------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`           | All         | Supabase project URL            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | All         | Supabase anonymous/public key   |
| `SUPABASE_SERVICE_ROLE_KEY`          | Server only | Admin operations (bypasses RLS) |
| `NEXT_PUBLIC_APP_URL`                | All         | Application base URL            |
| `NEXT_PUBLIC_APP_NAME`               | All         | Application display name        |
| `RESEND_API_KEY`                     | Server only | Email sending                   |
| `NOTIFICATION_FROM_EMAIL`            | Server only | Email sender address            |
| `NEXT_PUBLIC_SENTRY_DSN`             | All         | Sentry error tracking           |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | All         | Stripe public key (future)      |

### Database Migrations

Migrations are applied to production via `supabase db push` or the Supabase Dashboard. The Supabase CLI tracks applied migrations in the `supabase_migrations` table.

**Current state:** 12 migrations applied, covering initial schema + security hardening + Knowledge Hub tables.

---

## 11. Observability Architecture

### Error Tracking

**Provider:** Sentry

- Integrated with Next.js via `@sentry/nextjs`
- Captures both client-side and server-side errors
- DSN configured via `NEXT_PUBLIC_SENTRY_DSN`

### Logging

**Current implementation:** `apps/web/src/lib/logger.ts`

- Structured logging with context (org_id, user_id, action)
- Levels: `info`, `warn`, `error`
- Output: `console.*` (captured by Vercel logs)

### Audit Trail

The `audit_log` table provides a complete mutation history:

- Populated via `audit_trigger_func()` database trigger
- Fires on INSERT/UPDATE/DELETE for: `tickets`, `projects`, `org_members`
- Stores: action, entity_type, entity_id, old_data (JSONB), new_data (JSONB)
- Indexed by `(org_id, created_at DESC)` and `(entity_type, entity_id)`
- Viewable by Owner/Admin via Settings > Audit Log

### Health Checks

| Endpoint           | Purpose                  | Response                      |
| ------------------ | ------------------------ | ----------------------------- |
| `/api/health`      | Full health check        | `{ status: 'ok', timestamp }` |
| `/api/health/ping` | Lightweight uptime check | `{ pong: true }`              |

### Performance Metrics

- Vercel Web Analytics (built-in)
- Next.js server-side rendering performance tracked by Vercel
- No custom performance monitoring in MVP

### Gaps (Planned)

- No proactive alerting (Sentry alerts to be configured)
- No usage analytics/tracking (planned post-stabilization)
- No custom dashboards for system metrics
- Audit log partition strategy needed for high-volume orgs

---

## 12. Scaling Strategy

### Database Scaling

**Current:** Single Supabase Postgres instance (us-east-2)

**Scaling path:**

| Threshold             | Action                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| < 100K rows/table     | Current setup sufficient                                                                       |
| 100K+ tickets         | Verify index usage on `idx_tickets_org`, `idx_tickets_status`; add composite indexes if needed |
| 500K+ audit_log rows  | Implement range partitioning by month (schema already notes this)                              |
| 1M+ content reads     | `content_nodes` is cache-friendly (global catalog); add Supabase read replica                  |
| High connection count | Supabase Supavisor connection pooler (auto-provisioned)                                        |

**FTS scaling:** If full-text search latency exceeds 100ms at >100K tickets, migrate to Typesense or Meilisearch as a dedicated search index.

### API/Edge Scaling

**Vercel auto-scales** — serverless functions scale to zero and auto-scale on demand. No manual intervention needed.

**Server Action performance:**

- Each action creates a new Supabase client (connection pooled via Supavisor)
- RLS policy evaluation adds ~1-3ms per query (single `EXISTS` subquery)
- No caching layer — every navigation fetches fresh data via RSC

**Cache opportunities (future):**

- Knowledge Hub content nodes are static — cache at CDN layer via ISR
- Dashboard aggregates — candidate for `unstable_cache` or ISR
- Step methodology content is compiled into `packages/shared` — zero DB cost

### Frontend Scaling

**Bundle size management:**

- Turborepo builds `packages/shared` independently (tree-shakeable)
- shadcn/ui components are copy-pasted (no unused imports)
- `next/font` for DM Sans (self-hosted, no external font load)
- Code-splitting via App Router (each route segment is a separate chunk)

**Static content:**

- Marketing pages (`(marketing)/`) can be statically generated
- Knowledge Hub pages with stable content are ISR candidates

### Multi-Tenant Scaling

**RLS performance:** The shared-schema + RLS pattern scales well to thousands of tenants because:

1. Every query uses an `org_id` index — no full-table scans
2. RLS policies use `auth.uid()` from the JWT — no additional DB lookup
3. `org_members` lookups are indexed on `(org_id, user_id)`

**Tenant isolation ceiling:** If a single tenant exceeds 10K concurrent users or 10M rows, consider Supabase's premium plan with dedicated compute. Schema-per-tenant migration is not planned — the architecture does not require it.

### Content Pipeline Scaling

The compile-and-seed pipeline runs as a manual script. At current scale (205 nodes), it completes in seconds. If content grows to 1000+ nodes:

1. Add incremental seeding (only upsert changed nodes)
2. Move to a CI-triggered pipeline on content file changes
3. Consider a separate content CMS if non-developer editors need write access

---

_This document describes the PIPS 2.0 system as deployed on March 3, 2026. It is maintained alongside the codebase and should be updated when architectural decisions change._
