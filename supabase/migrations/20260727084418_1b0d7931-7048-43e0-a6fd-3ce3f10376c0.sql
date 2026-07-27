
-- 1. New columns
ALTER TABLE public.family_members
  ADD COLUMN IF NOT EXISTS sibling_order INTEGER,
  ADD COLUMN IF NOT EXISTS birth_month INTEGER,
  ADD COLUMN IF NOT EXISTS birth_day INTEGER;

-- 2. Add Magdalene's parents (generation -1)
INSERT INTO public.family_members (id, full_name, nickname, gender, is_deceased, generation_level, sibling_order) VALUES
  ('00000000-0000-0000-ffff-000000000001', 'Poane Bodilenyane', 'RaTeko', 'male', true, -1, 1),
  ('00000000-0000-0000-ffff-000000000002', 'Dikeledi Mboshwa', 'Mma Teko', 'female', true, -1, 2)
ON CONFLICT (id) DO NOTHING;

UPDATE public.family_members SET spouse_id='00000000-0000-0000-ffff-000000000002' WHERE id='00000000-0000-0000-ffff-000000000001';
UPDATE public.family_members SET spouse_id='00000000-0000-0000-ffff-000000000001' WHERE id='00000000-0000-0000-ffff-000000000002';

-- Link Magdalene to her parents
UPDATE public.family_members SET parent_id='00000000-0000-0000-ffff-000000000001' WHERE id='00000000-0000-0000-0000-000000000001';

-- 3. Magdalene's siblings (generation 0, parent = RaTeko)
INSERT INTO public.family_members (id, full_name, gender, is_deceased, parent_id, generation_level, sibling_order) VALUES
  ('00000000-0000-0000-fff0-000000000001', 'Teko Bodilenyane', NULL, false, '00000000-0000-0000-ffff-000000000001', 0, 2),
  ('00000000-0000-0000-fff0-000000000002', 'Onkgopotse Boy Bodilenyane', 'male', false, '00000000-0000-0000-ffff-000000000001', 0, 3),
  ('00000000-0000-0000-fff0-000000000003', 'Sechele Bodilenyane', 'male', false, '00000000-0000-0000-ffff-000000000001', 0, 4),
  ('00000000-0000-0000-fff0-000000000004', 'Mmatingwane Bodilenyane', 'female', false, NULL, 0, NULL),
  ('00000000-0000-0000-fff0-000000000005', 'Masego Bodilenyane', 'male', false, '00000000-0000-0000-ffff-000000000001', 0, 5),
  ('00000000-0000-0000-fff0-000000000006', 'Stanley Bodilenyane', 'male', true, '00000000-0000-0000-ffff-000000000001', 0, 6),
  ('00000000-0000-0000-fff0-000000000007', 'Sibling (name pending)', NULL, false, '00000000-0000-0000-ffff-000000000001', 0, 7),
  ('00000000-0000-0000-fff0-000000000008', 'Sibling (name pending)', NULL, false, '00000000-0000-0000-ffff-000000000001', 0, 8),
  ('00000000-0000-0000-fff0-000000000009', 'Sibling (name pending)', NULL, false, '00000000-0000-0000-ffff-000000000001', 0, 9)
ON CONFLICT (id) DO NOTHING;

-- Sechele + Mmatingwane spouse link
UPDATE public.family_members SET spouse_id='00000000-0000-0000-fff0-000000000004' WHERE id='00000000-0000-0000-fff0-000000000003';
UPDATE public.family_members SET spouse_id='00000000-0000-0000-fff0-000000000003' WHERE id='00000000-0000-0000-fff0-000000000004';

-- Set Magdalene as sibling_order 1 among her siblings
UPDATE public.family_members SET sibling_order=1 WHERE id='00000000-0000-0000-0000-000000000001';

