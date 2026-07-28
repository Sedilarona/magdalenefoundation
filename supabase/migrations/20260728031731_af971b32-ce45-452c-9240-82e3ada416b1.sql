
-- 1. Roles system
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Lock down function execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.link_profile_to_family_member() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 2. family_members: restrict SELECT to authenticated; writes to admins
DROP POLICY IF EXISTS "Anyone can view family members" ON public.family_members;
DROP POLICY IF EXISTS "Authenticated users can insert family members" ON public.family_members;
DROP POLICY IF EXISTS "Authenticated users can update family members" ON public.family_members;

CREATE POLICY "Authenticated can view family members" ON public.family_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert family members" ON public.family_members
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update family members" ON public.family_members
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

REVOKE SELECT ON public.family_members FROM anon;

-- 3. profiles: restrict SELECT to authenticated; hide phone via view
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT (phone_number) ON public.profiles FROM authenticated;
GRANT SELECT (phone_number) ON public.profiles TO service_role;
-- Allow users to still see their own phone number via a policy-friendly grant
-- (column privilege applies before RLS; owners access via separate column grant path is not possible,
-- so expose own phone through a security definer helper)
CREATE OR REPLACE FUNCTION public.get_my_phone_number()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT phone_number FROM public.profiles WHERE user_id = auth.uid()
$$;
REVOKE EXECUTE ON FUNCTION public.get_my_phone_number() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_phone_number() TO authenticated;

-- 4. hymns: only admins can insert
DROP POLICY IF EXISTS "Authenticated users can insert hymns" ON public.hymns;
CREATE POLICY "Admins can insert hymns" ON public.hymns
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
