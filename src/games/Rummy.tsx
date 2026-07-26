import { useEffect, useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

// Simplified Rummy: form sets (3 of same rank) or runs (3 consecutive same suit) from 7 cards.
// First to lay down all cards in valid melds wins.

const SUITS = ["♠", "♥", "♦", "♣"] as const;
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;
type Suit = typeof SUITS[number];
type Rank = typeof RANKS[number];
interface Card { suit: Suit; rank: Rank; id: string; }

const rankValue = (r: Rank) => RANKS.indexOf(r);

const buildDeck = (): Card[] => {
  const d: Card[] = [];
  SUITS.forEach((s) => RANKS.forEach((r) => d.push({ suit: s, rank: r, id: `${r}${s}` })));
  return d.sort(() => Math.random() - 0.5);
};

const isValidMeld = (cards: Card[]): boolean => {
  if (cards.length < 3) return false;
  if (cards.every((c) => c.rank === cards[0].rank)) return true;
  if (!cards.every((c) => c.suit === cards[0].suit)) return false;
  const sorted = [...cards].sort((a, b) => rankValue(a.rank) - rankValue(b.rank));
  for (let i = 1; i < sorted.length; i++) {
    if (rankValue(sorted[i].rank) !== rankValue(sorted[i - 1].rank) + 1) return false;
  }
  return true;
};

const Rummy = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [melds, setMelds] = useState<Card[][]>([]);
  const [discard, setDiscard] = useState<Card[]>([]);
  const [msg, setMsg] = useState("Draw a card, form melds of 3+, then discard.");
  const [phase, setPhase] = useState<"draw" | "play">("draw");
  const [winner, setWinner] = useState(false);

  const start = () => {
    const d = buildDeck();
    setHand(d.splice(0, 10));
    setDiscard([d.splice(0, 1)[0]]);
    setDeck(d);
    setMelds([]);
    setSelected(new Set());
    setPhase("draw");
    setMsg("Draw from deck or discard pile.");
    setWinner(false);
  };

  useEffect(() => { start(); }, []);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const drawFromDeck = () => {
    if (phase !== "draw" || deck.length === 0) return;
    const [c, ...rest] = deck;
    setHand([...hand, c]);
    setDeck(rest);
    setPhase("play");
    setMsg("Now form a meld or discard.");
  };

  const drawFromDiscard = () => {
    if (phase !== "draw" || discard.length === 0) return;
    const c = discard[discard.length - 1];
    setHand([...hand, c]);
    setDiscard(discard.slice(0, -1));
    setPhase("play");
    setMsg("Now form a meld or discard.");
  };

  const layMeld = () => {
    const chosen = hand.filter((c) => selected.has(c.id));
    if (!isValidMeld(chosen)) {
      setMsg("Selected cards don't form a valid meld (3+ same rank or run in one suit).");
      return;
    }
    const newHand = hand.filter((c) => !selected.has(c.id));
    setMelds([...melds, chosen]);
    setHand(newHand);
    setSelected(new Set());
    if (newHand.length === 0) { setWinner(true); setMsg("You win! 🎉"); return; }
    setMsg("Meld placed. Discard to end turn.");
  };

  const discardSelected = () => {
    if (phase !== "play") return;
    if (selected.size !== 1) { setMsg("Select exactly one card to discard."); return; }
    const id = [...selected][0];
    const card = hand.find((c) => c.id === id)!;
    setHand(hand.filter((c) => c.id !== id));
    setDiscard([...discard, card]);
    setSelected(new Set());
    setPhase("draw");
    setMsg("Turn ended. Draw to start next turn.");
  };

  const top = discard[discard.length - 1];

  return (
    <GameShell title="Rummy" subtitle="Solo practice · form sets & runs">
      <div className="bg-card rounded-2xl border border-sage-100 shadow-card p-6 space-y-6">
        <div className="flex items-center justify-center gap-6">
          <button onClick={drawFromDeck} disabled={phase !== "draw" || deck.length === 0}
            className="w-16 h-24 rounded-lg bg-gradient-to-br from-sage-600 to-sage-700 border border-sage-800 flex items-center justify-center text-primary-foreground font-bold disabled:opacity-50">
            {deck.length}
          </button>
          <button onClick={drawFromDiscard} disabled={phase !== "draw" || !top}
            className={`w-16 h-24 rounded-lg bg-white border-2 flex flex-col items-center justify-center disabled:opacity-50 ${
              top && (top.suit === "♥" || top.suit === "♦") ? "text-red-600 border-red-300" : "text-slate-900 border-slate-300"
            }`}>
            {top ? (<><span className="text-lg font-bold">{top.rank}</span><span className="text-2xl">{top.suit}</span></>) : "—"}
          </button>
        </div>

        <div className="text-center text-sm text-muted-foreground">{msg}</div>

        {melds.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Your melds:</p>
            {melds.map((m, i) => (
              <div key={i} className="flex gap-1 p-2 bg-sage-50 rounded">
                {m.map((c) => (
                  <div key={c.id} className={`w-10 h-14 rounded bg-white border flex flex-col items-center justify-center text-xs font-bold ${
                    c.suit === "♥" || c.suit === "♦" ? "text-red-600" : "text-slate-900"
                  }`}>
                    <span>{c.rank}</span><span>{c.suit}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground mb-2">Your hand · {hand.length}</p>
          <div className="flex flex-wrap gap-2">
            {hand.map((c) => {
              const sel = selected.has(c.id);
              const red = c.suit === "♥" || c.suit === "♦";
              return (
                <button key={c.id} onClick={() => toggle(c.id)}
                  className={`w-12 h-16 rounded bg-white border-2 flex flex-col items-center justify-center text-xs font-bold transition-transform ${
                    sel ? "-translate-y-2 border-primary shadow-md" : "border-slate-300"
                  } ${red ? "text-red-600" : "text-slate-900"}`}>
                  <span>{c.rank}</span><span className="text-base">{c.suit}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          <Button onClick={layMeld} disabled={selected.size < 3 || phase !== "play"}>Lay meld</Button>
          <Button onClick={discardSelected} variant="outline" disabled={selected.size !== 1 || phase !== "play"}>Discard selected</Button>
          <Button onClick={start} variant="ghost" className="gap-2"><RotateCcw className="w-4 h-4" /> New game</Button>
        </div>
        {winner && <p className="text-center text-lg font-bold text-primary">🎉 Well played!</p>}
      </div>
    </GameShell>
  );
};

export default Rummy;
