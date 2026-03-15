-- Fix chat RLS policies to allow 'member' role to create channels and join them.
-- Previously only owner/admin/manager could INSERT into chat_channels and chat_channel_members.

-- Drop restrictive INSERT policies
DROP POLICY IF EXISTS "Org admins can create channels" ON chat_channels;
DROP POLICY IF EXISTS "Channel creators can add members" ON chat_channel_members;

-- Recreate with member role included
CREATE POLICY "Org members can create channels"
  ON chat_channels FOR INSERT
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager', 'member'])
  );

CREATE POLICY "Channel members can add members"
  ON chat_channel_members FOR INSERT
  WITH CHECK (
    channel_id IN (SELECT user_channel_ids())
    OR EXISTS (
      SELECT 1 FROM chat_channels c
      WHERE c.id = channel_id
        AND c.org_id IN (SELECT user_org_ids())
        AND user_has_org_role(c.org_id, ARRAY['owner', 'admin', 'manager', 'member'])
    )
  );
