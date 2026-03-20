-- Ticket links table for relationships (blocks, related)
CREATE TABLE IF NOT EXISTS ticket_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  source_ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  target_ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  link_type text NOT NULL CHECK (link_type IN ('blocks', 'related')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source_ticket_id, target_ticket_id, link_type)
);

-- Indexes for efficient lookup in both directions
CREATE INDEX idx_ticket_links_source ON ticket_links(source_ticket_id);
CREATE INDEX idx_ticket_links_target ON ticket_links(target_ticket_id);
CREATE INDEX idx_ticket_links_org ON ticket_links(org_id);

-- Enable Row Level Security
ALTER TABLE ticket_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view links in their org" ON ticket_links
  FOR SELECT USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can create links in their org" ON ticket_links
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete links in their org" ON ticket_links
  FOR DELETE USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
