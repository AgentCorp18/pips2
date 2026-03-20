-- ============================================================
-- Add org_id to project_forms for direct org-scoped queries
-- without the 2-step project_id fetch pattern.
-- ============================================================

ALTER TABLE project_forms
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

UPDATE project_forms
SET org_id = (
  SELECT org_id
  FROM projects
  WHERE projects.id = project_forms.project_id
);

ALTER TABLE project_forms
  ALTER COLUMN org_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_project_forms_org ON project_forms(org_id);
CREATE INDEX IF NOT EXISTS idx_project_forms_org_type ON project_forms(org_id, form_type);

-- ============================================================
-- RLS: org members can read project_forms for their orgs
-- ============================================================

-- Drop any existing policies on project_forms before redefining
DROP POLICY IF EXISTS "project_forms_select_org_members" ON project_forms;
DROP POLICY IF EXISTS "project_forms_insert_own_org" ON project_forms;
DROP POLICY IF EXISTS "project_forms_update_own_org" ON project_forms;
DROP POLICY IF EXISTS "project_forms_delete_own_org" ON project_forms;

CREATE POLICY "project_forms_select_org_members" ON project_forms
  FOR SELECT USING (org_id = ANY(user_org_ids()));

CREATE POLICY "project_forms_insert_own_org" ON project_forms
  FOR INSERT WITH CHECK (org_id = ANY(user_org_ids()));

CREATE POLICY "project_forms_update_own_org" ON project_forms
  FOR UPDATE USING (org_id = ANY(user_org_ids()));

CREATE POLICY "project_forms_delete_own_org" ON project_forms
  FOR DELETE USING (org_id = ANY(user_org_ids()));

-- ============================================================
-- SQL helper: form_type counts per org (avoids JS aggregation
-- of 10-20k rows in Vercel Node functions)
-- ============================================================

CREATE OR REPLACE FUNCTION get_form_type_counts_by_project(p_org_id UUID)
RETURNS TABLE(project_id UUID, form_type TEXT, cnt BIGINT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pf.project_id,
    pf.form_type,
    COUNT(*)::BIGINT AS cnt
  FROM project_forms pf
  WHERE pf.org_id = p_org_id
  GROUP BY pf.project_id, pf.form_type;
$$;

-- ============================================================
-- SQL helper: distinct form type count per project for an org
-- Returns one row per project with count of distinct form types.
-- Used for avg methodology depth without loading all form rows.
-- ============================================================

CREATE OR REPLACE FUNCTION get_distinct_form_type_counts(p_org_id UUID)
RETURNS TABLE(project_id UUID, distinct_form_types BIGINT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pf.project_id,
    COUNT(DISTINCT pf.form_type)::BIGINT AS distinct_form_types
  FROM project_forms pf
  WHERE pf.org_id = p_org_id
  GROUP BY pf.project_id;
$$;

-- ============================================================
-- Trigger: auto-populate org_id on INSERT so callers don't
-- have to pass it explicitly.
-- ============================================================

CREATE OR REPLACE FUNCTION project_forms_set_org_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    SELECT org_id INTO NEW.org_id
    FROM projects
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS project_forms_auto_org_id ON project_forms;
CREATE TRIGGER project_forms_auto_org_id
  BEFORE INSERT ON project_forms
  FOR EACH ROW EXECUTE FUNCTION project_forms_set_org_id();
