-- Add user_channel_ids() helper function used by chat RLS policies.
-- This function was applied to production manually during the chat RLS fix
-- but was missing from the migration chain.

CREATE OR REPLACE FUNCTION user_channel_ids()
RETURNS SETOF UUID AS $$
  SELECT channel_id FROM public.chat_channel_members WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

COMMENT ON FUNCTION user_channel_ids() IS
  'Returns channel IDs the calling user is a member of. SECURITY DEFINER to bypass RLS on chat_channel_members.';
