# PIPS 2.0 -- Analytics Plan

> **Version:** v1.0 -- Created 2026-03-04
> **Author:** Data & Analytics Agent (Claude Opus 4.6)
> **Status:** Active -- No analytics instrumentation deployed yet
> **Inputs:** BUSINESS_PLAN.md v1.1, PRODUCT_REQUIREMENTS.md v1.1, PRODUCT_ROADMAP.md v1.1, SYSTEM_ARCHITECTURE.md v1.1, TECHNICAL_PLAN.md v1.1, CUSTOMER_INSIGHTS_REPORT.md, AI_AGENT_COORDINATION.md, DATAANALYTICS_AGENT.md
>
> This document defines the analytics strategy, event taxonomy, dashboard specifications, instrumentation plan, reporting queries, and success metrics for PIPS 2.0. It covers what to measure, how to measure it, and when each metric matters.

---

## Table of Contents

1. [Metrics Hierarchy](#1-metrics-hierarchy)
2. [Analytics Event Taxonomy](#2-analytics-event-taxonomy)
3. [Dashboard Specifications](#3-dashboard-specifications)
4. [Instrumentation Plan](#4-instrumentation-plan)
5. [Reporting Queries](#5-reporting-queries)
6. [Success Metrics by Product Phase](#6-success-metrics-by-product-phase)
7. [Data Model Guidance](#7-data-model-guidance)
8. [Implementation Priority](#8-implementation-priority)

---

## 1. Metrics Hierarchy

Metrics are organized into five tiers. Each metric includes its definition, calculation method, source tables, segmentation dimensions, refresh cadence, and failure modes.

### 1.1 North Star Metric

**Monthly Active PIPS Projects (MAPP)**

- **Definition:** The count of PIPS projects that have at least one team member perform a meaningful action (form save, step advance, ticket status change, or comment) within the trailing 30-day window.
- **Calculation:** Count distinct `project_id` values from the union of `project_forms` (created_at or updated_at in window), `project_steps` (updated_at in window), `tickets` where `project_id IS NOT NULL` (updated_at in window), and `comments` where `project_id IS NOT NULL` (created_at in window).
- **Source tables:** `project_forms`, `project_steps`, `tickets`, `comments`
- **Segmentation:** org_id, project status, current_step
- **Refresh cadence:** Daily (overnight), displayed on admin dashboard
- **Caveats:** Sample projects must be excluded (filter by `projects.title NOT LIKE '[Sample]%'` or a `is_sample` boolean if added). Projects with only automated activity (audit triggers, not user actions) should not count.

### 1.2 Activation Metrics

These measure the path from signup to first value. They are the highest priority for pre-revenue beta.

| #   | Metric                     | Definition                                                                                         | Calculation                                                                                                                             | Source Tables                              | Target  | Segmentation        | Refresh | Caveats                                                                                           |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------- | ------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| A1  | **Signup-to-Org Rate**     | % of users who complete account creation AND create/join an org                                    | `COUNT(DISTINCT org_members.user_id) / COUNT(DISTINCT profiles.id)` within a cohort window                                              | `profiles`, `org_members`                  | >90%    | cohort_week         | Daily   | Exclude users who signed up but never verified email                                              |
| A2  | **Signup-to-Project Rate** | % of users who create at least 1 project (sample or real) within 7 days of signup                  | Count users with a `projects` row created within 7 days of `profiles.created_at` / total signups in cohort                              | `profiles`, `projects`, `org_members`      | >60%    | cohort_week, org_id | Daily   | Include sample project creation. Separate metric for "real" projects excluding sample.            |
| A3  | **Step 1 Completion Rate** | % of non-sample projects that complete Step 1 (Identify)                                           | Count projects where `project_steps.status = 'completed'` for `step = 'identify'` AND project is not sample / total non-sample projects | `projects`, `project_steps`                | >70%    | org_id, cohort_week | Daily   | "Completed" means the step's completion criteria are met, not just that the user clicked past it. |
| A4  | **Multi-Step Rate**        | % of non-sample projects that reach Step 3 (Generate) or beyond                                    | Count projects where `project_steps.status IN ('in_progress', 'completed')` for `step = 'generate'` / total non-sample projects         | `projects`, `project_steps`                | >40%    | org_id, cohort_week | Daily   | A project that skips to Step 3 via manager override still counts.                                 |
| A5  | **Time to First Form**     | Median minutes from `profiles.created_at` to first `project_forms.created_at` for that user        | Calculate per-user delta, take median within cohort                                                                                     | `profiles`, `project_forms`                | <20 min | cohort_week, org_id | Daily   | Exclude auto-generated sample project forms if they exist.                                        |
| A6  | **Invite-to-Accept Rate**  | % of org invitations that result in accepted membership                                            | `COUNT(status = 'accepted') / COUNT(*)` from `org_invitations` within cohort window                                                     | `org_invitations`                          | >50%    | org_id, cohort_week | Daily   | Expired invitations (>7 days old, not accepted) should be counted as failures.                    |
| A7  | **Time to Team Value**     | Median minutes from first user signup to second user's first form contribution within the same org | Calculate per-org: time from `MIN(profiles.created_at)` for org to second user's first `project_forms.created_at`                       | `profiles`, `org_members`, `project_forms` | <60 min | org_id              | Weekly  | Only meaningful for orgs with 2+ members.                                                         |

### 1.3 Engagement Metrics

These measure ongoing product usage after activation.

| #   | Metric                         | Definition                                                                                                                   | Calculation                                                                                                      | Source Tables                                              | Target                             | Segmentation                   | Refresh | Caveats                                                                                                                  |
| --- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------- | ------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| E1  | **DAU / WAU / MAU**            | Count of distinct users who perform at least 1 action per day/week/month                                                     | Count distinct `user_id` from analytics events within window                                                     | `analytics_events` (new table) or derived from `audit_log` | Track trend                        | org_id, role                   | Daily   | Define "action" as: page view of app route, form save, ticket CRUD, comment, step advance. Exclude marketing page views. |
| E2  | **DAU/MAU Ratio (Stickiness)** | What fraction of monthly actives are daily actives                                                                           | `AVG(daily_DAU) / MAU` for the month                                                                             | Derived from E1                                            | >0.15                              | org_id                         | Monthly | Higher is better. B2B SaaS benchmarks: 0.10-0.25 is healthy.                                                             |
| E3  | **Feature Usage Distribution** | % of active users using each major feature per week                                                                          | Count distinct users per feature area (PIPS forms, tickets, knowledge hub, training, search, dashboard) / WAU    | `analytics_events` or `audit_log`                          | Track distribution                 | org_id, role                   | Weekly  | Helps identify which features drive retention vs. which are unused.                                                      |
| E4  | **Form Completion Rate**       | % of forms started (created_at exists) that are meaningfully completed (data JSONB is non-empty and has >3 fields populated) | Count "completed" forms / count all forms, per form_type                                                         | `project_forms`                                            | >50%                               | org_id, form_type, pips_step   | Weekly  | Defining "completed" requires inspecting JSONB. A simple heuristic: `jsonb_object_keys(data)` count > 3.                 |
| E5  | **Step Progression Velocity**  | Median days spent in each PIPS step                                                                                          | For each step, calculate `completed_at - started_at` from `project_steps`, take median                           | `project_steps`                                            | Track trend (decreasing over time) | org_id, step, project priority | Weekly  | Null `completed_at` means still in progress -- exclude from median but report count of "stuck" projects separately.      |
| E6  | **Cadence Bar Click Rate**     | % of step-view page loads where the Cadence Bar is interacted with                                                           | Requires client-side event tracking. `cadence_bar_click` events / `step_view_load` events                        | `analytics_events` (new)                                   | >15%                               | org_id, step_number            | Weekly  | Critical metric from Customer Insights Report (H4). If <10%, content discoverability has failed.                         |
| E7  | **Knowledge Hub Sessions**     | Count of reading sessions started per week, and median session duration                                                      | Count from `reading_sessions` created per week; duration = `last_accessed_at - created_at` or session close time | `reading_sessions`                                         | Track trend                        | org_id, pillar, user_id        | Weekly  | Sessions with <10 seconds duration are likely accidental -- filter or flag them.                                         |
| E8  | **Ticket Velocity**            | Tickets moved to `done` status per org per week                                                                              | Count `ticket_transitions` where `to_status = 'done'` per org per week                                           | `ticket_transitions`                                       | Track trend                        | org_id, team_id, ticket_type   | Weekly  | Re-opened tickets that move to done again should count each transition.                                                  |

### 1.4 Retention Metrics

These measure whether users and organizations come back.

| #   | Metric                            | Definition                                                                          | Calculation                                                                                     | Source Tables                     | Target                  | Segmentation               | Refresh | Caveats                                                                                                                    |
| --- | --------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------- | -------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| R1  | **Week-over-Week User Retention** | Of users active in week N, what % are active in week N+1                            | Cohort retention matrix: for each signup-week cohort, compute % active in each subsequent week  | `analytics_events` or `audit_log` | >50% W1, >30% W4        | org_id, role, cohort_week  | Weekly  | "Active" = same definition as DAU (any meaningful action).                                                                 |
| R2  | **Org-Level Monthly Retention**   | % of orgs active in month M that are also active in month M+1                       | Count orgs with at least 1 active user in consecutive months / total orgs active in month M     | Derived from MAU per org          | >80%                    | plan_tier, org_size_bucket | Monthly | An org is "active" if at least 1 member performs an action.                                                                |
| R3  | **Feature Stickiness**            | For each feature, what % of users who used it in week N also use it in week N+1     | Per-feature cohort retention                                                                    | `analytics_events`                | Track per feature       | feature_area               | Weekly  | Identifies which features drive habit formation. High stickiness = core feature. Low stickiness = re-engagement candidate. |
| R4  | **Project Completion Rate**       | % of non-sample PIPS projects that reach Step 6 (Evaluate) and are marked completed | Count projects with `status = 'completed'` / count all non-sample projects created >90 days ago | `projects`                        | >40% (long-term target) | org_id, priority           | Monthly | Only meaningful for projects old enough to have plausibly been completed. Use a 90-day lag filter.                         |
| R5  | **Dormant Org Detection**         | Orgs with zero activity in trailing 14 days                                         | Count orgs where no `audit_log` entry exists with `created_at > NOW() - INTERVAL '14 days'`     | `audit_log`                       | <20% of total orgs      | plan_tier                  | Daily   | Trigger re-engagement action (email, in-app nudge) when an org goes dormant.                                               |

### 1.5 Conversion Metrics

Not applicable until Stripe billing is integrated (Phase 3). Defined here for forward planning.

| #   | Metric                                 | Definition                                                                          | Calculation                                                                                                     | Source Tables                                        | Target           | Segmentation        | Refresh | Caveats                                           |
| --- | -------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------- | ------------------- | ------- | ------------------------------------------------- |
| C1  | **Free-to-Paid Conversion Rate**       | % of free orgs that upgrade to a paid plan within 60 days of creation               | Count orgs where `plan != 'free'` AND `plan` changed within 60 days of `created_at` / total free orgs in cohort | `organizations`                                      | >5%              | org_size, industry  | Monthly | Requires Stripe integration and plan enforcement. |
| C2  | **Trial-to-Paid Rate**                 | % of trial orgs that convert before trial expires                                   | Requires trial clock implementation                                                                             | `organizations`, Stripe webhook data                 | >20%             | plan_tier, org_size | Monthly | Deferred until trial mechanism exists.            |
| C3  | **Net Revenue Retention (NRR)**        | Revenue from existing customers this month / revenue from same customers last month | Stripe subscription data: (MRR + expansion - contraction - churn) / prior MRR                                   | Stripe API or `organizations` with Stripe references | >110%            | plan_tier           | Monthly | Expansion comes from seat additions.              |
| C4  | **Average Revenue Per Account (ARPA)** | Total MRR / count of paying orgs                                                    | Stripe subscription data                                                                                        | Stripe API                                           | $350/mo (Year 1) | plan_tier           | Monthly | Blended across tiers.                             |

### 1.6 Operational Health Metrics

These monitor platform reliability and performance.

| #   | Metric                     | Definition                                                             | Calculation                                                           | Source                   | Target      | Refresh                   | Caveats                                                                                                   |
| --- | -------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------ | ----------- | ------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| O1  | **Server Error Rate**      | % of server actions / API routes returning 5xx errors                  | Sentry error count / total request count                              | Sentry, Vercel Analytics | <0.1%       | Real-time (Sentry alerts) | Distinguish between user-caused errors (validation) and system errors (DB timeout, unhandled exception).  |
| O2  | **P95 Page Load Time**     | 95th percentile time from navigation start to largest contentful paint | Vercel Analytics Speed Insights                                       | Vercel Analytics         | <2s         | Daily                     | Mobile and desktop should be tracked separately.                                                          |
| O3  | **Database Query Latency** | P95 query execution time for the 10 slowest query patterns             | Supabase Dashboard > Query Performance                                | Supabase                 | <500ms      | Daily                     | Watch for full-table scans as data grows. Key risk: RLS policy evaluation adding latency on large tables. |
| O4  | **Uptime**                 | % of time the application responds to health check                     | Vercel / external uptime monitor (e.g., BetterUptime)                 | External monitor         | >99.9%      | Real-time                 | Monthly target: <43 minutes of downtime.                                                                  |
| O5  | **Email Delivery Rate**    | % of transactional emails successfully delivered (not bounced)         | Resend dashboard delivery metrics                                     | Resend                   | >98%        | Daily                     | Track by email type (invitation, notification, digest). Bounce rate >5% = deliverability problem.         |
| O6  | **Audit Log Volume**       | Rows inserted into `audit_log` per day                                 | `COUNT(*) FROM audit_log WHERE created_at > NOW() - INTERVAL '1 day'` | `audit_log`              | Track trend | org_id                    | Daily                                                                                                     | Growth rate indicates data volume trajectory. Plan for partitioning if >100K rows/day. |

---

## 2. Analytics Event Taxonomy

### 2.1 Event Naming Convention

All analytics events follow this pattern:

```
{entity}.{action}
```

- **entity**: Lowercase singular noun. Matches a domain object: `project`, `ticket`, `form`, `step`, `comment`, `user`, `org`, `team`, `knowledge`, `training`, `workshop`, `search`, `notification`, `cadence_bar`.
- **action**: Past-tense verb describing what happened: `created`, `updated`, `completed`, `viewed`, `deleted`, `advanced`, `saved`, `clicked`, `exported`, `invited`, `accepted`, `searched`.

Examples: `project.created`, `form.saved`, `step.advanced`, `cadence_bar.clicked`, `knowledge.viewed`.

No abbreviations. No camelCase. No uppercase. Dot-separated only.

### 2.2 Required Event Properties

Every analytics event MUST include these properties:

| Property     | Type        | Source           | Description                                         |
| ------------ | ----------- | ---------------- | --------------------------------------------------- |
| `event_name` | TEXT        | Application      | The `entity.action` name                            |
| `event_id`   | UUID        | Generated        | Unique event identifier (for deduplication)         |
| `timestamp`  | TIMESTAMPTZ | `NOW()`          | When the event occurred                             |
| `user_id`    | UUID        | `auth.uid()`     | The user who triggered the event                    |
| `org_id`     | UUID        | Session context  | The org the user was operating within               |
| `session_id` | TEXT        | Client-generated | Browser session identifier (UUID, rotated on login) |

Every event MAY include these contextual properties (as JSONB `properties` column):

| Property      | Type      | When to Include           | Description                                                                 |
| ------------- | --------- | ------------------------- | --------------------------------------------------------------------------- |
| `project_id`  | UUID      | Any project-related event | The PIPS project context                                                    |
| `step_number` | INT (1-6) | Step or form events       | Which PIPS step                                                             |
| `form_type`   | TEXT      | Form events               | Which form template (e.g., `fishbone`, `five_why`)                          |
| `ticket_id`   | UUID      | Ticket events             | The ticket context                                                          |
| `entity_type` | TEXT      | CRUD events               | The entity being acted on                                                   |
| `entity_id`   | UUID      | CRUD events               | The specific entity ID                                                      |
| `source`      | TEXT      | Navigation events         | Where the user came from (`dashboard`, `sidebar`, `search`, `notification`) |
| `duration_ms` | INT       | Timed actions             | How long the action took                                                    |
| `metadata`    | JSONB     | Any event                 | Freeform additional context                                                 |

### 2.3 Core Event Catalog (28 events)

These are the events to instrument. Grouped by domain.

#### User Lifecycle (4 events)

| Event Name       | Trigger                                     | Key Properties                         | Priority |
| ---------------- | ------------------------------------------- | -------------------------------------- | -------- |
| `user.signed_up` | Account creation confirmed (email verified) | `signup_method` (email)                | P0       |
| `user.logged_in` | Successful login                            | `login_method` (email, magic_link)     | P1       |
| `org.created`    | New organization created                    | `plan`, `org_name`                     | P0       |
| `user.invited`   | Invitation sent                             | `invited_role`, `invited_email_domain` | P0       |

#### PIPS Project Lifecycle (6 events)

| Event Name          | Trigger                                                  | Key Properties                                | Priority |
| ------------------- | -------------------------------------------------------- | --------------------------------------------- | -------- |
| `project.created`   | New PIPS project created                                 | `project_id`, `is_sample`, `priority`         | P0       |
| `step.viewed`       | User navigates to a step view                            | `project_id`, `step_number`, `step_name`      | P0       |
| `step.advanced`     | Step status changed to `completed` and next step entered | `project_id`, `step_number`, `days_in_step`   | P0       |
| `step.regressed`    | User navigated back to a previous step to edit           | `project_id`, `from_step`, `to_step`          | P1       |
| `project.completed` | Project status set to `completed` (Step 6 done)          | `project_id`, `total_days`, `steps_completed` | P0       |
| `project.stalled`   | System detects no activity on project for 14+ days       | `project_id`, `current_step`, `days_inactive` | P1       |

#### Form Events (3 events)

| Event Name       | Trigger                                                                                 | Key Properties                                                       | Priority |
| ---------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------- |
| `form.created`   | New form instance created within a step                                                 | `project_id`, `step_number`, `form_type`                             | P0       |
| `form.saved`     | Form auto-saves or user manually saves                                                  | `project_id`, `step_number`, `form_type`, `fields_populated` (count) | P0       |
| `form.completed` | Form has sufficient data to be considered complete (heuristic: >3 JSONB keys populated) | `project_id`, `step_number`, `form_type`, `duration_ms`              | P0       |

#### Ticket Events (4 events)

| Event Name              | Trigger                       | Key Properties                                                       | Priority |
| ----------------------- | ----------------------------- | -------------------------------------------------------------------- | -------- |
| `ticket.created`        | New ticket created            | `ticket_id`, `ticket_type`, `project_id` (if linked), `has_assignee` | P0       |
| `ticket.status_changed` | Ticket moves between statuses | `ticket_id`, `from_status`, `to_status`, `ticket_type`               | P0       |
| `ticket.assigned`       | Ticket assigned or reassigned | `ticket_id`, `assignee_id`, `was_unassigned`                         | P1       |
| `ticket.commented`      | Comment posted on a ticket    | `ticket_id`, `has_mentions`, `is_reply`                              | P1       |

#### Knowledge Hub Events (4 events)

| Event Name             | Trigger                              | Key Properties                                                                   | Priority |
| ---------------------- | ------------------------------------ | -------------------------------------------------------------------------------- | -------- |
| `knowledge.viewed`     | User opens a content node            | `content_node_id`, `pillar`, `step_tags`, `source` (search, browse, cadence_bar) | P0       |
| `knowledge.bookmarked` | User bookmarks a content node        | `content_node_id`, `pillar`                                                      | P1       |
| `knowledge.searched`   | User performs a Knowledge Hub search | `query_text` (truncated to 100 chars), `result_count`                            | P1       |
| `cadence_bar.clicked`  | User clicks a Cadence Bar suggestion | `content_node_id`, `context` (step_number, form_type, dashboard)                 | P0       |

#### Training Events (3 events)

| Event Name                    | Trigger                                       | Key Properties                                                  | Priority |
| ----------------------------- | --------------------------------------------- | --------------------------------------------------------------- | -------- |
| `training.module_started`     | User begins a training module                 | `path_id`, `module_id`                                          | P1       |
| `training.exercise_completed` | User submits an exercise                      | `path_id`, `module_id`, `exercise_id`, `exercise_type`, `score` | P1       |
| `training.path_completed`     | User completes all modules in a training path | `path_id`, `total_time_minutes`                                 | P1       |

#### Navigation & Search Events (3 events)

| Event Name             | Trigger                                       | Key Properties                                                       | Priority |
| ---------------------- | --------------------------------------------- | -------------------------------------------------------------------- | -------- |
| `search.executed`      | User executes a global search (Cmd+K)         | `query_text` (truncated), `result_count`, `result_clicked` (boolean) | P1       |
| `export.generated`     | User exports data (CSV or PDF)                | `export_type` (csv, pdf), `entity_type` (project, tickets, report)   | P1       |
| `notification.clicked` | User clicks a notification from the bell menu | `notification_type`, `entity_type`, `entity_id`                      | P1       |

#### Workshop Events (1 event -- scaffolded, expand later)

| Event Name                 | Trigger                               | Key Properties                                   | Priority |
| -------------------------- | ------------------------------------- | ------------------------------------------------ | -------- |
| `workshop.session_started` | Facilitator starts a workshop session | `session_id`, `scenario_id`, `participant_count` | P2       |

---

## 3. Dashboard Specifications

### 3.1 Org Admin Dashboard -- "Organization Health"

**Audience:** Org Owner, Admin, Manager
**Location:** `/dashboard` (enhanced version of the existing dashboard)
**Refresh:** On page load (server component) + manual refresh button

#### Widgets

| Widget                         | Visualization                                                   | Data Source                                                                                                                                   | Metric Reference |
| ------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **Active PIPS Projects**       | Stat card with trend arrow (vs. prior period)                   | `projects WHERE status = 'active'`                                                                                                            | MAPP             |
| **Projects by Step**           | Stacked bar chart (6 segments, step colors)                     | `project_steps` grouped by step, filtered to active projects                                                                                  | E5               |
| **Step Completion Funnel**     | Horizontal funnel chart                                         | See Section 3.2                                                                                                                               | A3, A4           |
| **Cycle Time Trend**           | Line chart (monthly, trailing 6 months)                         | Median `completed_at - created_at` from `project_steps`                                                                                       | E5               |
| **Open Tickets**               | Stat card with breakdown by status                              | `tickets WHERE status NOT IN ('done', 'cancelled')`                                                                                           | E8               |
| **Ticket Velocity**            | Line chart (weekly, trailing 8 weeks)                           | `ticket_transitions WHERE to_status = 'done'` count per week                                                                                  | E8               |
| **Team Activity**              | Horizontal bar chart (actions per team member, trailing 7 days) | `audit_log` grouped by `user_id`, joined to `org_members`                                                                                     | E1               |
| **Stalled Projects Alert**     | List with red indicator                                         | `projects` with no related `audit_log` entry in 14 days, status = 'active'                                                                    | R5               |
| **Recent Activity Feed**       | Timeline list (last 20 items)                                   | `audit_log ORDER BY created_at DESC LIMIT 20`                                                                                                 | --               |
| **Methodology Adoption Score** | Gauge (0-100)                                                   | Composite: weighted average of Step 1 Completion Rate (30%), Multi-Step Rate (30%), Form Completion Rate (20%), Project Completion Rate (20%) | A3, A4, E4, R4   |

### 3.2 PIPS Step Completion Funnel -- CRITICAL

This is the single most important analytical view in the product. It answers: "Is the methodology working? Where do teams get stuck?"

**Audience:** All roles (simplified view for Members, full view for Admins)
**Location:** Dedicated section within `/dashboard`, also embeddable in project detail pages
**Refresh:** On page load

#### Funnel Definition

The funnel tracks all non-sample PIPS projects through the 6 steps:

```
Step 1: Identify    ████████████████████████████████████  100% (all projects start here)
Step 2: Analyze     ██████████████████████████████        82%
Step 3: Generate    ███████████████████████               65%
Step 4: Select/Plan ████████████████████                  55%
Step 5: Implement   ██████████████████                    48%
Step 6: Evaluate    ██████████████                        38%
                    Completed ████████████                 33%
```

#### Funnel Calculation

For each step S (1-6), count projects where `project_steps.status IN ('in_progress', 'completed')` for step S or any step beyond S. Divide by total non-sample projects. The "Completed" row counts projects with `projects.status = 'completed'`.

#### Supporting Details

- **Per-step dropout rate:** % of projects that advanced to step S but did not advance to step S+1. Shows exactly where the methodology loses teams.
- **Median days in step:** How long teams spend in each step. Highlights bottlenecks.
- **Step-to-step conversion by org:** Allows comparison across organizations (for future multi-org analytics).
- **Filter controls:** Date range (project creation date), org-wide or per-team, priority level.

#### Failure Mode

If the funnel shows >50% dropout at Step 1, the methodology is too heavyweight or the forms are too intimidating. This is the kill signal from Customer Insights Report hypothesis H2.

### 3.3 Team Workload Dashboard

**Audience:** Manager, Admin, Team Lead
**Location:** `/teams/[teamId]/workload` or a dashboard tab
**Refresh:** On page load

#### Widgets

| Widget                        | Visualization                                                         | Data Source                                                                           |
| ----------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Tickets per Member**        | Horizontal bar chart (assigned, open tickets per person)              | `tickets WHERE assignee_id IN (team members) AND status NOT IN ('done', 'cancelled')` |
| **Workload Balance**          | Heatmap (rows = team members, columns = weeks, cell = ticket count)   | `tickets` grouped by assignee and week                                                |
| **Overdue Tickets**           | List with red badge and days-overdue count                            | `tickets WHERE due_date < NOW() AND status NOT IN ('done', 'cancelled')`              |
| **Resolution Time by Member** | Box plot or bar chart (median days from creation to done, per member) | `tickets` with `resolved_at - created_at`                                             |
| **PIPS Project Assignments**  | Table (member name, active projects, current step)                    | `project_members` joined to `projects`                                                |

#### Design Note

Frame this dashboard as "workload balance" and "where does the team need help" -- not as individual performance scoring. The PRODUCT_ROADMAP.md explicitly warns against leaderboard framing.

### 3.4 Training Progress Dashboard

**Audience:** All roles (personal view), Manager/Admin (team view)
**Location:** `/training/progress`
**Refresh:** On page load

#### Widgets

| Widget                                  | Visualization                                                                     | Data Source                                              |
| --------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **My Training Progress**                | 4-column card grid (one card per training path), each with circular progress ring | `training_progress` for current user, grouped by path_id |
| **Module Completion**                   | Checklist (per selected path) with module status and score                        | `training_progress` joined to `training_modules`         |
| **Exercise Score History**              | Table (exercise name, score, attempts, last attempt date)                         | `training_exercise_data` for current user                |
| **Team Training Overview** (Admin only) | Table (member name, paths started, paths completed, avg score)                    | `training_progress` for all org members                  |
| **Time Invested**                       | Stat card (total minutes across all training)                                     | `SUM(training_progress.time_spent_minutes)`              |

### 3.5 Content Engagement Dashboard (Knowledge Hub)

**Audience:** Admin, Manager (understanding content ROI)
**Location:** Admin section or `/settings/analytics/content`
**Refresh:** Weekly batch

#### Widgets

| Widget                        | Visualization                                                | Data Source                                                                       |
| ----------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| **Most Read Content**         | Ranked list (top 20 content nodes by read count)             | `content_read_history` grouped by `content_node_id`, ordered by `SUM(read_count)` |
| **Reading Sessions per Week** | Line chart (trailing 12 weeks)                               | `reading_sessions` grouped by week                                                |
| **Pillar Distribution**       | Pie chart (reads by pillar: Book, Guide, Workbook, Workshop) | `content_read_history` joined to `content_nodes` grouped by pillar                |
| **Bookmark Count**            | Stat card                                                    | `COUNT(*) FROM content_bookmarks` for org's users                                 |
| **Cadence Bar Engagement**    | Stat card with click-through rate                            | `cadence_bar.clicked` events / `step.viewed` events                               |
| **Search Queries**            | Word cloud or frequency list (top 20 search terms)           | `knowledge.searched` events, grouped by `query_text`                              |
| **Content Gaps**              | List of search queries with 0 results                        | `knowledge.searched` events where `result_count = 0`                              |

---

## 4. Instrumentation Plan

### 4.1 Recommended Approach: Custom Events Table in Supabase

**Decision: Use a custom `analytics_events` table in the existing Supabase PostgreSQL database.**

Rationale:

1. **No additional vendor.** PostHog, Mixpanel, and Amplitude all add cost, complexity, and a third-party data dependency. For a pre-revenue beta with <100 users, they are overkill.
2. **Data stays in-house.** All analytics data lives alongside the application data in the same Postgres instance. No GDPR data-transfer issues. No external vendor DPA required.
3. **SQL-queryable.** All dashboards can be built with SQL views and server components. No separate analytics API to maintain.
4. **Migration path.** If the product scales beyond what Postgres can handle for analytics (>10M events/month), migrate to PostHog self-hosted or Clickhouse. The event schema is designed to be compatible with PostHog's event format for easy migration.

**When to migrate to a dedicated analytics tool:**

- When event volume exceeds 1M rows/month
- When you need real-time funnel visualization that SQL views cannot serve
- When you need session replay or heatmaps
- When multi-touch attribution becomes important (marketing analytics)

### 4.2 Analytics Events Table Schema

```sql
-- ============================================================
-- ANALYTICS EVENTS (append-only event log)
-- ============================================================
CREATE TABLE analytics_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name    TEXT NOT NULL,            -- 'project.created', 'form.saved', etc.
  user_id       UUID NOT NULL REFERENCES profiles(id),
  org_id        UUID NOT NULL REFERENCES organizations(id),
  session_id    TEXT,                     -- Client-generated browser session UUID

  -- Event context (denormalized for query performance)
  project_id    UUID,                     -- PIPS project context (nullable)
  step_number   SMALLINT,                 -- 1-6 (nullable)
  form_type     TEXT,                     -- Form template ID (nullable)
  ticket_id     UUID,                     -- Ticket context (nullable)

  -- Flexible properties
  properties    JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Timestamp
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Deduplication
  idempotency_key TEXT                   -- Optional: prevent duplicate events from retries
);

-- Indexes for common query patterns
CREATE INDEX idx_analytics_events_org_time
  ON analytics_events(org_id, created_at DESC);

CREATE INDEX idx_analytics_events_user_time
  ON analytics_events(user_id, created_at DESC);

CREATE INDEX idx_analytics_events_name_time
  ON analytics_events(event_name, created_at DESC);

CREATE INDEX idx_analytics_events_project
  ON analytics_events(project_id, created_at DESC)
  WHERE project_id IS NOT NULL;

CREATE INDEX idx_analytics_events_step
  ON analytics_events(step_number, created_at DESC)
  WHERE step_number IS NOT NULL;

-- Partial index for deduplication
CREATE UNIQUE INDEX idx_analytics_events_idempotency
  ON analytics_events(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- RLS: users can only read events for their own org
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view analytics events"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = analytics_events.org_id
        AND org_members.user_id = auth.uid()
    )
  );

-- Only service role can insert (server actions insert events, not client)
CREATE POLICY "Service role can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);
  -- INSERT controlled at application layer via admin client
```

### 4.3 Implementation Approach: Server Actions + Utility Function

Events are captured via a server-side utility function called from Server Actions and API routes. This avoids client-side JavaScript tracking (no ad blockers, no CORS issues, no additional bundle size).

```typescript
// lib/analytics.ts

import { createAdminClient } from '@/lib/supabase/admin'

interface TrackEventParams {
  eventName: string
  userId: string
  orgId: string
  sessionId?: string
  projectId?: string
  stepNumber?: number
  formType?: string
  ticketId?: string
  properties?: Record<string, unknown>
  idempotencyKey?: string
}

export const trackEvent = async (params: TrackEventParams): Promise<void> => {
  const supabase = createAdminClient()

  // Fire-and-forget: analytics should never block the user action
  supabase
    .from('analytics_events')
    .insert({
      event_name: params.eventName,
      user_id: params.userId,
      org_id: params.orgId,
      session_id: params.sessionId ?? null,
      project_id: params.projectId ?? null,
      step_number: params.stepNumber ?? null,
      form_type: params.formType ?? null,
      ticket_id: params.ticketId ?? null,
      properties: params.properties ?? {},
      idempotency_key: params.idempotencyKey ?? null,
    })
    .then(({ error }) => {
      if (error) {
        // Log but do not throw -- analytics must never break the user flow
        console.error('[analytics] Failed to track event:', params.eventName, error.message)
      }
    })
}
```

**Usage in a Server Action:**

```typescript
// app/(app)/projects/actions.ts

export const createProject = async (formData: FormData) => {
  // ... existing project creation logic ...

  await trackEvent({
    eventName: 'project.created',
    userId: user.id,
    orgId: org.id,
    projectId: newProject.id,
    properties: {
      is_sample: false,
      priority: formData.get('priority'),
    },
  })

  // ... redirect or revalidate ...
}
```

**Client-side events (Cadence Bar clicks, page views):** For the small number of events that must be tracked client-side (Cadence Bar interaction, page view tracking), use a lightweight client-side function that calls a dedicated API route:

```typescript
// app/api/analytics/route.ts (POST)
// Accepts event data from client, validates, inserts via admin client
// Rate limited: 100 events per user per minute
```

### 4.4 Privacy Considerations

#### Data Minimization

- **No PII in event properties.** Never store email addresses, full names, or IP addresses in `analytics_events.properties`. Use `user_id` and `org_id` references only.
- **Truncate search queries** to 100 characters. Do not store full free-text input.
- **No session replay.** No DOM snapshots, no mouse tracking, no screen recordings.
- **No cross-org analytics.** Each org's analytics data is isolated via RLS. Platform-wide analytics (for Marc as the platform owner) are computed server-side with admin client and never exposed to tenants.

#### GDPR Compliance

- **Right to access:** User's analytics events can be exported by querying `analytics_events WHERE user_id = ?`.
- **Right to erasure:** `DELETE FROM analytics_events WHERE user_id = ?` as part of account deletion flow.
- **Data retention:** Analytics events older than 24 months are automatically purged via a scheduled pg_cron job.
- **Consent:** Analytics events are classified as "legitimate interest" (product improvement) under GDPR. No cookie banner required because tracking is server-side only (no cookies, no localStorage, no fingerprinting). Document this in the Privacy Policy.

#### Data Retention Policy

| Data Type              | Retention Period          | Purge Method                                                                                        |
| ---------------------- | ------------------------- | --------------------------------------------------------------------------------------------------- |
| `analytics_events`     | 24 months                 | pg_cron monthly job: `DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '24 months'` |
| `audit_log`            | 7 years (compliance)      | Archive to cold storage after 12 months; configurable per org                                       |
| `reading_sessions`     | Indefinite (small volume) | Purged on account deletion only                                                                     |
| `content_read_history` | Indefinite (small volume) | Purged on account deletion only                                                                     |
| `training_progress`    | Indefinite                | Purged on account deletion only                                                                     |

---

## 5. Reporting Queries

### 5.1 Key SQL Views

These views provide the data layer for dashboards. They are standard Postgres views (not materialized) unless noted. Materialized views are recommended only when query cost exceeds 2 seconds.

#### View: Active Project Funnel

```sql
CREATE OR REPLACE VIEW v_project_step_funnel AS
SELECT
  p.org_id,
  COUNT(*) FILTER (WHERE p.status != 'archived') AS total_projects,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM project_steps ps
      WHERE ps.project_id = p.id
        AND ps.step = 'identify'
        AND ps.status IN ('in_progress', 'completed')
    )
  ) AS reached_step_1,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM project_steps ps
      WHERE ps.project_id = p.id
        AND ps.step = 'analyze'
        AND ps.status IN ('in_progress', 'completed')
    )
  ) AS reached_step_2,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM project_steps ps
      WHERE ps.project_id = p.id
        AND ps.step = 'generate'
        AND ps.status IN ('in_progress', 'completed')
    )
  ) AS reached_step_3,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM project_steps ps
      WHERE ps.project_id = p.id
        AND ps.step = 'select_plan'
        AND ps.status IN ('in_progress', 'completed')
    )
  ) AS reached_step_4,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM project_steps ps
      WHERE ps.project_id = p.id
        AND ps.step = 'implement'
        AND ps.status IN ('in_progress', 'completed')
    )
  ) AS reached_step_5,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM project_steps ps
      WHERE ps.project_id = p.id
        AND ps.step = 'evaluate'
        AND ps.status IN ('in_progress', 'completed')
    )
  ) AS reached_step_6,
  COUNT(*) FILTER (WHERE p.status = 'completed') AS completed
FROM projects p
WHERE p.title NOT LIKE '[Sample]%'
GROUP BY p.org_id;
```

#### View: Step Duration Statistics

```sql
CREATE OR REPLACE VIEW v_step_duration_stats AS
SELECT
  p.org_id,
  ps.step,
  COUNT(*) AS total_steps,
  COUNT(*) FILTER (WHERE ps.status = 'completed') AS completed_steps,
  PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (ps.completed_at - ps.started_at)) / 86400.0
  ) AS median_days,
  PERCENTILE_CONT(0.9) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (ps.completed_at - ps.started_at)) / 86400.0
  ) AS p90_days,
  AVG(EXTRACT(EPOCH FROM (ps.completed_at - ps.started_at)) / 86400.0) AS avg_days
FROM project_steps ps
JOIN projects p ON ps.project_id = p.id
WHERE ps.started_at IS NOT NULL
  AND ps.completed_at IS NOT NULL
  AND p.title NOT LIKE '[Sample]%'
GROUP BY p.org_id, ps.step;
```

#### View: Ticket Velocity (Weekly)

```sql
CREATE OR REPLACE VIEW v_ticket_velocity_weekly AS
SELECT
  t.org_id,
  DATE_TRUNC('week', tt.created_at) AS week_start,
  COUNT(*) AS tickets_completed,
  COUNT(DISTINCT tt.changed_by) AS contributors
FROM ticket_transitions tt
JOIN tickets t ON tt.ticket_id = t.id
WHERE tt.to_status = 'done'
GROUP BY t.org_id, DATE_TRUNC('week', tt.created_at);
```

#### View: User Activity Summary (for DAU/WAU/MAU)

```sql
CREATE OR REPLACE VIEW v_user_activity_daily AS
SELECT
  org_id,
  user_id,
  DATE_TRUNC('day', created_at) AS activity_date,
  COUNT(*) AS event_count,
  COUNT(DISTINCT event_name) AS distinct_events
FROM analytics_events
GROUP BY org_id, user_id, DATE_TRUNC('day', created_at);
```

#### View: Form Completion by Type

```sql
CREATE OR REPLACE VIEW v_form_completion_rates AS
SELECT
  p.org_id,
  pf.form_type,
  pf.step,
  COUNT(*) AS total_forms,
  COUNT(*) FILTER (
    WHERE jsonb_object_keys_count(pf.data) > 3
  ) AS completed_forms,
  ROUND(
    COUNT(*) FILTER (WHERE jsonb_object_keys_count(pf.data) > 3)::NUMERIC
    / NULLIF(COUNT(*), 0) * 100, 1
  ) AS completion_rate_pct
FROM project_forms pf
JOIN projects p ON pf.project_id = p.id
WHERE p.title NOT LIKE '[Sample]%'
GROUP BY p.org_id, pf.form_type, pf.step;

-- Helper function for JSONB key count
CREATE OR REPLACE FUNCTION jsonb_object_keys_count(j JSONB)
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM jsonb_object_keys(j);
$$ LANGUAGE SQL IMMUTABLE;
```

#### View: Stalled Projects

```sql
CREATE OR REPLACE VIEW v_stalled_projects AS
SELECT
  p.id AS project_id,
  p.org_id,
  p.title,
  p.current_step,
  p.status,
  p.updated_at,
  EXTRACT(DAY FROM NOW() - p.updated_at)::INT AS days_since_update,
  (
    SELECT MAX(al.created_at)
    FROM audit_log al
    WHERE al.entity_id = p.id
      AND al.entity_type = 'projects'
  ) AS last_audit_activity
FROM projects p
WHERE p.status = 'active'
  AND p.title NOT LIKE '[Sample]%'
  AND p.updated_at < NOW() - INTERVAL '14 days';
```

#### View: Activation Funnel (Cohort)

```sql
CREATE OR REPLACE VIEW v_activation_funnel AS
SELECT
  DATE_TRUNC('week', pr.created_at) AS cohort_week,
  COUNT(DISTINCT pr.id) AS signups,
  COUNT(DISTINCT om.user_id) AS joined_org,
  COUNT(DISTINCT CASE
    WHEN EXISTS (
      SELECT 1 FROM projects p
      JOIN org_members om2 ON p.org_id = om2.org_id AND om2.user_id = pr.id
      WHERE p.created_at <= pr.created_at + INTERVAL '7 days'
    ) THEN pr.id
  END) AS created_project_7d,
  COUNT(DISTINCT CASE
    WHEN EXISTS (
      SELECT 1 FROM project_forms pf
      WHERE pf.created_by = pr.id
        AND pf.created_at <= pr.created_at + INTERVAL '7 days'
    ) THEN pr.id
  END) AS saved_form_7d
FROM profiles pr
LEFT JOIN org_members om ON pr.id = om.user_id
GROUP BY DATE_TRUNC('week', pr.created_at);
```

#### View: Knowledge Hub Engagement

```sql
CREATE OR REPLACE VIEW v_knowledge_engagement AS
SELECT
  cn.pillar,
  cn.id AS content_node_id,
  cn.title,
  COUNT(DISTINCT crh.user_id) AS unique_readers,
  SUM(crh.read_count) AS total_reads,
  COUNT(DISTINCT cb.user_id) AS bookmark_count
FROM content_nodes cn
LEFT JOIN content_read_history crh ON cn.id = crh.content_node_id
LEFT JOIN content_bookmarks cb ON cn.id = cb.content_node_id
GROUP BY cn.pillar, cn.id, cn.title;
```

#### View: Training Progress Overview

```sql
CREATE OR REPLACE VIEW v_training_overview AS
SELECT
  tp.user_id,
  tp.path_id,
  trp.title AS path_title,
  tp.status,
  tp.assessment_score,
  tp.time_spent_minutes,
  (
    SELECT COUNT(*)
    FROM training_modules tm
    WHERE tm.path_id = tp.path_id
  ) AS total_modules,
  (
    SELECT COUNT(*)
    FROM training_progress tp2
    WHERE tp2.path_id = tp.path_id
      AND tp2.user_id = tp.user_id
      AND tp2.status = 'completed'
  ) AS completed_modules
FROM training_progress tp
JOIN training_paths trp ON tp.path_id = trp.id;
```

### 5.2 Materialized View Recommendations

Materialized views are recommended only when a standard view becomes too slow (>2 second query time). At current scale (<100 users, <1000 projects), standard views are sufficient.

**Plan for materialization when:**

| View                       | Trigger to Materialize         | Refresh Strategy                                                      |
| -------------------------- | ------------------------------ | --------------------------------------------------------------------- |
| `v_project_step_funnel`    | >500 active projects per org   | `REFRESH MATERIALIZED VIEW CONCURRENTLY` via pg_cron every 15 minutes |
| `v_user_activity_daily`    | >1M rows in `analytics_events` | Refresh daily at 03:00 UTC via pg_cron                                |
| `v_knowledge_engagement`   | >10K read history rows         | Refresh weekly (content engagement is not time-sensitive)             |
| `v_ticket_velocity_weekly` | >50K ticket transitions        | Refresh daily at 03:00 UTC                                            |

When materializing, add a `refreshed_at` timestamp column so dashboards can display data freshness.

### 5.3 Refresh Cadence Summary

| Dashboard                    | Data Freshness                          | Method                                                |
| ---------------------------- | --------------------------------------- | ----------------------------------------------------- |
| Org Admin Dashboard          | Real-time (query on page load)          | Server Component fetches view on render               |
| Step Completion Funnel       | Real-time                               | Server Component fetches view on render               |
| Team Workload                | Real-time                               | Server Component fetches view on render               |
| Training Progress            | Real-time (personal), daily (team view) | Server Component, team view can use materialized view |
| Content Engagement           | Weekly                                  | Materialized view refreshed weekly                    |
| Activation Funnel (internal) | Daily                                   | Materialized view refreshed nightly                   |

---

## 6. Success Metrics by Product Phase

Each phase has specific analytics goals that determine what to instrument, what dashboards to build, and what success looks like.

### Phase 1.5: Post-MVP Stabilization (Current)

**Analytics goal:** Instrument core activation events. Build the `analytics_events` table. Get baseline measurements before beta users arrive.

| Metric                      | Target  | Instrumentation Needed                         |
| --------------------------- | ------- | ---------------------------------------------- |
| Signup-to-Org Rate (A1)     | >90%    | `user.signed_up`, `org.created` events         |
| Signup-to-Project Rate (A2) | >60%    | `project.created` event                        |
| Step 1 Completion Rate (A3) | >70%    | `step.advanced` event                          |
| Time to First Form (A5)     | <20 min | `form.saved` event                             |
| Invite-to-Accept Rate (A6)  | >50%    | `user.invited` event + query `org_invitations` |
| Server Error Rate (O1)      | <0.1%   | Sentry (already deployed)                      |
| P95 Page Load (O2)          | <2s     | Vercel Analytics (already deployed)            |

**Dashboards to build:** None yet. Use SQL queries directly against the DB for the first 5-10 beta users.

### Phase 2: Knowledge Hub & Training Completion

**Analytics goal:** Measure Knowledge Hub engagement and training adoption. Validate Customer Insights hypotheses H4 (Knowledge Hub retention) and H1 (forms vs. spreadsheets).

| Metric                      | Target                       | Instrumentation Needed          |
| --------------------------- | ---------------------------- | ------------------------------- |
| Cadence Bar Click Rate (E6) | >15%                         | `cadence_bar.clicked` event     |
| Knowledge Hub Sessions (E7) | 5+ per active user per month | `knowledge.viewed` event        |
| Form Completion Rate (E4)   | >50%                         | `form.completed` event          |
| Training Module Starts      | Track trend                  | `training.module_started` event |
| WAU (E1)                    | Track trend                  | `analytics_events` query        |

**Dashboards to build:** Content Engagement Dashboard (3.5), Training Progress Dashboard (3.4).

### Phase 3: Workshop, Billing & Polish

**Analytics goal:** Measure conversion funnel. Build the Org Admin Dashboard and Step Completion Funnel. Instrument billing events via Stripe webhooks.

| Metric                        | Target               | Instrumentation Needed                |
| ----------------------------- | -------------------- | ------------------------------------- |
| MAPP (North Star)             | 20+ across all orgs  | Derived from existing data            |
| Step Completion Funnel        | >40% reaching Step 3 | `v_project_step_funnel` view          |
| Free-to-Paid Rate (C1)        | >5%                  | Stripe webhook events                 |
| MRR (C4)                      | $500-$2,000          | Stripe API                            |
| DAU/MAU Ratio (E2)            | >0.15                | `v_user_activity_daily` view          |
| Week-over-Week Retention (R1) | >50% W1              | Cohort analysis on `analytics_events` |

**Dashboards to build:** Org Admin Dashboard (3.1), Step Completion Funnel (3.2), Team Workload Dashboard (3.3).

### Phase 4: Integrations & API

**Analytics goal:** Measure API adoption and integration usage. Track whether integrations improve retention.

| Metric                                        | Target                 | Instrumentation Needed          |
| --------------------------------------------- | ---------------------- | ------------------------------- |
| API Calls per Org                             | Track trend            | API route logging               |
| Integration Connection Count                  | 3-5 active             | Query `integration_connections` |
| Retention: Integrated vs. Non-Integrated Orgs | Integrated >20% higher | Segment R2 by `has_integration` |
| Webhook Delivery Success                      | >99%                   | Query `webhook_deliveries`      |

### Phase 5: White-Label & Enterprise

**Analytics goal:** Measure white-label adoption and enterprise health metrics. Build per-tenant analytics isolation for white-label customers.

| Metric                   | Target      | Instrumentation Needed                                |
| ------------------------ | ----------- | ----------------------------------------------------- |
| White-Label Deployments  | 2-3         | Query `org_settings` where brand fields are populated |
| SSO Login Rate           | Track trend | `user.logged_in` with `login_method = 'sso'`          |
| NRR (C3)                 | >110%       | Stripe data                                           |
| Org-Level Retention (R2) | >80%        | Monthly cohort analysis                               |

### Phase 6: AI & Advanced Features

**Analytics goal:** Measure AI feature adoption and quality. Track whether AI features improve project outcomes.

| Metric                                        | Target                  | Instrumentation Needed                                         |
| --------------------------------------------- | ----------------------- | -------------------------------------------------------------- |
| AI Feature Adoption                           | >50% of active projects | New `ai.suggestion_generated`, `ai.suggestion_accepted` events |
| AI Suggestion Quality (thumbs up rate)        | >70%                    | `ai.feedback` event with `rating` property                     |
| AI Token Cost per Org                         | <$50/mo                 | Token tracking in AI wrapper                                   |
| Projects with AI vs. Without: Completion Rate | AI-assisted >20% higher | Segment R4 by `used_ai` flag                                   |

---

## 7. Data Model Guidance

### 7.1 New Table: `analytics_events`

Full schema defined in Section 4.2. Key design decisions:

- **Append-only.** No UPDATE or DELETE operations in normal flow. Purge only via retention policy.
- **Denormalized.** `org_id`, `project_id`, `step_number`, `form_type`, `ticket_id` are stored directly on the event row (not only in `properties` JSONB) for fast indexed queries.
- **JSONB `properties`** for flexible additional context. Do not use JSONB for anything you need to filter or aggregate frequently -- promote those to top-level columns.
- **No foreign key constraints on `project_id`, `ticket_id`** in the events table. Analytics events should survive entity deletion. Use soft references.

### 7.2 Recommended Indexes

Beyond the indexes defined in Section 4.2, add these as query patterns emerge:

| Index                                                                                    | When to Add                                                 | Purpose                                           |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| `idx_analytics_events_org_name_time(org_id, event_name, created_at DESC)`                | When filtering events by name becomes slow                  | Combined org + event name queries                 |
| `idx_analytics_events_form_type(form_type, created_at DESC) WHERE form_type IS NOT NULL` | When form analytics queries become slow                     | Form-specific queries                             |
| `idx_project_steps_status(project_id, step, status)`                                     | Already exists as unique constraint                         | Funnel queries                                    |
| `idx_projects_sample(org_id) WHERE title LIKE '[Sample]%'`                               | When sample project exclusion becomes a performance concern | Partial index to quickly identify sample projects |

### 7.3 Recommended New Columns on Existing Tables

These columns would improve analytics capabilities without requiring schema-breaking changes:

| Table           | Column           | Type                                                                                                                          | Purpose                                                                                               | Priority |
| --------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------- |
| `projects`      | `is_sample`      | BOOLEAN DEFAULT false                                                                                                         | Reliably distinguish sample projects from real ones (better than string matching on title)            | P0       |
| `projects`      | `first_form_at`  | TIMESTAMPTZ                                                                                                                   | Denormalized: when the first form was created on this project. Avoids subquery in activation metrics. | P1       |
| `project_steps` | `days_in_step`   | GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (COALESCE(completed_at, NOW()) - COALESCE(started_at, created_at))) / 86400.0) STORED | Pre-computed step duration for fast aggregation                                                       | P1       |
| `org_members`   | `last_active_at` | TIMESTAMPTZ                                                                                                                   | Updated by analytics event tracking. Avoids scanning `analytics_events` for dormant user detection.   | P2       |

### 7.4 Partitioning Plan

When `analytics_events` exceeds 10M rows (estimated at ~50 active orgs with 20 users each, ~18 months after instrumentation):

```sql
-- Convert to range-partitioned table by month
CREATE TABLE analytics_events_partitioned (
  LIKE analytics_events INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE analytics_events_2026_03 PARTITION OF analytics_events_partitioned
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
-- ... etc., automated via pg_cron or a migration script
```

Partitioning allows efficient pruning of old data and faster queries on recent data. Defer this until the volume threshold is reached.

### 7.5 Views vs. Materialized Views Decision Framework

| Criteria                   | Use Standard View              | Use Materialized View                |
| -------------------------- | ------------------------------ | ------------------------------------ |
| Query time                 | <2 seconds                     | >2 seconds                           |
| Data freshness requirement | Real-time                      | Tolerates staleness (15 min - 1 day) |
| Source table size          | <100K rows                     | >100K rows                           |
| Dashboard audience         | All users (on every page load) | Admin-only (lower frequency)         |
| Refresh cost               | N/A                            | Must be worth the write I/O          |

---

## 8. Implementation Priority

### 8.1 Phase 1 (Immediate -- before first beta users)

1. Create `analytics_events` table and RLS policy (migration)
2. Create `trackEvent()` utility function (`lib/analytics.ts`)
3. Add `is_sample` column to `projects` table
4. Instrument 8 P0 events: `user.signed_up`, `org.created`, `project.created`, `step.viewed`, `step.advanced`, `form.created`, `form.saved`, `ticket.created`
5. Create `v_project_step_funnel` view
6. Create `v_stalled_projects` view

**Estimated effort:** 1-2 days for a single developer.

### 8.2 Phase 2 (Before 10 active orgs)

7. Instrument remaining P0 events: `form.completed`, `ticket.status_changed`, `project.completed`, `knowledge.viewed`, `cadence_bar.clicked`
8. Create `v_step_duration_stats` view
9. Create `v_user_activity_daily` view
10. Create `v_activation_funnel` view
11. Build Org Admin Dashboard (Section 3.1) as a server component page
12. Build Step Completion Funnel widget (Section 3.2)
13. Create `/api/analytics` POST route for client-side events

**Estimated effort:** 3-5 days for a single developer.

### 8.3 Phase 3 (Before 50 active orgs)

14. Instrument all P1 events (14 events)
15. Build Team Workload Dashboard (Section 3.3)
16. Build Training Progress Dashboard (Section 3.4)
17. Build Content Engagement Dashboard (Section 3.5)
18. Create `v_ticket_velocity_weekly` view
19. Create `v_knowledge_engagement` view
20. Create `v_training_overview` view
21. Create `v_form_completion_rates` view and helper function
22. Add `last_active_at` column to `org_members` and update logic
23. Evaluate whether any views need materialization based on actual query times

**Estimated effort:** 5-8 days for a single developer.

### 8.4 Phase 4 (Scaling)

24. Instrument P2 events (workshop)
25. Implement `analytics_events` retention purge (pg_cron job)
26. Evaluate partitioning based on event volume
27. Consider migration to PostHog if self-hosted analytics becomes necessary
28. Build custom report builder (from PRODUCT_ROADMAP.md Phase 3 scope)

---

## Appendix A: Metric Definitions Quick Reference

| ID   | Metric                       | One-Line Definition                                | Target                 |
| ---- | ---------------------------- | -------------------------------------------------- | ---------------------- |
| MAPP | Monthly Active PIPS Projects | Projects with user activity in trailing 30 days    | Track growth           |
| A1   | Signup-to-Org Rate           | % of signups who join an org                       | >90%                   |
| A2   | Signup-to-Project Rate       | % of signups who create a project in 7 days        | >60%                   |
| A3   | Step 1 Completion Rate       | % of real projects completing Step 1               | >70%                   |
| A4   | Multi-Step Rate              | % of real projects reaching Step 3+                | >40%                   |
| A5   | Time to First Form           | Median minutes to first form save                  | <20 min                |
| A6   | Invite-to-Accept Rate        | % of invitations accepted                          | >50%                   |
| A7   | Time to Team Value           | Median minutes to second user's first contribution | <60 min                |
| E1   | DAU/WAU/MAU                  | Distinct active users per period                   | Track trend            |
| E2   | DAU/MAU Ratio                | Stickiness ratio                                   | >0.15                  |
| E3   | Feature Usage Distribution   | % users per feature area                           | Track distribution     |
| E4   | Form Completion Rate         | % of forms started that are completed              | >50%                   |
| E5   | Step Progression Velocity    | Median days per step                               | Track trend (decrease) |
| E6   | Cadence Bar Click Rate       | % of step views with Cadence Bar interaction       | >15%                   |
| E7   | Knowledge Hub Sessions       | Reading sessions per week                          | Track trend            |
| E8   | Ticket Velocity              | Tickets done per org per week                      | Track trend            |
| R1   | Week-over-Week Retention     | % of W_N users active in W_N+1                     | >50% W1, >30% W4       |
| R2   | Org Monthly Retention        | % of orgs active in consecutive months             | >80%                   |
| R3   | Feature Stickiness           | Per-feature week-over-week retention               | Track per feature      |
| R4   | Project Completion Rate      | % of projects reaching Step 6                      | >40%                   |
| R5   | Dormant Org Detection        | Orgs with 0 activity in 14 days                    | <20% of total          |
| C1   | Free-to-Paid Rate            | % of free orgs upgrading in 60 days                | >5%                    |
| C2   | Trial-to-Paid Rate           | % of trials converting                             | >20%                   |
| C3   | Net Revenue Retention        | Revenue from existing customers vs. prior period   | >110%                  |
| C4   | ARPA                         | MRR / paying orgs                                  | $350/mo                |
| O1   | Server Error Rate            | 5xx rate                                           | <0.1%                  |
| O2   | P95 Page Load                | 95th percentile LCP                                | <2s                    |
| O3   | DB Query Latency             | P95 query execution time                           | <500ms                 |
| O4   | Uptime                       | Application availability                           | >99.9%                 |
| O5   | Email Delivery Rate          | % emails delivered (not bounced)                   | >98%                   |
| O6   | Audit Log Volume             | Rows inserted per day                              | Track trend            |

---

## Appendix B: Event-to-Dashboard Mapping

This table shows which events feed which dashboards, ensuring instrumentation priorities align with dashboard build order.

| Dashboard                    | Required Events                                                                                    | Required Views                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Org Admin Dashboard          | `project.created`, `step.advanced`, `project.completed`, `ticket.created`, `ticket.status_changed` | `v_project_step_funnel`, `v_stalled_projects`, `v_ticket_velocity_weekly` |
| Step Completion Funnel       | `step.advanced`, `project.completed`                                                               | `v_project_step_funnel`, `v_step_duration_stats`                          |
| Team Workload                | `ticket.created`, `ticket.assigned`, `ticket.status_changed`                                       | `v_ticket_velocity_weekly`                                                |
| Training Progress            | `training.module_started`, `training.exercise_completed`, `training.path_completed`                | `v_training_overview`                                                     |
| Content Engagement           | `knowledge.viewed`, `knowledge.bookmarked`, `knowledge.searched`, `cadence_bar.clicked`            | `v_knowledge_engagement`                                                  |
| Activation Funnel (internal) | `user.signed_up`, `org.created`, `project.created`, `form.saved`                                   | `v_activation_funnel`                                                     |

---

## Appendix C: Validation Plan for Metric Correctness

Every metric calculation must be testable. The QA Agent should verify:

1. **Funnel consistency:** The count at step N must be >= count at step N+1. If not, the funnel query has a bug.
2. **Retention bounds:** Retention rates must be between 0% and 100%. Any value outside this range indicates a calculation error.
3. **Time calculations:** Step duration must be non-negative. Negative durations indicate `started_at > completed_at` data quality issues.
4. **Sample project exclusion:** Run every metric query once with sample projects included and once excluded. The difference must equal the count of sample projects.
5. **Empty state handling:** Every view must return valid results (not errors) when there are zero rows. All dashboard widgets must show a meaningful empty state, not a broken chart.
6. **Multi-tenant isolation:** Run metric queries as two different org members. Each must see only their org's data. Never surface cross-org data.
7. **Idempotency:** The `trackEvent` function with the same `idempotency_key` must not create duplicate rows.

Write unit tests for each SQL view using known seed data (e.g., 3 orgs, 10 users, 5 projects with known step statuses). Assert exact counts.
