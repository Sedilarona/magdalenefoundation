import { useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw } from "lucide-react";

// Family + Botswana themed crossword
type Cell = { letter: string; row: number; col: number; wordIds: string[]; num?: number };

interface WordDef {
  id: string;
  answer: string;
  clue: string;
  row: number;
  col: number;
  dir: "across" | "down";
  num?: number;
}

const WORDS: WordDef[] = [
  { id: "w1", answer: "MAGDELINE", clue: "First name of our family matriarch", row: 0, col: 0, dir: "down" },
  { id: "w2", answer: "PULA", clue: "Botswana's currency (also means rain)", row: 0, col: 4, dir: "across" },
  { id: "w3", answer: "GABORONE", clue: "Capital city of Botswana", row: 2, col: 0, dir: "across" },
  { id: "w4", answer: "BOTSWANA", clue: "Our beloved country", row: 2, col: 2, dir: "down" },
  { id: "w5", answer: "SETSWANA", clue: "The national language of Botswana", row: 5, col: 2, dir: "across" },
  { id: "w6", answer: "POANE", clue: "A shared family surname", row: 7, col: 5, dir: "across" },
];

const GRID_SIZE = 10;

const buildGrid = () => {
  const grid: (Cell | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );
  WORDS.forEach((w) => {
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.dir === "down" ? w.row + i : w.row;
      const c = w.dir === "across" ? w.col + i : w.col;
      if (r >= GRID_SIZE || c >= GRID_SIZE) continue;
      const existing = grid[r][c];
      if (existing) {
        existing.wordIds.push(w.id);
      } else {
        grid[r][c] = { letter: w.answer[i], row: r, col: c, wordIds: [w.id] };
      }
    }
  });
  // Number starting cells in reading order
  let num = 1;
  const numbered = new Map<string, number>();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = grid[r][c];
      if (!cell) continue;
      const starts = WORDS.some((w) => w.row === r && w.col === c);
      if (starts) {
        cell.num = num;
        WORDS.forEach((w) => {
          if (w.row === r && w.col === c) {
            w.num = num;
            numbered.set(w.id, num);
          }
        });
        num++;
      }
    }
  }
  return grid;
};

const Crossword = () => {
  const [grid] = useState(buildGrid);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const setLetter = (r: number, c: number, v: string) => {
    setAnswers((a) => ({ ...a, [`${r}-${c}`]: v.toUpperCase().slice(-1) }));
  };

  const check = () => setChecked(true);
  const reset = () => { setAnswers({}); setChecked(false); };

  const complete = grid.every((row) =>
    row.every((cell) => !cell || (answers[`${cell.row}-${cell.col}`] === cell.letter))
  );

  return (
    <GameShell title="Family & Botswana Crossword" subtitle="Fill in the answers based on the clues">
      <div className="grid lg:grid-cols-[auto_1fr] gap-6">
        <div className="bg-card rounded-2xl border border-sage-100 shadow-card p-4 mx-auto">
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 2.25rem)` }}
          >
            {grid.flat().map((cell, i) => {
              if (!cell) return <div key={i} className="w-9 h-9 bg-transparent" />;
              const key = `${cell.row}-${cell.col}`;
              const val = answers[key] || "";
              const correct = checked && val === cell.letter;
              const wrong = checked && val && val !== cell.letter;
              return (
                <div key={i} className="relative">
                  {cell.num && (
                    <span className="absolute top-0 left-0.5 text-[9px] font-bold text-muted-foreground pointer-events-none z-10">
                      {cell.num}
                    </span>
                  )}
                  <input
                    value={val}
                    onChange={(e) => setLetter(cell.row, cell.col, e.target.value)}
                    maxLength={1}
                    className={`w-9 h-9 text-center font-bold uppercase border-2 rounded ${
                      correct ? "border-green-500 bg-green-50 text-green-900"
                      : wrong ? "border-red-500 bg-red-50 text-red-900"
                      : "border-sage-200 bg-white text-foreground focus:border-primary focus:outline-none"
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={check} className="flex-1 gap-2"><Check className="w-4 h-4" /> Check</Button>
            <Button onClick={reset} variant="outline" className="gap-2"><RotateCcw className="w-4 h-4" /> Reset</Button>
          </div>
          {checked && complete && (
            <p className="text-center text-green-700 font-medium mt-3">🎉 All correct!</p>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-display font-semibold mb-2">Across</h3>
            <ul className="space-y-2 text-sm">
              {WORDS.filter((w) => w.dir === "across").sort((a, b) => (a.num ?? 0) - (b.num ?? 0)).map((w) => (
                <li key={w.id}><span className="font-bold">{w.num}.</span> {w.clue} <span className="text-muted-foreground">({w.answer.length})</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display font-semibold mb-2">Down</h3>
            <ul className="space-y-2 text-sm">
              {WORDS.filter((w) => w.dir === "down").sort((a, b) => (a.num ?? 0) - (b.num ?? 0)).map((w) => (
                <li key={w.id}><span className="font-bold">{w.num}.</span> {w.clue} <span className="text-muted-foreground">({w.answer.length})</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </GameShell>
  );
};

export default Crossword;
