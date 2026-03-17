# PIPS 2.0 — Final Project Plan

**Last Updated:** March 17, 2026
**Status:** Production — All phases through 10 complete, 3,073 tests, 18 CEO tickets resolved, chat + initiatives live, data reorganized, overnight improvement cycles complete
**Live:** pips-app.vercel.app

---

## Current State

| Metric                         | Value                                             |
| ------------------------------ | ------------------------------------------------- |
| Unit tests                     | 3,073 passing (257 files)                         |
| E2E tests                      | 68 passing, 64 skipped (auth-gated), 7 spec files |
| Type errors                    | 0                                                 |
| Lint errors                    | 0 (0 warnings)                                    |
| PRs merged                     | #6-#23 (all merged)                               |
| Phases complete                | MVP + 1.5 through 10 + CEO bug fix sprints        |
| Critical security issues fixed | 5 of 5                                            |
| P1 security issues fixed       | 11 of 11                                          |
| CEO Request tickets resolved   | 16 of 16 (all complete)                           |
| DB migrations applied          | 17 (production)                                   |

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

## Phase 8a: UX & Methodology Clarity — COMPLETE (2026-03-13)

**Implemented across PRs #14-#18:**

| Sprint                        | Items                                                                                                                  | Status |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------ |
| 1. Make the Methodology Click | Step context banners, time estimates, form hierarchy, progress bar, start-here card, step warnings                     | DONE   |
| 2. Content & Education        | 10 sample templates (56 forms, 57 tickets), common mistakes, facilitation guides, best practices, onboarding checklist | DONE   |
| 3. Functionality Enhancements | Inter-form data flow, ticket creation from forms, template selector in project creation, sandbox import                | DONE   |
| 4. Polish & Doc Refresh       | Completion celebrations, color audit, stepper progress, 4 docs refreshed                                               | DONE   |

---

## Phase 8b: Beta Monitoring (Beta + 30 days)

**Entry:** At least 1 beta tester actively using the app
**Exit Criteria:** 3+ active users, 10+ feedback items collected, NPS baseline established, no critical bugs unresolved for >48 hours

| #   | Item                                 | Notes                                                                                                                                                      |
| --- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Instrument onboarding funnel**     | Track: signup → org creation → first project → first form → invite sent. Use existing `trackServerEvent` infrastructure.                                   |
| 2   | **Monitor Core Web Vitals**          | Vercel Speed Insights now unblocked by CSP fix. Watch CLS, LCP, INP weekly.                                                                                |
| 3   | **Collect and triage user feedback** | Email or in-app. Create GitHub issues for each item. Classify as bug/feature/ux.                                                                           |
| 4   | **Fix beta-reported issues**         | Aim for <48hr response on critical bugs, <1 week on UX issues.                                                                                             |
| 5   | **Create incident response plan**    | Define severity levels, escalation path, communication template. Even a 1-page doc.                                                                        |
| 6   | **Establish Lighthouse baselines**   | Run quarterly. Current estimates: Performance ~93, A11y ~90, SEO ~93, Best Practices ~90.                                                                  |
| 7   | **Add GDPR data export capability**  | **COMPLETE** — "Download My Data" button on Settings > Security page. Exports JSON with profile, orgs, projects, tickets, forms, notifications, audit log. |

---

## Phase 9: Content, UX & Team Chat — COMPLETE (2026-03-14)

**Implemented in PR #22:**

| Sprint                | Items                                                                                                   | Status |
| --------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| 1. Content Alignment  | 8 content divergences resolved across book, guide, workbook, workshop, step-content sources             | DONE   |
| 2. Visual Consistency | Color audit, card layouts, form consistency, responsive behavior                                        | DONE   |
| 3. UX Polish          | Breadcrumbs, Cmd+K expanded to 12 actions, back navigation, empty states                                | DONE   |
| 4. Team Chat          | Real-time chat with channels, DMs, AI summaries, @mentions, notification integration, Supabase Realtime | DONE   |

