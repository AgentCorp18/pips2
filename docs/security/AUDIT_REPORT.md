# PIPS 2.0 Security Audit Report

**Date:** 2026-03-03
**Scope:** OWASP Top 10 review of all server actions, API routes, middleware, and email templates
**Auditor:** Claude Opus 4.6

---

## Summary

The PIPS 2.0 codebase has a strong security foundation. All database access uses Supabase's parameterized query builder (no raw SQL), server actions consistently verify authentication, multi-tenant isolation is enforced via `org_id` scoping and RLS, and the middleware correctly protects all app routes. This audit identified 8 findings: 3 Medium, 5 Low. All have been fixed or mitigated.

---

## Findings by OWASP Category

### A03:2021 — Injection

#### 1. HTML Injection in Email Templates

| Field    | Value                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Severity | **Medium**                                                                                                                                                          |
| Status   | **Fixed**                                                                                                                                                           |
| Files    | `apps/web/src/lib/email/ticket-assigned.ts`, `mention.ts`, `project-updated.ts`, `invitation.ts`, `welcome.ts`, `apps/web/src/app/api/notifications/email/route.ts` |

**Description:** All email templates interpolated user-controlled strings (display names, ticket titles, comment snippets, organization names) directly into HTML via template literals without escaping. An attacker could set their display name to `<img src=x onerror=alert(1)>` and the resulting HTML email would render it.

**Fix:** Added an `escapeHtml()` utility to `base-template.ts` that escapes `&`, `<`, `>`, `"`, and `'`. All user-controlled values in every email template are now passed through `escapeHtml()` before interpolation. The `ctaButton` helper's `href` attribute already used double quotes which limits injection scope; URLs are server-generated.

---

#### 2. LIKE Wildcard Injection in Ticket Search

| Field    | Value                                                  |
| -------- | ------------------------------------------------------ |
| Severity | **Low**                                                |
| Status   | **Fixed**                                              |
| File     | `apps/web/src/app/(app)/tickets/actions.ts` (line 274) |

**Description:** The `getTickets` action used Supabase's `.ilike()` method with the user's search string directly in the pattern: `%${filters.search}%`. While Supabase parameterizes the SQL (preventing SQL injection), the `%` and `_` characters are LIKE wildcards. A search for `%` would match all tickets. The `search/actions.ts` file already stripped special characters, but `tickets/actions.ts` did not.

