-- Workshop participants table for tracking who joins sessions
CREATE TABLE IF NOT EXISTS workshop_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('facilitator', 'scribe', 'timekeeper', 'presenter', 'participant')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  UNIQUE(session_id, user_id)
);

-- RLS: org members can see participants in their org's sessions
ALTER TABLE workshop_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view workshop participants"
  ON workshop_participants FOR SELECT
  USING (
    session_id IN (
      SELECT ws.id FROM workshop_sessions ws
      WHERE ws.org_id IN (
        SELECT org_id FROM org_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can manage workshop participants"
  ON workshop_participants FOR ALL
  USING (
    session_id IN (
      SELECT ws.id FROM workshop_sessions ws
      WHERE ws.org_id IN (
        SELECT om.org_id FROM org_members om
        WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager')
      )
    )
  );

-- Index for fast lookups
CREATE INDEX idx_workshop_participants_session ON workshop_participants(session_id);
CREATE INDEX idx_workshop_participants_user ON workshop_participants(user_id);

-- Add to Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE workshop_participants;
