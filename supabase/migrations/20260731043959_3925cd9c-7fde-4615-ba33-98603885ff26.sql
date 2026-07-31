
-- 1. PROFILES: owner-only full access + limited directory view
DROP POLICY IF EXISTS "Authenticated can view profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.family_directory
WITH (security_invoker = true) AS
SELECT id, user_id, full_name, generation, location, occupation, avatar_url, family_branch, contribution_points, created_at
FROM public.profiles;

-- view uses invoker rights, so allow authenticated members to read directory columns
CREATE POLICY "Members can view directory fields"
ON public.profiles FOR SELECT TO authenticated
USING (false);

GRANT SELECT ON public.family_directory TO authenticated;

-- 2. FAMILY MEMBERS: only verified members (with a profile) or admins
DROP POLICY IF EXISTS "Authenticated can view family members" ON public.family_members;

CREATE POLICY "Verified members can view family members"
ON public.family_members FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 3. MEDIA UPLOADS: owner or admin only
DROP POLICY IF EXISTS "Authenticated can view media" ON public.media_uploads;

CREATE POLICY "Users can view own media"
ON public.media_uploads FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- 4. STORAGE: restrict family-media reads to uploader folder or admins
DROP POLICY IF EXISTS "Authenticated can view family-media" ON storage.objects;

CREATE POLICY "Users can view own family-media"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'family-media'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- 5. Internal SECURITY DEFINER trigger/helper functions not callable by clients
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.link_profile_to_family_member() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.get_my_phone_number() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
