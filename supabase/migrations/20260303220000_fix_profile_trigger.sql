-- Fix: handle_new_user() trigger reads 'full_name' from metadata,
-- but the signup action sends 'display_name'. This causes every new
-- user's profile to have an empty full_name.
--
-- Now reads display_name first, falls back to full_name, then empty string.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
