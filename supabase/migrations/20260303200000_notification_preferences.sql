-- ============================================================
-- PIPS 2.0 — Notification Preferences
-- ============================================================
-- Per-user, per-org notification preference toggles.
-- Controls which notification types a user receives and
-- whether email delivery is enabled.
-- ============================================================

CREATE TABLE notification_preferences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_assigned BOOLEAN NOT NULL DEFAULT true,
  mention         BOOLEAN NOT NULL DEFAULT true,
  project_updated BOOLEAN NOT NULL DEFAULT true,
  ticket_updated  BOOLEAN NOT NULL DEFAULT true,
  ticket_commented BOOLEAN NOT NULL DEFAULT true,
  email_enabled   BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

COMMENT ON TABLE notification_preferences IS 'Per-user notification preferences — controls which notifications are delivered and whether email is enabled';

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own preferences"
  ON notification_preferences FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Trigger: auto-update updated_at on row change
-- ============================================================

CREATE TRIGGER set_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Index for fast lookup by user
-- ============================================================

CREATE INDEX idx_notification_preferences_user
  ON notification_preferences(user_id);
