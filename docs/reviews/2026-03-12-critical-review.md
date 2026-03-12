# PIPS 2.0 Critical Review — March 12, 2026

## Executive Summary

PIPS 2.0 is a well-structured, production-ready SaaS application with strong security fundamentals, consistent authentication patterns, and thorough Zod validation across its server action layer. However, several genuine security vulnerabilities, a pattern of incorrect permission checks on ticket mutations, unbounded memory growth in serverless environments, and a missing `/tools` route protection combine to create real risk that warrants pre-launch remediation. The testing surface is wide but shallow in the areas that matter most — server action auth bypass paths, RLS edge cases, and concurrent mutation safety are under-covered.

---

## Critical Issues (Must Fix Before Launch)

### 1. `saveFormData` has no permission check — any authenticated user can write to any project's forms

**File:** `apps/web/src/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/actions.ts`, lines 14–58

The action authenticates the user but never calls `requirePermission` or verifies that the user belongs to the project's org or has any relationship to the project. An authenticated user from Org A can call `saveFormData('some-org-b-project-id', ...)` and it will succeed as long as RLS allows the upsert — but `project_forms` RLS depends on `org_id` being present. The insert does **not** set `org_id` on the row, relying entirely on the upsert conflict constraint `(project_id, step, form_type)`. If the RLS on `project_forms` does not enforce org membership independently of the form row's own columns, this is a cross-tenant data write.

**Fix:** Add `requirePermission` check against the project's `org_id` before the upsert.

---

### 2. `updateTicket`, `deleteTicket`, `setParentTicket`, `removeParentTicket`, `bulkDeleteTickets` all use `ticket.create` permission for destructive mutations

**File:** `apps/web/src/app/(app)/tickets/actions.ts`, lines 158, 228, 557, 639, 691

`requirePermission(ticket.org_id, 'ticket.create')` is called as the authorization gate for `updateTicket`, `deleteTicket`, and several related mutations. This means any user with `ticket.create` permission can delete or structurally modify any ticket in the org regardless of whether a separate `ticket.delete` or `ticket.update` permission exists in the permission model.

**Fix:** Use the semantically correct permissions: `ticket.update` for updates, `ticket.delete` for deletion.

---

### 3. `/tools` is missing from `PROTECTED_PATHS` in middleware

**File:** `apps/web/src/middleware.ts`, lines 9–23

The `(app)` layout includes a "Tools" nav item pointing to `/tools`. The middleware's `PROTECTED_PATHS` array does not include `/tools`. This means an unauthenticated user can access `/tools` and `/tools/[toolSlug]` without being redirected to `/login`.

**Fix:** Add `/tools` to the `PROTECTED_PATHS` array in middleware.

---

### 4. In-memory rate limiter is ineffective in serverless/multi-instance deployments

**File:** `apps/web/src/lib/rate-limit.ts`, lines 1–58

The `checkRateLimit` function uses a module-level `Map` as its store. In Vercel's serverless/edge runtime, each function invocation may run in an isolated instance with a fresh module state. The rate limit counter resets per cold start. The `/api/ai/assist` endpoint — calling a paid Anthropic API — relies on this broken rate limiter as its only server-side cost control.

**Fix:** Replace with a persistent store (Redis via Upstash, Supabase row with TTL, or Vercel KV). At minimum, add a hard cost cap at the Anthropic API key level.

---

### 5. `createTicketsFromChecklist` uses `.single()` instead of `.maybeSingle()` — throws on no-membership

**File:** `apps/web/src/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/implementation-checklist/checklist-ticket-actions.ts`, line 43

All other membership lookups in the codebase correctly use `.maybeSingle()`. Using `.single()` here will cause an unhandled exception (PGRST116), manifesting as a 500 error rather than the intended error message.

**Fix:** Change `.single()` to `.maybeSingle()`.

---

## High Priority Issues (Should Fix Soon)

