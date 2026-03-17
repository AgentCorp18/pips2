-- Enable Supabase Realtime on chat_channel_members table
-- so client-side hooks can subscribe to membership changes
-- (e.g., user added to or removed from a channel)
ALTER PUBLICATION supabase_realtime ADD TABLE chat_channel_members;
