# PIPS 2.0 — System Architecture

> **Version:** 1.2 — Updated 2026-03-12
> **Created:** March 3, 2026
> **Author:** Chief Architect Agent (Claude Opus 4.6)
> **Status:** Current — documents the ACTUAL deployed system + planned architecture
> **Production URL:** https://pips-app.vercel.app
> **Supabase Project:** `cmrribhjgfybbxhrsxqi` (us-east-2)
>
> **v1.2 changes (2026-03-12):** Training Mode upgraded from [SCAFFOLDED] to [BUILT] — fully functional with 4 paths, 27 modules, 59 exercises. Workshop upgraded from [SCAFFOLDED] to [BUILT] — session CRUD, timer, Supabase Realtime sync. Real-time collaboration upgraded from [DEFERRED] to [BUILT] (via Workshop Realtime). Migration count updated to 13. Added new subsystems: Admin Dashboard, Tools Sandbox, Ticket Change Log, Security Settings, Swim Lane Board, Forms View/Edit Toggle.
>
> **v1.1 changes:** Added build-status markers ([BUILT], [SCAFFOLDED], [PLANNED]) throughout. New sections: Knowledge Hub Architecture (13), Training Mode Architecture (14), Marketing & SEO Architecture (15), Content Pipeline Architecture (16). Updated domain model with 11 new tables. Updated component tree with new component families. Added Architecture Decision Records and risk register.

---

## Build Status Legend

Throughout this document, section headers and descriptions include a status marker:

