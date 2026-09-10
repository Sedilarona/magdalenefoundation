
-- Public list of selectable names for sign-up (single family archive).
CREATE OR REPLACE FUNCTION public.signup_family_names()
RETURNS TABLE(id uuid, full_name text, gender text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT fm.id, fm.full_name, fm.gender
  FROM public.family_members fm
  JOIN public.families f ON f.id = fm.family_id AND f.status = 'approved'
  WHERE COALESCE(fm.is_deceased, false) = false
    AND fm.user_id IS NULL
  ORDER BY fm.full_name
$$;

REVOKE ALL ON FUNCTION public.signup_family_names() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.signup_family_names() TO anon, authenticated;

-- On sign-up: join the family and link the chosen family tree person.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _member_id uuid;
  _member public.family_members%ROWTYPE;
  _name text;
BEGIN
  _name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Member');

  BEGIN
    _member_id := NULLIF(NEW.raw_user_meta_data->>'family_member_id', '')::uuid;
  EXCEPTION WHEN others THEN
    _member_id := NULL;
  END;

  IF _member_id IS NOT NULL THEN
    SELECT * INTO _member FROM public.family_members WHERE id = _member_id AND user_id IS NULL;
  END IF;

  IF _member.id IS NOT NULL THEN
    INSERT INTO public.profiles (user_id, full_name, family_id, family_member_id)
    VALUES (NEW.id, _member.full_name, _member.family_id, _member.id);

    UPDATE public.family_members SET user_id = NEW.id, updated_at = now() WHERE id = _member.id;
  ELSE
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, _name);
  END IF;

  IF EXISTS (SELECT 1 FROM public.pending_platform_admins pa WHERE lower(pa.email) = lower(NEW.email)) THEN
    INSERT INTO public.platform_admins (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