Chat tables: `chat_channels`, `chat_channel_members`, `chat_messages`, `chat_summaries` — all with RLS via SECURITY DEFINER functions.

---

## Phase 10: Skills & Initiatives — COMPLETE (2026-03-14)

| Item                                     | Status |
| ---------------------------------------- | ------ |
| Initiatives DB tables + RLS              | DONE   |
| Full CRUD server actions                 | DONE   |
| Weighted progress by project priority    | DONE   |
| UI: list, create, detail, edit pages     | DONE   |
| Sidebar nav + command palette            | DONE   |
| CEO Request ticket type                  | DONE   |
| Auto-escalation to critical priority     | DONE   |
| Org-scoping bug fix (getCurrentOrg)      | DONE   |
| 6 Claude Code step skills                | DONE   |
| 11 Claude Code form skills               | DONE   |
| Test suites: chat (51), initiatives (83) | DONE   |

---

## CEO Bug Fix Sprints — COMPLETE (2026-03-15)

**18 CEO Request tickets triaged and resolved through PIPS methodology:**

| Ticket                   | Fix                                                                           | Status |
| ------------------------ | ----------------------------------------------------------------------------- | ------ |
| Channel not found error  | Fixed getCurrentOrg pattern in chat actions                                   | DONE   |
| Cannot edit ticket type  | Added Type select to ticket detail sidebar                                    | DONE   |
| Full-width tables        | Changed table containers to max-w-full px-4                                   | DONE   |
| Add time to dates        | FormattedDate component with showTime prop                                    | DONE   |
| Priority auto-escalation | Fixed to not override explicit priority                                       | DONE   |
| Chat RLS permissions     | Migration adding 'member' role to policies                                    | DONE   |
| Due date timezone        | parseDateForDisplay() for local midnight                                      | DONE   |
| Back button navigation   | router.replace() for filter/sort state                                        | DONE   |
| Board swimlane flip      | Status rows x Step columns                                                    | DONE   |
| CEO Request filter       | Added ceo_request to ALL_TYPES                                                | DONE   |
| Chat mobile              | Single-panel layout, touch targets                                            | DONE   |
| Failed to create channel | Backfilled General channels for 4 pre-existing orgs; trigger handles new orgs | DONE   |
| Mobile UI/UX             | Touch targets, form stacking, swimlane scroll, sidebar overlap fixes          | DONE   |
| Mobile scrolling         | Scroll container isolation, single active scrollable area                     | DONE   |
| Unsaved changes dialog   | Flush-save on navigation instead of false-positive dialog                     | DONE   |
| Activity feed display    | Fixed "System created comments" — entity-specific labels + friendly names     | DONE   |

---

## Data Reorganization & Cycle Time Feature (2026-03-16)

### Data Reorganization

5 original organizations consolidated into 2 clean orgs:

- **Test Organization** (`bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01`) — all fake/demo data (59 projects, 441 tickets, 7 teams, 23 channels, 2001 messages)
- **Real Use Cases** (`bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02`) — all real work (34 projects, 203 tickets, 8 initiatives, 3 teams, 8 channels)

Deleted orgs: PIPS Demo Company, Claude Projects, Beta Testers, PIPS Admin Test Org, Test

### Cycle Time Visibility (Built via PIPS 6-Step Process)

Problem: Timestamps (started_at, resolved_at) collected but never surfaced to users.

| Component             | Description                                                                                                   | Status |
| --------------------- | ------------------------------------------------------------------------------------------------------------- | ------ |
| `cycle-time.ts`       | Pure utility functions: daysBetween, formatDuration, getAgingLevel, getCycleTime, getLeadTime, getElapsedTime | DONE   |
| `CycleTimeBadge`      | Shows cycle/lead time for completed tickets, elapsed time with aging colors for in-progress                   | DONE   |
| `CycleTimeTrendChart` | Recharts LineChart: weekly avg cycle time + lead time over 12 weeks                                           | DONE   |
| `AgingTicketsAlert`   | Dashboard card listing top 10 in-progress tickets open > 7 days                                               | DONE   |
| Cycle time KPIs       | 3-column row on reports page: avg, median, longest open ticket                                                | DONE   |
| `updated_by` column   | Tracks who last modified a ticket, with trigger + backfill migration                                          | DONE   |
| Configurable columns  | Users can show/hide ticket table columns                                                                      | DONE   |
| 21 unit tests         | Full coverage of cycle-time utilities                                                                         | DONE   |

