import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Lock } from "lucide-react";
import { awardPoints } from "@/lib/gamePoints";

const LEVELS = [
  { name: "Level 1 · Family Names", size: 10, points: 30, words: ["MAGDELINE", "POANE", "TEKO", "SECHELE", "MASEGO", "LESEGO"] },
  { name: "Level 2 · Botswana", size: 12, points: 50, words: ["BOTSWANA", "SETSWANA", "PULA", "KGOTLA", "GABORONE", "SERETSE", "MOKORO"] },
  { name: "Level 3 · The Whole Tree", size: 14, points: 80, words: ["BODILENYANE", "GABANAMOTSE", "PHATSHIMO", "MOTLADIILE", "RATEKO", "DIKELEDI", "ONKGOPOTSE", "BAKANI"] },
];

interface Placed {
  word: string;
  cells: string[];
}

function makeGrid(seed: number, size: number, words: string[]) {
  const rng = (n: number) => (seed = (seed * 9301 + 49297) % 233280) % n;
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(""));
  const dirs: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [-1, 1],
  ];
  const placed: Placed[] = [];
  words.forEach((w) => {
    for (let tries = 0; tries < 400; tries++) {
      const [dr, dc] = dirs[rng(dirs.length)];
      const r0 = rng(size),
        c0 = rng(size);
      const rEnd = r0 + dr * (w.length - 1);
      const cEnd = c0 + dc * (w.length - 1);
      if (rEnd < 0 || rEnd >= size || cEnd < 0 || cEnd >= size) continue;
      let ok = true;
      for (let i = 0; i < w.length; i++) {
        const ch = grid[r0 + dr * i][c0 + dc * i];
        if (ch && ch !== w[i]) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      const cells: string[] = [];
      for (let i = 0; i < w.length; i++) {
        grid[r0 + dr * i][c0 + dc * i] = w[i];
        cells.push(`${r0 + dr * i}-${c0 + dc * i}`);
      }
      placed.push({ word: w, cells });
      break;
    }
  });
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) if (!grid[r][c]) grid[r][c] = String.fromCharCode(65 + rng(26));
  return { grid, placed };
}

/** Cells on the straight line between two points, or null if not aligned. */
function lineBetween(a: [number, number], b: [number, number]): string[] | null {
  const dr = b[0] - a[0];
  const dc = b[1] - a[1];
  if (dr === 0 && dc === 0) return [`${a[0]}-${a[1]}`];
  const straight = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
  if (!straight) return null;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const sr = Math.sign(dr);
  const sc = Math.sign(dc);
  const cells: string[] = [];
  for (let i = 0; i <= steps; i++) cells.push(`${a[0] + sr * i}-${a[1] + sc * i}`);
  return cells;
}

const GAME_KEY = "word-search";
const GAME_TITLE = "Family Word Search";
const HOW_TO_PLAY = [
  "Press and drag (mouse or finger) from the first letter of a word to its last letter, then release.",
  "Words run across, down and diagonally — forwards or backwards.",
  "A found word turns green and is crossed off the list.",
  "Finish every word to complete the level and unlock the next, bigger grid.",
  "Completing a level awards points to the family leaderboard.",
];

