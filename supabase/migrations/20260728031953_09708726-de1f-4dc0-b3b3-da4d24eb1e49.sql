
-- 1) Family tree fixes
UPDATE public.family_members
SET full_name='Poane George Bodilenyane', nickname='RaTeko', gender='male'
WHERE id='00000000-0000-0000-ffff-000000000001'::uuid;

UPDATE public.family_members
SET full_name='Teko Mazile'
WHERE id='00000000-0000-0000-fff0-000000000001'::uuid;

UPDATE public.family_members
SET full_name='Letsogile Bodilenyane', nickname='Stanley'
WHERE id='00000000-0000-0000-fff0-000000000006'::uuid;

-- Add missing siblings of Magdalene
INSERT INTO public.family_members (id, full_name, gender, parent_id, generation_level, is_deceased)
VALUES
  ('00000000-0000-0000-fff0-000000000007'::uuid, 'Mmasane Bodilenyane', NULL,   '00000000-0000-0000-ffff-000000000001'::uuid, 0, false),
  ('00000000-0000-0000-fff0-000000000008'::uuid, 'Thuso Bodilenyane',   NULL,   '00000000-0000-0000-ffff-000000000001'::uuid, 0, false),
  ('00000000-0000-0000-fff0-000000000009'::uuid, 'Stanley Poane',       'male', '00000000-0000-0000-ffff-000000000001'::uuid, 0, false)
ON CONFLICT (id) DO NOTHING;

-- 2) Profiles: family branch
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_branch text;

-- 3) Media uploads table
CREATE TABLE IF NOT EXISTS public.media_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_uploads TO authenticated;
GRANT ALL ON public.media_uploads TO service_role;

ALTER TABLE public.media_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view media" ON public.media_uploads
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can upload media" ON public.media_uploads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own media" ON public.media_uploads
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own media" ON public.media_uploads
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4) Storage policies for family-media bucket
CREATE POLICY "Authenticated can view family-media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'family-media');

CREATE POLICY "Users can upload to own folder in family-media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'family-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own family-media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'family-media' AND (storage.foldername(name))[1] = auth.uid()::text);
