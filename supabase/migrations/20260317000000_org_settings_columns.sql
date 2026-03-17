-- Add missing operational columns to org_settings
-- These columns were referenced by the UI but never created in the original schema
ALTER TABLE org_settings
  ADD COLUMN IF NOT EXISTS ticket_prefix TEXT NOT NULL DEFAULT 'PIPS',
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  ADD COLUMN IF NOT EXISTS date_format TEXT NOT NULL DEFAULT 'MM/dd/yyyy',
  ADD COLUMN IF NOT EXISTS week_start TEXT NOT NULL DEFAULT 'monday',
  ADD COLUMN IF NOT EXISTS default_ticket_priority TEXT NOT NULL DEFAULT 'medium';

-- Validation constraints
ALTER TABLE org_settings
  ADD CONSTRAINT chk_date_format CHECK (date_format IN ('MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd')),
  ADD CONSTRAINT chk_week_start CHECK (week_start IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  ADD CONSTRAINT chk_default_ticket_priority CHECK (default_ticket_priority IN ('critical', 'high', 'medium', 'low')),
  ADD CONSTRAINT chk_ticket_prefix CHECK (ticket_prefix ~ '^[A-Z0-9]{2,10}$');

-- Seed org_settings rows for any organizations that don't have one yet
INSERT INTO org_settings (org_id)
SELECT id FROM organizations
WHERE id NOT IN (SELECT org_id FROM org_settings)
ON CONFLICT (org_id) DO NOTHING;

-- Auto-create org_settings when a new organization is created
CREATE OR REPLACE FUNCTION create_org_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO org_settings (org_id)
  VALUES (NEW.id)
  ON CONFLICT (org_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_org_settings ON organizations;
CREATE TRIGGER trg_create_org_settings
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_org_settings();
