DROP POLICY IF EXISTS "Anyone can view hymns" ON public.hymns;
CREATE POLICY "Signed-in users can view hymns" ON public.hymns FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Scripture content is publicly readable" ON public.scripture_content;
CREATE POLICY "Signed-in users can read scripture" ON public.scripture_content FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Anyone can request a family circle" ON public.family_requests;
REVOKE INSERT ON public.family_requests FROM anon;