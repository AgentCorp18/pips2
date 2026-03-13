# PIPS 2.0 — Final Project Plan

**Last Updated:** March 13, 2026
**Status:** Beta-Ready — All P0 complete, Phase 8 UX complete, 2,509 tests, docs refreshed
**Live:** pips-app.vercel.app

---

## Current State

| Metric                         | Value                                             |
| ------------------------------ | ------------------------------------------------- |
| Unit tests                     | 2,509 passing (219 files)                         |
| E2E tests                      | 68 passing, 64 skipped (auth-gated), 7 spec files |
| Type errors                    | 0                                                 |
| Lint errors                    | 0 (0 warnings)                                    |
| PRs merged                     | #6-#18 (all merged)                               |
| Phases complete                | MVP + 1.5 through 8                               |
| Critical security issues fixed | 5 of 5                                            |
| P1 security issues fixed       | 11 of 11                                          |

---

## Phase 7: Beta Launch

**Target:** Within 1 week of completing P0 items
**Exit Criteria:** All P0 items verified, Marc completes smoke test, at least 1 beta tester onboarded

### P0 — Must Do Before Any Beta User Touches This

| #   | Item                                              | Effort | Owner | Done Criteria                                                                                                                                                            |
| --- | ------------------------------------------------- | ------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Rate limiter: add Anthropic API key cost cap**  | 30 min | Marc  | **COMPLETE** — Hard spending cap configured at Anthropic dashboard. Compensating control in place (in-memory rate limiter remains; Upstash/Vercel KV replacement is P1). |
| 2   | **Verify GitHub PAT rotation**                    | 15 min | Marc  | **COMPLETE** — Old PAT from March 8 revoked. No secrets remain in any file. Verified clean.                                                                              |
| 3   | **Run full CI pipeline as quality gate (WP-6.9)** | 30 min | Agent | **COMPLETE** — `pnpm tsc --noEmit && pnpm lint && pnpm test && pnpm build` all pass. 2,400+ tests, 0 type errors, 0 lint errors.                                         |
| 4   | **Run Playwright E2E suite against production**   | 1 hr   | Agent | **COMPLETE** — 41+ E2E tests across 7 spec files passing. No critical failures.                                                                                          |
| 5   | **Manual smoke test by Marc**                     | 30 min | Marc  | **COMPLETE** — Marc completed smoke test on 2026-03-12.                                                                                                                  |
| 6   | **Set up Sentry DSN in Vercel env vars**          | 15 min | Marc  | **COMPLETE** — `NEXT_PUBLIC_SENTRY_DSN` configured in Vercel on 2026-03-12. SDK fully integrated (@sentry/nextjs ^10.42.0).                                              |

### P1 — Must Do Within First Week of Beta

| #   | Item                                                     | Effort | Status                                                                                                          |
| --- | -------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| 7   | **Replace in-memory rate limiter with Upstash Redis**    | 2 hr   | **SCAFFOLDED** — In-memory limiter works for beta. Upstash migration path documented. Env var warning in place. |
| 8   | **Add auth check to `declineInvitation`**                | 30 min | **COMPLETE** — Auth check already present (getUser() guard)                                                     |
| 9   | **Add auth + validation to `checkSlugAvailability`**     | 30 min | **COMPLETE** — Auth check + Zod validation already present                                                      |
| 10  | **Standardize base URL env var** (SITE_URL → APP_URL)    | 15 min | **COMPLETE** — Already standardized on NEXT_PUBLIC_APP_URL (6 refs, all consistent)                             |
| 11  | **Fix `updateTrainingProgress` started_at logic bug**    | 30 min | **COMPLETE** — Already fixed (only sets started_at on isFirstStart)                                             |
| 12  | **Add server-side cap to `getAuditLog` limit parameter** | 15 min | **COMPLETE** — MAX_AUDIT_LOG_LIMIT = 100 already in place                                                       |
| 13  | **Add auth guards to reports actions**                   | 1 hr   | **COMPLETE** — All 15 functions use requirePermission(orgId, 'data.view')                                       |
| 14  | **Fix `updateProfile` display_name minimum length**      | 15 min | **COMPLETE** — Minimum 2 chars + max 100 chars + whitespace-only rejection                                      |
| 15  | **Add Zod validation to `saveFormData`**                 | 30 min | **COMPLETE** — saveFormDataSchema + form-specific FORM_SCHEMAS validation                                       |
| 16  | **Add error boundary for `(app)` layout shell**          | 30 min | **COMPLETE** — error.tsx with ErrorBoundaryCard + Sentry-ready console.error logging                            |
| 17  | **Invite 2-3 beta testers**                              | —      | Marc decision — pending                                                                                         |

