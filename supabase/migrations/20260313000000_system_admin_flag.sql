-- ============================================================
-- System Admin Flag
-- Adds is_system_admin to profiles table and updates RLS
-- helper functions to grant full cross-org access to system admins.
-- ============================================================

-- Add system admin flag to profiles
ALTER TABLE profiles ADD COLUMN is_system_admin BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN profiles.is_system_admin IS 'System-level admin flag — bypasses org-scoped RLS for full platform access';

-- Update user_org_ids() to return ALL org IDs for system admins
CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF UUID AS $$
  -- System admins see all orgs
  SELECT id FROM organizations
  WHERE EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_system_admin = true
  )
  UNION
  -- Regular users see only their member orgs
  SELECT org_id FROM org_members
  WHERE user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_system_admin = true
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION user_org_ids IS 'Returns org IDs for the authenticated user. System admins get all orgs.';

-- Update user_has_org_role() to always return true for system admins
CREATE OR REPLACE FUNCTION user_has_org_role(
  _org_id UUID,
  _roles org_role[]
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_system_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM org_members
    WHERE user_id = auth.uid()
      AND org_id = _org_id
      AND role = ANY(_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION user_has_org_role IS 'Checks if authenticated user has specified role(s) in an org. System admins always pass.';

-- Grant system admin to Marc's account
UPDATE profiles
SET is_system_admin = true
WHERE email = 'Marc.A.Albers@gmail.com';
