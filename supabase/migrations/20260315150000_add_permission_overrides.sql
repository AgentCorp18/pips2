-- Per-org permission overrides
-- Allows org owners to customize which roles get which permissions.

CREATE TABLE org_permission_overrides (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role        org_role NOT NULL,
  permission  TEXT NOT NULL,
  allowed     BOOLEAN NOT NULL,
  updated_by  UUID NOT NULL REFERENCES auth.users(id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_org_role_permission UNIQUE (org_id, role, permission)
);

-- RLS
ALTER TABLE org_permission_overrides ENABLE ROW LEVEL SECURITY;

-- Members can read overrides for their org
CREATE POLICY "Members can read org permission overrides"
  ON org_permission_overrides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = org_permission_overrides.org_id
        AND org_members.user_id = auth.uid()
    )
  );

-- Only owners can insert/update/delete permission overrides
CREATE POLICY "Owners can insert permission overrides"
  ON org_permission_overrides FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = org_permission_overrides.org_id
        AND org_members.user_id = auth.uid()
        AND org_members.role = 'owner'
    )
  );

CREATE POLICY "Owners can update permission overrides"
  ON org_permission_overrides FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = org_permission_overrides.org_id
        AND org_members.user_id = auth.uid()
        AND org_members.role = 'owner'
    )
  );

CREATE POLICY "Owners can delete permission overrides"
  ON org_permission_overrides FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = org_permission_overrides.org_id
        AND org_members.user_id = auth.uid()
        AND org_members.role = 'owner'
    )
  );

-- Index for fast lookups
CREATE INDEX idx_permission_overrides_org ON org_permission_overrides(org_id);
