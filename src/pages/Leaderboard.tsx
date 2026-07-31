import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, Loader2, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Row {
  player_name: string;
  user_id: string;
  points: number;
  games: number;
}

const Leaderboard = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("game_scores")
        .select("user_id, player_name, points")
        .limit(2000);
      const map = new Map<string, Row>();
      (data ?? []).forEach((s) => {
        const existing = map.get(s.user_id) ?? {
          user_id: s.user_id,
          player_name: s.player_name ?? "Family member",
          points: 0,
          games: 0,
        };
        existing.points += s.points ?? 0;
        existing.games += 1;
        map.set(s.user_id, existing);
      });
      setRows([...map.values()].sort((a, b) => b.points - a.points));
      setLoading(false);
    })();
  }, []);

  const medal = ["text-yellow-500", "text-slate-400", "text-amber-700"];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 lg:px-8 h-16 max-w-4xl mx-auto">
          <Link to="/games" className="text-muted-foreground hover:text-foreground" aria-label="Back to games">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-lg font-semibold">Family Leaderboard</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-4 lg:p-8">
        <p className="text-muted-foreground mb-6">
          Every point earned in Family Tricks counts. Play more, climb higher.
        </p>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-sage-100">
            <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="font-medium">No scores yet</p>
            <p className="text-sm text-muted-foreground">Be the first to play a game and top the board.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((r, i) => (
              <li
                key={r.user_id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-sage-100 shadow-card"
              >
                <span className="w-8 text-center font-display font-bold text-lg">
                  {i < 3 ? <Medal className={`w-5 h-5 mx-auto ${medal[i]}`} /> : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.player_name}</p>
                  <p className="text-xs text-muted-foreground">{r.games} rounds played</p>
                </div>
                <span className="font-display font-bold text-primary">{r.points} pts</span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
