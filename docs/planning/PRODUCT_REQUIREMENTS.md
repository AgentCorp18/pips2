# PIPS 2.0 — Product Requirements Document

**Version:** 1.0
**Date:** 2026-03-02
**Author:** Marc Albers
**Status:** Draft

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Personas](#2-user-personas)
3. [Feature Requirements — Core Platform](#3-feature-requirements--core-platform)
4. [Feature Requirements — Enterprise](#4-feature-requirements--enterprise)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Information Architecture](#6-information-architecture)
7. [Wireframe Descriptions](#7-wireframe-descriptions)
8. [Data Model Summary](#8-data-model-summary)
9. [API Surface Summary](#9-api-surface-summary)
10. [Acceptance Criteria](#10-acceptance-criteria)

---

## 1. Product Overview

### 1.1 Product Vision

PIPS 2.0 is an enterprise SaaS platform that embeds a proven 6-step process improvement methodology directly into a modern project management and ticketing system. Unlike generic tools (Jira, Monday, Asana) that leave teams to figure out *how* to improve, PIPS 2.0 guides them through a structured, repeatable approach — from problem identification through root cause analysis, solution selection, implementation, and evaluation.

**Vision statement:** Make structured problem solving as accessible and natural as creating a ticket.

### 1.2 Product Mission

Empower organizations of any size to run disciplined improvement projects by providing guided methodology, digital tooling, and enterprise-grade project management in a single, white-labelable platform.

### 1.3 Target Market

| Segment | Description | Size |
|---------|-------------|------|
| **Primary** | Mid-market companies (200-5,000 employees) with operational excellence, quality, or continuous improvement functions | ~50,000 companies in North America |
| **Secondary** | Management consulting firms that deliver process improvement engagements and want a branded platform for clients | ~15,000 firms |
| **Tertiary** | Enterprise organizations (5,000+ employees) looking for a lightweight alternative to heavyweight BPM suites | ~10,000 companies |

### 1.4 Key Value Propositions

1. **Methodology-embedded workflow** — The PIPS 6-step process is built into every project, not bolted on as documentation. Each step includes guided prompts, digital tools, worked examples, and completion criteria.
2. **Dual-mode ticketing** — PIPS-guided projects for structured improvement AND general tickets for everyday task management, all in one system.
3. **White-label ready** — Consulting firms and enterprises can brand the platform as their own with custom logos, colors, domains, and terminology.
4. **Enterprise integrations** — Bi-directional sync with Jira, Azure DevOps, and AHA! means PIPS 2.0 works alongside existing tools rather than replacing them.
5. **Actionable analytics** — Dashboards that show not just ticket counts but improvement impact: cycle time reductions, completion rates by methodology step, and ROI tracking.

### 1.5 Success Metrics

| Metric | Target (Year 1) | Target (Year 2) |
|--------|-----------------|-----------------|
| Paying organizations | 50 | 200 |
| Monthly active users | 2,500 | 15,000 |
| PIPS projects completed | 500 | 3,000 |
| Average project cycle time | < 90 days | < 60 days |
| User NPS | > 40 | > 50 |
| Monthly recurring revenue | $25,000 | $150,000 |
| Churn rate (monthly) | < 5% | < 3% |
| White-label tenants | 5 | 25 |

### 1.6 Competitive Positioning

| Capability | PIPS 2.0 | Jira | Monday.com | Rhythm Systems | Asana |
|------------|----------|------|------------|----------------|-------|
| Structured methodology | Built-in 6-step | None | None | Proprietary (Think-Plan-Do) | None |
| Digital improvement tools | 26 templates + builder | None | Basic forms | Limited | None |
| General ticketing | Full | Full | Full | Limited | Full |
| White-label | Full | None | None | None | None |
| Parent/child tickets | Yes | Yes | Limited | No | Yes |
| Integration APIs | REST + webhooks | REST + webhooks | REST + webhooks | Limited | REST + webhooks |
| Price (per user/month) | $15-45 | $8-17 | $10-20 | Custom (high) | $11-25 |

---

## 2. User Personas

### 2.1 Process Champion — "Diana"

**Role:** Director of Operational Excellence
**Company:** Regional healthcare system, 3,200 employees
**Age:** 42 | **Technical skill:** Moderate

**Background:** Diana manages a team of 6 process improvement specialists. She has Lean Six Sigma Green Belt certification and runs 15-20 improvement projects per year. Currently she tracks projects in a mix of Excel, SharePoint, and email.

**Goals:**
- Standardize how her team runs improvement projects so quality is consistent regardless of who leads
- Get visibility into all active projects across her team without chasing status updates
- Demonstrate ROI of improvement work to the executive team with real data
- Onboard new team members faster with guided methodology

**Pain points:**
- Spends 5+ hours/week consolidating project status from spreadsheets and emails
- New hires take 6 months to learn the methodology well enough to run projects independently
- Cannot easily show executives aggregate impact of improvement work
- Every facilitator uses slightly different templates and approaches

**PIPS 2.0 usage:** Creates PIPS projects, assigns team leads, monitors dashboards, generates executive reports, customizes form templates for her organization.

**Key features:** Dashboard analytics, PIPS project creation, team management, PDF export, executive summary view.

### 2.2 Team Member — "Raj"

**Role:** Quality Analyst
**Company:** Manufacturing company, 800 employees
**Age:** 29 | **Technical skill:** High

**Background:** Raj is assigned to 3-4 PIPS improvement projects at a time and also handles day-to-day quality tickets. He fills out forms, attends project meetings, and implements action items. He uses Jira for his regular work.

**Goals:**
- See all his assigned work in one place (PIPS tasks and general tickets)
- Complete PIPS forms quickly without hunting for the right template
- Track his contributions for performance reviews
- Minimize context-switching between PIPS 2.0 and Jira

**Pain points:**
- Currently juggles 4 different tools (email, Excel, SharePoint, Jira)
- Forgets which PIPS step his projects are on and what forms are needed
- Cannot easily pull up his past project contributions
- Manual data entry between systems

**PIPS 2.0 usage:** Views "My Work" dashboard, fills out PIPS forms within project steps, creates and updates tickets, comments and @mentions teammates, uses Jira integration to sync tasks.

**Key features:** My Work view, PIPS form completion, ticket management, Jira sync, mobile access, @mentions.

### 2.3 Executive Sponsor — "Patricia"

**Role:** VP of Operations
**Company:** Insurance company, 5,000 employees
**Age:** 55 | **Technical skill:** Low

**Background:** Patricia sponsors the continuous improvement program and needs to justify its budget to the C-suite. She does not use the tool daily but checks in weekly and receives reports. She cares about outcomes, not process details.

**Goals:**
- Understand improvement program health in under 5 minutes
- See measurable business impact (cost savings, cycle time reduction, quality improvement)
- Identify stalled projects that need executive intervention
- Share progress with the CEO without creating separate presentations

**Pain points:**
- Current reporting is manual and arrives late
- Cannot tell which projects are stuck without asking the team
- ROI data is scattered and inconsistent
- Has to sit through detailed methodology discussions when she just wants outcomes

**PIPS 2.0 usage:** Views executive dashboard (weekly), receives digest emails, opens shared summary links, occasionally views individual project status.

**Key features:** Executive dashboard, shareable summary links, weekly digest email, project health indicators, ROI tracking.

### 2.4 System Administrator — "Marcus"

**Role:** IT Systems Manager
**Company:** Financial services firm, 1,200 employees
**Age:** 38 | **Technical skill:** Very high

**Background:** Marcus manages the company's SaaS tools. He is responsible for user provisioning, SSO configuration, security compliance, and integration setup. He evaluates tools against the company's security requirements before approving them.

**Goals:**
- Set up the platform quickly with SSO and user provisioning
- Ensure the tool meets security and compliance requirements (SOC 2, GDPR)
- Manage users and permissions without touching the product team's workflow
- Monitor usage and costs

**Pain points:**
- Many SaaS tools lack proper SSO support or charge extra for it
- User provisioning is manual and error-prone
- Audit logging is often incomplete or inaccessible
- Integration setup documentation is poor

**PIPS 2.0 usage:** Configures SSO/SAML, manages user accounts and roles, sets up integrations, reviews audit logs, manages billing.

**Key features:** Admin console, SSO/SAML configuration, user management, audit logs, API key management, billing portal.

### 2.5 External Client (White-Label) — "Sarah"

**Role:** Senior Consultant at a management consulting firm
**Company:** BrightPath Consulting, 45 employees
**Age:** 36 | **Technical skill:** Moderate

**Background:** Sarah's firm delivers process improvement engagements to clients. They want to use PIPS 2.0 as their client-facing platform, branded as "BrightPath Improve." Each of their clients should see only their own data, with BrightPath's branding throughout.

**Goals:**
- Deliver a polished, branded experience to clients without building custom software
- Manage multiple client organizations from a single console
- Differentiate her firm from competitors by offering a proprietary-looking methodology platform
- Onboard new clients onto the platform in under an hour

**Pain points:**
- Current client deliverables are PDFs and spreadsheets that clients never use after the engagement ends
- Clients cannot self-serve on improvement projects between consulting visits
- No recurring revenue after the initial engagement
- Building custom software is too expensive for a 45-person firm

**PIPS 2.0 usage:** Configures white-label settings (logo, colors, domain), creates client organizations, manages cross-client dashboards, customizes form templates per client.

**Key features:** White-label configuration, multi-tenant management, custom domain, branded emails, client onboarding workflow.

---

## 3. Feature Requirements — Core Platform

### 3.1 Authentication and User Management

#### 3.1.1 Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | Email + password sign-up with email verification | P0 |
| AUTH-02 | Email + password login | P0 |
| AUTH-03 | Password reset via email link (expires in 1 hour) | P0 |
| AUTH-04 | Multi-factor authentication (TOTP via authenticator app) | P1 |
| AUTH-05 | SSO via SAML 2.0 (enterprise tier) | P1 |
| AUTH-06 | SSO via OAuth 2.0 / OpenID Connect (Google, Microsoft) | P1 |
| AUTH-07 | Session management: 30-day refresh token, 1-hour access token | P0 |
| AUTH-08 | "Remember this device" option to extend session to 90 days | P2 |
| AUTH-09 | Force logout of all sessions from settings | P1 |
| AUTH-10 | Rate limiting: max 5 failed login attempts per 15 minutes, then 15-minute lockout | P0 |

#### 3.1.2 Organization Management

| ID | Requirement | Priority |
|----|-------------|----------|
| ORG-01 | Create organization during sign-up (name, slug, industry) | P0 |
| ORG-02 | Organization slug used in URLs: `app.pips2.com/{org-slug}/...` | P0 |
| ORG-03 | Organization settings: name, logo, timezone, date format | P0 |
| ORG-04 | Organization-level data isolation (RLS enforced at database level) | P0 |
| ORG-05 | Ability to transfer organization ownership | P1 |
| ORG-06 | Organization deletion with 30-day grace period and data export | P1 |
| ORG-07 | Multiple organization membership per user account | P1 |
| ORG-08 | Organization switcher in header navigation | P1 |

#### 3.1.3 User Invitation and Onboarding

| ID | Requirement | Priority |
|----|-------------|----------|
| INV-01 | Invite users via email (single or bulk CSV upload) | P0 |
| INV-02 | Invitation email with one-click accept link (expires in 7 days) | P0 |
| INV-03 | Invite with pre-assigned role (Owner, Admin, Manager, Member, Viewer) | P0 |
| INV-04 | Invite with pre-assigned team(s) | P1 |
| INV-05 | Pending invitation management (resend, revoke) | P0 |
| INV-06 | First-login onboarding tour (5 steps: welcome, create project, navigate, forms, settings) | P1 |
| INV-07 | Domain-based auto-join: users with matching email domain can self-join as Member | P2 |
| INV-08 | Invitation link sharing (generate a link for a specific role) | P1 |

#### 3.1.4 Role-Based Access Control

| Role | Org Settings | Users | Projects | Tickets | Forms | Analytics | Billing |
|------|-------------|-------|----------|---------|-------|-----------|---------|
| **Owner** | Full | Full | Full | Full | Full | Full | Full |
| **Admin** | Edit | Full | Full | Full | Full | Full | View |
| **Manager** | View | View + invite | Create + manage assigned | Full | Full | View | None |
| **Member** | None | View roster | View assigned | Create + edit own | Create + edit own | View own | None |
| **Viewer** | None | View roster | View assigned | View | View | View own | None |

| ID | Requirement | Priority |
|----|-------------|----------|
| RBAC-01 | Five predefined roles as specified above | P0 |
| RBAC-02 | Role assignment during invitation and editable after | P0 |
| RBAC-03 | At least one Owner per organization (cannot demote last Owner) | P0 |
| RBAC-04 | Permissions enforced at API level, not just UI level | P0 |
| RBAC-05 | Custom roles with granular permission toggles (enterprise tier) | P2 |
| RBAC-06 | Project-level role overrides (e.g., Member is Manager on specific project) | P2 |

#### 3.1.5 Team Management

| ID | Requirement | Priority |
|----|-------------|----------|
| TEAM-01 | Create teams with name, description, and color | P0 |
| TEAM-02 | Add/remove members from teams | P0 |
| TEAM-03 | Assign team lead (one per team) | P1 |
| TEAM-04 | Assign teams to projects | P0 |
| TEAM-05 | Filter views by team | P0 |
| TEAM-06 | Team workload view (assigned tickets per member) | P1 |
| TEAM-07 | Cross-team membership (user can belong to multiple teams) | P0 |
| TEAM-08 | Team-scoped notifications | P2 |

#### 3.1.6 User Profiles

| ID | Requirement | Priority |
|----|-------------|----------|
| PROF-01 | Profile fields: display name, email, avatar (upload or Gravatar), department, job title, phone | P0 |
| PROF-02 | Profile photo upload with crop tool (max 5 MB, stored in Supabase Storage) | P1 |
| PROF-03 | User activity feed: recent projects, tickets, forms | P1 |
| PROF-04 | Notification preferences (per-channel: in-app, email) | P0 |
| PROF-05 | Timezone and locale preferences | P1 |
| PROF-06 | "My Work" personal history: all projects and tickets the user has participated in | P0 |

---

### 3.2 PIPS Project Workflow

#### 3.2.1 Project Creation

| ID | Requirement | Priority |
|----|-------------|----------|
| PROJ-01 | Create PIPS project via "New Project" button from any page | P0 |
| PROJ-02 | Project creation form: title, description, sponsor, target completion date, priority | P0 |
| PROJ-03 | Problem submission form (Step 1 seed): problem statement, impact area, affected department, estimated impact | P0 |
| PROJ-04 | Auto-generate project slug from title (editable) | P0 |
| PROJ-05 | Assign project team at creation or after | P0 |
| PROJ-06 | Project visibility: Public (all org members), Private (team only) | P1 |
| PROJ-07 | Project templates: pre-filled projects for common improvement types (quality, efficiency, cost reduction, safety) | P2 |

#### 3.2.2 Six-Step Guided Workflow

Each PIPS project progresses through six steps. Each step is a discrete phase with its own objectives, tools, and completion criteria.

**Step 1: Identify**

| ID | Requirement | Priority |
|----|-------------|----------|
| S1-01 | Step objective displayed at top: "Define a clear, measurable problem statement" | P0 |
| S1-02 | Guided prompts: "What is happening?", "Where is it happening?", "When did it start?", "Who is affected?", "How big is the impact?" | P0 |
| S1-03 | Problem statement editor with good/bad examples (transformation cards) | P0 |
| S1-04 | Impact assessment form: financial impact, time impact, quality impact, safety impact, customer impact (each rated 1-5) | P0 |
| S1-05 | Team formation tool: assign project lead, team members, sponsor, stakeholders | P0 |
| S1-06 | Available digital forms: Problem Submission | P0 |
| S1-07 | Worked example panel showing a completed Step 1 (Parking Lot scenario) | P1 |
| S1-08 | Completion criteria: problem statement saved, impact assessment completed, at least 2 team members assigned | P0 |

**Step 2: Analyze**

| ID | Requirement | Priority |
|----|-------------|----------|
| S2-01 | Step objective: "Identify root causes through structured analysis" | P0 |
| S2-02 | Guided prompts: "What data do you need?", "What tools will you use?", "Who should you interview?" | P0 |
| S2-03 | Digital fishbone (Ishikawa) diagram: interactive canvas with 6 standard categories (People, Process, Equipment, Materials, Environment, Management), drag-and-drop causes, export to PDF | P0 |
| S2-04 | 5-Why analysis form: iterative "Why?" chain with space for evidence at each level | P0 |
| S2-05 | Force-field analysis tool: driving forces vs. restraining forces, scored 1-5, visual balance chart | P1 |
| S2-06 | Checksheet builder: define categories and count occurrences, auto-generate Pareto chart from data | P1 |
| S2-07 | Interview guide template: structured questions, note fields, findings summary | P1 |
| S2-08 | Survey builder: multiple choice, rating scale, open text, distribute via link, aggregate responses | P2 |
| S2-09 | Available digital forms: Checksheet, Force Field, Interviewing, Surveying | P0 |
| S2-10 | Worked example panel showing completed analysis tools | P1 |
| S2-11 | Completion criteria: at least one analysis tool completed, root cause statement documented | P0 |

**Step 3: Generate**

| ID | Requirement | Priority |
|----|-------------|----------|
| S3-01 | Step objective: "Generate a broad set of potential solutions" | P0 |
| S3-02 | Guided prompts: "What could eliminate the root cause?", "What has worked elsewhere?", "What if there were no constraints?" | P0 |
| S3-03 | Brainstorming tool: timed session, idea cards (one idea per card), categorization, voting | P0 |
| S3-04 | Brainwriting tool: round-robin idea generation (each participant adds ideas, then passes), digital version with timed rounds | P1 |
| S3-05 | List reduction tool: combine duplicates, group related ideas, eliminate infeasible ideas with rationale | P0 |
| S3-06 | Parking lot: capture off-topic ideas for later review | P1 |
| S3-07 | Available digital forms: Brainstorming, Brainwriting, List Reduction | P0 |
| S3-08 | Worked example panel | P1 |
| S3-09 | Completion criteria: at least 5 ideas generated, list reduced to top candidates (3-7) | P0 |

**Step 4: Select and Plan**

| ID | Requirement | Priority |
|----|-------------|----------|
| S4-01 | Step objective: "Choose the best solution and create an implementation plan" | P0 |
| S4-02 | Criteria rating matrix: define criteria (cost, time, risk, impact, feasibility), weight each criterion, score each solution, auto-calculate weighted totals | P0 |
| S4-03 | Paired comparisons tool: compare solutions head-to-head, generate ranking | P1 |
| S4-04 | Weighted voting tool: each participant distributes points across solutions, aggregate results | P1 |
| S4-05 | Cost-benefit analysis form: itemized costs, itemized benefits, ROI calculation, payback period | P0 |
| S4-06 | RACI matrix builder: list tasks/deliverables, assign Responsible/Accountable/Consulted/Informed per team member | P0 |
| S4-07 | Implementation checklist builder: tasks, owners, due dates, dependencies, status tracking | P0 |
| S4-08 | Available digital forms: Criteria Rating, Paired Comparisons, Weighted Voting, Cost-Benefit, RACI Matrix, Implementation Checklist | P0 |
| S4-09 | Auto-generate tickets from implementation checklist items | P1 |
| S4-10 | Worked example panel | P1 |
| S4-11 | Completion criteria: solution selected with documented rationale, implementation plan with at least 3 tasks, RACI defined | P0 |

**Step 5: Implement**

| ID | Requirement | Priority |
|----|-------------|----------|
| S5-01 | Step objective: "Execute the implementation plan and track progress" | P0 |
| S5-02 | Implementation dashboard: task list from Step 4 with real-time status, percent complete, blockers | P0 |
| S5-03 | Meeting agenda template: pre-populated with project context, action items from last meeting, current blockers | P1 |
| S5-04 | Progress tracking: Gantt-style timeline of implementation tasks | P1 |
| S5-05 | Blocker escalation: flag items that are stuck, notify sponsor | P1 |
| S5-06 | Available digital forms: Meeting Agenda, Implementation Checklist | P0 |
| S5-07 | Worked example panel | P1 |
| S5-08 | Completion criteria: all implementation tasks marked Done or explicitly descoped with rationale | P0 |

**Step 6: Evaluate**

| ID | Requirement | Priority |
|----|-------------|----------|
| S6-01 | Step objective: "Measure results and capture lessons learned" | P0 |
| S6-02 | Before/after comparison tool: side-by-side metrics comparison with visual charts | P0 |
| S6-03 | Evaluation form: rate effectiveness of solution on each original impact dimension | P0 |
| S6-04 | Balance sheet: categorize outcomes as positive, negative, and neutral | P1 |
| S6-05 | Lessons learned template: what worked, what didn't, what to do differently, recommendations | P0 |
| S6-06 | Project summary auto-generation: pull data from all 6 steps into a one-page summary | P1 |
| S6-07 | Available digital forms: Evaluation, Balance Sheet | P0 |
| S6-08 | Worked example panel | P1 |
| S6-09 | Completion criteria: evaluation form completed, lessons learned documented, project marked as Completed | P0 |

#### 3.2.3 Workflow Controls

| ID | Requirement | Priority |
|----|-------------|----------|
| WF-01 | Visual step progress indicator (horizontal stepper) showing current step, completed steps, and locked steps | P0 |
| WF-02 | Step gating: cannot advance to next step until completion criteria are met (with override for Managers+) | P0 |
| WF-03 | Step regression: can return to previous steps to update work | P0 |
| WF-04 | Project status: Not Started, In Progress, On Hold, Completed, Archived | P0 |
| WF-05 | "On Hold" status requires a reason and notifies sponsor | P1 |
| WF-06 | Project timeline: auto-calculated from step completion dates, show actual vs. planned | P1 |
| WF-07 | Project cloning: duplicate a completed project as a template for similar work | P2 |
| WF-08 | Configurable step names per organization (e.g., rename "Identify" to "Define") while keeping methodology structure | P2 |

---

### 3.3 Digital Forms System

#### 3.3.1 Pre-Built Form Templates

All 26 forms from the PIPS methodology must be digitized as interactive form templates.

| ID | Form Name | PIPS Step(s) | Priority |
|----|-----------|-------------|----------|
| FORM-01 | Problem Submission | Step 1 | P0 |
| FORM-02 | Brainstorming | Step 3 | P0 |
| FORM-03 | Brainwriting | Step 3 | P1 |
| FORM-04 | Checksheet | Step 2 | P1 |
| FORM-05 | Cost-Benefit Analysis | Step 4 | P0 |
| FORM-06 | Criteria Rating Matrix | Step 4 | P0 |
| FORM-07 | Evaluation | Step 6 | P0 |
| FORM-08 | Force Field Analysis | Step 2 | P1 |
| FORM-09 | Implementation Checklist | Step 4, 5 | P0 |
| FORM-10 | Interviewing Guide | Step 2 | P1 |
| FORM-11 | List Reduction | Step 3 | P0 |
| FORM-12 | Meeting Agenda | Step 5 | P1 |
| FORM-13 | Paired Comparisons | Step 4 | P1 |
| FORM-14 | RACI Matrix | Step 4 | P0 |
| FORM-15 | Surveying | Step 2 | P2 |
| FORM-16 | Weighted Voting | Step 4 | P1 |
| FORM-17 | Fishbone (Ishikawa) Diagram | Step 2 | P0 |
| FORM-18 | 5-Why Analysis | Step 2 | P0 |
| FORM-19 | Before/After Comparison | Step 6 | P0 |
| FORM-20 | Balance Sheet | Step 6 | P1 |
| FORM-21 | Lessons Learned | Step 6 | P0 |
| FORM-22 | Parking Lot — Brainstorming | Step 3 | P1 |
| FORM-23 | Parking Lot — Checksheet | Step 2 | P2 |
| FORM-24 | Parking Lot — Cost-Benefit | Step 4 | P2 |
| FORM-25 | Parking Lot — Criteria Rating | Step 4 | P2 |
| FORM-26 | Tools Quick Guide | All | P1 |

#### 3.3.2 Form Capabilities

| ID | Requirement | Priority |
|----|-------------|----------|
| FCAP-01 | Each form renders as an interactive web form with typed fields (text, number, select, multi-select, date, rating scale, rich text) | P0 |
| FCAP-02 | Auto-save every 30 seconds and on field blur | P0 |
| FCAP-03 | Version history: every save creates a version, viewable and restorable | P0 |
| FCAP-04 | Collaborative editing: lock-based (one editor at a time, others see "Editing by [Name]") | P0 |
| FCAP-05 | Real-time collaborative editing (multiple simultaneous editors with cursor presence) | P2 |
| FCAP-06 | Form completion percentage indicator | P0 |
| FCAP-07 | Export individual form to PDF (styled, printable) | P0 |
| FCAP-08 | Export all forms for a project to a single PDF bundle | P1 |
| FCAP-09 | Attach forms to a PIPS project step or to a ticket | P0 |
| FCAP-10 | Form data aggregation: roll up numeric data across multiple form instances (e.g., average scores from multiple evaluations) | P1 |
| FCAP-11 | Form comments: add comments to specific fields or the form as a whole | P1 |
| FCAP-12 | Form duplication: copy a filled form as a starting point for a new one | P1 |
| FCAP-13 | Form search: full-text search across all form content in the organization | P1 |

#### 3.3.3 Custom Form Builder

| ID | Requirement | Priority |
|----|-------------|----------|
| FBLD-01 | Drag-and-drop form builder with field palette | P1 |
| FBLD-02 | Field types: short text, long text, number, date, single select, multi-select, checkbox, rating (1-5), file upload, section header, instructions text | P1 |
| FBLD-03 | Field properties: label, placeholder, required, help text, default value, validation rules | P1 |
| FBLD-04 | Conditional logic: show/hide fields based on other field values | P2 |
| FBLD-05 | Save custom forms as organization templates | P1 |
| FBLD-06 | Form preview mode before publishing | P1 |
| FBLD-07 | Form versioning: update template without affecting existing filled instances | P1 |

---

### 3.4 Ticketing System

#### 3.4.1 PIPS Tickets

| ID | Requirement | Priority |
|----|-------------|----------|
| PTKT-01 | Create tickets from within a PIPS project step (e.g., from Step 4 implementation checklist) | P0 |
| PTKT-02 | PIPS tickets carry context: linked project, step number, related form, root cause reference | P0 |
| PTKT-03 | PIPS ticket badge/indicator showing methodology context | P0 |
| PTKT-04 | Navigate from ticket back to the PIPS project step that created it | P0 |
| PTKT-05 | Auto-update PIPS step progress when linked tickets are completed | P1 |
| PTKT-06 | PIPS ticket timeline shows where in the 6-step process the ticket exists | P1 |

#### 3.4.2 General Tickets

| ID | Requirement | Priority |
|----|-------------|----------|
| GTKT-01 | Create standalone tickets not tied to any PIPS project | P0 |
| GTKT-02 | General tickets have all common ticket features (see 3.4.3) | P0 |
| GTKT-03 | Convert general ticket to a PIPS project: creates a new project with the ticket's description as the problem statement in Step 1 | P1 |
| GTKT-04 | Link general tickets to PIPS projects without converting (reference link) | P1 |

#### 3.4.3 Common Ticket Features

| ID | Requirement | Priority |
|----|-------------|----------|
| TKT-01 | Ticket fields: title (required, max 200 chars), description (rich text with markdown), type (Task, Bug, Story, Epic, Improvement), priority (Critical, High, Medium, Low), status | P0 |
| TKT-02 | Auto-generated ticket ID: `{ORG}-{NUMBER}` (e.g., `ACME-142`) | P0 |
| TKT-03 | Status workflow — default: Backlog > To Do > In Progress > In Review > Done > Closed | P0 |
| TKT-04 | Custom status workflows per organization: define statuses, transitions, and required fields per transition | P1 |
| TKT-05 | Assignee: one primary assignee (required to move to In Progress) | P0 |
| TKT-06 | Co-assignees: additional assignees for collaborative work | P1 |
| TKT-07 | Reporter: auto-set to ticket creator, editable | P0 |
| TKT-08 | Watchers: users who receive notifications on ticket updates | P0 |
| TKT-09 | Parent/child relationships: Epic > Story > Subtask hierarchy (max 3 levels) | P0 |
| TKT-10 | Parent ticket progress bar: auto-calculated from child ticket completion | P0 |
| TKT-11 | Labels: organization-defined labels with colors (e.g., "frontend", "urgent", "customer-facing") | P0 |
| TKT-12 | Tags: free-form tags for ad-hoc categorization | P1 |
| TKT-13 | Categories: organization-defined categories (e.g., "Quality", "Safety", "Efficiency") | P1 |
| TKT-14 | Due date with optional time | P0 |
| TKT-15 | Start date | P1 |
| TKT-16 | Time tracking: estimated hours, logged hours (manual entry), auto-calculated remaining | P1 |
| TKT-17 | Comments: rich text with markdown, @mentions, inline images | P0 |
| TKT-18 | @mention autocomplete: type `@` to search and tag users, sends notification | P0 |
| TKT-19 | File attachments: drag-and-drop, max 25 MB per file, stored in Supabase Storage | P0 |
| TKT-20 | Image paste: paste screenshots directly into description or comments | P1 |
| TKT-21 | Activity log: timestamped record of all changes (status, assignee, priority, description edits, comments) | P0 |
| TKT-22 | Custom fields: organization-defined fields (text, number, date, select, multi-select, URL, user) | P1 |
| TKT-23 | Bulk operations: select multiple tickets, then assign, change status, add label, move to project, or delete | P0 |
| TKT-24 | Ticket templates: pre-defined ticket templates with default fields, labels, and descriptions | P1 |
| TKT-25 | Ticket linking: relate tickets as "blocks", "is blocked by", "duplicates", "related to" | P1 |
| TKT-26 | Sprint/iteration assignment: assign tickets to time-boxed iterations | P2 |
| TKT-27 | Story points / effort estimation field | P2 |
| TKT-28 | SLA tracking: define response time and resolution time targets per priority, visual indicator of SLA status | P2 |

---

### 3.5 Views and Navigation

#### 3.5.1 Board View (Kanban)

| ID | Requirement | Priority |
|----|-------------|----------|
| BRD-01 | Kanban board with columns for each status in the workflow | P0 |
| BRD-02 | Drag-and-drop tickets between columns to change status | P0 |
| BRD-03 | Ticket cards show: ID, title, priority badge, assignee avatar, due date (red if overdue), labels, child count | P0 |
| BRD-04 | Column WIP (work-in-progress) limits: configurable max tickets per column, visual warning when exceeded | P1 |
| BRD-05 | Swimlanes: group rows by assignee, priority, label, or team | P1 |
| BRD-06 | Quick-add: "+" button at bottom of each column to create ticket in that status | P0 |
| BRD-07 | Filter bar: filter board by assignee, priority, label, date range, search text | P0 |
| BRD-08 | Board scope: project board, team board, or organization board | P0 |

#### 3.5.2 List View

| ID | Requirement | Priority |
|----|-------------|----------|
| LST-01 | Sortable table with columns: ID, title, status, priority, assignee, due date, created date, labels | P0 |
| LST-02 | Click column header to sort ascending/descending | P0 |
| LST-03 | Multi-column sort (shift+click) | P1 |
| LST-04 | Column visibility toggles (show/hide columns) | P1 |
| LST-05 | Inline editing: click a cell to edit status, assignee, priority, due date without opening the ticket | P1 |
| LST-06 | Row selection with checkbox for bulk operations | P0 |
| LST-07 | Pagination: 50 tickets per page with page navigation | P0 |
| LST-08 | Expandable rows to show child tickets inline | P1 |
| LST-09 | Group by: status, priority, assignee, label, project, PIPS step | P1 |

#### 3.5.3 Timeline View

| ID | Requirement | Priority |
|----|-------------|----------|
| TML-01 | Gantt-style horizontal bar chart with tickets as rows and dates as columns | P1 |
| TML-02 | Bars span from start date to due date (or created date to due date if no start date) | P1 |
| TML-03 | Color-coded bars by status or priority | P1 |
| TML-04 | Drag bar edges to change dates | P2 |
| TML-05 | Dependency arrows between tickets (based on "blocks" relationships) | P2 |
| TML-06 | Zoom levels: day, week, month, quarter | P1 |
| TML-07 | Today marker (vertical line) | P1 |
| TML-08 | Milestone markers for PIPS step transitions | P1 |

#### 3.5.4 Calendar View

| ID | Requirement | Priority |
|----|-------------|----------|
| CAL-01 | Monthly calendar grid with tickets placed on their due dates | P1 |
| CAL-02 | Week and day views | P2 |
| CAL-03 | Drag tickets between dates to change due date | P1 |
| CAL-04 | Color-coded by priority or status | P1 |
| CAL-05 | Click date to quick-create ticket with that due date | P1 |
| CAL-06 | Filter by assignee, project, label | P1 |

#### 3.5.5 My Work View

| ID | Requirement | Priority |
|----|-------------|----------|
| MYW-01 | Personal dashboard showing all tickets assigned to the current user across all projects | P0 |
| MYW-02 | Sections: Overdue, Due Today, Due This Week, Due Later, No Due Date | P0 |
| MYW-03 | PIPS project cards: current step, next action needed, project health | P0 |
| MYW-04 | Recent activity feed: tickets updated, forms completed, comments received | P0 |
| MYW-05 | Quick actions: change status, reassign, add comment without leaving My Work | P1 |
| MYW-06 | "My Forms" section: forms the user has created or contributed to | P1 |
| MYW-07 | Saved filters accessible from My Work | P1 |

#### 3.5.6 Project View

| ID | Requirement | Priority |
|----|-------------|----------|
| PJV-01 | Project overview page: name, description, status, team, dates, PIPS step progress | P0 |
| PJV-02 | Sub-navigation tabs: Overview, Board, List, Timeline, Forms, Settings | P0 |
| PJV-03 | Overview tab: PIPS step stepper, summary statistics, recent activity, team members | P0 |
| PJV-04 | Board/List/Timeline tabs scoped to project tickets only | P0 |
| PJV-05 | Forms tab: all forms attached to this project, organized by step | P0 |
| PJV-06 | Settings tab: project name, visibility, team, dates, archive/delete (Manager+) | P0 |

#### 3.5.7 Team View

| ID | Requirement | Priority |
|----|-------------|----------|
| TMV-01 | Team overview: members, active projects, open tickets | P1 |
| TMV-02 | Workload heatmap: tickets assigned per team member, color-coded by load (green/yellow/red) | P1 |
| TMV-03 | Team velocity chart: tickets completed per week/sprint over time | P2 |
| TMV-04 | Team board: Kanban board scoped to team tickets | P1 |

---

### 3.6 Dashboard and Analytics

#### 3.6.1 Organization Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| DASH-01 | Default landing page after login (configurable per user) | P0 |
| DASH-02 | Widget-based layout: users can add, remove, resize, and reorder widgets | P1 |
| DASH-03 | Default widgets: Active Projects count, Open Tickets count, Overdue Items count, My Tasks, Recent Activity | P0 |

#### 3.6.2 PIPS Metrics Widgets

| ID | Requirement | Priority |
|----|-------------|----------|
| PMET-01 | Projects by Phase: bar chart showing count of projects in each PIPS step | P0 |
| PMET-02 | Average Cycle Time: average days from project creation to completion, by month | P0 |
| PMET-03 | Completion Rate: percentage of projects that reach Step 6 vs. abandoned/on-hold | P0 |
| PMET-04 | Step Duration: average time spent in each PIPS step (identifies bottlenecks) | P1 |
| PMET-05 | Tool Usage: which PIPS forms/tools are used most frequently | P1 |
| PMET-06 | Impact Delivered: sum of reported impact (from evaluation forms) across completed projects | P1 |

#### 3.6.3 Ticketing Metrics Widgets

| ID | Requirement | Priority |
|----|-------------|----------|
| TMET-01 | Tickets Closed: count by week/month, with trend line | P0 |
| TMET-02 | Open Tickets by Priority: stacked bar chart | P0 |
| TMET-03 | Average Resolution Time: by priority level | P1 |
| TMET-04 | Tickets Created vs. Closed: dual-line trend chart | P1 |
| TMET-05 | Workload Distribution: tickets per assignee | P1 |
| TMET-06 | Overdue Tickets: count and list | P0 |

#### 3.6.4 Executive Summary

| ID | Requirement | Priority |
|----|-------------|----------|
| EXEC-01 | Shareable executive summary page (public link with token, no login required) | P1 |
| EXEC-02 | Summary includes: active project count, completion rate, top 5 projects by impact, aggregate ROI, key wins | P1 |
| EXEC-03 | Auto-generated from project data, updated in real time | P1 |
| EXEC-04 | Export to PDF | P1 |
| EXEC-05 | Configurable: choose which metrics and projects to include | P2 |

---

### 3.7 Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| NOTIF-01 | In-app notification bell with unread count badge | P0 |
| NOTIF-02 | Notification dropdown: list of recent notifications with mark-as-read | P0 |
| NOTIF-03 | Notification types: assigned to ticket, mentioned in comment, ticket status changed, due date approaching (1 day, overdue), project step advanced, new comment on watched ticket | P0 |
| NOTIF-04 | Email notifications: same types as in-app, sent immediately or batched (configurable) | P0 |
| NOTIF-05 | @mention notifications: in-app (immediate) + email (within 5 minutes) | P0 |
| NOTIF-06 | Due date reminders: 1 day before due date (in-app + email) | P1 |
| NOTIF-07 | Weekly digest email: summary of activity, overdue items, upcoming due dates | P1 |
| NOTIF-08 | Notification preferences: per-type toggle for in-app and email channels | P0 |
| NOTIF-09 | Quiet hours: suppress non-urgent notifications during configured hours | P2 |
| NOTIF-10 | Notification center page: full history, filterable by type | P1 |
| NOTIF-11 | Mark all as read | P0 |

---

### 3.8 Search and Filtering

| ID | Requirement | Priority |
|----|-------------|----------|
| SRCH-01 | Global search bar in header (keyboard shortcut: Cmd/Ctrl + K) | P0 |
| SRCH-02 | Search across: tickets (title, description), projects (title, description), forms (content), comments (text), users (name, email) | P0 |
| SRCH-03 | Search results grouped by type with counts | P0 |
| SRCH-04 | Full-text search with relevance ranking (powered by Supabase pg_trgm or full-text search) | P0 |
| SRCH-05 | Recent searches: last 10 searches saved per user | P1 |
| SRCH-06 | Advanced filter panel: status, assignee, priority, date range (created, due, updated), labels, project, PIPS step, ticket type | P0 |
| SRCH-07 | Saved filters: save a filter configuration with a name, accessible from sidebar | P0 |
| SRCH-08 | Shared filters: saved filters visible to the team or organization | P1 |
| SRCH-09 | Filter URL persistence: current filter state reflected in URL query params for sharing | P0 |
| SRCH-10 | Quick filters: one-click filters in sidebar (My Open Tickets, Overdue, Created by Me, Unassigned) | P0 |

---

## 4. Feature Requirements — Enterprise

### 4.1 White-Label System

| ID | Requirement | Priority |
|----|-------------|----------|
| WL-01 | Custom organization name: replaces "PIPS 2.0" throughout the UI (page titles, headers, emails, PDFs) | P0 |
| WL-02 | Custom color scheme: primary color, secondary color, accent color applied via CSS custom properties | P0 |
| WL-03 | Custom logo upload: header logo (max 200x60px), login page logo (max 400x200px), email logo (max 300x100px), stored in Supabase Storage | P0 |
| WL-04 | Custom favicon upload (ICO or SVG, max 64x64px) | P1 |
| WL-05 | Custom CSS injection: textarea in admin settings for organization-specific CSS overrides (sanitized, max 50 KB) | P2 |
| WL-06 | Custom domain: organization can point their domain (e.g., `improve.brightpath.com`) via CNAME to PIPS 2.0 | P1 |
| WL-07 | SSL provisioning: auto-provision Let's Encrypt certificates for custom domains | P1 |
| WL-08 | Branded email templates: organization logo and colors applied to all transactional emails | P1 |
| WL-09 | Login page customization: background image, welcome message, terms of service link | P1 |
| WL-10 | PDF export branding: organization logo and colors on all exported PDFs | P1 |
| WL-11 | Terminology customization: rename "PIPS" to custom term, rename step names (e.g., "Identify" to "Discover") | P2 |
| WL-12 | White-label preview mode: see changes before publishing | P1 |

### 4.2 Integrations

#### 4.2.1 Jira Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| JIRA-01 | OAuth 2.0 connection to Jira Cloud | P1 |
| JIRA-02 | Bi-directional ticket sync: create ticket in PIPS 2.0, appears in Jira (and vice versa) | P1 |
| JIRA-03 | Status mapping: map PIPS 2.0 statuses to Jira statuses per project | P1 |
| JIRA-04 | Field mapping: map PIPS 2.0 fields to Jira fields (priority, assignee, labels, description) | P1 |
| JIRA-05 | Comment sync: comments added in either system appear in both | P1 |
| JIRA-06 | Attachment sync: files attached in either system accessible in both | P2 |
| JIRA-07 | Sync conflict resolution: last-write-wins with conflict log | P1 |
| JIRA-08 | Selective sync: choose which projects/boards to sync | P1 |
| JIRA-09 | Sync status dashboard: last sync time, error count, items pending | P1 |

#### 4.2.2 Azure DevOps Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| ADO-01 | OAuth connection to Azure DevOps Services | P2 |
| ADO-02 | Work item sync: PIPS 2.0 tickets map to Azure DevOps work items | P2 |
| ADO-03 | Sprint mapping: Azure DevOps iterations map to PIPS 2.0 sprints/iterations | P2 |
| ADO-04 | Status and field mapping (same capabilities as Jira integration) | P2 |
| ADO-05 | Sync status dashboard | P2 |

#### 4.2.3 AHA! Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| AHA-01 | API key connection to AHA! | P2 |
| AHA-02 | Feature/idea sync: AHA! features map to PIPS 2.0 tickets or projects | P2 |
| AHA-03 | One-way sync from AHA! to PIPS 2.0 (with optional two-way) | P2 |

#### 4.2.4 Slack Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| SLK-01 | Slack app installation via OAuth | P1 |
| SLK-02 | Notification forwarding: selected notification types posted to configured Slack channels | P1 |
| SLK-03 | Ticket creation from Slack: slash command `/pips create [title]` creates ticket | P1 |
| SLK-04 | Ticket status updates in Slack: bot posts when tickets are completed | P2 |
| SLK-05 | Slack thread to ticket: react with emoji to create ticket from a Slack message | P2 |

#### 4.2.5 Microsoft Teams Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| TEAMS-01 | Teams app installation | P2 |
| TEAMS-02 | Notification forwarding to Teams channels | P2 |
| TEAMS-03 | Ticket creation via Teams bot command | P2 |

#### 4.2.6 Email Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| EMAIL-01 | Inbound email-to-ticket: forward emails to `{org-slug}@inbound.pips2.com`, creates ticket with email subject as title and body as description | P1 |
| EMAIL-02 | Email reply-to-comment: reply to ticket notification email, reply becomes a ticket comment | P1 |
| EMAIL-03 | Attachments from email preserved as ticket attachments | P1 |

#### 4.2.7 Webhooks and API

| ID | Requirement | Priority |
|----|-------------|----------|
| HOOK-01 | Outgoing webhooks: configurable webhook URLs triggered on events (ticket.created, ticket.updated, project.step_advanced, etc.) | P0 |
| HOOK-02 | Webhook payload: JSON with event type, timestamp, actor, and full entity data | P0 |
| HOOK-03 | Webhook retry: 3 retries with exponential backoff on HTTP 5xx or timeout | P0 |
| HOOK-04 | Webhook secret: HMAC-SHA256 signature in header for payload verification | P0 |
| HOOK-05 | Webhook logs: last 100 deliveries with status, response code, and response time | P1 |
| HOOK-06 | Zapier/Make compatibility: webhook format compatible with Zapier catch hook triggers | P1 |
| HOOK-07 | REST API: full CRUD for all entities (tickets, projects, forms, users, teams) | P0 |
| HOOK-08 | API authentication: API key (per organization) in header `X-API-Key` | P0 |
| HOOK-09 | API rate limiting: 1,000 requests per minute per API key (burst: 100 requests per second) | P0 |
| HOOK-10 | API documentation: auto-generated OpenAPI 3.0 spec, hosted at `api.pips2.com/docs` | P0 |
| HOOK-11 | API versioning: URL-based versioning (`/v1/tickets`) | P0 |
| HOOK-12 | API pagination: cursor-based pagination on all list endpoints | P0 |

---

### 4.3 Security and Compliance

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-01 | SSO/SAML 2.0: configure identity provider (Okta, Azure AD, OneLogin), enforce SSO-only login | P1 |
| SEC-02 | SCIM provisioning: auto-create/deactivate users based on IdP directory changes | P2 |
| SEC-03 | Audit logging: every data mutation (create, update, delete) logged with timestamp, actor, IP address, entity type, entity ID, old value, new value | P0 |
| SEC-04 | Audit log retention: 1 year minimum, exportable to CSV | P0 |
| SEC-05 | Audit log viewer: searchable, filterable in admin console | P1 |
| SEC-06 | Data retention policies: configurable retention periods per entity type, auto-archive after expiry | P2 |
| SEC-07 | GDPR: data export (download all user data as JSON/CSV within 72 hours of request) | P1 |
| SEC-08 | GDPR: right to be forgotten (anonymize or delete user data, replace with "[Deleted User]" in activity logs) | P1 |
| SEC-09 | GDPR: cookie consent banner on marketing pages | P1 |
| SEC-10 | SOC 2 readiness: document all controls, implement required policies (access control, encryption, monitoring, incident response) | P2 |
| SEC-11 | IP allowlisting: restrict organization access to specified IP ranges (enterprise tier) | P2 |
| SEC-12 | Session management: view active sessions, revoke specific sessions, configurable session timeout (default: 30 days) | P1 |
| SEC-13 | Password policy: minimum 10 characters, at least one uppercase, one lowercase, one number; breached password check via HaveIBeenPwned API | P0 |
| SEC-14 | Encryption at rest: Supabase handles via AES-256 on database and storage | P0 |
| SEC-15 | Encryption in transit: TLS 1.2+ on all connections | P0 |
| SEC-16 | Content Security Policy headers on all pages | P0 |
| SEC-17 | Two-person approval for destructive actions: organization deletion, bulk user removal | P2 |

---

### 4.4 Admin Console

| ID | Requirement | Priority |
|----|-------------|----------|
| ADM-01 | Admin console accessible from sidebar for Admin+ roles | P0 |
| ADM-02 | Organization settings: name, logo, timezone, date format, default language | P0 |
| ADM-03 | User management: list all users, search, filter by role/team/status, invite, deactivate, change role | P0 |
| ADM-04 | Deactivated users: cannot login, their tickets/forms preserved, name shows as "(Deactivated)" | P0 |
| ADM-05 | Billing management: current plan, usage, upgrade/downgrade, payment method, invoice history (Stripe Customer Portal embed) | P0 |
| ADM-06 | Usage analytics: active users (DAU/WAU/MAU), storage used, tickets created, API calls | P1 |
| ADM-07 | Integration management: connect/disconnect integrations, configure sync settings, view sync status | P1 |
| ADM-08 | Custom field definitions: create/edit/delete custom fields available on tickets org-wide | P1 |
| ADM-09 | Workflow customization: define custom status workflows, set default workflow | P1 |
| ADM-10 | Label management: create/edit/delete labels with colors | P0 |
| ADM-11 | Category management: create/edit/delete categories | P1 |
| ADM-12 | Data import: CSV import for tickets (with field mapping wizard) | P1 |
| ADM-13 | Data export: full org data export (JSON or CSV) for backup or migration | P1 |
| ADM-14 | White-label settings: branding configuration (see WL-01 through WL-12) | P0 |
| ADM-15 | API key management: generate, revoke, list API keys with last-used timestamp | P0 |
| ADM-16 | Webhook management: create, edit, delete, test webhooks | P0 |
| ADM-17 | Audit log viewer (see SEC-05) | P1 |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page load (initial) | < 3 seconds on 3G, < 1.5 seconds on broadband | Lighthouse, Web Vitals |
| Page navigation (SPA) | < 500 ms | Client-side measurement |
| API response time (p50) | < 200 ms | Server-side logs |
| API response time (p95) | < 500 ms | Server-side logs |
| API response time (p99) | < 2,000 ms | Server-side logs |
| Search response time | < 1 second for up to 100,000 tickets | Server-side logs |
| Real-time updates | < 2 seconds propagation (via Supabase Realtime) | Client-side measurement |
| Core Web Vitals LCP | < 2.5 seconds | Lighthouse |
| Core Web Vitals FID | < 100 ms | Lighthouse |
| Core Web Vitals CLS | < 0.1 | Lighthouse |

### 5.2 Availability and Reliability

| Metric | Target |
|--------|--------|
| Uptime SLA | 99.9% (excludes scheduled maintenance) |
| Scheduled maintenance windows | Sundays 02:00-06:00 UTC, announced 48 hours in advance |
| Recovery Time Objective (RTO) | < 1 hour |
| Recovery Point Objective (RPO) | < 5 minutes |
| Error rate | < 0.1% of API requests return 5xx |

### 5.3 Scalability

| Dimension | Target |
|-----------|--------|
| Users per organization | Up to 10,000 |
| Total organizations | Up to 1,000 |
| Tickets per organization | Up to 1,000,000 |
| Projects per organization | Up to 10,000 |
| Concurrent users (global) | Up to 50,000 |
| File storage per organization | Up to 100 GB (configurable per plan) |
| API requests per minute per org | 1,000 (burst: 100/sec) |

### 5.4 Security

- OWASP Top 10 compliance (verified via automated scanning and annual pen test)
- All data encrypted at rest (AES-256 via Supabase/AWS)
- All data encrypted in transit (TLS 1.2+)
- SQL injection prevention via parameterized queries (Supabase client)
- XSS prevention via React DOM escaping + Content Security Policy
- CSRF prevention via SameSite cookies + CSRF tokens
- Rate limiting on all public endpoints
- Input validation on all API endpoints (Zod schemas)
- Dependency scanning via GitHub Dependabot
- Secret scanning enabled on repository

### 5.5 Accessibility

- WCAG 2.1 AA compliance on all pages
- Keyboard navigation for all interactive elements
- Screen reader support (ARIA labels, landmarks, live regions)
- Color contrast ratio minimum 4.5:1 for normal text, 3:1 for large text
- Focus indicators visible on all interactive elements
- Alt text on all images
- Skip navigation link
- Reduced motion support (`prefers-reduced-motion` media query)

### 5.6 Browser Support

| Browser | Versions |
|---------|----------|
| Chrome | Last 2 major versions |
| Firefox | Last 2 major versions |
| Safari | Last 2 major versions |
| Edge | Last 2 major versions |
| Mobile Safari (iOS) | Last 2 major versions |
| Chrome for Android | Last 2 major versions |

### 5.7 Mobile Responsiveness

- Responsive design from 320px to 2560px viewport width
- Touch-friendly targets: minimum 44x44px tap targets
- Mobile-optimized views: board view scrolls horizontally, list view uses card layout below 768px
- No horizontal scrolling on any page at any supported viewport width
- Bottom navigation bar on mobile for primary actions

### 5.8 Data Management

| Aspect | Specification |
|--------|---------------|
| Database backups | Daily automated backups via Supabase |
| Point-in-time recovery | Up to 7 days (Pro plan), 30 days (Enterprise) |
| Data export | Full organization data export on demand (JSON or CSV) |
| Data import | CSV import with field mapping for tickets, users |
| Data deletion | Soft delete with 30-day recovery window, then hard delete |

### 5.9 Internationalization

- English (US) as default and launch language
- i18n-ready architecture: all user-facing strings externalized to locale files
- Date, time, and number formatting based on organization locale setting
- UTF-8 support throughout (database, API, UI)
- RTL layout support deferred to post-launch

---

## 6. Information Architecture

### 6.1 Site Map

```
app.pips2.com/
├── /login                              — Login page
├── /signup                             — Organization creation + first user
├── /forgot-password                    — Password reset request
├── /reset-password?token=xxx           — Password reset form
├── /accept-invite?token=xxx            — Invitation acceptance
│
├── /{org-slug}/                        — Organization root (redirects to dashboard)
│   ├── /dashboard                      — Organization dashboard
│   │
│   ├── /my-work                        — Personal assigned items
│   │
│   ├── /projects                       — All projects list
│   │   ├── /new                        — Create new project
│   │   └── /{project-slug}             — Project detail
│   │       ├── /overview               — Project overview with PIPS stepper
│   │       ├── /board                  — Project Kanban board
│   │       ├── /list                   — Project list view
│   │       ├── /timeline               — Project timeline/Gantt
│   │       ├── /forms                  — Project forms by step
│   │       │   └── /{form-id}          — Individual form view/edit
│   │       ├── /step/{1-6}             — PIPS step detail page
│   │       │   ├── /guide              — Step methodology guide
│   │       │   ├── /tools              — Step tools and forms
│   │       │   └── /example            — Worked example
│   │       └── /settings               — Project settings
│   │
│   ├── /tickets                        — All tickets (organization-wide)
│   │   ├── /new                        — Create new ticket
│   │   ├── /board                      — Organization Kanban board
│   │   ├── /list                       — Organization list view
│   │   ├── /calendar                   — Calendar view
│   │   └── /{ticket-id}               — Ticket detail (e.g., /ACME-142)
│   │
│   ├── /teams                          — Teams list
│   │   └── /{team-slug}               — Team detail
│   │       ├── /members                — Team members
│   │       ├── /board                  — Team Kanban board
│   │       └── /workload               — Team workload view
│   │
│   ├── /forms                          — Form templates library
│   │   ├── /templates                  — Pre-built PIPS templates
│   │   ├── /custom                     — Organization custom templates
│   │   └── /builder                    — Custom form builder
│   │
│   ├── /analytics                      — Analytics and reports
│   │   ├── /pips                       — PIPS methodology metrics
│   │   ├── /tickets                    — Ticketing metrics
│   │   └── /executive                  — Executive summary
│   │
│   ├── /search?q=xxx                   — Global search results
│   │
│   ├── /notifications                  — Notification center
│   │
│   └── /settings                       — Admin console
│       ├── /general                    — Organization settings
│       ├── /branding                   — White-label configuration
│       ├── /users                      — User management
│       ├── /teams                      — Team management
│       ├── /roles                      — Role management (enterprise)
│       ├── /workflows                  — Custom status workflows
│       ├── /fields                     — Custom field definitions
│       ├── /labels                     — Label management
│       ├── /integrations               — Integration configuration
│       │   ├── /jira                   — Jira setup and sync status
│       │   ├── /azure-devops           — Azure DevOps setup
│       │   ├── /aha                    — AHA! setup
│       │   ├── /slack                  — Slack setup
│       │   ├── /teams                  — Microsoft Teams setup
│       │   └── /email                  — Email forwarding setup
│       ├── /api                        — API keys and webhooks
│       ├── /billing                    — Plan, payment, invoices
│       ├── /security                   — SSO, MFA, session settings
│       ├── /audit-log                  — Audit log viewer
│       └── /import-export              — Data import/export
│
├── /share/{token}                      — Public shared views (executive summary)
│
└── /api/v1/                            — REST API root
    ├── /auth                           — Authentication endpoints
    ├── /organizations                  — Organization CRUD
    ├── /projects                       — Project CRUD
    ├── /tickets                        — Ticket CRUD
    ├── /forms                          — Form CRUD
    ├── /users                          — User CRUD
    ├── /teams                          — Team CRUD
    ├── /search                         — Search endpoint
    ├── /webhooks                       — Webhook management
    └── /integrations                   — Integration endpoints
```

### 6.2 Navigation Structure

**Desktop (sidebar + header):**

```
┌─ Header ─────────────────────────────────────────────────────────┐
│  [Logo]    [Org Switcher ▼]    [Search (⌘K)]   [🔔 3] [Avatar ▼]│
├─ Sidebar ─┬─ Main Content ───────────────────────────────────────┤
│            │                                                      │
│  Dashboard │                                                      │
│  My Work   │                                                      │
│  ────────  │                                                      │
│  Projects  │                                                      │
│  Tickets   │          (Page content area)                         │
│  Forms     │                                                      │
│  Teams     │                                                      │
│  ────────  │                                                      │
│  Analytics │                                                      │
│  ────────  │                                                      │
│  Settings  │                                                      │
│  (Admin+)  │                                                      │
│            │                                                      │
└────────────┴──────────────────────────────────────────────────────┘
```

**Mobile (bottom tab bar + hamburger):**

```
┌─ Header ─────────────────────────────────────────────┐
│  [☰]    [Logo]              [🔍]   [🔔 3]           │
├─ Main Content ───────────────────────────────────────┤
│                                                       │
│                                                       │
│              (Page content area)                       │
│                                                       │
│                                                       │
├─ Bottom Tabs ────────────────────────────────────────┤
│  [Home]  [My Work]  [+ New]  [Projects]  [More]     │
└───────────────────────────────────────────────────────┘
```

### 6.3 URL Scheme

All application URLs follow the pattern: `app.pips2.com/{org-slug}/{resource}/{id}/{sub-resource}`

- Organization slug: lowercase alphanumeric + hyphens, 3-50 characters, unique
- Project slug: lowercase alphanumeric + hyphens, auto-generated from title, unique within org
- Ticket ID: `{ORG_PREFIX}-{AUTO_INCREMENT}` (e.g., `ACME-142`)
- Form ID: UUID v4
- Team slug: lowercase alphanumeric + hyphens, unique within org
- Share tokens: 32-character random alphanumeric string

---

## 7. Wireframe Descriptions

### 7.1 Dashboard

**Purpose:** The first page users see after login. Provides a high-level overview of organizational activity and quick access to personal work.

**Layout:**

```
┌──────────────────────────────────────────────────────────────────────────┐
│  HEADER: [Logo]  [Org: Acme Corp ▼]    [⌘K Search...]  [🔔 3] [MA ▼]  │
├────────┬─────────────────────────────────────────────────────────────────┤
│        │                                                                 │
│ SIDE-  │  Good morning, Diana                          [+ New Project]  │
│ BAR    │                                                                 │
│        │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ Dash-  │  │ Active   │ │ Open     │ │ Overdue  │ │ Completed│          │
│ board  │  │ Projects │ │ Tickets  │ │ Items    │ │ This Mo. │          │
│ ●      │  │    12    │ │    47    │ │    3     │ │    8     │          │
│        │  │ +2 this  │ │ -5 this  │ │ ▲ was 1  │ │ ▲ was 5  │          │
│ My     │  │  week    │ │  week    │ │          │ │          │          │
│ Work   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│        │                                                                 │
│ ───    │  ┌─────────────────────────────┐ ┌────────────────────────────┐ │
│ Proj-  │  │ Projects by PIPS Step       │ │ My Tasks (Due Soon)        │ │
│ ects   │  │                             │ │                            │ │
│ Tick-  │  │  ██                         │ │ ☐ ACME-98  Review root     │ │
│ ets    │  │  ██ ████                    │ │   cause analysis           │ │
│ Forms  │  │  ██ ████ ██                 │ │   Due: Tomorrow  🔴 High  │ │
│ Teams  │  │  ██ ████ ██ ████████       │ │                            │ │
│        │  │  ██ ████ ██ ████████ ██ ██ │ │ ☐ ACME-103 Update cost-   │ │
│ ───    │  │  1   2    3    4      5  6  │ │   benefit analysis         │ │
│ Analy- │  │                             │ │   Due: Wed  🟡 Medium     │ │
│ tics   │  └─────────────────────────────┘ │                            │ │
│        │                                   │ ☐ ACME-110 Schedule       │ │
│ ───    │  ┌─────────────────────────────┐ │   implementation kickoff   │ │
│ Sett-  │  │ Recent Activity             │ │   Due: Thu  🟡 Medium     │ │
│ ings   │  │                             │ │                            │ │
│        │  │ 10:32 AM  Raj completed     │ │ [View All My Work →]       │ │
│        │  │   ACME-95 (5-Why Analysis)  │ └────────────────────────────┘ │
│        │  │                             │                                │
│        │  │ 9:15 AM  Patricia viewed    │ ┌────────────────────────────┐ │
│        │  │   exec summary              │ │ Tickets: Created vs Closed │ │
│        │  │                             │ │                            │ │
│        │  │ Yesterday  Diana created    │ │  Created ── Closed ---     │ │
│        │  │   project "Reduce claim     │ │  ╱╲                       │ │
│        │  │   processing time"          │ │ ╱  ╲  ╱╲  ╱──            │ │
│        │  │                             │ │╱    ╲╱  ╲╱               │ │
│        │  │ [View All Activity →]       │ │ W1  W2  W3  W4  W5       │ │
│        │  └─────────────────────────────┘ └────────────────────────────┘ │
│        │                                                                 │
└────────┴─────────────────────────────────────────────────────────────────┘
```

**Key interactions:**
- Click stat cards to navigate to filtered views (e.g., "Overdue Items" goes to tickets filtered by overdue)
- Click any activity item to navigate to the referenced entity
- Click "View All My Work" to go to My Work view
- "+ New Project" button opens project creation modal
- Widgets can be dragged to reorder and resized (P1)

**Data displayed:**
- Summary statistics (active projects, open tickets, overdue items, completed this month) with week-over-week trend
- Projects by PIPS Step bar chart
- Upcoming personal tasks sorted by due date
- Recent organization activity feed (last 20 items)
- Tickets created vs. closed trend chart (last 5 weeks)

---

### 7.2 PIPS Project View (6-Step Workflow)

**Purpose:** The primary view for a PIPS project. Shows current step progress, step content, tools, and project context.

**Layout:**

```
┌──────────────────────────────────────────────────────────────────────────┐
│  HEADER: [Logo]  [Org: Acme Corp ▼]    [⌘K Search...]  [🔔 3] [MA ▼]  │
├────────┬─────────────────────────────────────────────────────────────────┤
│        │                                                                 │
│ SIDE-  │  ← Back to Projects                                           │
│ BAR    │                                                                 │
│        │  Reduce Claim Processing Time                 Status: ● Active │
│        │  Lead: Diana Chen  |  Team: Ops Excellence  |  Due: Apr 15     │
│        │                                                                 │
│        │  ┌─────────────────────────────────────────────────────────┐   │
│        │  │  PIPS Progress                                          │   │
│        │  │                                                         │   │
│        │  │  (✓)───(✓)───(●)───( )───( )───( )                    │   │
│        │  │   1     2     3     4     5     6                       │   │
│        │  │  Iden- Anal- Gene- Sel & Impl- Eval-                   │   │
│        │  │  tify  yze   rate  Plan ement  uate                    │   │
│        │  │                                                         │   │
│        │  │  Step 3 of 6: Generate Solutions                        │   │
│        │  └─────────────────────────────────────────────────────────┘   │
│        │                                                                 │
│        │  ┌─── Tabs ────────────────────────────────────────────────┐   │
│        │  │ [Overview]  [Board]  [List]  [Timeline]  [Forms]  [⚙]  │   │
│        │  └─────────────────────────────────────────────────────────┘   │
│        │                                                                 │
│        │  ┌─── Step Guide ──────────────────┐ ┌─── Step Tools ────────┐ │
│        │  │                                  │ │                       │ │
│        │  │  Objective                       │ │  Available Tools:     │ │
│        │  │  Generate a broad set of         │ │                       │ │
│        │  │  potential solutions before       │ │  ☐ Brainstorming     │ │
│        │  │  evaluating any of them.         │ │    [Open] [New]       │ │
│        │  │                                  │ │                       │ │
│        │  │  Guided Prompts                  │ │  ☐ Brainwriting      │ │
│        │  │  • What could eliminate the      │ │    [Open] [New]       │ │
│        │  │    root cause?                   │ │                       │ │
│        │  │  • What has worked elsewhere?    │ │  ✓ List Reduction    │ │
│        │  │  • What if there were no         │ │    Completed 3/1      │ │
│        │  │    constraints?                  │ │    [View]             │ │
│        │  │                                  │ │                       │ │
│        │  │  Tips                            │ │  ☐ Parking Lot       │ │
│        │  │  Separate idea generation from   │ │    [Open] [New]       │ │
│        │  │  idea evaluation. Quantity        │ │                       │ │
│        │  │  first, quality later.           │ └───────────────────────┘ │
│        │  │                                  │                           │
│        │  │  [View Worked Example]           │ ┌─── Completion ────────┐ │
│        │  │                                  │ │                       │ │
│        │  └──────────────────────────────────┘ │  Step 3 Criteria:     │ │
│        │                                       │  ✓ 5+ ideas generated│ │
│        │  ┌─── Related Tickets ──────────────┐ │  ☐ List reduced to   │ │
│        │  │                                  │ │    top 3-7 candidates │ │
│        │  │  ACME-112  Brainstorm session    │ │                       │ │
│        │  │  ● In Progress  Raj  Due: Today  │ │  [Advance to Step 4] │ │
│        │  │                                  │ │  (grayed out until    │ │
│        │  │  ACME-113  Review industry       │ │   criteria met)       │ │
│        │  │  ○ To Do  Unassigned  Due: Fri   │ └───────────────────────┘ │
│        │  │                                  │                           │
│        │  │  [+ Create Ticket for Step 3]    │                           │
│        │  └──────────────────────────────────┘                           │
│        │                                                                 │
└────────┴─────────────────────────────────────────────────────────────────┘
```

**Key interactions:**
- Click any step in the progress bar to navigate to that step (completed/current steps only; future steps locked unless override)
- Click "Open" on a tool to open an existing form instance; click "New" to create a fresh form
- Click "View Worked Example" to open a slide-over panel with the Parking Lot worked example for this step
- "Advance to Step 4" button is disabled until all completion criteria are checked; Managers+ can override with a confirmation dialog
- Click ticket IDs to open ticket detail in a slide-over panel
- "+ Create Ticket for Step 3" opens ticket creation pre-linked to this project and step

**Data displayed:**
- Project header: name, status, lead, team, due date
- PIPS step progress indicator with completed/current/future states
- Current step guide: objective, guided prompts, tips
- Available tools for this step with completion status
- Completion criteria checklist (auto-checked based on data)
- Related tickets filtered to current step

---

### 7.3 Ticket Detail

**Purpose:** Full detail view of a single ticket. Shows all ticket data, supports editing, comments, and activity.

**Layout:**

```
┌──────────────────────────────────────────────────────────────────────────┐
│  HEADER: [Logo]  [Org: Acme Corp ▼]    [⌘K Search...]  [🔔 3] [MA ▼]  │
├────────┬─────────────────────────────────────────────────────────────────┤
│        │                                                                 │
│ SIDE-  │  ← Back to Board                            [···] [🔗] [🗑]   │
│ BAR    │                                                                 │
│        │  ┌──── Main Content (left 65%) ──────┬── Sidebar (right 35%) ─┐│
│        │  │                                    │                        ││
│        │  │  ACME-142                          │  Status                ││
│        │  │  ────────                          │  [In Progress ▼]      ││
│        │  │  Implement automated claim         │                        ││
│        │  │  routing for high-value cases      │  Assignee              ││
│        │  │                                    │  [👤 Raj Patel ▼]     ││
│        │  │  🔴 High Priority   🏷 quality    │                        ││
│        │  │                                    │  Reporter              ││
│        │  │  ┌── PIPS Context ──────────────┐ │  Diana Chen            ││
│        │  │  │ Project: Reduce Claim Proc.  │ │                        ││
│        │  │  │ Step 5: Implement             │ │  Priority              ││
│        │  │  │ [View in Project →]           │ │  [🔴 High ▼]         ││
│        │  │  └──────────────────────────────┘ │                        ││
│        │  │                                    │  Labels                ││
│        │  │  Description                       │  [quality] [backend]   ││
│        │  │  ─────────────                     │  [+ Add]              ││
│        │  │  The current manual routing        │                        ││
│        │  │  process for claims over $50K      │  Due Date              ││
│        │  │  adds 2-3 days to processing.      │  📅 Mar 15, 2026      ││
│        │  │  Implement the automated rules     │                        ││
│        │  │  engine designed in Step 4 to      │  Time Tracking         ││
│        │  │  route based on claim type,        │  Est: 16h  Logged: 8h ││
│        │  │  value, and complexity score.       │  [+ Log Time]         ││
│        │  │                                    │                        ││
│        │  │  Subtasks (2/4)                    │  Parent                ││
│        │  │  ─────────────                     │  ACME-130 (Epic)      ││
│        │  │  ✓ ACME-143 Define routing rules  │  [View →]             ││
│        │  │  ✓ ACME-144 Build rules engine    │                        ││
│        │  │  ○ ACME-145 Integration testing   │  Watchers (3)         ││
│        │  │  ○ ACME-146 Deploy to staging     │  Diana, Marcus, Pat   ││
│        │  │  [+ Add Subtask]                   │  [+ Add]              ││
│        │  │                                    │                        ││
│        │  │  Attachments (1)                   │  Project               ││
│        │  │  ─────────────                     │  Reduce Claim Proc.   ││
│        │  │  📎 routing-rules-v2.xlsx (42 KB) │                        ││
│        │  │  [+ Attach File]                   │  Created               ││
│        │  │                                    │  Feb 28, 2026          ││
│        │  │  ─────────────────────────────────│  by Diana Chen         ││
│        │  │                                    │                        ││
│        │  │  Activity / Comments               │  Updated               ││
│        │  │  [All] [Comments] [History]         │  2 hours ago          ││
│        │  │                                    │                        ││
│        │  │  ┌─ Comment ────────────────────┐ │                        ││
│        │  │  │ Raj Patel · 2 hours ago      │ │                        ││
│        │  │  │                              │ │                        ││
│        │  │  │ Rules engine is built and    │ │                        ││
│        │  │  │ unit tests passing. Moving   │ │                        ││
│        │  │  │ to integration testing.      │ │                        ││
│        │  │  │ @Diana can you review the    │ │                        ││
│        │  │  │ routing logic?               │ │                        ││
│        │  │  │                  [👍 2] [💬] │ │                        ││
│        │  │  └──────────────────────────────┘ │                        ││
│        │  │                                    │                        ││
│        │  │  ┌─ History ────────────────────┐ │                        ││
│        │  │  │ Diana changed status         │ │                        ││
│        │  │  │ To Do → In Progress          │ │                        ││
│        │  │  │ 3 hours ago                  │ │                        ││
│        │  │  └──────────────────────────────┘ │                        ││
│        │  │                                    │                        ││
│        │  │  ┌─ Add Comment ────────────────┐ │                        ││
│        │  │  │ Write a comment...  [@] [📎] │ │                        ││
│        │  │  │                    [Submit]   │ │                        ││
│        │  │  └──────────────────────────────┘ │                        ││
│        │  │                                    │                        ││
│        │  └────────────────────────────────────┴────────────────────────┘│
│        │                                                                 │
└────────┴─────────────────────────────────────────────────────────────────┘
```

**Key interactions:**
- All sidebar fields (status, assignee, priority, labels, due date) are inline-editable via dropdowns or date pickers
- Click ticket IDs in subtask list to navigate to those tickets
- @mention autocomplete in comment box (type `@` then search)
- Drag files onto the ticket to attach
- Paste images directly into description or comment
- "View in Project" link in PIPS context navigates to the project step that created this ticket
- [...] menu: copy link, move to project, convert to PIPS project, duplicate, archive, delete
- Activity tab toggles between all activity, comments only, and history only
- Click parent ticket ID to navigate to parent

---

### 7.4 Board / Kanban View

**Purpose:** Visual task board for managing ticket flow. Used at project, team, or organization level.

**Layout:**

```
┌──────────────────────────────────────────────────────────────────────────┐
│  HEADER: [Logo]  [Org: Acme Corp ▼]    [⌘K Search...]  [🔔 3] [MA ▼]  │
├────────┬─────────────────────────────────────────────────────────────────┤
│        │                                                                 │
│ SIDE-  │  Project: Reduce Claim Processing Time                         │
│ BAR    │  [Overview] [Board ●] [List] [Timeline] [Forms] [⚙]          │
│        │                                                                 │
│        │  ┌── Filter Bar ────────────────────────────────────────────┐  │
│        │  │ [Assignee ▼] [Priority ▼] [Label ▼] [Search...]  [⊞ ≡] │  │
│        │  └──────────────────────────────────────────────────────────┘  │
│        │                                                                 │
│        │  ┌─ Backlog(3)──┐ ┌─ To Do(5) ──┐ ┌─ In Prog(4)─┐ ┌─ In ──┐ │
│        │  │              │ │              │ │              │ │Review  │ │
│        │  │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │ │(2)    │ │
│        │  │ │ACME-150  │ │ │ │ACME-145  │ │ │ │ACME-142  │ │ │       │ │
│        │  │ │Research  │ │ │ │Integ.    │ │ │ │Implement │ │ │┌─────┐│ │
│        │  │ │competi-  │ │ │ │testing   │ │ │ │auto      │ │ ││ACME │││
│        │  │ │tor tools │ │ │ │          │ │ │ │routing   │ │ ││-148 │││
│        │  │ │          │ │ │ │🔴 High   │ │ │ │          │ │ ││Review│││
│        │  │ │🟢 Low    │ │ │ │👤 Raj    │ │ │ │🔴 High   │ │ ││draft │││
│        │  │ │👤 ──     │ │ │ │📅 Mar 12 │ │ │ │👤 Raj    │ │ ││specs │││
│        │  │ │          │ │ │ │[2]childs │ │ │ │📅 Mar 15 │ │ ││     │││
│        │  │ └──────────┘ │ │ └──────────┘ │ │ │[4]childs │ │ ││🟡Med│││
│        │  │              │ │              │ │ │quality    │ │ ││👤 Di│││
│        │  │ ┌──────────┐ │ │ ┌──────────┐ │ │ └──────────┘ │ │└─────┘│ │
│        │  │ │ACME-151  │ │ │ │ACME-146  │ │ │              │ │       │ │
│        │  │ │Draft     │ │ │ │Deploy to │ │ │ ┌──────────┐ │ │┌─────┐│ │
│        │  │ │training  │ │ │ │staging   │ │ │ │ACME-149  │ │ ││ACME │││
│        │  │ │materials │ │ │ │          │ │ │ │Update    │ │ ││-152 │││
│        │  │ │          │ │ │ │🟡 Medium │ │ │ │dashboard │ │ ││...  │││
│        │  │ │🟡 Medium │ │ │ │👤 Marcus │ │ │ │metrics   │ │ │└─────┘│ │
│        │  │ │👤 ──     │ │ │ │📅 Mar 14 │ │ │ │          │ │ │       │ │
│        │  │ └──────────┘ │ │ └──────────┘ │ │ │🟡 Medium │ │ │       │ │
│        │  │              │ │              │ │ │👤 Diana  │ │ │       │ │
│        │  │   ...        │ │   ...        │ │ │📅 Mar 18 │ │ │       │ │
│        │  │              │ │              │ │ └──────────┘ │ │       │ │
│        │  │   [+ Add]    │ │   [+ Add]    │ │              │ │       │ │
│        │  │              │ │              │ │   ...        │ │       │ │
│        │  └──────────────┘ └──────────────┘ │              │ │       │ │
│        │                                     │   [+ Add]    │ │       │ │
│        │  ← scroll horizontally for more →  └──────────────┘ └───────┘ │
│        │                                                                 │
│        │  ┌─ Done(8) ────┐ ┌─ Closed(12)─┐                             │
│        │  │  ...         │ │  ...         │   (scroll right to see)     │
│        │  └──────────────┘ └──────────────┘                             │
│        │                                                                 │
└────────┴─────────────────────────────────────────────────────────────────┘
```

**Key interactions:**
- Drag and drop ticket cards between columns to change status
- Click a ticket card to open ticket detail (slide-over panel or full page, configurable)
- Filter bar: dropdown filters for assignee, priority, label; text search
- Toggle between board view and list view with view switcher icons
- "[+ Add]" at bottom of each column opens quick-create form pre-set to that status
- Column headers show ticket count; WIP limit indicator turns red when exceeded
- Right-click card for context menu: assign, change priority, copy link, archive

**Data on each card:**
- Ticket ID and title (truncated to 2 lines)
- Priority badge (color-coded dot + text)
- Assignee avatar
- Due date (red text if overdue)
- Child ticket count badge (if any)
- Labels (first 2 shown, "+N" for overflow)

---

### 7.5 Admin Settings

**Purpose:** Organization configuration hub for administrators. Manages branding, users, billing, integrations, and security.

**Layout:**

```
┌──────────────────────────────────────────────────────────────────────────┐
│  HEADER: [Logo]  [Org: Acme Corp ▼]    [⌘K Search...]  [🔔 3] [MA ▼]  │
├────────┬─────────────────────────────────────────────────────────────────┤
│        │                                                                 │
│ SIDE-  │  Organization Settings                                         │
│ BAR    │                                                                 │
│        │  ┌── Settings Nav ──┬── Content Area ─────────────────────────┐│
│ (app   │  │                  │                                          ││
│  nav)  │  │ General       ●  │  General Settings                       ││
│        │  │ Branding         │                                          ││
│        │  │ Users            │  Organization Name                      ││
│        │  │ Teams            │  ┌──────────────────────────────────┐   ││
│        │  │ Roles            │  │ Acme Corporation                 │   ││
│        │  │ Workflows        │  └──────────────────────────────────┘   ││
│        │  │ Custom Fields    │                                          ││
│        │  │ Labels           │  Organization Slug                      ││
│        │  │ ──────           │  ┌──────────────────────────────────┐   ││
│        │  │ Integrations     │  │ acme-corp                        │   ││
│        │  │ API & Webhooks   │  └──────────────────────────────────┘   ││
│        │  │ ──────           │  app.pips2.com/acme-corp/...            ││
│        │  │ Billing          │                                          ││
│        │  │ Security         │  Industry                               ││
│        │  │ Audit Log        │  ┌──────────────────────────────────┐   ││
│        │  │ Import/Export    │  │ Healthcare            ▼          │   ││
│        │  │                  │  └──────────────────────────────────┘   ││
│        │  │                  │                                          ││
│        │  │                  │  Timezone                                ││
│        │  │                  │  ┌──────────────────────────────────┐   ││
│        │  │                  │  │ America/New_York       ▼          │   ││
│        │  │                  │  └──────────────────────────────────┘   ││
│        │  │                  │                                          ││
│        │  │                  │  Date Format                             ││
│        │  │                  │  ┌──────────────────────────────────┐   ││
│        │  │                  │  │ MM/DD/YYYY              ▼          │   ││
│        │  │                  │  └──────────────────────────────────┘   ││
│        │  │                  │                                          ││
│        │  │                  │  Default Project Visibility              ││
│        │  │                  │  (●) Public  ( ) Private                 ││
│        │  │                  │                                          ││
│        │  │                  │  ┌────────────────────────────────────┐ ││
│        │  │                  │  │            [Save Changes]           │ ││
│        │  │                  │  └────────────────────────────────────┘ ││
│        │  │                  │                                          ││
│        │  │                  │  ── Danger Zone ──────────────────────  ││
│        │  │                  │                                          ││
│        │  │                  │  Transfer Ownership                     ││
│        │  │                  │  Transfer this organization to another  ││
│        │  │                  │  Owner.  [Transfer]                     ││
│        │  │                  │                                          ││
│        │  │                  │  Delete Organization                    ││
│        │  │                  │  Permanently delete this organization   ││
│        │  │                  │  and all its data. This cannot be       ││
│        │  │                  │  undone after 30 days.  [Delete]        ││
│        │  │                  │                                          ││
│        │  └──────────────────┴──────────────────────────────────────────┘│
│        │                                                                 │
└────────┴─────────────────────────────────────────────────────────────────┘
```

**Key interactions:**
- Left settings navigation highlights current section, scrolls content area
- All settings auto-save or require explicit "Save Changes" button (depending on section)
- Danger zone actions require confirmation dialog with org name typed to confirm
- Branding page shows live preview of changes before saving
- Users page shows a searchable, sortable table with invite button
- Billing page embeds Stripe Customer Portal for payment management
- Integrations page shows cards for each integration with connect/disconnect toggle
- API page shows API keys with copy button, last-used timestamp, and revoke option

**Sub-pages (accessible from settings nav):**

- **Branding:** Logo uploads (with preview), color pickers (primary/secondary/accent), favicon upload, custom domain field with CNAME instructions, CSS override textarea
- **Users:** Table (name, email, role, team, status, last active), invite button, bulk actions (deactivate, change role), search/filter
- **Workflows:** Visual workflow editor showing statuses as nodes with transition arrows, add/rename/delete statuses, set required fields per transition
- **Integrations:** Cards for Jira, Azure DevOps, AHA!, Slack, Teams, Email with setup wizard for each
- **Audit Log:** Searchable log table (timestamp, user, action, entity, details) with date range filter and CSV export

---

## 8. Data Model Summary

### 8.1 Key Entities

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ENTITY RELATIONSHIP DIAGRAM                   │
│                                                                      │
│  ┌──────────────┐       ┌───────────────┐       ┌───────────────┐   │
│  │ organization │1────M│     user      │M────M│     team      │   │
│  │──────────────│       │───────────────│       │───────────────│   │
│  │ id           │       │ id            │       │ id            │   │
│  │ name         │       │ email         │       │ name          │   │
│  │ slug         │       │ display_name  │       │ slug          │   │
│  │ logo_url     │       │ avatar_url    │       │ description   │   │
│  │ primary_color│       │ role          │       │ color         │   │
│  │ secondary_clr│       │ department    │       │ lead_user_id  │   │
│  │ accent_color │       │ job_title     │       │ org_id (FK)   │   │
│  │ custom_domain│       │ org_id (FK)   │       └───────┬───────┘   │
│  │ favicon_url  │       │ last_active_at│               │           │
│  │ custom_css   │       │ mfa_enabled   │               │           │
│  │ plan_tier    │       │ status        │       ┌───────┴───────┐   │
│  │ stripe_cust  │       │ timezone      │       │  team_member  │   │
│  │ created_at   │       │ notif_prefs   │       │───────────────│   │
│  └──────┬───────┘       └───────┬───────┘       │ team_id (FK)  │   │
│         │                       │               │ user_id (FK)  │   │
│         │                       │               └───────────────┘   │
│         │                       │                                    │
│  ┌──────┴───────┐       ┌──────┴────────┐                           │
│  │   project    │1────M│    ticket     │                           │
│  │──────────────│       │───────────────│                           │
│  │ id           │       │ id            │                           │
│  │ title        │       │ ticket_number │──┐ (parent/child)        │
│  │ slug         │       │ title         │  │                       │
│  │ description  │       │ description   │  │  ┌───────────────┐   │
│  │ status       │       │ type          │  └─→│ ticket_relation│   │
│  │ current_step │       │ status        │     │───────────────│   │
│  │ priority     │       │ priority      │     │ parent_id(FK) │   │
│  │ visibility   │       │ assignee_id   │     │ child_id (FK) │   │
│  │ lead_user_id │       │ reporter_id   │     │ relation_type │   │
│  │ team_id (FK) │       │ project_id(FK)│     └───────────────┘   │
│  │ org_id (FK)  │       │ pips_step     │                           │
│  │ target_date  │       │ due_date      │     ┌───────────────┐   │
│  │ completed_at │       │ start_date    │     │ ticket_comment │   │
│  │ created_at   │       │ labels        │     │───────────────│   │
│  │ updated_at   │       │ est_hours     │     │ id            │   │
│  └──────┬───────┘       │ logged_hours  │     │ ticket_id(FK) │   │
│         │               │ org_id (FK)   │     │ author_id(FK) │   │
│         │               │ created_at    │     │ body (rich)   │   │
│         │               │ updated_at    │     │ created_at    │   │
│         │               └───────┬───────┘     └───────────────┘   │
│         │                       │                                    │
│  ┌──────┴───────┐       ┌──────┴────────┐     ┌───────────────┐   │
│  │  pips_step   │       │  attachment   │     │   activity    │   │
│  │──────────────│       │───────────────│     │───────────────│   │
│  │ id           │       │ id            │     │ id            │   │
│  │ project_id   │       │ ticket_id(FK) │     │ entity_type   │   │
│  │ step_number  │       │ form_id (FK)  │     │ entity_id     │   │
│  │ status       │       │ comment_id(FK)│     │ action        │   │
│  │ started_at   │       │ file_name     │     │ actor_id (FK) │   │
│  │ completed_at │       │ file_url      │     │ old_value     │   │
│  │ notes        │       │ file_size     │     │ new_value     │   │
│  │ criteria_met │       │ mime_type     │     │ org_id (FK)   │   │
│  └──────────────┘       │ uploaded_by   │     │ created_at    │   │
│                          └───────────────┘     └───────────────┘   │
│                                                                      │
│  ┌──────────────┐       ┌───────────────┐     ┌───────────────┐   │
│  │form_template │1────M│ form_instance │     │  notification │   │
│  │──────────────│       │───────────────│     │───────────────│   │
│  │ id           │       │ id            │     │ id            │   │
│  │ name         │       │ template_id   │     │ user_id (FK)  │   │
│  │ description  │       │ project_id(FK)│     │ type          │   │
│  │ pips_step    │       │ ticket_id(FK) │     │ title         │   │
│  │ schema (JSON)│       │ pips_step     │     │ body          │   │
│  │ is_builtin   │       │ data (JSON)   │     │ entity_type   │   │
│  │ org_id (FK)  │       │ status        │     │ entity_id     │   │
│  │ version      │       │ completed_pct │     │ read          │   │
│  │ created_at   │       │ created_by    │     │ emailed       │   │
│  └──────────────┘       │ locked_by     │     │ org_id (FK)   │   │
│                          │ version       │     │ created_at    │   │
│                          │ org_id (FK)   │     └───────────────┘   │
│                          │ created_at    │                           │
│                          │ updated_at    │     ┌───────────────┐   │
│                          └───────────────┘     │  audit_log    │   │
│                                                 │───────────────│   │
│  ┌──────────────┐       ┌───────────────┐     │ id            │   │
│  │    label     │       │  custom_field │     │ org_id (FK)   │   │
│  │──────────────│       │───────────────│     │ actor_id (FK) │   │
│  │ id           │       │ id            │     │ action        │   │
│  │ name         │       │ name          │     │ entity_type   │   │
│  │ color        │       │ field_type    │     │ entity_id     │   │
│  │ org_id (FK)  │       │ options (JSON)│     │ old_value     │   │
│  └──────────────┘       │ required      │     │ new_value     │   │
│                          │ org_id (FK)   │     │ ip_address    │   │
│  ┌──────────────┐       └───────────────┘     │ created_at    │   │
│  │  webhook     │                              └───────────────┘   │
│  │──────────────│       ┌───────────────┐                           │
│  │ id           │       │  integration  │     ┌───────────────┐   │
│  │ url          │       │───────────────│     │  api_key      │   │
│  │ events       │       │ id            │     │───────────────│   │
│  │ secret       │       │ type (jira..) │     │ id            │   │
│  │ active       │       │ config (JSON) │     │ key_hash      │   │
│  │ org_id (FK)  │       │ status        │     │ label         │   │
│  │ created_at   │       │ last_sync_at  │     │ last_used_at  │   │
│  └──────────────┘       │ org_id (FK)   │     │ org_id (FK)   │   │
│                          └───────────────┘     │ created_at    │   │
│                                                 └───────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Key Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| organization -> user | 1:M | An org has many users; each user belongs to one org (via membership) |
| organization -> project | 1:M | An org has many projects |
| organization -> ticket | 1:M | All tickets belong to an org |
| project -> ticket | 1:M | A project has many tickets; general tickets have null project_id |
| project -> pips_step | 1:6 | Each project has exactly 6 PIPS step records |
| ticket -> ticket (parent/child) | M:M | Via ticket_relation table; max 3 levels deep (Epic > Story > Subtask) |
| ticket -> comment | 1:M | A ticket has many comments |
| ticket -> attachment | 1:M | A ticket has many attachments |
| user -> team | M:M | Via team_member junction table |
| team -> project | M:M | Via project_team junction table |
| form_template -> form_instance | 1:M | A template can produce many filled instances |
| form_instance -> project | M:1 | A form instance belongs to one project |
| form_instance -> ticket | M:1 | A form instance can be attached to a ticket |
| ticket -> label | M:M | Via ticket_label junction table |

### 8.3 Multi-Tenancy

All tables (except `audit_log` and system tables) include an `org_id` column. Row-Level Security (RLS) policies on every table ensure:

1. Users can only read rows where `org_id` matches their authenticated organization
2. Users can only write rows where `org_id` matches their authenticated organization
3. Cross-organization data access is impossible at the database level
4. RLS policies are **always on** and cannot be bypassed by the application layer

Supabase RLS policy pattern:
```sql
CREATE POLICY "org_isolation" ON tickets
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
```

---

## 9. API Surface Summary

### 9.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/signup` | Create account + organization |
| POST | `/v1/auth/login` | Authenticate with email/password |
| POST | `/v1/auth/logout` | Invalidate current session |
| POST | `/v1/auth/refresh` | Refresh access token |
| POST | `/v1/auth/forgot-password` | Request password reset email |
| POST | `/v1/auth/reset-password` | Reset password with token |
| POST | `/v1/auth/mfa/enroll` | Begin MFA enrollment |
| POST | `/v1/auth/mfa/verify` | Verify MFA code |

### 9.2 Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/organizations/current` | Get current organization details |
| PATCH | `/v1/organizations/current` | Update organization settings |
| POST | `/v1/organizations/current/invite` | Invite user to organization |
| GET | `/v1/organizations/current/members` | List organization members |

### 9.3 Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/projects` | List projects (paginated, filterable) |
| POST | `/v1/projects` | Create new project |
| GET | `/v1/projects/{id}` | Get project details |
| PATCH | `/v1/projects/{id}` | Update project |
| DELETE | `/v1/projects/{id}` | Archive/delete project |
| GET | `/v1/projects/{id}/steps` | Get all PIPS steps for project |
| PATCH | `/v1/projects/{id}/steps/{n}` | Update step (status, notes, criteria) |
| POST | `/v1/projects/{id}/steps/{n}/advance` | Advance to next step |
| GET | `/v1/projects/{id}/tickets` | List tickets in project |
| GET | `/v1/projects/{id}/forms` | List forms in project |
| GET | `/v1/projects/{id}/activity` | Get project activity feed |

**Example: Create Project**

Request:
```json
POST /v1/projects
Content-Type: application/json
X-API-Key: pk_live_abc123...

{
  "title": "Reduce Claim Processing Time",
  "description": "Claims over $50K take 5+ days to process. Target: under 2 days.",
  "priority": "high",
  "target_date": "2026-06-30",
  "lead_user_id": "usr_abc123",
  "team_id": "team_def456",
  "visibility": "public",
  "problem_statement": {
    "what": "High-value claims (>$50K) require 5+ business days to process",
    "where": "Claims processing department, regional offices",
    "when": "Ongoing, worsened after Q3 volume increase",
    "who": "Claims adjusters, policyholders, regional managers",
    "impact": "Customer satisfaction down 15%, $2.3M in delayed payouts per quarter"
  }
}
```

Response:
```json
{
  "id": "proj_xyz789",
  "title": "Reduce Claim Processing Time",
  "slug": "reduce-claim-processing-time",
  "description": "Claims over $50K take 5+ days to process. Target: under 2 days.",
  "status": "not_started",
  "current_step": 1,
  "priority": "high",
  "target_date": "2026-06-30",
  "lead": {
    "id": "usr_abc123",
    "display_name": "Diana Chen",
    "avatar_url": "https://..."
  },
  "team": {
    "id": "team_def456",
    "name": "Ops Excellence"
  },
  "visibility": "public",
  "steps": [
    { "step_number": 1, "name": "Identify", "status": "in_progress", "started_at": "2026-03-02T14:30:00Z", "completed_at": null },
    { "step_number": 2, "name": "Analyze", "status": "not_started", "started_at": null, "completed_at": null },
    { "step_number": 3, "name": "Generate", "status": "not_started", "started_at": null, "completed_at": null },
    { "step_number": 4, "name": "Select & Plan", "status": "not_started", "started_at": null, "completed_at": null },
    { "step_number": 5, "name": "Implement", "status": "not_started", "started_at": null, "completed_at": null },
    { "step_number": 6, "name": "Evaluate", "status": "not_started", "started_at": null, "completed_at": null }
  ],
  "ticket_prefix": "ACME",
  "created_at": "2026-03-02T14:30:00Z",
  "updated_at": "2026-03-02T14:30:00Z"
}
```

### 9.4 Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/tickets` | List tickets (paginated, filterable) |
| POST | `/v1/tickets` | Create new ticket |
| GET | `/v1/tickets/{id}` | Get ticket details |
| PATCH | `/v1/tickets/{id}` | Update ticket fields |
| DELETE | `/v1/tickets/{id}` | Archive/delete ticket |
| GET | `/v1/tickets/{id}/comments` | List ticket comments |
| POST | `/v1/tickets/{id}/comments` | Add comment |
| PATCH | `/v1/tickets/{id}/comments/{cid}` | Edit comment |
| DELETE | `/v1/tickets/{id}/comments/{cid}` | Delete comment |
| POST | `/v1/tickets/{id}/attachments` | Upload attachment |
| DELETE | `/v1/tickets/{id}/attachments/{aid}` | Delete attachment |
| GET | `/v1/tickets/{id}/activity` | Get ticket activity |
| GET | `/v1/tickets/{id}/children` | Get child tickets |
| POST | `/v1/tickets/{id}/relations` | Create ticket relation |
| POST | `/v1/tickets/bulk` | Bulk update tickets |

**Example: Create Ticket**

Request:
```json
POST /v1/tickets
Content-Type: application/json
X-API-Key: pk_live_abc123...

{
  "title": "Implement automated claim routing for high-value cases",
  "description": "Build the rules engine designed in Step 4 to auto-route claims >$50K based on type, value, and complexity score.",
  "type": "task",
  "priority": "high",
  "assignee_id": "usr_raj456",
  "project_id": "proj_xyz789",
  "pips_step": 5,
  "parent_id": "tkt_epic130",
  "labels": ["quality", "backend"],
  "due_date": "2026-03-15",
  "estimated_hours": 16
}
```

Response:
```json
{
  "id": "tkt_abc142",
  "ticket_number": "ACME-142",
  "title": "Implement automated claim routing for high-value cases",
  "description": "Build the rules engine designed in Step 4...",
  "type": "task",
  "status": "backlog",
  "priority": "high",
  "assignee": {
    "id": "usr_raj456",
    "display_name": "Raj Patel",
    "avatar_url": "https://..."
  },
  "reporter": {
    "id": "usr_abc123",
    "display_name": "Diana Chen"
  },
  "project": {
    "id": "proj_xyz789",
    "title": "Reduce Claim Processing Time",
    "slug": "reduce-claim-processing-time"
  },
  "pips_step": 5,
  "parent": {
    "id": "tkt_epic130",
    "ticket_number": "ACME-130",
    "title": "Implementation Epic"
  },
  "labels": [
    { "id": "lbl_1", "name": "quality", "color": "#22c55e" },
    { "id": "lbl_2", "name": "backend", "color": "#6366f1" }
  ],
  "due_date": "2026-03-15",
  "estimated_hours": 16,
  "logged_hours": 0,
  "children_count": 0,
  "comments_count": 0,
  "attachments_count": 0,
  "created_at": "2026-03-02T14:45:00Z",
  "updated_at": "2026-03-02T14:45:00Z"
}
```

### 9.5 Forms

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/forms/templates` | List form templates (built-in + custom) |
| POST | `/v1/forms/templates` | Create custom form template |
| GET | `/v1/forms/templates/{id}` | Get template schema |
| GET | `/v1/forms/instances` | List form instances (filterable by project, step, ticket) |
| POST | `/v1/forms/instances` | Create new form instance from template |
| GET | `/v1/forms/instances/{id}` | Get form instance with data |
| PATCH | `/v1/forms/instances/{id}` | Update form data (auto-save) |
| GET | `/v1/forms/instances/{id}/versions` | List form version history |
| GET | `/v1/forms/instances/{id}/versions/{vid}` | Get specific version |
| GET | `/v1/forms/instances/{id}/pdf` | Export form as PDF |

### 9.6 Users and Teams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/users` | List organization users |
| GET | `/v1/users/{id}` | Get user profile |
| PATCH | `/v1/users/{id}` | Update user (role, profile) |
| DELETE | `/v1/users/{id}` | Deactivate user |
| GET | `/v1/users/me` | Get current user |
| PATCH | `/v1/users/me` | Update own profile |
| GET | `/v1/teams` | List teams |
| POST | `/v1/teams` | Create team |
| GET | `/v1/teams/{id}` | Get team details |
| PATCH | `/v1/teams/{id}` | Update team |
| DELETE | `/v1/teams/{id}` | Delete team |
| POST | `/v1/teams/{id}/members` | Add member to team |
| DELETE | `/v1/teams/{id}/members/{uid}` | Remove member from team |

### 9.7 Search and Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/search?q={query}&type={type}` | Global search |
| GET | `/v1/analytics/dashboard` | Dashboard widget data |
| GET | `/v1/analytics/pips` | PIPS methodology metrics |
| GET | `/v1/analytics/tickets` | Ticketing metrics |
| GET | `/v1/analytics/executive-summary` | Executive summary data |

### 9.8 Webhooks and Integrations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/webhooks` | List configured webhooks |
| POST | `/v1/webhooks` | Create webhook |
| PATCH | `/v1/webhooks/{id}` | Update webhook |
| DELETE | `/v1/webhooks/{id}` | Delete webhook |
| POST | `/v1/webhooks/{id}/test` | Send test event |
| GET | `/v1/webhooks/{id}/deliveries` | List delivery log |
| GET | `/v1/integrations` | List integrations and status |
| POST | `/v1/integrations/{type}/connect` | Begin integration setup |
| DELETE | `/v1/integrations/{type}/disconnect` | Remove integration |
| POST | `/v1/integrations/{type}/sync` | Trigger manual sync |

### 9.9 API Conventions

**Pagination** (cursor-based):
```
GET /v1/tickets?limit=50&cursor=eyJpZCI6MTAwfQ==
```
Response includes:
```json
{
  "data": [...],
  "pagination": {
    "cursor": "eyJpZCI6MTUwfQ==",
    "has_more": true,
    "total_count": 423
  }
}
```

**Filtering**:
```
GET /v1/tickets?status=in_progress,in_review&priority=high&assignee_id=usr_abc123&due_before=2026-03-15
```

**Sorting**:
```
GET /v1/tickets?sort=due_date:asc,priority:desc
```

**Error responses** follow RFC 7807 (Problem Details):
```json
{
  "type": "https://api.pips2.com/errors/validation",
  "title": "Validation Error",
  "status": 422,
  "detail": "The 'title' field is required and must be between 1 and 200 characters.",
  "errors": [
    { "field": "title", "message": "Required field", "code": "required" }
  ]
}
```

**Rate limiting headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 994
X-RateLimit-Reset: 1709400000
```

---

## 10. Acceptance Criteria

### 10.1 Authentication and User Management

**AC-AUTH-01: User Registration**
- GIVEN a new user visits the signup page
- WHEN they enter a valid email, password (10+ chars, mixed case, 1 number), and organization name
- THEN an account is created, a verification email is sent, and the user sees a "Check your email" page
- AND the user cannot access the app until email is verified

**AC-AUTH-02: Login**
- GIVEN a verified user
- WHEN they enter correct email and password
- THEN they are logged in and redirected to the dashboard
- WHEN they enter incorrect credentials 5 times within 15 minutes
- THEN the account is locked for 15 minutes with a clear error message

**AC-AUTH-03: Organization Isolation**
- GIVEN User A in Organization Alpha and User B in Organization Beta
- WHEN User A queries any API endpoint
- THEN User A receives only Organization Alpha data
- AND there is no API parameter, URL manipulation, or query that could expose Organization Beta data
- AND this is enforced at the database level via RLS, not just application code

**AC-AUTH-04: Role Enforcement**
- GIVEN a user with the "Member" role
- WHEN they attempt to access admin settings via URL or API
- THEN they receive a 403 Forbidden response
- AND the UI does not render admin navigation items

**AC-AUTH-05: User Invitation**
- GIVEN an Admin invites user@example.com as a Manager
- WHEN the invited user clicks the email link within 7 days
- THEN they are directed to set a password and are added to the organization as Manager
- WHEN the link is clicked after 7 days
- THEN they see an "Invitation expired" message with a "Request new invitation" option

### 10.2 PIPS Project Workflow

**AC-PIPS-01: Project Creation**
- GIVEN a Manager+ user
- WHEN they create a new PIPS project with title, description, and problem statement
- THEN a project is created with 6 PIPS steps initialized (Step 1 = "In Progress", Steps 2-6 = "Not Started")
- AND the project appears in the projects list and on the dashboard

**AC-PIPS-02: Step Gating**
- GIVEN a project in Step 2 with no analysis tool completed and no root cause documented
- WHEN a Member clicks "Advance to Step 3"
- THEN the button is disabled with tooltip "Complete all criteria to advance"
- AND the incomplete criteria are highlighted in red
- WHEN a Manager clicks "Advance to Step 3"
- THEN a confirmation dialog appears: "Not all criteria are met. Override and advance anyway?"
- AND if confirmed, the step advances with an audit log entry noting the override

**AC-PIPS-03: Step Regression**
- GIVEN a project currently in Step 4
- WHEN a user clicks on Step 2 in the progress indicator
- THEN Step 2 opens for viewing and editing
- AND the project remains in Step 4 (current_step does not change)
- AND any edits to Step 2 are saved and versioned

**AC-PIPS-04: Worked Examples**
- GIVEN a user is on any PIPS step
- WHEN they click "View Worked Example"
- THEN a slide-over panel opens showing the Parking Lot scenario completed for that step
- AND the example uses realistic data that demonstrates proper use of the methodology
- AND the panel can be dismissed without losing any work

**AC-PIPS-05: Completion**
- GIVEN a project in Step 6 with all evaluation criteria met
- WHEN the user completes Step 6
- THEN the project status changes to "Completed"
- AND a project summary is auto-generated from data across all 6 steps
- AND the project remains viewable but editing is restricted (can be unlocked by Manager+)

### 10.3 Digital Forms

**AC-FORM-01: Form Creation and Auto-Save**
- GIVEN a user opens a new Fishbone Diagram form in Step 2
- WHEN they add a cause to the "People" category and wait 30 seconds
- THEN the form auto-saves with a version record
- AND a "Saved" indicator appears in the form header
- AND if the browser crashes, the user can return and find their work intact

**AC-FORM-02: Form Locking**
- GIVEN User A is editing a Criteria Rating form
- WHEN User B opens the same form instance
- THEN User B sees "Currently being edited by User A" with a read-only view
- AND User B can request edit access (sends notification to User A)
- AND after 30 minutes of User A inactivity, the lock is auto-released

**AC-FORM-03: PDF Export**
- GIVEN a completed Cost-Benefit Analysis form
- WHEN the user clicks "Export to PDF"
- THEN a styled PDF is generated containing all form data, the organization logo, project name, date, and author
- AND the PDF is legible when printed on US Letter paper
- AND charts/diagrams in the form render correctly in the PDF

**AC-FORM-04: Form Attachment**
- GIVEN a completed form instance
- WHEN the user attaches it to a PIPS step or ticket
- THEN the form appears in the step's forms list or the ticket's attachments
- AND clicking the form from the step/ticket opens the form viewer
- AND the same form instance can be attached to multiple entities

### 10.4 Ticketing System

**AC-TKT-01: Ticket Creation**
- GIVEN a user on the board view
- WHEN they click "+ Add" in the "To Do" column
- THEN a quick-create form appears with title field, and the ticket is created with status "To Do"
- AND the ticket receives an auto-incremented ID in the format `{ORG_PREFIX}-{NUMBER}`
- AND the ticket appears on the board immediately without page refresh

**AC-TKT-02: Status Transitions**
- GIVEN a ticket with status "In Progress"
- WHEN a user drags it to the "In Review" column on the board
- THEN the ticket status updates to "In Review"
- AND an activity log entry is created: "{User} changed status from In Progress to In Review"
- AND watchers receive a notification
- AND the change is visible to other users within 2 seconds (via real-time subscription)

**AC-TKT-03: Parent/Child Relationships**
- GIVEN an Epic ticket "ACME-130"
- WHEN a user creates a child ticket
- THEN the child ticket shows "Parent: ACME-130" in its sidebar
- AND the parent ticket shows the child in its subtask list
- AND the parent's progress bar reflects child completion percentage
- WHEN all children are marked "Done"
- THEN the parent shows 100% progress but does NOT auto-close (manual close required)

**AC-TKT-04: Bulk Operations**
- GIVEN a user selects 10 tickets on the list view using checkboxes
- WHEN they choose "Assign to Raj Patel" from the bulk actions menu
- THEN all 10 tickets are assigned to Raj Patel
- AND 10 activity log entries are created
- AND Raj Patel receives a single batched notification (not 10 separate ones)

**AC-TKT-05: PIPS Ticket Context**
- GIVEN a ticket created from PIPS Step 4 implementation checklist
- WHEN a user views the ticket detail
- THEN the ticket shows a "PIPS Context" section with project name, step number, and step name
- AND clicking "View in Project" navigates to Step 4 of the linked project
- AND the ticket appears in the project's Step 4 related tickets list

**AC-TKT-06: @Mentions**
- GIVEN a user types "@Di" in a comment box
- WHEN the autocomplete dropdown appears showing "Diana Chen"
- AND the user selects Diana
- THEN "@Diana Chen" is inserted as a styled mention link
- AND when the comment is submitted, Diana receives an in-app notification within 5 seconds and an email within 5 minutes
- AND the notification links directly to the comment

### 10.5 Views and Navigation

**AC-VIEW-01: Board View Drag-and-Drop**
- GIVEN a Kanban board with tickets in multiple columns
- WHEN a user drags a ticket card from "To Do" to "In Progress"
- THEN the card moves to the new column with a smooth animation
- AND the ticket status updates in the database
- AND other users viewing the same board see the change within 2 seconds
- AND if the target column has a WIP limit that would be exceeded, a warning banner appears but the move is still allowed

**AC-VIEW-02: Global Search**
- GIVEN a user presses Cmd+K (or Ctrl+K on Windows)
- WHEN the search modal opens and they type "claim routing"
- THEN results appear within 1 second, grouped by type (Tickets, Projects, Forms, Comments)
- AND each result shows a snippet with the matching text highlighted
- AND clicking a result navigates to that entity
- AND pressing Escape closes the search modal

**AC-VIEW-03: Saved Filters**
- GIVEN a user creates a filter: status = "In Progress", assignee = "me", priority = "High" or "Critical"
- WHEN they save it as "My Urgent Work"
- THEN "My Urgent Work" appears in their sidebar under "Saved Filters"
- AND clicking it applies the filter to the current view
- AND the filter URL can be shared with teammates (who see the same filter applied)

**AC-VIEW-04: Mobile Responsiveness**
- GIVEN a user accesses the app on a 375px-wide mobile device
- THEN the sidebar collapses to a hamburger menu
- AND the board view shows one column at a time with horizontal swipe
- AND the list view switches to a card-based layout
- AND all touch targets are at least 44x44px
- AND no horizontal scrolling occurs on any page

### 10.6 Dashboard and Analytics

**AC-DASH-01: Real-Time Dashboard**
- GIVEN an organization dashboard
- WHEN a team member closes a ticket
- THEN the "Open Tickets" count decrements within 5 seconds without page refresh
- AND the "Recent Activity" feed shows the update

**AC-DASH-02: PIPS Metrics**
- GIVEN 20 PIPS projects in various stages
- WHEN the "Projects by PIPS Step" chart is rendered
- THEN it accurately shows the count of projects in each of the 6 steps
- AND clicking a bar filters to show only those projects

**AC-DASH-03: Executive Summary**
- GIVEN an Admin generates a shareable executive summary link
- WHEN Patricia (VP, no login required) opens the link
- THEN she sees a branded page with: active project count, completion rate, top projects by impact, aggregate ROI
- AND the data is current as of page load
- AND the link expires after the configured period (default: 30 days)

### 10.7 White-Label

**AC-WL-01: Branding Application**
- GIVEN an Admin uploads a logo and sets primary color to #1e40af (blue)
- WHEN any user in the organization loads any page
- THEN the header shows the custom logo (not "PIPS 2.0")
- AND all primary-colored UI elements (buttons, links, active states) use #1e40af
- AND PDF exports include the custom logo
- AND email notifications use the custom logo and colors

**AC-WL-02: Custom Domain**
- GIVEN an Admin configures custom domain "improve.brightpath.com" and adds the CNAME record
- WHEN the DNS propagates and SSL is provisioned
- THEN users can access the platform at `https://improve.brightpath.com`
- AND the URL bar shows the custom domain (no redirect to pips2.com)
- AND all internal links use the custom domain

**AC-WL-03: Terminology Override**
- GIVEN an Admin renames "PIPS" to "BrightPath Method" and Step 1 from "Identify" to "Discover"
- WHEN users navigate the platform
- THEN all references to "PIPS" in the UI show "BrightPath Method"
- AND Step 1 shows "Discover" everywhere (stepper, navigation, forms, reports)
- AND the methodology structure and functionality remain unchanged

### 10.8 Integrations

**AC-INT-01: Jira Bi-Directional Sync**
- GIVEN a Jira integration is configured with project mapping
- WHEN a ticket is created in PIPS 2.0
- THEN a corresponding Jira issue is created within 60 seconds with mapped fields
- WHEN the Jira issue status changes
- THEN the PIPS 2.0 ticket status updates within 60 seconds
- AND both systems show consistent data for synced tickets

**AC-INT-02: Webhook Delivery**
- GIVEN a webhook is configured for `ticket.created` events
- WHEN a ticket is created
- THEN a POST request is sent to the webhook URL within 5 seconds
- AND the payload includes an HMAC-SHA256 signature in the `X-Webhook-Signature` header
- AND if the endpoint returns 5xx, the webhook retries 3 times with exponential backoff (10s, 60s, 300s)
- AND the delivery is logged with status, response code, and response time

**AC-INT-03: Slack Ticket Creation**
- GIVEN Slack integration is connected to the organization
- WHEN a user types `/pips create Fix the broken login flow` in a Slack channel
- THEN a ticket is created with title "Fix the broken login flow" and the Slack user as reporter
- AND a confirmation message is posted to the Slack channel with the ticket ID and a link

### 10.9 Security and Compliance

**AC-SEC-01: Audit Logging**
- GIVEN any data mutation in the system (ticket created, status changed, user role changed, form edited, etc.)
- THEN an audit log entry is created with: timestamp, actor user ID, actor IP address, action type, entity type, entity ID, old value (for updates), new value
- AND audit logs cannot be modified or deleted by any user (append-only)
- AND audit logs are retained for at least 1 year

**AC-SEC-02: MFA Enforcement**
- GIVEN an Admin enables "Require MFA for all users"
- WHEN a user without MFA configured logs in
- THEN they are directed to the MFA enrollment flow before accessing any other page
- AND they cannot skip or dismiss the enrollment
- AND once enrolled, they must enter a TOTP code on every login

**AC-SEC-03: Data Export (GDPR)**
- GIVEN a user requests data export from their profile settings
- WHEN they click "Export My Data"
- THEN within 72 hours they receive an email with a download link
- AND the download contains all their personal data: profile, tickets created/assigned, comments, forms, activity logs
- AND the download is in a machine-readable format (JSON)
- AND the download link expires after 7 days

### 10.10 Performance

**AC-PERF-01: Page Load**
- GIVEN a user on a standard broadband connection (10 Mbps)
- WHEN they navigate to the dashboard
- THEN the page is interactive within 1.5 seconds
- AND the Largest Contentful Paint is under 2.5 seconds
- AND the Cumulative Layout Shift is under 0.1

**AC-PERF-02: Board Performance**
- GIVEN a Kanban board with 200 tickets across 6 columns
- WHEN the board loads
- THEN it renders within 2 seconds
- AND drag-and-drop operations complete without frame drops (60fps)
- AND filtering the board by assignee updates within 500ms

**AC-PERF-03: Search Performance**
- GIVEN an organization with 50,000 tickets and 500 projects
- WHEN a user searches for "claim routing"
- THEN relevant results appear within 1 second
- AND results are ranked by relevance (title matches rank higher than description matches)

### 10.11 Edge Cases and Error Handling

**AC-EDGE-01: Concurrent Editing**
- GIVEN User A and User B both have ticket ACME-142 open
- WHEN User A changes the status to "In Review" and User B changes the status to "Done" within 5 seconds
- THEN the last write wins (optimistic concurrency)
- AND User B sees a notification: "This ticket was updated by User A while you were editing"
- AND the activity log shows both changes in order

**AC-EDGE-02: Network Failure During Form Save**
- GIVEN a user is editing a form and loses network connectivity
- WHEN the auto-save fires
- THEN the save fails silently and retries every 30 seconds
- AND a yellow banner appears: "Changes not saved. Reconnecting..."
- AND when connectivity returns, the form saves automatically
- AND no data is lost

**AC-EDGE-03: Deleted/Deactivated User References**
- GIVEN User X is deactivated from the organization
- THEN tickets assigned to User X remain assigned (not auto-reassigned)
- AND User X's name appears as "User X (Deactivated)" in all views
- AND User X's comments and activity history are preserved
- AND User X cannot log in

**AC-EDGE-04: Organization at Storage Limit**
- GIVEN an organization at 95% of their storage limit
- THEN a warning banner appears for Admins: "Storage 95% full. Upgrade or delete files."
- WHEN the organization hits 100%
- THEN file uploads are blocked with a clear error message
- AND all other functionality continues to work (tickets, forms, comments without attachments)

**AC-EDGE-05: Ticket Hierarchy Limit**
- GIVEN a user tries to create a subtask of a subtask of a subtask (4th level)
- THEN the system rejects the creation with: "Maximum ticket hierarchy depth is 3 levels (Epic > Story > Subtask)"
- AND the UI grays out the "Add Subtask" button on 3rd-level tickets

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **PIPS** | Process Improvement and Problem Solving — the 6-step methodology at the core of the platform |
| **PIPS Project** | A structured improvement initiative that follows the 6-step PIPS workflow |
| **PIPS Step** | One of the 6 phases in a PIPS project (Identify, Analyze, Generate, Select & Plan, Implement, Evaluate) |
| **PIPS Ticket** | A ticket created from within a PIPS project step, carrying methodology context |
| **General Ticket** | A standalone ticket not tied to any PIPS project |
| **Form Template** | A reusable form definition (schema) — either built-in (26 PIPS tools) or custom |
| **Form Instance** | A filled-in copy of a form template, containing actual project data |
| **White-Label** | Customizing the platform's branding (name, colors, logo, domain) for a specific organization |
| **Organization** | A tenant in the multi-tenant system — all data is isolated per organization |
| **Worked Example** | A pre-filled demonstration of a PIPS tool using the "Parking Lot" scenario |
| **WIP Limit** | Work-in-progress limit — the maximum number of tickets in a Kanban board column |
| **RACI** | Responsible, Accountable, Consulted, Informed — a responsibility assignment matrix |
| **Fishbone Diagram** | Also called Ishikawa diagram — a root cause analysis tool with 6 categories |
| **5-Why Analysis** | An iterative root cause technique that asks "Why?" up to 5 times |

---

## Appendix B: Pricing Tiers (Proposed)

| Tier | Price | Users | Features |
|------|-------|-------|----------|
| **Starter** | $15/user/month | Up to 25 | Core PIPS workflow, ticketing, 26 form templates, board/list views, basic dashboard, email notifications |
| **Professional** | $30/user/month | Up to 250 | Everything in Starter + custom forms, timeline/calendar views, advanced analytics, Slack integration, saved filters, custom fields, PDF export |
| **Enterprise** | $45/user/month | Unlimited | Everything in Professional + white-label, SSO/SAML, Jira/Azure DevOps/AHA! integrations, audit logging, custom domains, API access, custom workflows, SCIM provisioning, dedicated support |
| **White-Label Partner** | Custom pricing | Unlimited | Everything in Enterprise + multi-organization management, partner dashboard, co-branding, volume discounts |

---

## Appendix C: Release Phases

### Phase 1: Foundation (Months 1-3)
- Authentication (email/password, MFA)
- Organization and user management
- RBAC (5 roles)
- PIPS project creation with 6-step workflow
- Core forms (10 highest-priority templates)
- Basic ticketing (create, edit, status, assign)
- Board view and list view
- My Work view
- In-app notifications
- Basic dashboard (stat cards + activity feed)

### Phase 2: Full Ticketing (Months 4-5)
- Parent/child ticket relationships
- Labels, tags, categories
- Comments with @mentions
- File attachments
- Activity log
- Bulk operations
- Custom fields
- Ticket templates
- Search and filtering
- Saved filters

### Phase 3: Forms and Analytics (Months 6-7)
- Remaining 16 form templates
- Custom form builder
- PDF export
- Form version history
- PIPS metrics dashboard
- Ticketing metrics dashboard
- Timeline view
- Calendar view
- Team view
- Weekly digest emails

### Phase 4: Enterprise (Months 8-10)
- White-label system (branding, custom domain)
- SSO/SAML
- Jira integration
- Slack integration
- Webhooks and REST API
- API documentation
- Audit logging
- Executive summary (shareable)
- Email-to-ticket

### Phase 5: Scale (Months 11-12)
- Azure DevOps integration
- AHA! integration
- Microsoft Teams integration
- Custom status workflows
- SCIM provisioning
- IP allowlisting
- Data import/export
- Real-time collaborative editing
- Custom roles
- Sprint/iteration support

---

*End of Product Requirements Document*