All documented in PIPS app with 7 forms across 6 steps as a real PIPS process demonstration.

---

## Overnight Improvement Cycles (2026-03-17)

Autonomous PIPS-driven improvement loops, each following the full 6-step methodology with 24+ forms filled per project.

| Cycle | Problem                                                                                                                                                                            | Fix                                                                                                                 | Commit               |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 9     | 4 server actions missing `requirePermission` checks                                                                                                                                | Added `requirePermission(orgId, 'data.view')` to getAgingTickets, getMyTickets, exportProjectsCSV, exportTicketsCSV | `7b0c180`            |
| 10    | Dead backend code: listProjectsWithForm/copyFormFromProject had no UI                                                                                                              | Built CopyFromProjectDialog component (177 lines) + 14 tests, integrated into FormShell                             | `99a1372`            |
| 11    | 3 critical bugs: cascading error handling in advanceStep/overrideStep, cross-org validation in copyFormFromProject, org_id filter in saveFormData                                  | Fixed all 3 with proper error returns and org validation                                                            | `049cdb4`, `966e486` |
| 12    | Missing page metadata and aria attributes on 3 pages + 4 decorative icons                                                                                                          | Added Metadata exports and aria-hidden="true"                                                                       | `ffca289`            |
| 13    | 5 server action robustness issues: streamText error handling, createProject silent failures, getInitiativeDetail org_id, bulkUpdateTickets state, inviteMember email normalization | All 5 fixed across 5 files                                                                                          | `f2d0e58f`           |

**Total impact:** 17 server actions hardened, 1 new UI component, 14 new tests, 5 security/reliability improvements.

---

## Next: Revenue Path (Beta + 60-90 days)

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

| #   | Risk                                                     | Severity | Mitigation                                                 |
| --- | -------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| R1  | **No real users yet**                                    | HIGH     | P0: smoke test + beta tester onboarding                    |
| R2  | **Rate limiter ineffective — AI API cost exposure**      | HIGH     | P0: Anthropic cost cap. P1: Upstash Redis replacement      |
| R3  | **No billing** — no revenue path                         | MEDIUM   | Phase 9 after beta validation                              |
| R4  | **GitHub PAT possibly leaked** (March 8)                 | CLOSED   | Old PAT revoked, verified clean                            |
| R5  | **Documentation drift** — 15+ stale references           | CLOSED   | Doc refresh completed March 13 (PR #17)                    |
| R6  | **Legal exposure** — Privacy/Terms not attorney-reviewed | MEDIUM   | Phase 9: legal review                                      |
| R7  | **E2E test reliability unknown**                         | MEDIUM   | P0: run full suite, document                               |
| R8  | **No GDPR data export**                                  | CLOSED   | Built: Settings > Security > Download My Data (2026-03-13) |
| R9  | **Vercel Hobby limits** (45s serverless, bandwidth)      | LOW      | Monitor; upgrade to Pro when needed                        |
| R10 | **jspdf v2 outdated** (v4 available)                     | LOW      | Defer until PDF issues reported                            |

---

## Quality Standards

All changes must pass before merge:

1. `pnpm tsc --noEmit` — zero type errors
2. `pnpm lint` — zero lint errors
3. `pnpm test` — all 3,073+ tests pass
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
| `docs/planning/PRODUCT_ROADMAP.md`           | Original product roadmap                    |
| `docs/planning/FULL_PROJECT_PLAN.md`         | Detailed project plan                       |
| `docs/planning/PIPS_VISION.md`               | Strategic vision & future roadmap           |
