# PIPS 2.0 Planning Review — March 12, 2026

## Executive Summary

PIPS 2.0 has an impressively thorough planning corpus — 24+ planning documents totaling over 25,000 lines, maintained by a structured 11-agent system. The project has shipped a remarkably feature-complete product in approximately 10 days of active development (March 3-9, 2026), going from repository initialization to a live production SaaS with 2,338+ unit tests, 25 E2E spec files, 18 interactive methodology forms, 33 database tables, and 83+ marketing pages.

However, the planning documentation has significant drift from reality. Multiple documents contain contradictory test counts, outdated version references, and phase statuses that lag behind what was actually built. Key features built in the most recent sessions (admin dashboard, tools sandbox, ticket change log, security settings page, swim lane board, forms view/edit toggle, privacy/terms pages) have zero documentation in any planning document.

**Overall Planning Health: 6/10** — The planning foundation is excellent but documentation debt has accumulated rapidly. The post-launch roadmap is well-defined strategically but lacks operational detail for the critical beta-to-revenue transition.

---

## Plan vs Reality Audit

### Features Planned and Built (Confirmed)

| Planned Item            | Plan Source              | Actual Status | Notes                             |
| ----------------------- | ------------------------ | ------------- | --------------------------------- |
| Email/Password Auth     | MVP_SPEC T1-01           | BUILT         | Working with verification, reset  |
| Organization Management | MVP_SPEC T1-02           | BUILT         | RBAC, invitations                 |
| 6-Step PIPS Workflow    | MVP_SPEC T1-06           | BUILT         | 18 interactive forms              |
| Fishbone Diagram        | MVP_SPEC T1-08           | BUILT         | Interactive with categories       |
| Brainstorming Workspace | MVP_SPEC T1-09           | BUILT         | Cards, voting, reduction          |
| Criteria Rating Matrix  | MVP_SPEC T1-10           | BUILT         | Weighted scoring                  |
| Ticketing System        | MVP_SPEC T1-12           | BUILT         | Auto-sequenced IDs                |
| Kanban Board            | MVP_SPEC T1-13           | BUILT         | Drag-and-drop                     |
| Dashboard               | MVP_SPEC T1-15           | BUILT         | Stats, charts, activity feed      |
| Notifications           | MVP_SPEC T1-17           | BUILT         | Bell, dropdown, filters           |
| Knowledge Hub           | DEV_TASK_LIST Phase 2    | BUILT         | 205 content nodes, FTS            |
| Cadence Bar             | DEV_TASK_LIST Phase 2C   | BUILT         | On all 18 forms                   |
| Training Mode           | DEV_TASK_LIST Phase 3    | BUILT         | 4 paths, 27 modules, 59 exercises |
| Marketing Pages         | DEV_TASK_LIST Phase 4    | BUILT         | 83+ SEO pages                     |
| Workshop Facilitation   | DEV_TASK_LIST Phase 5    | BUILT         | Session CRUD, timer, Realtime     |
| Mobile Responsive       | DEV_TASK_LIST WP-6.2/6.3 | BUILT         | 375px verified                    |
| Accessibility           | DEV_TASK_LIST WP-6.4     | BUILT         | ARIA labels, keyboard nav         |
| data-testid Attributes  | DEV_TASK_LIST WP-6.12    | BUILT         | 90+ across 27 files               |
| Security Hardening      | Sprint 0                 | BUILT         | Headers, rate limiting, CSRF      |

### Features Built But NOT in Plans (Undocumented)

| Feature Built                       | Commit    | Documentation Gap                                       |
| ----------------------------------- | --------- | ------------------------------------------------------- |
| Admin Dashboard (settings/admin)    | `93e49c9` | Not in any planning doc                                 |
| Tools Sandbox (/tools)              | `51a5e21` | Standalone tool sandbox with localStorage — not planned |
| Ticket Change Log                   | `85a4a5b` | Audit trail for ticket changes — not in task list       |
| Security Settings (password change) | `85a4a5b` | Change password form — not planned                      |
| Swim Lane Board (by PIPS steps)     | `f910c5b` | Projects grouped by PIPS step — not in task list        |
| Forms View/Edit Toggle              | `1e2b749` | View vs edit mode on PIPS forms — not planned           |
| Privacy Policy Page                 | `0522131` | Legal page — not in any plan                            |
| Terms of Service Page               | `0522131` | Legal page — not in any plan                            |
| Fishbone Diagram Upgrade            | `29d9bcf` | Visual upgrade — not in task list                       |
| Glossary Enhancements               | `29d9bcf` | Accordion cards — not planned                           |
| Guide Visual Polish                 | `2cf29ec` | Book-aligned content — not in task list                 |
| Invite Redirect Fix                 | `1e2b749` | Auth fix — not in bug tracker                           |
| PDF Quality Upgrade                 | `1e2b749` | One-pager improvements — not planned                    |
| Guide Content Data Layer            | Multiple  | `guide-content.ts` (982 lines) in shared package        |

