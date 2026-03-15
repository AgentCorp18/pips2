# PIPS 2.0 — Project Planning Index

> **Version:** 2.0 — Updated 2026-03-15
> **Created:** March 3, 2026
> **Owner:** Project Manager Agent (Control Tower)
> **Status:** All Phases 0-10 COMPLETE — Production, CEO bug fix sprints ongoing
> **Product Name:** PIPS (Process Improvement and Problem Solving)
> **Owner (Human):** Marc Albers (GitHub: AgentCorp18)
> **Production URL:** https://pips-app.vercel.app
> **Repository:** AgentCorp18/pips2 (public)
> **Supabase Project:** `cmrribhjgfybbxhrsxqi` (us-east-2)

---

## What is PIPS 2.0?

PIPS 2.0 is a multi-tenant SaaS web application that embeds a proven 6-step process improvement methodology (Identify, Analyze, Generate, Select & Plan, Implement, Evaluate) into enterprise-grade project management and ticketing software.

It is the first **methodology-embedded project management platform** where the process teaches teams _how to solve problems_, not just manage tasks.

Tech Stack: Next.js 16 + TypeScript (strict) + Supabase + Vercel + Tailwind v4 + shadcn/ui

---

## Current Build Status

| Metric          | Value                                                  |
| --------------- | ------------------------------------------------------ |
| Unit tests      | 2,794 passing (235 files)                              |
| E2E tests       | 68 test cases, 7 spec files (in `apps/web/tests/e2e/`) |
| Type errors     | 0                                                      |
| Lint errors     | 0                                                      |
| PIPS forms      | 18 interactive methodology forms                       |
| DB migrations   | 17 applied to production                               |
| Content nodes   | 205 seeded (FTS active)                                |
| Training data   | 4 paths, 27 modules, 59 exercises                      |
| Marketing pages | 83+ SEO pages                                          |
| Chat channels   | Real-time team chat with Supabase Realtime             |
| Initiatives     | Strategic initiatives with weighted project progress   |
| CEO tickets     | 16 filed, 13 resolved (3 in progress)                  |
| Production      | Live since March 3, 2026                               |

### Phase Completion

