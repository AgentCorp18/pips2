# PIPS 2.0 — Final Project Plan

**Last Updated:** March 12, 2026
**Status:** Pre-Beta — Security hardening complete, Lighthouse audit complete
**Live:** pips-app.vercel.app

---

## Current State

| Metric                         | Value                                                |
| ------------------------------ | ---------------------------------------------------- |
| Unit tests                     | 2,339 passing (210 files)                            |
| Type errors                    | 0                                                    |
| Lint errors                    | 0 (30 warnings)                                      |
| PRs merged today               | #6 (Privacy/Terms pages), #7 (Security + Lighthouse) |
| Phases complete                | MVP + 1.5 through 6                                  |
| Critical security issues fixed | 5 of 5                                               |
| High priority issues fixed     | 3 of 7                                               |

---

## Phase 7: Beta Launch

**Target:** Within 1 week of completing P0 items
**Exit Criteria:** All P0 items verified, Marc completes smoke test, at least 1 beta tester onboarded

### P0 — Must Do Before Any Beta User Touches This

| #   | Item                                              | Effort | Owner | Done Criteria                                                                                                                                                                                                          |
| --- | ------------------------------------------------- | ------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Rate limiter: add Anthropic API key cost cap**  | 30 min | Marc  | Hard spending cap configured at Anthropic dashboard. Document the cap value. This is a compensating control — the in-memory rate limiter remains ineffective in serverless until replaced with Upstash/Vercel KV (P1). |
| 2   | **Verify GitHub PAT rotation**                    | 15 min | Marc  | (a) Old PAT from March 8 is revoked in GitHub Settings → Developer Settings → PATs. (b) New PAT (if any) is in Vercel env vars, not in any file. (c) No secrets remain in work log files.                              |
| 3   | **Run full CI pipeline as quality gate (WP-6.9)** | 30 min | Agent | `pnpm tsc --noEmit && pnpm lint && pnpm test && pnpm build` — all pass. Document results in work log.                                                                                                                  |
| 4   | **Run Playwright E2E suite against production**   | 1 hr   | Agent | `pnpm exec playwright test` — document pass/fail counts. Fix any critical failures.                                                                                                                                    |
| 5   | **Manual smoke test by Marc**                     | 30 min | Marc  | Follow `docs/testing/SMOKE_TEST_CHECKLIST.md`. Sign in, create project, fill one form, create ticket, check dashboard.                                                                                                 |
| 6   | **Set up Sentry DSN in Vercel env vars**          | 15 min | Marc  | `NEXT_PUBLIC_SENTRY_DSN` configured in Vercel. Verify errors appear in Sentry dashboard.                                                                                                                               |

### P1 — Must Do Within First Week of Beta

| #   | Item                                                                          | Effort | Severity Source                                                            |
| --- | ----------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| 7   | **Replace in-memory rate limiter with Upstash Redis**                         | 2 hr   | Critical Review #4 — financial exposure on /api/ai/assist                  |
| 8   | **Add auth check to `declineInvitation`**                                     | 30 min | Critical Review #8 — High (token IDOR)                                     |
| 9   | **Add auth + validation to `checkSlugAvailability`**                          | 30 min | Critical Review #17 — Low (org slug enumeration)                           |
| 10  | **Standardize base URL env var** (NEXT_PUBLIC_SITE_URL → NEXT_PUBLIC_APP_URL) | 15 min | Critical Review #18                                                        |
| 11  | **Fix `updateTrainingProgress` started_at logic bug**                         | 30 min | Critical Review #19 — overwrites start time on every call                  |
| 12  | **Add server-side cap to `getAuditLog` limit parameter**                      | 15 min | Critical Review #20 — High (unbounded query)                               |
| 13  | **Add auth guards to reports actions**                                        | 1 hr   | Critical Review — 6 functions accept orgId without membership verification |
| 14  | **Fix `updateProfile` display_name minimum length**                           | 15 min | Critical Review #7 — whitespace silently becomes null                      |
| 15  | **Add Zod validation to `saveFormData`**                                      | 30 min | Critical Review #16 — form data stored without schema validation           |
| 16  | **Add error boundary for `(app)` layout shell**                               | 30 min | Critical Review #25 — layout crash = entire app down                       |
| 17  | **Invite 2-3 beta testers**                                                   | —      | Marc decision                                                              |

### Documentation Debt (Complete During Beta Week)

| Document                     | Issue                                                  | Action                                             |
| ---------------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| `CLAUDE.md`                  | Test count "1,945+"                                    | Update to 2,339+                                   |
| `.claude/rules/testing.md`   | Test count "1,945+"                                    | Update to 2,339+                                   |
| `PROJECT_INDEX.md`           | Build stats, phase statuses, repo visibility all wrong | Full refresh                                       |
| `SYSTEM_ARCHITECTURE.md`     | Training/Workshop marked [SCAFFOLDED]                  | Change to [BUILT]                                  |
| `TECHNICAL_PLAN.md`          | References Next.js 15                                  | Update to Next.js 16                               |
| `MVP_SPECIFICATION.md`       | References Next.js 15                                  | Update to Next.js 16                               |
| `PRODUCT_ROADMAP.md`         | References Next.js 15                                  | Update to Next.js 16                               |
| `DEVOPS_RUNBOOK.md`          | Shows 896 tests, 11 migrations                         | Full metrics refresh                               |
| `TEST_STRATEGY.md`           | Based on 896 tests                                     | Rewrite Section 1                                  |
| `ANALYTICS_PLAN.md`          | Says "no analytics deployed"                           | Update — Vercel Analytics + trackServerEvent exist |
| `docs/AGENT_STATUS_BOARD.md` | Referenced in multi-agent rules but doesn't exist      | Create or remove reference                         |
| Work log                     | March 9 PM + March 12 work undocumented                | Add entries                                        |

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
| R4  | **GitHub PAT possibly leaked** (March 8)                 | HIGH     | P0: verify rotation                                   |
| R5  | **Documentation drift** — 15+ stale references           | MEDIUM   | Doc debt sprint during beta week                      |
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
3. `pnpm test` — all 2,339+ tests pass
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
