# PIPS 2.0 Product Roadmap

> Version: 1.2
> Author: Marc Albers
> Created: 2026-03-02
> Status: Active — All feature phases COMPLETE, Polish ~90%
> Last Updated: March 9, 2026 (Docs Agent — phase statuses updated to reflect overnight session completions)

---

## Current Phase Summary

> **Phase 0 (Foundation):** COMPLETE
> **Phase 1 (MVP):** COMPLETE — Live at pips-app.vercel.app
> **Phase 1.5 (Post-MVP Stabilization):** COMPLETE — All bugs fixed, all features wired
> **Post-MVP Phases (Dev Task List 1.5-5):** ALL COMPLETE — Knowledge Hub, Training, Workshop, Marketing all shipped
> **Phase 6 (Polish & Quality):** ~90% COMPLETE — mobile, accessibility, performance, data-testid done; E2E specs + analytics remaining
> **Original Roadmap Phase 2-6:** Updated timelines below — several phases were completed far ahead of schedule
>
> **What shipped ahead of schedule (in MVP instead of Phase 2+):**
>
> - Kanban board (was Phase 2, shipped in MVP)
> - Parent/child tickets (was Phase 2, shipped in MVP)
> - Search & command palette (was Phase 2, shipped in MVP)
> - In-app notifications (was Phase 2, shipped in MVP)
> - Dark mode (was Phase 2, shipped in MVP)
> - Audit logging (was Phase 5, shipped in MVP)
> - CSV/PDF export (was Phase 3, shipped in MVP)
> - 83+ SEO marketing pages (not in original roadmap)
> - Knowledge Hub foundation with 205 content nodes (not in original roadmap)
> - Training Mode (4 paths, 27 modules, 59 exercises) (not in original roadmap)
> - Workshop facilitation (session CRUD, timer, Realtime, templates) (not in original roadmap)
> - Interactive guide overhaul (9 components, 4 new pages) (not in original roadmap)
> - Sprint 0 production hardening (security headers, rate limiting) (not in original roadmap)
> - 2,199+ unit tests across 196 files (far exceeding any target)

---

## Table of Contents

