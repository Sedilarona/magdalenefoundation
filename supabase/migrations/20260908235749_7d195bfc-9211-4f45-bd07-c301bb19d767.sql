ALTER TABLE public.tales ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.tales DROP CONSTRAINT tales_user_id_fkey;
ALTER TABLE public.tales
  ADD CONSTRAINT tales_user_id_fkey FOREIGN KEY (user_id)
  REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.family_members DROP CONSTRAINT family_members_user_id_fkey;
ALTER TABLE public.family_members
  ADD CONSTRAINT family_members_user_id_fkey FOREIGN KEY (user_id)
  REFERENCES auth.users(id) ON DELETE SET NULL;