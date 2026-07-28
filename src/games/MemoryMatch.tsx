import { useEffect, useMemo, useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy } from "lucide-react";

const SYMBOLS = ["🌳", "🕊️", "📖", "🎵", "🌾", "🕯️", "🏡", "☀️"];

const shuffle = <T,>(a: T[]) => {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const MemoryMatch = () => {
  const [deck, setDeck] = useState<string[]>(() => shuffle([...SYMBOLS, ...SYMBOLS]));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const reset = () => {
    setDeck(shuffle([...SYMBOLS, ...SYMBOLS]));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      setMoves((m) => m + 1);
      if (deck[a] === deck[b]) {
        setMatched((prev) => [...prev, a, b]);
        setFlipped([]);
      } else {
        const t = setTimeout(() => setFlipped([]), 800);
        return () => clearTimeout(t);
      }
    }
  }, [flipped, deck]);

  const flip = (i: number) => {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(i)) return;
    setFlipped((f) => [...f, i]);
  };

  const done = matched.length === deck.length;

  return (
    <GameShell title="Memory Match" subtitle="Flip pairs of family-themed cards. Fewer moves = better score.">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">Moves: <span className="font-bold text-foreground">{moves}</span></p>
          <Button variant="outline" size="sm" onClick={reset} className="gap-2"><RotateCcw className="w-4 h-4" /> Restart</Button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {deck.map((s, i) => {
            const shown = flipped.includes(i) || matched.includes(i);
            return (
              <button
                key={i}
                onClick={() => flip(i)}
                className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all ${
                  shown ? "bg-sage-100 text-foreground" : "bg-gradient-to-br from-sage-500 to-sage-600 text-primary-foreground hover:scale-105"
                } ${matched.includes(i) ? "ring-2 ring-primary" : ""}`}
              >{shown ? s : "?"}</button>
            );
          })}
        </div>
        {done && (
          <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
            <Trophy className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="font-medium">Matched all pairs in {moves} moves!</p>
          </div>
        )}
      </div>
    </GameShell>
  );
};

export default MemoryMatch;