### 6. PDF export fetches ticket counts using non-existent status values

**File:** `apps/web/src/app/(app)/export/pdf-actions.ts`, lines 77–103

Queries for `'open'` and `'review'` statuses, but valid statuses are `backlog`, `todo`, `in_progress`, `in_review`, `blocked`, `done`, `cancelled`. These queries always return `count: 0`.

**Fix:** Replace `'open'` with `'todo'` and `'review'` with `'in_review'`.

---

### 7. `updateProfile` has no minimum length validation on `display_name`

**File:** `apps/web/src/app/(app)/profile/actions.ts`, lines 33–47

A user can set their display name to a single space, which silently becomes null.

---

### 8. `declineInvitation` does not require authentication

**File:** `apps/web/src/app/(auth)/invite/[token]/actions.ts`, lines 180–208

Anyone with a token URL can revoke an invitation without being authenticated.

---

### 9. `getAdminData` fetches entire tables with no pagination or limit

**File:** `apps/web/src/app/(app)/settings/admin/actions.ts`, lines 54–71

Both `tickets` and `project_forms` queries have no `.limit()`. Should use `{ count: 'exact', head: true }`.

---

### 10. `getTeamMembersTable` fetches entire org audit log into memory

**File:** `apps/web/src/app/(app)/reports/actions.ts`, lines 528–539

No `.limit()` on audit_log query. Should use aggregation or add a reasonable limit.

---

### 11. `AppLayout` uses `export default` — but Next.js requires it for routing files

**File:** `apps/web/src/app/(app)/layout.tsx`, line 227

128 files use `export default`. CLAUDE.md says named exports only. This rule needs a documented exception for Next.js routing files.

---

### 12. `getMyTickets` accepts caller-supplied `userId` and `orgId` with no server-side validation

**File:** `apps/web/src/app/(app)/my-work/actions.ts`, lines 22–92

Should resolve `userId` from `supabase.auth.getUser()` inside the action.

---

## Medium Priority Issues (Nice to Have)

### 13. User-supplied content in audit log descriptions is fragile against XSS

**File:** `apps/web/src/app/(app)/dashboard/actions.ts`, lines 168–181

Currently safe via React text nodes, but the pattern is fragile if rendering context changes.

---

### 14. `/tools` route uses `[toolSlug]` instead of `[toolId]` pattern

Minor naming inconsistency with other dynamic routes.

---

### 15. Reports actions have N+1 query pattern across 6 functions

**File:** `apps/web/src/app/(app)/reports/actions.ts` — 12 round-trips that could be 2.

---

### 16. `saveFormData` passes data with no Zod validation against form schema

**File:** `forms/actions.ts` — Should call `FORM_SCHEMAS[formType].safeParse(data)` before upsert.

---

### 17. `checkSlugAvailability` can be called without authentication

**File:** `apps/web/src/app/(app)/onboarding/actions.ts`, lines 14–20

Uses admin client with no auth check. Enables org slug enumeration.

---

### 18. Dual env var for base URL (`NEXT_PUBLIC_SITE_URL` vs `NEXT_PUBLIC_APP_URL`)

**File:** `apps/web/src/app/api/notifications/email/route.ts`, line 43

Standardize on one env var.

---

### 19. `updateTrainingProgress` always overwrites `started_at`

**File:** `apps/web/src/app/(app)/training/actions.ts`, lines 145–146

`update.started_at` is always undefined on a fresh object. The condition is always true.

---

### 20. `getAuditLog` pagination has no server-side cap on limit parameter

**File:** `apps/web/src/app/(app)/settings/audit-log/actions.ts`, line 34

A caller can pass `limit: 100000`.

---

## Low Priority / Future Considerations

### 21. `jspdf` v2 is outdated (v4 available)

### 22. Sentry DSN may not be configured in production

### 23. Middleware makes a DB call on every protected page request

### 24. Workshop timer has a 1-second stale closure window

