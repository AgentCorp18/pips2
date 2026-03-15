-- Fix: chat_channel_members SELECT policy is too restrictive.
-- Users can only see their own membership row, which means getChannel()
-- cannot list other members in the channel. This breaks the member list UI,
-- and indirectly causes permission confusion when sending messages.
--
-- Solution: Allow channel members to see ALL members in channels they belong to.

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Users can view own memberships" ON chat_channel_members;

-- Create a new policy that allows viewing all members in channels you belong to
CREATE POLICY "Channel members can view all members"
  ON chat_channel_members FOR SELECT
  USING (
    channel_id IN (SELECT user_channel_ids())
  );