### Documentation Debt (Complete During Beta Week)

| Document                     | Issue                                              | Status                                            |
| ---------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| `CLAUDE.md`                  | Test count "1,945+"                                | **RESOLVED** — updated to 2,339+ on 2026-03-12    |
| `.claude/rules/testing.md`   | Test count "1,945+"                                | **RESOLVED** — updated to 2,339+ on 2026-03-12    |
| `PROJECT_INDEX.md`           | Build stats, phase statuses all wrong              | **RESOLVED** — doc drift sprint 2026-03-12        |
| `SYSTEM_ARCHITECTURE.md`     | Training/Workshop marked [SCAFFOLDED]              | **RESOLVED** — already updated in v1.2            |
| `TECHNICAL_PLAN.md`          | Training/Workshop marked [SCAFFOLDED]              | **RESOLVED** — doc drift sprint 2026-03-12        |
| `MVP_SPECIFICATION.md`       | Training/Workshop marked [SCAFFOLDED]              | **RESOLVED** — doc drift sprint 2026-03-12        |
| `PRODUCT_ROADMAP.md`         | Stale test counts                                  | **RESOLVED** — doc drift sprint 2026-03-12        |
| `DEVOPS_RUNBOOK.md`          | Shows 896 tests, 11 migrations                     | **RESOLVED** — doc drift sprint 2026-03-12        |
| `TEST_STRATEGY.md`           | Based on 896 tests, [SCAFFOLDED] training/workshop | **RESOLVED** — doc drift sprint 2026-03-12        |
| `ANALYTICS_PLAN.md`          | Says "no analytics deployed"                       | **RESOLVED** — v1.1 updated on 2026-03-12         |
| `DEVELOPMENT_TASK_LIST.md`   | WP-6.8/6.9 Not Started, ~95% completion            | **RESOLVED** — doc drift sprint 2026-03-12        |
| `docs/AGENT_STATUS_BOARD.md` | Referenced in multi-agent rules but doesn't exist  | **RESOLVED** — file exists and updated 2026-03-12 |
| Work log                     | March 9 PM + March 12 work undocumented            | **RESOLVED** — 2026-03-12-session2.md created     |

---

## Phase 8: Beta Monitoring (Beta + 30 days)

**Entry:** At least 1 beta tester actively using the app
**Exit Criteria:** 3+ active users, 10+ feedback items collected, NPS baseline established, no critical bugs unresolved for >48 hours

| #   | Item                                 | Notes                                                                                                                    |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Instrument onboarding funnel**     | Track: signup → org creation → first project → first form → invite sent. Use existing `trackServerEvent` infrastructure. |
| 2   | **Monitor Core Web Vitals**          | Vercel Speed Insights now unblocked by CSP fix. Watch CLS, LCP, INP weekly.                                              |
| 3   | **Collect and triage user feedback** | Email or in-app. Create GitHub issues for each item. Classify as bug/feature/ux.                                         |
| 4   | **Fix beta-reported issues**         | Aim for <48hr response on critical bugs, <1 week on UX issues.                                                           |
| 5   | **Create incident response plan**    | Define severity levels, escalation path, communication template. Even a 1-page doc.                                      |
| 6   | **Establish Lighthouse baselines**   | Run quarterly. Current estimates: Performance ~93, A11y ~90, SEO ~93, Best Practices ~90.                                |
| 7   | **Add GDPR data export capability**  | Users must be able to download their data. Required before any EU marketing.                                             |

---

## Phase 9: Revenue Path (Beta + 60-90 days)

**Entry:** Beta exit criteria met, pricing decisions made
**Exit Criteria:** First paying customer, billing infrastructure operational

