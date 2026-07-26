import { useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw } from "lucide-react";

// Small 5-word crossword with Botswana + family theme
// Grid 9x9; empty cells are null
type Cell = { letter: string; row: number; col: number; wordIds: string[]; num?: number };

interface WordDef {
  id: string;
  answer: string;
  clue: string;
  row: number;
  col: number;
  dir: "across" | "down";
  num: number;
}

const WORDS: WordDef[] = [
  { id: "1a", answer: "GABORONE", clue: "Capital city of Botswana", row: 0, col: 0, dir: "across", num: 1 },
  { id: "2d", answer: "BOTSWANA", clue: "Our beloved country", row: 0, col: 2, dir: "down", num: 2 },
  { id: "3a", answer: "TSWANA", clue: "The main language spoken", row: 4, col: 2, dir: "across", num: 3 },
  { id: "4d", answer: "SEROWE", clue: "Historic village in Central District", row: 2, col: 5, dir: "down", num: 4 },
  { id: "5a", answer: "PULA", clue: "Botswana's currency (means rain)", row: 7, col: 1, dir: "across", num: 5 },
];

const GRID_SIZE = 9;

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
  // number the start cells
  WORDS.forEach((w) => {
    const cell = grid[w.row][w.col];
    if (cell) cell.num = w.num;
  });
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
    <GameShell title="Botswana Crossword" subtitle="Fill in the answers based on the clues">
      <div className="grid lg:grid-cols-[auto_1fr] gap-6">
        <div className="bg-card rounded-2xl border border-sage-100 shadow-card p-4 mx-auto">
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 2.5rem)` }}
          >
            {grid.flat().map((cell, i) => {
              if (!cell) return <div key={i} className="w-10 h-10 bg-transparent" />;
              const key = `${cell.row}-${cell.col}`;
              const val = answers[key] || "";
              const correct = checked && val === cell.letter;
              const wrong = checked && val && val !== cell.letter;
              return (
                <div key={i} className="relative">
                  {cell.num && (
                    <span className="absolute top-0 left-0.5 text-[9px] font-bold text-muted-foreground pointer-events-none">
                      {cell.num}
                    </span>
                  )}
                  <input
                    value={val}
                    onChange={(e) => setLetter(cell.row, cell.col, e.target.value)}
                    maxLength={1}
                    className={`w-10 h-10 text-center font-bold uppercase border-2 rounded ${
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
              {WORDS.filter((w) => w.dir === "across").map((w) => (
                <li key={w.id}><span className="font-bold">{w.num}.</span> {w.clue} <span className="text-muted-foreground">({w.answer.length})</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display font-semibold mb-2">Down</h3>
            <ul className="space-y-2 text-sm">
              {WORDS.filter((w) => w.dir === "down").map((w) => (
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