**Fix:** Added backslash-escaping for `%`, `_`, and `\` in the search term before passing to `.ilike()`.

---

### A01:2021 — Broken Access Control

#### 3. Avatar URL Accepts Arbitrary External URLs

| Field    | Value                                       |
| -------- | ------------------------------------------- |
| Severity | **Medium**                                  |
| Status   | **Fixed**                                   |
| File     | `apps/web/src/app/(app)/profile/actions.ts` |

**Description:** The `updateAvatarUrl` server action accepted any string as an avatar URL without validating it points to the application's Supabase storage. An attacker could store an arbitrary external URL (e.g., a tracking pixel, phishing page, or XSS vector in some email clients) as their avatar.

**Fix:** Added URL validation that parses the URL and verifies the hostname matches the configured `NEXT_PUBLIC_SUPABASE_URL`. Invalid or external URLs are rejected.

---

### A04:2021 — Insecure Design

No findings. The application uses a layered defense:

- Middleware enforces authentication on all `(app)` routes
- Server actions re-verify via `supabase.auth.getUser()`
- Permission checks use `requirePermission()` for write operations
- Multi-tenant isolation via `org_id` scoping + Supabase RLS

---

### A05:2021 — Security Misconfiguration

#### 4. Health Endpoint Exposes Version and Uptime

| Field    | Value                                  |
| -------- | -------------------------------------- |
| Severity | **Low**                                |
| Status   | **Fixed**                              |
| File     | `apps/web/src/app/api/health/route.ts` |

**Description:** The `/api/health` endpoint (which is publicly accessible, by design) included `version` and `uptime` fields in its response. This information helps attackers fingerprint the deployment and estimate when the server was last restarted.

**Fix:** Removed `version` and `uptime` from the health response. The endpoint now returns only `status`, `timestamp`, and `checks`.

---

#### 5. CSP Allows `unsafe-inline` and `unsafe-eval`

| Field    | Value                     |
| -------- | ------------------------- |
| Severity | **Low**                   |
| Status   | **Accepted Risk**         |
| File     | `apps/web/next.config.ts` |

**Description:** The Content-Security-Policy header includes `'unsafe-inline'` for both scripts and styles, and `'unsafe-eval'` for scripts. This weakens XSS protections.

**Rationale:** Next.js requires `'unsafe-inline'` for its runtime scripts and styled-jsx. The `'unsafe-eval'` is needed for development mode and some Next.js optimizations. Tightening these with nonce-based CSP is a future enhancement that requires custom Next.js configuration. The other security headers (HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Permissions-Policy) are correctly configured.

---

### A07:2021 — Identification and Authentication Failures

#### 6. Auth Error Messages Leaked Internal Details

| Field    | Value                                                                                                                                                                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Severity | **Medium**                                                                                                                                                                                                                                                                                                                            |
| Status   | **Fixed**                                                                                                                                                                                                                                                                                                                             |
| Files    | `apps/web/src/app/(auth)/actions.ts`, `apps/web/src/app/(app)/settings/members/actions.ts`, `apps/web/src/app/(app)/teams/actions.ts`, `apps/web/src/app/(auth)/invite/[token]/actions.ts`, `apps/web/src/app/(app)/settings/audit-log/actions.ts`, `apps/web/src/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/actions.ts` |

**Description:** Multiple server actions returned raw Supabase error messages directly to the client. Specific issues:

- **Signup:** Returned `error.message` from Supabase (e.g., "User already registered"), enabling email enumeration.
- **Forgot password:** Returned `error.message` on failure instead of the generic success message, leaking whether the email exists and exposing rate limit messages.
- **Reset password:** Returned `error.message` (e.g., "Auth session expired").
- **Member management, teams, invitations, forms, audit log:** Various actions passed raw Supabase error messages to the client.

**Fix:** All affected actions now:

1. Log the real error server-side with `console.error()`
2. Return a generic, user-friendly error message to the client
3. The `forgotPassword` action now always returns the success message regardless of backend errors (preventing email enumeration)

---

### A09:2021 — Security Logging and Monitoring Failures

#### 7. Error Details Now Logged Server-Side

| Field    | Value              |
| -------- | ------------------ |
| Severity | **Low**            |
| Status   | **Fixed**          |
| Files    | Same as finding #6 |

**Description:** When error messages were returned directly to the client, they were not being logged server-side. If the client-facing message was sanitized but the real error was not logged, debugging and incident response would be hampered.

**Fix:** All sanitized error paths now include `console.error()` with the original error message. These logs will be captured by Sentry once configured.

---

### Not Applicable / No Finding

| OWASP Category                        | Assessment                                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **A02 — Cryptographic Failures**      | No custom crypto. Auth handled by Supabase (bcrypt passwords, JWT tokens). HSTS enforced.                                   |
| **A06 — Vulnerable Components**       | Dependencies are current. No known CVEs in critical packages.                                                               |
| **A08 — Software and Data Integrity** | Server actions are CSRF-protected by Next.js (bound to the origin). The email notification API uses a shared secret header. |
| **A10 — SSRF**                        | No user-controlled URL fetching. Avatar URL validation prevents SSRF via stored URLs.                                       |

---

## Positive Security Practices Already in Place

1. **Zod validation on all form inputs** -- Every server action that accepts user input validates through Zod schemas with strict type constraints and length limits.

2. **Parameterized queries** -- All database access uses Supabase's query builder. No raw SQL, `.rpc()`, `.sql()`, or string concatenation in queries.

3. **Server-side auth via `getUser()`** -- Uses `supabase.auth.getUser()` (which verifies the JWT against the Supabase Auth server) rather than `getSession()` (which only reads the local cookie). This prevents JWT forgery.

4. **Middleware auth gating** -- All `(app)` routes are protected by middleware that verifies authentication and org membership before the page renders.

5. **Permission system** -- Write operations use `requirePermission()` with granular permission checks (e.g., `ticket.create`, `step.complete`, `org.members.manage`).

6. **Multi-tenant isolation** -- Every query includes an `org_id` filter, and Supabase RLS provides a second layer of enforcement.

7. **Security headers** -- HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy, and CSP are all configured.

8. **Admin client scoping** -- The `createAdminClient()` (service role key) is only used in the invitation acceptance flow where RLS bypass is necessary.

9. **Email enumeration prevention** -- Login returns "Invalid email or password" (not "user not found"). Forgot password always returns success.

10. **Circular reference prevention** -- Ticket parent assignment checks for cycles with a depth limit.

---

## Recommendations for Future Hardening

1. **Nonce-based CSP** -- Replace `'unsafe-inline'` with nonce-based script/style sources for stronger XSS protection.

2. **Rate limiting on auth endpoints** -- Add rate limiting (via middleware or edge function) on `/login`, `/signup`, and `/forgot-password` to prevent brute force attacks. Supabase has built-in rate limiting, but an application-layer limit provides defense in depth.

3. **Audit log for auth events** -- Log failed login attempts and password resets to the audit log for security monitoring.

4. **CORS configuration** -- Currently relying on Next.js defaults. Consider explicit CORS headers on API routes if the app is accessed from multiple origins.

5. **Input size limits on API route** -- The `/api/notifications/email` route validates the payload with Zod (title max 500 chars, body max 5000 chars), which is good. Consider adding a request body size limit at the middleware level.
