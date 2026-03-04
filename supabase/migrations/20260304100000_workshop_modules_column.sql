-- Add modules JSONB column to workshop_sessions
-- Stores the session agenda: array of {title, duration, notes} objects
ALTER TABLE workshop_sessions
  ADD COLUMN modules JSONB NOT NULL DEFAULT '[]';

-- Enable Realtime for workshop_sessions so participants can follow along
ALTER PUBLICATION supabase_realtime ADD TABLE workshop_sessions;