1. [Product Vision & North Star](#1-product-vision--north-star)
2. [Phase 0: Foundation — COMPLETE](#2-phase-0-foundation-weeks-1-4)
3. [Phase 1: MVP — COMPLETE](#3-phase-1-mvp--core-pips-workflow-weeks-5-12)
4. [Phase 1.5: Post-MVP Stabilization — IN PROGRESS](#4-phase-15-post-mvp-stabilization)
5. [Phase 2: Knowledge Hub & Training Completion](#5-phase-2-knowledge-hub--training-completion)
6. [Phase 3: Workshop, Billing & Polish](#6-phase-3-workshop-billing--polish)
7. [Phase 4: Integrations & API](#7-phase-4-integrations--api)
8. [Phase 5: White-Label & Enterprise](#8-phase-5-white-label--enterprise)
9. [Phase 6: AI & Advanced Features](#9-phase-6-ai--advanced-features)
10. [Future Roadmap (Year 2+)](#10-future-roadmap-year-2)
11. [Risk Register](#11-risk-register)
12. [Success Criteria Per Phase](#12-success-criteria-per-phase)
13. [Dependencies & Critical Path](#13-dependencies--critical-path)

---

## 1. Product Vision & North Star

### What PIPS 2.0 Will Become

PIPS 2.0 is enterprise-grade project management software with a structured problem-solving methodology baked into every workflow. Unlike generic ticketing systems (Jira, Asana, Monday.com) that organize tasks without guiding _how_ to solve problems, and unlike pure strategy-execution platforms (Rhythm Systems, Cascade) that focus on top-down goal tracking, PIPS 2.0 occupies a unique position: **a methodology-embedded work management platform that teaches organizations how to identify, analyze, solve, and measure problems -- while simultaneously managing all the project work that results from that process.**

The end state is a multi-tenant SaaS platform where any organization can:

- Run structured PIPS improvement projects with guided 6-step workflows
- Manage general project work and tasks in a full-featured ticketing system
- Integrate with their existing tools (Jira, Azure DevOps, AHA!)
- White-label the entire platform under their own brand
- Leverage AI to accelerate every step of the problem-solving process
- Measure improvement outcomes with analytics that prove ROI

### The Key Insight

Every project management tool asks "what needs to be done?" PIPS 2.0 asks "what problem are we solving, and are we solving it correctly?" This is the difference between task management and outcome management. The methodology is not a bolt-on -- it is the architecture. Every ticket, every workflow, every dashboard view connects back to the 6-step cycle: Identify, Analyze, Generate, Select & Plan, Implement, Evaluate.

This distinction matters because:

- **Generic PM tools** have commoditized task tracking. Competing on features alone is a losing game.
- **Strategy-execution tools** (like Rhythm Systems) charge premium prices ($50K+/year) because they sell methodology + software + coaching. PIPS 2.0 delivers comparable methodology embedding at a fraction of the price, without requiring expensive consulting engagements.
- **The feedback loop is the moat.** Step 6 (Evaluate) feeds back into Step 1 (Identify), creating a continuous improvement cycle that compounds organizational capability over time. No generic PM tool has this built in.

### North Star Metric

**Monthly Active PIPS Projects (MAPP):** The number of PIPS improvement projects that have at least one team member actively working through a step in the past 30 days. This metric captures:

- User engagement (people are logging in and doing work)
- Methodology adoption (they are using the 6-step process, not just creating generic tickets)
- Team collaboration (improvement projects are inherently multi-person)
- Retention signal (active projects mean ongoing subscriptions)

Supporting metrics:

- **Cycle Completion Rate:** % of PIPS projects that reach Step 6 (Evaluate). Target: >60%.
- **Time to First Value:** Days from account creation to first PIPS project reaching Step 3 (Generate). Target: <7 days.
- **Net Revenue Retention:** Monthly recurring revenue retained including expansion. Target: >110%.

---

## 2. Phase 0: Foundation (Weeks 1-4) — COMPLETE

> **Status: COMPLETE** — All exit criteria met. Infrastructure operational.

### Goal

Establish the technical foundation, design system, authentication layer, and multi-tenant database architecture. Nothing user-facing ships in this phase, but everything built here is load-bearing for every phase that follows.

### Scope -- What's IN

#### Week 1: Project Setup & Infrastructure

- Initialize Next.js 15 project with TypeScript strict mode
- Configure path aliases (`@/*` for `src/*`)
- Set up Supabase project (database, auth, storage)
- Configure Vercel deployment pipeline (preview + production)
- Set up GitHub repository with branch protection rules
- Configure ESLint, Prettier, and Husky pre-commit hooks
- Set up Vitest for unit testing, Playwright for E2E testing
- Create CI/CD pipeline: lint, type-check, test, build on every PR
- Environment management: `.env.local`, `.env.staging`, `.env.production`

#### Week 2: Design System & Component Library

- Define design tokens: colors (including PIPS 6-step color coding), typography, spacing, shadows, border-radius
- Build base component library with the following primitives:
  - Button (primary, secondary, ghost, danger; sizes: sm, md, lg)
  - Input, Textarea, Select, Checkbox, Radio
  - Card, Modal, Drawer, Tooltip, Popover
  - Avatar, Badge, Tag/Chip
  - Table (sortable, paginated)
  - Tabs, Accordion
  - Toast/notification system
  - Loading states (skeleton, spinner)
  - Empty state pattern
- Implement responsive layout system (sidebar + main content)
- Set up Storybook for component documentation
- Establish white-label token architecture (CSS custom properties driven by tenant config)
- PIPS step color system: Step 1 through Step 6 each get a primary and accent color, consistent across all UI

#### Week 3: Authentication & Multi-Tenancy

- Supabase Auth configuration (email/password, magic link)
- Organization (tenant) model: `organizations` table with `id`, `name`, `slug`, `branding` (JSON), `plan`, `created_at`
- User-to-organization mapping: `organization_members` table with roles (owner, admin, member, viewer)
- Supabase Row Level Security (RLS) policies enforcing tenant isolation on all tables
- Sign up flow: create account, create or join organization
- Sign in flow: email/password, magic link
- Session management and token refresh
- Protected route middleware (Next.js middleware checking auth state)
- Organization context provider (React context providing current org to all components)

#### Week 4: Database Schema & Core Data Model

- Design and implement core schema:
  - `organizations` -- tenant container
  - `users` -- Supabase auth users extended with profile data
  - `organization_members` -- user-org junction with role
  - `teams` -- groups within an organization
  - `team_members` -- user-team junction
  - `projects` -- PIPS improvement projects
  - `project_members` -- user-project junction with PIPS role
  - `tickets` -- the core work item (both PIPS-linked and general)
  - `comments` -- threaded comments on tickets
  - `activity_log` -- audit trail of all state changes
  - `forms` -- PIPS form submissions (JSON data keyed by form template ID)
  - `attachments` -- file metadata (files in Supabase Storage)
- Write RLS policies for every table (tenant isolation is non-negotiable)
- Create database migration system (Supabase CLI migrations)
- Seed data script for development (sample org, users, project)
- Write integration tests validating RLS policies work correctly

### Scope -- What's OUT

- No user-facing UI beyond auth flows
- No PIPS workflow logic
- No ticketing
- No analytics
- No API layer
- No SSO/SAML (Phase 5)

### Estimated Effort

- Solo developer: 4 weeks full-time (~160 hours)
- With AI agent assistance: 3-4 weeks (agents can scaffold components, write RLS policies, generate seed data)

### Key User Stories

1. **As a developer**, I can run `npm run dev` and have a working local environment with hot reload, type checking, and test runner in under 2 minutes.
2. **As a new user**, I can sign up with email/password, create an organization, and land on an empty dashboard.
3. **As an org owner**, I can invite another user by email, and they join my organization upon accepting.
4. **As a developer**, I can verify via automated tests that User A in Org 1 cannot read or write any data belonging to Org 2.
5. **As a developer**, I can view all UI components in Storybook with their variants and states documented.

### Exit Criteria / Definition of Done

- [x] `tsc --noEmit` passes with zero errors
- [x] All component library primitives render in Storybook with at least 2 variants each
- [x] Auth flows work end-to-end: sign up, sign in, sign out, magic link
- [x] Multi-tenancy RLS tests pass: 100% tenant isolation verified
- [x] CI/CD pipeline runs on every PR: lint + type-check + test + build
- [x] Preview deployments work on Vercel for every PR
- [x] Database schema documented with an ERD diagram
- [x] Seed script creates a usable development dataset
- [x] Lighthouse score >90 on the empty dashboard page (performance baseline)

### Risks Specific to This Phase

| Risk                                                                  | Likelihood | Impact   | Mitigation                                                                |
| --------------------------------------------------------------------- | ---------- | -------- | ------------------------------------------------------------------------- |
| RLS policy gaps allowing cross-tenant data leakage                    | Medium     | Critical | Write explicit integration tests for every table; test with multiple orgs |
| Over-engineering the component library                                | High       | Medium   | Limit to primitives actually needed in Phase 1; add more as needed        |
| Supabase Auth edge cases (token refresh, session expiry)              | Medium     | Medium   | Follow Supabase SSR auth guide exactly; test session edge cases           |
| Design system decisions that don't survive contact with real features | Medium     | Low      | Keep tokens abstract; build with flexibility in mind                      |

---

## 3. Phase 1: MVP -- Core PIPS Workflow (Weeks 5-12) — COMPLETE

> **Status: COMPLETE** — MVP live at pips-app.vercel.app since March 3, 2026.
> 878 unit tests, 160 E2E tests, 0 type errors. 18 of 26 forms built. Full 6-step workflow operational.
> Several Phase 2 features (Kanban, parent/child tickets, notifications, search, dark mode, audit log, CSV/PDF export) were pulled forward and shipped with MVP.

### Goal

Deliver the minimum viable product: users can create a PIPS improvement project, work through all 6 steps with digital forms, manage a team, create and track basic tickets, and see their work on a dashboard. This is the phase where PIPS 2.0 becomes a real product that people can use.

### Scope -- What's IN

#### Weeks 5-6: PIPS Project Creation & Step 1 (Identify)

- Project creation wizard:
  - Name, description, target area/department
  - Select team members and assign PIPS roles (Champion, Facilitator, Team Leader, Team Members, Sponsor)
  - Set target dates (optional)
- PIPS project detail page with 6-step progress indicator (visual stepper showing current phase)
- Step 1 (Identify) implementation:
  - Problem statement builder (guided form with "Bad to Good" transformation pattern from existing guide)
  - Impact assessment form (who is affected, frequency, severity, cost)
  - Team formation (assign roles from project members)
  - Digital forms: Problem Statement Template, Impact Assessment, Team Charter
- Step completion logic: mark step as complete, advance to next step, allow revisiting previous steps

#### Weeks 7-8: Steps 2-3 (Analyze & Generate)

- Step 2 (Analyze) implementation:
  - Root cause analysis workspace
  - Digital forms: Fishbone Diagram (interactive), 5-Why Analysis, Force Field Analysis, Data Collection Plan
  - Data attachment support (upload evidence, charts, documents)
  - Summary of findings field
- Step 3 (Generate) implementation:
  - Brainstorming workspace
  - Digital forms: Brainwriting Template, Brainstorming Session Capture, Idea Evaluation Matrix
  - Solution idea cards (title, description, estimated effort, estimated impact)
  - Grouping/categorization of ideas

#### Weeks 9-10: Steps 4-6 (Select & Plan, Implement, Evaluate)

- Step 4 (Select & Plan) implementation:
  - Decision matrix (weighted criteria scoring for candidate solutions)
  - Digital forms: Criteria Rating Matrix, Weighted Voting Sheet, Cost-Benefit Analysis, RACI Chart, Implementation Plan
  - Selected solution summary with rationale
  - Implementation plan with milestones and owners
- Step 5 (Implement) implementation:
  - Milestone tracker (checklist with due dates, owners, status)
  - Digital forms: Implementation Checklist, Progress Report, Risk Log
  - Link to tickets created from this PIPS project
  - Progress percentage based on milestone completion
- Step 6 (Evaluate) implementation:
  - Before/after comparison template
  - Digital forms: Evaluation Report, Lessons Learned, Results Summary
  - Success metrics vs. actuals comparison
  - "Feed back to Step 1" action: create a new PIPS project seeded with lessons learned
  - Project closure summary

#### Weeks 11-12: Dashboard, Team Management & Basic Ticketing

- **Personal dashboard:**
  - My active PIPS projects (card view with step indicator)
  - My assigned tickets (list with status)
  - Recent activity feed (last 20 actions across my projects)
  - Quick actions: create project, create ticket
- **Team management:**
  - Create teams within an organization
  - Add/remove members from teams
  - View team roster with roles
  - Assign teams to projects
- **Basic ticketing:**
  - Create ticket: title, description, type (PIPS-linked or General), priority (Low/Medium/High/Critical), assignee, due date
  - Ticket detail page: description, comments, activity log, status changes
  - Ticket statuses: Open, In Progress, In Review, Done, Closed
  - Link tickets to PIPS projects and specific steps
  - Basic list view with sort by status/priority/date
  - Assign ticket to user or team

### Scope -- What's NOT in MVP

- No Kanban board (Phase 2)
- No parent/child ticket relationships (Phase 2)
- No custom ticket statuses or workflows (Phase 2)
- No bulk operations on tickets (Phase 2)
- No file attachments on tickets (Phase 2 -- forms can have attachments, tickets cannot yet)
- No search or advanced filters (Phase 2)
- No notifications (in-app or email) (Phase 2)
- No analytics or reporting (Phase 3)
- No API for external integrations (Phase 4)
- No white-labeling (Phase 5)
- No AI features (Phase 6)
- No Stripe billing integration (deferred -- use manual onboarding for early customers)

### Estimated Effort

- Solo developer: 8 weeks full-time (~320 hours)
- With AI agent assistance: 6-8 weeks (agents can generate form components from the 26 existing templates, write CRUD operations, scaffold pages)
- Critical path: The PIPS step workflow engine is the most complex piece; budget extra time for Steps 4-6 which have the most form variety

### Key User Stories

1. **As a team leader**, I can create a new PIPS improvement project, name it, describe the problem area, and invite my team so we can start working through the 6-step process.
2. **As a team member**, I can open a PIPS project, see which step we're on, fill out the digital forms for that step, and see the work my teammates have contributed.
3. **As a facilitator**, I can mark a step as complete and advance the project to the next step, knowing that team members can still go back and review or edit previous steps.
4. **As a project member**, I can create tickets for implementation tasks in Step 5, assign them to teammates, and track their status so we know what work remains.
5. **As any user**, I can log in and see my personal dashboard showing all my active projects, assigned tickets, and recent activity across the organization.

### Exit Criteria / Definition of Done

- [x] A user can create a PIPS project and complete all 6 steps end-to-end
- [x] 18 of 26 digital form templates are functional and save data to the database (remaining 8 deferred: Brainwriting, 4 Parking Lot variants, Tools Quick Guide, Meeting Agenda, Survey Builder)
- [x] Step completion percentage is calculated and displayed on project cards
- [x] Tickets can be created, assigned, commented on, and closed (with Kanban board — pulled forward from Phase 2)
- [x] Tickets can be linked to a PIPS project and specific step
- [x] Dashboard shows active projects, assigned tickets, and recent activity
- [x] Teams can be created and assigned to projects
- [x] All features work on mobile viewport (375px+) -- responsive design verified
- [x] Test coverage >70% on core PIPS workflow logic (878 unit tests, 160 E2E tests)
- [x] Performance: page load <2s on 3G connection (Lighthouse)
- [ ] 3 real users (internal or beta testers) have completed a full PIPS project end-to-end — NOT YET (no beta users onboarded)

### Risks Specific to This Phase (Retrospective)

| Risk                                                    | Likelihood | Impact | Outcome                                                                                 |
| ------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------- |
| Form complexity explosion (26 templates is a lot of UI) | High       | High   | MANAGED — Shipped 18 forms, deferred 8 lower-priority ones. No user impact.             |
| Workflow engine over-engineering                        | Medium     | High   | AVOIDED — Kept step progression linear.                                                 |
| Users confused by PIPS methodology                      | Medium     | High   | OPEN — No real users yet. Customer Insights Report identifies this as F3 friction risk. |
| Scope creep from form interactivity                     | High       | Medium | MANAGED — Fishbone built as structured form. Interactive canvas deferred.               |
| Mobile responsiveness of complex forms                  | Medium     | Medium | RESOLVED — Tested, responsive layout works.                                             |

---

## 4. Phase 1.5: Post-MVP Stabilization (Weeks 13-14) — COMPLETE

> **Status: COMPLETE** — All bugs fixed, Knowledge Hub wired, Training wired, Workshop FULLY built, SEO deployed.
> All exit criteria met. Phase completed across sessions on 2026-03-04 through 2026-03-08.

### Goal

Stabilize the MVP, fix production bugs, address the top friction risks from the Customer Insights Report, and complete the scaffolded features (Knowledge Hub reading experience, Training Mode wiring, Workshop UI). This phase bridges MVP to beta launch.

### Scope -- What's IN

#### Bug Fixes & Stabilization

- Fix 5 production bugs identified in post-MVP testing (name-to-title systemic fix, DatePicker, sample project, ticket redirect, audit log)
- Verify all email notification paths (Resend delivery)
- E2E test suite expansion and CI pipeline hardening

#### Adoption Friction Mitigation (from Customer Insights Report)

- Auto-create sample project on new org creation (F7)
- Post-onboarding choice screen: "Explore Sample Project" vs "Create Your First Project" (F2)
- 3-card methodology explainer before Step 1 for new projects (F3)
- "Try PIPS Free" CTA on all marketing pages (F1)
- Mark recommended forms per step with visual badge (F6)
- Auto-expand Cadence Bar on first step visit (F5)
- Beta label on signup and dashboard (F1)

#### Knowledge Hub Completion

- Finish workbook exercise wiring to PIPS forms
- Add contextual "Learn More" links from PIPS forms to Knowledge Hub content
- Reading progress tracking completion

#### Training Mode Wiring

- Wire scaffolded training pages to DB data
- Exercise rendering (fill-in-form, multiple choice, scenario analysis)
- Module completion tracking

#### Workshop UI Scaffolding

- Session creation and management UI
- Facilitator controls (start/pause/end)
- Module catalog display

### Exit Criteria

- [x] All 5 production bugs fixed and verified — committed `85506c3`
- [x] Sample project auto-created for new orgs
- [x] Post-onboarding flow operational
- [x] Email notifications verified for all critical paths
- [x] Training pages wired to DB data and rendering content — 4 paths, 27 modules, 59 exercises
- [x] Knowledge Hub workbook exercises linked to PIPS forms
- [x] Ready for first beta user invitations — pending Marc identifying testers

---

## 5. Phase 2: Ticketing & Project Management (Weeks 15-22) — PARTIALLY COMPLETE

> **Status: PARTIALLY COMPLETE** — Many Phase 2 features shipped with MVP. Remaining items listed below.
>
> **Already shipped (in MVP):**
>
> - Kanban board with drag-and-drop
> - Parent/child ticket relationships
> - Search & filters (full-text, command palette, quick filters)
> - In-app notification system (bell, dropdown, mark-as-read, DB triggers)
> - Email notifications (Resend, invitation flow verified)
> - Ticket comments with @mentions and activity log
> - Tags/labels on tickets
> - Due date management and overdue highlighting
> - Dark mode
> - CSV/PDF export
> - Audit logging
>
> **Remaining (not yet built):**
>
> - Custom ticket statuses and workflows
> - Custom ticket types per org
> - Column WIP limits on Kanban
> - Swimlanes (by assignee, priority, team)
> - Multi-column sorting in list view
> - Inline editing in list view
> - Bulk operations (multi-select status/assignee/priority change)
> - Calendar view
> - Timeline/Gantt view
> - File attachments on tickets
> - Threaded comment replies
> - Rich text editor enhancements (code blocks, bullet lists)
> - Sprint/iteration management
> - MFA (TOTP)

### Goal

Complete the remaining ticketing and project management features that were deferred from MVP. This is where PIPS 2.0 becomes competitive with general-purpose project management tools, while retaining its methodology advantage.

### Scope -- What's IN

#### Weeks 13-14: Advanced Ticket Features

- **Parent/child relationships:**
  - Any ticket can be a parent of child tickets (epics, stories, subtasks pattern)
  - Visual hierarchy in list view (collapsible tree)
  - Progress rollup: parent ticket shows % of children completed
  - Breadcrumb navigation: child -> parent -> grandparent
- **Custom ticket statuses:**
  - Organizations can define their own status columns (e.g., "Awaiting Approval", "Blocked", "QA")
  - Status categories: To Do, In Progress, Done (for reporting purposes, custom statuses map to categories)
  - Configurable workflow transitions (optional: which statuses can transition to which)
- **Ticket types:**
  - PIPS Project Ticket (linked to a step)
  - General Ticket (standalone task)
  - Bug, Feature Request, Improvement (configurable per org)
  - Custom types definable by org admins
- **Priority system:** Critical, High, Medium, Low with color coding and sort weight

#### Weeks 15-16: Views & Navigation

- **Kanban board:**
  - Drag-and-drop cards between status columns
  - Swimlanes by assignee, priority, or team
  - Column WIP limits (optional, configurable)
  - Quick-edit on card: change assignee, priority, due date without opening detail
- **List view enhancements:**
  - Column customization (show/hide fields)
  - Multi-column sorting
  - Inline editing for status, assignee, priority, due date
  - Grouping by status, priority, assignee, team, PIPS step
- **Search & Filters:**
  - Full-text search across ticket title and description
  - Filter by: status, priority, type, assignee, team, PIPS project, PIPS step, date range, tags
  - Save filter presets ("My critical tickets", "Unassigned this sprint")
  - URL-based filters (shareable links)
- **Bulk operations:**
  - Multi-select tickets (checkbox)
  - Bulk change status, assignee, priority
  - Bulk move to a different PIPS project
  - Bulk close/archive

#### Weeks 17-18: Collaboration Features

- **File attachments:**
  - Upload files to tickets (drag-and-drop or file picker)
  - Image preview, PDF preview
  - Supabase Storage backend with per-org storage quotas
  - File size limits: 25MB per file, 1GB per org (configurable per plan)
- **Activity feed & audit trail:**
  - Every state change recorded: status, assignee, priority, description edits, comments, attachments
  - Activity feed on ticket detail page (chronological)
  - Organization-wide activity feed on dashboard
  - Filterable by action type and user
- **Comments enhancements:**
  - Rich text editor (bold, italic, links, code blocks, bullet lists)
  - @mention users (triggers notification)
  - Edit and delete own comments (with "edited" indicator)
  - Threaded replies on comments

#### Weeks 19-20: Notifications & Polish

- **Notification system:**
  - In-app notification center (bell icon with unread count)
  - Notification types: assigned to ticket, mentioned in comment, ticket status changed, PIPS step completed, due date approaching
  - Mark as read/unread, mark all as read
  - Email notifications (Resend integration):
    - Immediate: assigned, mentioned
    - Digest: daily summary of activity on your projects
    - User preference: per-notification-type toggle (in-app, email, both, none)
- **Due date management:**
  - Calendar view showing tickets by due date (month view)
  - Overdue ticket highlighting (red badge on dashboard)
  - Due date reminders (1 day before, day-of)
- **Tags/labels:**
  - Org-definable tags with colors
  - Apply multiple tags per ticket
  - Filter by tags

### Scope -- What's OUT

- No time tracking on tickets (Phase 3 -- Analytics)
- No sprint/iteration management (Future -- if requested by customers)
- No Gantt chart view (Future)
- No automation rules/triggers (Phase 5 -- Enterprise)
- No external API access to tickets (Phase 4)

### Estimated Effort

- Solo developer: 8 weeks full-time (~320 hours)
- With AI agent assistance: 6-8 weeks (Kanban drag-and-drop and rich text editor are the most time-intensive components)

### Key User Stories

1. **As a project manager**, I can view my team's tickets on a Kanban board, drag cards between columns, and immediately see what's blocked and what's in progress.
2. **As a team member**, I can create a parent ticket for a large initiative and break it into child tickets, seeing the rollup progress as children are completed.
3. **As an org admin**, I can define custom ticket statuses and types that match our organization's workflow, so the tool fits how we work instead of forcing us to adapt.
4. **As any user**, I can search across all tickets by keyword, filter by multiple criteria, and save my most-used filter combinations for one-click access.
5. **As a team member**, I receive an in-app notification and email when someone assigns me a ticket or @mentions me in a comment, so I never miss something that needs my attention.

### Exit Criteria / Definition of Done

- [x] Kanban board with drag-and-drop works smoothly (no visual glitches, <100ms response) — SHIPPED IN MVP
- [x] Parent/child ticket hierarchy supports at least 3 levels deep — SHIPPED IN MVP
- [ ] Custom statuses can be created, reordered, and mapped to status categories
- [x] Full-text search returns results in <500ms for organizations with up to 10,000 tickets — SHIPPED IN MVP
- [ ] Bulk operations work on selections of up to 100 tickets
- [ ] File attachments upload, preview, and download correctly
- [x] Notification preferences are respected (in-app and email) — SHIPPED IN MVP
- [x] Email notifications deliver within 60 seconds of the triggering event — SHIPPED IN MVP
- [x] All features work on mobile viewport; Kanban board scrolls horizontally on small screens — SHIPPED IN MVP
- [x] Test coverage >70% on ticketing logic; E2E tests cover critical paths — 878 unit + 160 E2E tests

### Risks Specific to This Phase

| Risk                                                | Likelihood | Impact | Mitigation                                                             |
| --------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------- |
| Kanban drag-and-drop performance with many cards    | Medium     | High   | RESOLVED — Shipped and working                                         |
| Rich text editor complexity and XSS vulnerabilities | Medium     | High   | Use a proven library (Tiptap or Plate); sanitize all HTML server-side  |
| Email deliverability (ending up in spam)            | Medium     | Medium | RESOLVED — Using Resend with good deliverability                       |
| Notification volume overwhelming users              | Low        | Medium | RESOLVED — Granular notification preferences in place                  |
| Custom statuses creating confusing workflows        | Medium     | Medium | Require status-to-category mapping; provide default workflow templates |

---

## 6. Phase 3: Analytics, Billing & Reporting (Weeks 23-30)

> **Status: NOT STARTED** — Depends on Phase 2 completion. Note: basic dashboard analytics and CSV/PDF export already shipped in MVP.
>
> **Change from v1.0:** Billing/Stripe integration moved here from Phase 2 deferral list. This is the phase where revenue begins.

### Goal

Give organizations visibility into their improvement work: how many PIPS projects are active, how long they take, which steps are bottlenecks, and what the outcomes are. Add Stripe billing to enable the transition from free beta to paid customers. This phase also completes the data export capabilities that enterprise customers expect.

### Scope -- What's IN

#### Weeks 21-22: PIPS Analytics Dashboard

- **PIPS project health overview:**
  - Total projects by status: Active, Completed, Stalled (no activity in 14+ days)
  - Projects by current step (funnel visualization: how many at Step 1, 2, 3, etc.)
  - Average cycle time per step (how long teams spend in each step)
  - Overall cycle time: average days from project creation to Step 6 completion
  - Completion rate: % of projects that reach Step 6 vs. abandoned
- **Trend charts:**
  - Projects created per month (line chart)
  - Cycle time trends over time (are we getting faster?)
  - Completion rate trends
- **Bottleneck analysis:**
  - Which step has the longest average duration?
  - Which step has the most stalled projects?
  - Heatmap: step duration by team/department

#### Weeks 23-24: Ticket & Team Metrics

- **Ticket analytics:**
  - Open vs. closed tickets over time
  - Average resolution time by priority
  - Ticket volume by type, status, team
  - Overdue ticket count and aging report
  - Created vs. resolved trend (is the backlog growing?)
- **Team performance:**
  - Tickets completed per team member per week/month
  - Average time to first response on assigned tickets
  - Workload distribution: tickets assigned per person (bar chart)
  - Team velocity: tickets closed per sprint/week
- **IMPORTANT NOTE:** These are team health metrics, not individual performance punishment tools. The UI should frame them as "workload balance" and "where do we need help" rather than leaderboards.

#### Weeks 25-26: Custom Reports & Export

- **Custom report builder:**
  - Select data source: PIPS Projects, Tickets, Teams, Activity
  - Apply filters: date range, team, project, status, priority
  - Select fields/columns to include
  - Choose visualization: table, bar chart, line chart, pie chart
  - Save report for re-running
  - Schedule report to run weekly/monthly (email delivery)
- **Data export:**
  - CSV export: any list view or report can be exported to CSV
  - PDF export: formatted report with charts (use server-side PDF generation)
  - PIPS project summary PDF: full project lifecycle document (all forms, decisions, outcomes)
- **Executive summary view:**
  - Single-page view designed for leadership
  - Key metrics: total projects, completion rate, average cycle time, top 3 bottlenecks
  - Traffic light indicators: green (on track), yellow (watch), red (needs attention)
  - Designed for printing or screen sharing in meetings

### Scope -- What's OUT

- No real-time dashboards with live updating (use manual refresh or 5-minute auto-refresh)
- No predictive analytics or forecasting (Phase 6 -- AI)
- No custom dashboard builder (fixed dashboard layouts in this phase)
- No embedded analytics for white-label customers (Phase 5)

### Estimated Effort

- Solo developer: 6 weeks full-time (~240 hours)
- With AI agent assistance: 5-6 weeks (charting libraries do heavy lifting; PDF generation is the most complex piece)
- Recommendation: Use a charting library like Recharts or Chart.js (not Victory Native -- this is web, not React Native)

### Key User Stories

1. **As an org admin**, I can open the PIPS analytics dashboard and immediately see how many improvement projects are active, which step most projects are stuck on, and whether our cycle time is improving over the last 6 months.
2. **As a team lead**, I can view my team's workload distribution and identify who is overloaded and who has capacity, so I can rebalance assignments.
3. **As a facilitator**, I can generate a PDF summary of a completed PIPS project that includes all forms, decisions, and outcomes, suitable for sharing with leadership or archiving.
4. **As a VP of operations**, I can view a one-page executive summary with traffic-light indicators and the 3 metrics I care about most, without needing to dig through the tool.
5. **As an analyst**, I can build a custom report showing tickets closed per team per month for the last quarter, export it to CSV, and schedule it to run monthly.

### Exit Criteria / Definition of Done

- [ ] PIPS analytics dashboard loads in <3 seconds with up to 500 projects
- [ ] All charts render correctly on mobile and desktop
- [ ] Cycle time calculations are accurate (validated against manual spot-checks)
- [ ] CSV export works for all list views and reports
- [ ] PDF export generates a readable, well-formatted document
- [ ] Executive summary fits on one printed page
- [ ] Custom report builder supports at least 3 data sources and 4 chart types
- [ ] Scheduled reports deliver via email on time
- [ ] No PII is exposed in exported data that the user shouldn't have access to (RLS respected in exports)

### Risks Specific to This Phase

| Risk                                                            | Likelihood | Impact | Mitigation                                                                                                 |
| --------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| Chart rendering performance with large datasets                 | Medium     | Medium | Aggregate data server-side; limit chart data points to 1000 max; paginate tables                           |
| PDF generation quality and consistency                          | High       | Medium | Test across browsers; consider server-side rendering (Puppeteer or a PDF library like @react-pdf/renderer) |
| Metrics definitions confusing users (what counts as "stalled"?) | Medium     | Medium | Provide tooltip explanations for every metric; make thresholds configurable                                |
| Over-building the custom report builder                         | High       | Medium | Start with 3 preset report templates; add custom builder incrementally                                     |
| Data accuracy: edge cases in cycle time calculation             | Medium     | High   | Handle paused projects, re-opened steps, and deleted tickets explicitly; write thorough unit tests         |

---

## 7. Phase 4: Integrations & API (Weeks 31-38)

> **Status: NOT STARTED** — Schema foundation in place (integration_connections table, external_id/external_url/external_source columns on tickets).

### Goal

Open PIPS 2.0 to the outside world. Provide a documented REST API that customers can use to build their own integrations, and deliver first-party connectors to the three most-requested external tools: Jira, Azure DevOps, and AHA!. This is the phase that makes PIPS 2.0 viable for organizations with existing tool ecosystems.

### Scope -- What's IN

#### Weeks 27-28: Public REST API (v1)

- **API design:**
  - RESTful endpoints for all core resources: organizations, users, projects, tickets, comments, forms, teams
  - JSON:API or simple JSON response format (decide during implementation)
  - Versioned: `/api/v1/...`
  - Pagination: cursor-based for lists
  - Filtering: query parameters matching the UI filter system
  - Rate limiting: 1000 requests/hour per API key (configurable per plan)
- **Authentication:**
  - API key management UI: generate, revoke, list keys
  - API keys scoped to organization
  - Bearer token authentication
  - API key permissions: read-only or read-write
- **Documentation:**
  - Auto-generated OpenAPI/Swagger spec
  - Interactive API documentation page (Swagger UI or Redoc)
  - Code examples for common operations (curl, JavaScript, Python)
- **Webhook system (outbound):**
  - Organization can register webhook URLs
  - Events: ticket.created, ticket.updated, ticket.closed, project.step_completed, project.completed, comment.created
  - Webhook payload includes event type, timestamp, and full resource data
  - Retry logic: 3 attempts with exponential backoff
  - Webhook delivery log (success/failure, response code)

#### Weeks 29-30: Jira Bi-Directional Sync

- **Connection setup:**
  - OAuth 2.0 connection to Jira Cloud (Atlassian Connect)
  - Select which Jira project(s) to sync with which PIPS projects
  - Field mapping configuration: PIPS ticket fields <-> Jira issue fields
- **Sync behavior:**
  - Create: PIPS ticket -> Jira issue (and vice versa)
  - Update: status, assignee, priority, description changes sync both ways
  - Comments sync both ways
  - Conflict resolution: last-write-wins with conflict indicator
  - Sync log: full audit trail of what synced, when, and any errors
- **Limitations (documented clearly):**
  - Custom fields: only mapped fields sync
  - Attachments: linked by URL, not copied
  - PIPS step data does not sync to Jira (no Jira equivalent)

#### Weeks 31-32: Azure DevOps Connector

- **Connection setup:**
  - OAuth 2.0 or PAT (Personal Access Token) authentication
  - Select Azure DevOps project and work item type mapping
  - Field mapping configuration
- **Sync behavior:**
  - Same bi-directional sync pattern as Jira
  - Work item types: map PIPS ticket types to ADO work item types (Bug, User Story, Task, etc.)
  - State mapping: PIPS statuses <-> ADO states
  - Area path and iteration path support

#### Weeks 33-34: AHA! Connector & Webhook Inbound

- **AHA! connector:**
  - API key authentication (AHA! uses API keys)
  - Sync AHA! features/requirements with PIPS tickets
  - One-way or bi-directional (configurable)
  - Map AHA! workflow statuses to PIPS statuses
- **Inbound webhooks:**
  - Generate unique webhook URLs per integration
  - Accept payloads from external systems
  - Configurable payload mapping (JSON path -> PIPS field)
  - Use case: external CI/CD system updates a PIPS ticket status when a deployment completes

### Scope -- What's OUT

- No GraphQL API (REST only in v1; GraphQL is a Year 2 consideration)
- No Slack/Teams integration (Year 2)
- No Zapier/Make integration (Year 2 -- but the webhook system enables it informally)
- No real-time sync (polling-based with configurable interval: 5min, 15min, 1hr)

### Estimated Effort

- Solo developer: 8 weeks full-time (~320 hours)
- With AI agent assistance: 7-8 weeks (integration work requires careful testing with external services that agents can't easily automate)
- WARNING: External API integrations are notoriously time-consuming due to undocumented behaviors, rate limits, and breaking changes in third-party APIs. Budget 30% buffer.

### Key User Stories

1. **As a developer at a customer organization**, I can generate an API key, read the documentation, and write a script that creates PIPS tickets from our internal tools within 30 minutes.
2. **As an org admin**, I can connect our Jira Cloud instance to PIPS 2.0 and see tickets appear in both systems within minutes, keeping both in sync as my team works.
3. **As a team that uses Azure DevOps for engineering**, I can link our ADO work items to PIPS improvement projects so that implementation tasks are tracked in our existing tool while the improvement process is managed in PIPS.
4. **As a product manager using AHA!**, I can sync feature requests from AHA! into PIPS tickets so that improvement work driven by customer feedback flows into our PIPS process.
5. **As a DevOps engineer**, I can configure an inbound webhook so that our deployment pipeline automatically updates the PIPS implementation ticket status when code ships to production.

### Exit Criteria / Definition of Done

- [ ] API documentation is complete, accurate, and accessible at `/api/docs`
- [ ] All API endpoints have integration tests
- [ ] Rate limiting works correctly and returns 429 with retry-after header
- [ ] Jira sync works end-to-end: create in PIPS -> appears in Jira, update in Jira -> reflected in PIPS
- [ ] Azure DevOps sync works end-to-end with the same bidirectional behavior
- [ ] AHA! sync works for the configured direction (one-way or bidirectional)
- [ ] Webhook delivery achieves >99% success rate with retry logic
- [ ] Sync conflict is handled gracefully (no data loss, conflict logged)
- [ ] API keys can be created, revoked, and permissions are enforced
- [ ] Integration setup takes <15 minutes for a technical user following the docs

### Risks Specific to This Phase

| Risk                                          | Likelihood | Impact   | Mitigation                                                                                |
| --------------------------------------------- | ---------- | -------- | ----------------------------------------------------------------------------------------- |
| Third-party API changes breaking integrations | High       | High     | Pin to specific API versions; monitor changelogs; build integration health checks         |
| Bi-directional sync creating infinite loops   | Medium     | Critical | Implement sync origin tracking; ignore updates that originated from a sync                |
| Rate limiting by external APIs                | High       | Medium   | Implement request queuing with backoff; cache frequently-read data                        |
| OAuth token refresh failures                  | Medium     | Medium   | Implement robust token refresh with user notification on expiry                           |
| Field mapping complexity overwhelming users   | Medium     | Medium   | Provide sensible defaults; only require mapping for custom fields                         |
| Security: API keys leaked in client-side code | Medium     | High     | API keys are server-only; docs prominently warn against client-side use; add key rotation |

---

## 8. Phase 5: White-Label & Enterprise (Weeks 39-46)

> **Status: NOT STARTED** — Architectural foundation in place (CSS custom properties, org_settings table with brand columns, design token system).

### Goal

Make PIPS 2.0 ready for enterprise customers who need their own branding, authentication, compliance guarantees, and fine-grained access control. This phase transforms the product from a SaaS tool into a platform that consulting firms and large organizations can deploy as their own.

### Scope -- What's IN

#### Weeks 35-36: White-Label Theming Engine

- **Branding configuration (per organization):**
  - Logo upload (primary + icon/favicon)
  - Color palette: primary, secondary, accent, background, text colors
  - PIPS step colors: customizable per organization (override the defaults)
  - Font selection (from a curated list of web-safe + Google Fonts)
  - Custom CSS injection (advanced, for enterprise customers with design teams)
- **Implementation:**
  - CSS custom properties driven by org config (loaded at auth time)
  - Email templates use org branding (logo, colors, footer)
  - PDF exports use org branding (header, colors)
  - Login page uses org branding (when accessed via custom domain or org-specific URL)
- **White-label admin panel:**
  - Live preview: see branding changes in real-time before saving
  - Reset to defaults button
  - Export/import branding config (JSON)

#### Weeks 37-38: Custom Domains & SSO

- **Custom domain support:**
  - Organizations can map their own domain (e.g., `improvements.acmecorp.com`)
  - SSL certificate provisioning via Vercel (automatic with CNAME)
  - Login page served on custom domain with org branding
  - Email "from" address uses org domain (requires DNS verification)
- **SSO/SAML authentication:**
  - SAML 2.0 Identity Provider integration (Okta, Azure AD, OneLogin, etc.)
  - SSO configuration UI: metadata URL, certificate upload, attribute mapping
  - Just-In-Time (JIT) provisioning: new users auto-created on first SSO login
  - Force SSO: org admin can require SSO and disable password login
  - SCIM provisioning (stretch goal): auto-sync user directory from IdP

#### Weeks 39-40: Advanced RBAC & Admin Console

- **Permission system overhaul:**
  - Organization-level roles: Owner, Admin, Member, Viewer, Billing Admin
  - Project-level roles: Project Lead, Contributor, Observer (read-only)
  - Ticket-level permissions: who can edit, who can close, who can delete
  - Custom roles: org admins can create roles with specific permission sets
  - Permission matrix: UI showing role x permission grid
- **Admin console:**
  - Organization settings: name, billing, branding, domain, SSO
  - User management: invite, deactivate, change role, view activity
  - Team management: create, edit, assign members
  - Usage dashboard: storage used, API calls, users count
  - Security settings: session timeout, password policy, 2FA enforcement

#### Weeks 41-42: Audit Logging & Compliance

- **Comprehensive audit log:**
  - Every create, update, delete, and access event logged
  - Log entry includes: who, what, when, where (IP), old value, new value
  - Log retention: configurable (90 days default, up to 7 years for compliance)
  - Audit log viewer: search, filter by user/action/resource/date
  - Export audit log to CSV
  - Immutable: audit records cannot be edited or deleted by any user
- **Compliance features:**
  - Data residency indicator: show where data is stored (Supabase region)
  - Data processing agreement (DPA) acceptance workflow
  - GDPR: data export (all user data as JSON), right to erasure (account deletion with data purge)
  - SOC 2 readiness: document security controls and access patterns

### Scope -- What's OUT

- No multi-region deployment (single Supabase region; multi-region is Year 2+)
- No on-premise deployment (SaaS only)
- No HIPAA compliance (would require significant infrastructure changes)
- No FedRAMP (government compliance is Year 2+ if there's demand)

### Estimated Effort

- Solo developer: 8 weeks full-time (~320 hours)
- With AI agent assistance: 7-8 weeks (SSO/SAML is complex and requires testing with real IdPs; custom domains require DNS configuration testing)
- NOTE: SAML integration is one of the hardest things to test as a solo developer. Consider using a SAML testing service (e.g., Samling, Auth0 as a test IdP) rather than requiring a real enterprise IdP during development.

### Key User Stories

1. **As a consulting firm**, I can white-label PIPS 2.0 with my company's logo, colors, and domain, and my clients will see my brand when they log in -- they will never know they are using PIPS 2.0.
2. **As an enterprise IT admin**, I can configure SSO with our Azure AD so that employees log in with their corporate credentials and are automatically provisioned with the correct role.
3. **As a compliance officer**, I can pull an audit log showing every change made to tickets and projects in our organization over the last 90 days, filtered by specific users or actions.
4. **As an org admin**, I can create a custom "Department Lead" role that can manage team members and view reports but cannot delete projects or access billing, giving me granular control over who can do what.
5. **As a data protection officer**, I can export all data associated with a specific user and permanently delete their account and data to comply with a GDPR erasure request.

### Exit Criteria / Definition of Done

- [ ] White-label branding applies consistently across all pages, emails, and PDFs
- [ ] Custom domain works with automatic SSL and org-specific login page
- [ ] SAML SSO works with at least 2 Identity Providers (Okta and Azure AD)
- [ ] JIT provisioning creates users on first SSO login with correct default role
- [ ] Custom RBAC roles can be created with any combination of permissions
- [ ] Permission enforcement is verified: users without permission get 403, not just hidden UI
- [ ] Audit log captures all CRUD operations and is immutable
- [ ] Audit log search returns results in <2 seconds for up to 1M records
- [ ] GDPR data export and deletion work completely (no orphaned data)
- [ ] Security review: penetration test or security audit completed

### Risks Specific to This Phase

| Risk                                                                     | Likelihood | Impact   | Mitigation                                                                                               |
| ------------------------------------------------------------------------ | ---------- | -------- | -------------------------------------------------------------------------------------------------------- |
| SAML implementation bugs causing login failures for enterprise customers | High       | Critical | Use a battle-tested SAML library (e.g., `saml2-js` or Supabase's built-in SAML); test with multiple IdPs |
| Custom domain SSL provisioning delays                                    | Medium     | Medium   | Use Vercel's built-in custom domain support; document the CNAME setup clearly                            |
| Permission system bugs allowing unauthorized access                      | Medium     | Critical | Write comprehensive integration tests for every permission; audit all API endpoints                      |
| CSS custom property approach not covering all UI elements                | Medium     | Medium   | Audit every component for hardcoded colors during implementation; use a theming checklist                |
| Audit log storage growing very large                                     | Low        | Medium   | Partition by org and date; archive old records to cold storage; set retention policies                   |

---

## 9. Phase 6: AI & Advanced Features (Weeks 47-56)

> **Status: NOT STARTED** — Claude API SDK available, architecture is AI-ready.

### Goal

Leverage AI to accelerate every step of the PIPS methodology, making the platform not just a tracking tool but an intelligent advisor. This phase also adds trend detection, smart recommendations, and lays groundwork for a potential native mobile app.

### Scope -- What's IN

#### Weeks 43-44: AI Problem Identification Assistant (Step 1)

- **Problem statement generator:**
  - User describes a situation in plain language
  - AI transforms it into a well-structured problem statement following the PIPS format
  - Suggests measurable criteria (how will you know when it's solved?)
  - Identifies potential stakeholders to involve
- **Impact assessment helper:**
  - AI asks clarifying questions to quantify impact
  - Suggests metrics to track (cost, time, satisfaction, defect rate)
  - Generates a draft impact assessment from the conversation
- **Similar problem detection:**
  - When creating a new PIPS project, AI searches completed projects for similar problem statements
  - Surfaces relevant lessons learned and solutions from past projects (within the same org)
  - "This looks similar to Project X which was completed 6 months ago -- want to see what they did?"

#### Weeks 45-46: AI Root Cause Analysis & Solution Generation (Steps 2-3)

- **Root cause suggestion engine (Step 2):**
  - Given a problem statement, AI generates an initial fishbone diagram with suggested root cause categories
  - "5 Why" assistant: AI asks progressive "why?" questions, helping the team dig deeper
  - Suggests data to collect based on the problem type and industry
  - References common root cause patterns from improvement methodology literature
- **AI brainstorming assistant (Step 3):**
  - Given the problem and root causes, AI generates 10-15 potential solutions
  - Solutions are categorized by effort/impact (quick wins, big bets, incremental improvements)
  - AI plays "devil's advocate" -- for each proposed solution, generates potential objections and risks
  - Brainwriting mode: AI adds "virtual team member" contributions to the brainwriting session

#### Weeks 47-48: Smart Templates & Recommendations (Steps 4-6)

- **Decision support (Step 4):**
  - AI suggests evaluation criteria based on the problem type
  - Given solutions and criteria, AI generates a pre-filled decision matrix for the team to validate
  - RACI suggestion: given the team roster and project scope, AI drafts a RACI chart
- **Implementation planning (Step 5):**
  - AI generates a draft implementation plan with milestones, estimated durations, and risk areas
  - Task breakdown: AI suggests child tickets for the selected solution
  - Risk prediction: based on project characteristics, AI flags common risks
- **Evaluation support (Step 6):**
  - AI generates a draft evaluation report comparing before/after metrics
  - Lessons learned extraction: AI summarizes key learnings from the project's activity history
  - Continuation suggestions: "Based on the results, here are 2 follow-up problems worth investigating"

#### Weeks 49-50: Advanced Analytics with AI

- **Trend detection:**
  - AI analyzes project and ticket data to identify emerging patterns
  - "Your Step 2 (Analyze) cycle times have increased 40% in the last 3 months"
  - "Teams using fishbone diagrams complete projects 25% faster than those that skip Step 2"
  - Predictive: "Based on current pace, this project will likely complete in 3-4 weeks"
- **Smart recommendations:**
  - "These 5 stalled projects have no activity in 30 days -- consider reviewing or closing them"
  - "Team X has 3x the ticket load of Team Y -- consider rebalancing"
  - "Projects that skip Step 3 have a 40% lower completion rate -- encourage brainstorming"
- **Natural language queries:**
  - "How many projects did we complete last quarter?"
  - "Which team has the fastest cycle time?"
  - "Show me all critical tickets assigned to the engineering team"
  - AI translates natural language to the appropriate filter/report view

#### Weeks 51-52: Mobile App Consideration & Polish

- **Mobile app assessment:**
  - Evaluate whether a React Native (Expo) mobile app adds enough value beyond the responsive web app
  - Key mobile-specific features: push notifications, offline access, camera (attach photos to tickets)
  - If proceeding: set up Expo project with shared TypeScript types from web app, basic auth flow, ticket list and detail views
  - If deferring: document the decision and what would trigger revisiting it
- **AI configuration:**
  - Per-org AI settings: enable/disable AI features, data usage consent
  - AI suggestion confidence indicators (high/medium/low confidence)
  - User feedback on AI suggestions (thumbs up/down) to improve over time
  - Token usage tracking and budget limits per org
- **Overall polish:**
  - Performance optimization pass across the entire application
  - Accessibility audit (WCAG 2.1 AA compliance)
  - User onboarding flow: guided tour for new users
  - Help center: searchable FAQ and getting-started guides (content from existing PIPS learning guide)

### Scope -- What's OUT

- No AI training on customer data (all AI is prompt-based using Claude API; no fine-tuning)
- No fully autonomous AI agents (AI assists, humans decide)
- No voice interface
- No AR/VR features

### Estimated Effort

- Solo developer: 10 weeks full-time (~400 hours)
- With AI agent assistance: 8-10 weeks (ironic: using AI to build AI features; the prompt engineering is the bottleneck, not the code)
- NOTE: AI feature quality depends heavily on prompt engineering and testing with diverse scenarios. Budget significant time for prompt iteration.

### Key User Stories

1. **As a team leader**, I can describe a messy operational problem in plain English, and the AI transforms it into a structured problem statement with measurable success criteria, saving me 30 minutes of formatting work.
2. **As a facilitator**, when starting Step 2, the AI generates a draft fishbone diagram based on our problem statement, giving our team a starting point instead of a blank page.
3. **As a team member**, during brainstorming (Step 3), I can ask the AI to add ideas to our session, and it generates creative solutions that spark real discussion among the team.
4. **As a project sponsor**, I can see AI-generated trend insights on my dashboard that alert me to stalling projects and suggest actions, without me having to dig through every project manually.
5. **As a new user**, I can ask questions in natural language ("How many projects did my team finish this month?") and get answers without learning the reporting interface.

### Exit Criteria / Definition of Done

- [ ] AI problem statement generator produces well-structured output >80% of the time (based on 50 test cases)
- [ ] AI fishbone diagram suggestions are relevant to the problem domain >70% of the time
- [ ] AI brainstorming generates at least 10 distinct, non-trivial solutions per prompt
- [ ] AI suggestions include confidence indicators and are clearly labeled as AI-generated
- [ ] Token usage tracking is accurate and budget limits are enforced
- [ ] Natural language query handles the 20 most common questions correctly
- [ ] Users can disable all AI features per-org without affecting other functionality
- [ ] AI response time <5 seconds for all suggestions
- [ ] Mobile app decision documented with clear rationale

### Risks Specific to This Phase

| Risk                                                          | Likelihood | Impact | Mitigation                                                                                                        |
| ------------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| AI hallucinations generating incorrect or harmful suggestions | High       | High   | All AI output is framed as "suggestions" requiring human review; include disclaimers; test extensively            |
| AI API costs exceeding budget at scale                        | Medium     | High   | Track token usage per org; implement hard budget limits; cache common prompts; use Haiku for low-complexity tasks |
| Users over-relying on AI and skipping critical thinking       | Medium     | Medium | AI generates starting points, not final answers; UI encourages team discussion of AI suggestions                  |
| Data privacy concerns with sending org data to AI API         | Medium     | High   | Clearly document what data is sent; offer opt-out; never send data from orgs that have disabled AI                |
| AI features becoming outdated as Claude API evolves           | Medium     | Medium | Wrap all AI calls in an abstraction layer; stay current with API updates                                          |
| Mobile app scope creep                                        | High       | Medium | If building, limit to ticket management only (not full PIPS workflow on mobile)                                   |

---

## 10. Future Roadmap (Year 2+)

These features are on the horizon but are intentionally deferred. They are listed here to inform architecture decisions in Year 1 (don't paint yourself into a corner) but are NOT committed to any timeline.

### Template Marketplace

- Community-created form templates, workflow templates, and report templates
- Revenue share model: template creators earn a percentage of sales
- Quality review process: templates must be reviewed before publishing
- Categories: industry-specific (healthcare, manufacturing, IT, education), methodology-specific (Lean, Six Sigma, Agile hybrid)
- Technical requirement: template format must be defined in Phase 1 to ensure compatibility

### Training & Certification Platform

- PIPS methodology certification program (online, self-paced)
- Interactive courses with quizzes, exercises, and final exam
- Certificate generation (PDF, LinkedIn badge)
- Facilitator certification with practical assessment
- Revenue stream: certification fees ($99-$499 per certification level)
- Builds credibility and creates a network of trained practitioners

### Consulting Marketplace

- Connect organizations with certified PIPS facilitators and coaches
- Booking system: schedule virtual or on-site facilitation sessions
- Facilitator profiles with ratings, specializations, availability
- Revenue stream: platform takes 15-20% of session fees
- Modeled after: Rhythm Systems' consulting arm, but as a marketplace

### Industry-Specific Template Packs

- Healthcare: patient safety events, clinical process improvement, regulatory compliance
- Manufacturing: quality defects, production efficiency, equipment reliability
- IT/Software: incident management, service improvement, DevOps optimization
- Education: student outcomes, administrative efficiency, curriculum improvement
- Each pack includes: pre-configured forms, example projects, industry terminology, compliance checklists

### Advanced Workflow Automation

- If/then rules: "When a ticket moves to Done, if it's linked to a PIPS project, check if all Step 5 tickets are done, then suggest advancing to Step 6"
- Scheduled actions: "If a project has no activity for 14 days, notify the project lead"
- Approval workflows: "Step 4 decisions require sponsor sign-off before proceeding"
- Integration triggers: "When Jira issue is deployed, update the linked PIPS ticket"
- Visual workflow builder (drag-and-drop, if we're ambitious)

### Native Mobile Apps

- React Native (Expo) for iOS and Android
- Core features: ticket management, notifications, comments, photo attachments
- Offline support: view and create tickets offline, sync when reconnected
- Push notifications: native push for assigned tickets, mentions, due dates
- Camera integration: attach photos directly from camera to tickets (useful for manufacturing, facilities)
- Decision: build only if web app mobile experience proves insufficient

### Additional Integrations

- Slack: create tickets from messages, receive notifications in channels
- Microsoft Teams: same as Slack
- Zapier/Make: official integration for no-code automation
- ServiceNow: enterprise ITSM integration
- Salesforce: link customer issues to improvement projects
- Power BI / Tableau: embed PIPS data in existing BI dashboards
- GraphQL API: for customers who prefer it over REST

### Localization & Internationalization

- Multi-language support (start with: Spanish, French, German, Portuguese, Japanese)
- Right-to-left (RTL) layout support
- Date/time/number formatting per locale
- Translatable form templates

---

## 11. Risk Register

### Technical Risks

| Risk                                                                                | Phase | Likelihood | Impact   | Mitigation                                                                                                                        |
| ----------------------------------------------------------------------------------- | ----- | ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Supabase RLS complexity** -- policies become hard to manage as schema grows       | 0-1   | High       | Critical | Establish RLS testing patterns early; write tests for every policy; use `supabase test db`                                        |
| **Real-time sync conflicts** -- bi-directional integration sync creating data races | 4     | High       | High     | Implement origin tracking, idempotency keys, and conflict resolution strategy before building any sync                            |
| **Performance degradation** -- as data volume grows, queries slow down              | 2-3   | Medium     | High     | Index strategy from day 1; query performance monitoring; pagination everywhere; consider read replicas at scale                   |
| **Supabase limits** -- hitting connection pool, storage, or bandwidth limits        | 3+    | Medium     | High     | Monitor usage dashboards; have a scaling plan (Supabase Pro/Enterprise or migrate to self-hosted)                                 |
| **Security vulnerability** -- XSS, CSRF, injection, or auth bypass                  | All   | Medium     | Critical | Security-first coding practices; input validation everywhere; regular dependency audits; consider a security audit before Phase 5 |
| **Third-party API instability** -- Jira/ADO/AHA! API changes or outages             | 4     | High       | Medium   | Build health checks; circuit breaker pattern; version pin external APIs; monitor their status pages                               |
| **AI API reliability** -- Claude API outages or response quality variation          | 6     | Medium     | Medium   | Graceful degradation (AI features are optional); fallback to cached suggestions; timeout handling                                 |
| **Database migration failures** -- schema changes breaking production               | All   | Medium     | High     | Always use Supabase migrations; test migrations on staging before production; maintain rollback scripts                           |

### Market Risks

| Risk                                                                                 | Likelihood | Impact   | Mitigation                                                                                                                                     |
| ------------------------------------------------------------------------------------ | ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Low demand for methodology-embedded PM** -- market prefers generic tools           | Medium     | Critical | Validate with early customers in Phase 1; be prepared to emphasize the ticketing system over the methodology if needed                         |
| **Rhythm Systems competitive response** -- they lower prices or copy features        | Low        | Medium   | Move fast; our tech stack is more modern; our AI features will be a generation ahead                                                           |
| **Enterprise sales cycle too long** -- selling to large orgs takes 6-12 months       | High       | High     | Start with SMB and mid-market; use self-serve onboarding; enterprise sales only after product-market fit is established                        |
| **Price sensitivity** -- customers unwilling to pay premium over Jira/Monday.com     | Medium     | High     | Tier pricing: free for small teams, paid for organizations; demonstrate ROI through improvement outcomes                                       |
| **PIPS methodology not recognized** -- customers don't know or trust the methodology | High       | Medium   | Invest in content marketing (blog, webinars, case studies); leverage the existing training materials; certification program builds credibility |

### Resource Risks

| Risk                                                                                             | Likelihood | Impact | Mitigation                                                                                                                           |
| ------------------------------------------------------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Solo developer bottleneck** -- one person can only do so much                                  | High       | High   | Leverage AI agents extensively; prioritize ruthlessly; consider contractors for specific phases (e.g., SAML integration, mobile app) |
| **Burnout** -- 52-week plan is a marathon, not a sprint                                          | High       | High   | Build in buffer weeks between phases; take breaks; celebrate milestones; don't let the roadmap become a death march                  |
| **Knowledge gaps** -- SAML, complex permission systems, bi-directional sync are deep specialties | Medium     | Medium | Research and prototype before committing; use proven libraries; consider paying for expert consultation on SAML specifically         |
| **Context switching cost** -- jumping between phases and feature areas                           | High       | Medium | Complete one phase before starting the next; avoid parallel phase work; maintain clear documentation for re-entry                    |
| **Dependency on third parties** -- Supabase, Vercel, Stripe, Claude API                          | Medium     | Medium | Avoid lock-in where possible; use standard protocols (SQL, REST, SAML); have migration plans documented                              |

---

## 12. Success Criteria Per Phase

### Phase 0: Foundation — COMPLETE

| Metric                     | Target                                     | Actual                   |
| -------------------------- | ------------------------------------------ | ------------------------ |
| TypeScript strict mode     | Zero errors                                | ACHIEVED — 0 type errors |
| Component library coverage | All base primitives in Storybook           | ACHIEVED                 |
| RLS test coverage          | 100% of tables have tenant isolation tests | ACHIEVED                 |
| CI/CD pipeline             | Green on every merge to main               | ACHIEVED                 |
| Lighthouse performance     | >90 on empty dashboard                     | ACHIEVED                 |

### Phase 1: MVP — COMPLETE

| Metric                             | Target                                | Actual                                |
| ---------------------------------- | ------------------------------------- | ------------------------------------- |
| Beta users                         | 5-10 users actively testing           | PENDING — no beta users onboarded yet |
| PIPS projects completed end-to-end | At least 3 (by beta testers)          | PENDING — no real users yet           |
| Digital forms functional           | 10+ of 26 templates (prioritized set) | EXCEEDED — 18 forms built             |
| Core test coverage                 | >70% on workflow logic                | EXCEEDED — 878 unit + 160 E2E tests   |
| Page load time                     | <2s on 3G                             | ACHIEVED                              |
| Critical bugs                      | Zero open P0 bugs                     | ACHIEVED — 5 bugs fixed post-MVP      |
| Revenue                            | $0 (free beta)                        | ON TRACK — $0 as expected             |

### Phase 1.5: Post-MVP Stabilization — IN PROGRESS

| Metric                          | Target                                                         |
| ------------------------------- | -------------------------------------------------------------- |
| Production bugs fixed           | All identified bugs resolved                                   |
| Adoption friction items         | Top 5 friction risks mitigated (from Customer Insights Report) |
| Email notification verification | All critical paths verified with Resend                        |
| Training pages wired            | All 4 learning paths rendering from DB                         |
| Knowledge Hub workbook          | Exercise-to-form linking operational                           |
| Beta readiness                  | First 5 beta users can complete full 6-step cycle              |

### Phase 2: Ticketing & Project Management

| Metric                      | Target                                   |
| --------------------------- | ---------------------------------------- |
| Active users                | 20-50 across 3-5 organizations           |
| Tickets created             | 500+ across all orgs                     |
| Kanban board performance    | Smooth drag-and-drop with 100+ cards     |
| Search response time        | <500ms for 10K tickets                   |
| Email notification delivery | >95% within 60 seconds                   |
| Feature completeness        | All planned features shipped             |
| Revenue                     | First paying customers ($500-$2,000 MRR) |

### Phase 3: Analytics & Reporting

| Metric                      | Target                |
| --------------------------- | --------------------- |
| Active organizations        | 10-15                 |
| Reports generated per month | 50+                   |
| Dashboard load time         | <3s with 500 projects |
| CSV/PDF export reliability  | >99% success rate     |
| Customer satisfaction (NPS) | >30                   |
| Revenue                     | $2,000-$5,000 MRR     |

### Phase 4: Integrations & API

| Metric                        | Target                               |
| ----------------------------- | ------------------------------------ |
| API integrations active       | 5-10 organizations using the API     |
| Jira sync connections         | 3-5 active connections               |
| API uptime                    | >99.5%                               |
| Webhook delivery success rate | >99%                                 |
| Documentation quality         | <15 min to first successful API call |
| Revenue                       | $5,000-$10,000 MRR                   |

### Phase 5: White-Label & Enterprise

| Metric                  | Target                                    |
| ----------------------- | ----------------------------------------- |
| White-label deployments | 2-3 consulting firms                      |
| SSO connections         | 3-5 enterprise orgs using SAML            |
| Security audit          | Passed with no critical findings          |
| GDPR compliance         | Data export and deletion fully functional |
| Revenue                 | $10,000-$25,000 MRR                       |

### Phase 6: AI & Advanced Features

| Metric                              | Target                                              |
| ----------------------------------- | --------------------------------------------------- |
| AI feature adoption                 | >50% of active projects use at least one AI feature |
| AI suggestion quality (user rating) | >70% thumbs up                                      |
| AI response time                    | <5 seconds                                          |
| Token cost per org per month        | <$50 average                                        |
| Overall platform MAU                | 200+                                                |
| Revenue                             | $25,000-$50,000 MRR                                 |

### Quality Gates (Applied to Every Phase)

| Gate          | Requirement                                          |
| ------------- | ---------------------------------------------------- |
| TypeScript    | `tsc --noEmit` passes with zero errors               |
| Test coverage | >70% on core business logic                          |
| Accessibility | WCAG 2.1 AA on all new pages                         |
| Performance   | Lighthouse >80 on all pages                          |
| Security      | No known vulnerabilities in dependencies (npm audit) |
| Mobile        | All features usable on 375px viewport                |
| Documentation | All new features documented in help center           |

---

## 13. Dependencies & Critical Path

### Phase Dependency Map

```
Phase 0 (Foundation)
  |
  +---> Phase 1 (MVP)
          |
          +---> Phase 2 (Ticketing)
          |       |
          |       +---> Phase 3 (Analytics)  ----+
          |       |                               |
          |       +---> Phase 4 (Integrations) --+---> Phase 5 (Enterprise)
          |                                       |
          +---------------------------------------+---> Phase 6 (AI)
```

**Critical Path:** Phase 0 -> Phase 1 -> Phase 2 -> Phase 5 (Enterprise)

Phases 3 and 4 can overlap slightly with Phase 2 (start analytics/API work on the data structures created in Phase 2). Phase 6 can start any time after Phase 2 for basic AI features, but the advanced analytics AI depends on Phase 3.

### What Blocks What

| Dependency                     | Blocks                             | Notes                                                         |
| ------------------------------ | ---------------------------------- | ------------------------------------------------------------- |
| Auth + multi-tenancy (Phase 0) | Everything                         | Cannot build any feature without users and orgs               |
| Database schema (Phase 0)      | Phase 1, 2, 3, 4                   | Schema changes are cheaper early; get it right in Phase 0     |
| PIPS workflow engine (Phase 1) | PIPS analytics (Phase 3)           | Cannot measure project cycle times without completed projects |
| Ticketing system (Phase 1-2)   | Integrations (Phase 4)             | Cannot sync tickets that don't exist                          |
| Ticketing system (Phase 2)     | Advanced analytics (Phase 3)       | Need substantial ticket data to build meaningful dashboards   |
| RBAC system (Phase 5)          | API permissions (Phase 4, stretch) | API key permissions should align with RBAC roles              |
| Notification system (Phase 2)  | Email branding (Phase 5)           | White-label emails need the notification system to exist      |
| Analytics (Phase 3)            | AI trend detection (Phase 6)       | AI needs data to analyze                                      |

### External Dependencies

| Dependency                                         | Phase | Risk          | Contingency                                                                                          |
| -------------------------------------------------- | ----- | ------------- | ---------------------------------------------------------------------------------------------------- |
| **Supabase** (database, auth, storage, RLS)        | All   | Platform risk | Schema is standard Postgres; can migrate to self-hosted Supabase or raw Postgres if needed           |
| **Vercel** (hosting, serverless, edge)             | All   | Low risk      | Next.js can deploy to any Node.js host; migration effort ~1 week                                     |
| **Stripe** (billing)                               | 2+    | Low risk      | Well-established platform; billing is not on the critical path for MVP                               |
| **Resend** (email)                                 | 2+    | Low risk      | Email provider is swappable; use an abstraction layer                                                |
| **Anthropic Claude API** (AI features)             | 6     | Medium risk   | AI features are optional; graceful degradation if API is unavailable; could swap to OpenAI if needed |
| **Jira/ADO/AHA! APIs** (integrations)              | 4     | Medium risk   | External APIs can change; pin versions; build health checks                                          |
| **Google Fonts / Web Fonts** (white-label theming) | 5     | Low risk      | Cache fonts locally; provide fallback font stack                                                     |

### Decision Points Requiring User Input

These are moments where the roadmap needs a human decision before proceeding. They should be flagged well in advance.

| Decision                                           | When Needed                     | Impact of Delay                                                                     |
| -------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------- |
| **Which 10 forms to prioritize for MVP?**          | Start of Phase 1 (Week 5)       | Delays form implementation; team needs to rank the 26 templates                     |
| **Pricing model and tiers**                        | Before Phase 2 launch (Week 12) | Cannot charge customers without defined pricing                                     |
| **Billing integration timing**                     | Phase 2 (Week 13)               | Need Stripe connected before first paying customer                                  |
| **Jira vs. ADO vs. AHA! priority order**           | Start of Phase 4 (Week 27)      | Build the most-requested integration first                                          |
| **Build mobile app or not?**                       | Phase 6 (Week 51)               | Significant effort commitment if yes; needs clear data showing web isn't sufficient |
| **Hire help or stay solo?**                        | End of Phase 2 (Week 20)        | If growing faster than one person can support, need to plan for hiring              |
| **Self-serve vs. sales-led growth?**               | Phase 3 (Week 21)               | Determines marketing investment and product UX priorities                           |
| **Which industries to target for template packs?** | Year 2 planning                 | Determines content investment and go-to-market strategy                             |

---

## Appendix A: Timeline Summary

| Phase                 | Weeks | Calendar (Starting Week 1 = Day 1) | Core Deliverable                                 |
| --------------------- | ----- | ---------------------------------- | ------------------------------------------------ |
| Phase 0: Foundation   | 1-4   | Month 1                            | Auth, multi-tenancy, design system, database     |
| Phase 1: MVP          | 5-12  | Months 2-3                         | PIPS 6-step workflow, basic ticketing, dashboard |
| Phase 2: Ticketing    | 13-20 | Months 4-5                         | Full ticketing, Kanban, search, notifications    |
| Phase 3: Analytics    | 21-26 | Months 5.5-6.5                     | Dashboards, reports, exports                     |
| Phase 4: Integrations | 27-34 | Months 7-8.5                       | REST API, Jira, Azure DevOps, AHA!               |
| Phase 5: Enterprise   | 35-42 | Months 9-10.5                      | White-label, SSO, RBAC, audit                    |
| Phase 6: AI           | 43-52 | Months 11-13                       | AI assistants, smart analytics, polish           |

**Total: ~12-13 months for a solo developer with AI agent assistance.**

### Realistic Expectations for a Solo Developer

This roadmap is ambitious for one person, even with AI agents. Here are some honest adjustments to expect:

1. **Add 30% buffer to every phase.** Things always take longer than planned, especially integrations, SAML, and anything involving external APIs.
2. **Phases may overlap.** You might start Phase 3 analytics while finishing Phase 2 polish. This is fine as long as the Phase 2 exit criteria are met.
3. **Some features will be descoped.** The custom report builder, workflow automation, and SCIM provisioning are prime candidates for deferral.
4. **Real timeline: 15-18 months** from Phase 0 to Phase 6, accounting for real life, bugs, customer feedback pivots, and the learning curve on enterprise features (SAML, RBAC).
5. **The MVP (Phase 1) is the most important milestone.** If it takes 12 weeks instead of 8, that's fine. Getting it right matters more than speed. Everything after Phase 1 is prioritized by customer demand, not this document.

---

## Appendix B: Leveraging Existing Assets

The existing PIPS assets (HTML guide, workbook, forms, facilitator tool) are a significant head start. Here's how each maps to the product:

| Existing Asset                  | PIPS 2.0 Usage                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| Interactive HTML learning guide | Help center content; onboarding flow; contextual tooltips within PIPS steps                  |
| HTML workbook with forms        | Direct input for digital form design in Phase 1; most form fields can be directly translated |
| 26 digital form templates       | Core of the MVP; each becomes a database-backed form component                               |
| Workshop facilitator tool       | Future: real-time facilitation mode for remote teams (Year 2)                                |
| Brand identity + color system   | Design system foundation in Phase 0; PIPS step colors                                        |
| Quick reference cards           | In-app help cards shown alongside each step                                                  |
| PowerPoint presentation         | Marketing and sales collateral; onboarding deck for new organizations                        |
| Parking lot worked example      | Sample/demo project pre-loaded for new organizations                                         |

---

## Appendix C: Pricing Model (Draft)

Not final -- to be validated with early customers. Included here for planning purposes.

| Tier           | Price          | Users           | Features                                                                          |
| -------------- | -------------- | --------------- | --------------------------------------------------------------------------------- |
| **Free**       | $0/mo          | Up to 3 users   | 1 active PIPS project, basic ticketing (50 tickets), no integrations              |
| **Team**       | $29/user/mo    | Up to 25 users  | Unlimited PIPS projects, full ticketing, analytics, email notifications           |
| **Business**   | $49/user/mo    | Up to 100 users | Everything in Team + integrations (Jira/ADO/AHA!), API access, custom reports     |
| **Enterprise** | Custom pricing | Unlimited       | Everything in Business + white-label, SSO/SAML, audit logging, custom domain, SLA |

Revenue model comparison:

- Rhythm Systems charges $50K-$150K+/year for methodology + software + coaching
- PIPS 2.0 at 25 users on Business tier = $14,700/year (significantly more accessible)
- White-label enterprise deals could be $25K-$100K/year

---

_This roadmap is a living document. It will be updated as customer feedback, market conditions, and technical discoveries inform our priorities. The north star remains the same: methodology-embedded project management that helps organizations solve problems better, faster, and with measurable outcomes._
