-- Knowledge Hub: Content, Training, and Workshop tables
-- Migration: 20260304000000_knowledge_hub_tables.sql

-- ============================================================
-- Content nodes (global catalog — no RLS, populated by content pipeline)
-- ============================================================
CREATE TABLE content_nodes (
  id                  TEXT PRIMARY KEY,
  pillar              TEXT NOT NULL CHECK (pillar IN ('book', 'guide', 'workbook', 'workshop')),
  title               TEXT NOT NULL,
  slug                TEXT NOT NULL,
  parent_id           TEXT REFERENCES content_nodes(id) ON DELETE SET NULL,
  summary             TEXT NOT NULL DEFAULT '',
  body_md             TEXT,
  estimated_read_minutes INT NOT NULL DEFAULT 5,
  source_file         TEXT,
  sort_order          INT NOT NULL DEFAULT 0,
  access_level        TEXT NOT NULL DEFAULT 'paid' CHECK (access_level IN ('public', 'free-registered', 'paid')),
  tags                JSONB NOT NULL DEFAULT '{}',
  related_nodes       TEXT[] NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_nodes_pillar ON content_nodes(pillar);
CREATE INDEX idx_content_nodes_slug ON content_nodes(slug);
CREATE INDEX idx_content_nodes_parent ON content_nodes(parent_id);
CREATE INDEX idx_content_nodes_tags ON content_nodes USING GIN (tags);
CREATE INDEX idx_content_nodes_access ON content_nodes(access_level);

-- Full-text search index on title + summary + body_md
ALTER TABLE content_nodes ADD COLUMN search_vector TSVECTOR
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(body_md, '')), 'C')
  ) STORED;

CREATE INDEX idx_content_nodes_search ON content_nodes USING GIN (search_vector);

-- Auto-update updated_at
CREATE TRIGGER set_content_nodes_updated_at
  BEFORE UPDATE ON content_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Reading sessions — track where user left off per pillar
-- ============================================================
CREATE TABLE reading_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_node_id     TEXT NOT NULL REFERENCES content_nodes(id) ON DELETE CASCADE,
  pillar              TEXT NOT NULL CHECK (pillar IN ('book', 'guide', 'workbook', 'workshop')),
  scroll_position     REAL NOT NULL DEFAULT 0,
  last_accessed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_reading_session UNIQUE (user_id, pillar)
);

CREATE INDEX idx_reading_sessions_user ON reading_sessions(user_id);

ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading sessions"
  ON reading_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own reading sessions"
  ON reading_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reading sessions"
  ON reading_sessions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reading sessions"
  ON reading_sessions FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- Content bookmarks
-- ============================================================
CREATE TABLE content_bookmarks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_node_id     TEXT NOT NULL REFERENCES content_nodes(id) ON DELETE CASCADE,
  note                TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_bookmark UNIQUE (user_id, content_node_id)
);

CREATE INDEX idx_content_bookmarks_user ON content_bookmarks(user_id);

ALTER TABLE content_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON content_bookmarks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own bookmarks"
  ON content_bookmarks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bookmarks"
  ON content_bookmarks FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own bookmarks"
  ON content_bookmarks FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- Content read history
-- ============================================================
CREATE TABLE content_read_history (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_node_id     TEXT NOT NULL REFERENCES content_nodes(id) ON DELETE CASCADE,
  first_read_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_count          INT NOT NULL DEFAULT 1,
  CONSTRAINT unique_read_history UNIQUE (user_id, content_node_id)
);

CREATE INDEX idx_content_read_history_user ON content_read_history(user_id);
CREATE INDEX idx_content_read_history_node ON content_read_history(content_node_id);

ALTER TABLE content_read_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own read history"
  ON content_read_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own read history"
  ON content_read_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own read history"
  ON content_read_history FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- Training paths (global catalog — no RLS)
