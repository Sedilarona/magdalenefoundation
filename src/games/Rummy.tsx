import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { RotateCcw, Users, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { awardPoints } from "@/lib/gamePoints";
import {
  OnlineChallenge,
  AI_PLAYER_NAME,
  type Challenge,
  type ChallengePlayer,
} from "@/components/OnlineChallenge";

/**
 * Family Rummy — 2 to 4 players, online or against MAGGIE.
 *
 * WIN CONDITION (house rules): a player wins by laying down exactly three
 * melds — two melds of 3 cards and one meld of 4 cards (10 cards in total).
 */

const SUITS = ["♠", "♥", "♦", "♣"] as const;
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;
type Suit = (typeof SUITS)[number];
type Rank = (typeof RANKS)[number];
interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

const GAME_KEY = "rummy";
const GAME_TITLE = "Family Rummy";
const HAND_SIZE = 10;

const HOW_TO_PLAY = [
  "Each player is dealt 10 cards. On your turn, draw from the deck or take the top discard.",
  "Form melds: a set is 3+ cards of the same rank; a run is 3+ consecutive cards in one suit.",
  "To win you must lay down exactly three melds — two melds of 3 cards and one meld of 4 cards.",
  "Select cards in your hand, tap “Lay meld”, then discard one card to end your turn.",
  "Play alone against MAGGIE, or send a challenge so up to 4 family members can join the table.",
];

const rankValue = (r: Rank) => RANKS.indexOf(r);

const buildDeck = (): Card[] => {
  const d: Card[] = [];
  SUITS.forEach((s, si) =>
    RANKS.forEach((r) => d.push({ suit: s, rank: r, id: `${r}${s}${si}` })),
  );
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
};

const isValidMeld = (cards: Card[]): boolean => {
  if (cards.length < 3 || cards.length > 4) return false;
  if (cards.every((c) => c.rank === cards[0].rank)) return true;
  if (!cards.every((c) => c.suit === cards[0].suit)) return false;
  const sorted = [...cards].sort((a, b) => rankValue(a.rank) - rankValue(b.rank));
  for (let i = 1; i < sorted.length; i++) {
    if (rankValue(sorted[i].rank) !== rankValue(sorted[i - 1].rank) + 1) return false;
  }
  return true;
};

/** Two melds of three plus one meld of four. */
const hasWinningLayout = (melds: Card[][]) => {
  if (melds.length !== 3) return false;
  const sizes = melds.map((m) => m.length).sort();
  return sizes[0] === 3 && sizes[1] === 3 && sizes[2] === 4;
};

const meldsRemainingLabel = (melds: Card[][]) => {
  const threes = melds.filter((m) => m.length === 3).length;
  const fours = melds.filter((m) => m.length === 4).length;
  return `${threes}/2 melds of three · ${fours}/1 meld of four`;
};

interface GameState {
  deck: Card[];
  discard: Card[];
  hands: Record<string, Card[]>;
  melds: Record<string, Card[][]>;
  turnIndex: number;
  phase: "draw" | "play";
  winnerId: string | null;
}

const dealState = (players: ChallengePlayer[]): GameState => {
  const deck = buildDeck();
  const hands: Record<string, Card[]> = {};
  const melds: Record<string, Card[][]> = {};
  players.forEach((p) => {
    hands[p.id] = deck.splice(0, HAND_SIZE);
    melds[p.id] = [];
  });
  return {
    deck,
    discard: [deck.splice(0, 1)[0]],
    hands,
    melds,
    turnIndex: 0,
    phase: "draw",
    winnerId: null,
  };
};

/** Greedy meld finder used by the MAGGIE bot. */
const findMeld = (hand: Card[], size: number): Card[] | null => {
  const byRank = new Map<Rank, Card[]>();
  hand.forEach((c) => byRank.set(c.rank, [...(byRank.get(c.rank) ?? []), c]));
  for (const cards of byRank.values()) {
    if (cards.length >= size) return cards.slice(0, size);
  }
  const bySuit = new Map<Suit, Card[]>();
  hand.forEach((c) => bySuit.set(c.suit, [...(bySuit.get(c.suit) ?? []), c]));
  for (const cards of bySuit.values()) {
    const sorted = [...cards].sort((a, b) => rankValue(a.rank) - rankValue(b.rank));
    let run: Card[] = [];
    for (const c of sorted) {
      if (!run.length || rankValue(c.rank) === rankValue(run[run.length - 1].rank) + 1) {
        run.push(c);
      } else {
        run = [c];
      }
      if (run.length === size) return [...run];
    }
  }
  return null;
};

const Rummy = () => {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [players, setPlayers] = useState<ChallengePlayer[]>([]);
  const [state, setState] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState("Draw a card, build your melds, then discard.");
  const awarded = useRef(false);

  const myId = challenge && user ? user.id : "you";

  const startSolo = useCallback(
    (botCount = 1) => {
      const seats: ChallengePlayer[] = [{ id: "you", name: "You" }];
      for (let i = 0; i < botCount; i++) {
        seats.push({ id: `maggie-${i}`, name: `${AI_PLAYER_NAME}${botCount > 1 ? ` ${i + 1}` : ""}`, isBot: true });
      }
      setChallenge(null);
      setPlayers(seats);
      setState(dealState(seats));
      setSelected(new Set());
      awarded.current = false;
      setMsg("Your turn — draw from the deck or the discard pile.");
    },
    [],
  );

  useEffect(() => {
    startSolo(1);
  }, [startSolo]);

  // ---- Online table -------------------------------------------------------
  const pushState = useCallback(
    async (next: GameState) => {
      if (!challenge) return;
      await supabase
        .from("game_challenges")
        .update({
          state: next as never,
          turn_index: next.turnIndex,
          winner_id: next.winnerId && !next.winnerId.startsWith("maggie") ? next.winnerId : null,
          status: next.winnerId ? "finished" : "active",
        })
        .eq("id", challenge.id);
    },
    [challenge],
  );

  const applyState = (next: GameState) => {
    setState(next);
    void pushState(next);
  };

  const onChallengeStart = (c: Challenge) => {
    setChallenge(c);
    setPlayers(c.players);
    const existing = c.state as unknown as GameState | undefined;
    if (existing && existing.hands) {
      setState(existing);
    } else if (c.host_id === user?.id) {
      const fresh = dealState(c.players);
      setState(fresh);
      void supabase
        .from("game_challenges")
        .update({ state: fresh as never, turn_index: 0 })
        .eq("id", c.id);
    }
    awarded.current = false;
    setSelected(new Set());
  };

  useEffect(() => {
    if (!challenge) return;
    const ch = supabase
      .channel(`rummy-${challenge.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "game_challenges", filter: `id=eq.${challenge.id}` },
        (payload) => {
          const row = payload.new as unknown as Challenge;
          setPlayers(row.players);
          const s = row.state as unknown as GameState;
          if (s?.hands) setState(s);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [challenge]);

  // ---- Turn helpers -------------------------------------------------------
  const current = players[state?.turnIndex ?? 0];
  const isMyTurn = !!state && !state.winnerId && current?.id === myId;
  const myHand = state?.hands[myId] ?? [];
  const myMelds = state?.melds[myId] ?? [];
  const top = state?.discard[state.discard.length - 1];

  const endTurn = (s: GameState): GameState => ({
    ...s,
    turnIndex: (s.turnIndex + 1) % players.length,
    phase: "draw",
  });

  const drawFromDeck = () => {
    if (!state || !isMyTurn || state.phase !== "draw" || !state.deck.length) return;
    const [c, ...rest] = state.deck;
    applyState({
      ...state,
      deck: rest,
      hands: { ...state.hands, [myId]: [...myHand, c] },
      phase: "play",
    });
    setMsg("Lay a meld or discard to end your turn.");
  };

  const drawFromDiscard = () => {
    if (!state || !isMyTurn || state.phase !== "draw" || !state.discard.length) return;
    const c = state.discard[state.discard.length - 1];
    applyState({
      ...state,
      discard: state.discard.slice(0, -1),
      hands: { ...state.hands, [myId]: [...myHand, c] },
      phase: "play",
    });
    setMsg("Lay a meld or discard to end your turn.");
  };

  const layMeld = () => {
    if (!state || !isMyTurn) return;
    const chosen = myHand.filter((c) => selected.has(c.id));
    if (!isValidMeld(chosen)) {
      setMsg("That is not a valid meld — use 3 or 4 cards of one rank, or a run in one suit.");
      return;
    }
    const threes = myMelds.filter((m) => m.length === 3).length;
    const fours = myMelds.filter((m) => m.length === 4).length;
    if (chosen.length === 3 && threes >= 2) {
      setMsg("You already have your two melds of three — your last meld must hold 4 cards.");
      return;
    }
    if (chosen.length === 4 && fours >= 1) {
      setMsg("Only one meld of four is allowed — the others must hold 3 cards.");
      return;
    }
    const nextMelds = [...myMelds, chosen];
    const nextHand = myHand.filter((c) => !selected.has(c.id));
    const won = hasWinningLayout(nextMelds);
    applyState({
      ...state,
      hands: { ...state.hands, [myId]: nextHand },
      melds: { ...state.melds, [myId]: nextMelds },
      winnerId: won ? myId : state.winnerId,
    });
    setSelected(new Set());
    setMsg(won ? "Rummy! You win! 🎉" : `Meld laid — ${meldsRemainingLabel(nextMelds)}. Now discard.`);
  };

  const discardSelected = () => {
    if (!state || !isMyTurn || state.phase !== "play") return;
    if (selected.size !== 1) {
      setMsg("Select exactly one card to discard.");
      return;
    }
    const id = [...selected][0];
    const card = myHand.find((c) => c.id === id);
    if (!card) return;
    applyState(
      endTurn({
        ...state,
        hands: { ...state.hands, [myId]: myHand.filter((c) => c.id !== id) },
        discard: [...state.discard, card],
      }),
    );
    setSelected(new Set());
    setMsg("Turn passed.");
  };

  // ---- MAGGIE bot turns ---------------------------------------------------
  useEffect(() => {
    if (!state || state.winnerId || !players.length) return;
    const seat = players[state.turnIndex];
    if (!seat?.isBot) return;
    // Only the host drives bots on an online table, to avoid duplicate moves.
    if (challenge && challenge.host_id !== user?.id) return;

    const timer = setTimeout(() => {
      let s: GameState = JSON.parse(JSON.stringify(state));
      const hand = s.hands[seat.id] ?? [];
      if (s.deck.length) hand.push(s.deck.shift()!);

      const melds = s.melds[seat.id] ?? [];
      const threes = melds.filter((m) => m.length === 3).length;
      const fours = melds.filter((m) => m.length === 4).length;
      const wanted = fours < 1 && melds.length === 2 ? 4 : threes < 2 ? 3 : 4;
      const found = findMeld(hand, wanted);
      if (found) {
        const ids = new Set(found.map((c) => c.id));
        melds.push(found);
        s.melds[seat.id] = melds;
        s.hands[seat.id] = hand.filter((c) => !ids.has(c.id));
      } else {
        s.hands[seat.id] = hand;
      }

      if (hasWinningLayout(s.melds[seat.id] ?? [])) {
        s.winnerId = seat.id;
      } else {
        const h = s.hands[seat.id];
        if (h.length) {
          s.discard.push(h.pop()!);
          s.hands[seat.id] = h;
        }
        s = { ...s, turnIndex: (s.turnIndex + 1) % players.length, phase: "draw" };
      }
      applyState(s);
      setMsg(s.winnerId ? `${seat.name} laid the winning melds.` : `${seat.name} played. Your move.`);
    }, 1100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, players, challenge, user]);

  // ---- Scoring ------------------------------------------------------------
  useEffect(() => {
    if (state?.winnerId === myId && !awarded.current) {
      awarded.current = true;
      void awardPoints({ gameKey: GAME_KEY, gameTitle: GAME_TITLE, level: players.length, points: 40 });
    }
  }, [state?.winnerId, myId, players.length]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const winnerName = useMemo(
    () => players.find((p) => p.id === state?.winnerId)?.name,
    [players, state?.winnerId],
  );

  return (
    <GameShell
      title={GAME_TITLE}
      subtitle="2–4 players · two melds of three + one meld of four wins"
      howToPlay={HOW_TO_PLAY}
    >
      <OnlineChallenge
        gameKey={GAME_KEY}
        gameTitle={GAME_TITLE}
        maxPlayers={4}
        onStart={onChallengeStart}
        activeChallenge={challenge}
      />

      <div className="bg-card rounded-2xl border border-sage-100 shadow-card p-6 space-y-6">
        {/* Seats */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {players.map((p, i) => (
            <span
              key={p.id}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                i === state?.turnIndex && !state?.winnerId
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {p.id === myId ? "You" : p.name}
              <span className="opacity-70">
                {(state?.melds[p.id] ?? []).length}/3 melds
              </span>
            </span>
          ))}
        </div>

        {/* Deck + discard */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={drawFromDeck}
            disabled={!isMyTurn || state?.phase !== "draw" || !state?.deck.length}
            aria-label="Draw from deck"
            className="flex h-24 w-16 items-center justify-center rounded-lg border border-sage-800 bg-gradient-to-br from-sage-600 to-sage-700 font-bold text-primary-foreground disabled:opacity-50"
          >
            {state?.deck.length ?? 0}
          </button>
          <button
            onClick={drawFromDiscard}
            disabled={!isMyTurn || state?.phase !== "draw" || !top}
            aria-label="Take the top discard"
            className={`flex h-24 w-16 flex-col items-center justify-center rounded-lg border-2 bg-white disabled:opacity-50 ${
              top && (top.suit === "♥" || top.suit === "♦")
                ? "border-red-300 text-red-600"
                : "border-slate-300 text-slate-900"
            }`}
          >
            {top ? (
              <>
                <span className="text-lg font-bold">{top.rank}</span>
                <span className="text-2xl">{top.suit}</span>
              </>
            ) : (
              "—"
            )}
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {state?.winnerId ? `${winnerName} wins the hand!` : msg}
        </p>

        {/* My melds */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Your melds · {meldsRemainingLabel(myMelds)}
          </p>
          {myMelds.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No melds down yet. You need two melds of 3 cards and one of 4 cards to win.
            </p>
          ) : (
            myMelds.map((m, i) => (
              <div key={i} className="flex gap-1 rounded bg-sage-50 p-2">
                {m.map((c) => (
                  <div
                    key={c.id}
                    className={`flex h-14 w-10 flex-col items-center justify-center rounded border bg-white text-xs font-bold ${
                      c.suit === "♥" || c.suit === "♦" ? "text-red-600" : "text-slate-900"
                    }`}
                  >
                    <span>{c.rank}</span>
                    <span>{c.suit}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Hand */}
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Your hand · {myHand.length}</p>
          <div className="flex flex-wrap gap-2">
            {myHand.map((c) => {
              const sel = selected.has(c.id);
              const red = c.suit === "♥" || c.suit === "♦";
              return (
                <button
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  aria-pressed={sel}
                  className={`flex h-16 w-12 flex-col items-center justify-center rounded border-2 bg-white text-xs font-bold transition-transform ${
                    sel ? "-translate-y-2 border-primary shadow-md" : "border-slate-300"
                  } ${red ? "text-red-600" : "text-slate-900"}`}
                >
                  <span>{c.rank}</span>
                  <span className="text-base">{c.suit}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={layMeld} disabled={!isMyTurn || selected.size < 3}>
            Lay meld
          </Button>
          <Button
            onClick={discardSelected}
            variant="outline"
            disabled={!isMyTurn || selected.size !== 1 || state?.phase !== "play"}
          >
            Discard selected
          </Button>
          <Button onClick={() => startSolo(1)} variant="ghost" className="gap-2">
            <RotateCcw className="h-4 w-4" /> New game vs {AI_PLAYER_NAME}
          </Button>
          <Button onClick={() => startSolo(3)} variant="ghost" className="gap-2">
            <Users className="h-4 w-4" /> 4-player table
          </Button>
        </div>

        {state?.winnerId && (
          <p className="flex items-center justify-center gap-2 text-center text-lg font-bold text-primary">
            <Trophy className="h-5 w-5" aria-hidden="true" />
            {state.winnerId === myId ? "Rummy! You win — 40 points added." : `${winnerName} wins.`}
          </p>
        )}
      </div>
    </GameShell>
  );
};

export default Rummy;
