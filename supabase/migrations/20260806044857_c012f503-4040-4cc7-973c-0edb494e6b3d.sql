ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_year integer,
  ADD COLUMN IF NOT EXISTS birth_month integer,
  ADD COLUMN IF NOT EXISTS birth_day integer,
  ADD COLUMN IF NOT EXISTS family_member_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.list_family_names()
RETURNS TABLE (id uuid, full_name text, gender text, birth_year text, generation_level integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT fm.id, fm.full_name, fm.gender, fm.birth_year, fm.generation_level
  FROM public.family_members fm
  WHERE COALESCE(fm.is_deceased, false) = false
  ORDER BY fm.full_name
$$;

REVOKE ALL ON FUNCTION public.list_family_names() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_family_names() TO anon, authenticated;