CREATE TABLE public.login_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  family_id uuid REFERENCES public.families(id),
  full_name text,
  event text NOT NULL DEFAULT 'login',
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.login_activity TO authenticated;
GRANT ALL ON public.login_activity TO service_role;

ALTER TABLE public.login_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own login activity"
ON public.login_activity FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users read own login activity"
ON public.login_activity FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Family admins read family login activity"
ON public.login_activity FOR SELECT TO authenticated
USING (public.is_family_admin(family_id) OR public.is_platform_admin());

CREATE INDEX idx_login_activity_user ON public.login_activity(user_id, created_at DESC);
CREATE INDEX idx_login_activity_family ON public.login_activity(family_id, created_at DESC);

CREATE TABLE public.pending_platform_admins (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.pending_platform_admins TO service_role;
ALTER TABLE public.pending_platform_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins manage pending platform admins"
ON public.pending_platform_admins FOR ALL TO authenticated
USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

CREATE OR REPLACE FUNCTION public.record_login(_user_agent text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE p public.profiles%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  SELECT * INTO p FROM public.profiles WHERE user_id = auth.uid();
  INSERT INTO public.login_activity (user_id, family_id, full_name, user_agent)
  VALUES (auth.uid(), p.family_id, COALESCE(p.full_name, 'Member'), left(COALESCE(_user_agent, ''), 300));
END;
$$;

REVOKE ALL ON FUNCTION public.record_login(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_login(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.family_activity_report()
RETURNS TABLE(user_id uuid, full_name text, avatar_url text, last_login timestamptz, login_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id,
         p.full_name,
         p.avatar_url,
         (SELECT max(la.created_at) FROM public.login_activity la WHERE la.user_id = p.user_id),
         (SELECT count(*) FROM public.login_activity la WHERE la.user_id = p.user_id)
  FROM public.profiles p
  WHERE p.family_id = public.current_family_id()
    AND (public.is_family_admin(p.family_id) OR public.is_platform_admin())
  ORDER BY p.full_name
$$;

REVOKE ALL ON FUNCTION public.family_activity_report() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.family_activity_report() TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Member'));

  IF EXISTS (SELECT 1 FROM public.pending_platform_admins pa WHERE lower(pa.email) = lower(NEW.email)) THEN
    INSERT INTO public.platform_admins (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;