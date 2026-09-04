-- ============ 1. Core multi-tenant tables ============
CREATE TABLE public.families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  motto text,
  status text NOT NULL DEFAULT 'pending',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.families TO authenticated;
GRANT ALL ON public.families TO service_role;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.platform_admins (
  user_id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.family_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name text NOT NULL,
  founder_name text NOT NULL,
  contact_email text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  family_id uuid REFERENCES public.families(id) ON DELETE SET NULL,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.family_requests TO anon, authenticated;
GRANT SELECT, UPDATE ON public.family_requests TO authenticated;
GRANT ALL ON public.family_requests TO service_role;
ALTER TABLE public.family_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.family_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  family_member_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  role text NOT NULL DEFAULT 'member',
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  accepted_by uuid,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_invites TO authenticated;
GRANT ALL ON public.family_invites TO service_role;
ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;

-- ============ 2. Seed the Magdalene family & tag existing data ============
INSERT INTO public.families (id, name, slug, motto, status)
VALUES ('11111111-1111-4111-8111-111111111111', 'Magdalene Family Circle', 'magdalene',
        'Sethare se segologolo, Sethare se setona, Sethare Moriti o tsidididi, Sethare se maungo a monate', 'approved');

ALTER TABLE public.profiles ADD COLUMN family_id uuid REFERENCES public.families(id) ON DELETE SET NULL;
ALTER TABLE public.family_members ADD COLUMN family_id uuid REFERENCES public.families(id) ON DELETE CASCADE;
ALTER TABLE public.tales ADD COLUMN family_id uuid REFERENCES public.families(id) ON DELETE CASCADE;
ALTER TABLE public.media_uploads ADD COLUMN family_id uuid REFERENCES public.families(id) ON DELETE CASCADE;
ALTER TABLE public.announcements ADD COLUMN family_id uuid REFERENCES public.families(id) ON DELETE CASCADE;
ALTER TABLE public.game_scores ADD COLUMN family_id uuid REFERENCES public.families(id) ON DELETE CASCADE;
ALTER TABLE public.game_challenges ADD COLUMN family_id uuid REFERENCES public.families(id) ON DELETE CASCADE;
ALTER TABLE public.user_roles ADD COLUMN family_id uuid REFERENCES public.families(id) ON DELETE CASCADE;

UPDATE public.profiles SET family_id = '11111111-1111-4111-8111-111111111111' WHERE family_id IS NULL;
UPDATE public.family_members SET family_id = '11111111-1111-4111-8111-111111111111' WHERE family_id IS NULL;
UPDATE public.tales SET family_id = '11111111-1111-4111-8111-111111111111' WHERE family_id IS NULL;
UPDATE public.media_uploads SET family_id = '11111111-1111-4111-8111-111111111111' WHERE family_id IS NULL;
UPDATE public.game_scores SET family_id = '11111111-1111-4111-8111-111111111111' WHERE family_id IS NULL;
UPDATE public.game_challenges SET family_id = '11111111-1111-4111-8111-111111111111' WHERE family_id IS NULL;
UPDATE public.user_roles SET family_id = '11111111-1111-4111-8111-111111111111' WHERE family_id IS NULL;

ALTER TABLE public.family_members ALTER COLUMN family_id SET NOT NULL;
CREATE INDEX idx_family_members_family ON public.family_members(family_id);
CREATE INDEX idx_profiles_family ON public.profiles(family_id);
CREATE INDEX idx_tales_family ON public.tales(family_id);
CREATE INDEX idx_media_family ON public.media_uploads(family_id);
CREATE INDEX idx_scores_family ON public.game_scores(family_id);
CREATE INDEX idx_challenges_family ON public.game_challenges(family_id);

-- existing admins become platform owners as well
INSERT INTO public.platform_admins (user_id)
SELECT DISTINCT user_id FROM public.user_roles WHERE role = 'admin'
ON CONFLICT DO NOTHING;

-- ============ 3. Helper functions ============
CREATE OR REPLACE FUNCTION public.current_family_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.family_id FROM public.profiles p
  JOIN public.families f ON f.id = p.family_id AND f.status = 'approved'
  WHERE p.user_id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.is_family_admin(_family_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _family_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin' AND ur.family_id = _family_id
  )
$$;

REVOKE EXECUTE ON FUNCTION public.current_family_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_family_admin(uuid) FROM anon;

-- ============ 4. Policies for the new tables ============
CREATE POLICY "Members view their own family" ON public.families FOR SELECT TO authenticated
  USING (id = public.current_family_id() OR public.is_platform_admin() OR created_by = auth.uid());
CREATE POLICY "Platform owners manage families" ON public.families FOR UPDATE TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Platform owners create families" ON public.families FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin());

CREATE POLICY "See own platform-owner row" ON public.platform_admins FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can request a family circle" ON public.family_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Platform owners review requests" ON public.family_requests FOR SELECT TO authenticated
  USING (public.is_platform_admin());
CREATE POLICY "Platform owners update requests" ON public.family_requests FOR UPDATE TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

CREATE POLICY "Family admins view invites" ON public.family_invites FOR SELECT TO authenticated
  USING (public.is_family_admin(family_id) OR public.is_platform_admin());
CREATE POLICY "Family admins create invites" ON public.family_invites FOR INSERT TO authenticated
  WITH CHECK (public.is_family_admin(family_id) OR public.is_platform_admin());
CREATE POLICY "Family admins update invites" ON public.family_invites FOR UPDATE TO authenticated
  USING (public.is_family_admin(family_id) OR public.is_platform_admin())
  WITH CHECK (public.is_family_admin(family_id) OR public.is_platform_admin());
CREATE POLICY "Family admins delete invites" ON public.family_invites FOR DELETE TO authenticated
  USING (public.is_family_admin(family_id) OR public.is_platform_admin());

-- ============ 5. Rewrite policies on existing tables for family isolation ============
DROP POLICY IF EXISTS "Verified members can view family members" ON public.family_members;
DROP POLICY IF EXISTS "Admins can insert family members" ON public.family_members;
DROP POLICY IF EXISTS "Admins can update family members" ON public.family_members;
CREATE POLICY "Members view their family tree" ON public.family_members FOR SELECT TO authenticated
  USING (family_id = public.current_family_id());
CREATE POLICY "Family admins add tree records" ON public.family_members FOR INSERT TO authenticated
  WITH CHECK (public.is_family_admin(family_id));
CREATE POLICY "Family admins edit tree records" ON public.family_members FOR UPDATE TO authenticated
  USING (public.is_family_admin(family_id)) WITH CHECK (public.is_family_admin(family_id));
CREATE POLICY "Family admins remove tree records" ON public.family_members FOR DELETE TO authenticated
  USING (public.is_family_admin(family_id));

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile phone and services" ON public.profiles;
CREATE POLICY "View own profile" ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_family_admin(family_id) OR public.is_platform_admin());
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can view published tales" ON public.tales;
DROP POLICY IF EXISTS "Users can view their own tales" ON public.tales;
DROP POLICY IF EXISTS "Users can insert their own tales" ON public.tales;
DROP POLICY IF EXISTS "Users can update their own tales" ON public.tales;
DROP POLICY IF EXISTS "Users can delete their own tales" ON public.tales;
CREATE POLICY "Members read their family stories" ON public.tales FOR SELECT TO authenticated
  USING ((is_published = true AND family_id = public.current_family_id()) OR user_id = auth.uid());