### Features Planned But NOT Built

| Planned Feature                | Plan Source             | Notes                                              |
| ------------------------------ | ----------------------- | -------------------------------------------------- |
| Storybook                      | PRODUCT_ROADMAP Phase 0 | Never set up despite being listed as exit criteria |
| Custom Ticket Statuses         | PRODUCT_ROADMAP Phase 2 | Enum-based only                                    |
| Custom Ticket Types per Org    | PRODUCT_ROADMAP Phase 2 |                                                    |
| Column WIP Limits              | PRODUCT_ROADMAP Phase 2 |                                                    |
| Swimlanes by Assignee/Priority | PRODUCT_ROADMAP Phase 2 | Only PIPS step swim lanes exist                    |
| Inline Editing in List View    | PRODUCT_ROADMAP Phase 2 |                                                    |
| Calendar View                  | PRODUCT_ROADMAP Phase 2 |                                                    |
| Timeline/Gantt View            | PRODUCT_ROADMAP Phase 2 |                                                    |
| File Attachments               | PRODUCT_ROADMAP Phase 2 | Schema columns exist                               |
| Threaded Comment Replies       | PRODUCT_ROADMAP Phase 2 |                                                    |
| MFA/TOTP                       | PRODUCT_ROADMAP Phase 2 |                                                    |
| Stripe Billing                 | PRODUCT_ROADMAP Phase 3 | Schema columns exist                               |
| Custom Report Builder          | PRODUCT_ROADMAP Phase 3 | Basic reports exist                                |
| Public REST API                | PRODUCT_ROADMAP Phase 4 |                                                    |
| Jira/ADO Integration           | PRODUCT_ROADMAP Phase 4 | Schema exists                                      |
| White-Label Theming            | PRODUCT_ROADMAP Phase 5 | Token architecture exists                          |
| SSO/SAML                       | PRODUCT_ROADMAP Phase 5 |                                                    |

---

## Gaps Identified

### 1. No Work Log After March 9 AM

12+ significant commits on March 9 PM including admin dashboard, tools sandbox, ticket change log, security settings, swim lane board, forms view/edit toggle, privacy/terms pages — all undocumented.

### 2. No AGENT_STATUS_BOARD.md

`.claude/rules/multi-agent.md` references this file but it does not exist.

### 3. No Incident Response Plan

No on-call rotation, escalation matrix, severity classification, or communication templates.

### 4. No User Onboarding Instrumentation Plan

No specific instrumentation for the onboarding funnel (signup > org creation > first project > first form > invite).

### 5. No Data Backup/Export for Users

No user-facing data export (GDPR compliance, account data download, org data migration).

### 6. No Performance Benchmarks

No established Lighthouse scores, latency targets, or SLAs.

### 7. No Beta-to-Paid Conversion Strategy

No pricing experiments, trial-to-paid flow design, or willingness-to-pay validation plan.

### 8. No Content Update Workflow

No documented process for updating methodology content without full redeployment.

---

## Outdated Information

| Document                   | Issue                                            | Current Value                             |
| -------------------------- | ------------------------------------------------ | ----------------------------------------- |
| `CLAUDE.md`                | Test count says "1,945+"                         | Actually 2,338+                           |
| `.claude/rules/testing.md` | Test count says "1,945+"                         | Actually 2,338+                           |
| `PROJECT_INDEX.md`         | "Repository: private"                            | Repo is **public**                        |
| `PROJECT_INDEX.md`         | Build shows "896 passing (56 files)"             | 2,338+ tests across 210+ files            |
| `PROJECT_INDEX.md`         | Phase 5/6: "NOT STARTED"                         | Both COMPLETE or nearly                   |
| `MVP_SPECIFICATION.md`     | References "Next.js 15"                          | Actually Next.js 16                       |
| `PRODUCT_ROADMAP.md`       | "Initialize Next.js 15 project"                  | Next.js 16                                |
| `TECHNICAL_PLAN.md`        | "Next.js 15 App Router"                          | Next.js 16                                |
| `SYSTEM_ARCHITECTURE.md`   | Training "[SCAFFOLDED]", Workshop "[SCAFFOLDED]" | Both fully BUILT                          |
| `DEVOPS_RUNBOOK.md`        | "896 passing", "11 migrations"                   | Severely outdated                         |
| `TEST_STRATEGY.md`         | Entire doc based on "896 tests"                  | Needs full refresh                        |
| `ANALYTICS_PLAN.md`        | "No analytics deployed"                          | Vercel Analytics + trackServerEvent exist |

