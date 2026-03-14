-- ============================================================
-- Initiatives Layer
-- Hierarchy: Organization > Initiative > Project > Ticket > Sub-Ticket
-- ============================================================

CREATE TYPE initiative_status AS ENUM ('draft', 'active', 'on_hold', 'completed', 'archived');

CREATE TABLE initiatives (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  status          initiative_status NOT NULL DEFAULT 'active',
  owner_id        UUID NOT NULL REFERENCES profiles(id),
  objective       TEXT,
  target_metric   TEXT,
  baseline_value  TEXT,
  target_value    TEXT,
  current_value   TEXT,
  target_start    DATE,
  target_end      DATE,
  actual_start    DATE,
  actual_end      DATE,
  tags            TEXT[] DEFAULT '{}',
  color           TEXT DEFAULT '#4F46E5',
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at     TIMESTAMPTZ
);

CREATE TABLE initiative_projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id   UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  added_by        UUID NOT NULL REFERENCES profiles(id),
  added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes           TEXT,
  CONSTRAINT unique_initiative_project UNIQUE (initiative_id, project_id),
  CONSTRAINT unique_project_parent UNIQUE (project_id)
);

CREATE INDEX idx_initiatives_org_id ON initiatives(org_id);
CREATE INDEX idx_initiatives_owner_id ON initiatives(owner_id);
CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_initiative_projects_initiative_id ON initiative_projects(initiative_id);
CREATE INDEX idx_initiative_projects_project_id ON initiative_projects(project_id);

CREATE TRIGGER set_initiatives_updated_at
  BEFORE UPDATE ON initiatives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER initiatives_audit
  AFTER INSERT OR UPDATE OR DELETE ON initiatives
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

-- RLS
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiative_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view initiatives" ON initiatives
  FOR SELECT USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Managers+ can create initiatives" ON initiatives
  FOR INSERT WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND owner_id = auth.uid()
    AND user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])
  );

CREATE POLICY "Owners and managers+ can update initiatives" ON initiatives
  FOR UPDATE USING (
    org_id IN (SELECT user_org_ids())
    AND (
      owner_id = auth.uid()
      OR user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])
    )
  );

CREATE POLICY "Admin+ can delete initiatives" ON initiatives
  FOR DELETE USING (
    user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role])
  );

CREATE POLICY "Org members can view initiative projects" ON initiative_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM initiatives i
      WHERE i.id = initiative_projects.initiative_id
      AND i.org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY "Managers+ can add projects to initiatives" ON initiative_projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM initiatives i
      WHERE i.id = initiative_projects.initiative_id
      AND user_has_org_role(i.org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])
    )
  );

CREATE POLICY "Managers+ can remove projects from initiatives" ON initiative_projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM initiatives i
      WHERE i.id = initiative_projects.initiative_id
      AND user_has_org_role(i.org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])
    )
  );
