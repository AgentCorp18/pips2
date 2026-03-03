# PIPS 2.0 — Project Planning Index

**Created:** March 3, 2026
**Status:** MVP Complete — Deployed to Production
**Product Name:** PIPS (Process Improvement and Problem Solving)
**Owner:** Marc Albers (GitHub: AlberaMarc)
**Production URL:** https://pips-app.vercel.app
**Repository:** AlberaMarc/pips2 (private)

---

## What is PIPS 2.0?

PIPS 2.0 is a multi-tenant SaaS web application that embeds a proven 6-step process improvement methodology (Identify → Analyze → Generate → Select & Plan → Implement → Evaluate) into enterprise-grade project management and ticketing software. It's the first "methodology-embedded project management" platform — the process tells you _how_ to solve problems, not just _what tasks exist_.

**Tech Stack:** Next.js 15 + TypeScript + Supabase + Vercel + Stripe
**Brand Identity:** Indigo-violet primary (#4F46E5), DM Sans + DM Serif Display, pip dot motif

---

## Planning Documents

### Business & Strategy

| Document           | File                    | Lines  | Description                                                                                                                               |
| ------------------ | ----------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Business Plan      | `BUSINESS_PLAN.md`      | ~1,100 | Market analysis (TAM ~$35B), competitive positioning, revenue model, 3-year financial projections, go-to-market strategy                  |
| Marketing Strategy | `MARKETING_STRATEGY.md` | ~1,800 | 5 campaigns, 18 taglines, email sequences, ad copy, SEO keywords, launch playbook, partnership program                                    |
| Brand Guide V2     | `BRAND_GUIDE_V2.md`     | ~2,317 | Name recommendation (keep PIPS), color system, typography, logo concepts, UI design language, CSS design tokens, white-label architecture |
| Brand Guide V1     | `BRAND_GUIDE.md`        | ~1,500 | **Superseded by V2.** Original guide that recommended "Meridian" (rejected). Kept for reference.                                          |

### Product & Design

| Document             | File                      | Lines  | Description                                                                                                                     |
| -------------------- | ------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Product Requirements | `PRODUCT_REQUIREMENTS.md` | ~2,391 | 200+ requirements, 5 personas, wireframes, acceptance criteria, data model, API surface                                         |
| Product Roadmap      | `PRODUCT_ROADMAP.md`      | ~1,000 | 7 phases over 52 weeks (realistic 15-18 months), per-phase scope/risks/exit criteria                                            |
| UX Flows             | `UX_FLOWS.md`             | ~1,100 | 5 persona journeys, 6 interaction flows, "aha moment" design, navigation architecture, 8 screen descriptions, onboarding system |
| Content Migration    | `CONTENT_MIGRATION.md`    | ~1,596 | Maps 26 existing forms + 3 HTML guides to product features, 6 transformation specs, migration priority by phase                 |

### Technical & Operations

| Document              | File                       | Lines  | Description                                                                                                            |
| --------------------- | -------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| Technical Plan        | `TECHNICAL_PLAN.md`        | ~2,654 | Architecture, 20+ SQL tables, 60+ API endpoints, RLS policies, integration design, performance scaling                 |
| DevOps Runbook        | `DEVOPS_RUNBOOK.md`        | ~3,377 | Day-1 setup commands, 5 CI/CD workflow YAMLs, environment management, deployment procedures, troubleshooting playbooks |
| AI Agent Coordination | `AI_AGENT_COORDINATION.md` | ~1,300 | Worktree strategy, 25+ agent work packages across 7 phases, file ownership matrix, session management, templates       |

### Execution

| Document              | File                   | Lines  | Description                                                                                                                           |
| --------------------- | ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **MVP Specification** | `MVP_SPECIFICATION.md` | ~1,886 | **START HERE for development.** Minimum viable feature set, 8-week build sequence, 25 agent work packages, quality gates, build order |

### Visual Mockups

| File                             | Size | Description                                     |
| -------------------------------- | ---- | ----------------------------------------------- |
| `../mockups/landing-page.html`   | 52KB | Full marketing landing page with brand identity |
| `../mockups/product-ui.html`     | 47KB | Product dashboard / PIPS project view mockup    |
| `../mockups/email-template.html` | 29KB | Welcome email template                          |

---

## Quick Reference: Key Decisions

| Decision          | Choice                     | Rationale                                                                  |
| ----------------- | -------------------------- | -------------------------------------------------------------------------- |
| **Product name**  | PIPS                       | Fun, memorable, accessible — visual identity carries the enterprise weight |
| **Primary color** | Indigo-violet #4F46E5      | Distinctive (not Tailwind blue), professional but not generic              |
| **Fonts**         | DM Sans + DM Serif Display | Geometric warmth, distinctive vs. ubiquitous Inter                         |
| **Architecture**  | Shared schema + RLS        | Simpler than schema-per-tenant, Supabase-native                            |
| **MVP strategy**  | Free beta, no billing      | Zero-friction signup to validate product-market fit                        |
| **MVP timeline**  | 8 weeks (4 sprints)        | Solo dev + AI agents, 25 work packages                                     |
| **Step 5 color**  | Gold #CA8A04               | Red reassigned — red = error in UI, bad for "implement"                    |

---

## How to Use This Planning Suite

### If you're starting development:

1. Read `MVP_SPECIFICATION.md` — the definitive guide to what gets built first
2. Reference `TECHNICAL_PLAN.md` for architecture and schema details
3. Follow `DEVOPS_RUNBOOK.md` for project setup (day-1 commands)
4. Use `AI_AGENT_COORDINATION.md` for agent workflow and worktree strategy

### If you're designing UI:

1. Read `BRAND_GUIDE_V2.md` for design tokens, colors, typography
2. Open the HTML mockups in `../mockups/` for visual reference
3. Reference `UX_FLOWS.md` for screen descriptions and interaction patterns
4. Check `PRODUCT_REQUIREMENTS.md` for wireframes and acceptance criteria

### If you're writing content/marketing:

1. Read `MARKETING_STRATEGY.md` for messaging and campaigns
2. Reference `BRAND_GUIDE_V2.md` Section 1.7 for voice and tone
3. Use `CONTENT_MIGRATION.md` for existing asset inventory
4. Check `BUSINESS_PLAN.md` for competitive positioning

### If you need the full picture:

1. This file (`PROJECT_INDEX.md`) for orientation
2. `BUSINESS_PLAN.md` for the "why"
3. `PRODUCT_ROADMAP.md` for the "when"
4. `PRODUCT_REQUIREMENTS.md` for the "what"
5. `TECHNICAL_PLAN.md` for the "how"

---

## Total Planning Output

- **13 planning documents** totaling ~21,000+ lines
- **3 HTML mockups** totaling ~128KB
- **~1.2 million characters** of planning content
- **Coverage:** Business strategy, market analysis, product specs, technical architecture, database schemas, API design, UX flows, brand identity, marketing campaigns, DevOps procedures, agent coordination, MVP specification

---

---

## Build Status

| Milestone                               | Status       | Date          |
| --------------------------------------- | ------------ | ------------- |
| Planning (13 docs)                      | **Complete** | March 3, 2026 |
| Sprint 0: Foundation                    | **Complete** | March 3, 2026 |
| Sprint 1-4: Core Features               | **Complete** | March 3, 2026 |
| Sprint 5: Invitations, Filters, Landing | **Complete** | March 3, 2026 |
| Sprint 6: QA, Monitoring, Security      | **Complete** | March 3, 2026 |
| Sprint 7: T3 Nice-to-Haves              | **Complete** | March 3, 2026 |
| Post-MVP: Bug Fixes + E2E Suite         | **Complete** | March 3, 2026 |
| Production Deployment                   | **Live**     | March 3, 2026 |

**Quality:** 832 unit tests, 160 E2E tests, 0 type errors, OWASP security audit passed

_This index was created on March 3, 2026. Last updated: March 3, 2026._
