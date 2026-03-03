# PIPS 2.0 — UX Flows & User Journey Document

> Version 1.0 | March 2026
> Defines user journeys, critical UX flows, navigation architecture, key screens, and interaction patterns for the PIPS 2.0 SaaS platform.

---

## Table of Contents

1. [User Journey Maps](#1-user-journey-maps)
2. [Critical UX Flows](#2-critical-ux-flows)
3. [The "Aha Moment"](#3-the-aha-moment)
4. [Navigation Architecture](#4-navigation-architecture)
5. [Key Screen Descriptions](#5-key-screen-descriptions)
6. [Empty States & First-Use](#6-empty-states--first-use)
7. [Notification UX](#7-notification-ux)
8. [Error & Edge Cases](#8-error--edge-cases)
9. [Responsive Design](#9-responsive-design)
10. [Onboarding System](#10-onboarding-system)

---

## 1. User Journey Maps

### 1.1 Sarah — Process Champion (Dept Manager, 35-45)

Sarah is the primary buyer and power user. Her journey is detailed below because she drives adoption, proves ROI, and expands usage across the organization.

**Stage 1: Awareness**
- Trigger: Sarah's department has recurring quality issues. Leadership is pressuring her to "fix the process." She's been running improvement efforts with spreadsheets, sticky notes in meetings, and email threads — it's chaotic.
- Discovery channels: LinkedIn article about structured process improvement, Google search for "process improvement software," peer recommendation at a management conference, or PIPS consulting firm referral.
- First impression: Lands on the PIPS 2.0 marketing site. Sees the tagline connecting methodology to software. Recognizes the 6-step framework if she has PIPS training; if not, the landing page educates her on the approach.
- Key question: "Is this actually different from Jira/Monday/Asana, or just another project board with a coat of paint?"
- Content she consumes: Homepage hero section, "How It Works" page showing the 6-step flow, a case study PDF, pricing page.
- Exit criteria: She clicks "Start Free Trial" or "Request Demo."

**Stage 2: Evaluation**
- Trial signup: Email + password, or SSO. She enters her company name and department. No credit card required for 14-day trial.
- First 10 minutes: The onboarding wizard asks about her role (she selects "Manager / Process Lead"), team size, and whether she's familiar with PIPS methodology. Based on answers, the system tailors the experience.
- Evaluation checklist (mental): Can I set up a real improvement project? Can I invite my team without IT involvement? Does it guide me through the methodology or just give me empty boards? Can I show my VP a dashboard?
- Comparison shopping: She opens Jira and PIPS 2.0 side by side. PIPS wins when she sees the guided Step 1 (Identify) flow that transforms vague complaints into measurable problem statements — Jira has no equivalent.
- Demo request: If enterprise, she books a 30-minute walkthrough. The sales engineer creates a sample project pre-populated with her industry's common problems.
- Exit criteria: She creates her first real PIPS project and invites at least 2 team members.

**Stage 3: Onboarding**
- Org setup: Names her workspace (e.g., "Acme Manufacturing — Quality"), uploads logo (optional), selects time zone.
- Team invites: She enters 4-6 email addresses. Each gets an invite with a personalized message. She assigns roles: herself as Admin, her supervisor as Viewer, team leads as Members.
- First project creation: The onboarding wizard walks her through creating her first PIPS project. She names it something like "Reduce Customer Complaint Resolution Time." The system guides her through Step 1 (Identify) immediately.
- Template selection: She can start from scratch or pick from industry templates (Manufacturing, Healthcare, IT, etc.). Templates pre-populate the project with example problem statements and common root causes.
- Exit criteria: Her first PIPS project exists with a real problem statement, and at least one team member has accepted the invite.

**Stage 4: First Value (The Critical 48 Hours)**
- Hour 1: She completes Step 1 (Identify). The transformation card feature turns her vague "customers are unhappy" into "Average complaint resolution time is 4.2 days vs. target of 2 days, resulting in 15% customer churn." She screenshots this and shares it in her team Slack — this is the aha moment.
- Hour 2-4: She moves to Step 2 (Analyze) and uses the fishbone diagram tool. She drags in potential causes, invites team members to add their own asynchronously. The digital format beats the whiteboard because remote team members can participate.
- Day 2: Her team has added root causes. She uses the 5-why drill-down on the top 3 causes. The system auto-generates a summary she can paste into her weekly leadership email.
- First value metric: She has a structured analysis she can present to her VP that would have taken 2 weeks of meetings to produce manually.
- Exit criteria: She has a completed Step 2 (Analyze) with team input and has shared or exported a summary.

**Stage 5: Regular Use (Weeks 2-8)**
- Weekly rhythm: Monday morning, she opens PIPS 2.0 dashboard. She sees project progress across all active PIPS projects, overdue tickets, and team workload.
- Project progression: She advances through Steps 3-6, using brainstorming tools (Step 3), decision matrices (Step 4), milestone tracking (Step 5), and results measurement (Step 6).
- Ticket management: She creates tickets for implementation tasks in Step 5, assigns them to team members with due dates, and tracks completion on the board view.
- Reporting: Every Friday, she generates a weekly summary for her VP (Diana). The system auto-generates this from project data — time saved vs. manual reporting.
- Team adoption: She monitors which team members are active. She nudges inactive members with @mentions in tickets.
- Exit criteria: She has completed at least one full 6-step PIPS cycle and started a second project.

**Stage 6: Expansion**
- Second department: Her VP (Diana) sees the results dashboard and asks another department to adopt PIPS 2.0. Sarah becomes the internal champion, helping onboard the new team.
- Upgrade trigger: Free trial or basic plan limits hit — she needs more projects, more users, or advanced analytics. She submits a purchase request with ROI data the platform generated.
- Integration requests: She asks Raj (IT admin) to connect PIPS 2.0 to their Jira instance so implementation tickets sync bidirectionally.
- Feature requests: She submits ideas through the in-app feedback widget — custom form templates, API access, advanced reporting.
- Exit criteria: Organization moves from trial to paid plan; second team is onboarded.

**Stage 7: Advocacy**
- Internal champion: Sarah presents PIPS 2.0 results at a company all-hands. She uses the exported analytics deck.
- External advocacy: She writes a LinkedIn post about her improvement results. She agrees to be a case study. She refers a peer at another company.
- Community: She joins the PIPS 2.0 user community, shares templates she's created, answers questions from new users.
- Certification: If offered, she pursues PIPS methodology certification through the platform's learning module.

---

### 1.2 James — Team Member (IC, 25-35)

| Stage | Experience |
|-------|-----------|
| **Awareness** | Receives email invite from Sarah: "Join our process improvement project on PIPS 2.0." Has no prior context on the methodology. |
| **Evaluation** | Clicks invite link. Sees a brief explainer: "PIPS helps teams fix recurring problems in 6 structured steps. Your manager has started a project and needs your input." Decides it looks simple enough. |
| **Onboarding** | Creates account via invite link (name + password). Lands directly in the project Sarah created, not an empty dashboard. Sees a 60-second interactive tooltip tour: "Here's your project. Here are your assigned tasks. Here's where to add your ideas." |
| **First Value** | Within 5 minutes, he contributes a root cause to the fishbone diagram in Step 2 (Analyze). He sees his contribution appear in real time alongside teammates'. Feels heard — his frontline knowledge is captured. |
| **Regular Use** | Daily: Opens PIPS 2.0, checks "My Work" for assigned tickets. Works tickets through the workflow (To Do → In Progress → Done). Adds comments, attaches files. Weekly: Participates in brainstorming sessions (Step 3) and votes on solutions (Step 4). |
| **Expansion** | Starts using PIPS 2.0 for general tickets beyond the PIPS project — bug tracking, small tasks. Suggests the tool to his previous team at another company. |
| **Advocacy** | Tells new hires "use PIPS 2.0 for everything, it's way better than the old spreadsheet." Becomes a go-to resource for tips. |

---

### 1.3 Diana — Executive Sponsor (VP/C-Level, 45-55)

| Stage | Experience |
|-------|-----------|
| **Awareness** | Sarah pitches PIPS 2.0 in a leadership meeting, showing the problem statement and root cause analysis. Diana is intrigued by the structured output — it's more rigorous than past improvement efforts. |
| **Evaluation** | Diana does not sign up herself. She asks Sarah to send her a dashboard link. She wants to see: How many projects are active? What's the estimated ROI? Are timelines being met? She opens the executive dashboard (read-only) and sees portfolio-level metrics. |
| **Onboarding** | Raj (IT admin) creates Diana's account with the "Executive / Viewer" role. She receives a welcome email with a direct link to the analytics dashboard. No project setup required. |
| **First Value** | In under 2 minutes, she sees a portfolio dashboard: 3 active PIPS projects, estimated $120K annual savings in progress, 2 projects on track, 1 at risk. She can drill into any project for details. This replaces the monthly status email she used to get from Sarah. |
| **Regular Use** | Weekly: Glances at the portfolio dashboard (2-3 minutes). Monthly: Reviews completed PIPS cycles and their measured outcomes. Quarterly: Uses the ROI summary in board presentations. |
| **Expansion** | Approves budget for enterprise plan. Mandates that all departments use PIPS 2.0 for process improvement initiatives. |
| **Advocacy** | Mentions PIPS 2.0 results in earnings calls or board meetings as evidence of operational excellence. Refers the tool to peers at other companies. |

---

### 1.4 Raj — System Admin (IT/Ops, 30-40)

| Stage | Experience |
|-------|-----------|
| **Awareness** | Sarah or Diana asks IT to "set up that process improvement tool." Raj receives a forwarded email or Slack message with the PIPS 2.0 link. |
| **Evaluation** | Raj checks: SSO support (SAML/OIDC)? SOC 2 compliance? Data residency options? API documentation? Integration with existing tools (Jira, Azure DevOps)? He reviews the security whitepaper and admin docs. |
| **Onboarding** | Creates the organization account. Configures SSO, sets up RBAC roles (Admin, Manager, Member, Viewer, External). Configures integrations: connects Jira instance, sets up webhook for Slack notifications. Imports user list via CSV or directory sync. |
| **First Value** | All invited users can log in via SSO without creating separate passwords. The Jira integration syncs implementation tickets bidirectionally. Raj's work is done in under an hour. |
| **Regular Use** | Monthly: Reviews user activity, deactivates departed employees, adjusts roles. Quarterly: Reviews audit logs, updates integrations if APIs change. As needed: Troubleshoots access issues, manages API keys. |
| **Expansion** | Adds new departments, configures white-label theming for different business units, sets up additional integrations. |
| **Advocacy** | Recommends PIPS 2.0 to IT peers as "one of the easier SaaS tools to admin — good SSO, clean API, no drama." |

---

### 1.5 Maria — White-Label Client (External)

| Stage | Experience |
|-------|-----------|
| **Awareness** | Maria's consulting firm uses PIPS 2.0 under their own brand (e.g., "AcmeConsulting Improve"). She receives an invite from her consulting engagement lead. She never sees the PIPS 2.0 brand. |
| **Evaluation** | None — the tool is presented as part of the consulting engagement. She trusts the consulting firm's recommendation. |
| **Onboarding** | Clicks invite link. Sees the consulting firm's logo, colors, and domain. Creates account. Lands in a pre-configured project for her organization's improvement initiative. |
| **First Value** | Participates in a guided Step 1 (Identify) session led by her consultant, who screen-shares the tool. Maria adds her problem observations. Sees the collaborative input from her team in real time. |
| **Regular Use** | Logs in 2-3 times per week during the engagement (typically 8-12 weeks). Completes assigned tasks, reviews progress, participates in methodology steps as guided by the consultant. |
| **Expansion** | If the consulting engagement ends but Maria's team wants to continue, they can transition to a direct PIPS 2.0 subscription — a growth channel for the platform. |
| **Advocacy** | Refers other departments within her organization to the consulting firm, which in turn brings more white-label users to the platform. |

---

## 2. Critical UX Flows

### 2.1 Signup & Onboarding

```
FLOW: New User Signup → First Value

1.  LANDING PAGE
    - User clicks "Start Free Trial" (no credit card)
    - Alternative: clicks invite link from teammate (skips to step 5)

2.  SIGNUP FORM
    - Fields: Full name, Work email, Password (strength meter)
    - Alternative: "Continue with Google" / "Continue with Microsoft" (SSO)
    - Validation: Real-time email format check, password requirements shown inline
    - Action: Click "Create Account"

3.  EMAIL VERIFICATION
    - Screen: "Check your email — we sent a 6-digit code to [email]"
    - User enters code (auto-submits on 6th digit)
    - Fallback: "Resend code" link (60-second cooldown)

4.  ROLE & CONTEXT SURVEY (3 screens, skippable)
    - Screen A — "What's your role?"
      Options: Manager/Process Lead | Team Member | Executive | IT Admin | Consultant
      (Determines default dashboard, onboarding path, and feature highlights)
    - Screen B — "How big is your team?"
      Options: Just me | 2-5 | 6-15 | 16-50 | 50+
    - Screen C — "Are you familiar with the PIPS methodology?"
      Options: Yes, certified | Somewhat | Not at all
      (Determines how much in-app education to show)

5.  ORG SETUP
    - Fields: Organization name, Department (optional)
    - Auto-generated workspace URL: pips2.app/acme-quality
    - Optional: Upload logo (drag-and-drop, max 2MB, PNG/SVG)
    - Time zone auto-detected, editable

6.  INVITE TEAM (skippable)
    - Bulk email input (comma-separated or one per line)
    - Role assignment per invitee (dropdown: Admin, Member, Viewer)
    - Optional personal message
    - "I'll do this later" link at bottom

7.  FIRST PROJECT PROMPT
    - Screen: "Let's start your first improvement project"
    - Two paths:
      a) "Start from scratch" → goes to project creation flow (Section 2.2)
      b) "Use a template" → shows 6-8 industry templates with previews
      c) "Explore first" → lands on empty dashboard with guided tour
    - If user selects a template, project is pre-populated and user lands in Step 1

8.  GUIDED STEP 1 (IDENTIFY)
    - This is the aha moment flow (see Section 3)
    - User sees transformation cards, writes their first problem statement
    - Celebration micro-animation when first problem statement is saved
    - Prompt: "Great start! Invite your team to add their perspective."
```

---

### 2.2 Creating a PIPS Project (Full 6-Step Flow)

```
FLOW: PIPS Project Creation → Completion

1.  CREATE PROJECT
    - Entry: Click "+ New Project" from sidebar or project list
    - Modal: Project name, Description (optional), Template (optional)
    - Set project type: "PIPS Improvement Project" (vs. "General Project")
    - Assign project lead, add team members
    - Set target completion date (optional)
    - Click "Create Project"

2.  STEP 1: IDENTIFY
    - View: Full-width guided workspace
    - Header: Step indicator showing "1 of 6 — Identify"
    - Left panel: Methodology guidance
      "In this step, you'll define the problem clearly and measurably."
      Includes: What makes a good problem statement, common pitfalls, examples
    - Right panel: Working area
      a) Observation collector: Team members submit raw observations
         ("Customers keep complaining about wait times")
      b) Transformation cards: System shows before/after examples
         Bad: "Our process is broken"
         Good: "Order fulfillment cycle time averages 8.3 days vs. industry benchmark of 3 days"
      c) Problem statement builder: Guided form with fields
         - What is happening? (text)
         - What should be happening? (text)
         - What is the measurable gap? (number + unit)
         - Who is affected? (text)
         - What is the impact? (cost/time/quality metric)
      d) Scope definition: In-scope / Out-of-scope lists
      e) Stakeholder mapping (optional)
    - Outputs saved: Problem statement, scope, baseline metrics
    - Action: "Mark Step 1 Complete" → confirmation modal → advances to Step 2
    - Ticket generation: System prompts "Create tickets for data collection tasks?"

3.  STEP 2: ANALYZE
    - View: Analysis workspace with tool selector
    - Available tools (tabs):
      a) Fishbone Diagram (Ishikawa)
         - Interactive canvas with 6 default categories (Man, Machine, Method, Material, Measurement, Environment)
         - Click category → add causes → drag to rearrange
         - Team members can add causes asynchronously (real-time sync)
         - Color-coded by contributor
      b) 5-Why Analysis
         - Sequential drill-down interface
         - Start with a cause from the fishbone → ask "Why?" up to 5 times
         - Tree visualization of the chain
         - Multiple 5-why chains can run in parallel
      c) Force-Field Analysis
         - Two-column layout: Driving Forces | Restraining Forces
         - Drag to rank by strength (1-5 scale)
         - Visual balance indicator
      d) Data collection forms
         - Select from 26 digital form templates
         - Assign forms to team members with due dates
         - Responses auto-aggregate into charts
    - Outputs saved: Root cause list (ranked), supporting data
    - Action: "Mark Step 2 Complete" → summary generated

4.  STEP 3: GENERATE
    - View: Ideation workspace
    - Available tools (tabs):
      a) Brainstorming
         - Timed sessions (configurable: 5/10/15 min)
         - Anonymous idea submission (optional)
         - Ideas appear as cards on a shared board
         - No criticism phase: voting/filtering disabled during generation
      b) Brainwriting (6-3-5 method)
         - Structured rounds: 6 participants, 3 ideas each, 5 minutes per round
         - Ideas rotate to next person for building upon
         - Digital adaptation: async-friendly, notifications when it's your turn
      c) Free-form idea list
         - Simple list view for smaller teams
         - Add ideas, tag categories, attach references
    - Duplicate detection: System flags similar ideas for merging
    - Outputs saved: Idea list with contributor attribution
    - Action: "Move to Selection" → ideas carry forward to Step 4

5.  STEP 4: SELECT & PLAN
    - View: Decision + planning workspace
    - Phase A — Selection:
      a) Decision Matrix
         - Table: Ideas (rows) × Criteria (columns)
         - Default criteria: Impact, Feasibility, Cost, Time
         - Custom criteria supported with configurable weights
         - Each team member scores independently (1-5 scale)
         - System calculates weighted scores, ranks solutions
         - Visual: bar chart of total scores
      b) Weighted Voting
         - Each member gets N votes (configurable, default: 3)
         - Can distribute votes across ideas or stack on one
         - Real-time vote tally with bar visualization
      c) Consensus view: Combined results from matrix + voting
         - Top 3 solutions highlighted
         - Team selects final solution(s) to implement
    - Phase B — Planning:
      a) RACI Matrix
         - Auto-populated with team members (columns) and tasks (rows)
         - Click cells to assign: Responsible, Accountable, Consulted, Informed
         - Validation: Each task must have exactly 1 A (Accountable)
      b) Implementation Plan
         - Gantt-style timeline with milestones
         - Task breakdown: auto-generates tickets for Step 5
         - Resource allocation: assign team members to tasks
         - Risk register: identify potential blockers with mitigation plans
      c) Success criteria: Define measurable targets for Step 6
    - Outputs saved: Selected solutions, RACI, implementation plan, success criteria
    - Action: "Begin Implementation" → creates tickets, advances to Step 5

6.  STEP 5: IMPLEMENT
    - View: Hybrid project management + methodology view
    - Top section: Milestone progress bar with key dates
    - Main content: Board/List/Timeline views of implementation tickets
      - Tickets auto-generated from Step 4 implementation plan
      - Additional tickets can be created manually
      - Each ticket: title, description, assignee, due date, priority, status
      - Status workflow: To Do → In Progress → In Review → Done
    - Side panel: Implementation checklist
      - Pre-populated from the PIPS methodology
      - Custom items can be added
      - Check off as completed
    - Progress tracking:
      - Burndown/burnup chart
      - % complete by milestone
      - Blocker log with escalation indicators
    - PIPS guidance panel: Tips for staying on track, common implementation pitfalls
    - Outputs saved: Completed tasks, progress metrics, issues encountered
    - Action: "Move to Evaluation" → triggers results collection prompt

7.  STEP 6: EVALUATE
    - View: Results measurement workspace
    - Section A — Measure Results:
      a) Metrics comparison: Baseline (from Step 1) vs. Current
         - Auto-formatted: "Was 8.3 days → Now 3.1 days (63% improvement)"
         - Visual: before/after bar chart
      b) Success criteria check: Green/yellow/red for each criterion from Step 4
      c) Data entry: Manual input or linked to data collection forms
    - Section B — Lessons Learned:
      a) Structured reflection form:
         - What worked well?
         - What didn't work as planned?
         - What would we do differently?
         - Unexpected outcomes?
      b) Team retrospective mode: Each member submits independently, then facilitator reveals and discusses
    - Section C — Next Steps:
      a) Decision: Sustain / Iterate / New Project
      b) "Cycle back to Step 1" button: Creates a new PIPS project pre-populated with lessons learned
      c) Sustainability plan: Who monitors ongoing metrics? How often? What triggers re-intervention?
    - Outputs saved: Final metrics, lessons learned, sustainability plan
    - Action: "Complete Project" → project archived with full audit trail
    - Celebration: Confetti animation, project summary card generated for sharing
```

---

### 2.3 Ticket Lifecycle

```
FLOW: Ticket Creation → Closure

1.  CREATE TICKET
    - Entry points:
      a) Click "+ New Ticket" from any view
      b) Auto-generated from PIPS Step 4 (implementation plan)
      c) Quick-add from board view (click "+" in column header)
      d) Command palette: Ctrl+K → "New ticket"
    - Required fields: Title, Project
    - Optional fields: Description (rich text), Assignee, Due date, Priority (Low/Medium/High/Critical), Labels, Parent ticket, Attachments
    - Ticket types: PIPS Task (linked to a step) | General Task | Bug | Request
    - Save: Ticket gets auto-incremented ID (e.g., ACME-142)

2.  ASSIGN
    - Set assignee (single person, with @mention autocomplete)
    - Set reviewer (optional, for tasks requiring sign-off)
    - Notification sent to assignee: "[Sarah] assigned you ACME-142: Collect cycle time data"

3.  WORK
    - Assignee moves ticket: To Do → In Progress
    - Adds comments, updates, file attachments
    - Logs time (optional, if time tracking enabled)
    - Links related tickets (parent/child, blocks/blocked by)
    - @mentions teammates for input

4.  REVIEW
    - Assignee moves ticket: In Progress → In Review
    - Reviewer gets notification
    - Reviewer can: Approve (moves to Done) | Request Changes (moves back to In Progress with comment)
    - If no reviewer assigned, In Review step is skipped

5.  CLOSE
    - Ticket moves to Done
    - Resolution recorded: Completed | Won't Do | Duplicate
    - Parent ticket auto-updates % complete
    - PIPS step progress bar updates if ticket is linked to a step
    - Ticket remains visible in board (Done column) for 30 days, then auto-archived

6.  REOPEN (edge case)
    - Any team member can reopen a Done ticket
    - Ticket moves back to To Do with a "Reopened" badge
    - Comment required: "Why is this being reopened?"
```

---

### 2.4 Daily Workflow — Team Member (James)

```
FLOW: James's Daily Workflow

1.  LOGIN
    - Opens app (bookmarked URL or SSO portal)
    - Lands on "My Work" dashboard (default for Member role)

2.  CHECK NOTIFICATIONS
    - Bell icon shows unread count (red badge)
    - Clicks bell → notification dropdown
    - Scans: new assignments, @mentions, status changes, due date reminders
    - Clicks relevant notification → navigates to ticket/project

3.  REVIEW MY WORK
    - "My Work" dashboard shows:
      a) Due Today: Tickets due today (sorted by priority)
      b) In Progress: Tickets he's actively working
      c) Recently Assigned: New tickets since last login
      d) Overdue: Past-due tickets (red highlight)
    - He picks the highest-priority due-today item

4.  WORK ON TICKETS
    - Opens ticket detail (click from My Work list)
    - Reads description, checks subtasks
    - Moves to "In Progress" if not already
    - Does the work (outside the app)
    - Returns to update: adds comment with findings, attaches deliverable
    - Moves to "In Review" or "Done"

5.  PARTICIPATE IN PIPS STEPS
    - If a PIPS step requires team input (e.g., brainstorming, voting):
      - Notification: "Step 3 brainstorming is open — add your ideas by Friday"
      - James opens the project → Step 3 → submits ideas
      - Sees teammates' ideas appearing in real time
    - If it's a voting step (Step 4):
      - Reviews options, distributes votes
      - Sees results after voting period closes

6.  END OF DAY
    - Updates any in-progress tickets with end-of-day status
    - Checks tomorrow's due dates on "My Work"
    - Logs off (session persists for 7 days with "Remember me")
```

---

### 2.5 Weekly Workflow — Manager (Sarah)

```
FLOW: Sarah's Weekly Workflow

1.  MONDAY MORNING REVIEW
    - Opens dashboard → "Manager View" (toggle from "My Work")
    - Reviews:
      a) Team workload heatmap: Who has too many tasks? Who has capacity?
      b) Overdue tickets: Sorted by days overdue, grouped by assignee
      c) PIPS project progress: Which step is each project on? On track?
      d) Blockers: Tickets flagged as blocked, with blocker details

2.  REASSIGN AND REBALANCE
    - Drag-and-drop reassignment from workload view
    - Or: Open ticket → change assignee → system notifies both old and new assignee
    - Adjust priorities: Bulk-select tickets → set priority
    - Unblock: Add comments to blocked tickets, remove blockers, escalate if needed

3.  ADVANCE PIPS STEPS
    - If a step is ready to close: Review outputs, click "Mark Step Complete"
    - If a step needs team action: @mention team in a comment, set deadline
    - Open next step, configure tools (e.g., set up decision matrix criteria)

4.  MIDWEEK CHECK-IN (Wednesday)
    - Quick scan of dashboard for new blockers or overdue items
    - Respond to @mentions and ticket comments
    - 10-minute activity, not a deep review

5.  FRIDAY REPORTING
    - Open "Reports" section
    - Generate weekly summary: auto-populated with this week's data
      - Tickets completed / created / overdue
      - PIPS step progress
      - Key metrics movement
    - Export as PDF or email directly to Diana (VP)
    - Review next week's milestones, adjust dates if needed

6.  MONTHLY DEEP REVIEW (First Monday of Month)
    - Portfolio dashboard: All PIPS projects in one view
    - ROI tracking: Estimated savings, actual savings, investment
    - Team performance trends: Velocity, completion rates
    - Decide: Start new project? Archive completed? Escalate at-risk?
```

---

### 2.6 Admin Setup (Raj)

```
FLOW: System Admin Initial Configuration

1.  RECEIVE ADMIN INVITE
    - Sarah or Diana sends Raj the org admin invite
    - Raj clicks link → creates account with Admin role

2.  CONFIGURE ORGANIZATION
    - Settings → Organization
      a) Org name, logo, primary color (basic branding)
      b) Default time zone, work week (Mon-Fri vs. custom)
      c) Fiscal year start (for reporting alignment)

3.  CONFIGURE AUTHENTICATION
    - Settings → Security
      a) SSO setup: SAML 2.0 or OIDC
         - Upload IdP metadata XML or enter endpoint URLs
         - Map attributes: email, first name, last name, groups
         - Test connection with "Sign in as test user"
      b) Password policy: Minimum length, complexity, expiration
      c) 2FA requirement: Optional / Required for Admins / Required for All
      d) Session timeout: Configurable (default: 8 hours active, 30 days remembered)

4.  SET UP ROLES AND PERMISSIONS
    - Settings → Roles
      a) Review default roles: Admin, Manager, Member, Viewer, External
      b) Customize permissions per role (granular: create/read/update/delete per entity)
      c) Create custom roles if needed (e.g., "Department Lead" with report access but no admin)

5.  INVITE AND MANAGE USERS
    - Settings → Users
      a) Bulk invite via CSV upload (columns: email, role, department)
      b) Or: directory sync with SCIM (auto-provision/deprovision)
      c) Review pending invites, resend if needed
      d) User list: name, email, role, last active, status (active/invited/deactivated)

6.  CONFIGURE INTEGRATIONS
    - Settings → Integrations
      a) Jira: OAuth connection, select projects to sync, map ticket fields
      b) Azure DevOps: PAT-based connection, select boards, configure sync direction
      c) Slack/Teams: Webhook URL for notifications, select channels per project
      d) Email: SMTP configuration for custom email domain (notifications@acme.com)
      e) API keys: Generate keys for custom integrations, set scopes

7.  CONFIGURE WHITE-LABEL (if applicable)
    - Settings → Branding
      a) Logo (header, favicon, login page)
      b) Color scheme (primary, secondary, accent)
      c) Custom domain: cname setup instructions, SSL auto-provisioned
      d) Email templates: customize subject lines and branding

8.  VERIFY AND HANDOFF
    - Run built-in health check: "Verify Configuration"
      - Checks: SSO login works, integrations connected, at least 1 non-admin user exists
    - Mark setup complete → admin-specific onboarding dismissed
    - Ongoing: Audit log accessible at Settings → Audit Log
```

---

## 3. The "Aha Moment"

### 3.1 What Makes PIPS 2.0 Different from Jira

The aha moment is **not** a better board view or a prettier UI. It is the moment when a user realizes that PIPS 2.0 doesn't just track work — it **guides thinking**.

Specifically: **When Step 1 (Identify) transforms a vague complaint into a measurable, actionable problem statement.**

Every team has problems. Most teams describe them vaguely: "Our process is slow." "Customers are unhappy." "Quality is bad." In Jira, you'd create an epic called "Fix quality issues" and start throwing tickets at it. In PIPS 2.0, the system intervenes with a structured transformation.

### 3.2 The Transformation Card Mechanic

The transformation card is the core UX element of the aha moment:

```
┌─────────────────────────────────────────────────────────┐
│  TRANSFORMATION CARD                                    │
│                                                         │
│  ❌ BEFORE (vague)                                      │
│  "Our customer service is too slow"                     │
│                                                         │
│         ↓  Let's make this measurable  ↓                │
│                                                         │
│  ✅ AFTER (measurable)                                  │
│  "Average first-response time is 4.2 hours              │
│   vs. target of 1 hour, affecting 2,300                 │
│   tickets/month and driving 18% churn"                  │
│                                                         │
│  [Try it with YOUR problem →]                           │
└─────────────────────────────────────────────────────────┘
```

The user sees 2-3 examples, then is prompted to enter their own vague problem statement. The guided form (What's happening? What should happen? What's the gap? Who's affected?) walks them through the transformation. The before/after is shown side by side. This is visceral — they can *see* the quality difference.

### 3.3 Engineering the Aha Moment in 5 Minutes

**Minute 0-1: Signup**
- Minimal friction signup (email + password or SSO)
- Role selection: "I'm a Manager/Process Lead" (enables guided path)

**Minute 1-2: Context**
- Skip org setup details (accept defaults)
- "Let's create your first improvement project"
- User types a project name (e.g., "Reduce wait times")

**Minute 2-4: The Transformation**
- Land directly in Step 1 (Identify)
- Show 2 transformation card examples relevant to their industry (if selected during signup) or generic ones
- Prompt: "Now describe YOUR problem — we'll help you sharpen it"
- Guided form appears: 4 fields, each with placeholder text showing what good input looks like
- As user fills fields, the problem statement auto-composes in a preview panel on the right

**Minute 4-5: The Payoff**
- Problem statement displayed in a polished card format
- Below it: "This is the foundation of your improvement project. Everything else builds on this."
- CTA: "Share with your team" (invite flow) or "Continue to Step 2" (analyze)
- Subtle celebration: card slides into place with a satisfying animation

### 3.4 Activation Metrics That Correlate with Retention

| Metric | Definition | Target | Rationale |
|--------|-----------|--------|-----------|
| **Problem statement created** | User completes Step 1 (Identify) with a measurable problem statement | Within first session | Core aha moment — if they don't do this, they treat it like another Jira |
| **Team member invited** | User sends at least 1 invite | Within 48 hours | Collaboration is sticky; solo users churn |
| **Second step entered** | User opens Step 2 (Analyze) and adds at least 1 root cause | Within 7 days | Proves they see the methodology as valuable, not just the tool |
| **Ticket created** | User creates at least 1 ticket (PIPS or general) | Within 7 days | Shows integration into daily work, not just methodology exploration |
| **Weekly return** | User logs in during week 2 after signup | Week 2 | Early retention signal; if they skip week 2, churn risk is 3x |
| **Step 4 reached** | Project advances to Select & Plan | Within 30 days | Deep engagement — they're using the full methodology |

**Leading indicator of conversion (trial → paid):** Users who complete Steps 1-3 within 14 days convert at 4-5x the rate of users who only create general tickets.

---

## 4. Navigation Architecture

### 4.1 Site Map (All Routes)

```
/                                   → Marketing landing page
/pricing                            → Pricing plans
/login                              → Login
/signup                             → Signup
/verify-email                       → Email verification
/forgot-password                    → Password reset
/onboarding                         → Post-signup wizard
/onboarding/role                    → Role selection
/onboarding/org                     → Org setup
/onboarding/invite                  → Team invite
/onboarding/first-project           → First project prompt

/app                                → App shell (authenticated)
/app/dashboard                      → My Work / Manager dashboard
/app/projects                       → Project list
/app/projects/new                   → Create project
/app/projects/:id                   → Project overview
/app/projects/:id/steps/:stepNum    → PIPS step detail (1-6)
/app/projects/:id/board             → Board/Kanban view
/app/projects/:id/list              → List view
/app/projects/:id/timeline          → Timeline/Gantt view
/app/projects/:id/settings          → Project settings

/app/tickets                        → All tickets (global)
/app/tickets/:id                    → Ticket detail
/app/tickets/new                    → Create ticket

/app/team                           → Team members list
/app/team/:userId                   → Team member profile/workload

/app/analytics                      → Analytics dashboard
/app/analytics/portfolio            → Portfolio/executive view
/app/analytics/reports              → Report builder

/app/forms                          → Form templates library
/app/forms/:id                      → Form detail / builder
/app/forms/:id/responses            → Form responses

/app/notifications                  → Notification center (full page)
/app/search                         → Global search results

/app/settings                       → Settings shell
/app/settings/profile               → User profile
/app/settings/preferences           → User preferences (theme, notifications)
/app/settings/organization          → Org settings (admin only)
/app/settings/users                 → User management (admin only)
/app/settings/roles                 → Role/permission management (admin only)
/app/settings/integrations          → Integration configuration (admin only)
/app/settings/branding              → White-label theming (admin only)
/app/settings/billing               → Subscription/billing (admin only)
/app/settings/security              → SSO, 2FA, policies (admin only)
/app/settings/audit-log             → Audit log (admin only)
/app/settings/api-keys              → API key management (admin only)
```

### 4.2 Sidebar Navigation Structure

```
┌──────────────────────────┐
│  [Logo]    [Org Name]    │
│                          │
│  🏠 Dashboard            │
│  📁 Projects         ▾   │
│     Active (3)           │
│     Completed (2)        │
│     + New Project        │
│  🎫 Tickets              │
│  👥 Team                 │
│  📊 Analytics            │
│  📋 Forms                │
│                          │
│  ─────────────────────   │
│                          │
│  ⚙️ Settings             │
│  ❓ Help & Learning      │
│  💬 Feedback             │
│                          │
│  ─────────────────────   │
│  [User Avatar]           │
│  Marc Albers             │
│  Admin                   │
└──────────────────────────┘
```

- Sidebar is collapsible (icon-only mode) on desktop
- Active item highlighted with left border accent + background tint
- Projects section is expandable with recent/favorited projects listed
- Notification bell and command palette shortcut sit in the top bar, not the sidebar
- Settings is only fully visible to Admin role; other roles see only Profile and Preferences

### 4.3 Mobile Navigation (Bottom Tabs)

```
┌────────┬────────┬────────┬────────┬────────┐
│  Home  │Projects│Tickets │ Team   │  More  │
│  🏠    │  📁    │  🎫    │  👥    │  •••   │
└────────┴────────┴────────┴────────┴────────┘
```

- 5 tabs maximum for thumb-friendly navigation
- "More" tab contains: Analytics, Forms, Settings, Help, Feedback
- Active tab uses filled icon + accent color underline
- Badge on Tickets tab shows count of assigned-to-me overdue items
- Notification bell remains in the top bar on mobile

### 4.4 Command Palette / Quick Actions

**Trigger:** `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)

```
┌─────────────────────────────────────────┐
│  🔍 Search or jump to...               │
│  ─────────────────────────────────────  │
│  RECENT                                 │
│    ACME-142: Collect cycle time data    │
│    Project: Reduce Wait Times           │
│                                         │
│  QUICK ACTIONS                          │
│    + Create new ticket                  │
│    + Create new project                 │
│    📋 Go to my tickets                  │
│    👤 Go to team                        │
│                                         │
│  Type to search tickets, projects,      │
│  people, or forms...                    │
└─────────────────────────────────────────┘
```

- Fuzzy search across: tickets (by ID or title), projects, team members, forms
- Keyboard navigable: arrow keys to select, Enter to open
- Recent items shown by default (last 5 accessed entities)
- Action shortcuts: typing "new ticket" or "create project" triggers creation flows
- Escape to close

---

## 5. Key Screen Descriptions

### 5.1 Dashboard (My Work)

**Layout:**
- Full-width content area with the sidebar collapsed or docked left
- Top bar: Page title ("My Work"), date, notification bell, user avatar, command palette trigger
- Content organized in 4 sections, vertically stacked (2x2 grid on wide screens)

**Components:**
1. **Due Today** (top-left): Card list of tickets due today, sorted by priority. Each card shows: ticket ID, title, project name, priority badge, assignee avatar (self). Click → ticket detail. Empty state: "Nothing due today — nice work."
2. **In Progress** (top-right): Tickets currently in "In Progress" status. Same card format. Drag-to-reorder for personal prioritization.
3. **PIPS Project Progress** (bottom-left): Compact cards for each active PIPS project showing: project name, current step (e.g., "Step 3: Generate"), progress bar (steps 1-6), days since last activity. Click → project view.
4. **Recent Activity** (bottom-right): Feed of recent events: ticket assignments, comments mentioning you, status changes on your tickets, PIPS step completions. Timestamp + actor + action format.

**Manager Toggle:**
- Toggle switch in top bar: "My Work" ↔ "Manager View"
- Manager View replaces sections with: Team Workload Heatmap, Overdue Tickets by Assignee, Project Status Summary, Blocked Items

**Key Actions:**
- "+ New Ticket" floating action button (bottom-right on mobile, top bar on desktop)
- Click any item to navigate to its detail view

---

### 5.2 PIPS Project View (6-Step Workflow)

**Layout:**
- Header: Project name, project lead avatar, status badge (Active/Completed/On Hold), settings gear
- Below header: Horizontal step indicator — 6 connected circles labeled with step names
  - Completed steps: filled circle with checkmark, green
  - Current step: filled circle, pulsing accent color
  - Future steps: outline circle, gray
  - Click any completed or current step to navigate to it
- Main content: Depends on which step is selected (see 5.3 for step detail)
- Right sidebar (collapsible): Project info panel
  - Team members (avatars + roles)
  - Key dates (created, target completion)
  - Project metrics (tickets total, completed, overdue)
  - Quick links: Board view, Timeline, Reports

**Key Actions:**
- "Mark Step Complete" button (visible only on current step, for project lead/manager)
- "Add Team Members" link in sidebar
- "Export Project" dropdown (PDF summary, CSV data)
- Breadcrumb: Projects > [Project Name] > [Step Name]

---

### 5.3 Step Detail (e.g., Step 2: Analyze)

**Layout:**
- Step header: Step number + name, status (In Progress / Complete), description
- Methodology guidance panel (collapsible left panel, ~300px):
  - "What is root cause analysis?"
  - "When to use each tool"
  - Tips and examples
  - Links to deeper learning content
- Tool tabs (center, full remaining width):
  - Tab bar: Fishbone | 5-Why | Force-Field | Data Forms
  - Active tab content fills the workspace
- Step outputs summary (bottom bar, sticky):
  - Shows key outputs so far (e.g., "12 root causes identified, 3 analyzed with 5-why")
  - "Mark Step Complete" button (right-aligned)

**Tool-Specific Content (Fishbone example):**
- Interactive canvas (zoomable, pannable)
- Central spine with problem statement from Step 1
- 6 category branches (customizable labels)
- Click branch → add cause (text input inline)
- Causes show contributor avatar and timestamp
- Color coding: each contributor gets a consistent color
- Toolbar: Zoom in/out, fit to screen, export as image, full-screen mode

**Key Actions:**
- Add content (causes, ideas, data) depending on the tool
- Switch between tools via tabs
- Toggle methodology guidance panel
- Export step outputs
- Navigate between steps via the step indicator in the header

---

### 5.4 Ticket Detail

**Layout:**
- Full-page view with breadcrumb: Projects > [Project] > [Ticket ID]
- Two-column layout on desktop; single column on mobile

**Left Column (65% width):**
1. **Title** — Editable inline (click to edit)
2. **Description** — Rich text editor (Markdown support, inline images, code blocks)
3. **Activity Feed** — Chronological list of:
   - Comments (with @mention support, rich text)
   - Status changes ("Sarah moved this to In Review — 2 hours ago")
   - Assignment changes
   - File attachments
4. **Comment input** — Rich text box at bottom, "@" triggers mention autocomplete, file drag-and-drop

**Right Column (35% width) — Metadata Panel:**
- Status: Dropdown (To Do / In Progress / In Review / Done)
- Assignee: Avatar + name, click to change
- Reviewer: Avatar + name (optional)
- Priority: Badge (Low / Medium / High / Critical)
- Due date: Date picker
- Labels: Tag chips, click to add/remove
- Project: Link to parent project
- PIPS Step: If linked to a PIPS step, shows "Step 5: Implement"
- Parent ticket: Link (if child ticket)
- Child tickets: List of sub-tickets with status badges
- Related tickets: Links (blocks / blocked by / relates to)
- Created: Timestamp + creator
- Updated: Timestamp

**Key Actions:**
- Edit any metadata field inline
- Add comment
- Attach file (drag-and-drop or file picker)
- Change status (also available as prominent buttons: "Start Work", "Submit for Review", "Mark Done")
- Delete ticket (Admin/creator only, with confirmation)
- Copy ticket link

---

### 5.5 Board / Kanban View

**Layout:**
- Top bar: Project name, view switcher (Board | List | Timeline), filter bar
- Filter bar: Assignee (multi-select), Priority, Labels, Due date range, Search
- Main content: Horizontal scrolling columns

**Columns (default):**
| To Do | In Progress | In Review | Done |
- Each column: header with count, "+" button to quick-add a ticket
- Tickets rendered as cards:
  - Ticket ID + Title (truncated)
  - Priority badge (color-coded)
  - Assignee avatar (bottom-right)
  - Due date (red if overdue)
  - Label chips (max 2 visible, "+N" if more)
- Drag-and-drop between columns (triggers status change)
- Drag-and-drop within columns (reorder)
- Click card → opens ticket detail (slide-over panel or full page)

**Swimlanes (optional):**
- Group by: Assignee, Priority, PIPS Step, Label
- Each swimlane is a collapsible horizontal row of columns

**Key Actions:**
- Drag-and-drop to change status or reorder
- Quick-add ticket in any column
- Filter and group
- Bulk select (checkbox on cards) → bulk actions (assign, set priority, move)

---

### 5.6 Project List

**Layout:**
- Top bar: "Projects" title, "+ New Project" button, view toggle (Card | Table), search bar
- Filter tabs: All | Active | Completed | On Hold

**Card View (default):**
- Grid of project cards (3 per row on desktop, 1 on mobile)
- Each card:
  - Project name (bold)
  - Project type badge: "PIPS" or "General"
  - Current step indicator (PIPS only): "Step 3: Generate"
  - Progress bar (Steps 1-6 for PIPS; % complete for General)
  - Team member avatars (max 4, "+N" overflow)
  - Last activity timestamp
  - Star icon to favorite (favorited projects appear in sidebar)

**Table View:**
- Columns: Name, Type, Status, Current Step, Progress, Lead, Team Size, Last Activity, Created
- Sortable by any column
- Row click → project detail

**Key Actions:**
- Create new project
- Search/filter projects
- Favorite/unfavorite
- Archive completed projects
- Bulk actions (for admin): Archive, Delete, Change lead

---

### 5.7 Team View

**Layout:**
- Top bar: "Team" title, "+ Invite Members" button, search bar
- Two sub-views (tabs): Members | Workload

**Members Tab:**
- Table: Avatar, Name, Email, Role, Department, Last Active, Status
- Click row → member profile (see their assigned tickets, projects, activity)
- Action menu per row: Change role, Deactivate, Remove (admin only)

**Workload Tab:**
- Heatmap grid: Team members (rows) × Days of week or sprint (columns)
- Cell color intensity indicates ticket count/effort
- Click cell → see specific tickets for that person on that day
- Summary bar per person: Total assigned, In Progress, Overdue
- "Rebalance" suggestion: System highlights overloaded members and underloaded ones

**Key Actions:**
- Invite new members
- Change roles
- View individual workload
- Reassign tickets via drag-and-drop from workload view

---

### 5.8 Admin Settings

**Layout:**
- Left navigation (vertical tabs within settings page):
  - Profile, Preferences, Organization, Users, Roles, Integrations, Branding, Billing, Security, Audit Log, API Keys
- Right content area: Form/table for selected section

**Organization Section:**
- Org name, logo upload, default time zone, work week days, fiscal year start
- Danger zone: Delete organization (requires re-authentication + type org name to confirm)

**Users Section:**
- User table with status badges (Active, Invited, Deactivated)
- Bulk invite button → modal with email list + role assignment
- CSV import button
- Per-user actions: Edit role, Deactivate, Remove

**Integrations Section:**
- Card grid of available integrations (Jira, Azure DevOps, Slack, Teams, Email, Webhooks)
- Each card: Integration logo, name, status (Connected / Not configured), "Configure" button
- Configuration flow: OAuth for Jira/Azure DevOps, webhook URL for Slack/Teams, SMTP settings for email

**Billing Section:**
- Current plan card: Plan name, price, seats used/total, renewal date
- Usage summary: Projects, users, storage
- "Upgrade" / "Change Plan" button → plan comparison modal
- Invoice history table with download links

**Key Actions:**
- All settings are saved on change (no global "Save" button — each field auto-saves with a subtle confirmation toast)
- Dangerous actions require confirmation modals
- Admin actions are logged to audit log automatically

---

## 6. Empty States & First-Use

### 6.1 Dashboard (My Work) — Empty

**What the user sees:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│        [Illustration: person at desk, relaxed]      │
│                                                     │
│        Welcome to PIPS 2.0, Sarah!                  │
│                                                     │
│        Your work dashboard is where you'll see      │
│        your tickets, project progress, and          │
│        team activity. Let's get started.             │
│                                                     │
│        ┌──────────────────────────────────┐         │
│        │  Create Your First Project  →    │         │
│        └──────────────────────────────────┘         │
│                                                     │
│        or  Invite your team first                   │
│        or  Explore a sample project                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design principles:**
- Warm, personal greeting using the user's first name
- Brief explanation of what will populate this page
- Primary CTA: Create first project (aligns with aha moment path)
- Secondary CTAs: Invite team, explore sample project
- Illustration is friendly and non-generic — shows the PIPS brand personality

---

### 6.2 Project List — Empty

**What the user sees:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Projects                     [+ New Project]       │
│                                                     │
│        [Illustration: 6 connected steps]            │
│                                                     │
│        No projects yet                              │
│                                                     │
│        PIPS projects guide you through 6 steps      │
│        to solve recurring problems. Each step       │
│        builds on the last — from defining the       │
│        problem to measuring results.                │
│                                                     │
│        ┌────────────────────────────────────┐       │
│        │   Start a PIPS Project  →          │       │
│        └────────────────────────────────────┘       │
│        ┌────────────────────────────────────┐       │
│        │   Start a General Project  →       │       │
│        └────────────────────────────────────┘       │
│                                                     │
│        💡 Tip: PIPS projects are best for           │
│        recurring problems. Use general projects     │
│        for one-time initiatives.                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 6.3 Ticket Board — Empty

**What the user sees:**
```
┌──────────┬──────────┬──────────┬──────────┐
│  To Do   │In Progress│In Review │  Done    │
│  (0)     │  (0)     │  (0)     │  (0)     │
│          │          │          │          │
│  ┌────┐  │          │          │          │
│  │ +  │  │          │          │          │
│  │Add │  │          │          │          │
│  │task │  │          │          │          │
│  └────┘  │          │          │          │
│          │          │          │          │
│  No tickets yet.    │          │          │
│  Create a ticket    │          │          │
│  to track work for  │          │          │
│  this project.      │          │          │
└──────────┴──────────┴──────────┴──────────┘
```

- The "+" card in the To Do column is interactive — clicking it opens the ticket creation form inline
- The empty state message is in the To Do column only, not across the whole board
- If this is a PIPS project and Step 4 has been completed, suggest: "Generate tickets from your implementation plan?"

---

### 6.4 Team Page — Empty

**What the user sees:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Team                         [+ Invite Members]    │
│                                                     │
│        [Illustration: people connected]             │
│                                                     │
│        Your team is just you — for now              │
│                                                     │
│        PIPS works best with your team. Process      │
│        improvement is a collaborative effort —      │
│        invite the people who do the work, not       │
│        just the managers.                           │
│                                                     │
│        ┌──────────────────────────────────┐         │
│        │  Invite Team Members  →          │         │
│        └──────────────────────────────────┘         │
│                                                     │
│        Tip: Start with 3-5 people who know the      │
│        process you're trying to improve.            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 6.5 Analytics — Empty

**What the user sees:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Analytics                                          │
│                                                     │
│        [Illustration: chart growing over time]      │
│                                                     │
│        Analytics will appear as you work            │
│                                                     │
│        Once you have active projects and tickets,   │
│        you'll see:                                  │
│                                                     │
│        📈 Project progress over time                │
│        📊 Ticket completion rates                   │
│        ⏱️ Cycle time and velocity trends            │
│        💰 ROI tracking per PIPS project             │
│                                                     │
│        Data starts building from your first         │
│        completed ticket.                            │
│                                                     │
│        ┌──────────────────────────────────┐         │
│        │  Go to Projects  →               │         │
│        └──────────────────────────────────┘         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 6.6 Empty State Design Principles

1. **Educate:** Every empty state explains what will eventually populate this view and why it matters.
2. **Motivate:** Show the user what success looks like (hint at the data/visuals they'll see).
3. **Activate:** Exactly one primary CTA that takes the user to the next logical step.
4. **Don't block:** Empty states never prevent navigation. The user can always go somewhere else.
5. **Disappear gracefully:** As soon as there's 1+ item, the empty state vanishes with no transition jank.
6. **Custom per role:** Team members who were invited see "Your manager is setting things up — check back soon or explore the sample project" instead of "Create your first project."

---

## 7. Notification UX

### 7.1 Notification Types

| Type | Trigger | Priority | Default Delivery |
|------|---------|----------|-----------------|
| **Assignment** | Ticket assigned to you or you're added to a project | High | In-app + email |
| **Status Change** | A ticket you're watching changes status | Medium | In-app |
| **@Mention** | Someone mentions you in a comment | High | In-app + email |
| **Comment** | New comment on a ticket you're assigned to or watching | Medium | In-app |
| **Due Date Reminder** | Ticket due in 24 hours / Ticket overdue | High | In-app + email |
| **PIPS Step Prompt** | A PIPS step requires your input (brainstorming, voting) | Medium | In-app + email |
| **Step Completed** | A PIPS step is marked complete on a project you're on | Low | In-app |
| **Weekly Digest** | Summary of week's activity across your projects | Low | Email only (Monday 8 AM local) |
| **System** | Maintenance, new features, security alerts | Low | In-app |

### 7.2 In-App Notification Bell

**Location:** Top bar, right side, next to user avatar
**Behavior:**
- Red badge with unread count (shows "9+" if more than 9)
- Click → dropdown panel (max 10 recent, "View all" link to full page)
- Each notification: icon + actor avatar + action text + timestamp + unread dot
- Click notification → navigates to relevant entity (ticket, project, step)
- "Mark all as read" button at top of dropdown
- Notifications grouped by time: Today, Yesterday, This Week, Earlier

**Full notification page (`/app/notifications`):**
- Filter by type (Assignment, Mention, Due Date, etc.)
- Filter by read/unread
- Paginated list with 50 per page
- Bulk actions: Mark selected as read, Delete

### 7.3 Email Notification Preferences

**Location:** Settings → Preferences → Notifications

```
Notification Preferences
─────────────────────────────────────────

                        In-App    Email
Assigned to me           ✅        ✅
@Mentioned               ✅        ✅
Ticket status change     ✅        ☐
New comment              ✅        ☐
Due date reminder        ✅        ✅
PIPS step needs input    ✅        ✅
Step completed           ✅        ☐
Weekly digest            n/a       ✅

─────────────────────────────────────────
Quiet hours: ☐ Enable (suppress email 10 PM - 8 AM local)
```

- In-app notifications cannot be fully disabled (assignments and mentions always show)
- Email notifications are fully configurable per type
- "Unsubscribe" link in every email → goes to this settings page

### 7.4 @Mention Behavior

- Type `@` in any comment or description field → autocomplete dropdown of team members
- Search by first name, last name, or email
- `@` + select user → inserts `@First Last` as a styled chip (blue text, clickable to profile)
- Mentioned user receives a notification with the comment text and a direct link
- `@channel` or `@team` → mentions all members of the project team
- Mentions work in: ticket comments, ticket descriptions, PIPS step notes
- Mentions do NOT work in: ticket titles, project names (these are not rich text)

---

## 8. Error & Edge Cases

### 8.1 Form Validation Patterns

**Approach:** Inline validation, displayed on blur (not on every keystroke), plus full validation on submit.

**Visual pattern:**
- Error: Red border on field + red error text below field
- Warning: Amber border + amber text (e.g., "This title is very long — it may get truncated in list views")
- Success: No border change (clean field = valid)

**Specific validations:**
| Field | Rule | Error Message |
|-------|------|--------------|
| Email | Valid format, not already registered | "Please enter a valid email address" / "An account with this email already exists" |
| Password | 8+ chars, 1 uppercase, 1 number | "Password must be at least 8 characters with 1 uppercase letter and 1 number" |
| Ticket title | Required, 1-200 chars | "Title is required" / "Title must be under 200 characters" |
| Project name | Required, 1-100 chars, unique within org | "A project with this name already exists" |
| Due date | Must be today or future | "Due date cannot be in the past" |
| File upload | Max 25MB, allowed types | "File exceeds 25MB limit" / "File type not supported. Allowed: PDF, DOC, XLS, PNG, JPG" |
| @Mention | Must match an existing team member | No error — simply doesn't resolve. Treated as plain text. |

**Submit behavior:**
- If validation errors exist on submit, scroll to first error field, focus it, show all errors
- Submit button shows loading spinner during API call
- Disable button during submission to prevent double-submit

---

### 8.2 API Error Display

**Transient errors (network issues, server 500s):**
```
┌─────────────────────────────────────────┐
│  ⚠ Something went wrong                │
│  We couldn't save your changes.         │
│  [Try Again]   [Dismiss]                │
└─────────────────────────────────────────┘
```
- Displayed as a toast notification (bottom-right, auto-dismiss after 8 seconds if user takes no action)
- "Try Again" retries the exact same API call
- Automatic retry for GET requests: retry 2x with exponential backoff before showing error

**Authorization errors (403):**
- Inline message in the relevant area: "You don't have permission to perform this action. Contact your admin."
- Do not show a generic error page — keep the user in context

**Not found (404):**
- Full-page: "This page doesn't exist. It may have been deleted or you may have followed an outdated link."
- CTA: "Go to Dashboard" button

**Rate limiting (429):**
- Toast: "You're making changes too quickly. Please wait a moment and try again."
- Auto-retry after delay specified in response header

---

### 8.3 Offline Behavior

**Detection:**
- Monitor `navigator.onLine` and periodic heartbeat fetch to `/api/health`
- When offline detected, show persistent banner at top of screen:

```
┌─────────────────────────────────────────────────────────────┐
│  📡 You're offline. Changes will be saved when you reconnect.│
└─────────────────────────────────────────────────────────────┘
```

**Behavior while offline:**
- Read: Cached pages remain viewable (service worker caches last-visited views)
- Write: Comment and status changes queued in IndexedDB
- Queue indicator: Show pending changes count in the banner: "3 changes pending sync"
- On reconnect: Auto-sync queued changes, show success toast: "All changes synced"
- Conflict resolution: If someone else modified the same entity while you were offline, show a merge dialog: "This ticket was updated while you were offline. [Keep yours] [Keep theirs] [View diff]"

**MVP scope:** For MVP, offline behavior is limited. Banner is shown, but writes are blocked with message: "You need an internet connection to make changes. Read-only mode active."

---

### 8.4 Session Timeout

**Active session:** 8 hours of inactivity triggers timeout.
**Remember me:** 30-day persistent session (refreshed on each visit).

**Timeout flow:**
1. 5 minutes before timeout: Modal appears — "Your session is about to expire. [Stay logged in] [Log out]"
2. If no action: Session expires, user sees login page
3. Any unsaved work (draft comment in progress): Saved to localStorage, restored after re-login
4. Deep link preservation: After re-login, user returns to the exact page they were on

---

### 8.5 Permission Denied

**Scenario:** User navigates to a URL they don't have access to (e.g., Member visits `/app/settings/security`).

**Behavior:**
- Do NOT show the page content and then an error. Instead, replace the content area with:
```
┌─────────────────────────────────────────┐
│                                         │
│  🔒 Access Restricted                  │
│                                         │
│  You don't have permission to view      │
│  this page. If you think this is        │
│  an error, contact your admin.          │
│                                         │
│  [Go to Dashboard]                      │
│                                         │
└─────────────────────────────────────────┘
```
- Sidebar remains visible and functional — the user is not locked out of the app
- Admin-only sidebar items are hidden from non-admin users (so this case should be rare; it mainly catches direct URL access)

---

### 8.6 Concurrent Editing

**Scenario:** Two users edit the same ticket description simultaneously.

**Approach: Last-write-wins with notification**

1. When user A opens a ticket, the client establishes a presence channel (WebSocket or polling)
2. If user B is also viewing, both see: "Also viewing: [Avatar B]" indicator in the ticket header
3. If user A saves a change, user B's view receives a real-time update:
   - If user B has NOT started editing: The new content simply appears
   - If user B HAS started editing: A banner appears above the editor:
     "Sarah just updated this description. [Load their changes] [Keep editing yours]"
   - "Load their changes" replaces B's draft with A's saved version
   - "Keep editing yours" keeps B's draft; on save, B's version overwrites A's (with A notified)
4. Full edit history is preserved (ticket audit log shows all versions)

**For PIPS collaborative tools (fishbone, brainstorming):**
- These are designed for concurrent editing — additions don't conflict
- Real-time sync via WebSocket: new items appear immediately for all viewers
- Deletes/edits trigger a brief lock on the specific item (2-second optimistic lock)

---

## 9. Responsive Design

### 9.1 Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Desktop | >= 1280px | Sidebar + full content area, 2-column layouts |
| Tablet | 768px - 1279px | Collapsed sidebar (icon-only), simplified content |
| Mobile | < 768px | No sidebar (bottom tab nav), single-column, stacked layouts |

### 9.2 Major View Adaptations

**Dashboard:**
- Desktop: 2x2 grid of sections
- Tablet: 2x2 grid, smaller cards
- Mobile: Single column stack (Due Today → In Progress → PIPS Projects → Activity)

**Board/Kanban:**
- Desktop: All 4 columns visible, horizontal scroll for many tickets
- Tablet: 2 columns visible, horizontal swipe for more
- Mobile: Single column visible, swipe left/right between columns, column selector tabs at top

**PIPS Project View (6-step indicator):**
- Desktop: Full horizontal step bar with labels
- Tablet: Full horizontal step bar with abbreviated labels
- Mobile: Current step prominently shown with left/right arrows to navigate; full step list in a dropdown

**Ticket Detail:**
- Desktop: 2-column (content left, metadata right)
- Tablet: 2-column, narrower metadata panel
- Mobile: Single column — metadata shown as a collapsible section above the activity feed

**Fishbone Diagram:**
- Desktop: Full interactive canvas with drag-and-drop
- Mobile: Read-only view with zoom/pan; editing via a simplified list interface ("Add cause to [category]")

**Decision Matrix:**
- Desktop: Full table with all criteria columns
- Mobile: Card-per-idea view with swipeable criteria scores

### 9.3 Touch-Friendly Patterns

- Minimum tap target: 44x44 pixels (iOS HIG standard)
- Swipe gestures:
  - Swipe ticket card left → quick actions (assign, priority, delete)
  - Swipe between board columns
  - Pull-to-refresh on list views
- Long-press: Opens context menu (same as right-click on desktop)
- No hover-dependent UI: Tooltips and hover previews replaced with tap-to-expand on mobile
- Bottom sheets: Used instead of modals for actions on mobile (easier thumb reach)

### 9.4 Desktop-Only Features (MVP)

These features are desktop-only in MVP; mobile support added in later releases:

- **Fishbone diagram editing** (read-only on mobile)
- **Gantt/Timeline view** (replaced with list + milestone view on mobile)
- **Bulk ticket operations** (select multiple, bulk assign/move)
- **Command palette** (Ctrl+K)
- **CSV import/export** (admin function)
- **White-label branding configuration** (admin function)
- **Decision matrix full table view** (card view on mobile)

---

## 10. Onboarding System

### 10.1 Contextual Tooltips

Tooltips appear as small popovers anchored to UI elements, triggered by specific user states (not by page load).

**Tooltip Design:**
```
┌──────────────────────────────────┐
│  Step indicator                  │
│                                  │
│  This shows your project's       │
│  progress through the 6 PIPS     │
│  steps. Click any completed      │
│  step to review its outputs.     │
│                                  │
│  [Got it]          2 of 8        │
└──────────────────────────────────┘
      ▼ (pointer to UI element)
```

**Tooltip placement rules:**
- Maximum 1 tooltip visible at a time
- Tooltip appears on first visit to a view, not on every visit
- "Got it" dismisses and advances to next tooltip (if in a sequence)
- "Skip tour" link dismisses all remaining tooltips
- Progress indicator (e.g., "2 of 8") for multi-step tours
- Dismissed state persisted per user (won't reshow after dismissal)

**Tooltip triggers and locations:**

| Trigger | Location | Content |
|---------|----------|---------|
| First visit to dashboard | "My Work" header | "This is your personal dashboard. You'll see your assigned tickets and project progress here." |
| First visit to project list | "+ New Project" button | "Click here to start your first improvement project." |
| First time opening a PIPS project | Step indicator bar | "These are the 6 steps of the PIPS methodology. You'll work through them left to right." |
| First time on Step 1 (Identify) | Transformation card area | "This is where the magic happens. Transform vague complaints into measurable problem statements." |
| First time on board view | Column headers | "Drag tickets between columns to change their status. Create new tickets with the + button." |
| First time opening ticket detail | Metadata panel | "Set the priority, assignee, and due date in this panel. Everything saves automatically." |
| First visit to analytics | Chart area | "Charts populate as your team works. Complete a few tickets to see trends emerge." |
| First time @mentioning | Comment box (after typing @) | "Type a name to mention a team member. They'll get a notification with your comment." |

---

### 10.2 Interactive Walkthrough for First PIPS Project

This is the primary onboarding experience and is triggered when a user creates their first PIPS project. It overlays the real UI (not a separate tutorial mode).

**Walkthrough Steps:**

```
Step 1: Name Your Project
━━━━━━━━━━━━━━━━━━━━━━━━
Spotlight: Project name field
Content: "Give your project a name that describes the problem area.
          Example: 'Reduce Order Processing Time'"
User action: Types a project name
Auto-advance: When user fills in name and clicks Continue

Step 2: See the 6 Steps
━━━━━━━━━━━━━━━━━━━━━━━━
Spotlight: Step indicator (full bar)
Content: "Every PIPS project follows these 6 steps.
          You're starting with Step 1: Identify —
          defining the problem clearly."
User action: Clicks "Next"

Step 3: Learn from Examples
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Spotlight: Transformation cards
Content: "See how a vague problem becomes measurable.
          This is the foundation of effective improvement."
User action: Reads example, clicks "Next"

Step 4: Write Your Problem Statement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Spotlight: Problem statement builder form
Content: "Now it's your turn. Fill in these fields —
          don't worry about getting it perfect."
User action: Fills in at least the first 2 fields

Step 5: See Your Result
━━━━━━━━━━━━━━━━━━━━━━━━
Spotlight: Composed problem statement preview
Content: "Look at that — you've already turned a vague
          problem into something actionable. This is
          what PIPS is all about."
User action: Clicks "Save & Continue"

Step 6: What's Next
━━━━━━━━━━━━━━━━━━━
Spotlight: Step 2 circle in the indicator
Content: "Step 2 (Analyze) is where you dig into root
          causes. But first, consider inviting your team —
          they'll have insights you don't."
User action: Clicks "Invite Team" or "Explore on my own"
```

**Walkthrough behavior:**
- Dim overlay (dark scrim) with spotlight cutout on the active element
- Content panel appears near the spotlighted element (auto-positioned to avoid overflow)
- "Back" and "Next" buttons (Back not available on Step 1)
- "Skip walkthrough" link always visible but de-emphasized
- If user navigates away mid-walkthrough, it pauses. On return, prompt: "Continue where you left off?"
- Walkthrough completion tracked as an activation metric

---

### 10.3 Progress Indicators

**Onboarding Checklist (persistent, dismissible):**

A floating card in the bottom-left of the dashboard that tracks onboarding completion:

```
┌──────────────────────────────────────┐
│  Getting Started          70%  ▓▓▓░░│
│                                      │
│  ✅ Create your account              │
│  ✅ Set up your organization         │
│  ✅ Create your first project        │
│  ✅ Write a problem statement        │
│  ☐  Invite a team member             │
│  ☐  Create your first ticket         │
│  ☐  Complete Step 2 (Analyze)        │
│                                      │
│  [Dismiss checklist]                 │
└──────────────────────────────────────┘
```

- Shows on dashboard only (not on every page)
- Auto-completes items as user performs actions (real-time update)
- Progress bar fills with accent color
- Celebration on 100%: "You're all set! You've mastered the basics." + confetti
- Dismiss hides permanently (stored in user preferences)
- Items link to the relevant flow (clicking "Invite a team member" opens the invite modal)

**PIPS Project Progress:**
- Step indicator (1-6) on every project view
- Percentage overlay: "Step 3 of 6 (50%)"
- Each step shows sub-progress: "5 of 8 items completed in this step"

---

### 10.4 Methodology Content as In-App Education

The PIPS methodology has extensive educational content (books, training materials, certification programs). This content is embedded into the product as contextual education, not as a separate learning module.

**Integration points:**

| Location | Content Type | Format |
|----------|-------------|--------|
| Step guidance panel (left sidebar in step view) | What this step is about, why it matters, tips | Short paragraphs with expandable "Learn more" sections |
| Tool instructions (above each analysis tool) | How to use this specific tool (fishbone, 5-why, etc.) | Step-by-step numbered instructions with visual examples |
| Transformation cards (Step 1) | Good vs. bad examples of problem statements | Side-by-side comparison cards |
| Decision matrix help (Step 4) | How to set criteria, how to score, how to interpret results | Inline tooltips on column headers + "How scoring works" expandable |
| Empty states | Methodology context for what belongs in this view | Educational text in empty state messages |
| Loading screens | Methodology tips (while waiting) | "Did you know? The average 5-why analysis reveals the root cause in 3-4 levels." |
| Help panel | Full methodology reference | Searchable knowledge base accessible from "?" icon |

**"Learn More" content structure:**
- Each methodology concept has a 3-tier content depth:
  1. **Inline hint** (1-2 sentences): Shown directly in the UI near the relevant tool
  2. **Expandable section** (1-2 paragraphs): "Learn more" expands below the hint
  3. **Full article** (in Help panel): Deep dive with examples, history, and best practices
- Users who selected "Not familiar with PIPS" in onboarding see tier 1 content by default with prompts to expand
- Users who selected "Certified" see minimal hints with tier 3 accessible on demand
- All content is searchable via the Help panel and command palette

**Methodology content governance:**
- Content is managed as structured data (not hardcoded strings)
- Each piece has: ID, step association, tool association, difficulty level, content tiers
- Content can be updated without code deployment (CMS-backed or database-stored)
- White-label clients can customize methodology content to match their consulting firm's flavor

---

## Appendix: Key UX Principles

1. **Methodology-first, tool-second.** The 6-step PIPS process is the product. The boards, tickets, and forms serve the methodology, not the other way around. Every feature should connect back to a step.

2. **Guide, don't gate.** Users should feel guided through the process, not locked into a rigid sequence. Steps can be revisited, content can be added out of order, but the recommended path is always clear.

3. **Progressive disclosure.** New users see simplified interfaces with education. Power users see full tool sets. The system adapts based on usage patterns, not just role.

4. **Collaboration is visible.** Who's working on what, who contributed each idea, who's online — presence and attribution make the tool feel alive and social, not like a solo spreadsheet.

5. **Quick wins over feature tours.** The aha moment comes from doing real work (writing a problem statement), not from watching a product demo. Every onboarding decision optimizes for time-to-first-value.

6. **Dashboards are answers, not data.** Sarah doesn't want 12 charts. She wants answers: "Is my project on track?" "Who's blocked?" "What's the ROI so far?" Every dashboard element should answer a question.

7. **Respect the expert.** Certified PIPS practitioners bring deep methodology knowledge. The software should amplify their expertise, not patronize them with basics. The education layer is always optional.

8. **Mobile is consumption; desktop is creation.** Mobile users check status, respond to mentions, and update ticket statuses. Desktop users create projects, build fishbone diagrams, and configure integrations. Design accordingly.
