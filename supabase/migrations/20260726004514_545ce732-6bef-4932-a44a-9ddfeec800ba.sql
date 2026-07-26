
-- Auto-match new profile to family tree by full_name
CREATE OR REPLACE FUNCTION public.link_profile_to_family_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.family_members
  SET user_id = NEW.user_id, updated_at = now()
  WHERE user_id IS NULL
    AND lower(trim(full_name)) = lower(trim(NEW.full_name));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_link_profile_to_family_member ON public.profiles;
CREATE TRIGGER trg_link_profile_to_family_member
AFTER INSERT OR UPDATE OF full_name ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.link_profile_to_family_member();

-- Backfill existing profiles
UPDATE public.family_members fm
SET user_id = p.user_id, updated_at = now()
FROM public.profiles p
WHERE fm.user_id IS NULL
  AND lower(trim(fm.full_name)) = lower(trim(p.full_name));
