import { useEffect, useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

// 4x4 sliding puzzle over a family-themed gradient tile grid
const SIZE = 4;
const TOTAL = SIZE * SIZE;

const shuffle = (arr: number[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const isSolvable = (tiles: number[]) => {
  const emptyRow = Math.floor(tiles.indexOf(0) / SIZE);
  let inv = 0;
  const t = tiles.filter((x) => x !== 0);
  for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) if (t[i] > t[j]) inv++;
  return (inv + (SIZE - emptyRow)) % 2 === 0;
};

const shuffleSolvable = (): number[] => {
  let s = shuffle(Array.from({ length: TOTAL }, (_, i) => i));
  while (!isSolvable(s) || s.every((v, i) => v === (i + 1) % TOTAL)) s = shuffle(s);
  return s;
};

const FamilyPuzzle = () => {
  const [tiles, setTiles] = useState<number[]>(() => shuffleSolvable());
  const [moves, setMoves] = useState(0);

  const solved = tiles.every((v, i) => v === (i + 1) % TOTAL);

  const move = (idx: number) => {
    if (solved) return;
    const empty = tiles.indexOf(0);
    const [er, ec] = [Math.floor(empty / SIZE), empty % SIZE];
    const [r, c] = [Math.floor(idx / SIZE), idx % SIZE];
    const adjacent = Math.abs(er - r) + Math.abs(ec - c) === 1;
    if (!adjacent) return;
    const next = [...tiles];
    [next[empty], next[idx]] = [next[idx], next[empty]];
    setTiles(next);
    setMoves((m) => m + 1);
  };

  const reset = () => { setTiles(shuffleSolvable()); setMoves(0); };

  return (
    <GameShell title="Family Puzzle" subtitle={`Slide tiles to order 1–15 · Moves: ${moves}`}>
      <div className="max-w-md mx-auto bg-card rounded-2xl border border-sage-100 shadow-card p-4">
        <div className="grid gap-1.5 aspect-square" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
          {tiles.map((v, i) => (
            <button
              key={i}
              onClick={() => move(i)}
              disabled={v === 0}
              className={`rounded-lg font-display text-2xl font-bold transition-all ${
                v === 0
                  ? "bg-transparent"
                  : "bg-gradient-to-br from-sage-400 to-sage-600 text-primary-foreground hover:scale-95 shadow-sm"
              }`}
            >
              {v !== 0 ? v : ""}
            </button>
          ))}
        </div>
        {solved && (
          <p className="text-center text-primary font-display text-xl font-bold mt-4">
            🎉 Solved in {moves} moves!
          </p>
        )}
        <Button onClick={reset} variant="outline" className="w-full mt-4 gap-2">
          <RotateCcw className="w-4 h-4" /> New puzzle
        </Button>
      </div>
    </GameShell>
  );
};

export default FamilyPuzzle;
