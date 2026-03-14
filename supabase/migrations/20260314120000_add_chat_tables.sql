-- ============================================================
-- PIPS 2.0 — Team Chat Tables
-- ============================================================
-- Adds real-time team chat with channels, messages, members,
-- and AI-generated summaries. Supports org-wide, project-scoped,
-- ticket-scoped, team, direct, and custom channel types.
--
-- Tables:
--   chat_channels       — channel definitions
--   chat_channel_members — membership + mute/read state
--   chat_messages       — individual messages with mentions
--   chat_summaries      — AI-generated conversation summaries
--
-- Also adds chat_message and chat_mention to the
-- notification_type enum, and enables Supabase Realtime
-- on chat_messages.
-- ============================================================


-- ============================================================
-- ENUM: chat_channel_type
-- ============================================================
CREATE TYPE chat_channel_type AS ENUM (
  'org',       -- org-wide broadcast / general channel
  'project',   -- scoped to a project
  'ticket',    -- scoped to a ticket thread
  'team',      -- scoped to a team
  'direct',    -- direct message between two users
  'custom'     -- user-created channel
);


-- ============================================================
-- ENUM EXTENSION: notification_type
-- ============================================================
-- Add chat notification variants to the existing enum.
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'chat_message';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'chat_mention';


-- ============================================================
-- TABLE: chat_channels
-- ============================================================
CREATE TABLE chat_channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type        chat_channel_type NOT NULL,
  name        TEXT,                  -- NULL for direct channels (use member names in UI)
  entity_id   UUID,                  -- FK to the related project/ticket/team (app-level join)
  created_by  UUID NOT NULL REFERENCES auth.users(id),
  archived_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE chat_channels IS 'Chat channels — org, project, ticket, team, direct, or custom scope';
COMMENT ON COLUMN chat_channels.entity_id IS 'Application-level FK: project id, ticket id, or team id depending on type';
COMMENT ON COLUMN chat_channels.name IS 'Human-readable channel name. NULL for direct channels — derive name from members in the UI';


-- ============================================================
-- TABLE: chat_channel_members
-- ============================================================
CREATE TABLE chat_channel_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id   UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  muted        BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

COMMENT ON TABLE chat_channel_members IS 'Channel membership — tracks who is in each channel, their mute state, and read position';
COMMENT ON COLUMN chat_channel_members.last_read_at IS 'Timestamp of last message the user has read — used to calculate unread badge counts';


-- ============================================================
-- TABLE: chat_messages
-- ============================================================
CREATE TABLE chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES auth.users(id),
  body       TEXT NOT NULL,
  mentions   UUID[] NOT NULL DEFAULT '{}',
  edited_at  TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,           -- soft delete; body replaced with "[deleted]" in UI
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE chat_messages IS 'Individual chat messages — soft-deleted via deleted_at, edited via edited_at';
COMMENT ON COLUMN chat_messages.mentions IS 'Array of auth.users UUIDs @mentioned in the message body';
COMMENT ON COLUMN chat_messages.deleted_at IS 'Soft delete timestamp — message body should be replaced with "[deleted]" in the UI';


-- ============================================================
-- TABLE: chat_summaries
-- ============================================================
CREATE TABLE chat_summaries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id      UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  summary         TEXT NOT NULL,
  from_message_id UUID REFERENCES chat_messages(id),
  to_message_id   UUID REFERENCES chat_messages(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE chat_summaries IS 'AI-generated conversation summaries covering a range of messages within a channel';
COMMENT ON COLUMN chat_summaries.from_message_id IS 'First message in the summarised range (inclusive)';
COMMENT ON COLUMN chat_summaries.to_message_id IS 'Last message in the summarised range (inclusive)';


-- ============================================================
-- INDEXES
-- ============================================================
-- Primary query pattern: paginate messages in a channel chronologically
CREATE INDEX idx_chat_messages_channel_created
  ON chat_messages(channel_id, created_at DESC);

-- Membership lookups by user (unread counts, sidebar channel list)
CREATE INDEX idx_chat_channel_members_user
  ON chat_channel_members(user_id);

-- Org-scoped channel listing
CREATE INDEX idx_chat_channels_org
  ON chat_channels(org_id);

-- Org-scoped message queries (compliance / admin views)
CREATE INDEX idx_chat_messages_org
  ON chat_messages(org_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE chat_channels        ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_summaries       ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- RLS: chat_channels
-- ------------------------------------------------------------

CREATE POLICY "Channel members can view channels"
  ON chat_channels FOR SELECT
  USING (
    id IN (
      SELECT channel_id
      FROM chat_channel_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and managers can create channels"
  ON chat_channels FOR INSERT
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager']::org_role[])
    AND created_by = auth.uid()
  );

CREATE POLICY "Admins and managers can update channels"
  ON chat_channels FOR UPDATE
  USING (
    user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager']::org_role[])
  );

CREATE POLICY "Admins can delete channels"
  ON chat_channels FOR DELETE
  USING (
    user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[])
  );


-- ------------------------------------------------------------
-- RLS: chat_channel_members
-- ------------------------------------------------------------

-- Users can see other members of channels they themselves belong to
CREATE POLICY "Channel members can view co-members"
  ON chat_channel_members FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id
      FROM chat_channel_members AS my_membership
      WHERE my_membership.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and managers can add channel members"
  ON chat_channel_members FOR INSERT
  WITH CHECK (
    -- The channel must belong to an org the actor is a member of
    channel_id IN (
      SELECT id FROM chat_channels
      WHERE org_id IN (SELECT user_org_ids())
    )
    AND user_has_org_role(
      (SELECT org_id FROM chat_channels WHERE id = channel_id),
      ARRAY['owner', 'admin', 'manager']::org_role[]
    )
  );

-- Admins/managers can remove anyone; members can remove themselves
CREATE POLICY "Admins or self can remove channel members"
  ON chat_channel_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR user_has_org_role(
      (SELECT org_id FROM chat_channels WHERE id = channel_id),
      ARRAY['owner', 'admin', 'manager']::org_role[]
    )
  );

-- Users can update their own membership row (mute, last_read_at)
CREATE POLICY "Members can update own membership"
  ON chat_channel_members FOR UPDATE
  USING (user_id = auth.uid());


-- ------------------------------------------------------------
-- RLS: chat_messages
-- ------------------------------------------------------------

CREATE POLICY "Channel members can view messages"
  ON chat_messages FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id
      FROM chat_channel_members
      WHERE user_id = auth.uid()
    )
  );