const WordSearch = () => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [unlocked, setUnlocked] = useState(1);
  const [seed, setSeed] = useState(42);
  const [found, setFound] = useState<string[]>([]);
  const [selection, setSelection] = useState<string[]>([]);
  const [sessionPoints, setSessionPoints] = useState(0);
  const anchor = useRef<[number, number] | null>(null);
  const dragging = useRef(false);
  const awarded = useRef<Set<number>>(new Set());

  const level = LEVELS[levelIdx];
  const { grid, placed } = useMemo(
    () => makeGrid(seed, level.size, level.words),
    [seed, level]
  );

  useEffect(() => {
    const saved = Number(localStorage.getItem("word-search-unlocked") || "1");
    if (saved > 1) setUnlocked(Math.min(saved, LEVELS.length));
  }, []);

  const cellFromPoint = (x: number, y: number): [number, number] | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const key = el?.dataset?.cell;
    if (!key) return null;
    const [r, c] = key.split("-").map(Number);
    return [r, c];
  };

  const startAt = (r: number, c: number) => {
    dragging.current = true;
    anchor.current = [r, c];
    setSelection([`${r}-${c}`]);
  };

  const moveTo = (r: number, c: number) => {
    if (!dragging.current || !anchor.current) return;
    const line = lineBetween(anchor.current, [r, c]);
    if (line) setSelection(line);
  };

  const commit = () => {
    if (!dragging.current) return;
    dragging.current = false;
    anchor.current = null;
    const selWord = selection
      .map((k) => {
        const [r, c] = k.split("-").map(Number);
        return grid[r][c];
      })
      .join("");
    const rev = selWord.split("").reverse().join("");
    const match = placed.find(
      (p) =>
        (p.word === selWord || p.word === rev) &&
        p.cells.length === selection.length &&
        p.cells.every((c) => selection.includes(c))
    );
    if (match && !found.includes(match.word)) {
      const nextFound = [...found, match.word];
      setFound(nextFound);
      if (nextFound.length === placed.length) completeLevel();
    }
    setSelection([]);
  };

  const completeLevel = async () => {
    if (awarded.current.has(levelIdx)) return;
    awarded.current.add(levelIdx);
    setSessionPoints((p) => p + level.points);
    if (levelIdx + 1 >= unlocked && levelIdx + 1 < LEVELS.length) {
      const nextUnlocked = levelIdx + 2;
      setUnlocked(nextUnlocked);
      localStorage.setItem("word-search-unlocked", String(nextUnlocked));
    }
    await awardPoints({ gameKey: GAME_KEY, gameTitle: GAME_TITLE, level: levelIdx + 1, points: level.points });
  };

  const goToLevel = (i: number) => {
    setLevelIdx(i);
    setFound([]);
    setSelection([]);
    setSeed(Math.floor(Math.random() * 10000) + 1);
  };

  const done = placed.length > 0 && found.length === placed.length;

  return (
    <GameShell
      title={GAME_TITLE}
      subtitle={`${level.name} · ${found.length}/${placed.length} words found`}
      howToPlay={HOW_TO_PLAY}
      points={sessionPoints}
    >
      <div className="flex flex-wrap gap-2 mb-4">
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
              {locked && <Lock className="w-3.5 h-3.5" />} Level {i + 1}
            </Button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-6">
        <div
          className="bg-card rounded-2xl border border-sage-100 shadow-card p-3 mx-auto select-none touch-none"
          onPointerUp={commit}
          onPointerLeave={commit}
          onPointerCancel={commit}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            e.preventDefault();
            const cell = cellFromPoint(e.clientX, e.clientY);
            if (cell) moveTo(cell[0], cell[1]);
          }}
        >
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${level.size}, minmax(1.35rem, 1.75rem))` }}
          >
            {grid.flat().map((ch, i) => {
              const r = Math.floor(i / level.size),
                c = i % level.size;
              const key = `${r}-${c}`;
              const inSel = selection.includes(key);
              const inFound = placed.some((p) => found.includes(p.word) && p.cells.includes(key));
              return (
                <div
                  key={key}
                  data-cell={key}
                  role="button"
                  tabIndex={-1}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
                    startAt(r, c);
                  }}
                  className={`aspect-square flex items-center justify-center text-xs font-bold rounded cursor-pointer ${
                    inFound
                      ? "bg-primary text-primary-foreground"
                      : inSel
                      ? "bg-primary/40 text-foreground"
                      : "bg-sage-50 text-foreground hover:bg-sage-100"
                  }`}
                >
                  {ch}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display font-semibold">Words to find</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {placed.map((p) => (
              <li
                key={p.word}
                className={found.includes(p.word) ? "line-through text-muted-foreground" : "text-foreground"}
              >
                {p.word}
              </li>
            ))}
          </ul>
          <Button variant="outline" onClick={() => goToLevel(levelIdx)} className="gap-2">
            <RotateCcw className="w-4 h-4" /> New board
          </Button>
          {done && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center space-y-2">
              <Trophy className="w-6 h-6 text-primary mx-auto" />
              <p className="font-medium">Level complete · +{level.points} points</p>
              {levelIdx + 1 < LEVELS.length && (
                <Button size="sm" onClick={() => goToLevel(levelIdx + 1)}>
                  Next level
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
};

export default WordSearch;