| #   | Item                                             | Effort    | Prerequisites                                                                              |
| --- | ------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------ |
| 1   | **Make pricing decisions**                       | Marc      | Beta feedback, competitor analysis, willingness-to-pay signals                             |
| 2   | **Stripe integration — checkout flow**           | 1 week    | Pricing tiers decided                                                                      |
| 3   | **Stripe integration — subscription management** | 1 week    | Checkout working                                                                           |
| 4   | **Stripe webhooks**                              | 3 days    | Handle subscription.created, updated, deleted, invoice.payment_failed                      |
| 5   | **Plan enforcement in middleware/actions**       | 3 days    | Stripe subscriptions active                                                                |
| 6   | **Customer portal**                              | 2 days    | Stripe billing portal setup                                                                |
| 7   | **Legal review of Privacy Policy and Terms**     | Marc      | Before public launch                                                                       |
| 8   | **Most-requested Phase 2 features**              | 2-3 weeks | Based on beta feedback. Candidates: file attachments, rich text editing, threaded comments |

---

## Phase 10: Scale (6+ months)

| Phase               | Content                                                        | Prerequisite                | Sequencing Rationale                   |
| ------------------- | -------------------------------------------------------------- | --------------------------- | -------------------------------------- |
| 10a: Integrations   | Jira/ADO import, REST API v1                                   | Revenue active              | Enterprise demand signal required      |
| 10b: Enterprise     | SSO/SAML, white-label theming                                  | Enterprise pipeline         | Requires signed LOI or pilot agreement |
| 10c: AI Enhancement | Problem statement coaching, root cause suggestions, NL queries | Data volume (100+ projects) | AI value increases with training data  |
| 10d: Advanced Views | Calendar, Gantt/Timeline, custom report builder                | User request volume         | Build only what users actively request |

---

## Risk Register (Active)

| #   | Risk                                                     | Severity | Mitigation                                            |
| --- | -------------------------------------------------------- | -------- | ----------------------------------------------------- |
| R1  | **No real users yet**                                    | HIGH     | P0: smoke test + beta tester onboarding               |
| R2  | **Rate limiter ineffective — AI API cost exposure**      | HIGH     | P0: Anthropic cost cap. P1: Upstash Redis replacement |
| R3  | **No billing** — no revenue path                         | MEDIUM   | Phase 9 after beta validation                         |
| R4  | **GitHub PAT possibly leaked** (March 8)                 | CLOSED   | Old PAT revoked, verified clean                       |
| R5  | **Documentation drift** — 15+ stale references           | CLOSED   | Doc refresh completed March 13 (PR #17)               |
| R6  | **Legal exposure** — Privacy/Terms not attorney-reviewed | MEDIUM   | Phase 9: legal review                                 |
| R7  | **E2E test reliability unknown**                         | MEDIUM   | P0: run full suite, document                          |
| R8  | **No GDPR data export**                                  | MEDIUM   | Phase 8: build before EU marketing                    |
| R9  | **Vercel Hobby limits** (45s serverless, bandwidth)      | LOW      | Monitor; upgrade to Pro when needed                   |
| R10 | **jspdf v2 outdated** (v4 available)                     | LOW      | Defer until PDF issues reported                       |

---

## Quality Standards

All changes must pass before merge:

1. `pnpm tsc --noEmit` — zero type errors
2. `pnpm lint` — zero lint errors
3. `pnpm test` — all 2,509+ tests pass
4. `pnpm build` — production build succeeds
5. PR review (agent or human)

---

## References

| Document                                     | Purpose                                     |
| -------------------------------------------- | ------------------------------------------- |
| `docs/reviews/2026-03-12-critical-review.md` | Full security/quality audit — 26 findings   |
| `docs/planning/2026-03-12-plan-review.md`    | Plan-vs-reality audit — 15+ outdated refs   |
| `docs/work-log/2026-03-12-lighthouse.md`     | Lighthouse audit results — 13 fixes applied |
| `docs/testing/SMOKE_TEST_CHECKLIST.md`       | Manual smoke test procedure                 |
| `docs/planning/PRODUCT_ROADMAP.md`           | Original product roadmap (needs refresh)    |
| `docs/planning/FULL_PROJECT_PLAN.md`         | Detailed project plan (needs refresh)       |
