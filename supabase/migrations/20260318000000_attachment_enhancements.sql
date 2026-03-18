-- Migration: Attachment enhancements
-- Adds missing comment_id index and storage RLS policies for the attachments bucket

-- 1. Add missing index on comment_id for comment attachment queries
CREATE INDEX IF NOT EXISTS idx_attachments_comment
  ON file_attachments(comment_id)
  WHERE comment_id IS NOT NULL;

-- 2. Create the attachments storage bucket if it doesn't exist (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('attachments', 'attachments', false, 52428800) -- 50 MB
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS policies for the attachments bucket
-- Allow authenticated users to upload to their org's folder
CREATE POLICY "Users can upload to their org folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1]::uuid IN (SELECT user_org_ids())
  );

-- Allow org members to read files from their org's folder
CREATE POLICY "Org members can read their org attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1]::uuid IN (SELECT user_org_ids())
  );

-- Allow org members to delete files from their org's folder
CREATE POLICY "Org members can delete their org attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1]::uuid IN (SELECT user_org_ids())
  );
