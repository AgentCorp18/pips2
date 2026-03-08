# PIPS 2.0 Full Project Plan

> **Version:** 1.1 — Updated 2026-03-04
> **Owner:** Project Manager Agent (Control Tower)
> **Created:** March 3, 2026
> **Author:** Marc Albers + Claude Opus 4.6
> **Status:** Active — 63% of post-MVP work packages complete
> **Production URL:** https://pips-app.vercel.app
> **Repository:** AgentCorp18/pips2 (private)
> **Supabase Project:** `cmrribhjgfybbxhrsxqi` (us-east-2)
>
> **v1.1 changes (2026-03-04):**
>
> - Full status sync: Phases 1.5 through 4 marked COMPLETE with commit references
> - Phase 5 (Workshop) promoted to NEXT PRIORITY with detailed work breakdown
> - Phase 6 (Polish) updated with dependencies on Phase 5 completion
> - Post-launch phases added (Analytics Instrumentation, Billing, Integrations)
> - Risk register synthesized from all 9 agent reports
> - Agent assignment recommendations for remaining work
> - Critical path and dependency analysis updated
> - Planning cascade results incorporated
> - New sections: Success Criteria, Timeline Estimates, Quality Gates Per Phase

**START HERE for all post-MVP work.** This document is the single source of truth for what has been built, what remains, and in what order it should be executed.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Phase Completion Status](#2-phase-completion-status)
3. [Remaining Work — Phase 5: Workshop Facilitation](#3-remaining-work--phase-5-workshop-facilitation)
4. [Remaining Work — Phase 6: Polish & Quality](#4-remaining-work--phase-6-polish--quality)
5. [Post-Launch Phases](#5-post-launch-phases)
6. [Critical Path and Dependencies](#6-critical-path-and-dependencies)
7. [Agent Assignment Recommendations](#7-agent-assignment-recommendations)
8. [Risk Register](#8-risk-register)
9. [Quality Gates Per Phase](#9-quality-gates-per-phase)
10. [Timeline Estimates](#10-timeline-estimates)
11. [Success Criteria](#11-success-criteria)

---

## 1. Executive Summary

PIPS 2.0 is a multi-tenant SaaS web application that embeds the PIPS 6-step process improvement methodology into enterprise-grade project management and ticketing software. The platform is live at **https://pips-app.vercel.app** and runs on Next.js 16, TypeScript (strict), Supabase, and Vercel.

### Where We Stand

**63% of post-MVP work packages are complete** (37 of 59 defined in `DEVELOPMENT_TASK_LIST.md`). All critical path work through Phase 4 is done. The product has a full methodology workflow, content ecosystem, training system, and marketing presence. Two phases remain before the product is feature-complete for beta launch.

### Build Metrics

| Metric          | Value                                                               |
| --------------- | ------------------------------------------------------------------- |
| Unit tests      | 896 passing (56 files)                                              |
| E2E tests       | 160 specs (18 files)                                                |
| Type errors     | 0                                                                   |
| Lint errors     | 0 (20 warnings)                                                     |
| PIPS forms      | 18 interactive methodology forms                                    |
| DB migrations   | 11 applied to production                                            |
| Content nodes   | 205 seeded with full-text search                                    |
| Training data   | 4 paths, 27 modules, 59 exercises                                   |
| Marketing pages | 83+ SEO-optimized pages                                             |
| Knowledge Hub   | 4 pillars (Book, Guide, Workbook, Workshop), Cadence Bar integrated |

### MVP Features (All COMPLETE)

- Email/password auth with verification and password reset
- Organization management with RBAC (5 roles: Owner, Admin, Manager, Member, Viewer)
- Complete 6-step PIPS workflow with guided prompts and completion criteria
- 18 interactive digital forms across all 6 methodology steps
- Ticketing system: Kanban board, list view, parent/child tickets, comments, @mentions
- Dashboard with project health metrics, projects-by-step chart, recent activity
- Command palette (Cmd/Ctrl+K), global search, notification system
- Team management, invitation system, dark mode, CSV/PDF export
- Audit logging, branded email templates, Sentry error tracking, Vercel Analytics
- Sample project feature for onboarding

### Post-MVP Features (All COMPLETE through Phase 4)

- Knowledge Hub: 205 content nodes, full-text search, reading experience, bookmarks, read history
- Cadence Bar: contextual methodology content on all 18 forms, ticket detail, and dashboard
- Training Mode: 4 learning paths, 27 modules, 59 exercises, progress tracking, exercise components
- Marketing & SEO: 83+ pages (6 step, 22 tool, 20 book preview, 35 glossary, 17 templates), sitemap, robots.txt, JSON-LD structured data

---

## 2. Phase Completion Status

### Phase 0: Foundation — COMPLETE

Infrastructure, design system, auth, multi-tenancy, database schema. All exit criteria met.

### Phase 1: MVP — COMPLETE

Full 6-step PIPS workflow, ticketing, dashboard, team management, RBAC. Live since March 3, 2026. 878 unit tests, 160 E2E tests, 0 type errors.

**Notable:** Several Phase 2 features were pulled forward into MVP delivery (Kanban, parent/child tickets, notifications, search, dark mode, audit log, CSV/PDF export).

### Phase 1.5: Stabilization — COMPLETE

**Commit:** `85506c3` (2026-03-04)

All 11 stabilization bugs fixed:

| Bug ID | Description                                                  | Status |
| ------ | ------------------------------------------------------------ | ------ |
| S-01   | RLS data loading failure (empty dashboard/projects/tickets)  | FIXED  |
| S-02   | User profile identity broken (wrong initials, blank profile) | FIXED  |
| S-03   | Project detail pages return 404                              | FIXED  |
| S-04   | Ticket creation redirect not working                         | FIXED  |
| S-05   | React hydration errors on multiple pages                     | FIXED  |
| S-06   | Audit log shows "System" for all actor names                 | FIXED  |
| S-07   | Profile display name not persisting                          | FIXED  |
| S-08   | No success feedback after form saves                         | FIXED  |
| S-09   | Landing page nav links scroll to wrong positions             | FIXED  |
| S-10   | App 404 page shows unstyled default                          | FIXED  |
| S-11   | Form validation errors not clearing on re-submit             | FIXED  |

**Open items from stabilization:**

| Item                                   | Status      | Notes                                       |
| -------------------------------------- | ----------- | ------------------------------------------- |
| WP-S6: Fix 47 failing E2E selectors    | NOT STARTED | Specs written from source, not rendered DOM |
| WP-S7: Manual smoke test on production | NOT STARTED | PM-mandated phase gate                      |

### Phase 2A: Knowledge Hub Foundation — COMPLETE

**Commit:** `8c3b012` (2026-03-04)

- Content taxonomy types defined (419 lines, 20 chapter mappings)
- Database migration applied (10 tables created with RLS and GIN indexes)
- Content compiler run (205 nodes: 21 chapters + 184 sections)
- Content seeder run (FTS verified: fishbone, brainstorming, implementation queries all return results)

### Phase 2B: Reading Experience — COMPLETE

**Commit:** `7ec1a48` (2026-03-04)

- ContentReader wired to database with react-markdown rendering
- Guide step pages (6 pages), guide tool pages (22+ pages)
- Workbook step pages (6 pages), workshop module pages
- Interactive search with debounced input and pillar-grouped results
- Bookmarks CRUD with optimistic UI
- Read history tracking with "Recently Read" on hub landing
- Book sidebar navigation (TOC, prev/next chapter)
- 46 new unit tests for Knowledge Hub

### Phase 2C: Cadence Bar Integration — COMPLETE

**Commit:** `0358558` (2026-03-04)

- Cadence Bar integrated into all 18 PIPS form pages via form-shell.tsx
- Cadence Bar on ticket detail (when ticket linked to PIPS step)
- Cadence Bar on dashboard (overview content)
- Collapsible, no layout shift on load

### Phase 3: Training Mode — COMPLETE

**Commits:** `ca51d93` (seed data), `64b2a03` (landing/path/progress), `6851176` (modules/exercises)

- Seed script: 4 paths, 27 modules, 59 exercises (idempotent upsert)
- Training landing page wired to database
- Path detail pages with module listing and progress
- Module detail pages with exercise rendering
- Exercise components: multiple-choice, fill-form, reflection, scenario-practice
- Progress tracking: module completion, path percentage
- Progress dashboard page

### Phase 4: Marketing Content + SEO — COMPLETE

**Commits:** `f493409` (marketing pages), `79acef7` (templates/SEO)

- 6 methodology step pages with detailed content
- 22 tool pages with SEO-optimized content
- 20 book chapter preview pages with signup CTA
- 35 glossary term pages for long-tail SEO capture
- 17 template download pages
- Resources hub page
- Dynamic sitemap.ts, robots.ts, JSON-LD structured data component

---

## 3. Remaining Work — Phase 5: Workshop Facilitation

**Status:** NOT STARTED — NEXT PRIORITY
**Prerequisite:** Phase 2B complete (content readable) — MET
**Database:** `workshop_sessions` table already exists in production
**Estimated Duration:** 1 week (5-7 agent-days)
**Reference:** `DEVELOPMENT_TASK_LIST.md` Phase 5 work packages

### What Exists

- `workshop_sessions` table created in production (org-scoped RLS, facilitator, timer state JSONB, participant count, status enum)
- Workshop module content pages functional (from Phase 2B)
- Knowledge Hub workshop landing page scaffolded
- Workshop content nodes in `content_nodes` table

### What Must Be Built

| WP ID  | Task                      | Priority | Effort | Agent            | Description                                                                    |
| ------ | ------------------------- | -------- | ------ | ---------------- | ------------------------------------------------------------------------------ |
| WP-5.1 | Workshop session CRUD     | P1       | M      | Development Lead | Server actions: create, start, pause, resume, complete session. List sessions. |
| WP-5.2 | Facilitator controls page | P1       | L      | Development Lead | `/knowledge/workshop/[sessionId]` — timer, module navigator, participant view  |
| WP-5.3 | Timer component           | P1       | M      | Development Lead | Countdown/count-up with start/pause/reset, synced via Supabase Realtime        |
| WP-5.4 | Presentation mode         | P2       | M      | UX / Dev Lead    | Full-screen view optimized for projection (large text, minimal chrome)         |
| WP-5.5 | Participant view          | P2       | M      | Development Lead | Read-only view for participants following facilitator                          |
| WP-5.6 | Shared state via Realtime | P2       | L      | Development Lead | Supabase Realtime broadcast for timer sync and module advance                  |
| WP-5.7 | Workshop templates        | P2       | M      | Development Lead | Pre-built agendas ("2-Hour Problem Solving Sprint", "Full-Day PIPS Training")  |
| WP-5.8 | Session recording         | P3       | M      | Development Lead | Save session timeline to JSONB for post-workshop review                        |
| WP-5.9 | Facilitator notes         | P3       | S      | Development Lead | Private notes visible only to facilitator during session                       |

### Workshop Dependencies

- Supabase Realtime must be activated for the project (currently reserved, not wired)
- `workshop_sessions` table exists — no migration needed
- Workshop content nodes exist in `content_nodes` — no seeding needed

### Workshop File Scope

| File / Directory                     | Agent                               |
| ------------------------------------ | ----------------------------------- |
| `src/app/(app)/knowledge/workshop/`  | Development Lead                    |
| `src/components/workshop/` (new)     | Development Lead                    |
| `src/app/(app)/knowledge/actions.ts` | Development Lead (workshop actions) |

---

## 4. Remaining Work — Phase 6: Polish & Quality

**Status:** NOT STARTED
**Prerequisite:** Phase 5 substantially complete (P1 tasks)
**Estimated Duration:** 1 week (5-7 agent-days)
**Reference:** `DEVELOPMENT_TASK_LIST.md` Phase 6 work packages

### Work Packages

| WP ID   | Task                                    | Priority | Effort | Agent                     | Description                                                   |
| ------- | --------------------------------------- | -------- | ------ | ------------------------- | ------------------------------------------------------------- |
| WP-6.1  | Session persistence                     | P2       | M      | Development Lead          | Save/restore reading scroll position in Knowledge Hub         |
| WP-6.2  | Mobile responsive audit (Knowledge Hub) | P1       | M      | UX / Dev Lead             | Verify all Knowledge Hub pages work on 375px viewport         |
| WP-6.3  | Mobile responsive audit (Training)      | P1       | M      | UX / Dev Lead             | Verify all Training pages work on 375px viewport              |
| WP-6.4  | Keyboard navigation for Cadence Bar     | P2       | S      | Development Lead          | Arrow keys, Enter to expand/collapse, Tab focus management    |
| WP-6.5  | ARIA labels for Knowledge Hub           | P2       | S      | Development Lead          | Screen reader support for content navigation                  |
| WP-6.6  | Screen reader testing                   | P3       | M      | QA Agent                  | Full accessibility audit with screen reader                   |
| WP-6.7  | Code splitting for Knowledge Hub        | P2       | M      | Development Lead          | Dynamic imports for large content components                  |
| WP-6.8  | Content node caching                    | P2       | M      | Development Lead          | SWR or React cache for frequently accessed content            |
| WP-6.9  | Image optimization                      | P3       | S      | Development Lead          | Next.js Image for content images                              |
| WP-6.10 | Basic analytics instrumentation         | P1       | L      | Data Analytics / Dev Lead | Implement core events from `ANALYTICS_PLAN.md` Section 8      |
| WP-6.11 | Knowledge Hub E2E tests                 | P1       | L      | QA Agent                  | E2E specs for book reading, search, bookmarks, Cadence Bar    |
| WP-6.12 | Training Mode E2E tests                 | P1       | L      | QA Agent                  | E2E specs for path navigation, exercise completion, progress  |
| WP-6.13 | Fix 47 failing E2E selectors            | P1       | L      | QA Agent                  | Align selectors with actual rendered DOM (carried from WP-S6) |
| WP-6.14 | Lighthouse audit                        | P2       | S      | DevOps                    | Core Web Vitals check, performance budget                     |
| WP-6.15 | Manual smoke test checklist             | P1       | S      | Marc (manual)             | Phase 5+6 gate: verify all new features on production         |
| WP-6.16 | data-testid attributes                  | P1       | M      | Development Lead          | Add stable test attributes to key interactive elements        |

### Parallelization Opportunities (Phase 6)

These can run in parallel because they touch different file trees:

**Parallel Group A:**

- WP-6.2 + WP-6.3 (mobile audit — different page sets)
- WP-6.4 + WP-6.5 (accessibility — different components)

**Parallel Group B:**

- WP-6.11 + WP-6.12 + WP-6.13 (E2E tests — separate spec files)
- WP-6.10 (analytics — separate files from E2E)

**Sequential:**

- WP-6.16 (data-testid) should precede WP-6.11/6.12/6.13 for stable selectors
- WP-6.15 (smoke test) runs after all other Phase 6 work

---

## 5. Post-Launch Phases

These phases are defined in `PRODUCT_ROADMAP.md` and are not scheduled for immediate execution. They represent the product evolution beyond the current feature-complete target.

### Phase 7: Analytics Instrumentation (Post-Beta Launch)

- Implement event tracking per `ANALYTICS_PLAN.md` taxonomy (28 events)
- Build internal admin dashboard (5 dashboard specs)
- Activate key metrics: MAPP, activation rates, retention cohorts
- **Prerequisite:** Real users generating data
- **Reference:** `ANALYTICS_PLAN.md` Section 8 (Implementation Priority)

### Phase 8: Billing & Monetization

- Stripe integration (checkout, subscription management, webhooks)
- Plan enforcement (free/starter/professional/enterprise tiers)
- Trial clock (14-day free trial)
- Usage metering and seat management
- **Prerequisite:** Beta validation of willingness to pay
- **Reference:** `BUSINESS_PLAN.md` Section 7, `PRODUCT_ROADMAP.md` Phase 3

### Phase 9: Integrations & API

- Jira bi-directional sync (tickets, status, comments)
- Azure DevOps integration
- AHA! integration
- REST API with API key management
- Webhook system (outbound events)
- **Prerequisite:** Billing active, customer demand validated
- **Reference:** `PRODUCT_ROADMAP.md` Phase 4, `SYSTEM_ARCHITECTURE.md` Section 8

### Phase 10: White-Label & Enterprise

- White-label theming (custom logo, colors, domain, typography)
- Multi-client management portal for consultants
- SAML/OAuth SSO
- IP whitelisting, data residency options
- Custom form builder
- **Prerequisite:** Phase 9 complete, enterprise customer pipeline
- **Reference:** `PRODUCT_ROADMAP.md` Phase 5, `PRODUCT_REQUIREMENTS.md` Section 4

### Phase 11: AI & Advanced Features

- AI-powered problem statement coaching
- AI root cause suggestions
- Auto-generated executive summaries
- Predictive project health scoring
- Natural language queries on project data
- **Prerequisite:** Phase 10 complete, data volume for AI training
- **Reference:** `PRODUCT_ROADMAP.md` Phase 6

---

## 6. Critical Path and Dependencies

### Immediate Critical Path (Phases 5-6)

```
Phase 5: Workshop Facilitation
  WP-5.1 (Session CRUD) ──────┐
  WP-5.2 (Facilitator page)───┤──→ WP-5.3 (Timer) ──→ WP-5.6 (Realtime sync)
  WP-5.7 (Templates) ─────────┘         │
                                         │
                                         ↓
Phase 6: Polish & Quality
  WP-6.16 (data-testid) ──→ WP-6.11 (KH E2E) ──→ WP-6.15 (Smoke test)
                         ──→ WP-6.12 (Training E2E)
                         ──→ WP-6.13 (Fix 47 E2E)
  WP-6.2 + 6.3 (Mobile audit) ──────────────────→ WP-6.15 (Smoke test)
  WP-6.10 (Analytics) ──────────────────────────→ WP-6.15 (Smoke test)
```

### Critical Path Bottlenecks

| Bottleneck                        | Why                                                          | Mitigation                                                    |
| --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| **Supabase Realtime activation**  | Workshop timer sync requires Realtime channels               | Activate Realtime in Supabase project settings before Phase 5 |
| **data-testid attributes**        | E2E tests need stable selectors before new specs are written | Schedule WP-6.16 as first Phase 6 task                        |
| **47 failing E2E tests**          | Regression safety net is incomplete                          | Can start fixing immediately (not blocked by Phase 5)         |
| **Manual smoke test**             | Only Marc can do this — requires manual browser testing      | Schedule specific time slot after Phase 6 P1 work completes   |
| **Analytics requires real users** | Phase 7 metrics are meaningless without actual usage data    | Focus Phase 6 analytics on instrumentation plumbing only      |

### Independent Work (Can Start Now)

These items are not blocked by Phase 5 and can be started immediately:

- WP-S6/WP-6.13: Fix 47 failing E2E selectors
- WP-6.16: Add data-testid attributes
- WP-6.10: Analytics instrumentation (client-side event tracking)
- WP-6.2/6.3: Mobile responsive audit

---

## 7. Agent Assignment Recommendations

### Phase 5 Assignments

| Agent                      | Tasks                                          | Rationale                                                              |
| -------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| **Development Lead Agent** | WP-5.1, WP-5.2, WP-5.3, WP-5.5, WP-5.6, WP-5.7 | Core implementation work — server actions, components, Realtime wiring |
| **UX Design Agent**        | WP-5.4 (presentation mode design)              | Requires design thinking for projection-optimized layout               |
| **QA Agent**               | Workshop test specs                            | Write tests as features are built                                      |

### Phase 6 Assignments

| Agent                      | Tasks                                                   | Rationale                                              |
| -------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| **QA Agent**               | WP-6.11, WP-6.12, WP-6.13, WP-6.6                       | E2E tests, accessibility audit, selector fixes         |
| **Development Lead Agent** | WP-6.1, WP-6.4, WP-6.5, WP-6.7, WP-6.8, WP-6.9, WP-6.16 | Technical polish, caching, code splitting, data-testid |
| **Data Analytics Agent**   | WP-6.10                                                 | Analytics event instrumentation                        |
| **DevOps Agent**           | WP-6.14                                                 | Lighthouse audit, performance budget                   |
| **UX Design Agent**        | WP-6.2, WP-6.3                                          | Mobile responsive verification                         |
| **Marc (Manual)**          | WP-6.15, WP-S7                                          | Manual smoke tests — cannot be automated               |

### Recommended Parallel Agent Deployment (Phase 5)

**Wave E (Phase 5):**

| Agent                                 | Scope                  | File Ownership                                      |
| ------------------------------------- | ---------------------- | --------------------------------------------------- |
| Agent E1: Workshop CRUD + Facilitator | WP-5.1, WP-5.2         | `knowledge/workshop/`, `knowledge/actions.ts`       |
| Agent E2: Timer + Realtime            | WP-5.3, WP-5.6         | `components/workshop/` (new), Supabase Realtime     |
| Agent E3: Templates + Polish          | WP-5.7, WP-5.8, WP-5.9 | Workshop template data, facilitator notes component |

**Note:** Agent E1 and E2 can run in parallel because they own different file directories. Agent E3 depends on E1 completing session CRUD.

**Wave F (Phase 6, can start during Phase 5):**

| Agent                        | Scope            | File Ownership                                 |
| ---------------------------- | ---------------- | ---------------------------------------------- |
| Agent F1: E2E Selector Fixes | WP-6.13, WP-6.16 | `tests/e2e/`, data-testid in app components    |
| Agent F2: Mobile Audit       | WP-6.2, WP-6.3   | Read-only audit, CSS fixes only                |
| Agent F3: Analytics          | WP-6.10          | `lib/analytics.ts` (new), event tracking calls |

---

## 8. Risk Register

Synthesized from all 9 agent reports during the planning cascade.

### Active Risks

| #   | Risk                                                                                                                          | Severity | Likelihood | Source Agent          | Mitigation                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | --------------------- | -------------------------------------------------------------------------------------------- |
| R1  | **47 E2E tests failing** — regression safety net has gaps                                                                     | HIGH     | CERTAIN    | QA                    | Fix selectors before writing new E2E specs. Add data-testid attributes.                      |
| R2  | **No real users yet** — all testing is agent/developer testing                                                                | HIGH     | CERTAIN    | Customer Insights     | Recruit 2-3 beta testers after Phase 6. Marc to identify candidates.                         |
| R3  | **Marketing claims exceed reality** — "26+ tools" (18 built), "14-day trial" (no trial clock), "Jira integration" (not built) | HIGH     | HIGH       | Customer Insights     | Audit all marketing copy before any outbound campaign. Reframe to match reality.             |
| R4  | **No billing integration** — no revenue path exists                                                                           | MEDIUM   | CERTAIN    | Product Strategy      | Acceptable for beta. Add "What plan is right for you?" interest capture page.                |
| R5  | **Manual QA gap** — solo developer + AI agents means no human tester                                                          | MEDIUM   | HIGH       | PM Review             | Manual smoke test checklist at each phase gate. Beta testers serve as early QA.              |
| R6  | **Supabase Realtime not activated** — Workshop timer requires it                                                              | MEDIUM   | MEDIUM     | Chief Architect       | Activate before Phase 5 begins. Low-risk configuration change.                               |
| R7  | **Onboarding is minimal** — no role survey, no guided tour, no template selection                                             | MEDIUM   | HIGH       | Customer Insights, UX | Phase 1.5 improvements planned (auto-sample project, choice screen, methodology explainer).  |
| R8  | **Email notification reliability** — ticket assignment and step-advance emails unverified                                     | MEDIUM   | MEDIUM     | Customer Insights     | Verify all Resend trigger paths before beta invitations.                                     |
| R9  | **No analytics instrumentation** — cannot measure what we cannot track                                                        | MEDIUM   | CERTAIN    | Data Analytics        | Phase 6 includes basic instrumentation (WP-6.10). Full instrumentation in Phase 7.           |
| R10 | **Content nodes depend on Book edits** — if Book source changes, content must be recompiled                                   | LOW      | MEDIUM     | Development Lead      | Recompile procedure documented. Run `pnpm content:compile && pnpm content:seed` after edits. |
| R11 | **Performance degradation with scale** — RLS policy evaluation adds latency on large tables                                   | LOW      | LOW        | Chief Architect       | Monitor query latency via Supabase dashboard. Add indexes if P95 exceeds 500ms.              |

### Resolved Risks (from this planning cascade)

| #            | Risk                                        | Resolution                               |
| ------------ | ------------------------------------------- | ---------------------------------------- |
| R-RESOLVED-1 | Knowledge Hub migration not applied to prod | RESOLVED — applied 2026-03-04            |
| R-RESOLVED-2 | Content compiler not run                    | RESOLVED — 205 nodes compiled            |
| R-RESOLVED-3 | Scaffolded features not wired to DB         | RESOLVED — all Phase 2-4 wiring complete |
| R-RESOLVED-4 | Hydration errors on multiple pages          | RESOLVED — fixed in `85506c3`            |
| R-RESOLVED-5 | RLS data loading failure                    | RESOLVED — fixed in `85506c3`            |
| R-RESOLVED-6 | name-to-title systemic bug (16 files)       | RESOLVED — fixed in MVP bug fix session  |

---

## 9. Quality Gates Per Phase

### Phase 5: Workshop Facilitation

| Gate       | Criteria                                                             |
| ---------- | -------------------------------------------------------------------- |
| Functional | Workshop session can be created, started, paused, resumed, completed |
| Functional | Timer counts up/down accurately, syncs via Realtime to multiple tabs |
| Functional | Facilitator can advance through workshop modules                     |
| Tests      | Unit tests for workshop server actions (10+ tests)                   |
| Tests      | `pnpm typecheck` passes with 0 errors                                |
| Tests      | `pnpm test` passes (900+ total tests)                                |
| Build      | `pnpm build` succeeds                                                |
| UX         | Presentation mode renders cleanly on 1080p+ screens                  |

### Phase 6: Polish & Quality

| Gate          | Criteria                                                                    |
| ------------- | --------------------------------------------------------------------------- |
| E2E           | All 160+ E2E tests pass against production (0 failures)                     |
| E2E           | Knowledge Hub E2E specs added (10+ new tests)                               |
| E2E           | Training Mode E2E specs added (10+ new tests)                               |
| Mobile        | All Knowledge Hub pages render correctly at 375px viewport                  |
| Mobile        | All Training pages render correctly at 375px viewport                       |
| Accessibility | Keyboard navigation works on Cadence Bar and Knowledge Hub                  |
| Accessibility | ARIA labels present on all interactive Knowledge Hub elements               |
| Performance   | Lighthouse performance score > 85 on key pages                              |
| Analytics     | Core tracking events fire correctly (page views, form saves, step advances) |
| Manual        | Smoke test checklist completed by Marc on production                        |
| Tests         | `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass           |

### Beta Launch Gate (after Phase 6)

| Gate             | Criteria                                                           |
| ---------------- | ------------------------------------------------------------------ |
| Feature complete | All Phase 5 P1 and Phase 6 P1 tasks done                           |
| Quality          | 0 type errors, 0 lint errors, 950+ unit tests, 200+ E2E tests      |
| Stability        | Zero critical bugs in production                                   |
| Manual QA        | Marc has completed full smoke test on production                   |
| Email            | All critical email paths verified (signup, invite, password reset) |
| Marketing        | Marketing copy audited against actual feature set                  |
| Users            | 2-3 beta testers identified and invited                            |

---

## 10. Timeline Estimates

### Aggressive Timeline (with parallel agents)

| Phase                                          | Duration     | Start     | End      |
| ---------------------------------------------- | ------------ | --------- | -------- |
| Phase 5: Workshop                              | 5 days       | Immediate | +5 days  |
| Phase 6: Polish (partial overlap with Phase 5) | 5 days       | +3 days   | +8 days  |
| Beta Launch Prep                               | 2 days       | +8 days   | +10 days |
| **Total to Beta Launch**                       | **~10 days** |           |          |

### Conservative Timeline (sequential, single agent)

| Phase                    | Duration     | Start     | End      |
| ------------------------ | ------------ | --------- | -------- |
| Phase 5: Workshop        | 7 days       | Immediate | +7 days  |
| Phase 6: Polish          | 7 days       | +7 days   | +14 days |
| Beta Launch Prep         | 3 days       | +14 days  | +17 days |
| **Total to Beta Launch** | **~17 days** |           |          |

### Immediate Quick Wins (can start now, no dependencies)

1. Fix 47 failing E2E selectors (WP-6.13) — 4-8 hours
2. Add data-testid attributes (WP-6.16) — 2-4 hours
3. Mobile responsive audit (WP-6.2, WP-6.3) — 2-4 hours each
4. Begin analytics instrumentation (WP-6.10) — 4-8 hours

---

## 11. Success Criteria

### Phase 5 Success

- A facilitator can create and run a complete workshop session
- Timer displays correctly and syncs across browser tabs
- Workshop templates provide meaningful starting points
- At least 2 pre-built workshop agendas are available

### Phase 6 Success

- All E2E tests pass (0 failures)
- Knowledge Hub and Training have dedicated E2E coverage
- Mobile experience is usable on iPhone SE (375px)
- Core analytics events are instrumented and firing
- Performance budget met (Lighthouse > 85)

### Beta Launch Success (measured at +30 days)

- 2-3 organizations have signed up and created projects
- At least 1 PIPS project has progressed past Step 3
- At least 1 team has multiple members actively contributing
- Time to first value < 20 minutes (measured)
- No critical bugs reported by beta users
- NPS > 30 from beta cohort

### Year 1 Success (from `PRODUCT_REQUIREMENTS.md`)

| Metric                    | Target       |
| ------------------------- | ------------ |
| Paying organizations      | 50           |
| Monthly active users      | 2,500        |
| PIPS projects completed   | 500          |
| Monthly recurring revenue | $25,000      |
| User NPS                  | > 40         |
| Churn rate                | < 5% monthly |

---

## Appendix A: Git Commit History (Post-MVP)

| Commit    | Description                                                                       | Phase |
| --------- | --------------------------------------------------------------------------------- | ----- |
| `85506c3` | fix: Wave A stabilization — hydration, UI bugs, typography, PM review integration | 1.5   |
| `8c3b012` | feat: Knowledge Hub foundation — taxonomy, migration, compiler, seeder            | 2A    |
| `7ec1a48` | feat: Wave B — Knowledge Hub pages, search, bookmarks, audit log, toasts          | 2B    |
| `0358558` | feat: Cadence Bar — integrated into all 18 forms, ticket detail, dashboard        | 2C    |
| `ca51d93` | feat: Training seed script — 4 paths, 27 modules, 59 exercises                    | 3     |
| `64b2a03` | feat: Wire Training landing, path detail, progress pages                          | 3     |
| `6851176` | feat: Training modules, exercises, completion flow                                | 3     |
| `f493409` | feat: Marketing pages — methodology, tools, book previews, glossary               | 4     |
| `79acef7` | feat: Template downloads, SEO structured data, sitemap, robots                    | 4     |
| `5e2ccbe` | docs: System Architecture document and project index update                       | Docs  |

---

## Appendix B: Planning Cascade Summary (2026-03-04)

The first full planning cascade was executed on 2026-03-04 with 10 sequential agent updates. This v1.1 update of the Full Project Plan synthesizes all cascade outputs.

| Position | Agent             | Action                                                                                                               |
| -------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1        | Product Strategy  | Updated BUSINESS_PLAN.md (v1.1), MARKETING_STRATEGY.md (v1.1) — reflects live status                                 |
| 2        | Customer Insights | Created CUSTOMER_INSIGHTS_REPORT.md (397 lines) — friction risks, personas, messaging gaps                           |
| 3        | Product Manager   | Updated PRODUCT_REQUIREMENTS.md (v1.1), PRODUCT_ROADMAP.md (v1.1), MVP_SPECIFICATION.md (v1.1) — post-MVP extensions |
| 4        | UX Design         | Updated UX_FLOWS.md (v1.1, +650 lines), BRAND_GUIDE_V2.md (v2.1, +370 lines) — new feature flows                     |
| 5        | Chief Architect   | Updated SYSTEM_ARCHITECTURE.md (v1.1, +6 sections) — ADRs, risk register, new subsystems                             |
| 6        | Development Lead  | Updated TECHNICAL_PLAN.md (v1.1), DEVELOPMENT_TASK_LIST.md (v1.2) — 37/59 WPs done                                   |
| 7        | QA                | Created TEST_STRATEGY.md (1,166 lines) — coverage analysis, gap report, release checklist                            |
| 8        | DevOps            | Updated DEVOPS_RUNBOOK.md (v1.1, 3,637 lines) — content pipeline ops, disaster recovery                              |
| 9        | Data Analytics    | Created ANALYTICS_PLAN.md (1,073 lines) — 30 metrics, 28 events, 5 dashboards                                        |
| 10       | Project Manager   | Updated this document (v1.1), AI_AGENT_COORDINATION.md (v1.1), PROJECT_INDEX.md (v1.1)                               |
