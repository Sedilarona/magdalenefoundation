CREATE TABLE public.game_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_key text NOT NULL,
  host_id uuid NOT NULL,
  host_name text NOT NULL,
  max_players integer NOT NULL DEFAULT 2,
  status text NOT NULL DEFAULT 'open',
  players jsonb NOT NULL DEFAULT '[]'::jsonb,
  player_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  turn_index integer NOT NULL DEFAULT 0,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  winner_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_challenges TO authenticated;
GRANT ALL ON public.game_challenges TO service_role;

ALTER TABLE public.game_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view challenges"
  ON public.game_challenges FOR SELECT TO authenticated
  USING (status = 'open' OR auth.uid() = host_id OR auth.uid() = ANY (player_ids));

CREATE POLICY "Users can create their own challenges"
  ON public.game_challenges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Players can update their challenge"
  ON public.game_challenges FOR UPDATE TO authenticated
  USING (status = 'open' OR auth.uid() = host_id OR auth.uid() = ANY (player_ids))
  WITH CHECK (auth.uid() = host_id OR auth.uid() = ANY (player_ids));

CREATE POLICY "Hosts can delete their challenge"
  ON public.game_challenges FOR DELETE TO authenticated
  USING (auth.uid() = host_id);

CREATE TRIGGER update_game_challenges_updated_at
  BEFORE UPDATE ON public.game_challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_game_challenges_status ON public.game_challenges (game_key, status, created_at DESC);

ALTER TABLE public.game_challenges REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_challenges;