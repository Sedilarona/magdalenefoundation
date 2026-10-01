DROP FUNCTION IF EXISTS public.signup_family_names();
CREATE FUNCTION public.signup_family_names()
 RETURNS TABLE(id uuid, full_name text, gender text, taken boolean)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT fm.id, fm.full_name, fm.gender, (fm.user_id IS NOT NULL)
  FROM public.family_members fm
  JOIN public.families f ON f.id = fm.family_id AND f.status = 'approved'
  WHERE COALESCE(fm.is_deceased,false) = false
  ORDER BY fm.full_name
$$;
GRANT EXECUTE ON FUNCTION public.signup_family_names() TO anon, authenticated;