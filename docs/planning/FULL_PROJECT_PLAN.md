# PIPS 2.0 Full Project Plan (Post-MVP)

> **Version:** 1.0
> **Created:** March 3, 2026
> **Author:** Marc Albers + Claude Opus 4.6
> **Status:** Active
> **Production URL:** https://pips-app.vercel.app
> **Repository:** AlberaMarc/pips2 (private)

**START HERE for all post-MVP work.** This document is the single source of truth for what has been built, what remains, and in what order it should be executed.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Phase 1.5 -- Stabilization](#2-phase-15----stabilization)
3. [Phase 2 -- Knowledge Hub Foundation (Weeks 1-2)](#3-phase-2----knowledge-hub-foundation-weeks-1-2)
4. [Phase 2 -- Reading Experience (Weeks 3-4)](#4-phase-2----reading-experience-weeks-3-4)
5. [Phase 2 -- Cadence Bar (Week 5)](#5-phase-2----cadence-bar-week-5)
6. [Phase 3 -- Training Mode (Weeks 6-7)](#6-phase-3----training-mode-weeks-6-7)
7. [Phase 4 -- Marketing Content (Week 8)](#7-phase-4----marketing-content-week-8)
8. [Phase 5 -- Workshop Facilitation (Week 9)](#8-phase-5----workshop-facilitation-week-9)
9. [Phase 6 -- Polish (Week 10)](#9-phase-6----polish-week-10)
10. [Agent Coordination Plan](#10-agent-coordination-plan)
11. [Dependencies and Critical Path](#11-dependencies-and-critical-path)
12. [Quality Gates](#12-quality-gates)

---

## 1. Executive Summary

PIPS 2.0 is a multi-tenant SaaS web application that embeds the PIPS 6-step process improvement methodology into enterprise-grade project management and ticketing software. The platform lives at **https://pips-app.vercel.app** and runs on Next.js 16, TypeScript, Supabase, and Vercel.

### MVP Status: COMPLETE

| Metric            | Value                                              |
| ----------------- | -------------------------------------------------- |
| Unit tests        | 832 passing (50 files)                             |
| E2E tests         | 160 across 18 spec files                           |
| Type errors       | 0                                                  |
| PIPS forms        | 18 interactive methodology forms                   |
| Sprints completed | 7 (Sprint 0-7) + security hardening + bug fix wave |
| Production deploy | Live since March 3, 2026                           |

**What the MVP includes:** Email/password auth, org management with RBAC (5 roles), complete 6-step PIPS workflow with 18 forms, ticketing with Kanban board and sortable table, dashboard with stats, command palette (Cmd+K), notification system (DB triggers + email), team management, dark mode, CSV/PDF export, invitation system, parent/child tickets, branded email templates, Sentry error tracking, Vercel Analytics, accessibility (WCAG AA pass), and comprehensive seed data with a "Try a Sample Project" feature.

### Post-MVP Focus

Post-MVP work is organized into six phases across approximately 10 weeks:

| Phase | Name                  | Duration  | Core Deliverable                                        |
| ----- | --------------------- | --------- | ------------------------------------------------------- |
| 1.5   | Stabilization         | 3-5 days  | Fix bugs found in User Agent testing                    |
| 2     | Knowledge Hub         | Weeks 1-5 | Content system, reading experience, Cadence Bar         |
| 3     | Training Mode         | Weeks 6-7 | Guided training paths with practice scenarios           |
| 4     | Marketing Content     | Week 8    | Public methodology pages, book preview, templates       |
| 5     | Workshop Facilitation | Week 9    | Real-time facilitation tools                            |
| 6     | Polish                | Week 10   | Session persistence, mobile, accessibility, performance |

---

## 2. Phase 1.5 -- Stabilization

**Timeline:** 3-5 days
**Priority:** Must complete before Phase 2 work begins
**Source:** User Agent testing of live site (https://pips-app.vercel.app)

### Bug List

| #    | Severity     | Issue                                                                           | Root Cause                                                                                    |
| ---- | ------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| S-01 | **CRITICAL** | RLS data loading failure -- dashboard/projects/tickets show empty after login   | `getUserOrgRole` or middleware org_id resolution fails; Supabase RLS blocks all reads         |
| S-02 | **CRITICAL** | User profile identity broken -- avatar shows wrong initials, profile page blank | Profile trigger on `auth.users` insert may not fire; `profiles.full_name` is NULL             |
| S-03 | **CRITICAL** | Project detail pages return 404                                                 | Dynamic route `[projectId]` not matching; possible `title` vs `name` residual bug in query    |
| S-04 | **CRITICAL** | Ticket creation redirect not working                                            | `redirect()` called after `revalidatePath()` may be swallowed; server action flow issue       |
| S-05 | **CRITICAL** | React hydration errors on multiple pages                                        | Server/client mismatch -- likely `Date` formatting, `useTheme`, or `window` references in SSR |
| S-06 | Medium       | Audit log shows "System" for all actor names                                    | Profile lookup fails; falls back to "System" string                                           |
| S-07 | Medium       | Profile display name not persisting after save                                  | `updateProfile` server action may write to wrong column or session not refreshed              |
| S-08 | Medium       | No success feedback after form saves (projects, tickets, profile)               | Missing toast/sonner calls after successful server action                                     |
| S-09 | Minor        | Landing page nav links scroll to wrong positions or 404                         | Anchor IDs missing or mismatched in landing page sections                                     |
| S-10 | Minor        | App 404 page shows unstyled Next.js default                                     | `not-found.tsx` in `(app)` group not rendering; may need layout wrapper                       |
| S-11 | Minor        | Form validation errors not clearing on re-submit                                | Zod error state not reset before new validation pass                                          |

### Work Packages

#### WP-S1: RLS and Data Loading (S-01, S-02)

**Files to investigate/fix:**

- `apps/web/src/lib/supabase/middleware.ts` -- org_id cookie/session handling
- `apps/web/src/lib/supabase/server.ts` -- createServerClient configuration
- `apps/web/src/app/(app)/layout.tsx` -- org context provider
- `apps/web/src/hooks/use-org.ts` -- client-side org hydration
- `apps/web/src/stores/org-store.ts` -- Zustand store hydration
- `supabase/migrations/20260303000000_initial_schema.sql` -- profile trigger verification
- `supabase/migrations/20260303230000_fix_org_creation_rls.sql` -- RLS policy review

**Acceptance criteria:**

- After signup + org creation, dashboard loads with stats
- Projects page shows user's projects
- Tickets page shows user's tickets
- Profile shows correct display name and avatar

#### WP-S2: Project Detail and Ticket Redirect (S-03, S-04)

**Files to investigate/fix:**

- `apps/web/src/app/(app)/projects/[projectId]/page.tsx` -- dynamic route param handling
- `apps/web/src/app/(app)/projects/[projectId]/steps/page.tsx` -- step view queries
- `apps/web/src/app/(app)/tickets/actions.ts` -- `createTicket` redirect placement
- `apps/web/src/app/(app)/tickets/new/ticket-create-form.tsx` -- form submission flow

**Acceptance criteria:**

- Clicking a project card navigates to `/projects/{uuid}` and shows project detail
- Creating a ticket redirects to `/tickets` with the new ticket visible
- No blank pages or 404s on valid project/ticket IDs

#### WP-S3: Hydration Errors (S-05)

**Files to investigate/fix:**

- `apps/web/src/app/layout.tsx` -- ThemeProvider `suppressHydrationWarning`
- `apps/web/src/components/layout/sidebar.tsx` -- any `window` or `document` references
- `apps/web/src/components/dashboard/stat-cards.tsx` -- date formatting
- `apps/web/src/components/tickets/ticket-card.tsx` -- date formatting
- All components using `new Date()` or `date-fns` in render -- ensure server/client consistency

**Acceptance criteria:**

- Zero hydration warnings in browser console
- Pages render identically on server and client

#### WP-S4: Audit Log, Profile, Feedback (S-06, S-07, S-08)

**Files to investigate/fix:**

- `apps/web/src/app/(app)/settings/audit-log/actions.ts` -- profile name resolution
- `apps/web/src/app/(app)/profile/actions.ts` -- profile update + session refresh
- `apps/web/src/app/(app)/projects/new/actions.ts` -- add toast after success
- `apps/web/src/app/(app)/tickets/actions.ts` -- add toast after success
- `apps/web/src/app/(app)/profile/profile-form.tsx` -- add toast after save

**Acceptance criteria:**

- Audit log shows real user names, not "System"
- Profile display name updates and persists across page refresh
- Users see toast confirmation after creating projects, tickets, and saving profile

#### WP-S5: Minor Polish (S-09, S-10, S-11)

**Files to investigate/fix:**

- `apps/web/src/components/landing/*.tsx` -- section anchor IDs
- `apps/web/src/app/(app)/not-found.tsx` -- styled 404 page within app layout
- `apps/web/src/lib/validations.ts` -- error state reset logic
- `apps/web/src/components/pips/form-shell.tsx` -- clear errors before re-validation

**Acceptance criteria:**

- Landing page anchor links scroll to correct sections
- 404 in app area shows branded PIPS not-found page
- Re-submitting a form after fixing validation errors does not show stale error messages

---

## 3. Phase 2 -- Knowledge Hub Foundation (Weeks 1-2)

The Knowledge Hub is the core educational layer that makes PIPS 2.0 a "methodology-embedded" platform rather than a generic project management tool. It delivers content from 4 pillars -- Book, Interactive Guide, Workbook, and Workshop -- all cross-linked by a shared taxonomy.

### 3.1 Content Taxonomy Types

**Status: DONE**

| Item                   | File                                      | Lines |
| ---------------------- | ----------------------------------------- | ----- |
| Content taxonomy types | `packages/shared/src/content-taxonomy.ts` | 419   |

Defines: `ContentStep`, `ContentPillar`, `ContentTool`, `ContentPrinciple`, `ContentRole`, `ContentDifficulty`, `ContentType`, `ContentAccessLevel`, `ContentTags`, `ContentNode`, `ProductContext`, `TrainingExerciseType`, `TrainingStatus`, `WorkshopStatus`, `ChapterMapping`, `BOOK_CHAPTER_MAP` (20 chapters mapped), `stepNumberToContentStep()`, `formTypeToContentTool()`, `buildProductContext()`, `matchContentNodes()`, `groupByPillar()`, `CONTENT_PILLARS`, `PILLAR_META`.

### 3.2 Database Migration

**Status: DONE**

| Item                 | File                                                          | Lines |
| -------------------- | ------------------------------------------------------------- | ----- |
| Knowledge Hub tables | `supabase/migrations/20260304000000_knowledge_hub_tables.sql` | 338   |

Creates 10 tables:

| Table                    | RLS                 | Purpose                                                                      |
| ------------------------ | ------------------- | ---------------------------------------------------------------------------- |
| `content_nodes`          | No (global catalog) | All content pieces with full-text search (tsvector), JSONB tags, GIN indexes |
| `reading_sessions`       | User-scoped         | Track reading position per pillar per user                                   |
| `content_bookmarks`      | User-scoped         | User bookmarks with optional notes                                           |
| `content_read_history`   | User-scoped         | Read counts and timestamps per content node                                  |
| `training_paths`         | No (global catalog) | Training path definitions (title, audience, hours)                           |
| `training_modules`       | No (global catalog) | Modules within paths, linked to content_node_ids                             |
| `training_exercises`     | No (global catalog) | Exercises per module (fill-form, multiple-choice, scenario, reflection)      |
| `training_progress`      | User-scoped         | Per-user module completion tracking                                          |
| `training_exercise_data` | User-scoped         | Per-user exercise attempts and scores                                        |
| `workshop_sessions`      | Org-scoped          | Workshop session state (facilitator, timer, status)                          |

**Note:** This migration has NOT been applied to the production Supabase instance yet. It must be applied before any Knowledge Hub features work in production.

### 3.3 Content Compiler Script

**Status: DONE**

| Item             | File                         |
| ---------------- | ---------------------------- |
| Content compiler | `scripts/compile-content.ts` |

Compiles markdown source files from the PIPS Book (`Projects/PIPS/Book/`) and Interactive Guide into `ContentNode` JSON, applying the taxonomy tags defined in `content-taxonomy.ts`.

### 3.4 Content Seeder Script

**Status: DONE**

| Item           | File                      |
| -------------- | ------------------------- |
| Content seeder | `scripts/seed-content.ts` |

Reads compiled JSON and inserts rows into the `content_nodes` table via Supabase admin client.

### 3.5 Remaining Foundation Work (TODO)

| Item                                     | Priority | Description                                                         |
| ---------------------------------------- | -------- | ------------------------------------------------------------------- |
| Apply migration to production            | High     | Run `20260304000000_knowledge_hub_tables.sql` against prod Supabase |
| Run content compiler against book source | High     | Execute `scripts/compile-content.ts` to generate JSON catalog       |
| Run content seeder against production    | High     | Execute `scripts/seed-content.ts` to populate `content_nodes`       |
| Verify full-text search index            | Medium   | Test `search_vector` tsvector queries return relevant results       |
| Add `content_nodes` to seed.sql          | Low      | Include sample content nodes in dev seed data for local testing     |

---

## 4. Phase 2 -- Reading Experience (Weeks 3-4)

### 4.1 Knowledge Hub Routes

**Status: DONE (scaffolded)**

All routes exist with page components:

| Route                              | File                                                  | Description                                |
| ---------------------------------- | ----------------------------------------------------- | ------------------------------------------ |
| `/knowledge`                       | `src/app/(app)/knowledge/page.tsx`                    | Hub landing page (pillar navigation)       |
| `/knowledge/book`                  | `src/app/(app)/knowledge/book/page.tsx`               | Book table of contents                     |
| `/knowledge/book/[chapterSlug]`    | `src/app/(app)/knowledge/book/[chapterSlug]/page.tsx` | Chapter reader                             |
| `/knowledge/guide`                 | `src/app/(app)/knowledge/guide/page.tsx`              | Interactive guide landing                  |
| `/knowledge/workbook`              | `src/app/(app)/knowledge/workbook/page.tsx`           | Workbook landing                           |
| `/knowledge/workbook/[stepNumber]` | `src/app/(app)/knowledge/workbook/[stepNumber]/`      | Step-specific workbook (directory exists)  |
| `/knowledge/workshop`              | `src/app/(app)/knowledge/workshop/page.tsx`           | Workshop landing                           |
| `/knowledge/workshop/modules`      | `src/app/(app)/knowledge/workshop/modules/`           | Workshop module listing (directory exists) |
| `/knowledge/bookmarks`             | `src/app/(app)/knowledge/bookmarks/page.tsx`          | User bookmarks                             |
| `/knowledge/search`                | `src/app/(app)/knowledge/search/page.tsx`             | Content search                             |
| `/knowledge/actions.ts`            | `src/app/(app)/knowledge/actions.ts`                  | Server actions for content queries         |

**Sub-routes NOT yet created:**

- `/knowledge/guide/step/` -- directory exists but no page files inside
- `/knowledge/guide/tools/` -- directory exists but no page files inside

### 4.2 Content Reader Component

**Status: DONE**

| Component             | File                                                 |
| --------------------- | ---------------------------------------------------- |
| `ContentReader`       | `src/components/knowledge/content-reader.tsx`        |
| `KnowledgeHubLanding` | `src/components/knowledge/knowledge-hub-landing.tsx` |
| `BookmarkButton`      | `src/components/knowledge/bookmark-button.tsx`       |

### 4.3 Remaining Reading Experience Work (TODO)

| Item                           | Priority | Description                                                              |
| ------------------------------ | -------- | ------------------------------------------------------------------------ |
| Wire `ContentReader` to DB     | High     | Fetch `content_nodes` by slug, render `body_md` with markdown parser     |
| Guide step pages               | High     | Create `guide/step/[stepNumber]/page.tsx` -- step-specific guide content |
| Guide tools pages              | High     | Create `guide/tools/[toolSlug]/page.tsx` -- tool-specific guide content  |
| Workbook step pages            | High     | Wire `workbook/[stepNumber]/page.tsx` -- exercises for each step         |
| Workshop module pages          | Medium   | Wire `workshop/modules/page.tsx` -- list facilitation modules            |
| Search wiring                  | Medium   | Connect search page to `content_nodes.search_vector` full-text search    |
| Bookmarks wiring               | Medium   | Connect bookmark page to `content_bookmarks` table with server actions   |
| Read history tracking          | Medium   | Call `upsert` on `content_read_history` when user opens a content node   |
| Reading session (resume)       | Low      | Save scroll position to `reading_sessions`, restore on return            |
| Sidebar navigation within book | Low      | Prev/next chapter links, table of contents sidebar                       |
| MarkdownContent component      | Low      | Replace raw HTML rendering with proper `react-markdown` + remark/rehype  |

---

## 5. Phase 2 -- Cadence Bar (Week 5)

The Cadence Bar is the core UX innovation that surfaces relevant content from all 4 pillars based on what the user is currently doing in the product.

### 5.1 Cadence Bar Component

**Status: DONE**

| Component             | File                                                         |
| --------------------- | ------------------------------------------------------------ |
| `KnowledgeCadenceBar` | `src/components/knowledge-cadence/knowledge-cadence-bar.tsx` |

### 5.2 Integration Status

| Integration Point              | Status   | File                                                  |
| ------------------------------ | -------- | ----------------------------------------------------- |
| StepView (project step detail) | **TODO** | `src/app/(app)/projects/[projectId]/steps/page.tsx`   |
| Form pages (18 PIPS forms)     | **TODO** | `src/app/(app)/projects/[projectId]/forms/*/page.tsx` |
| Ticket detail page             | **TODO** | `src/app/(app)/tickets/[ticketId]/page.tsx`           |
| Dashboard                      | **TODO** | `src/app/(app)/dashboard/page.tsx`                    |

### 5.3 How It Works

1. The current page declares a `ProductContext` (step number, form type, tool, etc.)
2. `buildProductContext()` from `content-taxonomy.ts` creates the context object
3. `matchContentNodes()` finds all content nodes matching any dimension of the context
4. `groupByPillar()` selects the best match per pillar (book, guide, workbook, workshop)
5. The Cadence Bar renders 4 linked cards -- one per pillar -- with title, summary, and "Read" link

### 5.4 Remaining Cadence Bar Work (TODO)

| Item                                     | Priority    | Description                                                  |
| ---------------------------------------- | ----------- | ------------------------------------------------------------ |
| Pass `ProductContext` from StepView      | High        | Add Cadence Bar below step objectives, pass step number      |
| Pass `ProductContext` from form pages    | High        | Add Cadence Bar above/below form, pass step + form type      |
| Pass `ProductContext` from ticket detail | Medium      | If ticket is linked to a PIPS project step, show Cadence Bar |
| Pass `ProductContext` from dashboard     | Low         | Show general "overview" content links on dashboard           |
| Content must exist in DB                 | **Blocker** | Cadence Bar shows nothing until `content_nodes` is seeded    |
| Loading skeleton                         | Low         | Show skeleton while content query runs                       |

---

## 6. Phase 3 -- Training Mode (Weeks 6-7)

Training Mode provides guided learning paths for new PIPS practitioners. Users work through modules, complete exercises, and track their progress.

### 6.1 Training Routes

**Status: DONE (scaffolded)**

| Route                       | File                                              | Description                 |
| --------------------------- | ------------------------------------------------- | --------------------------- |
| `/training`                 | `src/app/(app)/training/page.tsx`                 | Training landing page       |
| `/training/path/[pathSlug]` | `src/app/(app)/training/path/[pathSlug]/page.tsx` | Learning path detail        |
| `/training/progress`        | `src/app/(app)/training/progress/page.tsx`        | User progress dashboard     |
| `/training/actions.ts`      | `src/app/(app)/training/actions.ts`               | Server actions for training |

**Routes NOT yet created:**

- `/training/practice/[scenarioSlug]` -- directory exists (`src/app/(app)/training/practice/[scenarioSlug]/`) but no page file

### 6.2 Training Components

**Status: DONE**

| Component              | File                                                 |
| ---------------------- | ---------------------------------------------------- |
| `TrainingLanding`      | `src/components/training/training-landing.tsx`       |
| `TrainingProgressRing` | `src/components/training/training-progress-ring.tsx` |

### 6.3 Database Tables

**Status: DONE** (in Knowledge Hub migration)

- `training_paths` -- path catalog
- `training_modules` -- module catalog with `content_node_ids` links
- `training_exercises` -- exercise definitions (fill-form, multiple-choice, scenario-practice, reflection)
- `training_progress` -- user progress per module (RLS)
- `training_exercise_data` -- user exercise attempts and scores (RLS)

### 6.4 Remaining Training Work (TODO)

| Item                                  | Priority | Description                                                                                        |
| ------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| Seed training paths                   | High     | Create 3-4 training paths (Beginner, Facilitator, Leader, Quick Start)                             |
| Seed training modules                 | High     | 5-8 modules per path, linked to content_node_ids                                                   |
| Seed training exercises               | High     | Exercises per module -- mix of types                                                               |
| Practice scenario page                | High     | Create `training/practice/[scenarioSlug]/page.tsx` with sandbox project                            |
| Sandbox project creation              | Medium   | Create isolated "training" project that does not appear in org project list                        |
| Exercise reuse with `mode='training'` | Medium   | Existing PIPS form components accept `mode` prop; training mode disables auto-save to real project |
| Module completion flow                | Medium   | Mark module complete when all exercises done; update `training_progress`                           |
| Path progress calculation             | Medium   | Aggregate module progress into path-level percentage                                               |
| Training certificate                  | Low      | Generate PDF certificate on path completion                                                        |
| Leaderboard                           | Low      | Show org-wide training completion stats                                                            |

---

## 7. Phase 4 -- Marketing Content (Week 8)

Public-facing content pages that drive SEO traffic and demonstrate the PIPS methodology to visitors who have not signed up yet.

### 7.1 Marketing Methodology Pages

**Status: DONE (scaffolded)**

| Route                            | File                                                         | Description          |
| -------------------------------- | ------------------------------------------------------------ | -------------------- |
| `/methodology`                   | `src/app/(marketing)/methodology/page.tsx`                   | Methodology overview |
| `/methodology/step/[stepNumber]` | `src/app/(marketing)/methodology/step/[stepNumber]/page.tsx` | Individual step page |
| `/methodology/tools/[toolSlug]`  | `src/app/(marketing)/methodology/tools/[toolSlug]/page.tsx`  | Tool detail page     |

### 7.2 Book Preview Pages

**Status: DONE (scaffolded)**

| Route                 | File                                      | Description                                 |
| --------------------- | ----------------------------------------- | ------------------------------------------- |
| `/book`               | `src/app/(marketing)/book/page.tsx`       | Book landing page                           |
| `/book/[chapterSlug]` | `src/app/(marketing)/book/[chapterSlug]/` | Chapter preview (directory exists, no page) |

### 7.3 Resource Pages

**Status: Directories exist, no page files**

| Route                        | Directory Exists | Page File |
| ---------------------------- | ---------------- | --------- |
| `/resources`                 | Yes              | No        |
| `/resources/glossary`        | Yes              | No        |
| `/resources/glossary/[term]` | Yes              | No        |
| `/resources/templates`       | Yes              | No        |

### 7.4 Remaining Marketing Work (TODO)

| Item                       | Priority | Description                                                                                 |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| Methodology step content   | High     | Write/compile content for 6 methodology step pages                                          |
| Tool detail content        | High     | Write/compile content for 22+ tool pages                                                    |
| Book chapter preview pages | Medium   | Create `book/[chapterSlug]/page.tsx` with first few paragraphs + "Sign up to read more" CTA |
| Resources glossary         | Medium   | Create glossary pages with PIPS terminology definitions                                     |
| Resources templates        | Medium   | Create template download pages (PDF/Excel versions of PIPS forms)                           |
| SEO metadata               | Medium   | Structured data (JSON-LD), canonical URLs, sitemap.xml                                      |
| Open Graph images          | Low      | Auto-generate OG images for methodology/tool pages                                          |
| Blog section               | Low      | `/blog` with markdown-based posts (future phase)                                            |

---

## 8. Phase 5 -- Workshop Facilitation (Week 9)

Real-time workshop facilitation features that allow a facilitator to lead a team through PIPS exercises in a live session.

### 8.1 Database Table

**Status: DONE** (in Knowledge Hub migration)

- `workshop_sessions` -- Org-scoped RLS, tracks facilitator, current module, timer state (JSONB), participant count, status (draft/active/paused/completed)

### 8.2 Remaining Workshop Work (TODO)

| Item                      | Priority | Description                                                                                  |
| ------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| Workshop session CRUD     | High     | Server actions: create, start, pause, resume, complete session                               |
| Facilitator controls page | High     | `/knowledge/workshop/[sessionId]` -- timer, module navigator, participant view               |
| Timer component           | High     | Countdown/count-up timer with start/pause/reset, synced via Supabase Realtime                |
| Presentation mode         | Medium   | Full-screen view optimized for projection (large text, minimal chrome)                       |
| Participant view          | Medium   | Read-only view for participants following along                                              |
| Shared state via Realtime | Medium   | Supabase Realtime broadcast for timer sync, module advance, facilitator actions              |
| Workshop templates        | Medium   | Pre-built workshop agendas (e.g., "2-Hour Problem Solving Sprint", "Full-Day PIPS Training") |
| Session recording         | Low      | Save session timeline to JSONB for post-workshop review                                      |
| Facilitator notes         | Low      | Private notes visible only to facilitator during session                                     |

---

## 9. Phase 6 -- Polish (Week 10)

Final quality pass before declaring post-MVP feature-complete.

### 9.1 Remaining Polish Work (TODO)

| Item                                               | Priority | Category      |
| -------------------------------------------------- | -------- | ------------- |
| Session persistence (reading position)             | Medium   | UX            |
| Mobile responsive audit for Knowledge Hub pages    | Medium   | UX            |
| Mobile responsive audit for Training pages         | Medium   | UX            |
| Keyboard navigation for Cadence Bar                | Medium   | Accessibility |
| ARIA labels for Knowledge Hub components           | Medium   | Accessibility |
| Screen reader testing                              | Low      | Accessibility |
| `react-markdown` replacement for `MarkdownContent` | Medium   | Performance   |
| Code splitting for Knowledge Hub (dynamic imports) | Medium   | Performance   |
| Content node caching (SWR or React cache)          | Medium   | Performance   |
| Image optimization for content images              | Low      | Performance   |
| Full E2E test coverage for Knowledge Hub           | High     | Quality       |
| Full E2E test coverage for Training Mode           | High     | Quality       |
| E2E tests for Cadence Bar integration              | Medium   | Quality       |
| Lighthouse audit (Core Web Vitals)                 | Medium   | Quality       |
| Fix E2E selector issues from post-MVP run          | High     | Quality       |

---

## 10. Agent Coordination Plan

### 10.1 Parallel Work Opportunities

The following items can be developed by independent agents simultaneously because they touch different file trees:

**Wave A (can all run in parallel):**

| Agent                                  | Scope                            | File Ownership                                           |
| -------------------------------------- | -------------------------------- | -------------------------------------------------------- |
| Agent A1: Stabilization S-01/S-02      | RLS + Profile fixes              | `lib/supabase/`, `stores/`, `hooks/`, migrations         |
| Agent A2: Stabilization S-03/S-04      | Project detail + Ticket redirect | `projects/[projectId]/`, `tickets/actions.ts`            |
| Agent A3: Stabilization S-05           | Hydration fixes                  | `layout.tsx`, date-related components                    |
| Agent A4: Stabilization S-06/S-07/S-08 | Audit log + Profile + Toasts     | `settings/audit-log/`, `profile/`, various actions       |
| Agent A5: Stabilization S-09/S-10/S-11 | Landing + 404 + Validation       | `components/landing/`, `not-found.tsx`, `validations.ts` |

**Wave B (after Stabilization and after migration applied):**

| Agent                               | Scope                      | File Ownership                                                      |
| ----------------------------------- | -------------------------- | ------------------------------------------------------------------- |
| Agent B1: Content compiler + seeder | Run scripts, verify data   | `scripts/`, no app code changes                                     |
| Agent B2: Guide step/tool pages     | Fill in missing sub-routes | `knowledge/guide/step/`, `knowledge/guide/tools/`                   |
| Agent B3: Workbook wiring           | Wire workbook pages to DB  | `knowledge/workbook/`                                               |
| Agent B4: Search + Bookmarks wiring | Connect to DB tables       | `knowledge/search/`, `knowledge/bookmarks/`, `knowledge/actions.ts` |

**Wave C (after Wave B, content must exist in DB):**

| Agent                                | Scope                                    | File Ownership                                                            |
| ------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------- |
| Agent C1: Cadence Bar integration    | Add to StepView + forms                  | `projects/[projectId]/steps/`, `projects/[projectId]/forms/`              |
| Agent C2: Training seed data + pages | Seed paths/modules/exercises, wire pages | `training/`, `scripts/`                                                   |
| Agent C3: Marketing content pages    | Methodology + book + resources           | `(marketing)/methodology/`, `(marketing)/book/`, `(marketing)/resources/` |

**Wave D (after Wave C):**

| Agent                                 | Scope                              | File Ownership                                      |
| ------------------------------------- | ---------------------------------- | --------------------------------------------------- |
| Agent D1: Workshop facilitation       | Session CRUD, timer, Realtime      | `knowledge/workshop/`, new components               |
| Agent D2: Training practice scenarios | Sandbox projects, exercise reuse   | `training/practice/`, form components (`mode` prop) |
| Agent D3: E2E test expansion          | Knowledge Hub + Training E2E specs | `tests/e2e/`                                        |

### 10.2 File Ownership Matrix (Post-MVP)

| Directory                                 | Owner                                 | Notes                                   |
| ----------------------------------------- | ------------------------------------- | --------------------------------------- |
| `packages/shared/src/content-taxonomy.ts` | Sequential only                       | Shared types -- one agent at a time     |
| `scripts/`                                | B1 only                               | Content pipeline scripts                |
| `supabase/migrations/`                    | Sequential only                       | Migration timestamp conflicts otherwise |
| `src/app/(app)/knowledge/`                | B2, B3, B4 (non-overlapping sub-dirs) | Each agent owns specific sub-routes     |
| `src/app/(app)/training/`                 | C2                                    | Single owner                            |
| `src/app/(marketing)/`                    | C3                                    | Single owner                            |
| `src/components/knowledge/`               | B2, B4 (by component)                 | Content reader (B2), bookmarks (B4)     |
| `src/components/knowledge-cadence/`       | C1                                    | Cadence Bar integration                 |
| `src/components/training/`                | C2                                    | Training components                     |
| `src/components/pips/form-shell.tsx`      | C1 (Cadence Bar), D2 (mode prop)      | **Sequential** -- C1 first, then D2     |
| `tests/e2e/`                              | D3                                    | E2E test agent                          |

### 10.3 Shared File Conflicts to Watch

These files are touched by multiple phases and require sequential work or careful merging:

| File                                      | Phases                         | Mitigation                                              |
| ----------------------------------------- | ------------------------------ | ------------------------------------------------------- |
| `packages/shared/src/content-taxonomy.ts` | 2, 3, 5                        | Additions only (new types); merge-friendly              |
| `src/components/pips/form-shell.tsx`      | 2 (Cadence Bar), 3 (mode prop) | Phase 2 adds Cadence Bar slot; Phase 3 adds mode prop   |
| `src/app/(app)/layout.tsx`                | 1.5, 2                         | Stabilization fixes first; then Knowledge Hub nav links |
| `src/components/layout/sidebar.tsx`       | 2                              | Add Knowledge Hub + Training nav items                  |
| `supabase/migrations/`                    | All phases                     | Use 10-minute timestamp gaps between agents             |

---

## 11. Dependencies and Critical Path

```
Phase 1.5 (Stabilization)
   |
   v
Apply Knowledge Hub migration to production
   |
   v
Run content compiler (scripts/compile-content.ts)
   |
   v
Run content seeder (scripts/seed-content.ts)
   |
   +----> Phase 2: Reading Experience (Weeks 3-4)
   |         |
   |         v
   |      Phase 2: Cadence Bar (Week 5)
   |         |
   |         +----> Phase 3: Training Mode (Weeks 6-7)
   |         |         |
   |         |         v
   |         |      Phase 5: Workshop Facilitation (Week 9)
   |         |
   |         +----> Phase 4: Marketing Content (Week 8) [parallel with Phase 3]
   |
   v
Phase 6: Polish (Week 10)
```

### Critical Path Bottlenecks

| Bottleneck                                                         | Why                                                                                                   | Mitigation                                                  |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Content compiler must run before Reading Experience**            | Cadence Bar, search, book reader, and guide pages all query `content_nodes` -- empty table = empty UI | Run compiler + seeder as first action after migration       |
| **Stabilization must precede all feature work**                    | Users cannot test new features if core flows are broken                                               | Dedicated 3-5 day stabilization sprint with no feature work |
| **Migration must be applied before any Knowledge Hub work**        | All 10 new tables depend on the migration                                                             | Apply as part of Phase 2 Week 1, day 1                      |
| **FormShell changes are sequential**                               | Cadence Bar slot (Phase 2) and mode prop (Phase 3) both modify FormShell                              | Phase 2 merges first; Phase 3 starts from updated main      |
| **Training seed data must exist before Training UI can be tested** | Training pages query `training_paths`, `training_modules`, `training_exercises`                       | Seed data script runs before UI agents start                |

### Dependencies Graph (Simplified)

| Depends On         | Item                                                     |
| ------------------ | -------------------------------------------------------- |
| Nothing            | Phase 1.5 Stabilization                                  |
| Phase 1.5          | Apply migration, run compiler/seeder                     |
| Migration applied  | Knowledge Hub routes wiring (Phase 2)                    |
| Content seeded     | Cadence Bar integration, Search wiring, Book reader      |
| Cadence Bar done   | Cadence Bar in forms (Phase 2), Cadence Bar on dashboard |
| Content seeded     | Training seed data (Phase 3)                             |
| Training seed data | Training UI pages (Phase 3)                              |
| Training UI done   | Practice scenarios, exercise reuse                       |
| Content seeded     | Marketing methodology pages (Phase 4)                    |
| Migration applied  | Workshop facilitation (Phase 5)                          |
| All features done  | Polish pass (Phase 6)                                    |

---

## 12. Quality Gates

Every phase boundary requires ALL of the following gates to pass before moving to the next phase.

### Gate Checklist

```bash
# 1. Type safety
pnpm typecheck     # tsc --noEmit — must be 0 errors

# 2. Lint
pnpm lint          # ESLint — must be 0 errors (warnings acceptable)

# 3. Unit tests
pnpm test          # Vitest — all tests must pass (currently 832)

# 4. E2E tests (if UI changes)
pnpm exec playwright test   # All specs must pass

# 5. Build
pnpm build         # Next.js production build must succeed
```

### Phase-Specific Gates

| Phase             | Additional Gate                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------- |
| 1.5 Stabilization | Manual smoke test of all 11 bug fixes on production                                           |
| 2 Foundation      | Content compiler produces valid JSON; seeder inserts rows; full-text search returns results   |
| 2 Reading         | Book chapter renders markdown correctly; search returns ranked results; bookmark CRUD works   |
| 2 Cadence Bar     | Cadence Bar shows content on at least 2 integration points (StepView + 1 form)                |
| 3 Training        | At least 1 training path completable end-to-end; progress persists across sessions            |
| 4 Marketing       | All methodology pages render without errors; SEO metadata present; no broken links            |
| 5 Workshop        | Timer starts/pauses/resets; Realtime sync between facilitator and participant views           |
| 6 Polish          | Lighthouse Performance > 80; zero hydration errors; E2E coverage for Knowledge Hub + Training |

### Test Count Targets

| Phase           | Target Unit Tests                        | Target E2E Tests                 |
| --------------- | ---------------------------------------- | -------------------------------- |
| After Phase 1.5 | 832+ (fix broken tests, no new features) | 160+ (fix failing E2E selectors) |
| After Phase 2   | 900+                                     | 180+                             |
| After Phase 3   | 960+                                     | 200+                             |
| After Phase 4   | 980+                                     | 210+                             |
| After Phase 5   | 1,000+                                   | 220+                             |
| After Phase 6   | 1,050+                                   | 250+                             |

---

## Appendix A: Existing File Inventory (Post-MVP Features)

Files already created for post-MVP phases. These exist on disk but many are scaffolds that need wiring to the database.

### Knowledge Hub

| File                                                          | Type           | Status                        |
| ------------------------------------------------------------- | -------------- | ----------------------------- |
| `packages/shared/src/content-taxonomy.ts`                     | Types + logic  | Complete (419 lines)          |
| `supabase/migrations/20260304000000_knowledge_hub_tables.sql` | Migration      | Complete, not applied to prod |
| `scripts/compile-content.ts`                                  | Build script   | Complete                      |
| `scripts/seed-content.ts`                                     | Seed script    | Complete                      |
| `src/app/(app)/knowledge/page.tsx`                            | Route          | Scaffolded                    |
| `src/app/(app)/knowledge/actions.ts`                          | Server actions | Scaffolded                    |
| `src/app/(app)/knowledge/book/page.tsx`                       | Route          | Scaffolded                    |
| `src/app/(app)/knowledge/book/[chapterSlug]/page.tsx`         | Route          | Scaffolded                    |
| `src/app/(app)/knowledge/guide/page.tsx`                      | Route          | Scaffolded                    |
| `src/app/(app)/knowledge/workbook/page.tsx`                   | Route          | Scaffolded                    |
| `src/app/(app)/knowledge/workshop/page.tsx`                   | Route          | Scaffolded                    |
| `src/app/(app)/knowledge/bookmarks/page.tsx`                  | Route          | Scaffolded                    |
| `src/app/(app)/knowledge/search/page.tsx`                     | Route          | Scaffolded                    |
| `src/components/knowledge/content-reader.tsx`                 | Component      | Built                         |
| `src/components/knowledge/knowledge-hub-landing.tsx`          | Component      | Built                         |
| `src/components/knowledge/bookmark-button.tsx`                | Component      | Built                         |
| `src/components/knowledge-cadence/knowledge-cadence-bar.tsx`  | Component      | Built                         |

### Training

| File                                                 | Type           | Status     |
| ---------------------------------------------------- | -------------- | ---------- |
| `src/app/(app)/training/page.tsx`                    | Route          | Scaffolded |
| `src/app/(app)/training/actions.ts`                  | Server actions | Scaffolded |
| `src/app/(app)/training/path/[pathSlug]/page.tsx`    | Route          | Scaffolded |
| `src/app/(app)/training/progress/page.tsx`           | Route          | Scaffolded |
| `src/components/training/training-landing.tsx`       | Component      | Built      |
| `src/components/training/training-progress-ring.tsx` | Component      | Built      |

### Marketing

| File                                                         | Type  | Status     |
| ------------------------------------------------------------ | ----- | ---------- |
| `src/app/(marketing)/methodology/page.tsx`                   | Route | Scaffolded |
| `src/app/(marketing)/methodology/step/[stepNumber]/page.tsx` | Route | Scaffolded |
| `src/app/(marketing)/methodology/tools/[toolSlug]/page.tsx`  | Route | Scaffolded |
| `src/app/(marketing)/book/page.tsx`                          | Route | Scaffolded |

---

## Appendix B: Key Decisions Log

| Decision                          | Choice                                             | Rationale                                                                    | Date       |
| --------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------- | ---------- |
| Content pillar model              | 4 pillars (Book, Guide, Workbook, Workshop)        | Maps to existing content assets; each pillar serves different learning style | 2026-03-03 |
| Cadence Bar as UX pattern         | Context-aware content surfacing                    | Unique differentiator -- "the methodology follows you"                       | 2026-03-03 |
| Training mode reuses PIPS forms   | `mode='training'` prop on existing form components | Avoid duplicating 18 form components; single codebase                        | 2026-03-03 |
| Workshop uses Supabase Realtime   | Broadcast channel for timer/state sync             | Already on Supabase; no additional service needed                            | 2026-03-03 |
| Content nodes are global (no RLS) | Public catalog, user data is RLS-scoped            | Content same for everyone; bookmarks/progress are per-user                   | 2026-03-03 |
| Full-text search via tsvector     | Postgres native, no external search service        | Keeps architecture simple; Supabase supports it natively                     | 2026-03-03 |
| DB column is `title` not `name`   | DB uses `title`; frontend maps `name` to `title`   | Already established in MVP; documented in CLAUDE.md Section 7                | 2026-03-03 |

---

_This document was created on March 3, 2026. Update it as phases complete._
