import { useEffect, useRef, useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Lock } from "lucide-react";
import { awardPoints } from "@/lib/gamePoints";
import { OnlineChallenge } from "@/components/OnlineChallenge";

const LEVELS = [
  { name: "Level 1 · 3×3", size: 3, points: 25 },
  { name: "Level 2 · 4×4", size: 4, points: 50 },
  { name: "Level 3 · 5×5", size: 5, points: 90 },
];

const shuffle = (arr: number[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const isSolvable = (tiles: number[], size: number) => {
  const emptyRow = Math.floor(tiles.indexOf(0) / size);
  let inv = 0;
  const t = tiles.filter((x) => x !== 0);
  for (let i = 0; i < t.length; i++)
    for (let j = i + 1; j < t.length; j++) if (t[i] > t[j]) inv++;
  if (size % 2 === 1) return inv % 2 === 0;
  return (inv + (size - emptyRow)) % 2 === 0;
};

const isOrdered = (tiles: number[], size: number) =>
  tiles.every((v, i) => v === (i + 1) % (size * size));

const shuffleSolvable = (size: number): number[] => {
  const total = size * size;
  let s = shuffle(Array.from({ length: total }, (_, i) => i));
  while (!isSolvable(s, size) || isOrdered(s, size)) s = shuffle(s);
  return s;
};

const GAME_KEY = "family-puzzle";
const GAME_TITLE = "Family Puzzle";
const HOW_TO_PLAY = [
  "Tap a tile next to the empty space to slide it across.",
  "Arrange the numbers in order, left to right, top to bottom, with the empty space last.",
  "Level 1 is a 3×3 board; each new level adds a row and a column.",
  "Solving a board unlocks the next level and awards points.",
  "Fewer moves earns a bigger bonus on the family leaderboard.",
];

const FamilyPuzzle = () => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [unlocked, setUnlocked] = useState(1);
  const [tiles, setTiles] = useState<number[]>(() => shuffleSolvable(LEVELS[0].size));
  const [moves, setMoves] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const awarded = useRef<Set<number>>(new Set());

  const level = LEVELS[levelIdx];
  const size = level.size;
  const total = size * size;
  const solved = isOrdered(tiles, size);

  useEffect(() => {
    const saved = Number(localStorage.getItem("family-puzzle-unlocked") || "1");
    if (saved > 1) setUnlocked(Math.min(saved, LEVELS.length));
  }, []);

  useEffect(() => {
    if (!solved || moves === 0 || awarded.current.has(levelIdx)) return;
    awarded.current.add(levelIdx);
    const bonus = Math.max(0, total * 4 - moves);
    const earned = level.points + bonus;
    setSessionPoints((p) => p + earned);
    if (levelIdx + 1 >= unlocked && levelIdx + 1 < LEVELS.length) {
      const nextUnlocked = levelIdx + 2;
      setUnlocked(nextUnlocked);
      localStorage.setItem("family-puzzle-unlocked", String(nextUnlocked));
    }
    awardPoints({ gameKey: GAME_KEY, gameTitle: GAME_TITLE, level: levelIdx + 1, points: earned });
  }, [solved, moves, levelIdx, level.points, total, unlocked]);

  const move = (idx: number) => {
    if (solved) return;
    const empty = tiles.indexOf(0);
    const [er, ec] = [Math.floor(empty / size), empty % size];
    const [r, c] = [Math.floor(idx / size), idx % size];
    if (Math.abs(er - r) + Math.abs(ec - c) !== 1) return;
    const next = [...tiles];
    [next[empty], next[idx]] = [next[idx], next[empty]];
    setTiles(next);
    setMoves((m) => m + 1);
  };

  const goToLevel = (i: number) => {
    setLevelIdx(i);
    setTiles(shuffleSolvable(LEVELS[i].size));
    setMoves(0);
  };

  return (
    <GameShell
      title={GAME_TITLE}
      subtitle={`${level.name} · order 1–${total - 1} · Moves ${moves}`}
      howToPlay={HOW_TO_PLAY}
      points={sessionPoints}
    >
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l, i) => {
            const locked = i + 1 > unlocked;
            return (
              <Button
                key={l.name}
                size="sm"
                variant={i === levelIdx ? "default" : "outline"}
                disabled={locked}
                onClick={() => goToLevel(i)}
                className="gap-1.5"
              >
                {locked && <Lock className="w-3.5 h-3.5" />} {l.size}×{l.size}
              </Button>
            );
          })}
        </div>

        <div className="bg-card rounded-2xl border border-sage-100 shadow-card p-4">
          <div className="grid gap-1.5 aspect-square" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
            {tiles.map((v, i) => (
              <button
                key={i}
                onClick={() => move(i)}
                disabled={v === 0}
                className={`rounded-lg font-display text-xl sm:text-2xl font-bold transition-all ${
                  v === 0
                    ? "bg-transparent"
                    : "bg-gradient-to-br from-sage-400 to-sage-600 text-primary-foreground hover:scale-95 shadow-sm"
                }`}
              >
                {v !== 0 ? v : ""}
              </button>
            ))}
          </div>
          {solved && moves > 0 && (
            <div className="text-center mt-4 space-y-2">
              <Trophy className="w-6 h-6 text-primary mx-auto" />
              <p className="font-display text-lg font-bold text-primary">Solved in {moves} moves!</p>
              {levelIdx + 1 < LEVELS.length && (
                <Button size="sm" onClick={() => goToLevel(levelIdx + 1)}>
                  Next level
                </Button>
              )}
            </div>
          )}
          <Button onClick={() => goToLevel(levelIdx)} variant="outline" className="w-full mt-4 gap-2">
            <RotateCcw className="w-4 h-4" /> New puzzle
          </Button>
        </div>

        <OnlineChallenge gameKey={GAME_KEY} gameTitle={GAME_TITLE} maxPlayers={4} />
      </div>
    </GameShell>
  );
};

export default FamilyPuzzle;