-- ============================================================
CREATE TABLE training_paths (
  id                  TEXT PRIMARY KEY,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  estimated_hours     REAL NOT NULL,
  target_audience     TEXT NOT NULL,
  sort_order          INT NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Training modules (global catalog — no RLS)
-- ============================================================
CREATE TABLE training_modules (
  id                  TEXT PRIMARY KEY,
  path_id             TEXT NOT NULL REFERENCES training_paths(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  estimated_minutes   INT NOT NULL,
  sort_order          INT NOT NULL DEFAULT 0,
  content_node_ids    TEXT[] NOT NULL DEFAULT '{}',
  prerequisites       TEXT[] NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_modules_path ON training_modules(path_id);

-- ============================================================
-- Training exercises (global catalog — no RLS)
-- ============================================================
CREATE TABLE training_exercises (
  id                  TEXT PRIMARY KEY,
  module_id           TEXT NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  type                TEXT NOT NULL CHECK (type IN ('fill-form', 'multiple-choice', 'scenario-practice', 'reflection')),
  title               TEXT NOT NULL,
  instructions        TEXT NOT NULL,
  scenario_id         TEXT,
  form_type           TEXT,
  expected_minutes    INT NOT NULL DEFAULT 10,
  sort_order          INT NOT NULL DEFAULT 0,
  config              JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_exercises_module ON training_exercises(module_id);

-- ============================================================
-- Training progress (user-scoped RLS)
-- ============================================================
CREATE TABLE training_progress (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  path_id             TEXT NOT NULL REFERENCES training_paths(id) ON DELETE CASCADE,
  module_id           TEXT NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  assessment_score    REAL,
  time_spent_minutes  INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_training_progress UNIQUE (user_id, module_id)
);

CREATE INDEX idx_training_progress_user ON training_progress(user_id);
CREATE INDEX idx_training_progress_path ON training_progress(path_id);

ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own training progress"
  ON training_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own training progress"
  ON training_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own training progress"
  ON training_progress FOR UPDATE
  USING (user_id = auth.uid());

-- Auto-update updated_at
CREATE TRIGGER set_training_progress_updated_at
  BEFORE UPDATE ON training_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Training exercise data (user-scoped RLS)
-- ============================================================
CREATE TABLE training_exercise_data (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id         TEXT NOT NULL REFERENCES training_exercises(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  data                JSONB NOT NULL DEFAULT '{}',
  score               REAL,
  attempts            INT NOT NULL DEFAULT 0,
  last_attempt_at     TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_exercise_data UNIQUE (user_id, exercise_id)
);

CREATE INDEX idx_training_exercise_data_user ON training_exercise_data(user_id);

ALTER TABLE training_exercise_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exercise data"
  ON training_exercise_data FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own exercise data"
  ON training_exercise_data FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own exercise data"
  ON training_exercise_data FOR UPDATE
  USING (user_id = auth.uid());

-- Auto-update updated_at
CREATE TRIGGER set_training_exercise_data_updated_at
  BEFORE UPDATE ON training_exercise_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Workshop sessions (org-scoped RLS)
-- ============================================================
CREATE TABLE workshop_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  facilitator_id      UUID NOT NULL REFERENCES profiles(id),
  title               TEXT NOT NULL,
  scenario_id         TEXT,
  current_module_index INT NOT NULL DEFAULT 0,
  timer_state         JSONB NOT NULL DEFAULT '{}',
  participant_count   INT NOT NULL DEFAULT 0,
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workshop_sessions_org ON workshop_sessions(org_id);
CREATE INDEX idx_workshop_sessions_facilitator ON workshop_sessions(facilitator_id);

ALTER TABLE workshop_sessions ENABLE ROW LEVEL SECURITY;

-- Workshop sessions visible to org members
CREATE POLICY "Org members can view workshop sessions"
  ON workshop_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = workshop_sessions.org_id
        AND org_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can insert workshop sessions"
  ON workshop_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = workshop_sessions.org_id
        AND org_members.user_id = auth.uid()
        AND org_members.role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Facilitators can update own workshop sessions"
  ON workshop_sessions FOR UPDATE
  USING (facilitator_id = auth.uid());

CREATE POLICY "Org admins can delete workshop sessions"
  ON workshop_sessions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = workshop_sessions.org_id
        AND org_members.user_id = auth.uid()
        AND org_members.role IN ('owner', 'admin')
    )
  );

-- Auto-update updated_at
CREATE TRIGGER set_workshop_sessions_updated_at
  BEFORE UPDATE ON workshop_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
