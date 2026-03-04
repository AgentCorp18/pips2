-- Fix: handle_new_user() trigger only sets full_name but not display_name.
-- After signup, the profile has display_name = NULL, causing the UserMenu
-- avatar to show email initials instead of the user's real name.
--
-- This migration updates the trigger to also populate display_name from
-- the signup metadata, so the user's name appears correctly immediately
-- after account creation.
--
-- Additionally, backfill any existing profiles where display_name is NULL
-- but full_name is set (from users who signed up before this fix).

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _name TEXT;
BEGIN
  _name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    ''
  );

  INSERT INTO public.profiles (id, email, full_name, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    _name,
    NULLIF(_name, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill: set display_name for existing profiles where it is NULL
-- but full_name has a meaningful value.
UPDATE public.profiles
SET display_name = full_name,
    updated_at = NOW()
WHERE display_name IS NULL
  AND full_name IS NOT NULL
  AND full_name <> '';
