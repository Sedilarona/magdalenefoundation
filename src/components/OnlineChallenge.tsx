import { useEffect, useState } from "react";
import { Swords, Loader2, Users, Bot, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ChallengePlayer {
  id: string;
  name: string;
  isBot?: boolean;
}

export interface Challenge {
  id: string;
  game_key: string;
  host_id: string;
  host_name: string;
  max_players: number;
  status: string;
  players: ChallengePlayer[];
  player_ids: string[];
  turn_index: number;
  state: Record<string, unknown>;
  winner_id: string | null;
}

/** The label used everywhere for the computer opponent. */
export const AI_PLAYER_NAME = "MAGGIE";

interface Props {
  gameKey: string;
  gameTitle: string;
  /** Maximum seats this game supports (2–4). */
  maxPlayers?: number;
  /** Called when a challenge becomes active and this user is a player. */
  onStart?: (challenge: Challenge) => void;
  /** Currently joined challenge, if the game screen is tracking one. */
  activeChallenge?: Challenge | null;
}

export const OnlineChallenge = ({
  gameKey,
  gameTitle,
  maxPlayers = 2,
  onStart,
  activeChallenge,
}: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [seats, setSeats] = useState(String(Math.min(2, maxPlayers)));
  const [myName, setMyName] = useState("Family member");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => data?.full_name && setMyName(data.full_name));
  }, [user]);

  const load = async () => {
    const { data } = await supabase
      .from("game_challenges")
      .select("*")
      .eq("game_key", gameKey)
      .in("status", ["open", "active"])
      .order("created_at", { ascending: false })
      .limit(20);
    setChallenges((data as unknown as Challenge[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`challenges-${gameKey}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_challenges", filter: `game_key=eq.${gameKey}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey]);

  // Auto-hand off to the game board once a challenge we're in goes active.
  useEffect(() => {
    if (!user || !onStart) return;
    const mine = challenges.find(
      (c) => c.status === "active" && c.player_ids.includes(user.id)
    );
    if (mine && mine.id !== activeChallenge?.id) onStart(mine);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenges, user]);

  const createChallenge = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("game_challenges").insert({
      game_key: gameKey,
      host_id: user.id,
      host_name: myName,
      max_players: Number(seats),
      status: "open",
      players: [{ id: user.id, name: myName }] as never,
      player_ids: [user.id],
    });
    setBusy(false);
    if (error) {
      toast({ title: "Could not create challenge", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Challenge sent", description: `Waiting for family members to join ${gameTitle}.` });
      load();
    }
  };

  const joinChallenge = async (c: Challenge) => {
    if (!user) return;
    if (c.player_ids.includes(user.id)) return onStart?.(c);
    if (c.players.length >= c.max_players) {
      return toast({ title: "Table is full", variant: "destructive" });
    }
    setBusy(true);
    const players = [...c.players, { id: user.id, name: myName }];
    const player_ids = [...c.player_ids, user.id];
    const { error } = await supabase
      .from("game_challenges")
      .update({
        players: players as never,
        player_ids,
        status: players.length >= c.max_players ? "active" : "open",
      })
      .eq("id", c.id);
    setBusy(false);
    if (error) toast({ title: "Could not join", description: error.message, variant: "destructive" });
    else load();
  };

  const fillWithMaggie = async (c: Challenge) => {
    const players = [...c.players];
    while (players.length < c.max_players) {
      players.push({ id: `maggie-${players.length}`, name: AI_PLAYER_NAME, isBot: true });
    }
    await supabase
      .from("game_challenges")
      .update({ players: players as never, status: "active" })
      .eq("id", c.id);
    load();
  };

  const cancelChallenge = async (id: string) => {
    await supabase.from("game_challenges").delete().eq("id", id);
    load();
  };

  if (!user) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">
            Challenge the family online
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {maxPlayers > 2 && (
            <Select value={seats} onValueChange={setSeats}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxPlayers - 1 }, (_, i) => i + 2).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} players
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button size="sm" onClick={createChallenge} disabled={busy} className="gap-2">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
            Send challenge
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-6 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : challenges.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No open challenges yet. Send one and family members will see it here in real time — or
          add {AI_PLAYER_NAME} to fill the empty seats.
        </p>
      ) : (
        <ul className="space-y-2">
          {challenges.map((c) => {
            const mine = c.host_id === user.id;
            const joined = c.player_ids.includes(user.id);
            return (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-muted/50 border border-border"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {mine ? "Your challenge" : `${c.host_name} is waiting`}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    {c.players.map((p) => p.name).join(", ")} &middot; {c.players.length}/
                    {c.max_players} seats &middot; {c.status}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {mine && c.status === "open" && c.players.length < c.max_players && (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fillWithMaggie(c)}>
                      <Bot className="w-3.5 h-3.5" />
                      Add {AI_PLAYER_NAME}
                    </Button>
                  )}
                  {!joined && c.status === "open" && (
                    <Button size="sm" onClick={() => joinChallenge(c)} disabled={busy}>
                      Accept
                    </Button>
                  )}
                  {joined && c.status === "active" && (
                    <Button size="sm" className="gap-1.5" onClick={() => onStart?.(c)}>
                      <Play className="w-3.5 h-3.5" />
                      Play
                    </Button>
                  )}
                  {mine && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelChallenge(c.id)}
                      aria-label="Cancel challenge"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