| Phase                               | Status      | Commit                                                  |
| ----------------------------------- | ----------- | ------------------------------------------------------- |
| Phase 0 (Foundation)                | COMPLETE    | MVP sprints                                             |
| Phase 1 (MVP)                       | COMPLETE    | Live since 2026-03-03                                   |
| Phase 1.5 (Stabilization)           | COMPLETE    | `85506c3`                                               |
| Phase 2A (Knowledge Hub Foundation) | COMPLETE    | `8c3b012`                                               |
| Phase 2B (Reading Experience)       | COMPLETE    | `7ec1a48`                                               |
| Phase 2C (Cadence Bar)              | COMPLETE    | `0358558`                                               |
| Phase 3 (Training Mode)             | COMPLETE    | `ca51d93`, `64b2a03`, `6851176`                         |
| Phase 4 (Marketing Content + SEO)   | COMPLETE    | `f493409`, `79acef7`                                    |
| Phase 5 (Workshop Facilitation)     | COMPLETE    | `f910c5b`, `29d9bcf`, `2cf29ec`                         |
| Phase 6 (Polish & Quality)          | COMPLETE    | All WPs complete — Lighthouse + Final Gate done (PR #7) |
| Phase 7 (Beta Launch)               | COMPLETE    | P0 all complete, Sentry configured, smoke test done     |
| Phase 8 (UX & Methodology Clarity)  | COMPLETE    | PRs #14-#18 merged (2026-03-13)                         |
| Phase 9 (Content, UX & Team Chat)   | COMPLETE    | PR #22 merged, chat migration applied (2026-03-14)      |
| Phase 10 (Skills & Initiatives)     | COMPLETE    | Initiatives, CEO Request type, Claude Code skills       |
| CEO Bug Fix Sprints                 | IN PROGRESS | 13/16 tickets resolved, 3 in progress (2026-03-15)      |

---

## Agent Startup Path

When beginning a new work session, agents should read documents in the following order:

1. `CLAUDE.md` — Project rules and coding conventions
2. `AI_AGENT_COORDINATION.md` — Agent coordination protocols
3. `PROJECT_INDEX.md` — Orientation and planning map (this document)
4. `FULL_PROJECT_PLAN.md` — Current phase, milestones, and execution strategy
5. `DEVELOPMENT_TASK_LIST.md` — Tactical tasks and dependencies
6. Latest entry in `docs/work-log/` — Current session state

---

## AI Agent Organization

PIPS 2.0 is developed using a coordinated system of 11 specialized AI agents organized into 4 functional layers.

### Strategy Layer

- **Product Strategy Agent** — product vision, market positioning, business alignment

### Product Layer

- **Product Manager Agent** — product requirements, feature definitions, roadmap execution
- **UX Design Agent** — interface design, interaction patterns, usability
- **Customer Insights Agent** — user feedback synthesis, adoption analysis, friction identification

### Execution Layer

- **Project Manager Agent (Control Tower)** — execution governance, milestone tracking, agent dispatch
- **Development Lead Agent** — engineering implementation, technical task decomposition
- **QA Agent** — testing strategy, regression validation, release readiness
- **DevOps Agent** — infrastructure, CI/CD pipelines, deployment operations

### Architecture Layer

- **Chief Architect Agent** — system architecture, platform scalability, technical standards
- **System Architect Agent** — subsystem architecture, integration patterns

### Intelligence Layer

- **Data Analytics Agent** — product metrics, reporting models, analytics instrumentation

Agent coordination rules are defined in: `docs/planning/AI_AGENT_COORDINATION.md`
Agent seed documents live in: `docs/AGENTS/`

---

## Planning Document Registry

All planning documents in `docs/planning/`, organized by domain with version, owner, and description.

### Strategic Documents

| Document                      | Version    | Owner                   | Lines  | Description                                                                |
| ----------------------------- | ---------- | ----------------------- | ------ | -------------------------------------------------------------------------- |
| `BUSINESS_PLAN.md`            | v1.1       | Product Strategy Agent  | ~1,200 | Market analysis, business model, revenue strategy, competitive positioning |
| `MARKETING_STRATEGY.md`       | v1.1       | Product Strategy Agent  | ~1,600 | Campaigns, messaging framework, launch plan, marketing technology stack    |
| `CUSTOMER_INSIGHTS_REPORT.md` | v1.0 (NEW) | Customer Insights Agent | 397    | Target personas, friction risks, time-to-value analysis, messaging gaps    |

### Product Documents

| Document                  | Version | Owner                 | Lines  | Description                                                                |
| ------------------------- | ------- | --------------------- | ------ | -------------------------------------------------------------------------- |
| `PRODUCT_REQUIREMENTS.md` | v1.1    | Product Manager Agent | ~2,400 | Feature requirements (core, enterprise, knowledge hub, training, workshop) |
| `PRODUCT_ROADMAP.md`      | v1.1    | Product Manager Agent | ~1,100 | Phase roadmap, release sequencing, risk register, success criteria         |
| `MVP_SPECIFICATION.md`    | v1.1    | Product Manager Agent | ~1,600 | MVP scope, build sequence, agent work packages, quality gates              |
| `UX_FLOWS.md`             | v1.1    | UX Design Agent       | ~1,400 | User journeys, critical UX flows, navigation architecture, key screens     |
| `BRAND_GUIDE_V2.md`       | v2.1    | UX Design Agent       | ~1,700 | Visual identity, UI design language, typography, color system, white-label |
| `CONTENT_MIGRATION.md`    | v1.0    | Product Manager Agent | ~1,300 | Asset inventory, form template migration, content strategy                 |

### Technical Documents

| Document                 | Version    | Owner                  | Lines  | Description                                                                                       |
| ------------------------ | ---------- | ---------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| `SYSTEM_ARCHITECTURE.md` | v1.1       | Chief Architect Agent  | ~1,100 | System topology, domain model, component architecture, ADRs, risk register                        |
| `TECHNICAL_PLAN.md`      | v1.1       | Development Lead Agent | ~3,000 | Schema design, APIs, security, integrations, Knowledge Hub/Training/SEO architecture              |
| `TEST_STRATEGY.md`       | v1.0 (NEW) | QA Agent               | 1,166  | Coverage analysis, test type strategy, gap analysis, release readiness checklist                  |
| `DEVOPS_RUNBOOK.md`      | v1.1       | DevOps Agent           | 3,637  | Day-1 setup, CI/CD pipeline, deployment procedures, content pipeline ops, disaster recovery       |
| `ANALYTICS_PLAN.md`      | v1.0 (NEW) | Data Analytics Agent   | 1,073  | Metrics hierarchy (30 metrics), event taxonomy (28 events), dashboard specs, instrumentation plan |

### Execution Documents

| Document                   | Version | Owner                  | Lines  | Description                                                                          |
| -------------------------- | ------- | ---------------------- | ------ | ------------------------------------------------------------------------------------ |
| `FULL_PROJECT_PLAN.md`     | v1.1    | Project Manager Agent  | ~900   | Master execution plan, phase status, critical path, risk register, agent assignments |
| `FINAL_PROJECT_PLAN.md`    | v1.0    | Project Manager Agent  | ~160   | Active plan: Phase 7 Beta Launch + P0/P1 items, Phase 8-10 roadmap                   |
| `DEVELOPMENT_TASK_LIST.md` | v1.3    | Development Lead Agent | ~1,600 | Tactical task list with 59 work packages (all complete), parallelization map         |
| `INCIDENT_RESPONSE.md`     | v1.0    | DevOps Agent           | ~180   | Incident severity levels, system status checks, common fixes, rollback procedure     |
| `PROJECT_INDEX.md`         | v1.3    | Project Manager Agent  | ~300   | This document — system navigation guide and planning document registry               |

### Coordination Documents

| Document                   | Version | Owner                 | Lines | Description                                                                       |
| -------------------------- | ------- | --------------------- | ----- | --------------------------------------------------------------------------------- |
| `AI_AGENT_COORDINATION.md` | v1.1    | Project Manager Agent | ~500  | Multi-agent rules, document ownership, decision authority, task dispatch protocol |
| `AI_EXECUTION_LOOP.md`     | v1.0    | Project Manager Agent | ~80   | Agent execution cycle: observe, plan, execute, validate, record                   |
| `AI_ORGANIZATION_CHART.md` | v1.0    | Project Manager Agent | ~255  | Agent organizational structure and interaction model                              |
| `SYSTEM_CONTEXT.md`        | v1.0    | Chief Architect Agent | ~140  | Conceptual model, product philosophy, domain model, system boundaries             |

### Legacy / Reference Documents

| Document                   | Version | Notes                                                   |
| -------------------------- | ------- | ------------------------------------------------------- |
| `BRAND_GUIDE.md`           | v1.0    | Original brand guide, superseded by `BRAND_GUIDE_V2.md` |
| `PROJECT_INDEX_UPDATED.md` | --      | Interim version, superseded by this document            |
| `bk/`                      | --      | Backup directory for older document versions            |

---

## Document Ownership Summary

| Agent                       | Documents Owned                                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Product Strategy Agent**  | `BUSINESS_PLAN.md`, `MARKETING_STRATEGY.md`                                                                                |
| **Product Manager Agent**   | `PRODUCT_REQUIREMENTS.md`, `PRODUCT_ROADMAP.md`, `MVP_SPECIFICATION.md`, `CONTENT_MIGRATION.md`                            |
| **UX Design Agent**         | `UX_FLOWS.md`, `BRAND_GUIDE_V2.md`                                                                                         |
| **Customer Insights Agent** | `CUSTOMER_INSIGHTS_REPORT.md`                                                                                              |
| **Project Manager Agent**   | `FULL_PROJECT_PLAN.md`, `PROJECT_INDEX.md`, `AI_AGENT_COORDINATION.md`, `AI_EXECUTION_LOOP.md`, `AI_ORGANIZATION_CHART.md` |
| **Development Lead Agent**  | `TECHNICAL_PLAN.md`, `DEVELOPMENT_TASK_LIST.md`                                                                            |
| **Chief Architect Agent**   | `SYSTEM_ARCHITECTURE.md`, `SYSTEM_CONTEXT.md`                                                                              |
| **QA Agent**                | `TEST_STRATEGY.md`                                                                                                         |
| **DevOps Agent**            | `DEVOPS_RUNBOOK.md`                                                                                                        |
| **Data Analytics Agent**    | `ANALYTICS_PLAN.md`                                                                                                        |

---

## System Map

```
Strategy
  Product Strategy Agent
    ↓
Product
  Product Manager Agent
  UX Design Agent
  Customer Insights Agent
    ↓
Execution
  Project Manager Agent (Control Tower)
  Development Lead Agent
  QA Agent
  DevOps Agent
    ↓
Architecture (Supporting)
  Chief Architect Agent
  System Architect Agent
    ↓
Intelligence (Supporting)
  Data Analytics Agent
```

---

## Quick Reference

### Quality Gate Commands

```bash
pnpm typecheck        # tsc --noEmit
pnpm lint             # ESLint
pnpm test             # Vitest (2,400+ tests)
pnpm test:e2e         # Playwright (7 spec files, 41+ tests)
pnpm build            # Next.js production build
```

### Content Pipeline Commands

```bash
pnpm content:compile  # Compile Book markdown to ContentNode JSON
pnpm content:seed     # Seed content nodes to Supabase
pnpm training:seed    # Seed training paths, modules, exercises
```

### Key Directories

| Directory             | Purpose                             |
| --------------------- | ----------------------------------- |
| `apps/web/`           | Next.js web application             |
| `packages/shared/`    | Shared types and utilities          |
| `supabase/`           | Migrations, functions, seed data    |
| `scripts/`            | Content pipeline scripts            |
| `docs/planning/`      | Planning documents (this directory) |
| `docs/AGENTS/`        | Agent seed documents                |
| `docs/work-log/`      | Daily work logs                     |
| `apps/web/tests/e2e/` | E2E test specs (7 spec files)       |

---

## What to Read Next

- **Starting a new work session?** Read `FINAL_PROJECT_PLAN.md` for current priorities (Phase 7 Beta Launch)
- **Active phase?** Phase 7 Beta Launch — P0 items 1-4 complete, P0 items 5-6 (smoke test, Sentry) pending
- **Security review findings?** Read `docs/reviews/2026-03-12-critical-review.md` for 26 findings (5 critical fixed)
- **Incident occurring?** Read `INCIDENT_RESPONSE.md` for diagnosis and rollback procedures
- **Need task details?** Read `DEVELOPMENT_TASK_LIST.md` for work packages (all 59 complete)
- **Building a feature?** Read `TECHNICAL_PLAN.md` for architecture and `CLAUDE.md` for conventions
- **Testing?** Read `TEST_STRATEGY.md` for testing approach
- **Deploying?** Read `DEVOPS_RUNBOOK.md` for procedures
- **Understanding users?** Read `CUSTOMER_INSIGHTS_REPORT.md` for friction risks
- **Tracking metrics?** Read `ANALYTICS_PLAN.md` for event taxonomy
