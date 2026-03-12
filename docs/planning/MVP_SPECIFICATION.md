# PIPS 2.0 -- MVP Specification

> **Version:** 1.1
> **Date:** 2026-03-03
> **Author:** Marc Albers + Claude (MVP Specification Agent)
> **Status:** COMPLETE — MVP shipped and live at pips-app.vercel.app
> **Last Updated:** March 3, 2026 (Product Manager Agent — marked COMPLETE, added Post-MVP Extensions section)
> **Timeline:** 6-8 weeks (solo developer + AI agent assistance) — **DELIVERED ON SCHEDULE**
> **Prerequisite reading:** BUSINESS_PLAN.md, TECHNICAL_PLAN.md, PRODUCT_ROADMAP.md, PRODUCT_REQUIREMENTS.md, MARKETING_STRATEGY.md, BRAND_GUIDE_V2.md, CONTENT_MIGRATION.md, DEVOPS_RUNBOOK.md
>
> ---
>
> **MVP DELIVERY SUMMARY**
>
> The MVP shipped on March 3, 2026. All Tier 1 features complete. All Tier 2 features complete. All Tier 3 features complete. Quality gates exceeded targets:
>
> | Gate        | Target | Actual              |
> | ----------- | ------ | ------------------- |
> | Unit tests  | 100+   | 2,339+ (208+ files) |
> | E2E tests   | 20+    | 230+ (25 specs)     |
> | Type errors | 0      | 0                   |
> | Forms built | 10+    | 18 of 26            |
> | Lint errors | 0      | 0                   |
>
> **What shipped beyond MVP scope (Post-MVP Extensions):** Knowledge Hub (205 content nodes, FTS, reading experience, Cadence Bar, bookmarks), Training Mode (DB + seed data for 4 paths, 27 modules, 59 exercises, scaffolded pages), Workshop (DB tables, scaffolded UI), 83+ SEO marketing pages. See [Section 13: Post-MVP Extensions](#13-post-mvp-extensions) for details.

---

## Table of Contents

1. [MVP Vision](#1-mvp-vision)
2. [MVP Feature Set -- What's IN](#2-mvp-feature-set----whats-in)
3. [MVP Feature Set -- What's OUT (and Why)](#3-mvp-feature-set----whats-out-and-why)
4. [Technical MVP Architecture](#4-technical-mvp-architecture)
5. [MVP Database Schema](#5-mvp-database-schema)
6. [MVP Page Map](#6-mvp-page-map)
7. [Build Sequence -- The Critical Path](#7-build-sequence----the-critical-path)
8. [Agent Work Packages](#8-agent-work-packages)
9. [MVP Quality Gates](#9-mvp-quality-gates)
10. [MVP Success Metrics](#10-mvp-success-metrics)
11. [Post-MVP Priority Stack](#11-post-mvp-priority-stack)
12. [Risk Register](#12-risk-register)
13. [Post-MVP Extensions](#13-post-mvp-extensions) -- NEW

---

## 1. MVP Vision

### What is the MVP in one paragraph?

The PIPS 2.0 MVP is a multi-tenant web application where a team can sign up, create an organization, and run a PIPS project through the complete 6-step methodology -- from defining a problem statement (Step 1: Identify) through root cause analysis (Step 2: Analyze), solution brainstorming (Step 3: Generate), decision-making and planning (Step 4: Select & Plan), execution tracking (Step 5: Implement), and results evaluation (Step 6: Evaluate). At each step the user is guided by objectives, prompts, and interactive digital forms (fishbone diagrams, brainstorming workspaces, criteria rating matrices, implementation checklists, evaluation comparisons). The application includes basic ticketing so implementation tasks can be tracked as tickets, team management, role-based access control, in-app notifications, and an organization dashboard that shows PIPS project health. It ships on the PIPS brand identity (indigo-violet palette, DM Sans typography, 6-step color system) using Next.js 16, Supabase with RLS, and Vercel.

### What is the "aha moment" for a first-time user?

The user creates their first PIPS project, writes a problem statement with guided As-Is / Desired State / Gap prompts, and advances to Step 2 where they open an interactive fishbone diagram and start dragging causes into categories. At that moment they realize: **this is not a blank ticket tracker -- the software is teaching me how to solve this problem.** The step progress bar at the top shows them exactly where they are in a proven 6-step process, and the next action is always clear.

### What is the 15-minute demo script?

| Minute | Action                                                          | What the VP sees                                                                                                                           |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 0-2    | Sign up, create org "AcmeCorp"                                  | Clean onboarding, org created in seconds, branded dashboard appears                                                                        |
| 2-4    | Create PIPS project "Reduce Customer Complaint Resolution Time" | Guided project creation with problem statement builder (As-Is / Desired / Gap), impact assessment                                          |
| 4-6    | Step 1 complete, advance to Step 2: Analyze                     | Step progress bar advances, guided prompts appear. Open interactive fishbone diagram, add causes to categories. Complete a 5-Why analysis. |
| 6-8    | Advance to Step 3: Generate                                     | Brainstorming workspace opens, add solution ideas as cards, vote on top candidates, reduce list to finalists                               |
| 8-10   | Advance to Step 4: Select & Plan                                | Criteria rating matrix: define criteria with weights, score each solution, auto-calculated rankings. Build implementation checklist.       |
| 10-12  | Advance to Step 5: Implement                                    | Implementation tasks become trackable tickets. Show the Kanban board with ticket cards. Update a ticket status.                            |
| 12-14  | Advance to Step 6: Evaluate                                     | Before/after comparison, evaluation form, lessons learned capture. Project marked complete.                                                |
| 14-15  | Return to dashboard                                             | Show project health widget, projects by step chart, "This is one project. Imagine 15 running across your team."                            |

### What does the MVP prove? (Product-market fit hypothesis)

**Hypothesis:** Operations leaders and process improvement professionals will pay for a project management platform that embeds the problem-solving methodology into the workflow, because it eliminates the gap between "knowing how to improve" and "actually tracking and executing improvements" -- a gap that spreadsheets, Jira, and expensive strategy platforms all fail to close.

**The MVP proves (or disproves) this hypothesis by testing:**

1. Do users complete the full 6-step cycle? (Methodology stickiness)
2. Do users create more than one project? (Repeat value)
3. Do users invite teammates? (Collaborative value)
4. Do users say "I need this for my team" after a demo? (Purchase intent)

---

## 2. MVP Feature Set -- What's IN

### Tier 1: Must Have (MVP literally does not work without these)

#### T1-01: Email/Password Authentication

- **Description:** Sign up with email + password, email verification, login, logout, password reset, session management.
- **Why it's in the MVP:** Cannot use the product without auth. Foundation for all RLS.
- **Acceptance criteria:**
  - User can sign up with email + password; receives verification email
  - User can log in with verified email + password
  - User can reset password via email link
  - Sessions persist for 30 days (refresh token); access token expires in 1 hour
  - Rate limit: 5 failed login attempts per 15 minutes, then 15-minute lockout
  - Password policy: minimum 10 characters, at least one uppercase, one lowercase, one number
- **Estimated complexity:** M
- **Dependencies:** Supabase project provisioned, Resend configured for email

#### T1-02: Organization Creation and Management

- **Description:** Create an organization during post-signup onboarding. Org has name, slug, plan (free for MVP). Slug used in URLs.
- **Why it's in the MVP:** Multi-tenancy is foundational. Cannot retrofit org-scoped data isolation later without massive migration.
- **Acceptance criteria:**
  - After email verification, user is guided to create an organization (name, slug)
  - Slug auto-generated from name, editable, validated (`^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$`)
  - Creator becomes `owner` role
  - Organization settings page shows name, logo upload, timezone
  - All data scoped to `org_id` via RLS policies
- **Estimated complexity:** M
- **Dependencies:** T1-01 (Auth)

#### T1-03: Role-Based Access Control (RBAC)

- **Description:** Five predefined roles: Owner, Admin, Manager, Member, Viewer. Permissions enforced at API level and via RLS.
- **Why it's in the MVP:** Retrofitting RBAC creates cascading debt across every query, every API route, and every RLS policy. Must be correct from day one.
- **Acceptance criteria:**
  - Roles enforced per the permission matrix in TECHNICAL_PLAN.md Section 5.3
  - Owner can manage billing, delete org, manage members
  - Admin can manage members, teams, integrations
  - Manager can create projects, manage teams
  - Member can create projects, create tickets, comment
  - Viewer can only read data
  - At least one Owner per org (cannot demote last Owner)
  - Permissions enforced at database (RLS) and API levels, not just UI
- **Estimated complexity:** L
- **Dependencies:** T1-01, T1-02

#### T1-04: User Invitation System

- **Description:** Invite users via email with pre-assigned role. Invitation link expires in 7 days. Accept/decline flow.
- **Why it's in the MVP:** A team tool is useless with one user. Must be able to invite teammates for the demo to show collaborative value.
- **Acceptance criteria:**
  - Owner/Admin can invite by email with pre-assigned role
  - Invitation email sent via Resend with one-click accept link
  - Invitation expires after 7 days
  - Pending invitations manageable (resend, revoke)
  - Accepted invitation creates `org_members` row with assigned role
  - If invitee does not have an account, accept link leads to signup then auto-joins org
- **Estimated complexity:** M
- **Dependencies:** T1-01, T1-02, T1-03

#### T1-05: Team Management (Basic)

- **Description:** Create teams with name and color. Add/remove members from teams. Assign teams to projects.
- **Why it's in the MVP:** Projects need team assignment. Teams are referenced in project creation and ticket assignment.
- **Acceptance criteria:**
  - Create team with name, description, color
  - Add/remove org members from teams
  - User can belong to multiple teams
  - Teams appear as filter option in project and ticket views
  - Team name unique per org
- **Estimated complexity:** S
- **Dependencies:** T1-02, T1-03

#### T1-06: PIPS Project Creation and 6-Step Workflow

- **Description:** Create a PIPS project with title, description, priority, target dates. Project has 6 steps with guided workflow, objectives, prompts, and completion criteria. Visual step progress indicator.
- **Why it's in the MVP:** This IS the product. The guided 6-step workflow is the entire value proposition. Without it, this is just another ticket tracker.
- **Acceptance criteria:**
  - Create project: title, description, priority, target dates, team assignment, owner assignment
  - 6 project_steps records auto-created (one per PIPS step)
  - Horizontal stepper showing current step, completed steps, upcoming steps
  - Each step displays: objective text, guided prompts, available tools/forms, completion criteria
  - Step gating: cannot advance until completion criteria met (Manager+ can override)
  - Step regression: can return to previous steps to update work
  - Project statuses: Draft, Active, On Hold, Completed, Archived
  - Project list view with status, current step, owner, priority, dates
- **Estimated complexity:** XL
- **Dependencies:** T1-01 through T1-05

#### T1-07: Step 1 -- Identify (Digital Forms and Guided Content)

- **Description:** Problem statement builder with As-Is / Desired State / Gap framework. Impact assessment form. Guided prompts and good/bad examples.
- **Why it's in the MVP:** Step 1 is where users define the problem. The guided problem statement construction is the single most differentiated feature versus Jira/Asana.
- **Acceptance criteria:**
  - Problem statement editor with As-Is, Desired State, Gap fields
  - Guided prompts: "What is happening?", "Where?", "When?", "Who is affected?", "How big?"
  - Good vs. bad problem statement examples (transformation cards from existing content)
  - Measurability check: warning if no numbers detected in As-Is/Desired fields
  - Impact assessment: financial, time, quality, safety, customer (rated 1-5)
  - Team formation: assign lead, members, sponsor
  - Completion criteria: problem statement saved, impact completed, at least 2 members assigned
  - Data stored as JSONB in `project_steps.data`
  - Auto-save every 3 seconds on field change
- **Estimated complexity:** L
- **Dependencies:** T1-06

#### T1-08: Step 2 -- Analyze (Fishbone Diagram + 5-Why)

- **Description:** Interactive fishbone (Ishikawa) diagram with 6 standard categories. 5-Why iterative analysis form.
- **Why it's in the MVP:** Root cause analysis tools are the most visually impressive and differentiated features. The fishbone diagram is the "wow" moment in the demo.
- **Acceptance criteria:**
  - Interactive fishbone diagram: 6 default categories (People, Process, Equipment, Materials, Environment, Management)
  - Add causes to categories, drag to reorder
  - 5-Why form: iterative "Why?" chain (5 levels) with space for evidence at each level
  - Root cause statement field
  - Step 2 guided prompts: "What data do you need?", "What tools will you use?"
  - Completion criteria: at least one analysis tool completed, root cause documented
  - Data stored as JSONB in `project_forms` table
  - Auto-save on change
- **Estimated complexity:** L
- **Dependencies:** T1-06, T1-07

#### T1-09: Step 3 -- Generate (Brainstorming Workspace)

- **Description:** Brainstorming tool with idea cards, voting, and list reduction.
- **Why it's in the MVP:** Generating solutions is a core methodology step. The brainstorming workspace demonstrates collaborative value.
- **Acceptance criteria:**
  - Brainstorming workspace: add ideas as cards (one idea per card)
  - Rules reminder displayed on workspace open
  - Voting: each participant can vote on ideas
  - List reduction tool: combine duplicates, eliminate infeasible ideas with rationale
  - Top candidates surfaced (3-7 finalists)
  - Step 3 guided prompts: "What could eliminate the root cause?", "What has worked elsewhere?"
  - Completion criteria: at least 5 ideas, list reduced to 3-7 candidates
  - Data stored in `project_forms`
- **Estimated complexity:** M
- **Dependencies:** T1-06

#### T1-10: Step 4 -- Select & Plan (Criteria Rating + Implementation Checklist)

- **Description:** Criteria rating matrix with weighted scoring. Cost-benefit analysis form. Implementation checklist builder. RACI matrix.
- **Why it's in the MVP:** The decision-making tools (especially criteria rating matrix with auto-calculation) demonstrate analytical rigor. The implementation checklist bridges to ticketing (Step 5).
- **Acceptance criteria:**
  - Criteria rating matrix: define criteria with weights (1-10), score solutions (1-5), auto-calculated weighted totals and rankings
  - Cost-benefit analysis: itemized costs and benefits, auto-calculated ROI and payback period
  - RACI matrix: tasks vs. team members, R/A/C/I designation per cell, validation (exactly 1 A per row)
  - Implementation checklist: action items with responsible person, due date, status, notes
  - "Create tickets" button on implementation checklist generates tickets in ticketing system
  - Step 4 guided prompts and completion criteria
- **Estimated complexity:** XL
- **Dependencies:** T1-06, T1-09

#### T1-11: Step 5 -- Implement (Task Tracking)

- **Description:** Implementation dashboard showing tasks from Step 4 with real-time status. Links to tickets.
- **Why it's in the MVP:** Bridges methodology to execution. Shows that PIPS is not just planning -- it manages the actual work.
- **Acceptance criteria:**
  - Task list from Step 4 implementation checklist with status tracking
  - Each task linked to a ticket (if created via "Create tickets")
  - Progress percentage auto-calculated from task completion
  - Completion criteria: all tasks marked Done or explicitly descoped with rationale
- **Estimated complexity:** M
- **Dependencies:** T1-06, T1-10, T1-12

#### T1-12: Ticketing System (Basic)

- **Description:** Create and manage tickets with title, description, type, status, priority, assignee. Ticket status workflow (Backlog > To Do > In Progress > In Review > Done). Auto-generated ticket ID (ORG-123). Parent/child relationships.
- **Why it's in the MVP:** Tickets are the atomic unit of work. PIPS projects generate tickets. The demo must show tasks being tracked and completed.
- **Acceptance criteria:**
  - Create ticket: title (required), description (rich text), type (Task, Bug, Feature, General), priority (Critical/High/Medium/Low), assignee, due date
  - Auto-generated ticket ID: `{ORG_SLUG}-{NUMBER}` (e.g., ACME-42)
  - Default status workflow: Backlog > To Do > In Progress > In Review > Done
  - Parent/child relationships (max 3 levels)
  - Parent ticket progress bar auto-calculated from child completion
  - Ticket comments with @mentions (basic -- no real-time initially)
  - Ticket activity log: timestamped record of status changes, assignee changes
  - Ticket links to PIPS project and step (if created from a PIPS step)
- **Estimated complexity:** L
- **Dependencies:** T1-01 through T1-05

#### T1-13: Kanban Board View

- **Description:** Kanban board with columns for each status. Drag-and-drop to change status. Ticket cards with key info.
- **Why it's in the MVP:** The board view is the most intuitive way to see and manage ticket status. Required for the demo's Step 5 segment.
- **Acceptance criteria:**
  - Columns for each status in the workflow
  - Drag-and-drop tickets between columns to update status
  - Ticket cards show: ID, title, priority badge, assignee avatar, due date (red if overdue)
  - Quick-add: "+" button at bottom of each column
  - Filter bar: filter by assignee, priority, search text
  - Board scoped to: project, or organization
- **Estimated complexity:** L
- **Dependencies:** T1-12

#### T1-14: Step 6 -- Evaluate (Before/After + Lessons Learned)

- **Description:** Before/after comparison form. Evaluation form. Lessons learned template. Project completion.
- **Why it's in the MVP:** The closed-loop evaluation is what makes PIPS a methodology, not just a workflow. Showing measurable results is the "proof" in "from problem to proof."
- **Acceptance criteria:**
  - Before/after comparison: side-by-side metrics (pulls baseline from Step 1, current data entered here)
  - Evaluation form: rate solution effectiveness on original impact dimensions
  - Lessons learned: what worked, what did not, recommendations
  - "Complete Project" action marks project as Completed with timestamp
  - Completion criteria: evaluation form completed, lessons documented
- **Estimated complexity:** M
- **Dependencies:** T1-06

#### T1-15: Organization Dashboard

- **Description:** Default landing page after login showing key metrics and activity.
- **Why it's in the MVP:** The dashboard is the first thing users see. It must communicate value and provide navigation.
- **Acceptance criteria:**
  - Active Projects count card
  - Open Tickets count card
  - Overdue Items count card
  - Projects by PIPS Step bar chart (how many projects in each step)
  - Recent Activity feed (last 10 activities across projects and tickets)
  - Quick actions: New Project, New Ticket
- **Estimated complexity:** M
- **Dependencies:** T1-06, T1-12

#### T1-16: User Profile (Basic)

- **Description:** Display name, email, avatar. Notification preferences (on/off for email).
- **Why it's in the MVP:** Users need to be identifiable. Avatars appear on ticket cards and team lists.
- **Acceptance criteria:**
  - Edit display name
  - Upload avatar (max 5 MB, stored in Supabase Storage)
  - View email (not editable in MVP -- requires re-verification flow)
  - Toggle email notifications on/off
- **Estimated complexity:** S
- **Dependencies:** T1-01

#### T1-17: In-App Notifications (Basic)

- **Description:** Notification bell with unread count. Notification dropdown with recent items. Mark as read.
- **Why it's in the MVP:** Users need to know when they are assigned to tickets, mentioned in comments, or when project steps advance.
- **Acceptance criteria:**
  - Bell icon in header with unread count badge
  - Dropdown shows last 20 notifications
  - Notification types: assigned to ticket, mentioned in comment, project step advanced
  - Click notification navigates to the relevant entity
  - Mark individual as read; mark all as read
  - Notifications created via database triggers on relevant mutations
- **Estimated complexity:** M
- **Dependencies:** T1-01, T1-12

#### T1-18: Design Token System

- **Description:** CSS custom properties for all colors, typography, spacing. PIPS brand identity (indigo-violet palette, DM Sans, 6-step colors). Theming foundation for future white-label.
- **Why it's in the MVP:** Hardcoding colors creates debt that touches every component when white-label is added. The design token system must be foundational.
- **Acceptance criteria:**
  - All colors from BRAND_GUIDE_V2.md implemented as CSS custom properties
  - DM Sans loaded via next/font (400, 500, 600, 700)
  - JetBrains Mono for code/monospace contexts
  - 6-step colors available as tokens (`--pips-step-1` through `--pips-step-6`)
  - Semantic colors: success, warning, error, info
  - Neutral palette: 10-stop violet-tinted scale
  - Dark mode support via `.dark` class toggle (colors swap via CSS variables)
  - shadcn/ui customized to use PIPS tokens (not default zinc/slate)
  - Tailwind config extended with PIPS custom colors
- **Estimated complexity:** M
- **Dependencies:** None (can be Sprint 0)

#### T1-19: Global Search (Basic)

- **Description:** Search bar in header (Cmd/Ctrl+K). Search across tickets and projects by title/description.
- **Why it's in the MVP:** Users need to find things. Even with a few projects and tickets, search is expected functionality.
- **Acceptance criteria:**
  - Command palette triggered by Cmd/Ctrl+K or clicking search icon
  - Searches tickets (title, description) and projects (title, description)
  - Results grouped by type with counts
  - Powered by Postgres full-text search (tsvector already in schema)
  - Click result navigates to entity
  - Debounced input (300ms)
- **Estimated complexity:** M
- **Dependencies:** T1-06, T1-12

#### T1-20: Audit Logging

- **Description:** Every data mutation logged with timestamp, actor, entity type, entity ID, old/new values. Populated via database triggers.
- **Why it's in the MVP:** Audit logging is a foundation requirement. Retrofitting triggers on every table later is error-prone and risks missing data. Enterprise customers will ask for this in their security review.
- **Acceptance criteria:**
  - Database triggers on INSERT/UPDATE/DELETE for: organizations, projects, project_steps, project_forms, tickets, comments, org_members, team_members
  - Audit log entries include: org_id, user_id, action, entity_type, entity_id, old_data, new_data, created_at
  - Audit log table has RLS: only Owner/Admin can read
  - No UI for audit log in MVP (admin can query via Supabase Studio)
- **Estimated complexity:** M
- **Dependencies:** Database schema deployed

### Tier 2: Should Have (MVP works without them but the demo suffers)

#### T2-01: List View for Tickets

- **Description:** Sortable table view of tickets with columns for ID, title, status, priority, assignee, due date.
- **Why it matters for the demo:** Some users prefer list view over board view. Shows the product handles both paradigms.
- **Acceptance criteria:**
  - Table with sortable columns: ID, title, status, priority, assignee, due date, created date
  - Click column header to sort ascending/descending
  - Row click opens ticket detail
  - Pagination: 50 per page
  - Row selection with checkboxes for bulk status change
- **Estimated complexity:** M
- **Dependencies:** T1-12

#### T2-02: My Work View

- **Description:** Personal dashboard showing all tickets assigned to current user across all projects.
- **Why it matters for the demo:** Demonstrates individual accountability. "Here's everything on your plate, organized by urgency."
- **Acceptance criteria:**
  - Sections: Overdue, Due Today, Due This Week, Due Later, No Due Date
  - PIPS project cards: current step, project name, next action needed
  - Click any item to navigate to it
- **Estimated complexity:** M
- **Dependencies:** T1-06, T1-12

#### T2-03: Project Detail Overview Page

- **Description:** Project overview page with PIPS step stepper, summary stats, team members, recent activity.
- **Why it matters for the demo:** Provides the project-level view that contextualizes the 6-step workflow.
- **Acceptance criteria:**
  - Project header: title, status, priority, dates, owner, team
  - PIPS step stepper (clickable to navigate to step)
  - Summary stats: tickets created, tickets completed, days active
  - Team members list with roles
  - Recent activity feed (last 10 events for this project)
  - Sub-navigation tabs: Overview, Board, Forms
- **Estimated complexity:** M
- **Dependencies:** T1-06, T1-12

#### T2-04: Email Notifications

- **Description:** Send email notifications for key events: ticket assignment, @mention, project step advance.
- **Why it matters:** Users need to be pulled back into the product. Without email notifications, they will forget about assigned work.
- **Acceptance criteria:**
  - Email sent via Resend for: ticket assigned, @mentioned in comment, project step advanced
  - Emails use PIPS branding (logo, colors from design tokens)
  - Email includes direct link to the relevant entity
  - Respects user notification preferences (on/off toggle from T1-16)
  - Rate limited: max 1 email per entity per user per 5 minutes (no spam)
- **Estimated complexity:** M
- **Dependencies:** T1-17, T1-16

#### T2-05: Ticket Detail Page

- **Description:** Full ticket detail view with all fields, comments, activity log, parent/child links.
- **Why it matters:** Clicking a ticket on the board must show comprehensive details. This is table-stakes for any ticket system.
- **Acceptance criteria:**
  - All ticket fields displayed and editable (by role)
  - Comments section with add/edit/delete (by author)
  - @mention autocomplete in comments
  - Activity log: timestamped changes
  - Parent/child links (click to navigate)
  - PIPS context: if ticket is linked to a project, show project name and step
  - Sidebar or breadcrumb back to board/list
- **Estimated complexity:** L
- **Dependencies:** T1-12

#### T2-06: Worked Example (Parking Lot Scenario)

- **Description:** Pre-filled sample project using the "Parking Lot" scenario from existing PIPS content. All 6 steps populated with realistic data.
- **Why it matters for the demo:** Lets users see what a completed project looks like before they start their own. Massively reduces time-to-understanding.
- **Acceptance criteria:**
  - "Try a Sample Project" button on dashboard or onboarding
  - Creates a read-only project with all 6 steps populated using Parking Lot scenario data from CONTENT_MIGRATION.md
  - Each step shows completed forms with realistic data
  - User can browse all steps and forms but cannot edit
  - Clearly labeled as "Sample Project"
- **Estimated complexity:** M
- **Dependencies:** T1-06, T1-07 through T1-14

#### T2-07: Force Field Analysis Tool (Step 2)

- **Description:** Visual two-column layout (driving forces vs. restraining forces) with strength bars (scored 1-5).
- **Why it matters:** Adds analytical depth to Step 2. The visual balance chart is compelling in demos.
- **Acceptance criteria:**
  - Two-column layout: driving forces (left) and restraining forces (right)
  - Each force has description and strength (1-5)
  - Visual strength bars
  - Auto-calculated totals for each side
  - Strategy notes field
  - Data stored in `project_forms`
- **Estimated complexity:** M
- **Dependencies:** T1-08

#### T2-08: Quick Filters and Saved Filters

- **Description:** One-click sidebar filters (My Open Tickets, Overdue, Unassigned). Save filter configurations.
- **Why it matters:** Reduces friction for daily use. Shows product maturity.
- **Acceptance criteria:**
  - Sidebar quick filters: My Open Tickets, Overdue, Created by Me, Unassigned
  - Advanced filter panel: status, assignee, priority, date range, project
  - Filter state reflected in URL query params (shareable)
  - Save filter with name (per user)
- **Estimated complexity:** M
- **Dependencies:** T1-12

### Tier 3: Nice to Have (Include if time permits, defer if not)

#### T3-01: Dark Mode

- **Description:** Toggle between light and dark mode. Uses BRAND_GUIDE_V2.md dark mode color mappings.
- **Why it might be included:** The design token system (T1-18) makes this relatively easy. Developers love dark mode.
- **Acceptance criteria:**
  - Toggle in header or settings
  - Persisted per user (localStorage or profile)
  - All components render correctly in both modes
  - Step colors use dark mode variants from brand guide
- **Estimated complexity:** M
- **Dependencies:** T1-18

#### T3-02: Paired Comparisons Tool (Step 4)

- **Description:** Compare solutions head-to-head, generate ranking.
- **Why it might be included:** Adds another decision tool to Step 4. Useful but criteria rating matrix covers the core need.
- **Acceptance criteria:** Head-to-head comparison matrix, win counts, auto-ranking.
- **Estimated complexity:** S
- **Dependencies:** T1-10

#### T3-03: Balance Sheet Tool (Step 6)

- **Description:** Categorize outcomes as positive, negative, neutral.
- **Why it might be included:** Quick to build, adds depth to evaluation.
- **Acceptance criteria:** Three columns (positive/negative/neutral), items addable to each.
- **Estimated complexity:** S
- **Dependencies:** T1-14

#### T3-04: Checksheet Tool (Step 2)

- **Description:** Define categories, count occurrences, auto-generate basic frequency visualization.
- **Why it might be included:** Classic data collection tool. Simple to build.
- **Acceptance criteria:** Category rows, time-period columns, tally cells, totals.
- **Estimated complexity:** S
- **Dependencies:** T1-08

#### T3-05: Onboarding Tour

- **Description:** 5-step guided tour on first login: welcome, create project, navigate, forms, settings.
- **Why it might be included:** Reduces time-to-value for new users.
- **Acceptance criteria:** Step-by-step overlay highlighting key UI elements. Dismissable. Shown once.
- **Estimated complexity:** M
- **Dependencies:** T1-15

#### T3-06: PDF Export (Project Summary)

- **Description:** Export a project summary to PDF with all 6 steps' data.
- **Why it might be included:** Users need to share results with stakeholders who do not have PIPS accounts.
- **Acceptance criteria:** Generates styled PDF with project overview, each step's key data, and evaluation results. PIPS branding.
- **Estimated complexity:** M
- **Dependencies:** T1-06

---

## 3. MVP Feature Set -- What's OUT (and Why)

### White-Label System

- **Why deferred:** Phase 5 feature (Week 35-42 per roadmap). Requires custom domain routing, CNAME handling, SSL provisioning, per-org CSS injection, branded email templates. Significant infrastructure work with zero value for the initial product-market fit test.
- **Moves to:** Phase 5
- **Foundation work NOW:** The design token system (T1-18) uses CSS custom properties. All colors and brand elements are referenced via tokens, never hardcoded. This means white-label is a matter of swapping token values per org, not touching components. The `org_settings` table already has columns for `brand_name`, `primary_color`, `secondary_color`, `logo_dark_url`, `logo_light_url`, `custom_domain`. These columns exist in the schema but are unused in MVP.

### Integrations (Jira, Azure DevOps, AHA!, Slack, Teams)

- **Why deferred:** Phase 4 feature (Week 27-34). Requires OAuth flows, field mapping engines, sync conflict resolution, webhook handlers, and integration-specific APIs. Massive scope with no bearing on core value prop validation.
- **Moves to:** Phase 4
- **Foundation work NOW:** The `integration_connections` table exists in the schema with the correct column structure. The `integration_provider` enum includes Jira, Azure DevOps, AHA!. Ticket schema has `external_id`, `external_url`, `external_source` columns. No code touches these fields in MVP, but they are there for Phase 4.

### Custom Form Builder

- **Why deferred:** Phase 3 feature. The MVP ships with pre-built form templates for each step. A drag-and-drop form builder is a major UI/UX effort (field palette, conditional logic, validation rules, versioning).
- **Moves to:** Phase 3
- **Foundation work NOW:** All forms use `project_forms` table with `form_type` discriminator and JSONB `data` column. Custom forms would use the same table with `form_type = 'custom'` and a `form_template` reference. No schema changes needed.

### Analytics Dashboard (Advanced)

- **Why deferred:** Phase 3 feature. Advanced analytics (cycle time trends, step duration analysis, tool usage stats, impact tracking, executive summary) require historical data that the MVP will not have at launch.
- **Moves to:** Phase 3
- **Foundation work NOW:** The `audit_log` and timestamped fields on projects/tickets provide the raw data. The MVP dashboard (T1-15) shows basic counts and project-by-step chart, proving the UI pattern.

### Real-Time Collaborative Editing

- **Why deferred:** Phase 2+ feature. Real-time multi-user editing with cursor presence requires CRDT or operational transform implementation, WebSocket connection management, and significant conflict resolution logic. Lock-based editing (one editor at a time) is acceptable for MVP.
- **Moves to:** Phase 2 (lock-based editing in MVP, real-time in Phase 2)
- **Foundation work NOW:** Forms auto-save via Supabase. Real-time would use Supabase Realtime channels -- the client library is already installed. No schema changes needed.

### SSO/SAML

- **Why deferred:** Enterprise feature. Supabase Auth supports SAML but configuration is per-org. No MVP customer will block on SSO.
- **Moves to:** Phase 5 (Enterprise tier)
- **Foundation work NOW:** Auth uses Supabase Auth, which has built-in SAML support. Adding SSO is a configuration change, not an architecture change.

### API Keys and REST API

- **Why deferred:** Phase 4 feature. The API surface is used internally by the Next.js app via API routes. A public REST API with key auth, rate limiting, versioning, and documentation is a separate product surface.
- **Moves to:** Phase 4
- **Foundation work NOW:** `org_api_keys` table exists in schema. API routes use consistent patterns (`/api/v1/...`) that will become the public API.

### Webhooks (Outbound)

- **Why deferred:** Phase 4 feature. No MVP user needs outbound webhooks.
- **Moves to:** Phase 4
- **Foundation work NOW:** `webhook_subscriptions` and `webhook_deliveries` tables exist in schema. Audit log triggers provide the event source.

### Sprint/Iteration Management

- **Why deferred:** Phase 2 feature. Sprints add significant complexity (sprint planning, velocity tracking, burndown charts) without validating the core PIPS methodology value.
- **Moves to:** Phase 2
- **Foundation work NOW:** Tickets have `tags` field that could informally group work. No sprint-specific columns needed yet.

### Timeline/Gantt View

- **Why deferred:** Phase 2 feature. Complex interactive UI (horizontal bar chart, dependency arrows, drag-to-resize) with minimal validation value.
- **Moves to:** Phase 2
- **Foundation work NOW:** Tickets have `due_date` and `started_at` fields. `ticket_relations` table supports `blocks`/`blocked_by` relationships for future dependency arrows.

### Calendar View

- **Why deferred:** Phase 2 feature.
- **Moves to:** Phase 2
- **Foundation work NOW:** Same date fields as timeline view.

### Custom Status Workflows

- **Why deferred:** Phase 2 feature. The default status workflow (Backlog > To Do > In Progress > In Review > Done) is sufficient for MVP.
- **Moves to:** Phase 2
- **Foundation work NOW:** `ticket_status` is an enum. Custom workflows would require a workflow definition table and transition rules. The enum approach works for MVP and can be migrated to a table-based system later.

### Bulk CSV Import

- **Why deferred:** Complexity vs. value. Manual ticket creation is fine for teams of 5-20 in the first month.
- **Moves to:** Phase 2
- **Foundation work NOW:** None needed.

### Multi-Factor Authentication (MFA)

- **Why deferred:** Security enhancement. Not blocking for initial adoption. Supabase Auth supports TOTP MFA natively.
- **Moves to:** Phase 2
- **Foundation work NOW:** None. Supabase Auth handles it when enabled.

### Brainwriting Tool (Step 3)

- **Why deferred:** The brainstorming workspace covers the core need. Brainwriting (round-robin, timed rounds, anonymous mode) is a distinct UX that adds development time without materially improving the demo.
- **Moves to:** Phase 2
- **Foundation work NOW:** `project_forms` with `form_type = 'brainwriting'` would use the same table. No schema changes.

### Survey Builder (Step 2)

- **Why deferred:** Complex feature (question types, distribution via link, response aggregation). The fishbone and 5-Why tools cover root cause analysis for MVP.
- **Moves to:** Phase 3
- **Foundation work NOW:** None needed.

### Meeting Agenda Template (Step 5)

- **Why deferred:** Nice but not core. Users can use any meeting tool alongside PIPS.
- **Moves to:** Phase 2
- **Foundation work NOW:** None needed.

### Weighted Voting Tool (Step 4)

- **Why deferred:** The criteria rating matrix covers decision-making. Weighted voting is supplementary.
- **Moves to:** Phase 2
- **Foundation work NOW:** None needed.

### Team Workload View

- **Why deferred:** Phase 2. Requires ticket-per-assignee aggregation and heatmap visualization.
- **Moves to:** Phase 2
- **Foundation work NOW:** Ticket assignee data exists.

### Executive Summary / Shareable Links

- **Why deferred:** Phase 3. Requires public page rendering without auth, token-based access.
- **Moves to:** Phase 3
- **Foundation work NOW:** None needed.

### Billing / Stripe Integration

- **Why deferred:** MVP launches as free beta. Billing adds significant scope (checkout flow, customer portal, webhook handling, usage enforcement). Once product-market fit is validated, billing becomes Sprint 1 of the next phase.
- **Moves to:** Phase 2
- **Foundation work NOW:** `organizations` table has `stripe_customer_id` and `stripe_subscription_id` columns. `org_plan` enum has `free`, `starter`, `professional`, `enterprise` values. The schema is ready.

---

## 4. Technical MVP Architecture

### Stack (MVP-Specific)

| Layer               | Technology                                      | Notes                                                            |
| ------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| **Framework**       | Next.js 16 (App Router)                         | SSR + RSC for data fetching, Client Components for interactivity |
| **Language**        | TypeScript 5.7+ (strict mode)                   | Non-negotiable per Marc's preferences                            |
| **Backend**         | Supabase (Auth, Postgres 15, Storage, Realtime) | Single backend platform                                          |
| **Database**        | PostgreSQL 15 with RLS                          | Shared schema, org_id on every table                             |
| **Hosting**         | Vercel (Pro plan)                               | SSR, preview deployments, custom domains                         |
| **UI Components**   | shadcn/ui + Radix primitives                    | Accessible, customizable                                         |
| **Styling**         | Tailwind CSS 4.x + CSS custom properties        | Design tokens for white-label readiness                          |
| **State**           | Zustand 5.x                                     | Client-side state for forms, board drag state                    |
| **Forms**           | React Hook Form + Zod                           | Type-safe validation                                             |
| **Email**           | Resend                                          | Transactional emails (verification, invitations, notifications)  |
| **Error Tracking**  | Sentry                                          | Runtime error monitoring                                         |
| **Charts**          | Recharts 2.x                                    | Dashboard visualizations                                         |
| **Package Manager** | pnpm                                            | Faster, stricter                                                 |
| **Monorepo**        | Turborepo                                       | Build orchestration                                              |
| **Testing**         | Vitest (unit) + Playwright (e2e)                | Test infrastructure from day one                                 |

### MVP Database Tables (14 of 20+ in full schema)

These tables are needed for MVP:

1. `profiles` -- User profiles (extends auth.users)
2. `organizations` -- Multi-tenant orgs
3. `org_members` -- User-org join table with roles
4. `org_invitations` -- Pending invitations
5. `org_settings` -- Org configuration (minimal use in MVP, but schema must exist)
6. `teams` -- Teams within an org
7. `team_members` -- Team membership
8. `projects` -- PIPS projects
9. `project_members` -- Project team assignment
10. `project_steps` -- 6 steps per project with JSONB data
11. `project_forms` -- Digital form instances (fishbone, brainstorming, criteria rating, etc.)
12. `tickets` -- Tickets (PIPS and general)
13. `comments` -- Comments on tickets/projects/steps
14. `notifications` -- In-app notifications
15. `audit_log` -- Immutable audit trail

**Tables deferred to later phases:**

- `ticket_relations` -- Include in schema but minimal UI (parent_id on tickets handles basic hierarchy)
- `ticket_transitions` -- Include in schema (populated by triggers) but no dedicated UI
- `file_attachments` -- Defer file upload UI, but include schema
- `integration_connections` -- Schema only, no code
- `org_api_keys` -- Schema only, no code
- `webhook_subscriptions` / `webhook_deliveries` -- Schema only, no code

### MVP API Endpoints

All API routes live under `apps/web/src/app/api/v1/`.

#### Auth (handled by Supabase Auth, but we need callback routes)

- `POST /api/auth/callback` -- Supabase auth callback (email verification, password reset)

#### Organizations

- `GET /api/v1/orgs` -- List user's organizations
- `POST /api/v1/orgs` -- Create organization
- `GET /api/v1/orgs/[orgId]` -- Get organization details
- `PATCH /api/v1/orgs/[orgId]` -- Update organization settings
- `POST /api/v1/orgs/[orgId]/invitations` -- Send invitation
- `GET /api/v1/orgs/[orgId]/invitations` -- List pending invitations
- `DELETE /api/v1/orgs/[orgId]/invitations/[inviteId]` -- Revoke invitation
- `POST /api/v1/orgs/[orgId]/invitations/[token]/accept` -- Accept invitation
- `GET /api/v1/orgs/[orgId]/members` -- List org members
- `PATCH /api/v1/orgs/[orgId]/members/[memberId]` -- Update member role
- `DELETE /api/v1/orgs/[orgId]/members/[memberId]` -- Remove member

#### Teams

- `GET /api/v1/orgs/[orgId]/teams` -- List teams
- `POST /api/v1/orgs/[orgId]/teams` -- Create team
- `PATCH /api/v1/orgs/[orgId]/teams/[teamId]` -- Update team
- `DELETE /api/v1/orgs/[orgId]/teams/[teamId]` -- Delete team
- `POST /api/v1/orgs/[orgId]/teams/[teamId]/members` -- Add member
- `DELETE /api/v1/orgs/[orgId]/teams/[teamId]/members/[userId]` -- Remove member

#### Projects

- `GET /api/v1/orgs/[orgId]/projects` -- List projects (with filters)
- `POST /api/v1/orgs/[orgId]/projects` -- Create project (auto-creates 6 steps)
- `GET /api/v1/orgs/[orgId]/projects/[projectId]` -- Get project with steps
- `PATCH /api/v1/orgs/[orgId]/projects/[projectId]` -- Update project
- `DELETE /api/v1/orgs/[orgId]/projects/[projectId]` -- Delete/archive project
- `PATCH /api/v1/orgs/[orgId]/projects/[projectId]/steps/[step]` -- Update step data
- `POST /api/v1/orgs/[orgId]/projects/[projectId]/steps/[step]/advance` -- Advance to next step
- `GET /api/v1/orgs/[orgId]/projects/[projectId]/members` -- List project members
- `POST /api/v1/orgs/[orgId]/projects/[projectId]/members` -- Add project member

#### Forms

- `GET /api/v1/orgs/[orgId]/projects/[projectId]/forms` -- List forms for project
- `POST /api/v1/orgs/[orgId]/projects/[projectId]/forms` -- Create form instance
- `GET /api/v1/orgs/[orgId]/projects/[projectId]/forms/[formId]` -- Get form data
- `PATCH /api/v1/orgs/[orgId]/projects/[projectId]/forms/[formId]` -- Update form data (auto-save)
- `DELETE /api/v1/orgs/[orgId]/projects/[projectId]/forms/[formId]` -- Delete form

#### Tickets

- `GET /api/v1/orgs/[orgId]/tickets` -- List tickets (with filters, pagination)
- `POST /api/v1/orgs/[orgId]/tickets` -- Create ticket
- `GET /api/v1/orgs/[orgId]/tickets/[ticketId]` -- Get ticket detail
- `PATCH /api/v1/orgs/[orgId]/tickets/[ticketId]` -- Update ticket
- `DELETE /api/v1/orgs/[orgId]/tickets/[ticketId]` -- Delete ticket
- `POST /api/v1/orgs/[orgId]/tickets/[ticketId]/comments` -- Add comment
- `PATCH /api/v1/orgs/[orgId]/tickets/[ticketId]/comments/[commentId]` -- Edit comment
- `DELETE /api/v1/orgs/[orgId]/tickets/[ticketId]/comments/[commentId]` -- Delete comment
- `POST /api/v1/orgs/[orgId]/tickets/bulk` -- Bulk create tickets (from implementation checklist)

#### Notifications

- `GET /api/v1/notifications` -- List user's notifications
- `PATCH /api/v1/notifications/[notifId]/read` -- Mark as read
- `POST /api/v1/notifications/read-all` -- Mark all as read

#### Search

- `GET /api/v1/orgs/[orgId]/search?q=...` -- Global search across tickets and projects

#### Profile

- `GET /api/v1/profile` -- Get current user profile
- `PATCH /api/v1/profile` -- Update profile
- `POST /api/v1/profile/avatar` -- Upload avatar

### MVP Pages/Routes

See [Section 6: MVP Page Map](#6-mvp-page-map) for full details.

### Auth Flows Implemented

1. **Sign up:** Email + password > verification email > confirm > onboarding (create org)
2. **Log in:** Email + password > JWT issued > redirect to dashboard
3. **Password reset:** Request > email with reset link > new password form > redirect to login
4. **Session refresh:** Middleware refreshes access token from refresh token on each request
5. **Invitation accept:** Click link > if account exists, auto-join org; if not, sign up then auto-join

### Active RLS Policies

RLS is enabled on ALL 15 MVP tables. Key policies from TECHNICAL_PLAN.md Section 5.1:

- **organizations:** Users can only SELECT orgs they belong to. Only Owner/Admin can UPDATE.
- **org_members:** Users can only SELECT members of their orgs. Only Owner/Admin can INSERT/UPDATE/DELETE.
- **tickets:** Org members can SELECT. Members+ can INSERT (reporter_id = auth.uid()). Members+ can UPDATE. Only Admin+ can DELETE.
- **projects:** Org members can SELECT. Members+ can INSERT (owner_id = auth.uid()). Project owner and Manager+ can UPDATE.
- **comments:** Org members can SELECT. Authenticated users can INSERT in their org. Authors can UPDATE their own. Authors and Admin+ can DELETE.
- **audit_log:** Only Owner/Admin can SELECT. No INSERT/UPDATE/DELETE policies (trigger-only writes).
- **notifications:** Users can only SELECT their own notifications.

### MVP Project Structure

```
pips2/
├── apps/
│   └── web/                          # Next.js 16 app
│       ├── src/
│       │   ├── app/                  # App Router
│       │   │   ├── (auth)/           # Auth pages (no sidebar)
│       │   │   │   ├── login/
│       │   │   │   ├── signup/
│       │   │   │   ├── forgot-password/
│       │   │   │   ├── reset-password/
│       │   │   │   └── verify-email/
│       │   │   ├── (onboarding)/     # Post-signup flow
│       │   │   │   └── setup/
│       │   │   ├── (app)/            # Authenticated app shell
│       │   │   │   └── [orgSlug]/    # Org-scoped routes
│       │   │   │       ├── dashboard/
│       │   │   │       ├── projects/
│       │   │   │       │   ├── [projectId]/
│       │   │   │       │   │   ├── overview/
│       │   │   │       │   │   ├── steps/
│       │   │   │       │   │   │   └── [step]/
│       │   │   │       │   │   ├── board/
│       │   │   │       │   │   └── forms/
│       │   │   │       │   │       └── [formId]/
│       │   │   │       │   └── new/
│       │   │   │       ├── tickets/
│       │   │   │       │   ├── [ticketId]/
│       │   │   │       │   ├── board/
│       │   │   │       │   └── list/
│       │   │   │       ├── my-work/
│       │   │   │       ├── teams/
│       │   │   │       │   └── [teamId]/
│       │   │   │       ├── members/
│       │   │   │       └── settings/
│       │   │   ├── api/
│       │   │   │   ├── auth/
│       │   │   │   │   └── callback/
│       │   │   │   └── v1/
│       │   │   │       ├── orgs/
│       │   │   │       ├── notifications/
│       │   │   │       ├── profile/
│       │   │   │       └── search/ (unused -- handled as server action)
│       │   │   ├── invite/
│       │   │   │   └── [token]/
│       │   │   └── layout.tsx
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui base components
│       │   │   ├── auth/             # Login, signup, password forms
│       │   │   ├── dashboard/        # Dashboard widgets
│       │   │   ├── layout/           # Sidebar, header, nav
│       │   │   ├── projects/         # Project list, creation, detail
│       │   │   ├── pips/             # PIPS step components
│       │   │   │   ├── step-stepper.tsx
│       │   │   │   ├── step-1-identify/
│       │   │   │   ├── step-2-analyze/
│       │   │   │   ├── step-3-generate/
│       │   │   │   ├── step-4-select/
│       │   │   │   ├── step-5-implement/
│       │   │   │   └── step-6-evaluate/
│       │   │   ├── forms/            # PIPS form components
│       │   │   │   ├── fishbone-diagram.tsx
│       │   │   │   ├── five-why-analysis.tsx
│       │   │   │   ├── brainstorming-workspace.tsx
│       │   │   │   ├── criteria-rating-matrix.tsx
│       │   │   │   ├── cost-benefit-analysis.tsx
│       │   │   │   ├── raci-matrix.tsx
│       │   │   │   ├── implementation-checklist.tsx
│       │   │   │   ├── force-field-analysis.tsx
│       │   │   │   ├── evaluation-form.tsx
│       │   │   │   ├── before-after-comparison.tsx
│       │   │   │   └── lessons-learned.tsx
│       │   │   ├── tickets/          # Ticket components
│       │   │   │   ├── ticket-card.tsx
│       │   │   │   ├── ticket-detail.tsx
│       │   │   │   ├── kanban-board.tsx
│       │   │   │   ├── ticket-list.tsx
│       │   │   │   └── ticket-create.tsx
│       │   │   ├── teams/            # Team management
│       │   │   ├── members/          # Member management
│       │   │   ├── notifications/    # Notification bell, dropdown
│       │   │   └── search/           # Command palette
│       │   ├── hooks/
│       │   │   ├── use-auth.ts
│       │   │   ├── use-org.ts
│       │   │   ├── use-project.ts
│       │   │   ├── use-tickets.ts
│       │   │   ├── use-notifications.ts
│       │   │   └── use-search.ts
│       │   ├── lib/
│       │   │   ├── supabase/         # Supabase client files
│       │   │   ├── validations/      # Zod schemas
│       │   │   ├── utils.ts          # cn() and helpers
│       │   │   └── constants.ts      # PIPS steps, roles, statuses
│       │   ├── stores/               # Zustand stores
│       │   ├── styles/
│       │   │   └── globals.css       # Tailwind + design tokens
│       │   └── test/
│       │       └── setup.ts
│       ├── public/
│       │   ├── fonts/
│       │   └── images/
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       └── playwright.config.ts
├── packages/
│   └── shared/                       # Shared types, utils, constants
│       └── src/
│           ├── types/
│           │   └── database.ts       # Auto-generated from Supabase
│           ├── utils/
│           └── constants/
│               ├── pips-steps.ts
│               ├── roles.ts
│               └── statuses.ts
├── supabase/
│   ├── migrations/                   # SQL migrations
│   ├── functions/                    # Edge functions (future)
│   ├── seed.sql                      # Dev seed data
│   └── config.toml
├── tests/
│   ├── e2e/                          # Playwright tests
│   └── integration/
├── .github/
│   └── workflows/
│       └── ci.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── CLAUDE.md
├── WORK_LOG.md
└── .env.example
```

### MVP Testing Requirements

- **TypeScript:** `tsc --noEmit` must pass with zero errors
- **Unit tests (Vitest):** All Zod validation schemas, utility functions, permission checks, and PIPS step completion logic must have tests. Target: 60%+ coverage on `lib/` and `hooks/`
- **Component tests (Vitest + React Testing Library):** Key form components (fishbone, criteria matrix, brainstorming) must have render and interaction tests
- **E2E tests (Playwright):** 5 critical user flows:
  1. Sign up > create org > land on dashboard
  2. Create project > complete Step 1 > advance to Step 2
  3. Create ticket > move through statuses on board
  4. Invite user > accept invitation > join org
  5. Complete full 6-step project lifecycle
- **ESLint:** Zero errors. Warnings reviewed and addressed or documented.
- **Build:** `pnpm build` must succeed.

---

## 5. MVP Database Schema

The full schema from TECHNICAL_PLAN.md Sections 3.2-3.8 is deployed in a single initial migration. All tables are created, even those not used in MVP, because:

1. Removing columns/tables later is easy; adding them requires migrations
2. The schema is the contract -- agents build against it
3. RLS policies are defined once, correctly

Below are the **MVP-essential tables** with annotations on which columns are actively used versus reserved for later phases.

### Extensions and Enums

```sql
-- ============================================================
-- EXTENSIONS (all needed for MVP)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- Crypto functions

-- ============================================================
-- ENUMS (all defined; some values unused in MVP)
-- ============================================================
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'manager', 'member', 'viewer');
CREATE TYPE org_plan AS ENUM ('free', 'starter', 'professional', 'enterprise');
-- MVP: all orgs are 'free'
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');
CREATE TYPE ticket_status AS ENUM (
  'backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled'
);
-- MVP: 'blocked' and 'cancelled' exist but are not surfaced prominently
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
-- MVP: unused, but defined to avoid migration when integrations are added
CREATE TYPE sync_direction AS ENUM ('inbound', 'outbound', 'bidirectional');
-- MVP: unused
```

### Core Tables (MVP-essential)

The full CREATE TABLE statements are in TECHNICAL_PLAN.md Sections 3.2-3.8. Rather than duplicate the entire SQL here, the following annotates each table's MVP relevance:

| Table                     | MVP Status                     | MVP-Essential Columns                                                                                                                                                                               | Columns Reserved for Later                                                                                                                                         |
| ------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `profiles`                | **Active**                     | id, email, full_name, display_name, avatar_url, timezone, created_at, updated_at                                                                                                                    | None -- all columns used                                                                                                                                           |
| `organizations`           | **Active**                     | id, name, slug, plan (always 'free'), logo_url, created_by, max_members, created_at, updated_at                                                                                                     | stripe_customer_id, stripe_subscription_id (Phase 2 billing)                                                                                                       |
| `org_members`             | **Active**                     | All columns                                                                                                                                                                                         | None                                                                                                                                                               |
| `org_invitations`         | **Active**                     | All columns                                                                                                                                                                                         | None                                                                                                                                                               |
| `org_settings`            | **Schema only**                | id, org_id, primary_color, secondary_color, features                                                                                                                                                | brand_name, logo_dark_url, logo_light_url, favicon_url, custom_css, custom_domain, email_from_name, email_reply_to, step_labels, step_colors (Phase 5 white-label) |
| `teams`                   | **Active**                     | All columns                                                                                                                                                                                         | None                                                                                                                                                               |
| `team_members`            | **Active**                     | All columns                                                                                                                                                                                         | None                                                                                                                                                               |
| `projects`                | **Active**                     | id, org_id, title, description, status, current_step, owner_id, team_id, problem_statement, target_start, target_end, priority, tags, metadata, search_vector, created_at, updated_at, completed_at | actual_start, actual_end (nice to have, can populate later)                                                                                                        |
| `project_members`         | **Active**                     | All columns                                                                                                                                                                                         | None                                                                                                                                                               |
| `project_steps`           | **Active**                     | All columns                                                                                                                                                                                         | None                                                                                                                                                               |
| `project_forms`           | **Active**                     | All columns                                                                                                                                                                                         | None                                                                                                                                                               |
| `tickets`                 | **Active**                     | id, org_id, sequence_number, project_id, parent_id, title, description, type, status, priority, pips_step, assignee_id, reporter_id, team_id, due_date, tags, search_vector, created_at, updated_at | started_at, resolved_at, estimate_hours, actual_hours, story_points, custom_fields, external_id, external_url, external_source (Phase 2-4)                         |
| `ticket_relations`        | **Schema only**                | source_id, target_id, relation_type                                                                                                                                                                 | Full table exists but no UI in MVP                                                                                                                                 |
| `ticket_transitions`      | **Schema only**                | All columns (populated by triggers)                                                                                                                                                                 | No UI in MVP; data accumulates for Phase 3 analytics                                                                                                               |
| `comments`                | **Active**                     | id, org_id, ticket_id, project_id, step_id, author_id, body, parent_id, mentions, created_at, updated_at                                                                                            | body_html, edited_at (Phase 2 rich text editing)                                                                                                                   |
| `file_attachments`        | **Schema only**                | All columns defined                                                                                                                                                                                 | No upload UI in MVP                                                                                                                                                |
| `notifications`           | **Active**                     | All columns                                                                                                                                                                                         | None                                                                                                                                                               |
| `audit_log`               | **Active (trigger-populated)** | All columns                                                                                                                                                                                         | No viewer UI in MVP                                                                                                                                                |
| `integration_connections` | **Schema only**                | All columns defined                                                                                                                                                                                 | Phase 4                                                                                                                                                            |
| `org_api_keys`            | **Schema only**                | All columns defined                                                                                                                                                                                 | Phase 4                                                                                                                                                            |
| `webhook_subscriptions`   | **Schema only**                | All columns defined                                                                                                                                                                                 | Phase 4                                                                                                                                                            |

### RLS Policies (MVP-Essential)

All RLS policies from TECHNICAL_PLAN.md Section 5.1 are deployed in the initial migration. The helper functions `user_org_ids()` and `user_has_org_role()` are the foundation for all policies. Key policies summarized above in Section 4.

### Essential Indexes

All indexes from the TECHNICAL_PLAN.md schema are created in the initial migration. Performance-critical for MVP:

- `idx_tickets_org` -- Ticket listing by org
- `idx_tickets_project` -- Tickets within a project
- `idx_tickets_assignee` -- My Work view
- `idx_tickets_status` -- Board view
- `idx_tickets_search` -- Global search
- `idx_projects_org` -- Project listing
- `idx_projects_status` -- Dashboard project-by-step chart
- `idx_project_steps_project` -- Step data loading
- `idx_project_forms_project` -- Form listing by project
- `idx_notifications_user_unread` -- Notification bell count

### Triggers (MVP-Essential)

- `on_auth_user_created` -- Auto-create profile row on signup
- `ticket_sequence_trigger` -- Auto-generate ticket sequence number per org
- `projects_search_trigger` -- Update search vector on project title/description change
- `tickets_search_trigger` -- Update search vector on ticket title/description change
- Audit log triggers on all 15 MVP tables (INSERT/UPDATE/DELETE)

### Seed Data

`supabase/seed.sql` creates:

- 1 test user (marc@example.com / TestPassword1)
- 1 organization ("PIPS Demo", slug: "pips-demo")
- 1 org_member (owner role)
- 1 team ("Core Team")
- 1 sample project ("Parking Lot Scenario" with all 6 steps populated from CONTENT_MIGRATION.md)
- 5 sample tickets linked to the project

---

## 6. MVP Page Map

### Authentication Pages (no sidebar, centered card layout)

| Route              | Page Name          | What it shows                                                  | Key interactions                  | Components needed        |
| ------------------ | ------------------ | -------------------------------------------------------------- | --------------------------------- | ------------------------ |
| `/login`           | Login              | Email + password form, "Forgot password?" link, "Sign up" link | Submit credentials, error display | `<LoginForm />`          |
| `/signup`          | Sign Up            | Name, email, password form, password strength indicator        | Submit, validation errors         | `<SignupForm />`         |
| `/forgot-password` | Forgot Password    | Email input, "Send reset link" button                          | Submit, success message           | `<ForgotPasswordForm />` |
| `/reset-password`  | Reset Password     | New password + confirm password form                           | Submit, redirect to login         | `<ResetPasswordForm />`  |
| `/verify-email`    | Email Verification | "Check your email" message with resend option                  | Resend verification email         | `<VerifyEmailMessage />` |
| `/invite/[token]`  | Accept Invitation  | Invitation details (org name, role), accept/decline buttons    | Accept (join org), decline        | `<InvitationAccept />`   |

### Onboarding Pages (no sidebar, centered card layout)

| Route    | Page Name          | What it shows                                          | Key interactions        | Components needed  |
| -------- | ------------------ | ------------------------------------------------------ | ----------------------- | ------------------ |
| `/setup` | Organization Setup | Create org form: name, slug (auto-generated), industry | Submit, slug validation | `<OrgSetupForm />` |

### Application Pages (sidebar + header layout)

| Route                                     | Page Name        | What it shows                                                                                                    | Key interactions                                            | Components needed                                                       |
| ----------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| `/[orgSlug]/dashboard`                    | Dashboard        | Active projects count, open tickets count, overdue count, projects-by-step chart, recent activity, quick actions | Click widget to navigate, New Project, New Ticket           | `<DashboardWidgets />`, `<ProjectsByStepChart />`, `<RecentActivity />` |
| `/[orgSlug]/projects`                     | Project List     | Table of all projects: title, status, step, owner, priority, dates                                               | Click row to open project, filter, sort, New Project button | `<ProjectList />`, `<ProjectFilters />`                                 |
| `/[orgSlug]/projects/new`                 | New Project      | Project creation form: title, description, priority, dates, team, members                                        | Submit, validation                                          | `<ProjectCreateForm />`                                                 |
| `/[orgSlug]/projects/[id]/overview`       | Project Overview | Step stepper, summary stats, team, recent activity, sub-nav tabs                                                 | Click step to navigate, tab navigation                      | `<StepStepper />`, `<ProjectSummary />`, `<ProjectTabs />`              |
| `/[orgSlug]/projects/[id]/steps/[step]`   | PIPS Step        | Step objective, prompts, available tools/forms, completion criteria, step data                                   | Fill forms, create form instances, advance step             | `<StepView />`, step-specific form components                           |
| `/[orgSlug]/projects/[id]/board`          | Project Board    | Kanban board scoped to project tickets                                                                           | Drag-drop, quick-add, filter                                | `<KanbanBoard />`                                                       |
| `/[orgSlug]/projects/[id]/forms/[formId]` | Form Instance    | Full form view (fishbone, criteria matrix, etc.)                                                                 | Edit fields, auto-save                                      | Form-specific component                                                 |
| `/[orgSlug]/tickets/board`                | Ticket Board     | Org-wide Kanban board                                                                                            | Drag-drop, quick-add, filter                                | `<KanbanBoard />`                                                       |
| `/[orgSlug]/tickets/list`                 | Ticket List      | Org-wide ticket table                                                                                            | Sort, filter, pagination, bulk select                       | `<TicketListTable />`                                                   |
| `/[orgSlug]/tickets/[id]`                 | Ticket Detail    | Full ticket detail: all fields, comments, activity                                                               | Edit fields, add comment, change status                     | `<TicketDetail />`, `<CommentThread />`, `<ActivityLog />`              |
| `/[orgSlug]/my-work`                      | My Work          | User's assigned tickets grouped by urgency, PIPS project cards                                                   | Click to navigate, quick status change                      | `<MyWorkView />`                                                        |
| `/[orgSlug]/teams`                        | Teams List       | All teams with member count                                                                                      | Create team, click to manage                                | `<TeamsList />`                                                         |
| `/[orgSlug]/teams/[id]`                   | Team Detail      | Team members, assigned projects                                                                                  | Add/remove members                                          | `<TeamDetail />`                                                        |
| `/[orgSlug]/members`                      | Members          | Org members table with roles, invite button                                                                      | Invite, change role, remove                                 | `<MembersList />`, `<InviteModal />`                                    |
| `/[orgSlug]/settings`                     | Org Settings     | Org name, logo, timezone                                                                                         | Edit settings, save                                         | `<OrgSettingsForm />`                                                   |

### Global UI Components (present on all app pages)

| Component                  | Description                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `<AppSidebar />`           | Navigation: Dashboard, Projects, Tickets (Board/List), My Work, Teams, Members, Settings |
| `<AppHeader />`            | Org name/logo, search (Cmd+K), notification bell, user avatar/menu                       |
| `<CommandPalette />`       | Search overlay triggered by Cmd+K                                                        |
| `<NotificationDropdown />` | Dropdown from bell icon showing recent notifications                                     |
| `<UserMenu />`             | Dropdown: Profile, Settings, Log out                                                     |

---

## 7. Build Sequence -- The Critical Path

### Sprint 0: Foundation (Week 1)

**Goal:** Working development environment with auth, database, and basic app shell. No product features yet.

**Deliverables:**

1. GitHub repository initialized (monorepo: Turborepo + pnpm)
2. Next.js 16 app scaffolded (`apps/web`)
3. Shared package created (`packages/shared`)
4. Supabase project provisioned (dev + staging)
5. Full database schema deployed (initial migration with ALL tables, enums, triggers, RLS policies, indexes)
6. Supabase client files created (browser, server, middleware, service)
7. shadcn/ui installed and configured
8. Design token system implemented (CSS custom properties, Tailwind config, DM Sans loaded)
9. App shell: sidebar, header, layout with org slug routing
10. Auth pages: login, signup, forgot password, reset password, verify email
11. Post-signup onboarding: create organization flow
12. CI pipeline: GitHub Actions (typecheck, lint, build, test)
13. `.env.example`, `CLAUDE.md`, `WORK_LOG.md` created
14. Seed data file created
15. Resend configured for transactional email
16. Sentry configured for error tracking

**Agent types:**

- **Infra Agent:** Repository setup, CI pipeline, Supabase provisioning, env vars (items 1-6, 12-15)
- **Schema Agent:** Database migration, seed data (items 5, 14)
- **UI Agent:** shadcn/ui setup, design tokens, app shell, auth pages (items 7-11)

**Parallelization:**

- Infra Agent and Schema Agent can work in parallel (infra does repo/CI, schema does migration)
- UI Agent starts after infra provides the Next.js skeleton (dependency)
- Auth pages can be built in parallel with schema work (UI uses Supabase Auth, not custom tables)

**Sprint exit criteria:**

- `pnpm build` succeeds
- `pnpm typecheck` reports zero errors
- User can sign up, verify email (Inbucket locally), log in, create org, see empty dashboard
- RLS policies tested: user cannot see another org's data (manual Supabase Studio check)
- CI pipeline passes on push to `develop`

**Blockers to watch:**

- Supabase local Docker setup on Windows (may need WSL2)
- DM Sans font loading with next/font (verify it works with Turbopack)
- shadcn/ui component customization to match PIPS design tokens

---

### Sprint 1: Core PIPS Workflow (Weeks 2-3)

**Goal:** A user can create a PIPS project and work through all 6 steps with guided content and interactive forms.

**Deliverables:**

1. Project creation form and API endpoint
2. Project list page (table with filters)
3. Project detail overview page with step stepper
4. Step view component with objectives, prompts, completion criteria
5. Step 1 -- Identify: Problem statement builder (As-Is / Desired / Gap), impact assessment, team formation
6. Step 2 -- Analyze: Fishbone diagram (interactive), 5-Why analysis form
7. Step 3 -- Generate: Brainstorming workspace (idea cards, voting, list reduction)
8. Step 4 -- Select & Plan: Criteria rating matrix, cost-benefit analysis, RACI matrix, implementation checklist
9. Step 5 -- Implement: Implementation dashboard with task status tracking
10. Step 6 -- Evaluate: Before/after comparison, evaluation form, lessons learned, project completion
11. Step advancement logic (gating + override for Manager+)
12. Auto-save on all form fields (debounced Supabase writes)
13. PIPS step constants and content (objectives, prompts, completion criteria text from CONTENT_MIGRATION.md)

**Agent types:**

- **API Agent:** Project CRUD endpoints, step update endpoints, form CRUD endpoints (items 1, 11, 12)
- **PIPS Agent 1:** Steps 1-3 UI components and forms (items 5-7)
- **PIPS Agent 2:** Steps 4-6 UI components and forms (items 8-10)
- **UI Agent:** Project list, project detail, step stepper, step view shell (items 2-4)
- **Content Agent:** Extract step content from PIPS source HTML, create constants file (item 13)

**Parallelization:**

- API Agent and Content Agent can start immediately (no UI dependency)
- PIPS Agent 1 and PIPS Agent 2 can work in parallel (Steps 1-3 and Steps 4-6 are independent)
- UI Agent builds the shell while PIPS Agents build step content
- Each PIPS Agent works in a worktree

**Sprint exit criteria:**

- User can create a project, fill out Step 1 forms, advance through all 6 steps, and complete the project
- All form data persists (auto-save works)
- Step gating works (cannot skip steps without completing criteria)
- Fishbone diagram renders correctly with draggable causes
- Criteria rating matrix auto-calculates weighted scores
- Implementation checklist items are trackable
- `pnpm typecheck` passes
- Unit tests for step completion logic and Zod validation schemas

**Blockers to watch:**

- Fishbone diagram: may need a canvas/SVG library (consider `react-flow` or custom SVG)
- Auto-save debouncing: ensure no data loss on rapid edits
- JSONB data shape validation: Zod schemas must match form data structures exactly

---

### Sprint 2: Ticketing + Board (Weeks 3-4)

**Goal:** Full ticketing system with Kanban board, ticket detail, and integration with PIPS Step 5.

**Deliverables:**

1. Ticket CRUD API endpoints
2. Ticket creation form (standalone and from implementation checklist)
3. Kanban board with drag-and-drop
4. Ticket cards with key info (ID, title, priority, assignee, due date)
5. Ticket detail page with all fields, comments, activity log
6. Comment system with @mention autocomplete
7. Ticket list view (sortable table)
8. "Create tickets" button on Step 4 implementation checklist (bulk ticket creation)
9. Step 5 implementation dashboard linked to project tickets
10. Parent/child ticket relationships (basic -- no deep nesting UI)
11. Ticket sequence number generation (ORG-123)

**Agent types:**

- **API Agent:** Ticket CRUD, comment CRUD, bulk create, sequence number (items 1, 6, 8, 11)
- **Board Agent:** Kanban board with drag-and-drop (item 3, 4)
- **UI Agent:** Ticket detail, ticket list, ticket creation form (items 2, 5, 7, 10)
- **Integration Agent:** Wire Step 4 checklist to ticket creation, Step 5 dashboard to project tickets (items 8, 9)

**Parallelization:**

- API Agent and Board Agent can work in parallel
- UI Agent starts on ticket detail after API Agent provides endpoints
- Integration Agent starts after PIPS workflow (Sprint 1) and ticket API are both ready

**Sprint exit criteria:**

- User can create tickets, drag them across board columns, view details, add comments
- Implementation checklist in Step 4 can generate tickets with one click
- Step 5 shows ticket statuses from the project
- Ticket IDs auto-generated (ACME-1, ACME-2, ...)
- @mention autocomplete works in comments
- `pnpm typecheck` passes
- E2E test: create ticket > move on board > verify status change

**Blockers to watch:**

- Drag-and-drop library choice: recommend `@hello-pangea/dnd` (maintained fork of react-beautiful-dnd) or `dnd-kit`
- Sequence number generation: ensure no race conditions under concurrent inserts (the trigger uses `COALESCE(MAX(...), 0) + 1` which needs a lock or SERIALIZABLE isolation)
- @mention autocomplete: need to query org members efficiently

---

### Sprint 3: Dashboard, Navigation, Notifications (Weeks 5-6)

**Goal:** The product feels complete -- dashboard with metrics, My Work view, notifications, search, team/member management.

**Deliverables:**

1. Organization dashboard with widgets (active projects, open tickets, overdue, projects-by-step chart, recent activity)
2. Projects-by-step bar chart (Recharts)
3. My Work view (tickets assigned to me, grouped by urgency)
4. Global search (Cmd+K command palette)
5. Notification system: database triggers, bell icon, dropdown, mark-as-read
6. Email notifications (Resend) for ticket assignment, @mentions, step advancement
7. Team management pages (create team, add/remove members)
8. Member management page (invite, change role, remove)
9. Org settings page (name, logo, timezone)
10. User profile page (display name, avatar upload)
11. Sidebar navigation with all pages linked
12. Breadcrumb navigation on detail pages

**Agent types:**

- **Dashboard Agent:** Dashboard widgets, Recharts chart, My Work view (items 1-3)
- **Notification Agent:** Database triggers for notifications, bell component, email sending via Resend (items 5-6)
- **Search Agent:** Command palette component, Postgres full-text search integration (item 4)
- **Admin Agent:** Teams, members, org settings, user profile pages (items 7-10)
- **UI Agent:** Sidebar, breadcrumbs, navigation polish (items 11-12)

**Parallelization:**

- Dashboard Agent, Notification Agent, Search Agent, and Admin Agent can ALL work in parallel (independent feature areas)
- UI Agent handles cross-cutting navigation once pages exist

**Sprint exit criteria:**

- Dashboard renders with real data (projects created in Sprint 1 testing)
- Notifications appear when tickets are assigned or comments mention a user
- Email sent for ticket assignment (verify via Inbucket locally or Resend logs)
- Search finds tickets and projects by title
- Teams and members fully manageable
- Org settings saveable
- Avatar upload works (Supabase Storage)
- E2E test: full signup > create org > create project > complete 6 steps > create tickets > verify dashboard

**Blockers to watch:**

- Notification triggers: ensure they fire reliably on all relevant mutations
- Resend email rate limits: configure appropriately for dev
- Recharts rendering: verify SSR compatibility (may need `'use client'` directive)

---

### Sprint 4: Polish, Testing, Launch Prep (Weeks 7-8)

**Goal:** Production-ready application with tests, error handling, performance optimization, and deployment.

**Deliverables:**

1. E2E test suite: 5 critical flows (see Section 4 testing requirements)
2. Unit test coverage: 60%+ on `lib/` and `hooks/`
3. Component tests for key forms (fishbone, criteria matrix, brainstorming)
4. Error boundary components (graceful error handling in UI)
5. Loading states and skeletons for all data-fetching pages
6. Empty state designs for zero-data pages (no projects yet, no tickets yet)
7. Responsive design audit (minimum: usable on tablet, 768px+)
8. Accessibility audit (keyboard navigation, ARIA labels on interactive elements, color contrast)
9. Performance audit (Lighthouse score 90+ on dashboard, optimize images, code splitting)
10. Sentry integration verified (errors reported correctly)
11. Production Supabase database deployed with schema
12. Vercel production deployment configured
13. Custom domain setup (if ready)
14. Seed data for demo account
15. Worked example project (Parking Lot scenario) -- T2-06
16. Security review: CSP headers, RLS policy audit, input validation review
17. README with setup instructions for new developers

**Agent types:**

- **Test Agent:** E2E tests, unit tests, component tests (items 1-3)
- **Polish Agent:** Error boundaries, loading states, empty states, responsive audit (items 4-7)
- **Accessibility Agent:** ARIA labels, keyboard navigation, contrast checks (item 8)
- **Performance Agent:** Lighthouse audit, optimization, code splitting (item 9)
- **DevOps Agent:** Production deployment, Sentry, domain, seed data (items 10-14)
- **Security Agent:** CSP review, RLS audit, input validation (item 16)
- **Content Agent:** Worked example data, empty state copy (items 6, 15)

**Parallelization:**

- Test Agent, Polish Agent, Accessibility Agent, and Performance Agent can ALL work in parallel
- DevOps Agent can work in parallel (production infra is independent of code polish)
- Security Agent should run AFTER other agents have finished (reviews final state)

**Sprint exit criteria:**

- All 5 E2E tests pass
- `pnpm typecheck`, `pnpm lint`, `pnpm build` all pass with zero errors
- Lighthouse performance score 90+ on dashboard page
- All interactive elements keyboard-navigable
- Color contrast meets WCAG AA (verified by brand guide specifications)
- Production deployment live at domain
- Demo account with worked example project accessible
- No P0 bugs in manual QA

**Blockers to watch:**

- E2E tests flaking due to Supabase local timing
- Production Supabase project may have different behavior than local (connection pooling, RLS)
- Vercel build may timeout if bundle is too large

---

## 8. Agent Work Packages

### Sequential Dependencies (Must Complete in Order)

```
INFRA-001 ──► AUTH-001 ──► ORG-001 ──► RBAC-001 ──► INVITE-001
    │                                       │
    ▼                                       ▼
SCHEMA-001 ──────────────────────────► PIPS-001 ──► PIPS-002
    │                                       │          │
    ▼                                       │          ▼
DESIGN-001                                  │     PIPS-003 ──► PIPS-004
                                            │                      │
                                            ▼                      ▼
                                       TICKET-001 ──► TICKET-002
                                            │              │
                                            ▼              ▼
                                       BOARD-001     TICKET-003
                                            │
                                            ▼
                                       DASH-001 ──► NOTIF-001
                                                        │
                                                        ▼
                                                   SEARCH-001
```

### Package Definitions

---

#### INFRA-001: Repository and Dev Environment Setup

- **Description:** Initialize monorepo, install dependencies, configure tooling (ESLint, Prettier, Husky, lint-staged), create directory structure, set up CI pipeline.
- **Input dependencies:** None
- **Output:** Working monorepo with `pnpm build` passing, CI pipeline on GitHub Actions
- **Files created:** `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.prettierrc`, `.eslintrc.json`, `.gitignore`, `.nvmrc`, `CLAUDE.md`, `.github/workflows/ci.yml`, directory structure
- **Estimated agent-hours:** 2
- **Agent type:** Infra Agent
- **Test requirements:** `pnpm build` passes, CI pipeline triggers on push
- **Worktree safe:** No (initializes the repo)

---

#### SCHEMA-001: Database Schema and Migrations

- **Description:** Create initial Supabase migration with ALL tables, enums, triggers, functions, RLS policies, and indexes from TECHNICAL_PLAN.md. Create storage bucket migration. Create seed data file.
- **Input dependencies:** INFRA-001 (repo exists)
- **Output:** `supabase/migrations/00000001_initial_schema.sql`, `supabase/migrations/00000002_storage_buckets.sql`, `supabase/seed.sql`, `supabase/config.toml`
- **Estimated agent-hours:** 3
- **Agent type:** Schema Agent
- **Test requirements:** `supabase db reset` succeeds, `supabase db lint` passes, seed data creates expected rows
- **Worktree safe:** Yes

---

#### DESIGN-001: Design Token System and App Shell

- **Description:** Implement CSS custom properties for PIPS brand (BRAND_GUIDE_V2.md), configure Tailwind with custom colors, load DM Sans via next/font, install and customize shadcn/ui components, create app shell (sidebar, header, layout).
- **Input dependencies:** INFRA-001
- **Output:** `globals.css` with all design tokens, `tailwind.config.ts` with PIPS colors, `layout.tsx` with font loading, `<AppSidebar />`, `<AppHeader />`, shadcn/ui components customized
- **Estimated agent-hours:** 4
- **Agent type:** UI Agent
- **Test requirements:** Visual review -- colors match brand guide, DM Sans loads, dark mode toggle works (if T3-01 included)
- **Worktree safe:** Yes

---

#### AUTH-001: Email/Password Authentication

- **Description:** Build login, signup, forgot password, reset password, and verify email pages. Configure Supabase Auth. Set up middleware for session management. Implement rate limiting display.
- **Input dependencies:** INFRA-001, SCHEMA-001 (profiles trigger), DESIGN-001 (app shell)
- **Output:** Auth pages in `(auth)/` route group, Supabase client files, middleware, auth callback route
- **Estimated agent-hours:** 4
- **Agent type:** Auth Agent
- **Test requirements:** Unit tests for validation schemas. E2E test: signup > verify > login > see dashboard.
- **Worktree safe:** Yes

---

#### ORG-001: Organization Creation and Management

- **Description:** Build onboarding flow (create org after signup), org settings page, org API endpoints. Slug validation and auto-generation.
- **Input dependencies:** AUTH-001
- **Output:** Onboarding page, org settings page, org API routes, org Zustand store
- **Estimated agent-hours:** 3
- **Agent type:** API Agent
- **Test requirements:** Unit tests for slug validation. E2E test: create org > land on dashboard.
- **Worktree safe:** Yes

---

#### RBAC-001: Role-Based Access Control

- **Description:** Implement permission checking middleware/helpers. Create `use-permissions` hook. Enforce permissions in API routes. Ensure RLS policies match role matrix.
- **Input dependencies:** ORG-001
- **Output:** `lib/permissions.ts`, `hooks/use-permissions.ts`, API middleware for role checking, UI conditional rendering based on role
- **Estimated agent-hours:** 3
- **Agent type:** API Agent
- **Test requirements:** Unit tests for every role x action combination. Integration test: viewer cannot create tickets.
- **Worktree safe:** Yes

---

#### INVITE-001: User Invitation System

- **Description:** Build invitation API (send, list, revoke, accept), invitation email template (Resend), invitation accept page, auto-join org on accept.
- **Input dependencies:** RBAC-001
- **Output:** Invitation API routes, email template, accept page, member management page
- **Estimated agent-hours:** 3
- **Agent type:** API Agent
- **Test requirements:** Unit test: invitation token generation and expiry. E2E test: invite > accept > user appears in members list.
- **Worktree safe:** Yes

---

#### TEAM-001: Team Management

- **Description:** Build team CRUD pages and API. Add/remove members from teams. Team list and detail pages.
- **Input dependencies:** INVITE-001 (members must exist)
- **Output:** Team pages, team API routes
- **Estimated agent-hours:** 2
- **Agent type:** UI Agent
- **Test requirements:** Unit tests for team API validation.
- **Worktree safe:** Yes

---

#### PIPS-001: PIPS Project Creation and Step Framework

- **Description:** Build project creation form, project list, project detail with step stepper. Step view shell (objectives, prompts, completion criteria). Step advancement logic. Auto-create 6 project_steps on project creation.
- **Input dependencies:** TEAM-001, SCHEMA-001
- **Output:** Project pages, step stepper component, step view component, project API routes, step content constants
- **Estimated agent-hours:** 5
- **Agent type:** PIPS Agent
- **Test requirements:** Unit tests for step completion logic. E2E test: create project > see step stepper > navigate steps.
- **Worktree safe:** Yes

---

#### PIPS-002: Steps 1-3 (Identify, Analyze, Generate)

- **Description:** Build Step 1 (problem statement builder, impact assessment, team formation), Step 2 (fishbone diagram, 5-Why analysis), Step 3 (brainstorming workspace, list reduction). All with auto-save and JSONB storage.
- **Input dependencies:** PIPS-001
- **Output:** Step 1-3 form components, form API routes, Zod schemas for form data
- **Estimated agent-hours:** 10
- **Agent type:** PIPS Agent (can split into PIPS Agent A for Steps 1-2, PIPS Agent B for Step 3)
- **Test requirements:** Unit tests for Zod schemas. Component tests for fishbone diagram rendering. E2E test: fill Step 1 > advance > fill Step 2 > advance.
- **Worktree safe:** Yes (each step can be a worktree if split into sub-agents)

---

#### PIPS-003: Steps 4-6 (Select & Plan, Implement, Evaluate)

- **Description:** Build Step 4 (criteria rating matrix, cost-benefit, RACI, implementation checklist), Step 5 (implementation dashboard), Step 6 (before/after, evaluation, lessons learned, project completion).
- **Input dependencies:** PIPS-001
- **Output:** Step 4-6 form components, form API routes, project completion logic
- **Estimated agent-hours:** 10
- **Agent type:** PIPS Agent (can split into PIPS Agent C for Step 4, PIPS Agent D for Steps 5-6)
- **Test requirements:** Component tests for criteria rating auto-calculation. E2E test: fill Step 4 > advance > fill Step 6 > complete project.
- **Worktree safe:** Yes

---

#### PIPS-004: Step Integration and Content

- **Description:** Wire Step 4 implementation checklist to ticket creation (TICKET-001 dependency). Extract methodology content from PIPS source HTML (CONTENT_MIGRATION.md). Create Parking Lot worked example data.
- **Input dependencies:** PIPS-002, PIPS-003, TICKET-001
- **Output:** Bulk ticket creation from checklist, step content constants, worked example seed data
- **Estimated agent-hours:** 4
- **Agent type:** Integration Agent
- **Test requirements:** E2E test: create checklist items > click "Create Tickets" > verify tickets appear on board.
- **Worktree safe:** Yes

---

#### TICKET-001: Ticket System Core

- **Description:** Build ticket CRUD API, ticket creation form, ticket detail page, comment system with @mentions, activity log, ticket types and statuses.
- **Input dependencies:** RBAC-001, SCHEMA-001
- **Output:** Ticket API routes, ticket creation form, ticket detail page, comment components
- **Estimated agent-hours:** 6
- **Agent type:** Ticket Agent
- **Test requirements:** Unit tests for ticket validation. E2E test: create ticket > view detail > add comment > verify activity log.
- **Worktree safe:** Yes

---

#### TICKET-002: Ticket List View

- **Description:** Build sortable table view for tickets. Columns: ID, title, status, priority, assignee, due date. Pagination, sorting, row selection for bulk operations.
- **Input dependencies:** TICKET-001
- **Output:** `<TicketListTable />` component, list page
- **Estimated agent-hours:** 3
- **Agent type:** UI Agent
- **Test requirements:** Component test: table renders, sorting works.
- **Worktree safe:** Yes

---

#### TICKET-003: Parent/Child Tickets

- **Description:** Implement parent/child ticket relationships. Parent progress bar calculated from child completion. UI for creating sub-tickets and viewing parent.
- **Input dependencies:** TICKET-001
- **Output:** Parent/child UI in ticket detail, progress calculation logic
- **Estimated agent-hours:** 2
- **Agent type:** UI Agent
- **Test requirements:** Unit test: progress calculation with various child states.
- **Worktree safe:** Yes

---

#### BOARD-001: Kanban Board

- **Description:** Build Kanban board with drag-and-drop. Columns per status. Ticket cards with key info. Quick-add button. Filter bar. Scoped to project or org.
- **Input dependencies:** TICKET-001
- **Output:** `<KanbanBoard />` component, board page for org and project
- **Estimated agent-hours:** 5
- **Agent type:** Board Agent
- **Test requirements:** E2E test: drag ticket from "To Do" to "In Progress" > verify status updated in database.
- **Worktree safe:** Yes

---

#### DASH-001: Dashboard and My Work

- **Description:** Build org dashboard with widgets (counts, projects-by-step chart, recent activity). Build My Work view (user's tickets grouped by urgency).
- **Input dependencies:** PIPS-001, TICKET-001
- **Output:** Dashboard page with Recharts chart, My Work page
- **Estimated agent-hours:** 4
- **Agent type:** Dashboard Agent
- **Test requirements:** Component test: chart renders with mock data.
- **Worktree safe:** Yes

---

#### NOTIF-001: Notification System

- **Description:** Create database triggers that insert notifications on: ticket assignment, @mention, project step advance. Build notification bell, dropdown, mark-as-read. Build email notification sending via Resend.
- **Input dependencies:** TICKET-001, PIPS-001
- **Output:** Notification triggers (migration), notification UI components, email sending edge function or API route, notification preferences toggle
- **Estimated agent-hours:** 5
- **Agent type:** Notification Agent
- **Test requirements:** Integration test: create ticket with assignee > verify notification row created. Unit test: email template rendering.
- **Worktree safe:** Yes

---

#### SEARCH-001: Global Search

- **Description:** Build command palette (Cmd+K) that searches tickets and projects via Postgres full-text search. Results grouped by type.
- **Input dependencies:** TICKET-001, PIPS-001
- **Output:** `<CommandPalette />` component, search API route
- **Estimated agent-hours:** 3
- **Agent type:** Search Agent
- **Test requirements:** Unit test: search query construction. Component test: results render grouped by type.
- **Worktree safe:** Yes

---

#### PROFILE-001: User Profile

- **Description:** Build profile page with display name edit, avatar upload (Supabase Storage), notification preferences toggle.
- **Input dependencies:** AUTH-001
- **Output:** Profile page, avatar upload component
- **Estimated agent-hours:** 2
- **Agent type:** UI Agent
- **Test requirements:** E2E test: upload avatar > verify it appears in header user menu.
- **Worktree safe:** Yes

---

#### AUDIT-001: Audit Log Triggers

- **Description:** Create database triggers on all 15 MVP tables that INSERT into audit_log on every INSERT, UPDATE, DELETE. Capture old_data, new_data, user_id, entity_type, entity_id.
- **Input dependencies:** SCHEMA-001
- **Output:** Migration file with audit triggers
- **Estimated agent-hours:** 2
- **Agent type:** Schema Agent
- **Test requirements:** Integration test: create ticket > verify audit_log row with correct data.
- **Worktree safe:** Yes

---

#### POLISH-001: Error Handling, Loading States, Empty States

- **Description:** Add error boundaries, loading skeletons, and empty state designs to all pages. Responsive audit at 768px+. Copy for empty states.
- **Input dependencies:** All feature packages complete
- **Output:** Error boundary component, skeleton components, empty state components, responsive CSS fixes
- **Estimated agent-hours:** 4
- **Agent type:** Polish Agent
- **Test requirements:** Visual review. Component test: error boundary catches and displays error.
- **Worktree safe:** Yes

---

#### TEST-001: E2E and Integration Test Suite

- **Description:** Write Playwright E2E tests for 5 critical flows. Write Vitest integration tests for API routes. Ensure 60%+ coverage on `lib/` and `hooks/`.
- **Input dependencies:** All feature packages complete
- **Output:** E2E test files, unit/integration test files, coverage report
- **Estimated agent-hours:** 6
- **Agent type:** Test Agent
- **Test requirements:** All tests pass. Coverage 60%+.
- **Worktree safe:** Yes

---

#### DEPLOY-001: Production Deployment

- **Description:** Deploy production Supabase database, configure Vercel production project, set environment variables, deploy application, verify production works.
- **Input dependencies:** All feature packages and TEST-001 complete
- **Output:** Live production URL, production environment configured
- **Estimated agent-hours:** 3
- **Agent type:** DevOps Agent
- **Test requirements:** Smoke test on production: signup > create org > create project > create ticket.
- **Worktree safe:** No (touches production)

---

### Parallelization Map by Sprint

**Sprint 0 (Week 1):**

- Sequential: INFRA-001 > then parallel: [SCHEMA-001, DESIGN-001]
- Then: AUTH-001 (needs SCHEMA-001 + DESIGN-001)
- Then parallel: [ORG-001, AUDIT-001]

**Sprint 1 (Weeks 2-3):**

- Sequential: RBAC-001 > INVITE-001 > TEAM-001
- Then: PIPS-001
- Then parallel: [PIPS-002, PIPS-003] (Steps 1-3 and Steps 4-6 simultaneously)

**Sprint 2 (Weeks 3-4):**

- TICKET-001 can start as soon as RBAC-001 is done (mid-Sprint 1)
- Then parallel: [BOARD-001, TICKET-002, TICKET-003]
- PIPS-004 after PIPS-002 + PIPS-003 + TICKET-001

**Sprint 3 (Weeks 5-6):**

- All in parallel: [DASH-001, NOTIF-001, SEARCH-001, PROFILE-001]
- Then: Admin pages (ORG-001 settings, team pages already done)

**Sprint 4 (Weeks 7-8):**

- All in parallel: [POLISH-001, TEST-001]
- Then: DEPLOY-001

---

## 9. MVP Quality Gates

### TypeScript

- Zero errors from `pnpm typecheck` (`tsc --noEmit`)
- Strict mode enabled (`"strict": true` in tsconfig)
- No `any` types except in generated Supabase types
- All function parameters and return types explicitly typed

### Tests

- **Unit test coverage:** 60% on `lib/` and `hooks/` directories
- **E2E tests:** 5 critical flows pass (defined in Sprint 4)
- **Component tests:** Key interactive components (fishbone, criteria matrix, brainstorming, kanban board) have render and interaction tests
- All tests pass in CI before merge to `develop`

### Performance

- **Lighthouse Performance score:** 90+ on dashboard page
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3.5s
- **Bundle size:** < 300KB initial JS (gzipped)
- API responses: < 200ms for list endpoints (50 items), < 100ms for detail endpoints

### Accessibility

- **WCAG level:** AA compliance
- All interactive elements keyboard-accessible
- All images have alt text
- All form inputs have labels
- Color contrast ratios meet BRAND_GUIDE_V2.md specifications (verified)
- Focus indicators visible on all interactive elements
- Screen reader tested on key flows (create project, navigate steps, create ticket)

### Security

- RLS policies active on all tables (verified via Supabase Studio)
- All API routes validate input with Zod
- CSP headers set per DEVOPS_RUNBOOK.md configuration
- No SUPABASE_SERVICE_ROLE_KEY exposed to client
- Password policy enforced (10+ chars, mixed case, number)
- Rate limiting on auth endpoints
- XSS prevention via React escaping + CSP
- CSRF protection via Supabase Auth SameSite cookies

### Browser Support

- Chrome 120+ (primary)
- Firefox 120+
- Safari 17+
- Edge 120+
- No IE support

### Mobile / Responsive

- **MVP target:** Functional at 768px+ (tablet landscape and desktop)
- Not optimized for phone (< 768px) in MVP -- defer to Phase 2
- No native mobile app in MVP

---

## 10. MVP Success Metrics

### User Metrics (Month 1-3 post-launch)

| Metric                     | Target                                       | How measured                                                                            |
| -------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Sign-ups**               | 50 accounts                                  | Supabase Auth user count                                                                |
| **Organizations created**  | 30 orgs                                      | `organizations` table count                                                             |
| **Activation rate**        | 40% (sign up > complete Step 1 of a project) | Query: users with at least one project_step in 'completed' status for step = 'identify' |
| **Project creation rate**  | 2 projects per active org                    | `projects` table count / active orgs                                                    |
| **6-step completion rate** | 20% of started projects reach Step 6         | Query: projects with status = 'completed' / projects with status != 'draft'             |
| **Invitation rate**        | 30% of orgs invite at least 1 member         | Orgs with > 1 org_member                                                                |
| **Weekly active users**    | 25% of registered users                      | Users with any audit_log entry in last 7 days                                           |

### Product Metrics

| Metric                     | Target                     | How measured                               |
| -------------------------- | -------------------------- | ------------------------------------------ |
| **Projects created**       | 100 total                  | `projects` table count                     |
| **PIPS steps completed**   | 300 total step completions | `project_steps` where status = 'completed' |
| **Forms filled**           | 200 form instances         | `project_forms` table count                |
| **Tickets created**        | 500 total                  | `tickets` table count                      |
| **Tickets resolved**       | 200 total                  | `tickets` where status = 'done'            |
| **Comments posted**        | 300 total                  | `comments` table count                     |
| **Average time in Step 1** | < 30 minutes               | project_steps timestamps                   |
| **Most-used form**         | Identify top 3             | project_forms grouped by form_type         |

### Technical Metrics

| Metric                      | Target           | How measured                   |
| --------------------------- | ---------------- | ------------------------------ |
| **Uptime**                  | 99.5%            | Vercel + Supabase status pages |
| **API response time (p95)** | < 500ms          | Vercel Analytics               |
| **Error rate**              | < 1% of requests | Sentry                         |
| **Build time**              | < 3 minutes      | GitHub Actions                 |
| **Lighthouse score**        | 90+              | Automated CI check             |

### Business Metrics

| Metric                       | Target                                      | How measured                        |
| ---------------------------- | ------------------------------------------- | ----------------------------------- |
| **Demo conversions**         | 5 of 10 demos result in "yes, we need this" | Manual tracking by Marc             |
| **Waitlist / interest**      | 50 people on waitlist                       | Signup form or email list           |
| **NPS (Net Promoter Score)** | > 30 (early users)                          | Survey after 30 days                |
| **Feature requests**         | Categorized and prioritized                 | Tracked in PIPS itself (dogfooding) |

---

## 11. Post-MVP Priority Stack

### Feature 1: Billing and Subscription Management (Phase 2, first priority)

**Why it's next:** The MVP launches as a free beta. Once product-market fit signals are positive (activation rate > 30%, completion rate > 15%, positive demo feedback), monetization must be turned on immediately. Delaying billing delays revenue.

**What it unlocks:**

- Revenue generation (Starter $12/user/mo, Professional $29/user/mo)
- Plan-based feature gating (team size limits, form limits)
- Stripe customer portal for self-serve subscription management
- Annual billing discount

**How it builds on MVP foundation:**

- `organizations` table already has `stripe_customer_id`, `stripe_subscription_id`, `plan` columns
- `org_plan` enum already has `starter`, `professional`, `enterprise` values
- No schema migration needed -- just code to wire Stripe checkout, webhooks, and plan enforcement

### Feature 2: Real-Time Collaboration and Advanced Ticketing (Phase 2, second priority)

**Why it follows:** Once teams are paying, they will demand collaborative features: real-time form editing with cursor presence, sprint/iteration management, custom status workflows, timeline view. These are the features that increase daily active usage and reduce churn.

**What it unlocks:**

- Real-time form editing (Supabase Realtime channels)
- Sprint management (iterations, velocity tracking)
- Custom ticket workflows per org
- Timeline/Gantt view
- Brainwriting tool (anonymous round-robin brainstorming)
- MFA

**How it builds on MVP foundation:**

- Supabase Realtime library already installed; forms already auto-save to Supabase
- `ticket_transitions` table already captures status history for workflow customization
- Ticket schema has `started_at`/`due_date` for timeline view
- All new features use existing tables or small additive migrations

### Feature 3: Analytics Dashboard and Reporting (Phase 3, third priority)

**Why it's third:** Analytics require historical data. By the time Phase 3 starts (Week 21+), the MVP will have 4-5 months of usage data to visualize. Building analytics before there is data to show is wasted effort.

**What it unlocks:**

- Cycle time trends (how long projects take, improving over time?)
- Step duration analysis (where do projects get stuck?)
- Tool usage stats (which PIPS forms are most/least used?)
- Impact tracking (aggregate ROI from evaluation forms)
- Executive summary (shareable link, PDF export)
- Custom form builder

**How it builds on MVP foundation:**

- `audit_log` has been accumulating data since day one
- All timestamps on projects, steps, and tickets provide the raw data
- Dashboard widget pattern (T1-15) establishes the UI framework
- Recharts already installed and configured

---

## 12. Risk Register

### Risk 1: Fishbone Diagram Complexity

**Description:** The interactive fishbone (Ishikawa) diagram is the most complex UI component in the MVP. It requires either a custom SVG/canvas implementation or a library like react-flow. Drag-and-drop causes, category labels, connecting lines, and responsive layout are all non-trivial.

**Likelihood:** Medium
**Impact:** High (the fishbone is the demo's "wow" moment)

**Mitigation:**

- Evaluate `react-flow` or `@xyflow/react` first -- it handles nodes, edges, and drag-and-drop
- Fallback: build a simplified version using a structured form (categories as expandable sections with sortable cause items) instead of a visual diagram. This is less impressive but functional and shippable.
- Time-box to 3 days. If not working after 3 days, use the structured form fallback.

**Decision point for Marc:** If the visual fishbone takes > 3 days, approve the structured fallback?

### Risk 2: Scope Creep on PIPS Forms

**Description:** Each PIPS step has multiple forms. The temptation is to make each form pixel-perfect and feature-rich (collaborative editing, versioning, PDF export). This could consume all of Sprint 1-2.

**Likelihood:** High
**Impact:** High (delays everything downstream)

**Mitigation:**

- Each form must meet acceptance criteria and NO MORE for MVP
- No collaborative editing (lock-based is fine, or just last-writer-wins)
- No PDF export (defer to T3-06)
- No version history (defer to Phase 2)
- Auto-save is required; everything else is a "later"
- Time-box each form to 1 day max. If a form exceeds 1 day, simplify.

**Decision point for Marc:** Approve the "1 day per form" rule?

### Risk 3: Supabase RLS Performance

**Description:** The `user_org_ids()` function is called on every RLS policy evaluation. With many org_members rows, this could become slow on list endpoints.

**Likelihood:** Low (unlikely at MVP scale of < 100 users)
**Impact:** Medium (slow pages)

**Mitigation:**

- Use `SECURITY DEFINER` and `STABLE` on helper functions (already done in TECHNICAL_PLAN.md)
- Monitor query performance via Supabase Dashboard
- If needed, cache org_ids in the JWT custom claim (reduces per-query overhead to zero)
- This optimization is Phase 2 work; at MVP scale it will not be an issue

**Decision point for Marc:** None needed unless performance degrades.

### Risk 4: AI Agent Merge Conflicts

**Description:** Multiple agents working in parallel may create conflicting changes, especially in shared files like `layout.tsx`, `globals.css`, `tailwind.config.ts`, and migration files.

**Likelihood:** High
**Impact:** Medium (delays resolution, potential bugs)

**Mitigation:**

- Use worktrees for all parallel agents
- Define clear file ownership per work package (see output files in each package)
- Shared files are owned by one agent at a time; other agents use the committed version
- Migration files use timestamps at least 1 minute apart
- All agents pull from `develop` before starting
- Review and merge PRs promptly to reduce drift

**Decision point for Marc:** Approve worktree-per-agent approach?

### Risk 5: Timeline Overrun (> 8 Weeks)

**Description:** The 6-8 week target assumes consistent agent availability, no major technical blockers, and Marc available for decisions. Any of these could slip.

**Likelihood:** Medium
**Impact:** Medium (delayed launch, but no technical debt if work is quality)

**Mitigation:**

- **If at Week 6 and Sprint 3 is not complete:** Cut Tier 2 features (T2-01 through T2-08) and ship with Tier 1 only. The product still works and demonstrates the PIPS methodology.
- **If at Week 8 and Sprint 4 is not complete:** Ship with reduced test coverage (skip E2E tests 4-5, keep 1-3). Add missing tests in first post-launch week.
- **If a specific feature blocks everything:** Use the fallback approach (e.g., structured fishbone instead of visual). Never let one feature block the entire timeline.
- The critical insight: a working product with 6 complete PIPS steps and basic ticketing in 8 weeks beats a perfect product in 16 weeks.

**Decision point for Marc:** At Week 6, review progress and decide whether to cut Tier 2 or extend timeline.

---

## Appendix: Key References Across Planning Documents

| Decision/Feature                                        | Source Document         | Section |
| ------------------------------------------------------- | ----------------------- | ------- |
| Multi-tenancy pattern (shared schema + RLS)             | TECHNICAL_PLAN.md       | 1.2     |
| Full database schema (tables, triggers, indexes)        | TECHNICAL_PLAN.md       | 3.2-3.8 |
| RLS policies and helper functions                       | TECHNICAL_PLAN.md       | 5.1     |
| Auth flows (signup, login, SSO)                         | TECHNICAL_PLAN.md       | 5.2     |
| RBAC permission matrix                                  | TECHNICAL_PLAN.md       | 5.3     |
| API route patterns                                      | TECHNICAL_PLAN.md       | 4.1-4.3 |
| Project structure                                       | TECHNICAL_PLAN.md       | 10      |
| PIPS 6-step requirements (P0 features)                  | PRODUCT_REQUIREMENTS.md | 3.2.2   |
| Form template specifications                            | PRODUCT_REQUIREMENTS.md | 3.3.1   |
| Ticket requirements                                     | PRODUCT_REQUIREMENTS.md | 3.4     |
| View requirements (Board, List, My Work)                | PRODUCT_REQUIREMENTS.md | 3.5     |
| Dashboard requirements                                  | PRODUCT_REQUIREMENTS.md | 3.6     |
| Phase 0-1 milestones                                    | PRODUCT_ROADMAP.md      | 2-3     |
| Revenue model and pricing                               | BUSINESS_PLAN.md        | 7       |
| Brand colors and typography                             | BRAND_GUIDE_V2.md       | 3.1-3.2 |
| Design tokens (CSS custom properties)                   | BRAND_GUIDE_V2.md       | 8       |
| Step content source material                            | CONTENT_MIGRATION.md    | 1.1-1.4 |
| Form migration specifications                           | CONTENT_MIGRATION.md    | 3.1     |
| Day-1 setup guide                                       | DEVOPS_RUNBOOK.md       | 1       |
| CI/CD pipeline                                          | DEVOPS_RUNBOOK.md       | 4       |
| Environment variables                                   | DEVOPS_RUNBOOK.md       | 1.2     |
| Tagline: "Stop managing tasks. Start solving problems." | MARKETING_STRATEGY.md   | 2       |
| Elevator pitch                                          | MARKETING_STRATEGY.md   | 1       |

---

## 13. Post-MVP Extensions

> **Context:** These features were built during or immediately after the MVP sprint, extending beyond the original MVP scope. They represent strategic investments that strengthen the product's competitive positioning before beta launch.

### 13.1 Knowledge Hub (Foundation Complete)

The Knowledge Hub compiles the full PIPS methodology book ("The Never-Ending Quest") into the product as searchable, contextual learning content. This is the "methodology IS the software" differentiator made concrete.

**What shipped:**

| Feature                  | Status     | Details                                                                                                       |
| ------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------- |
| Book content compilation | DONE       | 205 content nodes from 20 markdown source files, stored in `book_content` table                               |
| Full-text search         | DONE       | Postgres tsvector-based FTS across all content nodes                                                          |
| Reading experience       | DONE       | Dedicated reader view with clean typography, markdown rendering                                               |
| Cadence Bar              | DONE       | Contextual content widget integrated into step-view and dashboard, provides step-relevant methodology content |
| Bookmark system          | DONE       | Save, list, and navigate to bookmarked content nodes                                                          |
| Knowledge Hub landing    | DONE       | Hub page with content categories, search bar, navigation                                                      |
| Workbook scaffolding     | SCAFFOLDED | Step-by-step practice mode with guided exercises (UI exists, exercise-to-form wiring in progress)             |

**Codebase locations:**

- Pages: `src/app/(app)/knowledge/` (book, bookmarks, guide, search, workbook, workshop)
- Components: `src/components/knowledge/` (bookmark-button, content-reader, knowledge-hub-landing, markdown-content)
- Cadence Bar: `src/components/knowledge-cadence/`

**Why this matters:** No competitor embeds their methodology documentation this deeply into the product. The Knowledge Hub is a retention engine (users return to learn), an SEO asset (content drives organic traffic via marketing preview pages), and a competitive moat (205 nodes of domain-specific content cannot be quickly copied).

### 13.2 Training Mode (DB + Seed Data Ready, Pages Scaffolded)

Training Mode transforms the product from a tool into a capability-building platform.

**What shipped:**

| Feature               | Status     | Details                                                                                                     |
| --------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| DB tables             | DONE       | `training_paths`, `training_modules`, `training_exercises`, `training_progress` tables created and migrated |
| Seed data             | DONE       | 4 learning paths, 27 modules, 59 exercises seeded                                                           |
| Training landing page | SCAFFOLDED | Page exists at `/training`, rendering from DB data in progress                                              |
| Path detail page      | SCAFFOLDED | Page exists at `/training/path/[pathSlug]`                                                                  |
| Progress page         | SCAFFOLDED | Page exists at `/training/progress`                                                                         |
| Training components   | SCAFFOLDED | `src/components/training/` directory with UI components                                                     |

**What remains:**

- Wire scaffolded pages to render training data from Supabase
- Exercise rendering (fill-in-form using real PIPS forms, multiple choice, scenario analysis)
- Module completion tracking per user
- Sandbox projects for practice exercises

### 13.3 Workshop Facilitation (DB Ready, UI Scaffolded)

Workshop Facilitation bridges consulting engagements and software. Facilitators can run live PIPS workshops inside the product.

**What shipped:**

| Feature               | Status     | Details                                                    |
| --------------------- | ---------- | ---------------------------------------------------------- |
| DB tables             | DONE       | Workshop tables created and applied to production Supabase |
| Workshop landing page | SCAFFOLDED | Page exists at `/knowledge/workshop`                       |
| Module detail page    | SCAFFOLDED | Page exists at `/knowledge/workshop/modules/[slug]`        |

**What remains:**

- Session creation and management
- Real-time facilitation via Supabase Realtime channels
- Timer system for timed activities
- Facilitator controls (start/pause/end)
- Presentation mode for screen sharing
- Participant contributions in real-time

### 13.4 SEO Marketing Pages (83+ Pages Live)

A content marketing foundation was built into the product from day one.

**What shipped:**

| Page Type                  | Count   | Route Pattern                | Status                                    |
| -------------------------- | ------- | ---------------------------- | ----------------------------------------- |
| Methodology step pages     | 6       | `/methodology/step/[1-6]`    | DONE                                      |
| Tool pages                 | 22      | `/methodology/tools/[slug]`  | DONE                                      |
| Book chapter preview pages | 20      | `/book/[chapterSlug]`        | DONE                                      |
| Glossary term pages        | 35      | `/resources/glossary/[term]` | DONE                                      |
| Resources hub              | 1       | `/resources`                 | DONE                                      |
| Methodology overview       | 1       | `/methodology`               | DONE                                      |
| **Total**                  | **85+** |                              | **All server-rendered with SEO metadata** |

**What remains:**

- Blog (no posts published)
- "Try PIPS Free" CTA buttons on marketing pages (identified as friction risk F1)
- Email marketing infrastructure (no sequences configured)
- Analytics beyond Vercel built-in

### 13.5 Additional MVP Enhancements Beyond Original Scope

| Feature                         | Original Plan | What Actually Shipped                              |
| ------------------------------- | ------------- | -------------------------------------------------- |
| Kanban board                    | Phase 2       | Shipped in MVP with drag-and-drop                  |
| Parent/child tickets            | Phase 2       | Shipped in MVP (3-level hierarchy)                 |
| Global search + command palette | Phase 2       | Shipped in MVP (Cmd/Ctrl+K, FTS)                   |
| In-app notifications            | Phase 2       | Shipped in MVP (bell, dropdown, DB triggers)       |
| Dark mode                       | Phase 2       | Shipped in MVP                                     |
| Audit logging                   | Phase 5       | Shipped in MVP (DB triggers, Owner/Admin readable) |
| CSV/PDF export                  | Phase 3       | Shipped in MVP                                     |
| Sentry error tracking           | Phase 2       | Shipped in MVP                                     |
| Vercel Analytics                | Not planned   | Shipped in MVP                                     |

---

### Document Status

This document is now a **historical reference**. The MVP is delivered. Active product development is governed by:

- **PRODUCT_REQUIREMENTS.md** — Full requirements including Knowledge Hub, Training, Workshop, and Adoption Friction Mitigation
- **PRODUCT_ROADMAP.md** — Updated phase timeline with Phase 1.5 (Post-MVP Stabilization) through Phase 6 (AI)
- **CUSTOMER_INSIGHTS_REPORT.md** — Friction risks and adoption hypotheses to validate with beta users