CREATE POLICY "Members write stories in their family" ON public.tales FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND family_id = public.current_family_id());
CREATE POLICY "Authors edit their stories" ON public.tales FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authors remove their stories" ON public.tales FOR DELETE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own media" ON public.media_uploads;
DROP POLICY IF EXISTS "Users can upload media" ON public.media_uploads;
CREATE POLICY "View own or family media" ON public.media_uploads FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_family_admin(family_id));
CREATE POLICY "Upload media into own family" ON public.media_uploads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (family_id IS NULL OR family_id = public.current_family_id()));

DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.announcements;
CREATE POLICY "Members view their announcements" ON public.announcements FOR SELECT TO authenticated
  USING (is_active = true AND (family_id IS NULL OR family_id = public.current_family_id()));
CREATE POLICY "Family admins post announcements" ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (public.is_family_admin(family_id));
CREATE POLICY "Family admins edit announcements" ON public.announcements FOR UPDATE TO authenticated
  USING (public.is_family_admin(family_id)) WITH CHECK (public.is_family_admin(family_id));

DROP POLICY IF EXISTS "Members can view all game scores" ON public.game_scores;
DROP POLICY IF EXISTS "Users can record their own scores" ON public.game_scores;
CREATE POLICY "Family leaderboard" ON public.game_scores FOR SELECT TO authenticated
  USING (family_id = public.current_family_id() OR user_id = auth.uid());
