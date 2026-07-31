import { useEffect, useRef, useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Lock } from "lucide-react";
import { awardPoints } from "@/lib/gamePoints";
import { OnlineChallenge } from "@/components/OnlineChallenge";

const SYMBOLS = ["🌳", "🕊️", "📖", "🎵", "🌾", "🕯️", "🏡", "☀️", "🌙", "🪘", "🥁", "🌻", "🦁", "🐘", "💐", "⛪", "🍲", "🧺"];

const LEVELS = [
  { name: "Level 1", pairs: 6, cols: 4, flipBack: 900, points: 20 },
  { name: "Level 2", pairs: 8, cols: 4, flipBack: 800, points: 35 },
  { name: "Level 3", pairs: 12, cols: 6, flipBack: 700, points: 55 },
  { name: "Level 4", pairs: 18, cols: 6, flipBack: 550, points: 80 },
];

const shuffle = <T,>(a: T[]) => {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const buildDeck = (pairs: number) => {
  const picks = SYMBOLS.slice(0, pairs);
  return shuffle([...picks, ...picks]);
};

const GAME_KEY = "memory-match";
const GAME_TITLE = "Memory Match";
const HOW_TO_PLAY = [
  "Tap a card to flip it, then tap a second card to find its pair.",
  "Matching cards stay face up; non-matching cards flip back after a moment.",
  "Each level adds more pairs and gives you less time to memorise them.",
  "Clear every pair to finish the level and unlock the next one.",
  "Fewer moves means more bonus points on the family leaderboard.",
];

const MemoryMatch = () => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [unlocked, setUnlocked] = useState(1);
  const [deck, setDeck] = useState<string[]>(() => buildDeck(LEVELS[0].pairs));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const awarded = useRef<Set<number>>(new Set());

  const level = LEVELS[levelIdx];
  const done = deck.length > 0 && matched.length === deck.length;

  useEffect(() => {
    const saved = Number(localStorage.getItem("memory-match-unlocked") || "1");
    if (saved > 1) setUnlocked(Math.min(saved, LEVELS.length));
  }, []);

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      setMoves((m) => m + 1);
      if (deck[a] === deck[b]) {
        setMatched((prev) => [...prev, a, b]);
        setFlipped([]);
      } else {
        const t = setTimeout(() => setFlipped([]), level.flipBack);
        return () => clearTimeout(t);
      }
    }
  }, [flipped, deck, level.flipBack]);

  useEffect(() => {
    if (!done || awarded.current.has(levelIdx)) return;
    awarded.current.add(levelIdx);
    const bonus = Math.max(0, level.pairs * 2 - Math.max(0, moves - level.pairs));
    const earned = level.points + bonus;
    setSessionPoints((p) => p + earned);
    if (levelIdx + 1 >= unlocked && levelIdx + 1 < LEVELS.length) {
      const nextUnlocked = levelIdx + 2;
      setUnlocked(nextUnlocked);
      localStorage.setItem("memory-match-unlocked", String(nextUnlocked));
    }
    awardPoints({ gameKey: GAME_KEY, gameTitle: GAME_TITLE, level: levelIdx + 1, points: earned });
  }, [done, levelIdx, level, moves, unlocked]);

  const goToLevel = (i: number) => {
    setLevelIdx(i);
    setDeck(buildDeck(LEVELS[i].pairs));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const flip = (i: number) => {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(i)) return;
    setFlipped((f) => [...f, i]);
  };

  return (
    <GameShell
      title={GAME_TITLE}
      subtitle={`${level.name} · ${level.pairs} pairs · Moves ${moves}`}
      howToPlay={HOW_TO_PLAY}
      points={sessionPoints}
    >
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
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
                  {locked && <Lock className="w-3.5 h-3.5" />} {i + 1}
                </Button>
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={() => goToLevel(levelIdx)} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Restart
          </Button>
        </div>

        <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${level.cols}, minmax(0, 1fr))` }}>
          {deck.map((s, i) => {
            const shown = flipped.includes(i) || matched.includes(i);
            return (
              <button
                key={i}
                onClick={() => flip(i)}
                className={`aspect-square rounded-xl text-2xl sm:text-3xl flex items-center justify-center transition-all ${
                  shown
                    ? "bg-sage-100 text-foreground"
                    : "bg-gradient-to-br from-sage-500 to-sage-600 text-primary-foreground hover:scale-105"
                } ${matched.includes(i) ? "ring-2 ring-primary" : ""}`}
              >
                {shown ? s : "?"}
              </button>
            );
          })}
        </div>

        {done && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center space-y-2">
            <Trophy className="w-6 h-6 text-primary mx-auto" />
            <p className="font-medium">Matched all pairs in {moves} moves!</p>
            {levelIdx + 1 < LEVELS.length && (
              <Button size="sm" onClick={() => goToLevel(levelIdx + 1)}>
                Next level
              </Button>
            )}
          </div>
        )}

        <OnlineChallenge gameKey={GAME_KEY} gameTitle={GAME_TITLE} maxPlayers={4} />
      </div>
    </GameShell>
  );
};

export default MemoryMatch;
