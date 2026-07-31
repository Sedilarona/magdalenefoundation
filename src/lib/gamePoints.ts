import { supabase } from "@/integrations/supabase/client";

export interface AwardArgs {
  gameKey: string;
  gameTitle: string;
  level?: number;
  points: number;
}

/**
 * Records points earned for a game round. Silently no-ops when signed out so
 * gameplay is never blocked by scoring.
 */
export async function awardPoints({ gameKey, gameTitle, level = 1, points }: AwardArgs) {
  if (points <= 0) return;
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return;

  let playerName = "Family member";
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile?.full_name) playerName = profile.full_name;

  await supabase.from("game_scores").insert({
    user_id: user.id,
    player_name: playerName,
    game_key: gameKey,
    game_title: gameTitle,
    level,
    points,
  });
}
