-- Add missing unique constraint on project_forms.
-- The app code uses onConflict: 'project_id,step,form_type' for upserts
-- but no unique constraint existed to support it.
ALTER TABLE project_forms
ADD CONSTRAINT project_forms_project_id_step_form_type_key
UNIQUE (project_id, step, form_type);