-- 4. Stanley's children + grandchildren
INSERT INTO public.family_members (id, full_name, gender, is_deceased, parent_id, generation_level, sibling_order) VALUES
  ('00000000-0000-0000-fff1-000000000010', 'Calistus Bodilenyane', 'male', false, '00000000-0000-0000-fff0-000000000006', 1, 1),
  ('00000000-0000-0000-fff1-000000000011', 'Okina Bodilenyane', 'female', false, '00000000-0000-0000-fff0-000000000006', 1, 2),
  ('00000000-0000-0000-fff1-000000000012', 'Innocent Bodilenyane', 'male', false, '00000000-0000-0000-fff0-000000000006', 1, 3),
  ('00000000-0000-0000-fff1-000000000013', 'Gontse Bodilenyane', 'female', false, '00000000-0000-0000-fff0-000000000006', 1, 4),
  ('00000000-0000-0000-fff2-000000000010', 'Peggy Bodilenyane', 'female', false, '00000000-0000-0000-fff1-000000000013', 2, 1),
  ('00000000-0000-0000-fff2-000000000011', 'Bokamoso Bodilenyane', NULL, false, '00000000-0000-0000-fff1-000000000010', 2, 1),
  ('00000000-0000-0000-fff2-000000000012', 'Hazel Bodilenyane', 'female', false, '00000000-0000-0000-fff1-000000000010', 2, 2),
  ('00000000-0000-0000-fff2-000000000013', 'Child (name pending)', NULL, false, '00000000-0000-0000-fff1-000000000010', 2, 3),
  ('00000000-0000-0000-fff2-000000000014', 'Child (name pending)', NULL, false, '00000000-0000-0000-fff1-000000000010', 2, 4)
ON CONFLICT (id) DO NOTHING;

-- 5. Add Sebaetseng Gabanamotse + descendants
INSERT INTO public.family_members (id, full_name, gender, is_deceased, parent_id, generation_level, sibling_order) VALUES
  ('00000000-0000-0000-ff01-000000000001', 'Sebaetseng Gabanamotse', 'female', true, '00000000-0000-0000-0000-000000000001', 1, 4),
  ('00000000-0000-0000-ff02-000000000001', 'Lesego Phatshimo', 'female', false, '00000000-0000-0000-ff01-000000000001', 2, 1),
  ('00000000-0000-0000-ff02-000000000002', 'Phillip Phatshimo', 'male', false, NULL, 2, NULL),
  ('00000000-0000-0000-ff03-000000000001', 'Lindiwe Pearl Phatshimo', 'female', false, '00000000-0000-0000-ff02-000000000001', 3, 1),
  ('00000000-0000-0000-ff03-000000000002', 'Bakani Dominic Phatshimo', 'male', false, '00000000-0000-0000-ff02-000000000001', 3, 2),
  ('00000000-0000-0000-ff04-000000000001', 'Son (name pending)', 'male', false, '00000000-0000-0000-ff03-000000000001', 4, 1)
ON CONFLICT (id) DO NOTHING;

UPDATE public.family_members SET spouse_id='00000000-0000-0000-ff02-000000000002' WHERE id='00000000-0000-0000-ff02-000000000001';
UPDATE public.family_members SET spouse_id='00000000-0000-0000-ff02-000000000001' WHERE id='00000000-0000-0000-ff02-000000000002';

-- 6. Sibling order for Magdalene's children
UPDATE public.family_members SET sibling_order=1 WHERE id='00000000-0000-0000-0001-000000000002'; -- Thomamiso
UPDATE public.family_members SET sibling_order=2 WHERE id='00000000-0000-0000-0001-000000000003'; -- Lawrence
UPDATE public.family_members SET sibling_order=3 WHERE id='00000000-0000-0000-0001-000000000005'; -- Tshepho
-- Sebaetseng set above (4)
UPDATE public.family_members SET sibling_order=5 WHERE id='00000000-0000-0000-0001-000000000006'; -- Grace
UPDATE public.family_members SET sibling_order=6 WHERE id='00000000-0000-0000-0001-000000000008'; -- Basetsana
UPDATE public.family_members SET sibling_order=7 WHERE id='00000000-0000-0000-0001-000000000010'; -- Caroline
UPDATE public.family_members SET sibling_order=8 WHERE id='00000000-0000-0000-0001-000000000007'; -- Donald
UPDATE public.family_members SET sibling_order=9 WHERE id='00000000-0000-0000-0001-000000000009'; -- Bawini

-- 7. Fix Bawini surname -> Motladiile
UPDATE public.family_members SET full_name='Bawini Motladiile' WHERE id='00000000-0000-0000-0001-000000000009';

-- 8. Rename Danny -> Leatile D. Jansen
UPDATE public.family_members SET full_name='Leatile D. Jansen' WHERE id='00000000-0000-0000-0003-000000000015';

