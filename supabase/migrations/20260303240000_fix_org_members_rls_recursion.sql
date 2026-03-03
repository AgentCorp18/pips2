-- Fix: infinite recursion in org_members INSERT policy.
--
-- The inline NOT EXISTS subquery directly referenced org_members within
-- an org_members policy, causing PostgreSQL to detect self-referencing
-- recursion. The solution wraps the check in a SECURITY DEFINER function
-- that bypasses RLS.
--
-- Note: the application code now uses the service role client for org
-- creation (server-side trusted operation), so the RLS policy is a
-- defense-in-depth measure rather than the primary access control.

CREATE OR REPLACE FUNCTION org_has_no_members(_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.org_members WHERE org_id = _org_id
  );
$$;

DROP POLICY IF EXISTS "Owner/admin can add members" ON public.org_members;

CREATE POLICY "Owner/admin can add members"
  ON public.org_members
  FOR INSERT
  WITH CHECK (
    user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role])
    OR (
      user_id = auth.uid()
      AND role = 'owner'::org_role
      AND org_has_no_members(org_id)
    )
  );
