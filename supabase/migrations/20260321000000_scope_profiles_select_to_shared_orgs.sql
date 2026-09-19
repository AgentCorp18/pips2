-- ============================================================
-- SECURITY: scope profiles SELECT to organizations the caller shares
--
-- The initial schema (20260303000000_initial_schema.sql, lines 1020-1022)
-- defined the profiles SELECT policy as USING (true). That let any authenticated
-- user of any organization read every profile row on the platform — cross-tenant
-- PII disclosure and a ready-made email-harvesting primitive.
--
-- Visibility now covers:
--   1. the caller's own row (needed before/while they belong to an org), and
--   2. profiles of users who share at least one organization with the caller.
--
-- Audited read paths, all of which stay within an org and are unaffected:
--   chat/actions.ts:157,231,851 (channel members, message authors, org members)
--   dashboard/actions.ts:702, dashboard/page.tsx:77 (own row)
--   layout.tsx:23 (own row), profile/actions.ts (own row)
--   projects/[projectId]/overview-actions.ts:182, reports/actions.ts:811,912
--   settings/audit-log/actions.ts:83, settings/members/actions.ts:179,217
--   settings/security/export-data-action.ts:23
--   tickets/[ticketId]/audit-log-actions.ts:126, comment-actions.ts:98
-- The cross-org readers — admin/actions.ts and invite/[token]/actions.ts:76 —
-- use the service-role admin client and therefore bypass RLS entirely.
--
-- NOTE: auth.uid() is wrapped in a scalar subquery so Postgres evaluates it once
-- per statement rather than once per row.
-- ============================================================

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

CREATE POLICY "Users can view profiles in their organizations"
  ON profiles FOR SELECT
  USING (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1
      FROM org_members om
      WHERE om.user_id = profiles.id
        AND om.org_id IN (SELECT user_org_ids())
    )
  );

COMMENT ON POLICY "Users can view profiles in their organizations" ON profiles IS
  'Tenant isolation: a user may read their own profile and the profiles of users sharing an org with them.';