### 25. No error boundary for the main `(app)` layout shell

### 26. Multi-org support assumes single org per user with no switching UI

---

## Security Audit Results

| Finding                                                | Severity | File                                     | Notes                                      |
| ------------------------------------------------------ | -------- | ---------------------------------------- | ------------------------------------------ |
| `saveFormData` missing permission check                | High     | `forms/actions.ts:14`                    | Cross-org write possible                   |
| Wrong permission (`ticket.create`) on delete/update    | High     | `tickets/actions.ts:158,228,557,639,691` | Semantic mismatch                          |
| `/tools` unprotected in middleware                     | High     | `middleware.ts:9-23`                     | App routes accessible unauthenticated      |
| In-memory rate limiter bypassed in serverless          | High     | `rate-limit.ts`                          | AI API cost exposure                       |
| `declineInvitation` unauthenticated                    | Medium   | `invite/[token]/actions.ts:180`          | Token IDOR                                 |
| `getMyTickets` accepts caller-supplied userId          | Medium   | `my-work/actions.ts:22`                  | Can query other users' tickets             |
| `checkSlugAvailability` unauthenticated + admin client | Low      | `onboarding/actions.ts:14`               | Org slug enumeration                       |
| Dual env var for base URL                              | Low      | `notifications/email/route.ts:43`        | Misconfiguration risk                      |
| No SQL injection surface                               | Pass     | All actions                              | Supabase client uses parameterized queries |
| No hardcoded secrets found                             | Pass     | All files                                |                                            |
| Service role key not exposed client-side               | Pass     | `admin.ts`                               | Server-only                                |

---

## Testing Gap Analysis

1. `saveFormData` with cross-org `projectId` — no cross-tenant write test
2. `updateTicket` and `deleteTicket` permission semantics — only happy path tested
3. PDF export status mismatch — no test asserts correct ticket status values
4. Rate limiter under serverless conditions — no cold-start test
5. `createTicketsFromChecklist` `.single()` crash — no no-membership test
6. `updateTrainingProgress` start time overwrite — no idempotency test
7. `getMyTickets` with mismatched userId — no authorization test
8. Invitation decline without authentication — no unauthed test
9. Error boundaries — no tests for unexpected throws in server actions

---

## Architecture Observations

### Structural strengths:

- Auth uses `supabase.auth.getUser()` (server-validated) throughout, never client-side `getSession()`
- Open redirect protection is explicit and correct
- Email enumeration prevention on both login and forgot password
- Zod `safeParse` used consistently across all server actions
- `requirePermission` is centralized and throws correctly
- Circular reference detection in `setParentTicket` is pragmatic and correct
- Workshop realtime hook properly cleans up subscriptions

### Structural concerns:

1. `STEP_ENUM_TO_INDEX` duplicated in 3 files — should be in `@pips/shared`
2. `(app)/layout.tsx` is a 228-line client component — should be decomposed
3. `getAdminData` is a 182-line monolith with 7 sequential queries
4. Reports actions have no auth guard at the action level — rely entirely on RLS
5. 128 files use `export default` despite CLAUDE.md "named exports only" rule

---

## Positive Observations

1. Auth is correctly implemented everywhere — server-validated, never client-side
2. Open redirect protection is thoughtful and correct
3. Email enumeration prevention on signup and forgot password
4. Zod schema library used consistently and correctly
5. `requirePermission` pattern is solid and consistent
6. In-memory rate limiter has periodic cleanup (good within single process)
7. `createOrganization` has proper rollback logic
8. Circular reference detection in ticket hierarchy
9. `saveFormData` upsert uses proper conflict target
10. Workshop realtime hook properly cleans up

---

**Review prepared:** March 12, 2026
**Reviewer:** Claude Code (critical review agent)
**Scope:** Full application codebase — 462 TSX files, 141 TS files, all server actions, middleware, hooks, stores, lib utilities