-- Any org member who is also a channel member can post
CREATE POLICY "Channel members can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND author_id = auth.uid()
    AND channel_id IN (
      SELECT channel_id
      FROM chat_channel_members
      WHERE user_id = auth.uid()
    )
    AND user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager', 'member']::org_role[])
  );

-- Authors can edit their own messages; admins can edit any
CREATE POLICY "Authors and admins can edit messages"
  ON chat_messages FOR UPDATE
  USING (
    author_id = auth.uid()
    OR user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[])
  );

-- Authors can soft-delete their own messages; admins can hard-delete
CREATE POLICY "Authors and admins can delete messages"
  ON chat_messages FOR DELETE
  USING (
    author_id = auth.uid()
    OR user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[])
  );


-- ------------------------------------------------------------
-- RLS: chat_summaries
-- ------------------------------------------------------------

CREATE POLICY "Channel members can view summaries"
  ON chat_summaries FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id
      FROM chat_channel_members
      WHERE user_id = auth.uid()
    )
  );

-- Only server-side logic (service role / triggers) creates summaries.
-- No direct INSERT allowed from authenticated users.


-- ============================================================
-- NOTIFICATION TRIGGER FUNCTION
-- ============================================================
-- Fires after every INSERT on chat_messages.
-- Creates a notification for each channel member except the author:
--   • If the member is @mentioned  → type 'chat_mention'
--   • If not muted                 → type 'chat_message'
-- Members who are muted AND not @mentioned receive no notification.
-- Runs as SECURITY DEFINER so it can bypass RLS on notifications.
-- ============================================================

CREATE OR REPLACE FUNCTION notify_chat_message()
RETURNS TRIGGER AS $$
DECLARE
  rec RECORD;
  notif_type notification_type;
  channel_name TEXT;
BEGIN
  -- Resolve a display name for the notification body
  SELECT COALESCE(name, 'a direct message') INTO channel_name
  FROM chat_channels
  WHERE id = NEW.channel_id;

  -- Iterate over all channel members excluding the message author
  FOR rec IN
    SELECT ccm.user_id, ccm.muted
    FROM chat_channel_members ccm
    WHERE ccm.channel_id = NEW.channel_id
      AND ccm.user_id != NEW.author_id
  LOOP
    -- Determine if this member is @mentioned
    IF NEW.mentions IS NOT NULL AND rec.user_id = ANY(NEW.mentions) THEN
      -- Always notify for @mentions regardless of mute state
      notif_type := 'chat_mention';
    ELSIF rec.muted THEN
      -- Channel is muted and no @mention — skip
      CONTINUE;
    ELSE
      notif_type := 'chat_message';
    END IF;

    -- notifications.user_id references profiles(id), which shares the
    -- same UUID as auth.users(id) — no secondary lookup needed.
    INSERT INTO notifications (
      org_id,
      user_id,
      type,
      title,
      body,
      entity_type,
      entity_id
    )
    VALUES (
      NEW.org_id,
      rec.user_id,
      notif_type,
      CASE
        WHEN notif_type = 'chat_mention' THEN 'You were mentioned in a message'
        ELSE 'New message in ' || channel_name
      END,
      CASE
        WHEN notif_type = 'chat_mention'
          THEN 'You were mentioned in ' || channel_name
        ELSE 'New message in ' || channel_name
      END,
      'chat_channel',
      NEW.channel_id
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION notify_chat_message() IS
  'Fires after chat_messages INSERT. Creates chat_message or chat_mention notifications for channel members, respecting mute state.';

CREATE TRIGGER trg_notify_chat_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_chat_message();


-- ============================================================
-- SUPABASE REALTIME
-- ============================================================
-- Enable Realtime for chat_messages so clients can subscribe
-- to new messages without polling.
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
