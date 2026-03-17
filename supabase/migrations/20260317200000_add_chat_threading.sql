-- ============================================================
-- PIPS 2.0 — Chat Message Threading
-- ============================================================
-- Adds self-referencing FK (reply_to_id) and reply_count to
-- chat_messages. Enforces 1-level depth via trigger.
-- ============================================================

-- Add threading columns
ALTER TABLE chat_messages ADD COLUMN reply_to_id UUID REFERENCES chat_messages(id);
ALTER TABLE chat_messages ADD COLUMN reply_count INTEGER NOT NULL DEFAULT 0;

-- Index for thread queries (fetch replies for a parent)
CREATE INDEX idx_chat_messages_reply_to
  ON chat_messages(reply_to_id)
  WHERE reply_to_id IS NOT NULL;

-- Index for top-level message queries (filters out thread replies)
CREATE INDEX idx_chat_messages_channel_toplevel
  ON chat_messages(channel_id, created_at DESC)
  WHERE reply_to_id IS NULL;

-- ============================================================
-- Trigger: validate thread replies (same channel, 1-level depth)
-- ============================================================

CREATE OR REPLACE FUNCTION validate_thread_reply()
RETURNS TRIGGER AS $$
DECLARE
  parent_channel_id UUID;
  parent_reply_to_id UUID;
BEGIN
  IF NEW.reply_to_id IS NOT NULL THEN
    -- Get parent message info
    SELECT channel_id, reply_to_id INTO parent_channel_id, parent_reply_to_id
    FROM chat_messages WHERE id = NEW.reply_to_id;

    IF parent_channel_id IS NULL THEN
      RAISE EXCEPTION 'Parent message not found';
    END IF;

    -- Must be same channel
    IF parent_channel_id != NEW.channel_id THEN
      RAISE EXCEPTION 'Cannot reply to message in different channel';
    END IF;

    -- Must be 1-level depth (parent cannot itself be a reply)
    IF parent_reply_to_id IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot create nested replies (max 1 level depth)';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_thread_reply
  BEFORE INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION validate_thread_reply();

-- ============================================================
-- Trigger: maintain reply_count on parent message
-- ============================================================

CREATE OR REPLACE FUNCTION update_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.reply_to_id IS NOT NULL THEN
    UPDATE chat_messages SET reply_count = reply_count + 1 WHERE id = NEW.reply_to_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle soft delete: deleted_at changed from NULL to non-NULL
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL AND NEW.reply_to_id IS NOT NULL THEN
      UPDATE chat_messages SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = NEW.reply_to_id;
    END IF;
    -- Handle un-delete: deleted_at changed from non-NULL to NULL
    IF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL AND NEW.reply_to_id IS NOT NULL THEN
      UPDATE chat_messages SET reply_count = reply_count + 1 WHERE id = NEW.reply_to_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_reply_count
  AFTER INSERT OR UPDATE OF deleted_at ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_reply_count();
