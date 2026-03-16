-- ============================================================
-- PIPS 2.0 — Auto-create default chat channels (TKT-91)
-- ============================================================
-- When a new organization is created, automatically create an
-- org-wide "General" channel.  When a new org member joins,
-- automatically enroll them in every org-type channel.
--
-- Both triggers are SECURITY DEFINER to bypass RLS, which
-- would otherwise block service-role / trigger-context writes.
--
-- Duplicate-safety notes:
--   • create_default_org_channel — the WHERE NOT EXISTS guard
--     prevents a second "General" channel if the application
--     layer (onboarding/actions.ts) already created one in the
--     same transaction via the admin client.
--   • auto_join_org_channels — the INSERT uses ON CONFLICT DO
--     NOTHING because chat_channel_members has a UNIQUE
--     constraint on (channel_id, user_id).
-- ============================================================


-- ============================================================
-- FUNCTION: create_default_org_channel
-- Fires: AFTER INSERT ON organizations
-- ============================================================
CREATE OR REPLACE FUNCTION create_default_org_channel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Guard: only create if no General channel exists yet for this org.
  -- The onboarding action (admin client) may have already inserted one
  -- before the trigger ran, so we skip rather than duplicate.
  INSERT INTO chat_channels (org_id, type, name, created_by)
  SELECT NEW.id, 'org', 'General', NEW.created_by
  WHERE NOT EXISTS (
    SELECT 1
    FROM chat_channels
    WHERE org_id = NEW.id
      AND type   = 'org'
      AND name   = 'General'
  );

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION create_default_org_channel() IS
  'Fires after organizations INSERT. Creates a "General" org-type channel '
  'unless one already exists (idempotent against application-layer pre-creation). '
  'SECURITY DEFINER to bypass RLS in trigger context. (TKT-91)';


CREATE TRIGGER trg_create_default_org_channel
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_default_org_channel();


-- ============================================================
-- FUNCTION: auto_join_org_channels
-- Fires: AFTER INSERT ON org_members
-- ============================================================
CREATE OR REPLACE FUNCTION auto_join_org_channels()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Enroll the new member in every org-type channel for their org.
  -- ON CONFLICT DO NOTHING handles the case where the membership row
  -- already exists (e.g. if the application layer pre-enrolled them).
  INSERT INTO chat_channel_members (channel_id, user_id)
  SELECT c.id, NEW.user_id
  FROM chat_channels c
  WHERE c.org_id = NEW.org_id
    AND c.type   = 'org'
    AND c.archived_at IS NULL
  ON CONFLICT (channel_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION auto_join_org_channels() IS
  'Fires after org_members INSERT. Enrolls the new member in all active '
  'org-type chat channels for their organization. Idempotent via ON CONFLICT '
  'DO NOTHING. SECURITY DEFINER to bypass RLS in trigger context. (TKT-91)';


CREATE TRIGGER trg_auto_join_org_channels
  AFTER INSERT ON org_members
  FOR EACH ROW
  EXECUTE FUNCTION auto_join_org_channels();
