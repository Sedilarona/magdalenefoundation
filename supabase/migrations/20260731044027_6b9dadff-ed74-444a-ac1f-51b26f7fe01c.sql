
DROP POLICY IF EXISTS "Members can view directory fields" ON public.profiles;

DROP VIEW IF EXISTS public.family_directory;

CREATE VIEW public.family_directory
WITH (security_invoker = false) AS
SELECT id, user_id, full_name, generation, location, occupation, avatar_url, family_branch, contribution_points, created_at
FROM public.profiles;

REVOKE ALL ON public.family_directory FROM anon;
GRANT SELECT ON public.family_directory TO authenticated;
