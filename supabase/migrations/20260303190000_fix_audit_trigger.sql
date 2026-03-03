-- Fix audit trigger to handle tables without org_id column
-- Resolves org_id through parent tables for project_steps and project_forms

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  _org_id UUID;
  _user_id UUID;
  _action TEXT;
  _old_data JSONB;
  _new_data JSONB;
  _record JSONB;
BEGIN
  _action := LOWER(TG_OP);

  IF TG_OP = 'DELETE' THEN
    _old_data := to_jsonb(OLD);
    _new_data := NULL;
    _record := _old_data;
  ELSIF TG_OP = 'INSERT' THEN
    _old_data := NULL;
    _new_data := to_jsonb(NEW);
    _record := _new_data;
  ELSE
    _old_data := to_jsonb(OLD);
    _new_data := to_jsonb(NEW);
    _record := _new_data;
  END IF;

  -- Resolve org_id based on table
  IF _record ? 'org_id' THEN
    _org_id := (_record ->> 'org_id')::UUID;
  ELSIF TG_TABLE_NAME = 'organizations' THEN
    _org_id := (_record ->> 'id')::UUID;
  ELSIF TG_TABLE_NAME IN ('project_steps', 'project_forms') THEN
    SELECT p.org_id INTO _org_id
    FROM projects p
    WHERE p.id = (_record ->> 'project_id')::UUID;
  END IF;

  _user_id := auth.uid();

  INSERT INTO audit_log (org_id, user_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (_org_id, _user_id, _action, TG_TABLE_NAME, (_record ->> 'id')::UUID, _old_data, _new_data);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