-- 9. Move Kabelo's children to Topo
UPDATE public.family_members SET parent_id='00000000-0000-0000-0002-000000000010'
  WHERE parent_id='00000000-0000-0000-0002-000000000008';

-- 10. Fix Letang (female) and Loago (male) genders per user
UPDATE public.family_members SET gender='male' WHERE id='00000000-0000-0000-0003-000000000027'; -- Letang is a boy
UPDATE public.family_members SET gender='female' WHERE id='00000000-0000-0000-0003-000000000026'; -- Loago is a girl

-- 11. Mooketsi & Palesa children: re-parent, rename to Poane
UPDATE public.family_members SET full_name='Motheo Tinothenda Poane', parent_id='00000000-0000-0000-0002-000000000026', sibling_order=1
  WHERE id='00000000-0000-0000-0003-000000000030';
UPDATE public.family_members SET full_name='Lefhika Donovan Poane', parent_id='00000000-0000-0000-0002-000000000026', sibling_order=2
  WHERE id='00000000-0000-0000-0003-000000000031';
UPDATE public.family_members SET full_name='Seeiso Emjay Poane', parent_id='00000000-0000-0000-0002-000000000026', sibling_order=3
  WHERE id='00000000-0000-0000-0003-000000000032';
UPDATE public.family_members SET full_name='Mooketsi Ajay Poane', parent_id='00000000-0000-0000-0002-000000000026', sibling_order=4
  WHERE id='00000000-0000-0000-0003-000000000033';
UPDATE public.family_members SET full_name='Sedilame Poane', parent_id='00000000-0000-0000-0002-000000000026', sibling_order=5
  WHERE id='00000000-0000-0000-0003-000000000034';

-- 12. Obakeng Motladiile - rename + fix children
UPDATE public.family_members SET full_name='Obakeng Motladiile' WHERE id='00000000-0000-0000-0002-000000000029';
UPDATE public.family_members SET full_name='Imani Motladiile', gender='male' WHERE id='00000000-0000-0000-0003-000000000035';
UPDATE public.family_members SET full_name='Halima Motladiile', gender='female' WHERE id='00000000-0000-0000-0003-000000000036';
INSERT INTO public.family_members (id, full_name, gender, parent_id, generation_level, sibling_order) VALUES
  ('00000000-0000-0000-0003-000000000037', 'Adina Motladiile', 'female', '00000000-0000-0000-0002-000000000029', 3, 3)
ON CONFLICT (id) DO NOTHING;

-- 13. Gaone has no kids: already handled by re-parenting Ajay/Seiso above.

-- 14. Fix Lawrence spelling
UPDATE public.family_members SET full_name='Lawrence Bodilenyane' WHERE id='00000000-0000-0000-0001-000000000003';

