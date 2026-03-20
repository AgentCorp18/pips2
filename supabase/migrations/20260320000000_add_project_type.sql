-- Add project_type column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type text NOT NULL DEFAULT 'pips'
  CHECK (project_type IN ('pips', 'simple'));

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects (project_type);
