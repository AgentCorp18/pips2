-- ============================================================
-- PIPS 2.0 — Super Admin Management Layer
-- ============================================================
-- 1. Adds deactivated_at to profiles for user deactivation
-- 2. Creates system_admin_log table for admin action audit trail
-- 3. Indexes for fast queries
-- 4. RLS on system_admin_log (system admins only)
-- ============================================================

-- 1. Add deactivated_at to profiles for user deactivation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Create system_admin_log table for admin action audit trail
CREATE TABLE IF NOT EXISTS system_admin_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,                    -- e.g. 'toggle_system_admin', 'deactivate_user', 'add_to_org'
  target_user_id UUID REFERENCES auth.users(id),
  target_org_id UUID REFERENCES organizations(id),
  details JSONB DEFAULT '{}',              -- Additional context
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Index for fast queries
CREATE INDEX IF NOT EXISTS idx_system_admin_log_admin_id ON system_admin_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_system_admin_log_created_at ON system_admin_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_deactivated ON profiles(deactivated_at) WHERE deactivated_at IS NOT NULL;

-- 4. RLS on system_admin_log: only system admins can read
ALTER TABLE system_admin_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System admins can view admin log"
  ON system_admin_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_system_admin = true
    )
  );

-- 5. Enable realtime for system_admin_log (optional, for live dashboard)
-- No INSERT/UPDATE/DELETE policies — admin actions use service role client