- **[BUILT]** — Implemented, tested, and deployed at pips-app.vercel.app
- **[SCAFFOLDED]** — DB tables and/or page routes exist, UI is partial or placeholder
- **[PLANNED]** — Specified in planning docs but not yet implemented
- **[DEFERRED]** — Explicitly out of scope for current phases

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
13. [Knowledge Hub Architecture](#13-knowledge-hub-architecture)
14. [Training Mode Architecture](#14-training-mode-architecture)
15. [Marketing & SEO Architecture](#15-marketing--seo-architecture)
16. [Content Pipeline Architecture](#16-content-pipeline-architecture)
17. [Architecture Decision Records](#17-architecture-decision-records)
18. [Architecture Risk Register](#18-architecture-risk-register)

---

## 1. System Overview

PIPS 2.0 is a multi-tenant SaaS web application that embeds a 6-step process improvement methodology (Identify, Analyze, Generate, Select & Plan, Implement, Evaluate) into enterprise project management and ticketing software.

### Core Capabilities

| Capability              | Status         | Description                                                                                                    |
| ----------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| 6-step PIPS workflow    | **[BUILT]**    | Guided projects with objectives, prompts, 18 interactive forms, completion criteria, step gating               |
| Ticketing system        | **[BUILT]**    | Kanban board, list view, parent/child tickets, auto-sequenced IDs (`ORG-123`), filters, comments               |
| Multi-tenancy           | **[BUILT]**    | Shared-schema with RLS, org-scoped data isolation, 5-role RBAC                                                 |
| Knowledge Hub           | **[BUILT]**    | 4-pillar content system (Book, Guide, Workbook, Workshop), 205 content nodes, FTS, bookmarks, reading sessions |
| Cadence Bar             | **[BUILT]**    | Contextual methodology content surfaced on forms, ticket detail, and dashboard                                 |
| Training Mode           | **[BUILT]**    | 4 paths, 27 modules, 59 exercises, landing/path/module/progress pages, exercise components fully functional    |
| Workshop Facilitation   | **[BUILT]**    | Session CRUD, timer with pause/resume, Supabase Realtime sync, facilitator guide, scenarios                    |
| Marketing Pages         | **[BUILT]**    | 6 step pages, 22 tool pages, 20 book previews, 35 glossary terms, 17 templates, resources hub                  |
| SEO                     | **[BUILT]**    | Dynamic `sitemap.ts`, `robots.ts`, JSON-LD structured data component                                           |
| Team management         | **[BUILT]**    | Teams with lead/member roles, cross-team membership, project assignment                                        |
| Notifications           | **[BUILT]**    | In-app bell with unread count, email notifications via Resend                                                  |
| Dashboard               | **[BUILT]**    | Project health metrics, projects-by-step chart, recent activity feed                                           |
| Global search           | **[BUILT]**    | Cmd/Ctrl+K command palette, Postgres FTS across projects and tickets                                           |
| Dark mode               | **[BUILT]**    | CSS variable-based theming with light/dark toggle                                                              |
| CSV/PDF export          | **[BUILT]**    | Project and ticket data export                                                                                 |
| Billing                 | **[DEFERRED]** | No Stripe integration. Schema ready (`stripe_customer_id`, `stripe_subscription_id`)                           |
| SSO/SAML                | **[DEFERRED]** | No implementation. Phase 4+                                                                                    |
| External integrations   | **[DEFERRED]** | Jira, Azure DevOps, AHA! — schema columns exist, no sync code                                                  |
| Admin Dashboard         | **[BUILT]**    | Org-level admin stats, user/project/ticket counts, system health overview                                      |
| Tools Sandbox           | **[BUILT]**    | Standalone methodology tools (Fishbone, Brainstorming, etc.) with localStorage — no project required           |
| Ticket Change Log       | **[BUILT]**    | Audit trail for ticket field changes with before/after values                                                  |
| Security Settings       | **[BUILT]**    | Password change form in user profile/settings                                                                  |
| Swim Lane Board         | **[BUILT]**    | Projects grouped by PIPS step with drag-and-drop                                                               |
| Forms View/Edit Toggle  | **[BUILT]**    | Read-only view mode vs edit mode on all 18 PIPS forms                                                          |
| Real-time collaboration | **[BUILT]**    | Supabase Realtime used in Workshop for live timer sync and participant updates                                 |
| White-label             | **[DEFERRED]** | `org_settings` table has branding columns, no UI                                                               |

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
7. **Content as code** — Knowledge Hub content compiled from markdown, seeded to DB, queried at runtime
8. **Global catalogs for methodology** — content_nodes, training_paths, training_modules, training_exercises are public read (no RLS), user progress is user-scoped

---

## 2. System Topology [BUILT]

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
│  ┌────────────────────────────────────────────────────────┐       │
│  │  Static Assets: Marketing pages, SEO sitemap/robots    │       │
│  │  Dynamic SEO: JSON-LD structured data per page         │       │
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
│  │  33 tables  ·  11 enums  ·  RLS on every tenant table     │    │
│  │  13 migrations  ·  FTS (tsvector + ts_rank)               │    │
│  │  JSONB for forms + content tags  ·  Audit triggers        │    │
│  │  Auto-timestamps  ·  Generated search vectors             │    │
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

### Data Flow [BUILT]

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
    │         (only for: invitation acceptance, system operations, content seeding)
    │
    └──► Postgres executes query with RLS policies checking org_id
              │
              ├──► Audit trigger fires ──► INSERT into audit_log
              │
              └──► Notification trigger fires ──► INSERT into notifications
```

### Content Data Flow [BUILT]

```
PIPS Book Markdown (../PIPS/Book/*.md)
    │
    ▼
scripts/compile-content.ts (offline)
    │ Parses ## headings, tags with steps/tools/principles
    │ Outputs: scripts/output/content-nodes.json (205 nodes)
    ▼
scripts/seed-content.ts (admin client, bypasses RLS)
    │ Upserts into content_nodes table
    ▼
Knowledge Hub pages (Server Components)
    │ Query content_nodes via FTS or pillar/tag filters
    ▼
Cadence Bar component
    │ buildProductContext(stepNumber, formType) → matchContentNodes()
    │ Surfaces relevant content from all 4 pillars contextually
    ▼
User sees methodology content embedded in their workflow
```

---

## 3. Repository Architecture [BUILT]

```
pips2.0/
├── apps/
│   └── web/                          # Next.js 16 application
│       ├── src/
│       │   ├── app/                  # App Router (pages, layouts, actions)
│       │   │   ├── (auth)/           # Auth pages (login, signup, forgot, reset, invite)
│       │   │   ├── (marketing)/      # Public marketing pages
│       │   │   │   ├── book/         # [BUILT] 20 chapter preview pages
│       │   │   │   │   └── [chapterSlug]/
│       │   │   │   ├── methodology/  # [BUILT] Methodology hub
│       │   │   │   │   ├── step/[stepNumber]/  # 6 step detail pages
│       │   │   │   │   └── tools/[toolSlug]/   # 22 tool detail pages
│       │   │   │   └── resources/    # [BUILT] Resources hub
│       │   │   │       ├── glossary/ # 35 glossary term pages
│       │   │   │       │   └── [term]/
│       │   │   │       └── templates/# 17 downloadable templates
│       │   │   ├── (app)/            # Authenticated app shell
│       │   │   │   ├── dashboard/    # [BUILT] Org dashboard with metrics
│       │   │   │   ├── projects/     # [BUILT] PIPS projects + 6-step workflow
│       │   │   │   ├── tickets/      # [BUILT] Ticket list, board, detail
│       │   │   │   ├── knowledge/    # [BUILT] Knowledge Hub (4 pillars)
│       │   │   │   │   ├── book/     # Book pillar content reader
│       │   │   │   │   ├── guide/    # Guide pillar content reader
│       │   │   │   │   ├── workbook/ # Workbook pillar content reader
│       │   │   │   │   ├── workshop/ # Workshop pillar content reader
│       │   │   │   │   ├── bookmarks/# User's saved bookmarks
│       │   │   │   │   └── search/   # Knowledge Hub FTS
│       │   │   │   ├── training/     # [BUILT] Training paths and exercises
│       │   │   │   │   ├── path/     # Path detail pages
│       │   │   │   │   ├── practice/ # Exercise practice pages
│       │   │   │   │   └── progress/ # User progress dashboard
│       │   │   │   ├── teams/        # [BUILT] Team CRUD
│       │   │   │   ├── settings/     # [BUILT] Org settings, members, audit log
│       │   │   │   ├── my-work/      # [BUILT] Personal task view
│       │   │   │   ├── profile/      # [BUILT] User profile
│       │   │   │   ├── search/       # [BUILT] Search results
│       │   │   │   ├── notifications/# [BUILT] Notification list
│       │   │   │   ├── onboarding/   # [BUILT] Post-signup org creation
│       │   │   │   └── export/       # [BUILT] CSV/PDF export actions
│       │   │   ├── api/              # Route handlers (health, email webhook)
│       │   │   ├── sitemap.ts        # [BUILT] Dynamic sitemap generation
│       │   │   ├── robots.ts         # [BUILT] Search engine directives
│       │   │   └── global-error.tsx  # [BUILT] Error boundary
│       │   ├── components/           # Shared React components
│       │   │   ├── ui/               # [BUILT] shadcn/ui primitives (30+)
│       │   │   ├── pips/             # [BUILT] PIPS-specific (stepper, form-shell, project-card)
│       │   │   ├── tickets/          # [BUILT] Ticket components (kanban, card, filters, comments)
│       │   │   ├── layout/           # [BUILT] App shell (command-palette, notification-bell, user-menu)
│       │   │   ├── dashboard/        # [BUILT] Dashboard widgets (stat-cards, chart, activity)
│       │   │   ├── knowledge/        # [BUILT] Knowledge Hub (bookmark, reader, markdown)
│       │   │   ├── knowledge-cadence/# [BUILT] Cadence bar
│       │   │   ├── training/         # [BUILT] Training components (landing, exercises)
│       │   │   ├── seo/              # [BUILT] JSON-LD structured data component
│       │   │   └── landing/          # [BUILT] Marketing page sections
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
│           ├── content-taxonomy.ts   # [BUILT] Knowledge Hub content types, tags, Cadence Bar matching
│           ├── step-content.ts       # 6-step methodology content (objectives, forms, criteria)
│           └── index.ts              # Barrel export
│
├── supabase/
│   ├── migrations/                   # 13 SQL migrations (YYYYMMDDHHMMSS format)
│   │   ├── 20260303000000_initial_schema.sql
│   │   ├── 20260303120000_notification_triggers.sql
│   │   ├── 20260303180000_security_hardening.sql
│   │   ├── 20260303190000_fix_audit_trigger.sql
│   │   ├── 20260303200000_notification_preferences.sql
│   │   ├── 20260303210000_ticket_parent_child.sql
│   │   ├── 20260303220000_fix_profile_trigger.sql
│   │   ├── 20260303230000_fix_org_creation_rls.sql
│   │   ├── 20260303240000_fix_org_members_rls_recursion.sql
│   │   ├── 20260303250000_fix_profile_display_name.sql
│   │   ├── 20260304000000_knowledge_hub_tables.sql   # Knowledge Hub + Training + Workshop
│   │   ├── 20260304100000_workshop_modules_column.sql  # Workshop module additions
│   │   └── 20260308000000_workshop_participants.sql    # Workshop participant tracking
│   ├── functions/                    # Supabase Edge Functions (reserved, unused)
│   └── seed.sql                      # Dev seed data
│
├── scripts/
│   ├── compile-content.ts            # [BUILT] Parses PIPS Book markdown into ContentNode JSON
│   ├── seed-content.ts               # [BUILT] Seeds content_nodes into Supabase
│   ├── seed-training.ts              # [BUILT] Seeds training paths, modules, and exercises
│   └── output/
│       └── content-nodes.json        # [BUILT] 205 compiled content nodes
│
├── tests/
│   └── e2e/                          # Playwright E2E tests (25 specs, 230+ tests)
│       ├── helpers/
│       │   ├── auth-fixture.ts
│       │   ├── test-factories.ts
│       │   └── supabase-admin.ts
│       └── *.spec.ts
│
├── docs/
│   ├── planning/                     # 17+ planning documents (read-only reference)
│   ├── AGENTS/                       # Agent seed documents
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
| `scripts/`        | Content compilation, training seeding pipelines    | Standalone scripts             |
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
          ┌──────────┐       │            ├──► ticket_relations
          │  team_   │       │            ├──► ticket_transitions
          │ members  │       │            ├──► comments
          └──────────┘       │            └──► file_attachments
                             │
                    ┌────────┼────────┐
                    │        │        │
                    ▼        ▼        ▼
             ┌──────────┐ ┌──────┐ ┌──────────────┐
             │ project_ │ │project│ │ project_     │
             │ members  │ │_steps │ │   forms      │
             └──────────┘ └──────┘ │ (18 types)   │
                                   └──────────────┘

──────────────────── KNOWLEDGE HUB ────────────────────

     ┌─────────────────┐
     │  content_nodes   │ ◄─── Global catalog (no RLS)
     │  (205 nodes)     │       Populated by content pipeline
     └────────┬────────┘
              │
    ┌─────────┼─────────────┐
    │         │             │
    ▼         ▼             ▼
┌──────────┐ ┌────────────┐ ┌──────────────────┐
│ reading_ │ │  content_  │ │ content_read_    │
│ sessions │ │ bookmarks  │ │   history         │
└──────────┘ └────────────┘ └──────────────────┘
 (user RLS)   (user RLS)     (user RLS)

──────────────────── TRAINING MODE ────────────────────

┌────────────────┐
│ training_paths │ ◄─── Global catalog (no RLS)
└───────┬────────┘       4 paths seeded
        ▼
┌──────────────────┐
│ training_modules │ ◄─── 27 modules seeded
└───────┬──────────┘
        ▼
┌────────────────────┐
│ training_exercises │ ◄─── 59 exercises seeded
└───────┬────────────┘
        │
   ┌────┴────┐
   ▼         ▼
┌──────────┐ ┌──────────────────────┐
│ training │ │ training_exercise_   │
│ progress │ │   data               │
└──────────┘ └──────────────────────┘
 (user RLS)   (user RLS)

──────────────────── WORKSHOP ────────────────────

┌────────────────────┐
│ workshop_sessions  │ ◄─── Org-scoped (RLS)
└────────────────────┘
```

### Core Domain Objects [BUILT]

**Organization** — Top-level tenant. All data is scoped to an org via `org_id`. Has a unique slug used in identification (currently flat routing, not slug-in-URL). Tracks plan tier (free/starter/professional/enterprise) and Stripe references.

**Profile** — Extends Supabase `auth.users`. Created automatically on signup via database trigger. Contains display name, avatar, timezone. A profile can belong to multiple organizations.

**Org Member** — Join table linking profiles to organizations with a role. Roles: `owner`, `admin`, `manager`, `member`, `viewer`. Exactly one row per user per org. The role determines permissions across the entire RBAC system.

**Project** — A PIPS process improvement cycle. Tracks 6 steps via the `current_step` enum and `project_steps` rows. Has owner, team, priority, target dates, and a problem statement. Statuses: `draft`, `active`, `on_hold`, `completed`, `archived`. Full-text searchable via `search_vector`. Note: DB column is `title` (not `name`); frontend maps `name` to `title` in server actions.

**Project Step** — One row per step per project (6 rows created on project creation). Stores step-specific data as JSONB. Tracks status: `not_started`, `in_progress`, `completed`, `skipped`.

**Project Form** — An instance of a PIPS tool within a step. The `form_type` discriminator identifies the tool (e.g., `fishbone`, `five_why`, `criteria_matrix`). The `data` column stores form-specific JSONB. Multiple forms of the same type can exist per step.

**Ticket** — Atomic unit of work. Can be standalone or linked to a project/step. Auto-sequenced per org (`sequence_number`). Types: `pips_project`, `task`, `bug`, `feature`, `general`. Full Kanban workflow: `backlog` > `todo` > `in_progress` > `in_review` > `done`. Supports parent/child hierarchy.

**Team** — Named group within an org. Members can have `lead` or `member` roles. Teams are assignable to projects.

**Comment** — Polymorphic: can attach to a ticket, project, or project step (exactly one target enforced via CHECK constraint). Supports threading via `parent_id` and `@mentions` via `mentions[]`.

**Notification** — Per-user notification with type, title, body, and entity reference. Types: `ticket_assigned`, `ticket_updated`, `ticket_commented`, `project_updated`, `mention`, `invitation`, `system`. Tracks `read_at` and `email_sent`.

**Audit Log** — Immutable append-only log. Populated by database triggers on INSERT/UPDATE/DELETE of key tables. Stores `org_id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_data`, `new_data`.

### Knowledge Hub Domain Objects [BUILT]

**Content Node** — Knowledge Hub content unit. Belongs to a `pillar` (book, guide, workbook, workshop). Has markdown body, tags (JSONB with steps, tools, roles, principles, difficulty), and FTS via `GENERATED ALWAYS AS ... STORED` search_vector column. Global catalog — no RLS (public read). Primary key is TEXT (e.g., `book-ch04-s01`), not UUID. 205 nodes seeded from the PIPS Book via content pipeline.

**Reading Session** — Tracks where a user left off per pillar. One session per user per pillar (unique constraint). Stores `content_node_id`, `scroll_position`, `last_accessed_at`. User-scoped RLS.

**Content Bookmark** — User's saved content nodes with optional note. One bookmark per user per node (unique constraint). User-scoped RLS.

**Content Read History** — Tracks which nodes a user has read, with `first_read_at`, `last_read_at`, and `read_count`. One row per user per node. User-scoped RLS.

### Training Mode Domain Objects [BUILT]

**Training Path** — Top-level training grouping. 4 paths seeded: one per role (Leader, Facilitator, Team Member, Champion). Global catalog (no RLS). Fields: `title`, `description`, `estimated_hours`, `target_audience`.

**Training Module** — Learning unit within a path. 27 modules seeded. Links to content nodes via `content_node_ids[]` array. Has `prerequisites[]` for sequencing. Global catalog (no RLS).

**Training Exercise** — Hands-on activity within a module. 59 exercises seeded. Types: `fill-form`, `multiple-choice`, `scenario-practice`, `reflection`. Has `config` JSONB for type-specific configuration (e.g., answer key for multiple choice, scenario details for practice). Global catalog (no RLS).

**Training Progress** — Per-user, per-module progress tracker. Statuses: `not_started`, `in_progress`, `completed`. Tracks `assessment_score` and `time_spent_minutes`. User-scoped RLS.

**Training Exercise Data** — Per-user, per-exercise submission data. Stores exercise responses as JSONB in `data` column, with `score`, `attempts`, and `last_attempt_at`. User-scoped RLS.

### Workshop Domain Object [BUILT]

**Workshop Session** — Org-scoped facilitated session. Has `facilitator_id`, `scenario_id`, timer state (JSONB), participant count, and status lifecycle (`draft` > `active` > `paused` > `completed`). RLS: org members can view, manager+ can create, facilitator can update, admin+ can delete.

### The 6-Step PIPS Methodology [BUILT]

| Step | Name          | DB Enum       | Color               | Key Forms                                                                         |
| ---- | ------------- | ------------- | ------------------- | --------------------------------------------------------------------------------- |
| 1    | Identify      | `identify`    | `#2563EB` (Blue)    | Problem Statement, Impact Assessment                                              |
| 2    | Analyze       | `analyze`     | `#D97706` (Amber)   | Fishbone, 5-Why, Force Field, Checksheet                                          |
| 3    | Generate      | `generate`    | `#059669` (Emerald) | Brainstorming, Brainwriting                                                       |
| 4    | Select & Plan | `select_plan` | `#4338CA` (Indigo)  | Criteria Matrix, Paired Comparisons, RACI, Cost-Benefit, Implementation Checklist |
| 5    | Implement     | `implement`   | `#CA8A04` (Gold)    | Implementation Plan, Milestone Tracker                                            |
| 6    | Evaluate      | `evaluate`    | `#0891B2` (Teal)    | Before/After, Evaluation, Lessons Learned, Balance Sheet                          |

### The 18 PIPS Forms [BUILT]

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

## 5. Data Architecture [BUILT]

### Schema Strategy

- **Single shared schema** — all tenants share the `public` schema
- **`org_id` on every tenant-facing table** — enforced via RLS policies
- **UUIDs** as primary keys (`gen_random_uuid()`) for tenant tables; **TEXT** primary keys for global catalogs (content_nodes, training_paths, training_modules, training_exercises)
- **Timestamps** — `created_at` and `updated_at` on every table (auto-updated via trigger)
- **Soft delete** — `archived_at` timestamp (projects use status `archived`)
- **JSONB** — used for flexible form data (`project_forms.data`, `project_steps.data`), feature flags (`org_settings.features`), content tags (`content_nodes.tags`), exercise config (`training_exercises.config`), timer state (`workshop_sessions.timer_state`)
- **Postgres enums** — 11 enums for fixed sets (roles, statuses, priorities, steps, providers)
- **CHECK constraints** — used on content_nodes (`pillar`, `access_level`), training tables (`type`, `status`), workshop_sessions (`status`)

### Tables (33 total)

**Core (12):** `profiles`, `organizations`, `org_members`, `org_invitations`, `org_settings`, `teams`, `team_members`, `projects`, `project_members`, `project_steps`, `project_forms`, `tickets`

**Ticket System (3):** `ticket_relations`, `ticket_transitions`, `comments`

**Cross-Cutting (5):** `file_attachments`, `notifications`, `audit_log`, `integration_connections`, `org_api_keys`

**Webhooks (2):** `webhook_subscriptions`, `webhook_deliveries`

**Knowledge Hub (4):** `content_nodes`, `reading_sessions`, `content_bookmarks`, `content_read_history`

**Training (5):** `training_paths`, `training_modules`, `training_exercises`, `training_progress`, `training_exercise_data`

**Workshop (1):** `workshop_sessions`

### Multi-Tenant RLS Strategy [BUILT]

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
-- Knowledge Hub + Training: user's own data only
CREATE POLICY "Users can view own bookmarks"
  ON content_bookmarks FOR SELECT
  USING (user_id = auth.uid());
```

**Global catalog tables (no RLS):** `content_nodes`, `training_paths`, `training_modules`, `training_exercises` — these are populated by the content pipeline and seeding scripts and are readable by all authenticated users.

**Workshop sessions (org-scoped + role-restricted):**

```sql
-- View: org members can view
-- Create: manager+ can insert
-- Update: facilitator (owner of session) can update
-- Delete: admin+ can delete
```

### Key Indexes [BUILT]

| Table                    | Index                               | Type                            | Purpose              |
| ------------------------ | ----------------------------------- | ------------------------------- | -------------------- |
| `projects`               | `idx_projects_search`               | GIN(search_vector)              | Full-text search     |
| `tickets`                | `idx_tickets_search`                | GIN(search_vector)              | Full-text search     |
| `tickets`                | `idx_tickets_org_sequence`          | UNIQUE(org_id, sequence_number) | Ticket ID generation |
| `tickets`                | `idx_tickets_status`                | B-tree(org_id, status)          | Board queries        |
| `content_nodes`          | `idx_content_nodes_search`          | GIN(search_vector)              | Knowledge search     |
| `content_nodes`          | `idx_content_nodes_tags`            | GIN(tags)                       | Tag filtering        |
| `content_nodes`          | `idx_content_nodes_pillar`          | B-tree(pillar)                  | Pillar queries       |
| `content_nodes`          | `idx_content_nodes_slug`            | B-tree(slug)                    | Slug lookups         |
| `content_nodes`          | `idx_content_nodes_parent`          | B-tree(parent_id)               | Hierarchy queries    |
| `content_nodes`          | `idx_content_nodes_access`          | B-tree(access_level)            | Access gating        |
| `notifications`          | `idx_notifications_user_unread`     | Partial (read_at IS NULL)       | Unread count         |
| `org_members`            | `idx_org_members_user`              | B-tree(user_id)                 | RLS policy lookups   |
| `training_modules`       | `idx_training_modules_path`         | B-tree(path_id)                 | Path queries         |
| `training_exercises`     | `idx_training_exercises_module`     | B-tree(module_id)               | Module queries       |
| `training_progress`      | `idx_training_progress_user`        | B-tree(user_id)                 | User progress        |
| `training_progress`      | `idx_training_progress_path`        | B-tree(path_id)                 | Path progress        |
| `training_exercise_data` | `idx_training_exercise_data_user`   | B-tree(user_id)                 | User exercise data   |
| `reading_sessions`       | `idx_reading_sessions_user`         | B-tree(user_id)                 | User sessions        |
| `content_bookmarks`      | `idx_content_bookmarks_user`        | B-tree(user_id)                 | User bookmarks       |
| `content_read_history`   | `idx_content_read_history_user`     | B-tree(user_id)                 | User history         |
| `content_read_history`   | `idx_content_read_history_node`     | B-tree(content_node_id)         | Node popularity      |
| `workshop_sessions`      | `idx_workshop_sessions_org`         | B-tree(org_id)                  | Org sessions         |
| `workshop_sessions`      | `idx_workshop_sessions_facilitator` | B-tree(facilitator_id)          | Facilitator lookup   |

### Full-Text Search [BUILT]

Three entities support FTS via auto-populated `tsvector` columns:

- **Projects** — weighted: title (A), description (B), problem_statement (B). Updated via trigger on INSERT/UPDATE.
- **Tickets** — weighted: title (A), description (B). Updated via trigger on INSERT/UPDATE.
- **Content Nodes** — weighted: title (A), summary (B), body_md (C). Uses `GENERATED ALWAYS AS ... STORED` (auto-maintained, no trigger needed).

### Migration Rules

1. Files named `YYYYMMDDHHMMSS_description.sql`
2. Applied via `supabase db push` (production) or `supabase db reset` (local)
3. Parallel agent migrations use 10-minute timestamp gaps
4. Every migration is idempotent and additive (no destructive DDL without explicit intent)
5. SQL linting via `supabase db lint` in CI and pre-commit hook

---

## 6. Component Architecture

### UI Layer Structure [BUILT unless noted]

```
components/
├── ui/              # [BUILT] shadcn/ui primitives (button, card, dialog, input, etc.)
│                      Rule: No business logic. Pure presentation.
│
├── layout/          # [BUILT] App shell components
│   ├── command-palette.tsx      # Cmd+K search overlay
│   ├── notification-bell.tsx    # Header notification icon + dropdown
│   ├── user-menu.tsx            # Avatar dropdown (profile, settings, logout)
│   ├── empty-state.tsx          # Reusable empty-state pattern
│   └── error-boundary.tsx       # React error boundary
│
├── pips/            # [BUILT] PIPS methodology components
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
├── tickets/         # [BUILT] Ticketing components
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
├── dashboard/       # [BUILT] Dashboard widgets
│   ├── stat-cards.tsx           # Active projects, open tickets, overdue
│   ├── projects-by-step-chart.tsx  # Recharts bar chart
│   └── recent-activity.tsx      # Activity feed
│
├── knowledge/       # [BUILT] Knowledge Hub
│   ├── knowledge-hub-landing.tsx  # Hub landing page with 4-pillar grid
│   ├── content-reader.tsx       # Content display with markdown rendering
│   ├── bookmark-button.tsx      # Bookmark toggle
│   └── markdown-content.tsx     # Markdown → React renderer
│
├── knowledge-cadence/  # [BUILT] Cadence Bar
│   └── knowledge-cadence-bar.tsx  # Contextual content suggestions
│                                    Uses buildProductContext() + matchContentNodes()
│                                    Integrated: forms, step-view, ticket detail, dashboard
│
├── training/        # [BUILT] Training mode
│   ├── training-landing.tsx        # Training hub landing with path cards
│   ├── training-progress-ring.tsx  # Circular progress indicator (SVG)
│   ├── training-module-card.tsx    # Module card with status badge
│   ├── training-exercise.tsx       # Exercise shell/router
│   ├── training-multiple-choice.tsx # MC quiz component
│   ├── training-reflection.tsx     # Reflection prompt component
│   └── scenario-runner.tsx         # Scenario practice runner
│
├── seo/             # [BUILT] SEO components
│   └── json-ld.tsx              # JSON-LD structured data (server component)
│
└── landing/         # [BUILT] Marketing page sections
    ├── hero-section.tsx         # Hero with CTA
    ├── features-section.tsx     # Feature grid
    ├── methodology-section.tsx  # 6-step visualization
    ├── how-it-works-section.tsx # Step-by-step walkthrough
    ├── cta-section.tsx          # Call to action
    ├── landing-nav.tsx          # Marketing site navigation
    ├── landing-footer.tsx       # Footer with links
    └── index.ts                 # Barrel export
```

### Dependency Rules

1. `ui/` components import nothing from `pips/`, `tickets/`, etc. (base layer)
2. Domain components (`pips/`, `tickets/`, `dashboard/`, `knowledge/`, `training/`) import from `ui/` and `@pips/shared`
3. `knowledge-cadence/` imports from `@pips/shared` (content-taxonomy.ts) for context matching
4. `seo/` is a pure server component with no external imports
5. Page-level components (`app/`) import from any component directory
6. Server Components are default; `'use client'` is added only for interactivity (forms, drag-drop, state)
7. Co-located `__tests__/` directories for component tests

### State Management [BUILT]

**Zustand** is used for complex client-side state that must persist across navigations:

- `org-store.ts` — current organization context (id, name, slug, role, settings, branding)

**Server state** is managed via Server Components and Server Actions — no client-side caching layer (no React Query, no SWR). Data is fetched fresh on each navigation via RSC.

### Hooks [BUILT]

| Hook             | File                       | Purpose                                                   |
| ---------------- | -------------------------- | --------------------------------------------------------- |
| `useMounted`     | `hooks/use-mounted.ts`     | Prevents hydration mismatch for client-only rendering     |
| `usePermissions` | `hooks/use-permissions.ts` | Client-side role/permission checks (reads from org-store) |

---

## 7. API Architecture [BUILT]

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

| Feature            | Actions File                                 | Key Actions                                          |
| ------------------ | -------------------------------------------- | ---------------------------------------------------- |
| Auth               | `(auth)/actions.ts`                          | login, signup, forgotPassword, resetPassword         |
| Onboarding         | `onboarding/actions.ts`                      | createOrganization                                   |
| Dashboard          | `dashboard/actions.ts`                       | getDashboardData, createSampleProject                |
| Projects           | `projects/new/actions.ts`                    | createProject                                        |
| Project Detail     | `projects/[projectId]/actions.ts`            | updateProject, advanceStep, getProjectData           |
| Forms              | `projects/.../forms/actions.ts`              | saveFormData, getFormData                            |
| Tickets            | `tickets/actions.ts`                         | createTicket, updateTicket, deleteTicket, getTickets |
| Ticket Comments    | `tickets/[ticketId]/comment-actions.ts`      | addComment, updateComment, deleteComment             |
| Teams              | `teams/actions.ts`                           | createTeam, updateTeam, deleteTeam, addMember        |
| Settings           | `settings/actions.ts`                        | updateOrgSettings                                    |
| Members            | `settings/members/actions.ts`                | inviteMember, updateMemberRole, removeMember         |
| Notifications      | `notifications/actions.ts`                   | markAsRead, markAllAsRead                            |
| Search             | `search/actions.ts`                          | globalSearch                                         |
| Profile            | `profile/actions.ts`                         | updateProfile                                        |
| Knowledge          | `knowledge/actions.ts`                       | toggleBookmark, updateReadingSession                 |
| Training           | `training/actions.ts`                        | updateTrainingProgress                               |
| Training Exercises | `training/exercise-actions.ts`               | submitExercise, getExerciseData                      |
| Audit Log          | `settings/audit-log/actions.ts`              | getAuditLog                                          |
| Export             | `export/actions.ts`, `export/pdf-actions.ts` | exportCSV, exportPDF                                 |

### API Routes (Webhooks and Health) [BUILT]

API route handlers are used only for endpoints that cannot be Server Actions:

| Route                      | Method | Purpose                                |
| -------------------------- | ------ | -------------------------------------- |
| `/api/health`              | GET    | Health check (returns 200 + status)    |
| `/api/health/ping`         | GET    | Lightweight ping (Vercel uptime check) |
| `/api/notifications/email` | POST   | Email notification webhook handler     |

### Validation Pattern [BUILT]

All mutations use Zod schemas defined in two files:

- `lib/validations.ts` — auth, org, project, ticket, comment schemas
- `lib/form-schemas.ts` — 18 PIPS form type schemas (fishbone, 5-why, etc.)

**Validation flow:**

```
FormData/Input → Zod parse → Type-safe data → Server Action → Supabase
```

Invalid data returns `{ success: false, error: string }` without touching the database.

### Error Handling Pattern [BUILT]

Server Actions return a consistent shape:

```typescript
type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string }
```

Unrecoverable errors (auth failures, network issues) are caught and logged via `console.error`. The UI displays error messages via toast notifications or inline error states.

---

## 8. Integration Architecture

### Current State (MVP) [BUILT — schema only, no active integrations]

No external integrations are active. Schema and enums exist for future implementation:

- `integration_connections` table with `config` JSONB
- `integration_provider` enum: `'jira'`, `'azure_devops'`, `'aha'`
- `sync_direction` enum: `'inbound'`, `'outbound'`, `'bidirectional'`
- Ticket `external_id`, `external_url`, `external_source` columns
- `org_api_keys` table for API key management
- `webhook_subscriptions` and `webhook_deliveries` tables

### Planned Integrations [PLANNED]

| Integration  | Phase    | Mechanism                                                                           |
| ------------ | -------- | ----------------------------------------------------------------------------------- |
| Jira         | Phase 4  | Bidirectional ticket sync via REST API + webhooks                                   |
| Azure DevOps | Phase 4  | Work item sync via REST API                                                         |
| AHA!         | Phase 4  | Roadmap sync via REST API                                                           |
| Slack/Teams  | Phase 4  | Notification forwarding, ticket creation from messages                              |
| Stripe       | Phase 2+ | Subscription billing (schema ready: `stripe_customer_id`, `stripe_subscription_id`) |
| Zapier/Make  | Phase 4+ | No-code integration via webhook events                                              |

### Email System [BUILT]

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

### Content Pipeline [BUILT]

See [Section 16: Content Pipeline Architecture](#16-content-pipeline-architecture) for full details.

---

## 9. Security Architecture [BUILT]

### Authentication

**Provider:** Supabase Auth (email/password)

**Flow:**

1. User signs up with email + password -> Supabase creates `auth.users` row
2. Database trigger `on_auth_user_created` creates matching `profiles` row
3. Login returns JWT (access token + refresh token)
4. Middleware refreshes session on every request via `supabase.auth.getUser()`
5. JWT contains `auth.uid()` used in all RLS policies

**Session Management:**

- Access token: 1-hour expiry, auto-refreshed by middleware
- Refresh token: 30-day expiry
- Cookies managed via `@supabase/ssr` (server-side rendering compatible)

### Authorization (RBAC) [BUILT]

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

### Row-Level Security [BUILT]

RLS is enabled on every table with tenant data. 22 core tables + 11 Knowledge Hub/Training/Workshop tables all have RLS policies.

**Policy categories:**

| Category              | Pattern                                                                    | Tables                                                                                               |
| --------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Org-scoped read       | `EXISTS(org_members WHERE org_id = table.org_id AND user_id = auth.uid())` | projects, tickets, teams, comments, workshop_sessions, etc.                                          |
| Role-restricted write | Same + `AND role IN (...)`                                                 | teams (manager+), settings (admin+), members (admin+), workshop_sessions (manager+/facilitator)      |
| User-scoped           | `user_id = auth.uid()`                                                     | reading_sessions, content_bookmarks, content_read_history, training_progress, training_exercise_data |
| Global read           | No RLS                                                                     | content_nodes, training_paths, training_modules, training_exercises                                  |
| Audit read            | Restricted to owner/admin                                                  | audit_log                                                                                            |

### API Security [BUILT]

- **Server Actions** are not exposed as public HTTP endpoints — they run server-side only
- **API routes** (`/api/health/*`) do not require auth (health checks)
- **Email webhook** (`/api/notifications/email`) is internal-only
- **Supabase admin client** bypasses RLS — used only for system operations (invitation acceptance, content seeding) via `SUPABASE_SERVICE_ROLE_KEY`
- **CORS** is managed by Vercel (same-origin by default)

### Input Validation [BUILT]

All user input is validated with Zod before database operations:

- Auth inputs: email format, password length (8-72 chars)
- Org slug: regex `^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$`
- Ticket title: 1-500 chars, description: max 10,000 chars
- Comments: 1-10,000 chars
- Form data: per-type Zod schemas with defaults

### File Upload Security [BUILT — partial]

- **Supabase Storage** for avatars, logos, attachments
- Avatar max: 5 MB
- Bucket-level access policies (not yet fully configured for production)

---

## 10. Deployment Architecture [BUILT]

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

### Vercel Deployment [BUILT]

- **Production:** auto-deploy on push to `main`
- **Preview:** auto-deploy on PR creation
- **Build command:** `turbo build` (Turborepo orchestrates `packages/shared` build first)
- **Framework:** Next.js (auto-detected by Vercel)
- **Node.js:** 22+
- **`turbo-ignore`** — Vercel skips builds when irrelevant files change

### Environment Variables [BUILT]

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

### Database Migrations [BUILT]

Migrations are applied to production via `supabase db push` or the Supabase Dashboard. The Supabase CLI tracks applied migrations in the `supabase_migrations` table.

**Current state:** 13 migrations applied, covering initial schema + security hardening + Knowledge Hub/Training/Workshop tables + workshop participants.

---

## 11. Observability Architecture

### Error Tracking [BUILT]

**Provider:** Sentry

- Integrated with Next.js via `@sentry/nextjs`
- Captures both client-side and server-side errors
- DSN configured via `NEXT_PUBLIC_SENTRY_DSN`

### Logging [BUILT]

**Current implementation:** `apps/web/src/lib/logger.ts`

- Structured logging with context (org_id, user_id, action)
- Levels: `info`, `warn`, `error`
- Output: `console.*` (captured by Vercel logs)

### Audit Trail [BUILT]

The `audit_log` table provides a complete mutation history:

- Populated via `audit_trigger_func()` database trigger
- Fires on INSERT/UPDATE/DELETE for: `tickets`, `projects`, `org_members`
- Stores: action, entity_type, entity_id, old_data (JSONB), new_data (JSONB)
- Indexed by `(org_id, created_at DESC)` and `(entity_type, entity_id)`
- Viewable by Owner/Admin via Settings > Audit Log

### Health Checks [BUILT]

| Endpoint           | Purpose                  | Response                      |
| ------------------ | ------------------------ | ----------------------------- |
| `/api/health`      | Full health check        | `{ status: 'ok', timestamp }` |
| `/api/health/ping` | Lightweight uptime check | `{ pong: true }`              |

### Performance Metrics [BUILT — basic]

- Vercel Web Analytics (built-in)
- Next.js server-side rendering performance tracked by Vercel
- No custom performance monitoring in MVP

### Gaps [PLANNED]

- No proactive alerting (Sentry alerts to be configured)
- No usage analytics/tracking (planned post-stabilization)
- No custom dashboards for system metrics
- Audit log partition strategy needed for high-volume orgs

---

## 12. Scaling Strategy

### Database Scaling

**Current:** Single Supabase Postgres instance (us-east-2)

**Scaling path:**

| Threshold                  | Action                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| < 100K rows/table          | Current setup sufficient                                                                       |
| 100K+ tickets              | Verify index usage on `idx_tickets_org`, `idx_tickets_status`; add composite indexes if needed |
| 500K+ audit_log rows       | Implement range partitioning by month (schema already notes this)                              |
| 1M+ content reads          | `content_nodes` is cache-friendly (global catalog); add Supabase read replica                  |
| 1M+ training_progress rows | Partition by `path_id` or add composite indexes                                                |
| High connection count      | Supabase Supavisor connection pooler (auto-provisioned)                                        |

**FTS scaling:** If full-text search latency exceeds 100ms at >100K tickets, migrate to Typesense or Meilisearch as a dedicated search index.

### API/Edge Scaling [BUILT]

**Vercel auto-scales** — serverless functions scale to zero and auto-scale on demand. No manual intervention needed.

**Server Action performance:**

- Each action creates a new Supabase client (connection pooled via Supavisor)
- RLS policy evaluation adds ~1-3ms per query (single `EXISTS` subquery)
- No caching layer — every navigation fetches fresh data via RSC

**Cache opportunities (future):**

- Knowledge Hub content nodes are static — cache at CDN layer via ISR
- Training catalog (paths, modules, exercises) is static — ISR candidate
- Dashboard aggregates — candidate for `unstable_cache` or ISR
- Step methodology content is compiled into `packages/shared` — zero DB cost
- Marketing pages are fully static — ISR with long revalidation

### Frontend Scaling [BUILT]

**Bundle size management:**

- Turborepo builds `packages/shared` independently (tree-shakeable)
- shadcn/ui components are copy-pasted (no unused imports)
- `next/font` for DM Sans (self-hosted, no external font load)
- Code-splitting via App Router (each route segment is a separate chunk)

**Static content:**

- Marketing pages (`(marketing)/`) can be statically generated
- Knowledge Hub pages with stable content are ISR candidates
- SEO pages (glossary, tool details, book previews) are static render candidates

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

## 13. Knowledge Hub Architecture [BUILT]

The Knowledge Hub is the teaching layer of PIPS 2.0 — it embeds methodology education directly into the product experience.

### The 4-Pillar Model

Content is organized into four pillars, each serving a different learning modality:

| Pillar       | Purpose                                                   | Content Source                 | Access Pattern     |
| ------------ | --------------------------------------------------------- | ------------------------------ | ------------------ |
| **Book**     | Deep methodology — chapters, case studies, philosophy     | PIPS Book (20 markdown files)  | Sequential reading |
| **Guide**    | Step-by-step methodology — tools, roles, processes        | Planned: structured guides     | [PLANNED]          |
| **Workbook** | Hands-on practice — exercises, templates                  | Planned: interactive exercises | [PLANNED]          |
| **Workshop** | Facilitation — timed sessions, scenarios, team activities | Session CRUD, timer, Realtime  | **[BUILT]**        |

Currently, the **Book** pillar has 205 content nodes seeded. Guide, Workbook, and Workshop pillars have the schema and taxonomy ready but lack seeded content.

### Content Node Schema

Each content node is tagged across multiple dimensions (defined in `packages/shared/src/content-taxonomy.ts`):

```
ContentNode
├── id (TEXT primary key, e.g., "book-ch04-s01")
├── pillar: book | guide | workbook | workshop
├── title, slug, summary, body_md
├── parent_id (hierarchy — chapters contain sections)
├── tags (JSONB):
│   ├── steps: step-1..step-6, philosophy, facilitation, culture, overview
│   ├── tools: fishbone, five-why, criteria-matrix, etc. (23 tools)
│   ├── roles: leader, facilitator, scribe, timekeeper, presenter
│   ├── principles: data-over-opinions, expand-then-contract, close-the-loop
│   ├── difficulty: beginner | intermediate | advanced
│   └── contentType: conceptual | procedural | reference | example | exercise
├── estimated_read_minutes
├── access_level: public | free-registered | paid
├── related_nodes[] (cross-references)
└── search_vector (GENERATED ALWAYS AS — auto-maintained FTS)
```

### Cadence Bar Architecture

The Cadence Bar is the connective tissue between the product workflow and the Knowledge Hub. It surfaces relevant methodology content contextually — when a user is working on Step 2 with a fishbone diagram, the Cadence Bar shows related book chapters, guides, exercises, and workshop activities.

**Integration points (all [BUILT]):**

- PIPS form pages (each form declares its step + tool context)
- Step view wrapper (declares step context)
- Ticket detail page (if ticket is linked to a PIPS project/step)
- Dashboard (shows general methodology highlights)

**Matching algorithm** (in `content-taxonomy.ts`):

```typescript
buildProductContext(stepNumber, formType)
  → { steps: ContentStep[], tools: ContentTool[], roles: [], principles: [] }

matchContentNodes(allNodes, context)
  → nodes where at least one tag dimension overlaps

groupByPillar(matchedNodes)
  → { book: ContentNode | null, guide: ..., workbook: ..., workshop: ... }
```

The Cadence Bar renders one card per pillar (max 4 cards), each linking to the most relevant content node in that pillar. This design ensures users always see methodology content from multiple learning perspectives.

### Knowledge Hub Page Architecture

| Route                  | Purpose                                              | Status                                       |
| ---------------------- | ---------------------------------------------------- | -------------------------------------------- |
| `/knowledge`           | Hub landing — 4-pillar grid with progress indicators | **[BUILT]**                                  |
| `/knowledge/book`      | Book pillar — chapter list with reading progress     | **[BUILT]**                                  |
| `/knowledge/guide`     | Guide pillar                                         | **[BUILT]** (route exists, awaiting content) |
| `/knowledge/workbook`  | Workbook pillar                                      | **[BUILT]** (route exists, awaiting content) |
| `/knowledge/workshop`  | Workshop pillar                                      | **[BUILT]** (route exists, awaiting content) |
| `/knowledge/bookmarks` | User's saved bookmarks                               | **[BUILT]**                                  |
| `/knowledge/search`    | FTS across all content nodes                         | **[BUILT]**                                  |

### User Data Tables

| Table                  | Purpose                                   | RLS         |
| ---------------------- | ----------------------------------------- | ----------- |
| `reading_sessions`     | Per-pillar "continue where you left off"  | User-scoped |
| `content_bookmarks`    | Saved nodes with optional note            | User-scoped |
| `content_read_history` | Track reads per node (first, last, count) | User-scoped |

---

## 14. Training Mode Architecture [BUILT]

Training Mode provides structured learning paths that teach users the PIPS methodology through progressive exercises. Fully functional with 4 paths, 27 modules, 59 exercises, progress tracking, and exercise submission.

### Training Data Model

```
training_paths (4 seeded)
  └── training_modules (27 seeded)
       └── training_exercises (59 seeded)
            ├── fill-form (practice PIPS forms in a sandbox)
            ├── multiple-choice (methodology comprehension quizzes)
            ├── scenario-practice (work through realistic scenarios)
            └── reflection (open-ended self-assessment)
```

**User progress tables:** `training_progress` (per module) and `training_exercise_data` (per exercise) track completion status, scores, attempts, and time spent.

### Training Paths (Seeded)

4 paths targeting different PIPS roles:

1. **Team Member Essentials** — Basic methodology understanding for participants
2. **Process Improvement Practitioner** — Full 6-step proficiency for leaders
3. **Facilitator Certification** — Advanced facilitation and workshop skills
4. **Executive Champion** — ROI measurement and program oversight

### Exercise Architecture

Each exercise type has a dedicated client component:

| Exercise Type       | Component                      | Interaction                                     |
| ------------------- | ------------------------------ | ----------------------------------------------- |
| `fill-form`         | Reuses PIPS form components    | Practice with sample data, compare to reference |
| `multiple-choice`   | `training-multiple-choice.tsx` | Select answers, immediate feedback, scoring     |
| `scenario-practice` | `scenario-runner.tsx`          | Multi-step scenario walkthrough                 |
| `reflection`        | `training-reflection.tsx`      | Open text prompts, no scoring                   |

Exercises store their config in `training_exercises.config` (JSONB) — e.g., answer keys for MC, scenario data for practice, reflection prompts.

### Training Page Architecture

| Route                             | Purpose                                   | Status      |
| --------------------------------- | ----------------------------------------- | ----------- |
| `/training`                       | Landing — path cards with progress        | **[BUILT]** |
| `/training/path/[pathId]`         | Path detail — module list with completion | **[BUILT]** |
| `/training/practice/[exerciseId]` | Exercise runner                           | **[BUILT]** |
| `/training/progress`              | User progress dashboard                   | **[BUILT]** |

### Training Actions

| Action                   | File                           | Purpose                                   |
| ------------------------ | ------------------------------ | ----------------------------------------- |
| `updateTrainingProgress` | `training/actions.ts`          | Mark module started/completed             |
| `submitExercise`         | `training/exercise-actions.ts` | Submit exercise response, calculate score |
| `getExerciseData`        | `training/exercise-actions.ts` | Load user's previous attempt              |

---

## 15. Marketing & SEO Architecture [BUILT]

Marketing pages serve two purposes: (1) attract organic search traffic via methodology content, and (2) educate visitors about the PIPS approach before they sign up.

### Marketing Page Architecture

All marketing pages live under the `(marketing)/` route group — a separate layout from the authenticated app, with no sidebar or auth requirements.

| Route                           | Content                                            | Count | Status      |
| ------------------------------- | -------------------------------------------------- | ----- | ----------- |
| `/methodology`                  | Methodology overview page                          | 1     | **[BUILT]** |
| `/methodology/step/[1-6]`       | Step detail pages with tools, objectives, examples | 6     | **[BUILT]** |
| `/methodology/tools/[toolSlug]` | Tool detail pages (fishbone, 5-why, etc.)          | 22    | **[BUILT]** |
| `/book`                         | Book preview landing                               | 1     | **[BUILT]** |
| `/book/[chapterSlug]`           | Chapter preview pages                              | 20    | **[BUILT]** |
| `/resources`                    | Resources hub landing                              | 1     | **[BUILT]** |
| `/resources/glossary`           | Glossary index                                     | 1     | **[BUILT]** |
| `/resources/glossary/[term]`    | Glossary term detail                               | 35    | **[BUILT]** |
| `/resources/templates`          | Template gallery with download                     | 17    | **[BUILT]** |

**Total: 104+ marketing pages**

### Content Strategy for Marketing Pages

Marketing pages use **static data files** co-located with the page route (not database queries):

- `_tool-details.ts` — tool descriptions, use cases, examples (at `methodology/tools/[toolSlug]/`)
- `_chapter-previews.ts` — chapter summaries and excerpts (at `book/[chapterSlug]/`)
- `_glossary-data.ts` — term definitions and related terms (at `resources/glossary/`)
- `_template-data.ts` — template metadata and download configs (at `resources/templates/`)

This keeps marketing pages fully static (no DB calls at render time) while supporting dynamic route generation.

### SEO Architecture

**Sitemap** (`sitemap.ts`) — Dynamic generation using Next.js metadata API:

- Static pages: home, methodology, book, resources, glossary index, templates, login, signup
- Step pages: 6 entries from `STEP_CONTENT`
- Tool pages: entries from `TOOL_DETAILS` lookup
- Book chapters: entries from `BOOK_CHAPTER_MAP`
- Glossary terms: entries from `GLOSSARY_TERMS`

**Robots** (`robots.ts`) — Allows crawling of all marketing pages, disallows authenticated routes:

- Allow: `/` (all public pages)
- Disallow: `/dashboard/`, `/projects/`, `/tickets/`, `/teams/`, `/settings/`, `/api/`, `/invite/`

**JSON-LD** (`components/seo/json-ld.tsx`) — Server component that renders structured data:

- Used on methodology pages (SoftwareApplication schema)
- Used on tool pages (HowTo schema)
- Used on book pages (Book schema)
- Zero client-side JS cost

**Metadata** — Each marketing page exports `generateMetadata()` with:

- `title` — descriptive, keyword-rich
- `description` — compelling summary for search results
- `openGraph` — social sharing metadata
- `alternates.canonical` — canonical URL

### Marketing Component Architecture

All marketing sections are in `components/landing/`:

| Component                  | Purpose                                  |
| -------------------------- | ---------------------------------------- |
| `hero-section.tsx`         | Hero banner with headline, subtitle, CTA |
| `features-section.tsx`     | Feature grid with icons and descriptions |
| `methodology-section.tsx`  | 6-step visual with color-coded cards     |
| `how-it-works-section.tsx` | Step-by-step walkthrough                 |
| `cta-section.tsx`          | Conversion-focused call to action        |
| `landing-nav.tsx`          | Marketing site top navigation            |
| `landing-footer.tsx`       | Footer with links and branding           |

---

## 16. Content Pipeline Architecture [BUILT]

The content pipeline transforms source markdown into database content available to the Knowledge Hub and Cadence Bar at runtime.

### Pipeline Overview

```
┌─────────────────────────┐
│ Source: PIPS Book        │
│ ../PIPS/Book/*.md        │
│ 20 markdown files        │
│ (Foreword, Intro, 15     │
│  chapters, Conclusion,   │
│  3 appendices)           │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ scripts/compile-content  │   npx tsx scripts/compile-content.ts
│                          │
│ • Reads each .md file    │
│ • Splits on ## headings  │
│ • Creates one ContentNode│
│   per section            │
│ • Tags each node using   │
│   BOOK_CHAPTER_MAP from  │
│   content-taxonomy.ts    │
│ • Calculates read time   │
│   (~200 words/minute)    │
│ • Assigns IDs like       │
│   "book-ch04-s01"        │
│ • Sets access_level      │
│   (public for intro,     │
│   paid for chapters)     │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ scripts/output/          │
│ content-nodes.json       │
│ (205 nodes, ~2MB)        │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ scripts/seed-content     │   npx tsx scripts/seed-content.ts
│                          │
│ • Reads content-nodes    │
│   .json                  │
│ • Uses admin client      │
│   (bypasses RLS)         │
│ • Upserts into           │
│   content_nodes table    │
│ • search_vector auto-    │
│   populated via          │
│   GENERATED column       │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Supabase: content_nodes  │
│ 205 rows with FTS        │
└─────────────────────────┘
```

### Training Seed Pipeline [BUILT]

```
scripts/seed-training.ts     npx tsx scripts/seed-training.ts
│
├── Defines 4 training paths inline
├── Defines 27 modules with content_node_ids[] references
├── Defines 59 exercises with type-specific config
│
└── Upserts into: training_paths, training_modules, training_exercises
    (uses admin client, bypasses RLS)
```

### Pipeline Characteristics

- **Offline/manual execution** — pipelines run locally, not in CI
- **Idempotent** — upsert semantics allow re-running safely
- **Source-of-truth is code** — content lives in markdown files and TypeScript seed scripts, not in the database
- **No reverse sync** — content flows one way: source -> compile -> seed -> DB
- **Admin client** — seeding bypasses RLS because content is global (no org_id)

### Future Pipeline Considerations

| Concern                                | Current State            | Future Action                                                           |
| -------------------------------------- | ------------------------ | ----------------------------------------------------------------------- |
| Guide/Workbook/Workshop pillar content | Not yet authored         | Will need compile scripts per pillar or a unified multi-source compiler |
| Content editing by non-developers      | Not supported            | Consider headless CMS (Sanity, Strapi) if needed                        |
| Incremental seeding                    | Full upsert on every run | Add hash-based change detection for 1000+ nodes                         |
| CI-triggered seeding                   | Manual                   | Add GitHub Action on content file changes                               |

---

## 17. Architecture Decision Records

### ADR-001: Global Catalog Tables Without RLS

**Decision:** `content_nodes`, `training_paths`, `training_modules`, and `training_exercises` do not have RLS enabled. They are readable by all authenticated users.

**Rationale:** These tables contain methodology content that is the same for all organizations. Gating access per-org would add unnecessary complexity and RLS overhead. Access differentiation is handled by `content_nodes.access_level` (public/free-registered/paid) at the application layer.

**Risk:** No database-level access gating on paid content. A user with a Supabase anon key could read all content_nodes directly. Mitigation: paid content access is enforced at the Server Component level, not at the DB level. This is acceptable for MVP but should be re-evaluated if content monetization becomes significant.

### ADR-002: TEXT Primary Keys for Content Tables

**Decision:** `content_nodes`, `training_paths`, `training_modules`, and `training_exercises` use TEXT primary keys (e.g., `book-ch04-s01`) instead of UUIDs.

**Rationale:** Human-readable IDs make the content pipeline (compile -> seed -> query) easier to debug, cross-reference, and maintain. The content is authored in code, not created by users, so there is no collision risk. Foreign key references from user-scoped tables (`reading_sessions`, `content_bookmarks`, etc.) use the TEXT ID.

**Trade-off:** Slightly larger index footprint than UUID. Acceptable at current scale (205 content nodes, 27 modules, 59 exercises).

### ADR-003: Content Pipeline as Offline Scripts

**Decision:** The content pipeline (compile-content.ts, seed-content.ts, seed-training.ts) runs as manual local scripts, not as CI/CD steps or Edge Functions.

**Rationale:** Content changes infrequently (it tracks a published book and curated training curriculum). Automating the pipeline adds complexity without proportional value at current scale. The scripts are idempotent, so re-running is safe.

**When to revisit:** If content is updated more than monthly, or if non-developer contributors need to publish content without running scripts.

### ADR-004: Static Data Files for Marketing Pages

**Decision:** Marketing pages (methodology, tools, glossary, templates, book previews) use co-located TypeScript data files (`_tool-details.ts`, `_glossary-data.ts`, etc.) instead of database queries.

**Rationale:** Marketing pages must be fast and crawlable. Static data eliminates DB latency and enables full static generation. The data changes rarely and is small enough to live in code.

**Trade-off:** Content updates require code changes and deployment. Acceptable for founder-managed content. Would need a CMS if marketing team grows.

### ADR-005: Cadence Bar Context Matching in Shared Package

**Decision:** The Cadence Bar matching logic (`buildProductContext`, `matchContentNodes`, `groupByPillar`) lives in `packages/shared/src/content-taxonomy.ts`, not in a server action or API route.

**Rationale:** The matching logic is pure functions with no DB dependency — it operates on content nodes already fetched by the Server Component. Placing it in the shared package allows both server and client components to use it and enables unit testing without mocking.

### ADR-006: Separate Component Directories for Knowledge and Training

**Decision:** Knowledge Hub components live in `components/knowledge/` and `components/knowledge-cadence/`. Training components live in `components/training/`. They do not share a directory despite being conceptually related.

**Rationale:** Each subsystem has distinct interaction patterns, different data sources, and independent development timelines. Keeping them separate prevents coupling and makes ownership clear for parallel agent development.

---

## 18. Architecture Risk Register

| ID   | Risk                                                                                   | Severity   | Likelihood | Mitigation                                                                                                                                                                  | Status                                          |
| ---- | -------------------------------------------------------------------------------------- | ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| R-01 | Knowledge Hub content access not enforced at DB level                                  | Medium     | Low        | Application-layer checks in Server Components. Re-evaluate when Stripe billing is added.                                                                                    | Accepted                                        |
| R-02 | Training Mode exercises share form components with PIPS workflow — tight coupling risk | Medium     | Medium     | Exercise `fill-form` type reuses form components read-only. If forms change, exercises may break. Add integration tests.                                                    | Monitor                                         |
| R-03 | Content pipeline has no automated validation                                           | Low        | Medium     | Add a CI step that runs `compile-content.ts` and validates output JSON against ContentNode schema.                                                                          | Open                                            |
| R-04 | 104+ marketing pages increase build time                                               | Low        | Low        | Marketing pages are statically renderable. Monitor Vercel build times. Add ISR if build exceeds 3 minutes.                                                                  | Monitor                                         |
| R-05 | No rate limiting on Knowledge Hub search                                               | Medium     | Low        | FTS queries are relatively fast. Add rate limiting if abuse detected or if search is exposed to unauthenticated users.                                                      | Open                                            |
| R-06 | ~~Workshop session real-time collaboration not architectured~~                         | ~~Medium~~ | ~~Medium~~ | Supabase Realtime implemented for live timer sync and participant updates in Workshop sessions.                                                                             | **Resolved** — Phase 5 complete                 |
| R-07 | Training progress data could grow large for high-user-count organizations              | Low        | Low        | `training_progress` and `training_exercise_data` are user-scoped (not org-scoped). Growth is linear per user, not per org. Partition by `path_id` if needed.                | Monitor                                         |
| R-08 | Single Supabase region (us-east-2) creates latency for non-US users                    | Medium     | Medium     | Accept for MVP. Add read replicas or consider multi-region when international customers onboard.                                                                            | Accepted                                        |
| R-09 | No cache layer between Supabase and Vercel                                             | Low        | Medium     | RSC fetches fresh data on every navigation. Knowledge Hub and Training catalog are static content candidates for ISR caching. Implement when performance metrics show need. | Open                                            |
| R-10 | name→title mapping in projects table creates confusion                                 | Low        | High       | DB column is `title`, but some frontend code and older planning docs reference `name`. Server actions map between them. Document clearly and enforce in code reviews.       | Mitigated — documented in ADR, 16 files updated |

---

_This document describes the PIPS 2.0 system as deployed on March 3, 2026, with post-MVP additions through March 12, 2026. It is maintained by the Chief Architect Agent and should be updated when architectural decisions change._