CREATE POLICY "Record own scores" ON public.game_scores FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (family_id IS NULL OR family_id = public.current_family_id()));

DROP POLICY IF EXISTS "Authenticated can view challenges" ON public.game_challenges;
DROP POLICY IF EXISTS "Users can create their own challenges" ON public.game_challenges;
CREATE POLICY "Family challenges" ON public.game_challenges FOR SELECT TO authenticated
  USING ((family_id = public.current_family_id() AND (status = 'open' OR auth.uid() = host_id OR auth.uid() = ANY (player_ids)))
         OR auth.uid() = host_id);
CREATE POLICY "Host own challenges" ON public.game_challenges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = host_id AND (family_id IS NULL OR family_id = public.current_family_id()));

-- ============ 6. Family-scoped helpers used by the app ============
DROP FUNCTION IF EXISTS public.list_family_names();
CREATE OR REPLACE FUNCTION public.list_family_names()
RETURNS TABLE(id uuid, full_name text, gender text, birth_year text, generation_level integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT fm.id, fm.full_name, fm.gender, fm.birth_year, fm.generation_level
  FROM public.family_members fm
  WHERE COALESCE(fm.is_deceased, false) = false
    AND fm.family_id = public.current_family_id()
  ORDER BY fm.full_name
$$;
REVOKE EXECUTE ON FUNCTION public.list_family_names() FROM anon;

-- Look up an invitation by its one-time link (safe subset, no token echo)
CREATE OR REPLACE FUNCTION public.get_invite_details(_token text)
RETURNS TABLE(full_name text, email text, family_name text, role text, valid boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT i.full_name, i.email, f.name, i.role,
         (i.status = 'pending' AND i.expires_at > now() AND f.status = 'approved')
  FROM public.family_invites i
  JOIN public.families f ON f.id = i.family_id
  WHERE i.token = _token
  LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.get_invite_details(text) TO anon, authenticated;

-- Redeem an invitation for the signed-in user
CREATE OR REPLACE FUNCTION public.accept_family_invite(_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  inv public.family_invites%ROWTYPE;
  fam public.families%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_signed_in');
  END IF;

  SELECT * INTO inv FROM public.family_invites WHERE token = _token FOR UPDATE;
  IF NOT FOUND OR inv.status <> 'pending' OR inv.expires_at <= now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_invite');
  END IF;

  SELECT * INTO fam FROM public.families WHERE id = inv.family_id;
  IF fam.status <> 'approved' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'family_not_active');
  END IF;

  UPDATE public.profiles
     SET family_id = inv.family_id,
         full_name = COALESCE(NULLIF(inv.full_name, ''), full_name),
         family_member_id = COALESCE(inv.family_member_id, family_member_id),
         updated_at = now()
   WHERE user_id = auth.uid();

  IF inv.role = 'admin' THEN
    INSERT INTO public.user_roles (user_id, role, family_id)
    VALUES (auth.uid(), 'admin', inv.family_id)
    ON CONFLICT (user_id, role) DO UPDATE SET family_id = EXCLUDED.family_id;
  END IF;

  UPDATE public.family_invites
     SET status = 'accepted', accepted_by = auth.uid(), accepted_at = now()
   WHERE id = inv.id;

  RETURN jsonb_build_object('ok', true, 'family_id', inv.family_id, 'family_name', fam.name);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.accept_family_invite(text) FROM anon;

-- Family membership summary for the signed-in user
CREATE OR REPLACE FUNCTION public.my_family()
RETURNS TABLE(family_id uuid, family_name text, motto text, status text, is_admin boolean, is_platform_admin boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.id, f.name, f.motto, f.status,
         EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin' AND ur.family_id = f.id),
         public.is_platform_admin()
  FROM public.profiles p
  LEFT JOIN public.families f ON f.id = p.family_id
  WHERE p.user_id = auth.uid()
  LIMIT 1
$$;
REVOKE EXECUTE ON FUNCTION public.my_family() FROM anon;

-- link trigger stays family-aware
CREATE OR REPLACE FUNCTION public.link_profile_to_family_member()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.family_id IS NULL THEN
    RETURN NEW;
  END IF;
  UPDATE public.family_members
     SET user_id = NEW.user_id, updated_at = now()
   WHERE user_id IS NULL
     AND family_id = NEW.family_id
     AND lower(trim(full_name)) = lower(trim(NEW.full_name));
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON public.families
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();