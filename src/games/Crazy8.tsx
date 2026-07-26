import { useEffect, useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const SUITS = ["♠", "♥", "♦", "♣"] as const;
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;
type Suit = typeof SUITS[number];
type Rank = typeof RANKS[number];
interface Card { suit: Suit; rank: Rank; }

const buildDeck = (): Card[] => {
  const d: Card[] = [];
  SUITS.forEach((s) => RANKS.forEach((r) => d.push({ suit: s, rank: r })));
  return d.sort(() => Math.random() - 0.5);
};

const CardView = ({ card, onClick, disabled }: { card: Card; onClick?: () => void; disabled?: boolean }) => {
  const red = card.suit === "♥" || card.suit === "♦";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-14 h-20 rounded-lg border-2 bg-white flex flex-col justify-between p-1.5 shadow-sm transition-transform ${
        disabled ? "opacity-50" : "hover:-translate-y-1 hover:shadow-md"
      } ${red ? "text-red-600 border-red-200" : "text-slate-900 border-slate-300"}`}
    >
      <span className="text-sm font-bold leading-none">{card.rank}</span>
      <span className="text-xl leading-none self-center">{card.suit}</span>
      <span className="text-sm font-bold leading-none self-end rotate-180">{card.rank}</span>
    </button>
  );
};

const Crazy8 = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [player, setPlayer] = useState<Card[]>([]);
  const [ai, setAi] = useState<Card[]>([]);
  const [pile, setPile] = useState<Card[]>([]);
  const [activeSuit, setActiveSuit] = useState<Suit>("♠");
  const [turn, setTurn] = useState<"player" | "ai">("player");
  const [msg, setMsg] = useState("Your turn — match suit or rank, or play an 8.");
  const [suitChooser, setSuitChooser] = useState(false);
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);

  const startNew = () => {
    const d = buildDeck();
    const p = d.splice(0, 7);
    const a = d.splice(0, 7);
    const first = d.splice(0, 1)[0];
    setDeck(d);
    setPlayer(p);
    setAi(a);
    setPile([first]);
    setActiveSuit(first.suit);
    setTurn("player");
    setMsg("Your turn — match suit or rank, or play an 8.");
    setSuitChooser(false);
    setWinner(null);
  };

  useEffect(() => { startNew(); }, []);

  const canPlay = (c: Card, top: Card, suit: Suit) => c.rank === "8" || c.suit === suit || c.rank === top.rank;

  const drawCard = (hand: Card[], setHand: (h: Card[]) => void) => {
    if (deck.length === 0) return null;
    const [drawn, ...rest] = deck;
    setDeck(rest);
    setHand([...hand, drawn]);
    return drawn;
  };

  const playCard = (c: Card) => {
    if (turn !== "player" || winner) return;
    const top = pile[pile.length - 1];
    if (!canPlay(c, top, activeSuit)) return;
    const nextHand = player.filter((x) => x !== c);
    setPlayer(nextHand);
    setPile([...pile, c]);
    if (nextHand.length === 0) { setWinner("player"); setMsg("You win! 🎉"); return; }
    if (c.rank === "8") {
      setSuitChooser(true);
      setMsg("Choose a new suit.");
    } else {
      setActiveSuit(c.suit);
      setTurn("ai");
    }
  };

  const chooseSuit = (s: Suit) => {
    setActiveSuit(s);
    setSuitChooser(false);
    setTurn("ai");
  };

  const playerDraw = () => {
    if (turn !== "player" || winner) return;
    drawCard(player, setPlayer);
    setMsg("You drew a card. AI's turn.");
    setTurn("ai");
  };

  // AI logic
  useEffect(() => {
    if (turn !== "ai" || winner || suitChooser) return;
    const timer = setTimeout(() => {
      const top = pile[pile.length - 1];
      let hand = [...ai];
      const playable = hand.find((c) => canPlay(c, top, activeSuit));
      if (playable) {
        hand = hand.filter((x) => x !== playable);
        setAi(hand);
        setPile([...pile, playable]);
        if (hand.length === 0) { setWinner("ai"); setMsg("AI wins!"); return; }
        if (playable.rank === "8") {
          // AI picks its most common suit
          const counts: Record<Suit, number> = { "♠": 0, "♥": 0, "♦": 0, "♣": 0 };
          hand.forEach((c) => counts[c.suit]++);
          const best = (Object.entries(counts) as [Suit, number][]).sort((a, b) => b[1] - a[1])[0][0];
          setActiveSuit(best);
          setMsg(`AI played 8 and chose ${best}.`);
        } else {
          setActiveSuit(playable.suit);
          setMsg(`AI played ${playable.rank}${playable.suit}.`);
        }
        setTurn("player");
      } else if (deck.length > 0) {
        drawCard(ai, setAi);
        setMsg("AI drew a card.");
        setTurn("player");
      } else {
        setMsg("No cards left — draw pile empty.");
        setTurn("player");
      }
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, suitChooser]);

  const top = pile[pile.length - 1];

  return (
    <GameShell title="Crazy 8" subtitle="You vs AI">
      <div className="bg-card rounded-2xl border border-sage-100 shadow-card p-6 space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-2">AI · {ai.length} cards</p>
          <div className="flex gap-1">
            {ai.map((_, i) => (
              <div key={i} className="w-10 h-14 rounded bg-gradient-to-br from-sage-600 to-sage-700 border border-sage-800" />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 py-4">
          {top && <CardView card={top} disabled />}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Active suit</p>
            <p className={`text-4xl ${activeSuit === "♥" || activeSuit === "♦" ? "text-red-600" : "text-slate-900"}`}>{activeSuit}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Draw pile</p>
            <div className="w-14 h-20 rounded-lg bg-gradient-to-br from-sage-600 to-sage-700 border border-sage-800 flex items-center justify-center text-primary-foreground font-bold">
              {deck.length}
            </div>
          </div>
        </div>

        {suitChooser && (
          <div className="p-4 bg-primary/5 rounded-xl">
            <p className="text-sm font-medium mb-2">Choose a suit:</p>
            <div className="flex gap-2">
              {SUITS.map((s) => (
                <Button key={s} variant="outline" onClick={() => chooseSuit(s)} className="text-2xl w-14 h-14">
                  <span className={s === "♥" || s === "♦" ? "text-red-600" : ""}>{s}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">{msg}</div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Your hand · {player.length} cards</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {player.map((c, i) => {
              const playable = top && canPlay(c, top, activeSuit) && turn === "player" && !suitChooser && !winner;
              return <CardView key={i} card={c} onClick={() => playCard(c)} disabled={!playable} />;
            })}
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <Button onClick={playerDraw} variant="outline" disabled={turn !== "player" || !!winner || suitChooser}>
            Draw card
          </Button>
          <Button onClick={startNew} variant="ghost" className="gap-2">
            <RotateCcw className="w-4 h-4" /> New game
          </Button>
        </div>
      </div>
    </GameShell>
  );
};

export default Crazy8;
