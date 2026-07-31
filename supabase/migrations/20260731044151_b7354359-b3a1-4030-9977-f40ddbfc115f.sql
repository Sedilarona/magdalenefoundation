
CREATE TABLE public.game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  player_name text NOT NULL DEFAULT 'Family member',
  game_key text NOT NULL,
  game_title text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  points integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_scores TO authenticated;
GRANT ALL ON public.game_scores TO service_role;

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view all game scores"
ON public.game_scores FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can record their own scores"
ON public.game_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores"
ON public.game_scores FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scores"
ON public.game_scores FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_game_scores_user ON public.game_scores(user_id);
CREATE INDEX idx_game_scores_created ON public.game_scores(created_at DESC);