-- 15. Birthdays (month/day)
UPDATE public.family_members SET birth_month=5, birth_day=9 WHERE id='00000000-0000-0000-0002-000000000030'; -- Olefile
UPDATE public.family_members SET birth_month=5, birth_day=9 WHERE id='00000000-0000-0000-0003-000000000051'; -- Mohau
UPDATE public.family_members SET birth_month=1, birth_day=10 WHERE id='00000000-0000-0000-0002-000000000008'; -- Kabelo
UPDATE public.family_members SET birth_month=1, birth_day=11 WHERE id='00000000-0000-0000-0001-000000000007'; -- Donald
UPDATE public.family_members SET birth_month=1, birth_day=13 WHERE id='00000000-0000-0000-0002-000000000012'; -- Keamogetse
UPDATE public.family_members SET birth_month=1, birth_day=22 WHERE id='00000000-0000-0000-0003-000000000002'; -- Boitumelo
UPDATE public.family_members SET birth_month=1, birth_day=3  WHERE id='00000000-0000-0000-fff1-000000000010'; -- Calistus
UPDATE public.family_members SET birth_month=11, birth_day=23 WHERE id='00000000-0000-0000-fff1-000000000013'; -- Gontse
UPDATE public.family_members SET birth_month=10, birth_day=28 WHERE id='00000000-0000-0000-0002-000000000004'; -- Lesego Kgafela
UPDATE public.family_members SET birth_month=11, birth_day=28 WHERE id='00000000-0000-0000-0002-000000000025'; -- Kealeboga
UPDATE public.family_members SET birth_month=12, birth_day=1  WHERE id='00000000-0000-0000-0002-000000000015'; -- Oaitse
UPDATE public.family_members SET birth_month=12, birth_day=3  WHERE id='00000000-0000-0000-0002-000000000017'; -- Tshidiso
UPDATE public.family_members SET birth_month=12, birth_day=7  WHERE id='00000000-0000-0000-0002-000000000010'; -- Topo
UPDATE public.family_members SET birth_month=2, birth_day=10  WHERE id='00000000-0000-0000-0002-000000000011'; -- Patrick
UPDATE public.family_members SET birth_month=2, birth_day=12  WHERE id='00000000-0000-0000-0002-000000000018'; -- Mpho
UPDATE public.family_members SET birth_month=2, birth_day=19  WHERE id='00000000-0000-0000-fff1-000000000011'; -- Okina
UPDATE public.family_members SET birth_month=3, birth_day=1   WHERE id='00000000-0000-0000-fff1-000000000012'; -- Innocent
UPDATE public.family_members SET birth_month=3, birth_day=16  WHERE id='00000000-0000-0000-0003-000000000004'; -- Thabang
UPDATE public.family_members SET birth_month=3, birth_day=19  WHERE id='00000000-0000-0000-0002-000000000019'; -- Tefo Kebitseng
UPDATE public.family_members SET birth_month=3, birth_day=26  WHERE id='00000000-0000-0000-0003-000000000013'; -- Lebone
UPDATE public.family_members SET birth_month=3, birth_day=26  WHERE id='00000000-0000-0000-0003-000000000034'; -- Sedilame
UPDATE public.family_members SET birth_month=3, birth_day=28  WHERE id='00000000-0000-0000-0002-000000000023'; -- Kefilwe
UPDATE public.family_members SET birth_month=3, birth_day=31  WHERE id='00000000-0000-0000-0002-000000000006'; -- Letsogile
UPDATE public.family_members SET birth_month=3, birth_day=31  WHERE id='00000000-0000-0000-0002-000000000026'; -- Mooketsi
UPDATE public.family_members SET birth_month=3, birth_day=7   WHERE id='00000000-0000-0000-0002-000000000021'; -- Mopati
UPDATE public.family_members SET birth_month=4, birth_day=2   WHERE id='00000000-0000-0000-0001-000000000004'; -- Judith (Lawrence's wife)
UPDATE public.family_members SET birth_month=4, birth_day=5   WHERE id='00000000-0000-0000-0001-000000000003'; -- Lawrence
UPDATE public.family_members SET birth_month=5, birth_day=19  WHERE id='00000000-0000-0000-0002-000000000005'; -- Tefo Kgafela
UPDATE public.family_members SET birth_month=6, birth_day=1   WHERE id='00000000-0000-0000-0002-000000000013'; -- Tumisang
UPDATE public.family_members SET birth_month=6, birth_day=30  WHERE id='00000000-0000-0000-0002-000000000028'; -- Gaone
UPDATE public.family_members SET birth_month=6, birth_day=4   WHERE id='00000000-0000-0000-0002-000000000007'; -- Bontle
UPDATE public.family_members SET birth_month=6, birth_day=7   WHERE id='00000000-0000-0000-0002-000000000001'; -- Seabe
UPDATE public.family_members SET birth_month=7, birth_day=29  WHERE id='00000000-0000-0000-0003-000000000001'; -- Thuso
UPDATE public.family_members SET birth_month=7, birth_day=7   WHERE id='00000000-0000-0000-0002-000000000016'; -- Oankgoga
UPDATE public.family_members SET birth_month=8, birth_day=23  WHERE id='00000000-0000-0000-0002-000000000029'; -- Obakeng
UPDATE public.family_members SET birth_month=8, birth_day=28  WHERE id='00000000-0000-0000-0002-000000000002'; -- Ogomoditse
UPDATE public.family_members SET birth_month=9, birth_day=25  WHERE id='00000000-0000-0000-0001-000000000006'; -- Grace
UPDATE public.family_members SET birth_month=9, birth_day=8   WHERE id='00000000-0000-0000-0002-000000000020'; -- Maipelo
