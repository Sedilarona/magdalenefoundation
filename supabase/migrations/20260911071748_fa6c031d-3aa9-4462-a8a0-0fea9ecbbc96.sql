CREATE OR REPLACE FUNCTION public.signup_family_names()
 RETURNS TABLE(id uuid, full_name text, gender text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT fm.id, fm.full_name, fm.gender
  FROM public.family_members fm
  JOIN public.families f ON f.id = fm.family_id AND f.status = 'approved'
  WHERE fm.user_id IS NULL
  ORDER BY fm.full_name
$function$;

CREATE OR REPLACE FUNCTION public.claim_family_member(_member_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  m public.family_members%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_signed_in');
  END IF;

  SELECT * INTO m FROM public.family_members WHERE id = _member_id FOR UPDATE;
  IF NOT FOUND OR m.user_id IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'name_unavailable');
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.family_member_id IS NOT NULL) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_linked');
  END IF;

  UPDATE public.family_members SET user_id = auth.uid(), updated_at = now() WHERE id = m.id;

  UPDATE public.profiles
     SET family_id = m.family_id,
         family_member_id = m.id,
         full_name = m.full_name,
         updated_at = now()
   WHERE user_id = auth.uid();

  RETURN jsonb_build_object('ok', true, 'family_id', m.family_id, 'full_name', m.full_name);
END;
$function$;

REVOKE ALL ON FUNCTION public.claim_family_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_family_member(uuid) TO authenticated;