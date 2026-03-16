-- Add updated_by column to tickets table to track who last modified a ticket
-- FK references profiles (not auth.users) so PostgREST can join for display names
ALTER TABLE tickets ADD COLUMN updated_by UUID REFERENCES profiles(id);

-- Backfill: set updated_by to reporter_id (creator) for existing rows
UPDATE tickets SET updated_by = reporter_id WHERE updated_by IS NULL;

-- Create or replace the trigger function for tickets to also set updated_by
CREATE OR REPLACE FUNCTION update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Set updated_by to the current authenticated user if available
  NEW.updated_by = COALESCE(auth.uid(), NEW.updated_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace the existing tickets trigger with the new function
DROP TRIGGER IF EXISTS tickets_updated_at ON tickets;
CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_updated_at();

-- Index for joins on updated_by
CREATE INDEX idx_tickets_updated_by ON tickets(updated_by);
