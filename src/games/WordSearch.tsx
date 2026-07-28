import { useMemo, useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy } from "lucide-react";

const WORDS = ["MAGDELINE", "POANE", "BOTSWANA", "SETSWANA", "PULA", "TEKO", "RATEKO", "SECHELE", "KGOTLA"];
const SIZE = 14;

function makeGrid(seed: number) {
  const rng = (n: number) => (seed = (seed * 9301 + 49297) % 233280) % n;
  const grid: string[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
  const dirs: [number, number][] = [[0,1],[1,0],[1,1],[-1,1]];
  const placed: { word: string; cells: string[] }[] = [];
  WORDS.forEach((w) => {
    for (let tries = 0; tries < 200; tries++) {
      const [dr, dc] = dirs[rng(dirs.length)];
      const r0 = rng(SIZE), c0 = rng(SIZE);
      const rEnd = r0 + dr * (w.length - 1);
      const cEnd = c0 + dc * (w.length - 1);
      if (rEnd < 0 || rEnd >= SIZE || cEnd < 0 || cEnd >= SIZE) continue;
      let ok = true;
      for (let i = 0; i < w.length; i++) {
        const ch = grid[r0 + dr*i][c0 + dc*i];
        if (ch && ch !== w[i]) { ok = false; break; }
      }
      if (!ok) continue;
      const cells: string[] = [];
      for (let i = 0; i < w.length; i++) {
        grid[r0 + dr*i][c0 + dc*i] = w[i];
        cells.push(`${r0 + dr*i}-${c0 + dc*i}`);
      }
      placed.push({ word: w, cells });
      break;
    }
  });
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (!grid[r][c]) grid[r][c] = String.fromCharCode(65 + rng(26));
  }
  return { grid, placed };
}

const WordSearch = () => {
  const [seed, setSeed] = useState(42);
  const { grid, placed } = useMemo(() => makeGrid(seed), [seed]);
  const [selection, setSelection] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  const toggleCell = (key: string) => {
    setSelection((s) => s.includes(key) ? s : [...s, key]);
  };

  const commit = () => {
    setDragging(false);
    const selWord = selection.map((k) => { const [r,c] = k.split("-").map(Number); return grid[r][c]; }).join("");
    const rev = selWord.split("").reverse().join("");
    const match = placed.find((p) => (p.word === selWord || p.word === rev) && p.cells.length === selection.length && (p.cells.every((c) => selection.includes(c))));
    if (match && !found.includes(match.word)) setFound([...found, match.word]);
    setSelection([]);
  };

  const done = found.length === placed.length;

  return (
    <GameShell title="Family Word Search" subtitle="Drag across letters to select words. Family, Setswana and Botswana themes.">
      <div className="grid lg:grid-cols-[auto_1fr] gap-6">
        <div
          className="bg-card rounded-2xl border border-sage-100 shadow-card p-3 mx-auto select-none"
          onMouseLeave={() => dragging && commit()}
          onMouseUp={commit}
        >
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${SIZE}, 1.75rem)` }}>
            {grid.flat().map((ch, i) => {
              const r = Math.floor(i / SIZE), c = i % SIZE;
              const key = `${r}-${c}`;
              const inSel = selection.includes(key);
              const inFound = placed.some((p) => found.includes(p.word) && p.cells.includes(key));
              return (
                <button
                  key={key}
                  onMouseDown={() => { setDragging(true); setSelection([key]); }}
                  onMouseEnter={() => dragging && toggleCell(key)}
                  className={`w-7 h-7 text-xs font-bold rounded ${
                    inFound ? "bg-primary text-primary-foreground" :
                    inSel ? "bg-primary/40 text-foreground" :
                    "bg-sage-50 text-foreground hover:bg-sage-100"
                  }`}
                >{ch}</button>
              );
            })}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-display font-semibold">Words to find</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {placed.map((p) => (
              <li key={p.word} className={found.includes(p.word) ? "line-through text-muted-foreground" : "text-foreground"}>{p.word}</li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setSeed(Math.floor(Math.random() * 10000)); setFound([]); setSelection([]); }} className="gap-2">
              <RotateCcw className="w-4 h-4" /> New Board
            </Button>
          </div>
          {done && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
              <Trophy className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="font-medium">All words found!</p>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
};

export default WordSearch;