---

## Updated Risk Register

### Active Risks

| #       | Risk                                                                | Severity | Likelihood | Status                         |
| ------- | ------------------------------------------------------------------- | -------- | ---------- | ------------------------------ |
| R2      | **No real users yet** — all testing is developer/agent              | HIGH     | CERTAIN    | UNMITIGATED — highest priority |
| R4      | **No billing integration** — no revenue path                        | MEDIUM   | CERTAIN    | Acceptable for beta            |
| R-NEW-1 | **Documentation drift** — 15+ outdated references                   | MEDIUM   | HIGH       | This review identifies them    |
| R-NEW-2 | **Legal exposure** — Privacy/Terms not reviewed by counsel          | MEDIUM   | MEDIUM     | Review before public beta      |
| R-NEW-3 | **Vercel Hobby limitations** — build timeouts, bandwidth            | LOW      | MEDIUM     | Monitor, upgrade when needed   |
| R-NEW-4 | **GitHub PAT leak** — briefly exposed in March 8 work log           | HIGH     | LOW        | Verify rotation status         |
| R-NEW-5 | **Undocumented features** — no acceptance criteria for 14+ features | LOW      | HIGH       | Retroactively document         |
| R-NEW-6 | **E2E test reliability** — current pass/fail unknown                | MEDIUM   | HIGH       | Run full suite, document       |

---

## Post-Launch Roadmap Recommendation

### Immediate (Before Beta Launch) — P0

1. Run full quality gate (WP-6.9)
2. Run E2E suite against production
3. Manual smoke test by Marc
4. Verify GitHub PAT was rotated
5. Planning cascade to update all docs

### Near-term (Beta + 30 days) — P1

1. Identify and onboard 2-3 beta testers
2. Instrument the onboarding funnel
3. Set up Sentry properly
4. Lighthouse audit (WP-6.8) and establish performance baseline
5. Create incident response plan

### Medium-term (Beta + 60-90 days) — P2

1. Collect and analyze beta feedback
2. Make pricing decisions
3. Begin Stripe integration
4. Prioritize "remaining Phase 2" features based on demand
5. Legal review of Privacy Policy and Terms

### Long-term (6+ months) — P3

| Phase                 | Content                          | Prerequisite        |
| --------------------- | -------------------------------- | ------------------- |
| Phase 7: Analytics    | 28 events, internal dashboards   | Real users          |
| Phase 8: Billing      | Stripe checkout, subscriptions   | Pricing decisions   |
| Phase 9: Integrations | Jira, Azure DevOps, REST API     | Billing active      |
| Phase 10: Enterprise  | White-label, SSO, data residency | Enterprise pipeline |
| Phase 11: AI          | Enhanced coaching, predictions   | Data volume         |

---

## Consolidated Timeline

### What Happened

| Date             | Event                                                         |
| ---------------- | ------------------------------------------------------------- |
| March 2, 2026    | Planning phase; 15+ agents; 13 planning documents             |
| March 3, 2026    | Sprint 0-7; MVP shipped; 878 unit tests                       |
| March 4, 2026    | Phases 1.5-5 built; tests to 1,536                            |
| March 8, 2026    | Git migration, CI fix, Sprint 0 hardening, data-testid        |
| March 8-9, 2026  | Overnight: analytics, performance, marketing audit, seed data |
| March 9, 2026 AM | Test expansion to 2,274+                                      |
| March 9, 2026 PM | Admin dashboard, tools sandbox, 12+ commits (undocumented)    |
| March 12, 2026   | Privacy/terms pages, critical review, planning review         |

### What's Left to Beta

| Item                                       | Effort          | Priority |
| ------------------------------------------ | --------------- | -------- |
| Fix critical security issues (from review) | 2-3 hours       | P0       |
| Planning cascade (update all docs)         | 4-6 agent-hours | P0       |
| Lighthouse audit (WP-6.8)                  | 1-2 hours       | P1       |
| Final quality gate (WP-6.9)                | 1 hour          | P0       |
| Manual smoke test by Marc                  | 30 minutes      | P0       |
| Beta tester identification                 | Marc decision   | P0       |
| **Total to beta launch**                   | **~1 day**      |          |
