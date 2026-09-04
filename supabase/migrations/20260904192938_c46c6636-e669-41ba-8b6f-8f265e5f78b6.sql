REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.link_profile_to_family_member() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_my_phone_number() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_family_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_family_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_family_names() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.accept_family_invite(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_family() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_invite_details(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_phone_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_family_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_family_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_family_names() TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_family_invite(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_family() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_invite_details(text) TO anon, authenticated;