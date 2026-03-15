-- ============================================================
-- Fix CEO ticket 6b281bbd: Chat RLS blocks regular members
-- ============================================================
-- Problem: The chat_channels INSERT policy and chat_channel_members
-- INSERT policy both restrict to owner/admin/manager roles, which
-- prevents regular 'member' users from:
--   1. Creating new chat channels (custom, direct, etc.)
--   2. Adding members to channels (including adding themselves
--      as creator when a new channel is created)
--
-- Fix: Expand both policies to include the 'member' role.
-- Any authenticated org member should be able to create channels
-- and add members to channels within their org.
-- ============================================================


-- ------------------------------------------------------------
-- chat_channels: Replace INSERT policy to include 'member'
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Admins and managers can create channels" ON chat_channels;

CREATE POLICY "Org members can create channels"
  ON chat_channels FOR INSERT
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager', 'member']::org_role[])
    AND created_by = auth.uid()
  );


-- ------------------------------------------------------------
-- chat_channel_members: Replace INSERT policy to include 'member'
-- ------------------------------------------------------------
-- Allow any org member to add members to channels within their org.
-- The channel creator (even a regular member) needs this to add
-- themselves and invitees when creating a new channel.

DROP POLICY IF EXISTS "Admins and managers can add channel members" ON chat_channel_members;

CREATE POLICY "Org members can add channel members"
  ON chat_channel_members FOR INSERT
  WITH CHECK (
    channel_id IN (
      SELECT id FROM chat_channels
      WHERE org_id IN (SELECT user_org_ids())
    )
    AND user_has_org_role(
      (SELECT org_id FROM chat_channels WHERE id = channel_id),
      ARRAY['owner', 'admin', 'manager', 'member']::org_role[]
    )
  );
