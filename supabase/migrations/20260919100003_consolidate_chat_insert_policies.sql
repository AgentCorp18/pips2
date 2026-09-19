-- PERF + CORRECTNESS: collapse the duplicate permissive INSERT policies on chat_channels and
-- chat_channel_members. Supabase advisor lint: multiple_permissive_policies (8 findings).
--
-- Postgres ORs every permissive policy for an action, so the rule actually in force is the
-- union of both policies in each pair -- which is broader than either one reads on its own.
-- Spelling the union out as a single policy is the point of this migration: the perf saving is
-- secondary to being able to read the authorisation rule off the page.
--
-- WHAT THE UNION CURRENTLY ALLOWS
--
-- chat_channels INSERT
--   "Admins and managers can create channels": owner/admin/manager, AND created_by = auth.uid()
--   "Org members can create channels":         owner/admin/manager/member, NO created_by check
--   Union: any org member may create a channel, and may set created_by to another user,
--   because the second policy alone is enough to pass and it never constrains created_by.
--
-- chat_channel_members INSERT
--   "Admins and managers can add channel members": owner/admin/manager of the channel's org
--   "Channel members can add members":             any member of that channel, OR any
--                                                  owner/admin/manager/member of its org
--   Union: any org member may add anyone to any channel in their org.
--
-- WHAT THIS MIGRATION CHANGES
--
-- The member-level capability is preserved -- an org member can still create a channel and
-- still add members -- so this is not a downgrade of what the app can do today. Two things
-- do change, both deliberate:
--
--   1. created_by on chat_channels is now forced to the caller. Today the broader policy lets
--      a member insert a channel attributed to somebody else. That is an integrity hole, not a
--      feature.
--   2. The bare "is a member of this channel" path on chat_channel_members is dropped in favour
--      of the org-role test. In practice these coincide: auto_join_org_channels() only ever
--      adds org members to channels, so there is no channel member who is not also an org
--      member. It removes the case where channel membership alone, with no org standing,
--      conferred the right to add people.
--
-- IF THE INTENDED RULE IS STRICTER -- i.e. only owner/admin/manager should create channels or
-- add members, and plain members should not -- then drop 'member'::org_role from the two
-- ARRAY[...] lists below and nothing else needs to change. That is a product decision and is
-- flagged for Marc rather than made here.
--
-- Both replacement policies are scoped TO authenticated rather than left applicable to anon.
-- anon can never satisfy them anyway (user_org_ids() is empty without a session), so this
-- narrows the declared surface without changing behaviour.
--
-- auth.uid() is written as (select auth.uid()) to stay consistent with
-- 20260919100000_rls_initplan_optimization.sql.

BEGIN;

-- --- chat_channels ---------------------------------------------------------

DROP POLICY IF EXISTS "Admins and managers can create channels" ON public.chat_channels;
DROP POLICY IF EXISTS "Org members can create channels"          ON public.chat_channels;

CREATE POLICY "Org members can create channels"
  ON public.chat_channels
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND user_has_org_role(
          org_id,
          ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'member'::org_role])
    AND created_by = (select auth.uid())
  );

-- --- chat_channel_members --------------------------------------------------

DROP POLICY IF EXISTS "Admins and managers can add channel members" ON public.chat_channel_members;
DROP POLICY IF EXISTS "Channel members can add members"             ON public.chat_channel_members;

CREATE POLICY "Org members can add channel members"
  ON public.chat_channel_members
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM chat_channels c
      WHERE c.id = chat_channel_members.channel_id
        AND c.org_id IN (SELECT user_org_ids())
        AND user_has_org_role(
              c.org_id,
              ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'member'::org_role])
    )
  );

COMMIT;
