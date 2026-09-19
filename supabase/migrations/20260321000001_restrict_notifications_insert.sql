-- ============================================================
-- SECURITY: restrict who may insert notification rows
--
-- The initial schema (20260303000000_initial_schema.sql, lines 1484-1486)
-- defined the notifications INSERT policy as WITH CHECK (true), so any
-- authenticated user could create a notification for any user_id in any org_id.
-- That is a phishing primitive on a trusted surface, and it escalates: the cron
-- dispatch job turns notification rows into outbound email from our domain.
--
-- A caller may now only insert a notification when:
--   1. the row's org_id is an org the caller belongs to, AND
--   2. the recipient (user_id) is a member of that same org.
--
-- The notify_* trigger functions are SECURITY DEFINER and owned by the table
-- owner, so they are unaffected by this policy and keep working.
-- ============================================================

DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can notify members of their organizations"
  ON notifications FOR INSERT
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND EXISTS (
      SELECT 1
      FROM org_members om
      WHERE om.user_id = notifications.user_id
        AND om.org_id = notifications.org_id
    )
  );

COMMENT ON POLICY "Users can notify members of their organizations" ON notifications IS
  'Tenant isolation: a notification may only target a member of an org the inserting user belongs to.';
