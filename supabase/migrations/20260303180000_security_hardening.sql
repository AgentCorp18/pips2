-- Security Hardening Migration
-- Fixes critical RLS policy vulnerabilities identified in security audit

-- ============================================================
-- FIX 1: org_members INSERT policy (CRITICAL)
-- The old policy allowed any authenticated user to add themselves
-- as owner of ANY org, not just newly created ones.
-- New policy: self-add as owner only when org has zero existing members.
-- ============================================================

DROP POLICY IF EXISTS "Owner/admin can add members" ON org_members;

CREATE POLICY "Owner/admin can add members"
  ON org_members FOR INSERT
  WITH CHECK (
    user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[])
    OR (
      -- Allow users to add themselves as owner ONLY for a brand-new org (no members yet)
      user_id = auth.uid()
      AND role = 'owner'
      AND NOT EXISTS (
        SELECT 1 FROM org_members existing
        WHERE existing.org_id = org_members.org_id
      )
    )
  );

-- ============================================================
-- FIX 2: notifications INSERT policy (MEDIUM)
-- Old policy: WITH CHECK (true) — any user could create fake
-- notifications in any org.
-- New policy: restrict inserts to orgs the user belongs to.
-- Triggers still work because they run as the triggering user,
-- who is a member of the relevant org.
-- ============================================================

DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Org members can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
  );
