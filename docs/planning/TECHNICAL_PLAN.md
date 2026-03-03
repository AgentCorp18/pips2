# PIPS 2.0 — Technical Architecture Plan

> **Version:** 1.0.0
> **Date:** 2026-03-02
> **Status:** Draft
> **Author:** Marc Albers + Claude

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Database Schema Design](#3-database-schema-design)
4. [API Design](#4-api-design)
5. [Security Architecture](#5-security-architecture)
6. [Integration Architecture](#6-integration-architecture)
7. [White-Label System](#7-white-label-system)
8. [Performance & Scalability](#8-performance--scalability)
9. [DevOps & Infrastructure](#9-devops--infrastructure)
10. [Project Structure](#10-project-structure)

---

## 1. Architecture Overview

### 1.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Browser  │  │  Mobile  │  │   PWA    │  │ External Systems  │  │
│  │ (Next.js)│  │ (PWA)    │  │ (Offline)│  │ (Jira/ADO/AHA!)  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬──────────┘  │
│       │              │              │                  │             │
└───────┼──────────────┼──────────────┼──────────────────┼─────────────┘
        │              │              │                  │
        ▼              ▼              ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     EDGE LAYER (Vercel)                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Next.js 15 App Router (SSR + RSC + API Routes)            │    │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌────────────┐  │    │
│  │  │ Pages/   │ │ Server   │ │ API Routes │ │ Middleware  │  │    │
│  │  │ Layouts  │ │Components│ │ /api/v1/*  │ │ (Auth/Org)  │  │    │
│  │  └──────────┘ └──────────┘ └────────────┘ └────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Vercel Edge Functions (Middleware, Redirects, CNAME)       │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER (Supabase)                          │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Auth         │  │  Realtime    │  │  Edge Functions          │  │
│  │  - Email/Pass │  │  - Presence  │  │  - Webhook handlers      │  │
│  │  - Magic Link │  │  - Broadcast │  │  - Scheduled jobs        │  │
│  │  - SSO/SAML   │  │  - Postgres  │  │  - Integration sync      │  │
│  │  - JWT+RLS    │  │    Changes   │  │  - Email sending         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  PostgreSQL   │  │  Storage     │  │  Cron (pg_cron)          │  │
│  │  - RLS        │  │  - Avatars   │  │  - Scheduled syncs       │  │
│  │  - Full-text  │  │  - Files     │  │  - Notification digest   │  │
│  │  - Triggers   │  │  - Logos     │  │  - Cleanup jobs          │  │
│  │  - Functions  │  │  - Exports   │  │                          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Stripe  │  │  Resend  │  │  Sentry  │  │  Vercel          │   │
│  │ Payments │  │  Email   │  │  Errors  │  │  Analytics/CDN   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Multi-Tenancy Pattern: Shared Schema with RLS

**Decision: Shared schema with Row-Level Security (RLS) on every table.**

Justification:
- **Schema-per-tenant** requires DDL operations per signup, complicates migrations, and does not scale well past ~50 tenants on Supabase.
- **Shared schema with RLS** is Supabase's native pattern. Every row has an `org_id` column. RLS policies ensure users only see data belonging to their organization.
- Simpler migrations (one schema to manage), simpler connection pooling, and Supabase's RLS is battle-tested.
- The `org_id` is embedded in the JWT via a custom claim, making policy evaluation fast (no extra queries).

### 1.3 Core Design Principles

1. **Org-scoped everything** — Every data entity belongs to an organization. No global shared data except system config.
2. **Server Components first** — Use React Server Components (RSC) for data fetching. Client Components only when interactivity is required.
3. **Progressive enhancement** — Core workflows work without JavaScript. PWA adds offline capability.
4. **Type safety end-to-end** — Supabase-generated types from the schema, Zod validation at API boundaries, TypeScript strict mode everywhere.
5. **Audit everything** — Every mutation creates an audit log entry via database triggers.

---

## 2. Technology Stack

### 2.1 Core Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Framework** | Next.js | 15.x | App Router, RSC, API routes, middleware, ISR, Vercel-native |
| **Language** | TypeScript | 5.7+ | Strict mode, satisfies Marc's preference |
| **Backend** | Supabase | Latest | Auth, Postgres, Storage, Realtime, Edge Functions — single platform |
| **Database** | PostgreSQL | 15+ | Via Supabase. RLS, full-text search, JSONB, triggers |
| **Hosting** | Vercel | Pro plan | SSR, edge middleware, preview deployments, custom domains |
| **Payments** | Stripe | API v2024+ | Subscriptions, usage-based billing, invoicing |
| **State** | Zustand | 5.x | Lightweight, TypeScript-native, for complex client state (ticket boards, form builders) |
| **UI** | shadcn/ui | Latest | Radix primitives + Tailwind. Copy-paste components, fully customizable, accessible |
| **Styling** | Tailwind CSS | 4.x | Note: differs from Marc's React Native preference but is standard for Next.js web apps. shadcn/ui requires it. CSS custom properties for white-label theming layer on top. |
| **Email** | Resend | Latest | Transactional + marketing email. React Email templates |
| **Error Tracking** | Sentry | Latest | Already used in ForgePIPS v1 |
| **Search** | Postgres FTS | Built-in | `tsvector` + `ts_rank` for ticket/project search. Upgrade to Typesense if >100K tickets |
| **Real-time** | Supabase Realtime | Built-in | Live ticket updates, presence, notifications |
| **File Storage** | Supabase Storage | Built-in | Avatars, logos, attachments, exports |
| **Charts** | Recharts | 2.x | Lightweight, React-native charting for dashboards (Victory Native is mobile-only) |
| **Forms** | React Hook Form + Zod | Latest | Type-safe form validation, dynamic PIPS forms |
| **Date/Time** | date-fns | 4.x | Tree-shakeable, immutable |
| **Icons** | Lucide React | Latest | Consistent icon set, tree-shakeable |

### 2.2 Styling Decision Note

While Marc's CLAUDE.md specifies `React Native StyleSheet (no Tailwind/NativeWind)`, that preference applies to the React Native mobile app (Beacon). For a Next.js web application, Tailwind CSS is the standard and is required by shadcn/ui. The white-label theming system will use CSS custom properties (variables) on top of Tailwind, allowing per-tenant customization without Tailwind recompilation.

### 2.3 Development Tools

| Tool | Purpose |
|------|---------|
| **pnpm** | Package manager (faster, stricter than npm) |
| **Turborepo** | Monorepo build orchestration |
| **ESLint** | Linting (Next.js + TypeScript config) |
| **Prettier** | Code formatting |
| **Vitest** | Unit + integration testing |
| **Playwright** | E2E testing |
| **Supabase CLI** | Local dev, migrations, type generation |
| **GitHub Actions** | CI/CD |
| **Husky + lint-staged** | Pre-commit hooks |

---

## 3. Database Schema Design

### 3.1 Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CORE TABLES                               │
│                                                                   │
│  organizations ─┬── org_members ──── profiles (auth.users)       │
│                 ├── org_invitations                                │
│                 ├── org_settings (white-label config)             │
│                 └── org_api_keys                                   │
│                                                                   │
│  teams ─────────┬── team_members                                  │
│                 └── (scoped to org)                                │
│                                                                   │
│  projects ──────┬── project_members                               │
│  (PIPS process) ├── project_steps (6 steps, forms, data)         │
│                 ├── project_forms (dynamic form submissions)      │
│                 └── tickets ──┬── ticket_comments                 │
│                               ├── ticket_attachments              │
│                               ├── ticket_activity                 │
│                               └── ticket_relations (parent/child) │
│                                                                   │
│  CROSS-CUTTING                                                    │
│  ├── audit_log (immutable, trigger-populated)                    │
│  ├── notifications                                                │
│  ├── file_attachments (metadata, Supabase Storage refs)          │
│  ├── comments (polymorphic: project, ticket, step)               │
│  └── integration_connections (per-org Jira/ADO/AHA! configs)     │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Core SQL — Organizations & Users

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- Crypto functions

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'manager', 'member', 'viewer');
CREATE TYPE org_plan AS ENUM ('free', 'starter', 'professional', 'enterprise');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');
CREATE TYPE ticket_status AS ENUM (
  'backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled'
);
CREATE TYPE ticket_priority AS ENUM ('critical', 'high', 'medium', 'low', 'none');
CREATE TYPE ticket_type AS ENUM ('pips_project', 'task', 'bug', 'feature', 'general');
CREATE TYPE pips_step AS ENUM (
  'identify', 'analyze', 'generate', 'select_plan', 'implement', 'evaluate'
);
CREATE TYPE project_status AS ENUM (
  'draft', 'active', 'on_hold', 'completed', 'archived'
);
CREATE TYPE notification_type AS ENUM (
  'ticket_assigned', 'ticket_updated', 'ticket_commented',
  'project_updated', 'mention', 'invitation', 'system'
);
CREATE TYPE integration_provider AS ENUM ('jira', 'azure_devops', 'aha');
CREATE TYPE sync_direction AS ENUM ('inbound', 'outbound', 'bidirectional');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT NOT NULL DEFAULT '',
  display_name  TEXT,
  avatar_url    TEXT,
  timezone      TEXT NOT NULL DEFAULT 'America/New_York',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  plan          org_plan NOT NULL DEFAULT 'free',
  logo_url      TEXT,
  created_by    UUID NOT NULL REFERENCES profiles(id),
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  max_members   INT NOT NULL DEFAULT 5,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$')
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_stripe ON organizations(stripe_customer_id);

-- ============================================================
-- ORGANIZATION MEMBERS (join table: user <-> org)
-- ============================================================
CREATE TABLE org_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          org_role NOT NULL DEFAULT 'member',
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_org_member UNIQUE (org_id, user_id)
);

CREATE INDEX idx_org_members_org ON org_members(org_id);
CREATE INDEX idx_org_members_user ON org_members(user_id);

-- ============================================================
-- ORGANIZATION INVITATIONS
-- ============================================================
CREATE TABLE org_invitations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  role          org_role NOT NULL DEFAULT 'member',
  invited_by    UUID NOT NULL REFERENCES profiles(id),
  status        invitation_status NOT NULL DEFAULT 'pending',
  token         TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_pending_invite UNIQUE (org_id, email, status)
);

-- ============================================================
-- ORGANIZATION SETTINGS (white-label + config)
-- ============================================================
CREATE TABLE org_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,

  -- White-label branding
  brand_name      TEXT,                    -- Display name override
  primary_color   TEXT DEFAULT '#06b6d4',  -- Primary accent color
  secondary_color TEXT DEFAULT '#8b5cf6',  -- Secondary color
  logo_dark_url   TEXT,                    -- Logo for dark backgrounds
  logo_light_url  TEXT,                    -- Logo for light backgrounds
  favicon_url     TEXT,
  custom_css      TEXT,                    -- Additional custom CSS
  custom_domain   TEXT,                    -- e.g., "pips.acmecorp.com"

  -- Email branding
  email_from_name TEXT,
  email_reply_to  TEXT,

  -- Feature flags
  features        JSONB NOT NULL DEFAULT '{
    "ticketing": true,
    "pips_projects": true,
    "integrations": false,
    "custom_forms": false,
    "api_access": false,
    "sso": false
  }'::jsonb,

  -- PIPS methodology customization
  step_labels     JSONB,  -- Override default step names
  step_colors     JSONB,  -- Override default step colors

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.3 Core SQL — Teams

```sql
-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE teams (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  color         TEXT DEFAULT '#06b6d4',
  created_by    UUID NOT NULL REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_team_name_per_org UNIQUE (org_id, name)
);

CREATE INDEX idx_teams_org ON teams(org_id);

-- ============================================================
-- TEAM MEMBERS
-- ============================================================
CREATE TABLE team_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id       UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'member')),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_team_member UNIQUE (team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
```

### 3.4 Core SQL — PIPS Projects

```sql
-- ============================================================
-- PIPS PROJECTS (a complete 6-step process instance)
-- ============================================================
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  status          project_status NOT NULL DEFAULT 'draft',
  current_step    pips_step NOT NULL DEFAULT 'identify',
  owner_id        UUID NOT NULL REFERENCES profiles(id),
  team_id         UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Problem statement (Step 1 output)
  problem_statement TEXT,

  -- Target dates
  target_start    DATE,
  target_end      DATE,
  actual_start    DATE,
  actual_end      DATE,

  -- Metadata
  tags            TEXT[] DEFAULT '{}',
  priority        ticket_priority NOT NULL DEFAULT 'medium',
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Search
  search_vector   TSVECTOR,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_projects_org ON projects(org_id);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_team ON projects(team_id);
CREATE INDEX idx_projects_status ON projects(org_id, status);
CREATE INDEX idx_projects_search ON projects USING GIN(search_vector);

-- Auto-update search vector
CREATE OR REPLACE FUNCTION projects_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.problem_statement, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_search_trigger
  BEFORE INSERT OR UPDATE OF title, description, problem_statement
  ON projects FOR EACH ROW
  EXECUTE FUNCTION projects_search_update();

-- ============================================================
-- PROJECT MEMBERS (who is assigned to this PIPS project)
-- ============================================================
CREATE TABLE project_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'contributor'
                CHECK (role IN ('lead', 'facilitator', 'contributor', 'observer')),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_project_member UNIQUE (project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- ============================================================
-- PROJECT STEPS (data collected at each PIPS step)
-- ============================================================
CREATE TABLE project_steps (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step          pips_step NOT NULL,
  status        TEXT NOT NULL DEFAULT 'not_started'
                CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),

  -- Each step stores its structured data as JSONB
  -- This allows different forms/tools per step without schema changes
  data          JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Facilitator notes
  notes         TEXT,

  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  completed_by  UUID REFERENCES profiles(id),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_project_step UNIQUE (project_id, step)
);

CREATE INDEX idx_project_steps_project ON project_steps(project_id);

-- ============================================================
-- PROJECT FORMS (dynamic form submissions within a step)
-- ============================================================
CREATE TABLE project_forms (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step          pips_step NOT NULL,
  form_type     TEXT NOT NULL,   -- e.g., 'fishbone', 'five_why', 'brainwriting',
                                 -- 'force_field', 'decision_matrix', 'raci', etc.
  title         TEXT NOT NULL,
  data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by    UUID NOT NULL REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_forms_project ON project_forms(project_id);
CREATE INDEX idx_project_forms_step ON project_forms(project_id, step);
CREATE INDEX idx_project_forms_type ON project_forms(form_type);
```

### 3.5 Core SQL — Tickets

```sql
-- ============================================================
-- TICKETS (PIPS tickets + general tickets)
-- ============================================================
CREATE TABLE tickets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Sequence number per org (human-readable: ORG-123)
  sequence_number BIGINT NOT NULL,

  -- Hierarchy
  project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
  parent_id       UUID REFERENCES tickets(id) ON DELETE SET NULL,

  -- Core fields
  title           TEXT NOT NULL,
  description     TEXT,
  type            ticket_type NOT NULL DEFAULT 'general',
  status          ticket_status NOT NULL DEFAULT 'backlog',
  priority        ticket_priority NOT NULL DEFAULT 'medium',

  -- PIPS-specific (only for type = 'pips_project')
  pips_step       pips_step,

  -- Assignment
  assignee_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reporter_id     UUID NOT NULL REFERENCES profiles(id),
  team_id         UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Dates
  due_date        DATE,
  started_at      TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,

  -- Estimation
  estimate_hours  NUMERIC(6,2),
  actual_hours    NUMERIC(6,2),
  story_points    INT,

  -- Metadata
  tags            TEXT[] DEFAULT '{}',
  custom_fields   JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- External integration references
  external_id     TEXT,           -- Jira issue key, ADO work item ID, etc.
  external_url    TEXT,
  external_source integration_provider,

  -- Search
  search_vector   TSVECTOR,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sequence number generation (per org)
CREATE OR REPLACE FUNCTION generate_ticket_sequence()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sequence_number := (
    SELECT COALESCE(MAX(sequence_number), 0) + 1
    FROM tickets
    WHERE org_id = NEW.org_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_sequence_trigger
  BEFORE INSERT ON tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_sequence();

-- Search vector
CREATE OR REPLACE FUNCTION tickets_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tickets_search_trigger
  BEFORE INSERT OR UPDATE OF title, description
  ON tickets FOR EACH ROW
  EXECUTE FUNCTION tickets_search_update();

-- Indexes
CREATE INDEX idx_tickets_org ON tickets(org_id);
CREATE INDEX idx_tickets_project ON tickets(project_id);
CREATE INDEX idx_tickets_parent ON tickets(parent_id);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_status ON tickets(org_id, status);
CREATE INDEX idx_tickets_type ON tickets(org_id, type);
CREATE INDEX idx_tickets_search ON tickets USING GIN(search_vector);
CREATE INDEX idx_tickets_external ON tickets(external_source, external_id);
CREATE UNIQUE INDEX idx_tickets_org_sequence ON tickets(org_id, sequence_number);

-- ============================================================
-- TICKET RELATIONS (parent/child, blocks, relates-to, duplicates)
-- ============================================================
CREATE TABLE ticket_relations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id       UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  target_id       UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  relation_type   TEXT NOT NULL CHECK (
    relation_type IN ('parent', 'child', 'blocks', 'blocked_by', 'relates_to', 'duplicates')
  ),
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT no_self_relation CHECK (source_id != target_id),
  CONSTRAINT unique_relation UNIQUE (source_id, target_id, relation_type)
);

CREATE INDEX idx_ticket_relations_source ON ticket_relations(source_id);
CREATE INDEX idx_ticket_relations_target ON ticket_relations(target_id);

-- ============================================================
-- TICKET STATUS TRANSITIONS (workflow history)
-- ============================================================
CREATE TABLE ticket_transitions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id     UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  from_status   ticket_status,
  to_status     ticket_status NOT NULL,
  changed_by    UUID NOT NULL REFERENCES profiles(id),
  reason        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_transitions_ticket ON ticket_transitions(ticket_id);
```

### 3.6 Core SQL — Comments, Activity, Attachments

```sql
-- ============================================================
-- COMMENTS (polymorphic: on tickets, projects, or project steps)
-- ============================================================
CREATE TABLE comments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Polymorphic target (exactly one must be set)
  ticket_id     UUID REFERENCES tickets(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  step_id       UUID REFERENCES project_steps(id) ON DELETE CASCADE,

  -- Content
  author_id     UUID NOT NULL REFERENCES profiles(id),
  body          TEXT NOT NULL,
  body_html     TEXT,            -- Rendered markdown
  edited_at     TIMESTAMPTZ,

  -- Threading
  parent_id     UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- Mentions (extracted user IDs for notification)
  mentions      UUID[] DEFAULT '{}',

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT exactly_one_target CHECK (
    (ticket_id IS NOT NULL)::int +
    (project_id IS NOT NULL)::int +
    (step_id IS NOT NULL)::int = 1
  )
);

CREATE INDEX idx_comments_ticket ON comments(ticket_id) WHERE ticket_id IS NOT NULL;
CREATE INDEX idx_comments_project ON comments(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_comments_author ON comments(author_id);

-- ============================================================
-- FILE ATTACHMENTS (metadata — actual files in Supabase Storage)
-- ============================================================
CREATE TABLE file_attachments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Polymorphic target
  ticket_id       UUID REFERENCES tickets(id) ON DELETE CASCADE,
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  comment_id      UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- File metadata
  file_name       TEXT NOT NULL,
  file_size       BIGINT NOT NULL,         -- bytes
  mime_type       TEXT NOT NULL,
  storage_path    TEXT NOT NULL,            -- Supabase Storage path
  storage_bucket  TEXT NOT NULL DEFAULT 'attachments',

  uploaded_by     UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_ticket ON file_attachments(ticket_id) WHERE ticket_id IS NOT NULL;
CREATE INDEX idx_attachments_project ON file_attachments(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_attachments_org ON file_attachments(org_id);

-- ============================================================
-- AUDIT LOG (immutable, populated by triggers)
-- ============================================================
CREATE TABLE audit_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL,
  user_id       UUID,                   -- NULL for system actions
  action        TEXT NOT NULL,           -- 'create', 'update', 'delete', 'login', etc.
  entity_type   TEXT NOT NULL,           -- 'ticket', 'project', 'org_member', etc.
  entity_id     UUID NOT NULL,
  old_data      JSONB,                  -- Previous state (for updates)
  new_data      JSONB,                  -- New state
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partitioned by month for performance
-- In production, use pg_partman or manual range partitioning
CREATE INDEX idx_audit_log_org ON audit_log(org_id, created_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id, created_at DESC);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          notification_type NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT,
  entity_type   TEXT,              -- 'ticket', 'project', etc.
  entity_id     UUID,
  read_at       TIMESTAMPTZ,
  email_sent    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
```

### 3.7 Core SQL — Integrations & API Keys

```sql
-- ============================================================
-- INTEGRATION CONNECTIONS (per-org external system configs)
-- ============================================================
CREATE TABLE integration_connections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider        integration_provider NOT NULL,
  name            TEXT NOT NULL,           -- User-friendly name

  -- Connection config (encrypted at rest)
  config          JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Jira: { base_url, email, api_token, project_key }
  -- Azure DevOps: { org_url, pat, project }
  -- AHA!: { domain, api_key, product_id }

  -- Sync configuration
  sync_direction  sync_direction NOT NULL DEFAULT 'bidirectional',
  sync_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
  last_synced_at  TIMESTAMPTZ,
  sync_cursor     TEXT,                    -- Pagination/timestamp cursor for incremental sync

  -- Status
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'error', 'disabled')),
  error_message   TEXT,

  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_provider_per_org UNIQUE (org_id, provider, name)
);

CREATE INDEX idx_integration_connections_org ON integration_connections(org_id);

-- ============================================================
-- ORGANIZATION API KEYS (for REST API access)
-- ============================================================
CREATE TABLE org_api_keys (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  -- Store only hash; return prefix (pips_xxxx...) on creation
  key_hash        TEXT NOT NULL,
  key_prefix      TEXT NOT NULL,           -- "pips_abc1" (first 8 chars)
  scopes          TEXT[] NOT NULL DEFAULT '{read}',
  expires_at      TIMESTAMPTZ,
  last_used_at    TIMESTAMPTZ,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at      TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_org ON org_api_keys(org_id);
CREATE INDEX idx_api_keys_prefix ON org_api_keys(key_prefix);

-- ============================================================
-- WEBHOOK SUBSCRIPTIONS (outbound webhooks per org)
-- ============================================================
CREATE TABLE webhook_subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  secret          TEXT NOT NULL,           -- HMAC signing secret
  events          TEXT[] NOT NULL,         -- ['ticket.created', 'ticket.updated', ...]
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WEBHOOK DELIVERIES (outbound delivery log)
-- ============================================================
CREATE TABLE webhook_deliveries (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id   UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  event_type        TEXT NOT NULL,
  payload           JSONB NOT NULL,
  response_status   INT,
  response_body     TEXT,
  delivered_at      TIMESTAMPTZ,
  attempts          INT NOT NULL DEFAULT 0,
  next_retry_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_sub ON webhook_deliveries(subscription_id, created_at DESC);
CREATE INDEX idx_webhook_deliveries_retry
  ON webhook_deliveries(next_retry_at)
  WHERE response_status IS NULL OR response_status >= 400;
```

### 3.8 Audit Trigger (Generic)

```sql
-- Generic audit trigger that works on any table with org_id
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  _org_id UUID;
  _user_id UUID;
  _action TEXT;
  _old_data JSONB;
  _new_data JSONB;
BEGIN
  -- Determine action
  _action := LOWER(TG_OP);

  -- Get org_id and build data
  IF TG_OP = 'DELETE' THEN
    _org_id := OLD.org_id;
    _old_data := to_jsonb(OLD);
    _new_data := NULL;
    _user_id := auth.uid();
  ELSIF TG_OP = 'INSERT' THEN
    _org_id := NEW.org_id;
    _old_data := NULL;
    _new_data := to_jsonb(NEW);
    _user_id := auth.uid();
  ELSE -- UPDATE
    _org_id := NEW.org_id;
    _old_data := to_jsonb(OLD);
    _new_data := to_jsonb(NEW);
    _user_id := auth.uid();
  END IF;

  INSERT INTO audit_log (org_id, user_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (_org_id, _user_id, _action, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), _old_data, _new_data);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to key tables
CREATE TRIGGER audit_tickets
  AFTER INSERT OR UPDATE OR DELETE ON tickets
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_org_members
  AFTER INSERT OR UPDATE OR DELETE ON org_members
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

---

## 4. API Design

### 4.1 API Route Structure

All API routes live under `/api/v1/` using Next.js App Router route handlers. Authentication is required for all routes except public health check and webhook endpoints.

```
/api/v1/
├── auth/
│   ├── signup              POST    Create account
│   ├── login               POST    Email/password login
│   ├── logout              POST    End session
│   ├── magic-link          POST    Send magic link email
│   ├── refresh             POST    Refresh JWT token
│   └── sso/[provider]      GET     SSO redirect (enterprise)
│
├── organizations/
│   ├── /                   GET     List user's orgs
│   ├── /                   POST    Create org
│   ├── /[orgId]            GET     Get org details
│   ├── /[orgId]            PATCH   Update org
│   ├── /[orgId]/members    GET     List members
│   ├── /[orgId]/members    POST    Invite member
│   ├── /[orgId]/members/[userId]  PATCH  Update member role
│   ├── /[orgId]/members/[userId]  DELETE Remove member
│   ├── /[orgId]/settings   GET     Get org settings (branding)
│   ├── /[orgId]/settings   PATCH   Update org settings
│   ├── /[orgId]/api-keys   GET     List API keys
│   ├── /[orgId]/api-keys   POST    Create API key
│   └── /[orgId]/api-keys/[keyId]  DELETE Revoke API key
│
├── teams/
│   ├── /                   GET     List teams (org-scoped)
│   ├── /                   POST    Create team
│   ├── /[teamId]           GET     Get team
│   ├── /[teamId]           PATCH   Update team
│   ├── /[teamId]           DELETE  Delete team
│   ├── /[teamId]/members   GET     List team members
│   └── /[teamId]/members   POST    Add/remove member
│
├── projects/
│   ├── /                   GET     List projects (filterable)
│   ├── /                   POST    Create project
│   ├── /[projectId]        GET     Get project with steps
│   ├── /[projectId]        PATCH   Update project
│   ├── /[projectId]        DELETE  Archive project
│   ├── /[projectId]/steps/[step]       GET     Get step data
│   ├── /[projectId]/steps/[step]       PATCH   Update step data
│   ├── /[projectId]/steps/[step]/complete  POST  Mark step complete
│   ├── /[projectId]/forms  GET     List forms for project
│   ├── /[projectId]/forms  POST    Create form submission
│   ├── /[projectId]/forms/[formId]     GET     Get form
│   ├── /[projectId]/forms/[formId]     PATCH   Update form
│   ├── /[projectId]/members            GET     List project members
│   └── /[projectId]/members            POST    Add/remove member
│
├── tickets/
│   ├── /                   GET     List tickets (filterable, searchable)
│   ├── /                   POST    Create ticket
│   ├── /[ticketId]         GET     Get ticket with relations
│   ├── /[ticketId]         PATCH   Update ticket
│   ├── /[ticketId]         DELETE  Delete ticket
│   ├── /[ticketId]/comments        GET     List comments
│   ├── /[ticketId]/comments        POST    Add comment
│   ├── /[ticketId]/relations       GET     List relations
│   ├── /[ticketId]/relations       POST    Add relation
│   ├── /[ticketId]/attachments     GET     List attachments
│   ├── /[ticketId]/attachments     POST    Upload attachment
│   └── /[ticketId]/transitions     GET     Status history
│
├── search/
│   └── /                   GET     Full-text search (tickets + projects)
│
├── notifications/
│   ├── /                   GET     List user notifications
│   ├── /read               POST    Mark notifications as read
│   └── /settings           GET/PATCH  Notification preferences
│
├── integrations/
│   ├── /                   GET     List connections
│   ├── /                   POST    Create connection
│   ├── /[connId]           GET     Get connection details
│   ├── /[connId]           PATCH   Update connection
│   ├── /[connId]           DELETE  Delete connection
│   ├── /[connId]/sync      POST    Trigger manual sync
│   └── /[connId]/test      POST    Test connection
│
├── webhooks/
│   ├── /subscriptions      GET     List webhook subscriptions
│   ├── /subscriptions      POST    Create subscription
│   ├── /subscriptions/[id] DELETE  Delete subscription
│   ├── /deliveries         GET     Delivery log
│   └── /inbound/[provider] POST    Receive inbound webhooks (Jira, ADO, etc.)
│
├── files/
│   ├── /upload             POST    Get signed upload URL
│   └── /[fileId]           GET     Get signed download URL
│
└── health                  GET     Public health check
```

### 4.2 API Route Pattern Example

```typescript
// app/api/v1/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRouteClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';
import { requireOrgAccess } from '@/lib/auth/org-access';

const listTicketsSchema = z.object({
  orgId: z.string().uuid(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled']).optional(),
  assigneeId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  type: z.enum(['pips_project', 'task', 'bug', 'feature', 'general']).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  sort: z.enum(['created_at', 'updated_at', 'priority', 'due_date']).default('updated_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const GET = async (req: NextRequest) => {
  const session = await requireAuth(req);
  const params = listTicketsSchema.parse(
    Object.fromEntries(req.nextUrl.searchParams)
  );

  await requireOrgAccess(session.user.id, params.orgId, ['owner', 'admin', 'manager', 'member', 'viewer']);

  const supabase = createRouteClient();
  let query = supabase
    .from('tickets')
    .select('*, assignee:profiles!assignee_id(id, full_name, avatar_url)', { count: 'exact' })
    .eq('org_id', params.orgId);

  if (params.status) query = query.eq('status', params.status);
  if (params.assigneeId) query = query.eq('assignee_id', params.assigneeId);
  if (params.projectId) query = query.eq('project_id', params.projectId);
  if (params.type) query = query.eq('type', params.type);

  if (params.search) {
    query = query.textSearch('search_vector', params.search, {
      type: 'websearch',
      config: 'english',
    });
  }

  const offset = (params.page - 1) * params.limit;
  query = query
    .order(params.sort, { ascending: params.order === 'asc' })
    .range(offset, offset + params.limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    meta: {
      page: params.page,
      limit: params.limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / params.limit),
    },
  });
};

const createTicketSchema = z.object({
  orgId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  type: z.enum(['pips_project', 'task', 'bug', 'feature', 'general']).default('general'),
  status: z.enum(['backlog', 'todo', 'in_progress']).default('backlog'),
  priority: z.enum(['critical', 'high', 'medium', 'low', 'none']).default('medium'),
  assigneeId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  dueDate: z.string().date().optional(),
  tags: z.array(z.string().max(50)).max(20).default([]),
});

export const POST = async (req: NextRequest) => {
  const session = await requireAuth(req);
  const body = createTicketSchema.parse(await req.json());

  await requireOrgAccess(session.user.id, body.orgId, ['owner', 'admin', 'manager', 'member']);

  const supabase = createRouteClient();
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      org_id: body.orgId,
      title: body.title,
      description: body.description,
      type: body.type,
      status: body.status,
      priority: body.priority,
      assignee_id: body.assigneeId,
      reporter_id: session.user.id,
      project_id: body.projectId,
      parent_id: body.parentId,
      team_id: body.teamId,
      due_date: body.dueDate,
      tags: body.tags,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
};
```

### 4.3 Authentication Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                    AUTH FLOW                                   │
│                                                                │
│  Browser ──► Next.js Middleware ──► Supabase Auth (JWT)       │
│                                                                │
│  API Key ──► /api/v1/* route ──► key_hash lookup ──► org_id  │
│              (Authorization: Bearer pips_xxxx)                │
│                                                                │
│  SSO/SAML ──► Supabase Auth (enterprise plan) ──► JWT        │
└──────────────────────────────────────────────────────────────┘
```

Three auth methods:

1. **Session-based (browser):** Supabase Auth issues a JWT stored in an httpOnly cookie via `@supabase/ssr`. Next.js middleware validates the session and refreshes tokens automatically.

2. **API Key (integrations):** Third-party systems authenticate with `Authorization: Bearer pips_xxxxxxxxxxxx`. The API route handler hashes the key, looks it up in `org_api_keys`, verifies it's not expired/revoked, and injects the `org_id` into the request context.

3. **SSO/SAML (enterprise):** Supabase Auth supports SAML via their enterprise plan. The org admin configures their IdP in the settings UI, and Supabase handles the SAML flow.

### 4.4 Rate Limiting Strategy

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Different limits for different auth types
export const rateLimits = {
  // Browser users: 100 requests per 10 seconds per user
  authenticated: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '10 s'),
    prefix: 'rl:auth',
  }),
  // API keys: 1000 requests per minute per key
  apiKey: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 m'),
    prefix: 'rl:api',
  }),
  // Unauthenticated: 20 requests per minute per IP
  anonymous: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    prefix: 'rl:anon',
  }),
};
```

### 4.5 Webhook System (Outbound)

When a subscribed event occurs (e.g., `ticket.created`), the system:

1. Database trigger fires on INSERT/UPDATE/DELETE.
2. Trigger calls a `pg_notify` channel.
3. A Supabase Edge Function listens on that channel.
4. The Edge Function looks up active webhook subscriptions for the org that match the event type.
5. For each subscription, it creates a `webhook_deliveries` record and sends an HTTP POST with:
   - `X-Webhook-ID`: delivery UUID
   - `X-Webhook-Timestamp`: Unix timestamp
   - `X-Webhook-Signature`: HMAC-SHA256 of `timestamp.body` using the subscription secret
6. If delivery fails (non-2xx), retry with exponential backoff (1min, 5min, 30min, 2hr, 12hr) up to 5 attempts.

```typescript
// Example outbound webhook payload
{
  "id": "wh_del_abc123",
  "event": "ticket.created",
  "timestamp": "2026-03-02T10:30:00Z",
  "org_id": "org_xyz",
  "data": {
    "ticket": {
      "id": "tkt_456",
      "sequence_number": 42,
      "title": "Reduce checkout abandonment rate",
      "type": "pips_project",
      "status": "backlog",
      "priority": "high",
      "assignee_id": "user_789",
      "created_at": "2026-03-02T10:30:00Z"
    }
  }
}
```

---

## 5. Security Architecture

### 5.1 Row-Level Security (RLS) Policies

Every table with an `org_id` column gets RLS policies. The core pattern: extract the user's org memberships from the JWT or via a helper function, then check if the row's `org_id` is in that set.

```sql
-- ============================================================
-- HELPER FUNCTION: Get orgs the current user belongs to
-- ============================================================
CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT org_id FROM org_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- HELPER: Check if user has specific role in org
-- ============================================================
CREATE OR REPLACE FUNCTION user_has_org_role(
  _org_id UUID,
  _roles org_role[]
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE user_id = auth.uid()
      AND org_id = _org_id
      AND role = ANY(_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS: Organizations
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (id IN (SELECT user_org_ids()));

CREATE POLICY "Only owners/admins can update org"
  ON organizations FOR UPDATE
  USING (user_has_org_role(id, ARRAY['owner', 'admin']::org_role[]));

-- ============================================================
-- RLS: Tickets
-- ============================================================
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view tickets"
  ON tickets FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Members can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND reporter_id = auth.uid()
  );

CREATE POLICY "Members can update tickets (not viewers)"
  ON tickets FOR UPDATE
  USING (
    org_id IN (SELECT user_org_ids())
    AND user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager', 'member']::org_role[])
  );

CREATE POLICY "Only admins+ can delete tickets"
  ON tickets FOR DELETE
  USING (
    user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[])
  );

-- ============================================================
-- RLS: Projects
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view projects"
  ON projects FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Members can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND owner_id = auth.uid()
    AND user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager', 'member']::org_role[])
  );

CREATE POLICY "Project owners and admins can update"
  ON projects FOR UPDATE
  USING (
    org_id IN (SELECT user_org_ids())
    AND (
      owner_id = auth.uid()
      OR user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager']::org_role[])
    )
  );

-- ============================================================
-- RLS: Comments
-- ============================================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view comments"
  ON comments FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Authenticated users can create comments in their org"
  ON comments FOR INSERT
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND author_id = auth.uid()
  );

CREATE POLICY "Authors can update their own comments"
  ON comments FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Authors and admins can delete comments"
  ON comments FOR DELETE
  USING (
    author_id = auth.uid()
    OR user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[])
  );

-- ============================================================
-- RLS: Audit log (read-only for admins)
-- ============================================================
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read audit log"
  ON audit_log FOR SELECT
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));

-- No INSERT/UPDATE/DELETE policies — only triggers write to audit_log
```

### 5.2 Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     SIGN UP FLOW                                  │
│                                                                    │
│  1. User fills signup form (name, email, password)                │
│  2. Next.js API → Supabase Auth signUp()                         │
│  3. Supabase sends confirmation email (via Resend)               │
│  4. User clicks confirmation link                                 │
│  5. Trigger creates `profiles` row                                │
│  6. User is redirected to onboarding                              │
│  7. Onboarding creates first organization + org_member row       │
│  8. JWT is issued with user_id claim                              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     LOGIN FLOW                                    │
│                                                                    │
│  1. User submits email + password                                 │
│  2. Supabase Auth signInWithPassword()                           │
│  3. JWT + refresh token set as httpOnly cookies                  │
│  4. Next.js middleware reads cookie, validates session            │
│  5. Server Components access session via createServerClient()    │
│  6. Middleware redirects to /login if session expired             │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     SSO/SAML FLOW (Enterprise)                    │
│                                                                    │
│  1. User visits app.pips.com/login                                │
│  2. Enters email → system checks if org has SSO configured       │
│  3. Redirects to IdP (Okta, Azure AD, etc.)                     │
│  4. IdP authenticates → SAML response to Supabase callback      │
│  5. Supabase creates/links user, issues JWT                      │
│  6. Auto-join org based on email domain mapping                  │
└──────────────────────────────────────────────────────────────────┘
```

### 5.3 Authorization Model (RBAC)

```
┌─────────────────────────────────────────────────────────────┐
│  ROLE HIERARCHY                                              │
│                                                               │
│  owner ──► admin ──► manager ──► member ──► viewer          │
│                                                               │
│  Each role inherits all permissions from roles to its right  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  PERMISSION MATRIX                                            │
│                                                                │
│  Action              │ Owner │ Admin │ Manager │ Member │ Viewer │
│  ────────────────────┼───────┼───────┼─────────┼────────┼────────│
│  Manage billing      │  Yes  │  No   │   No    │   No   │   No   │
│  Delete org          │  Yes  │  No   │   No    │   No   │   No   │
│  Manage SSO          │  Yes  │  Yes  │   No    │   No   │   No   │
│  Manage members      │  Yes  │  Yes  │   No    │   No   │   No   │
│  Manage integrations │  Yes  │  Yes  │  Yes    │   No   │   No   │
│  Manage teams        │  Yes  │  Yes  │  Yes    │   No   │   No   │
│  Create projects     │  Yes  │  Yes  │  Yes    │  Yes   │   No   │
│  Create tickets      │  Yes  │  Yes  │  Yes    │  Yes   │   No   │
│  Comment             │  Yes  │  Yes  │  Yes    │  Yes   │   No   │
│  View data           │  Yes  │  Yes  │  Yes    │  Yes   │  Yes   │
│  View audit log      │  Yes  │  Yes  │   No    │   No   │   No   │
│  Manage API keys     │  Yes  │  Yes  │   No    │   No   │   No   │
│  Export data         │  Yes  │  Yes  │  Yes    │   No   │   No   │
└──────────────────────────────────────────────────────────────┘
```

### 5.4 Data Security

| Concern | Solution |
|---------|----------|
| **Encryption in transit** | TLS 1.3 enforced by Vercel + Supabase (HTTPS only) |
| **Encryption at rest** | Supabase encrypts all data at rest (AES-256). Integration secrets additionally encrypted via `pgcrypto` before storing in JSONB. |
| **Password hashing** | Supabase Auth uses bcrypt with configurable rounds |
| **JWT security** | Short-lived access tokens (1hr), httpOnly refresh tokens, SameSite=Lax |
| **API key storage** | Only SHA-256 hash stored. Full key shown once at creation. |
| **File uploads** | Validated MIME types, max size limits (50MB), virus scanning via ClamAV edge function |
| **SQL injection** | Supabase client uses parameterized queries. Zod validates all inputs. |
| **XSS** | React's automatic escaping + Content-Security-Policy headers + DOMPurify for user HTML |
| **CSRF** | SameSite cookies + Supabase Auth's built-in CSRF protection |

### 5.5 GDPR / SOC2 Considerations

| Requirement | Implementation |
|-------------|----------------|
| **Right to erasure** | `DELETE /api/v1/account` cascade-deletes all user data. Supabase Storage files purged. Audit log entries anonymized (user_id set to NULL). |
| **Data portability** | `GET /api/v1/account/export` returns JSON archive of all user data |
| **Consent tracking** | `user_consents` table tracks marketing, analytics, cookie consent with timestamps |
| **Data retention** | Audit logs retained 2 years, then archived. Deleted org data purged after 30-day grace period. |
| **Access logging** | Every API request logged with user_id, IP, timestamp, endpoint |
| **Breach notification** | Sentry alerts + automated incident response playbook |
| **SOC2 Type II** | Audit log, access controls, encryption, change management (GitHub PRs), monitoring — all foundational elements in place |

---

## 6. Integration Architecture

### 6.1 Integration Pattern Overview

```
┌──────────────────────────────────────────────────────────────┐
│                 INTEGRATION LAYER                             │
│                                                                │
│  ┌──────────┐   ┌───────────────────┐   ┌────────────────┐  │
│  │  Jira    │   │  Integration      │   │  PIPS Tickets  │  │
│  │  Cloud   │◄─►│  Sync Engine      │◄─►│  (Supabase)    │  │
│  └──────────┘   │                   │   └────────────────┘  │
│  ┌──────────┐   │  - Field mapping  │                        │
│  │  Azure   │◄─►│  - Conflict res.  │                        │
│  │  DevOps  │   │  - Rate limiting  │                        │
│  └──────────┘   │  - Error handling │                        │
│  ┌──────────┐   │  - Audit trail    │                        │
│  │  AHA!    │◄─►│                   │                        │
│  └──────────┘   └───────────────────┘                        │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Jira Connector

```typescript
// lib/integrations/jira/client.ts
import { z } from 'zod';

const jiraConfigSchema = z.object({
  baseUrl: z.string().url(),        // e.g., "https://acme.atlassian.net"
  email: z.string().email(),
  apiToken: z.string().min(1),
  projectKey: z.string().min(1),    // e.g., "ACME"
});

type JiraConfig = z.infer<typeof jiraConfigSchema>;

export const createJiraClient = (config: JiraConfig) => {
  const headers = {
    'Authorization': `Basic ${btoa(`${config.email}:${config.apiToken}`)}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const request = async (path: string, options?: RequestInit) => {
    const url = `${config.baseUrl}/rest/api/3${path}`;
    const res = await fetch(url, { ...options, headers: { ...headers, ...options?.headers } });
    if (!res.ok) throw new Error(`Jira API error: ${res.status} ${await res.text()}`);
    return res.json();
  };

  return {
    // Fetch issues updated since cursor
    getUpdatedIssues: async (since: string, maxResults = 50) => {
      const jql = `project = ${config.projectKey} AND updated >= "${since}" ORDER BY updated ASC`;
      return request(`/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=summary,description,status,priority,assignee,created,updated`);
    },

    // Create issue in Jira from PIPS ticket
    createIssue: async (ticket: { title: string; description: string; type: string; priority: string }) => {
      return request('/issue', {
        method: 'POST',
        body: JSON.stringify({
          fields: {
            project: { key: config.projectKey },
            summary: ticket.title,
            description: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: ticket.description }] }] },
            issuetype: { name: mapTicketTypeToJira(ticket.type) },
            priority: { name: mapPriorityToJira(ticket.priority) },
          },
        }),
      });
    },

    // Update issue in Jira
    updateIssue: async (issueKey: string, fields: Record<string, unknown>) => {
      return request(`/issue/${issueKey}`, {
        method: 'PUT',
        body: JSON.stringify({ fields }),
      });
    },

    // Transition issue status
    transitionIssue: async (issueKey: string, transitionId: string) => {
      return request(`/issue/${issueKey}/transitions`, {
        method: 'POST',
        body: JSON.stringify({ transition: { id: transitionId } }),
      });
    },
  };
};

// Field mapping utilities
const mapTicketTypeToJira = (type: string): string => {
  const map: Record<string, string> = {
    'pips_project': 'Epic',
    'task': 'Task',
    'bug': 'Bug',
    'feature': 'Story',
    'general': 'Task',
  };
  return map[type] ?? 'Task';
};

const mapPriorityToJira = (priority: string): string => {
  const map: Record<string, string> = {
    'critical': 'Highest',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
    'none': 'Lowest',
  };
  return map[priority] ?? 'Medium';
};
```

### 6.3 Azure DevOps Connector

```typescript
// lib/integrations/azure-devops/client.ts
import { z } from 'zod';

const adoConfigSchema = z.object({
  orgUrl: z.string().url(),       // e.g., "https://dev.azure.com/acme"
  pat: z.string().min(1),         // Personal Access Token
  project: z.string().min(1),
});

type AzureDevOpsConfig = z.infer<typeof adoConfigSchema>;

export const createAzureDevOpsClient = (config: AzureDevOpsConfig) => {
  const headers = {
    'Authorization': `Basic ${btoa(`:${config.pat}`)}`,
    'Content-Type': 'application/json',
  };

  const request = async (path: string, options?: RequestInit) => {
    const url = `${config.orgUrl}/${config.project}/_apis${path}`;
    const separator = path.includes('?') ? '&' : '?';
    const res = await fetch(`${url}${separator}api-version=7.1`, {
      ...options,
      headers: { ...headers, ...options?.headers },
    });
    if (!res.ok) throw new Error(`ADO API error: ${res.status} ${await res.text()}`);
    return res.json();
  };

  return {
    getWorkItems: async (ids: number[]) => {
      return request(`/wit/workitems?ids=${ids.join(',')}&$expand=all`);
    },

    createWorkItem: async (type: string, fields: Array<{ op: string; path: string; value: unknown }>) => {
      return request(`/wit/workitems/$${type}`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json-patch+json' },
        body: JSON.stringify(fields),
      });
    },

    queryWorkItems: async (wiql: string) => {
      return request('/wit/wiql', {
        method: 'POST',
        body: JSON.stringify({ query: wiql }),
      });
    },
  };
};
```

### 6.4 AHA! Connector

```typescript
// lib/integrations/aha/client.ts
import { z } from 'zod';

const ahaConfigSchema = z.object({
  domain: z.string(),            // e.g., "acme" for acme.aha.io
  apiKey: z.string().min(1),
  productId: z.string().min(1),
});

type AhaConfig = z.infer<typeof ahaConfigSchema>;

export const createAhaClient = (config: AhaConfig) => {
  const baseUrl = `https://${config.domain}.aha.io/api/v1`;
  const headers = {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const request = async (path: string, options?: RequestInit) => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { ...headers, ...options?.headers },
    });
    if (!res.ok) throw new Error(`AHA! API error: ${res.status} ${await res.text()}`);
    return res.json();
  };

  return {
    getFeatures: async (page = 1, perPage = 50) => {
      return request(`/products/${config.productId}/features?page=${page}&per_page=${perPage}`);
    },

    createFeature: async (feature: { name: string; description: string; workflow_status?: string }) => {
      return request(`/products/${config.productId}/features`, {
        method: 'POST',
        body: JSON.stringify({ feature }),
      });
    },

    updateFeature: async (featureId: string, updates: Record<string, unknown>) => {
      return request(`/features/${featureId}`, {
        method: 'PUT',
        body: JSON.stringify({ feature: updates }),
      });
    },

    getIdeas: async (page = 1) => {
      return request(`/products/${config.productId}/ideas?page=${page}`);
    },
  };
};
```

### 6.5 Integration Sync Engine

```typescript
// lib/integrations/sync-engine.ts

export type SyncResult = {
  created: number;
  updated: number;
  errors: Array<{ id: string; error: string }>;
  cursor: string;
};

export const createSyncEngine = (provider: 'jira' | 'azure_devops' | 'aha') => {
  return {
    /**
     * Pull changes from external system into PIPS.
     * Uses the sync_cursor from integration_connections to fetch incrementally.
     */
    pullChanges: async (connectionId: string): Promise<SyncResult> => {
      // 1. Load connection config from DB
      // 2. Create provider client
      // 3. Fetch changes since last cursor
      // 4. For each external item:
      //    a. Check if ticket with matching external_id exists
      //    b. If yes: compare updated_at, update if external is newer
      //    c. If no: create new ticket with external_id set
      // 5. Update sync_cursor
      // 6. Return results
      throw new Error('Implementation per provider');
    },

    /**
     * Push PIPS ticket changes to external system.
     * Triggered by webhook/trigger when a synced ticket is updated.
     */
    pushChanges: async (ticketId: string, connectionId: string): Promise<void> => {
      // 1. Load ticket and connection
      // 2. Map PIPS fields to provider fields
      // 3. If ticket has external_id: update in external system
      // 4. If no external_id: create in external system, save external_id
      throw new Error('Implementation per provider');
    },

    /**
     * Conflict resolution: last-write-wins with audit trail.
     * Both sides' data is logged. The newer updated_at wins.
     * User can review conflicts in the integration dashboard.
     */
    resolveConflict: async (
      ticketId: string,
      localData: Record<string, unknown>,
      externalData: Record<string, unknown>,
    ): Promise<'local' | 'external'> => {
      // Compare timestamps, log both versions to audit_log
      throw new Error('Implementation per provider');
    },
  };
};
```

### 6.6 Sync Scheduling

Syncs are scheduled via Supabase `pg_cron`:

```sql
-- Poll external systems every 5 minutes for active connections
SELECT cron.schedule(
  'integration-sync',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.edge_function_url') || '/integration-sync',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

---

## 7. White-Label System

### 7.1 Theming Architecture

The white-label system uses CSS custom properties (variables) that are dynamically set based on the organization's `org_settings` record.

```typescript
// lib/theme/org-theme.ts
import { type OrgSettings } from '@/types/database';

export type ThemeVariables = {
  '--brand-primary': string;
  '--brand-secondary': string;
  '--brand-primary-foreground': string;
  '--brand-name': string;
};

export const buildThemeVariables = (settings: OrgSettings): ThemeVariables => {
  return {
    '--brand-primary': settings.primary_color ?? '#06b6d4',
    '--brand-secondary': settings.secondary_color ?? '#8b5cf6',
    '--brand-primary-foreground': getContrastColor(settings.primary_color ?? '#06b6d4'),
    '--brand-name': settings.brand_name ?? 'PIPS',
  };
};

// Determine black or white foreground based on background luminance
const getContrastColor = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};
```

```tsx
// app/[orgSlug]/layout.tsx
import { buildThemeVariables } from '@/lib/theme/org-theme';
import { getOrgSettings } from '@/lib/data/org';

export const OrgLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) => {
  const { orgSlug } = await params;
  const settings = await getOrgSettings(orgSlug);
  const theme = buildThemeVariables(settings);

  return (
    <div
      style={theme as React.CSSProperties}
      className="min-h-screen bg-background text-foreground"
    >
      <header className="border-b">
        <div className="container flex items-center gap-3 py-4">
          {settings.logo_dark_url ? (
            <img
              src={settings.logo_dark_url}
              alt={settings.brand_name ?? 'PIPS'}
              className="h-8"
            />
          ) : (
            <span className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
              {settings.brand_name ?? 'PIPS'}
            </span>
          )}
        </div>
      </header>
      {children}
      {settings.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />
      )}
    </div>
  );
};
```

### 7.2 Custom Domain Support

Each organization can optionally configure a custom domain (e.g., `pips.acmecorp.com`).

**Setup flow:**
1. Org admin enters their desired domain in Settings.
2. System displays a CNAME record they need to add: `pips.acmecorp.com CNAME cname.vercel-dns.com`
3. System calls Vercel API to add the domain to the project.
4. Vercel automatically provisions TLS via Let's Encrypt.
5. Next.js middleware resolves the custom domain to the org slug.

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

export const middleware = async (req: NextRequest) => {
  const hostname = req.headers.get('host') ?? '';

  // Check if this is a custom domain (not the main app domain)
  if (!hostname.endsWith('pips.app') && !hostname.includes('localhost')) {
    // Look up org by custom domain
    const supabase = createMiddlewareClient(req);
    const { data: settings } = await supabase
      .from('org_settings')
      .select('org_id, organizations!inner(slug)')
      .eq('custom_domain', hostname)
      .single();

    if (settings) {
      const orgSlug = (settings.organizations as { slug: string }).slug;
      // Rewrite to the org-scoped route
      const url = req.nextUrl.clone();
      url.pathname = `/${orgSlug}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Standard auth session refresh
  const { response } = await createMiddlewareClient(req);
  return response;
};

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/v1/health).*)'],
};
```

### 7.3 Email Template Branding

```typescript
// lib/email/branded-template.tsx
import { Html, Head, Body, Container, Img, Text, Hr } from '@react-email/components';

type BrandedEmailProps = {
  brandName: string;
  primaryColor: string;
  logoUrl?: string;
  children: React.ReactNode;
};

export const BrandedEmail = ({ brandName, primaryColor, logoUrl, children }: BrandedEmailProps) => (
  <Html>
    <Head />
    <Body style={{ fontFamily: '-apple-system, sans-serif', backgroundColor: '#f9fafb' }}>
      <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        {logoUrl ? (
          <Img src={logoUrl} alt={brandName} height={40} style={{ marginBottom: '24px' }} />
        ) : (
          <Text style={{ fontSize: '20px', fontWeight: 700, color: primaryColor, marginBottom: '24px' }}>
            {brandName}
          </Text>
        )}
        {children}
        <Hr style={{ borderColor: '#e5e7eb', margin: '32px 0' }} />
        <Text style={{ fontSize: '12px', color: '#6b7280' }}>
          Sent by {brandName} via PIPS
        </Text>
      </Container>
    </Body>
  </Html>
);
```

### 7.4 PIPS Step Color System

The 6 PIPS steps have a default color coding system that organizations can override:

```typescript
// lib/theme/pips-colors.ts

export const DEFAULT_STEP_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  identify:     { bg: '#ef4444', text: '#ffffff', label: 'Identify' },
  analyze:      { bg: '#f97316', text: '#ffffff', label: 'Analyze' },
  generate:     { bg: '#eab308', text: '#000000', label: 'Generate' },
  select_plan:  { bg: '#22c55e', text: '#ffffff', label: 'Select & Plan' },
  implement:    { bg: '#3b82f6', text: '#ffffff', label: 'Implement' },
  evaluate:     { bg: '#8b5cf6', text: '#ffffff', label: 'Evaluate' },
};

export const getStepColors = (
  step: string,
  orgOverrides?: Record<string, { bg: string; text: string; label: string }>
) => {
  return orgOverrides?.[step] ?? DEFAULT_STEP_COLORS[step] ?? DEFAULT_STEP_COLORS['identify'];
};
```

---

## 8. Performance & Scalability

### 8.1 Caching Strategy

| Layer | Technology | TTL | Purpose |
|-------|-----------|-----|---------|
| **CDN** | Vercel Edge Network | ISR (60s) | Static pages, marketing, docs |
| **Server** | Next.js `unstable_cache` | 30-300s | Org settings, team lists, user profiles |
| **Database** | Materialized views | Refresh on write | Dashboard aggregations, ticket counts |
| **Client** | Zustand + SWR | staleWhileRevalidate | Ticket lists, project data |
| **Search** | Postgres FTS | Real-time | No cache needed — query is fast with GIN index |
| **Redis** | Upstash Redis | Varies | Rate limiting, session data, feature flags |

```typescript
// Example: Cached org settings fetch
import { unstable_cache } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';

export const getOrgSettings = unstable_cache(
  async (orgSlug: string) => {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('org_settings')
      .select('*, organizations!inner(id, name, slug, plan)')
      .eq('organizations.slug', orgSlug)
      .single();
    return data;
  },
  ['org-settings'],
  { revalidate: 300, tags: ['org-settings'] }
);
```

### 8.2 Database Indexing Strategy

All indexes are defined in Section 3 above. Key principles:

1. **Every foreign key gets an index** — Prevents slow joins.
2. **Composite indexes for common query patterns** — `(org_id, status)`, `(org_id, type)`.
3. **GIN indexes for full-text search** — `search_vector` columns on tickets and projects.
4. **Partial indexes for hot paths** — `WHERE read_at IS NULL` on notifications, `WHERE status IN ('active', 'error')` on integrations.
5. **No over-indexing** — Each index costs write performance. Only add indexes for proven query patterns.

### 8.3 Database Performance Features

```sql
-- Materialized view for dashboard ticket counts (refreshed on ticket changes)
CREATE MATERIALIZED VIEW ticket_counts AS
SELECT
  org_id,
  status,
  priority,
  type,
  assignee_id,
  COUNT(*) as count
FROM tickets
GROUP BY org_id, status, priority, type, assignee_id;

CREATE UNIQUE INDEX idx_ticket_counts
  ON ticket_counts(org_id, status, priority, type, assignee_id);

-- Refresh function (called by trigger or cron)
CREATE OR REPLACE FUNCTION refresh_ticket_counts()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY ticket_counts;
END;
$$ LANGUAGE plpgsql;

-- Refresh every minute via pg_cron
SELECT cron.schedule('refresh-ticket-counts', '* * * * *',
  'SELECT refresh_ticket_counts()');
```

### 8.4 Connection Pooling

Supabase uses PgBouncer in transaction mode by default. Key settings:

- **Direct connection** (port 5432): For migrations, DDL, long-running queries.
- **Pooled connection** (port 6543): For application queries. Use this in Next.js API routes.
- **Supabase client library**: Handles connection pooling automatically via the REST API (PostgREST).

### 8.5 Expected Load and Scaling Plan

| Phase | Users | Orgs | Tickets/mo | Approach |
|-------|-------|------|------------|----------|
| **Launch** | 1-100 | 1-10 | <1K | Supabase Free/Pro, Vercel Pro |
| **Growth** | 100-1K | 10-50 | 1K-10K | Supabase Pro, add read replicas if needed |
| **Scale** | 1K-10K | 50-500 | 10K-100K | Supabase Team, Upstash Redis, consider Typesense for search |
| **Enterprise** | 10K+ | 500+ | 100K+ | Supabase Enterprise, dedicated Postgres, edge caching, CDN for all assets |

---

## 9. DevOps & Infrastructure

### 9.1 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '22'

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [lint-and-type-check]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - name: Start Supabase local
        run: pnpm supabase start
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  db-migration-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase db lint
      - run: supabase db diff --linked
```

### 9.2 Environment Strategy

| Environment | URL | Database | Branch | Purpose |
|-------------|-----|----------|--------|---------|
| **Local** | localhost:3000 | Supabase local (Docker) | feature/* | Development |
| **Preview** | pr-123.pips.app | Supabase branching (preview DB) | PR branches | PR review |
| **Staging** | staging.pips.app | Staging Supabase project | main | Pre-production validation |
| **Production** | app.pips.app | Production Supabase project | main (via release tag) | Live |

### 9.3 Monitoring & Alerting

| Concern | Tool | Details |
|---------|------|---------|
| **Error tracking** | Sentry | Source maps uploaded at build. Alert on new errors, error spikes. |
| **Performance** | Vercel Analytics | Web Vitals (LCP, FID, CLS), Real User Monitoring |
| **Uptime** | Better Uptime or Vercel | Health endpoint checks every 60s |
| **Database** | Supabase Dashboard | Query performance, connection count, storage usage |
| **Logs** | Vercel Logs + Supabase Logs | Structured JSON logging. Ship to Axiom or Datadog if needed. |
| **Alerting** | Sentry + PagerDuty | Error rate thresholds, downtime, slow queries |

### 9.4 Database Migration Strategy

All schema changes go through Supabase migrations:

```bash
# Create a new migration
pnpm supabase migration new add_ticket_labels

# Edit the generated file: supabase/migrations/20260302_add_ticket_labels.sql

# Test locally
pnpm supabase db reset    # Replays all migrations from scratch
pnpm supabase db lint      # Check for issues

# Apply to staging (linked project)
pnpm supabase db push --linked

# Apply to production (via CI/CD after staging verification)
# The deploy pipeline runs `supabase db push` against production
```

Migration rules:
1. **Never modify existing migrations** — Always create new ones.
2. **Backward-compatible changes only** — Add columns as nullable, never drop columns in the same release as code that stops using them.
3. **Test with production data volume** — Use `supabase db dump` from staging to test migrations.
4. **RLS policies in migrations** — Every new table must include RLS policies in the same migration file.

### 9.5 Backup & Disaster Recovery

| Concern | Strategy |
|---------|----------|
| **Database backups** | Supabase Pro: daily automated backups, 7-day retention. Point-in-time recovery (PITR) on Team/Enterprise plans. |
| **Storage backups** | Supabase Storage is backed up with the database. Critical files also replicated to a separate S3 bucket monthly. |
| **Code** | GitHub repository with branch protection. Tags for every production release. |
| **Secrets** | Stored in Vercel environment variables (encrypted). Rotated quarterly. Documented in a secrets inventory. |
| **RTO/RPO** | RTO: 1 hour. RPO: 24 hours (daily backup), 1 minute (with PITR on Team plan). |
| **Disaster recovery** | Restore from Supabase backup to a new project. Update Vercel env vars. DNS failover. Documented runbook. |

---

## 10. Project Structure

### 10.1 Monorepo Structure

```
pips2/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-staging.yml
│   │   └── deploy-production.yml
│   └── CODEOWNERS
│
├── apps/
│   └── web/                          # Next.js 15 application
│       ├── app/
│       │   ├── (auth)/               # Auth pages (no org layout)
│       │   │   ├── login/
│       │   │   ├── signup/
│       │   │   ├── forgot-password/
│       │   │   └── layout.tsx
│       │   │
│       │   ├── (marketing)/          # Public marketing pages
│       │   │   ├── page.tsx          # Landing page
│       │   │   ├── pricing/
│       │   │   └── layout.tsx
│       │   │
│       │   ├── (app)/                # Authenticated app
│       │   │   ├── [orgSlug]/        # Org-scoped routes
│       │   │   │   ├── layout.tsx    # Org layout (sidebar, header, theme)
│       │   │   │   ├── page.tsx      # Dashboard
│       │   │   │   ├── projects/
│       │   │   │   │   ├── page.tsx          # Project list
│       │   │   │   │   ├── new/
│       │   │   │   │   └── [projectId]/
│       │   │   │   │       ├── page.tsx      # Project overview
│       │   │   │   │       ├── steps/
│       │   │   │   │       │   └── [step]/
│       │   │   │   │       │       └── page.tsx  # Step detail (forms, tools)
│       │   │   │   │       ├── tickets/
│       │   │   │   │       └── settings/
│       │   │   │   │
│       │   │   │   ├── tickets/
│       │   │   │   │   ├── page.tsx          # Ticket board/list
│       │   │   │   │   ├── new/
│       │   │   │   │   └── [ticketId]/
│       │   │   │   │       └── page.tsx      # Ticket detail
│       │   │   │   │
│       │   │   │   ├── teams/
│       │   │   │   ├── members/
│       │   │   │   ├── integrations/
│       │   │   │   └── settings/
│       │   │   │       ├── general/
│       │   │   │       ├── branding/
│       │   │   │       ├── billing/
│       │   │   │       └── api-keys/
│       │   │   │
│       │   │   ├── onboarding/
│       │   │   └── layout.tsx        # App shell (auth guard)
│       │   │
│       │   ├── api/
│       │   │   └── v1/               # REST API routes
│       │   │       ├── auth/
│       │   │       ├── organizations/
│       │   │       ├── teams/
│       │   │       ├── projects/
│       │   │       ├── tickets/
│       │   │       ├── search/
│       │   │       ├── notifications/
│       │   │       ├── integrations/
│       │   │       ├── webhooks/
│       │   │       ├── files/
│       │   │       └── health/
│       │   │
│       │   ├── layout.tsx            # Root layout
│       │   ├── not-found.tsx
│       │   └── error.tsx
│       │
│       ├── components/
│       │   ├── ui/                   # shadcn/ui components (Button, Dialog, etc.)
│       │   ├── layout/               # Shell, Sidebar, Header, Breadcrumbs
│       │   ├── tickets/              # TicketCard, TicketBoard, TicketForm
│       │   ├── projects/             # ProjectCard, StepWizard, FormRenderer
│       │   ├── forms/                # PIPS form components (Fishbone, 5Why, etc.)
│       │   ├── teams/
│       │   ├── comments/
│       │   ├── notifications/
│       │   └── shared/               # Avatar, Badge, EmptyState, LoadingSkeleton
│       │
│       ├── lib/
│       │   ├── supabase/
│       │   │   ├── client.ts         # Browser client
│       │   │   ├── server.ts         # Server Component client
│       │   │   ├── middleware.ts      # Middleware client
│       │   │   └── service.ts        # Service role client (admin ops)
│       │   ├── auth/
│       │   │   ├── middleware.ts      # requireAuth helper
│       │   │   └── org-access.ts     # requireOrgAccess helper
│       │   ├── integrations/
│       │   │   ├── jira/
│       │   │   ├── azure-devops/
│       │   │   ├── aha/
│       │   │   └── sync-engine.ts
│       │   ├── theme/
│       │   │   ├── org-theme.ts
│       │   │   └── pips-colors.ts
│       │   ├── email/
│       │   │   ├── client.ts         # Resend client
│       │   │   └── templates/        # React Email templates
│       │   ├── stripe/
│       │   │   ├── client.ts
│       │   │   └── webhooks.ts
│       │   ├── webhooks/
│       │   │   ├── dispatcher.ts
│       │   │   └── signing.ts
│       │   └── utils/
│       │       ├── cn.ts             # clsx + tailwind-merge
│       │       ├── dates.ts
│       │       └── validation.ts
│       │
│       ├── hooks/
│       │   ├── use-org.ts            # Current org context
│       │   ├── use-user.ts           # Current user
│       │   ├── use-realtime.ts       # Supabase Realtime subscription
│       │   ├── use-tickets.ts        # Ticket CRUD operations
│       │   └── use-notifications.ts  # Notification bell
│       │
│       ├── stores/
│       │   ├── ticket-board.ts       # Kanban board state (drag/drop)
│       │   └── form-builder.ts       # Dynamic form state
│       │
│       ├── types/
│       │   ├── database.ts           # Generated from Supabase (supabase gen types)
│       │   ├── api.ts                # API request/response types
│       │   └── pips.ts               # PIPS domain types
│       │
│       ├── middleware.ts
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                       # Shared utilities (if needed later)
│       ├── src/
│       │   ├── schemas/              # Zod schemas shared between client/server
│       │   └── constants/            # PIPS step definitions, status mappings
│       ├── tsconfig.json
│       └── package.json
│
├── supabase/
│   ├── config.toml                   # Local dev config
│   ├── migrations/                   # SQL migration files (ordered)
│   │   ├── 20260302000000_initial_schema.sql
│   │   ├── 20260302000001_rls_policies.sql
│   │   ├── 20260302000002_triggers_and_functions.sql
│   │   └── 20260302000003_seed_data.sql
│   ├── functions/                    # Supabase Edge Functions
│   │   ├── integration-sync/
│   │   ├── webhook-dispatcher/
│   │   ├── notification-digest/
│   │   └── file-scan/
│   └── seed.sql                      # Development seed data
│
├── tests/
│   ├── unit/                         # Vitest unit tests
│   ├── integration/                  # API integration tests
│   └── e2e/                          # Playwright E2E tests
│       ├── auth.spec.ts
│       ├── tickets.spec.ts
│       ├── projects.spec.ts
│       └── fixtures/
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .env.example
├── .env.local                        # (gitignored)
└── .gitignore
```

### 10.2 Code Conventions

| Convention | Rule |
|-----------|------|
| **Components** | Functional, arrow functions, named exports |
| **Files** | kebab-case for files, PascalCase for components |
| **Imports** | Path aliases: `@/` for `apps/web/`, no relative imports beyond `./` or `../` |
| **Types** | Colocated with their module. Shared types in `types/` directory |
| **File size** | Target <200 lines. Extract hooks, utilities, sub-components |
| **Indentation** | 2 spaces |
| **Naming** | `use-` prefix for hooks, `-store` suffix for Zustand stores |
| **API routes** | One file per HTTP method grouping. Zod schema at top. |
| **Database** | Snake_case columns, camelCase in TypeScript (Supabase handles conversion) |

### 10.3 Component Pattern Example

```tsx
// components/tickets/ticket-card.tsx
'use client';

import { type FC, memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStepColors } from '@/lib/theme/pips-colors';
import { formatDistanceToNow } from 'date-fns';
import { type Ticket } from '@/types/database';

type TicketCardProps = {
  ticket: Ticket & {
    assignee?: { id: string; full_name: string; avatar_url: string | null };
  };
  onClick?: (ticketId: string) => void;
};

export const TicketCard: FC<TicketCardProps> = memo(({ ticket, onClick }) => {
  const priorityColors: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
    none: 'bg-gray-400',
  };

  return (
    <button
      className="w-full rounded-lg border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
      onClick={() => onClick?.(ticket.id)}
      aria-label={`Ticket ${ticket.sequence_number}: ${ticket.title}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          #{ticket.sequence_number}
        </span>
        <div className={`h-2 w-2 rounded-full ${priorityColors[ticket.priority]}`} />
      </div>

      <h3 className="mb-2 text-sm font-medium leading-snug">{ticket.title}</h3>

      {ticket.pips_step && (
        <Badge
          style={{
            backgroundColor: getStepColors(ticket.pips_step).bg,
            color: getStepColors(ticket.pips_step).text,
          }}
          className="mb-2"
        >
          {getStepColors(ticket.pips_step).label}
        </Badge>
      )}

      <div className="flex items-center justify-between">
        {ticket.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={ticket.assignee.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs">
              {ticket.assignee.full_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
        </span>
      </div>
    </button>
  );
});

TicketCard.displayName = 'TicketCard';
```

### 10.4 Testing Strategy

| Type | Tool | Scope | Target Coverage |
|------|------|-------|-----------------|
| **Unit** | Vitest | Utility functions, hooks, Zustand stores, Zod schemas | 80%+ |
| **Component** | Vitest + Testing Library | UI components in isolation | Key interactive components |
| **Integration** | Vitest + Supabase local | API routes, database queries, RLS policies | All API endpoints |
| **E2E** | Playwright | Full user flows (signup, create project, manage tickets) | Critical paths |
| **Visual** | Playwright screenshots | Component appearance across themes | White-label variants |

```typescript
// tests/integration/api/tickets.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestClient, createTestOrg, createTestUser } from '../helpers';

describe('POST /api/v1/tickets', () => {
  let orgId: string;
  let authToken: string;

  beforeAll(async () => {
    const user = await createTestUser();
    const org = await createTestOrg(user.id);
    orgId = org.id;
    authToken = user.token;
  });

  it('creates a ticket with valid data', async () => {
    const res = await fetch('/api/v1/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        orgId,
        title: 'Reduce checkout abandonment by 15%',
        type: 'pips_project',
        priority: 'high',
      }),
    });

    expect(res.status).toBe(201);
    const { data } = await res.json();
    expect(data.title).toBe('Reduce checkout abandonment by 15%');
    expect(data.sequence_number).toBe(1);
    expect(data.type).toBe('pips_project');
  });

  it('rejects ticket creation for viewers', async () => {
    const viewer = await createTestUser();
    await addOrgMember(orgId, viewer.id, 'viewer');

    const res = await fetch('/api/v1/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${viewer.token}`,
      },
      body: JSON.stringify({
        orgId,
        title: 'Should not work',
      }),
    });

    expect(res.status).toBe(403);
  });

  it('validates required fields', async () => {
    const res = await fetch('/api/v1/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ orgId }),
    });

    expect(res.status).toBe(400);
  });
});
```

---

## Appendix A: PIPS Form Types

The 26 existing HTML form templates map to these `form_type` values in `project_forms`:

| Step | Form Type | Description |
|------|-----------|-------------|
| **Identify** | `problem_statement` | Structured problem definition |
| **Identify** | `stakeholder_analysis` | Stakeholder identification and impact |
| **Identify** | `scope_definition` | Project scope and boundaries |
| **Identify** | `checksheet` | Data collection checksheet |
| **Analyze** | `fishbone` | Ishikawa cause-and-effect diagram |
| **Analyze** | `five_why` | 5-Why root cause analysis |
| **Analyze** | `force_field` | Force field analysis (drivers vs restrainers) |
| **Analyze** | `pareto` | Pareto chart data (80/20 analysis) |
| **Analyze** | `process_map` | Current state process mapping |
| **Generate** | `brainstorming` | Free-form brainstorming session |
| **Generate** | `brainwriting` | Structured written brainstorming (6-3-5) |
| **Generate** | `affinity_diagram` | Grouping ideas into themes |
| **Select & Plan** | `decision_matrix` | Weighted criteria evaluation |
| **Select & Plan** | `weighted_voting` | Team voting with weights |
| **Select & Plan** | `cost_benefit` | Cost-benefit analysis |
| **Select & Plan** | `implementation_plan` | Action items, owners, timeline |
| **Select & Plan** | `risk_assessment` | Risk identification and mitigation |
| **Implement** | `raci` | RACI responsibility matrix |
| **Implement** | `milestone_tracker` | Key milestones and deadlines |
| **Implement** | `checklist` | Implementation task checklist |
| **Implement** | `communication_plan` | Stakeholder communication schedule |
| **Implement** | `change_management` | Change impact and readiness |
| **Evaluate** | `outcome_measurement` | Before/after metrics comparison |
| **Evaluate** | `lessons_learned` | What worked, what didn't, recommendations |
| **Evaluate** | `sustainability_plan` | Control plan for maintaining improvements |
| **Evaluate** | `project_evaluation` | Overall project evaluation scorecard |

Each form type's `data` column stores a JSONB structure specific to that form. The frontend renders the appropriate form UI based on the `form_type` value.

---

## Appendix B: Environment Variables

```env
# .env.example

# ── Supabase ──────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ── Stripe ────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# ── Resend ────────────────────────────────
RESEND_API_KEY=re_...

# ── Sentry ────────────────────────────────
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...

# ── Redis (Upstash) ──────────────────────
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=AX...

# ── App ───────────────────────────────────
NEXT_PUBLIC_APP_URL=https://app.pips.app
NEXT_PUBLIC_MARKETING_URL=https://www.pips.app
```

---

## Appendix C: Migration from ForgePIPS v1

The existing ForgePIPS site (static HTML on Vercel) will continue to operate as the marketing/sales site. PIPS 2.0 is a separate application.

| v1 Asset | v2 Migration Path |
|----------|-------------------|
| 10 HTML pages | Rebuild as Next.js marketing pages (or keep separate) |
| 5 API routes | Replace with v2 API. Stripe webhook logic moves to v2. |
| Supabase tables (`forgepips_*`) | Separate from v2 schema. v1 remains operational. |
| Stripe products (Team Kit, etc.) | Keep as one-time purchases. v2 adds SaaS subscription model. |
| Branding (teal `#06b6d4`) | Becomes the default theme. Per-org overrides in v2. |

---

## Appendix D: Subscription Tiers (Stripe)

| Plan | Price | Limits | Features |
|------|-------|--------|----------|
| **Free** | $0/mo | 3 users, 1 project, 50 tickets | Core PIPS workflow, basic ticketing |
| **Starter** | $29/mo | 10 users, 5 projects, 500 tickets | All PIPS forms, teams, file attachments |
| **Professional** | $79/mo | 50 users, unlimited projects, unlimited tickets | Integrations, API access, custom forms, dashboard analytics |
| **Enterprise** | Custom | Unlimited | SSO/SAML, white-label, custom domain, SLA, dedicated support, audit log export |

---

*End of Technical Architecture Plan*
