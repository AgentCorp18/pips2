-- ============================================================
-- PIPS 2.0 — Fix Duplicate Chat Notifications (TKT-94)
-- ============================================================
-- Problem: notify_chat_message() fires on every INSERT into
-- chat_messages, creating N notifications per channel member
-- per message. With 7 members and 6 messages per burst that
-- produces 42 duplicate notification rows for the same channel.
--
-- Fix: Replace the trigger function with a version that skips
-- the INSERT when an existing unread notification for the same
-- (user_id, entity_id, type) combination already exists.
--
-- For chat_message:  entity_id = channel_id → one unread row
--                    per user per channel is enough. Subsequent
--                    messages in the same channel are visible
--                    when the user opens it.
-- For chat_mention:  entity_id = channel_id + type is distinct
--                    from chat_message, so mentions still land.
--                    But if a user is @mentioned twice before
--                    reading, they only get one notification
--                    (acceptable — the channel shows the detail).
--
-- This is a pure trigger replacement — no schema changes needed.
-- The existing idx_notifications_user_unread index (user_id,
-- created_at DESC) WHERE read_at IS NULL already makes the
-- EXISTS check efficient.
-- ============================================================

CREATE OR REPLACE FUNCTION notify_chat_message()
RETURNS TRIGGER AS $$
DECLARE
  rec          RECORD;
  notif_type   notification_type;
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
    -- Determine notification type for this member
    IF NEW.mentions IS NOT NULL AND rec.user_id = ANY(NEW.mentions) THEN
      -- Always notify for @mentions regardless of mute state
      notif_type := 'chat_mention';
    ELSIF rec.muted THEN
      -- Channel is muted and no @mention — skip
      CONTINUE;
    ELSE
      notif_type := 'chat_message';
    END IF;

    -- Deduplication: skip if an unread notification for the same
    -- (user, channel, type) already exists.  The user will see the
    -- updated message count when they open the channel.
    IF EXISTS (
      SELECT 1
      FROM notifications n
      WHERE n.user_id    = rec.user_id
        AND n.entity_id  = NEW.channel_id
        AND n.type       = notif_type
        AND n.read_at    IS NULL
    ) THEN
      CONTINUE;
    END IF;

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
  'Fires after chat_messages INSERT. Creates at most ONE unread chat_message and ONE unread chat_mention notification per user per channel. Subsequent messages in the same channel do not create duplicates (TKT-94).';

-- Add a supporting index so the EXISTS dedup check uses an
-- efficient lookup path (entity_id = channel_id, user_id, type,
-- read_at IS NULL).  The existing idx_notifications_user_unread
-- covers user_id+created_at; this one covers the exact predicate.
CREATE INDEX IF NOT EXISTS idx_notifications_chat_dedup
  ON notifications(user_id, entity_id, type)
  WHERE read_at IS NULL;
