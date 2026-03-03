-- Fix: org creation fails because the SELECT RLS policy requires
-- org_members membership, but the membership row hasn't been created yet
-- when .select('id') runs after the INSERT.
--
-- Solution: Allow the creator (created_by = auth.uid()) to also read the org.

DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;

CREATE POLICY "Users can view their organizations"
  ON public.organizations
  FOR SELECT
  USING (
    id IN (SELECT user_org_ids())
    OR created_by = auth.uid()
  );
