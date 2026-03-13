# PIPS 2.0 — Incident Response Plan

> **Version:** 1.0
> **Created:** 2026-03-12
> **Author:** DevOps Agent
> **Status:** Active
> **Production URL:** https://pips-app.vercel.app
> **Supabase Project:** `cmrribhjgfybbxhrsxqi` (us-east-2)

---

## 1. Contact

| Role            | Name        | Contact             |
| --------------- | ----------- | ------------------- |
| Owner / On-Call | Marc Albers | GitHub: AgentCorp18 |

All incidents are owned by Marc. There is no on-call rotation at this stage. During beta, Marc is the single point of contact for all incidents.

---

## 2. Severity Levels

| Severity | Definition                                                         | Response Time |
| -------- | ------------------------------------------------------------------ | ------------- |
| P0       | Production is completely down (login broken, all pages 500)        | Immediate     |
| P1       | Core workflow broken (cannot create projects, tickets not loading) | < 2 hours     |
| P2       | Feature degraded (a specific form broken, email not sending)       | < 24 hours    |
| P3       | Cosmetic or minor UX issue                                         | Next sprint   |

---

## 3. How to Check System Status

### Vercel (Frontend / Hosting)

1. Go to [Vercel Dashboard](https://vercel.com/marcaalbers-5708s-projects/pips-app)
2. Check **Deployments** tab — look for failed or stuck deployments
3. Check **Functions** tab — look for error rate spikes or timeout errors
4. Check Vercel Status: [vercel-status.com](https://www.vercel-status.com/)

### Supabase (Database / Auth)

1. Go to [Supabase Dashboard](https://app.supabase.com/project/cmrribhjgfybbxhrsxqi)
2. Check **Database** → **Logs** for query errors or connection failures
3. Check **Auth** → **Logs** for authentication failures
4. Check Supabase Status: [status.supabase.com](https://status.supabase.com/)

### Application Health

```bash
# Check the health endpoint
curl https://pips-app.vercel.app/api/health

# Expected response: { "status": "ok", "timestamp": "..." }
```

### Sentry (Error Monitoring)

- Sentry is configured but DSN not yet active in production. When set up, errors will appear in the Sentry dashboard.
- Until then, check Vercel Function logs for unhandled errors.

---

## 4. Common Issues and Fixes

### Auth Failures (Users Cannot Log In)

**Symptoms:** Login page returns error, JWT invalid errors in logs, "Auth session missing" errors.

**Diagnosis:**

1. Check Supabase Auth logs for failed sign-in attempts
2. Check if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel env vars
3. Check if Supabase project is paused (free tier pauses after 1 week of inactivity)

**Fix:**

- If Supabase paused: go to Supabase dashboard → **Settings** → unpause the project
- If env vars missing: add them in Vercel → **Settings** → **Environment Variables** → redeploy
- If JWT expired: no action needed — Supabase auto-refreshes tokens via middleware

---

### Database Connection Failures (DB Queries Failing)

**Symptoms:** 500 errors on data pages, "connection refused" or "too many connections" in logs.

**Diagnosis:**

1. Check Supabase → **Database** → **Logs**
2. Look for connection pool exhaustion (`max_connections` exceeded) or long-running queries

**Fix:**

- Connection pool exhausted: Vercel serverless functions each open a connection. On Supabase free tier, the connection limit is low. Short-term: redeploy to reset connections. Long-term: add Supabase connection pooler (PgBouncer).
- Slow query: identify the slow query in Supabase logs and add an index, or add query timeout.

---

### Build Failures (Deployment Failing)

**Symptoms:** Vercel deployment shows "Build Failed", new code not going live.

**Diagnosis:**

1. Check Vercel → **Deployments** → click the failed deployment → view **Build Logs**
2. Look for TypeScript errors, lint errors, or missing env vars at build time

**Fix:**

```bash
# Reproduce locally
pnpm tsc --noEmit    # Check for type errors
pnpm lint            # Check for lint errors
pnpm build           # Check for build errors

# Fix the errors and push again
git add -A && git commit -m "fix(build): resolve build failure"
git push origin main
```

---

### Email Not Sending (Resend Failures)

**Symptoms:** Users not receiving invitation emails or notification emails.

**Diagnosis:**

1. Check Resend dashboard for failed sends
2. Check `RESEND_API_KEY` is set in Vercel env vars
3. Check Resend status: [resend.com/status](https://resend.com/status)

**Fix:**

- API key missing: add `RESEND_API_KEY` in Vercel → **Environment Variables** → redeploy
- Resend outage: wait for Resend to recover; emails are not queued so they will need to be resent manually if critical

---

### AI Writing Assistant Not Working

**Symptoms:** AI assist button fails, streaming responses error out.

**Diagnosis:**

1. Check `ANTHROPIC_API_KEY` is set in Vercel env vars
2. Check Anthropic usage dashboard for rate limits or spend cap hit

**Fix:**

- API key missing: add `ANTHROPIC_API_KEY` in Vercel → **Environment Variables** → redeploy
- Spend cap hit: raise the cap at [console.anthropic.com](https://console.anthropic.com) → **Plans & Billing**
- Note: in-memory rate limiter is ineffective in serverless (P1 item — replace with Upstash Redis)

---

## 5. Rollback Procedure

Use rollback when a deployment causes a P0 or P1 incident.

### Option A: Instant Rollback via Vercel (Fastest)

1. Go to Vercel → **Deployments**
2. Find the last known-good deployment (before the broken one)
3. Click the **...** menu → **Promote to Production**
4. Verify the site is working after the rollback

This takes approximately 30 seconds. No code changes required.

---

### Option B: Git Revert and Redeploy

Use when you need to document the rollback in git history.

```bash
# Find the commit to revert
git log --oneline -10

# Revert the bad commit (creates a new commit)
git revert <bad-commit-hash>

# Push to trigger a new deployment
git push origin main
```

Vercel will auto-deploy on push to `main`. The deployment takes 1-3 minutes.

---

### Option C: Database Migration Rollback

If a migration broke the database schema:

```bash
# Connect to Supabase and run the rollback SQL manually
# (Migrations in supabase/migrations/ do not have automatic rollback scripts)
# You must write the inverse SQL manually.

# Example: if a migration added a column, rollback would be:
ALTER TABLE public.tablename DROP COLUMN IF EXISTS new_column;
```

**Important:** Always verify data integrity after a schema rollback. RLS policies may also need to be updated.

---

## 6. Post-Incident Checklist

After resolving any P0 or P1 incident:

- [ ] Root cause identified and documented
- [ ] Fix applied and verified in production
- [ ] Vercel deployment showing healthy
- [ ] Supabase logs show no ongoing errors
- [ ] Create a GitHub issue for the root cause fix if not already resolved
- [ ] Update this document if a new incident type was discovered

---

## 7. Useful Links

| Resource           | URL                                                    |
| ------------------ | ------------------------------------------------------ |
| Vercel Dashboard   | https://vercel.com/marcaalbers-5708s-projects/pips-app |
| Supabase Dashboard | https://app.supabase.com/project/cmrribhjgfybbxhrsxqi  |
| GitHub Repository  | https://github.com/AgentCorp18/pips2                   |
| Vercel Status      | https://www.vercel-status.com/                         |
| Supabase Status    | https://status.supabase.com/                           |
| Resend Dashboard   | https://resend.com/                                    |
| Anthropic Console  | https://console.anthropic.com/                         |
| Production App     | https://pips-app.vercel.app                            |
