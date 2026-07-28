import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw, ArrowRight, Trophy } from "lucide-react";

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

interface Level {
  name: string;
  words: WordDef[];
}

const LEVELS: Level[] = [
  {
    name: "Level 1 — Family & Botswana",
    words: [
      { id: "l1w1", answer: "MAGDELINE", clue: "First name of our family matriarch", row: 0, col: 0, dir: "down" },
      { id: "l1w2", answer: "PULA", clue: "Botswana's currency (also means rain)", row: 0, col: 4, dir: "across" },
      { id: "l1w3", answer: "GABORONE", clue: "Capital city of Botswana", row: 2, col: 0, dir: "across" },
      { id: "l1w4", answer: "BOTSWANA", clue: "Our beloved country", row: 2, col: 2, dir: "down" },
      { id: "l1w5", answer: "SETSWANA", clue: "The national language of Botswana", row: 5, col: 2, dir: "across" },
      { id: "l1w6", answer: "POANE", clue: "A shared family surname", row: 7, col: 5, dir: "across" },
    ],
  },
  {
    name: "Level 2 — Elders & Roots",
    words: [
      { id: "l2w1", answer: "RATEKO", clue: "Nickname of Magdalene's father", row: 0, col: 0, dir: "across" },
      { id: "l2w2", answer: "TEKO", clue: "Eldest sibling of Magdalene (first name)", row: 0, col: 0, dir: "down" },
      { id: "l2w3", answer: "SECHELE", clue: "Sibling married to Mmatingwane", row: 2, col: 0, dir: "across" },
      { id: "l2w4", answer: "STANLEY", clue: "Sibling name shared by two brothers", row: 2, col: 4, dir: "down" },
      { id: "l2w5", answer: "MASEGO", clue: "One of Magdalene's brothers", row: 6, col: 0, dir: "across" },
      { id: "l2w6", answer: "THUSO", clue: "A sibling whose name means 'help'", row: 4, col: 2, dir: "across" },
    ],
  },
  {
    name: "Level 3 — Home & Heritage",
    words: [
      { id: "l3w1", answer: "KGOTLA", clue: "Traditional Setswana community meeting place", row: 0, col: 0, dir: "across" },
      { id: "l3w2", answer: "MOROGO", clue: "Leafy green Setswana staple side dish", row: 0, col: 0, dir: "down" },
      { id: "l3w3", answer: "SESWAA", clue: "Pounded meat, a national dish", row: 2, col: 0, dir: "across" },
      { id: "l3w4", answer: "SESIGO", clue: "Traditional granary basket", row: 2, col: 3, dir: "down" },
      { id: "l3w5", answer: "TSWANA", clue: "The people of Botswana", row: 5, col: 0, dir: "across" },
      { id: "l3w6", answer: "MOTHO", clue: "Setswana word for 'person'", row: 3, col: 2, dir: "down" },
    ],
  },
];

const GRID_SIZE = 12;

const buildGrid = (words: WordDef[]) => {
  const grid: (Cell | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );
  const localWords = words.map((w) => ({ ...w }));
  localWords.forEach((w) => {
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.dir === "down" ? w.row + i : w.row;
      const c = w.dir === "across" ? w.col + i : w.col;
      if (r >= GRID_SIZE || c >= GRID_SIZE) continue;
      const existing = grid[r][c];
      if (existing) existing.wordIds.push(w.id);
      else grid[r][c] = { letter: w.answer[i], row: r, col: c, wordIds: [w.id] };
    }
  });
  let num = 1;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = grid[r][c];
      if (!cell) continue;
      const starts = localWords.some((w) => w.row === r && w.col === c);
      if (starts) {
        cell.num = num;
        localWords.forEach((w) => { if (w.row === r && w.col === c) w.num = num; });
        num++;
      }
    }
  }
  return { grid, words: localWords };
};

const Crossword = () => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [dir, setDir] = useState<"across" | "down">("across");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [victory, setVictory] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const { grid, words } = useMemo(() => buildGrid(LEVELS[levelIdx].words), [levelIdx]);

  const focusCell = (r: number, c: number) => {
    const el = inputRefs.current[`${r}-${c}`];
    if (el) el.focus();
  };

  const nextCell = (r: number, c: number, direction: "across" | "down") => {
    let nr = r, nc = c;
    for (let step = 0; step < GRID_SIZE; step++) {
      if (direction === "across") nc++; else nr++;
      if (nr >= GRID_SIZE || nc >= GRID_SIZE) return;
      if (grid[nr][nc]) { focusCell(nr, nc); return; }
    }
  };

  const setLetter = (r: number, c: number, v: string) => {
    const val = v.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    setAnswers((a) => ({ ...a, [`${r}-${c}`]: val }));
    if (val) nextCell(r, c, dir);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      nextCell(r, c, dir);
    } else if (e.key === "Tab") {
      // let default
    } else if (e.key === "Backspace") {
      const key = `${r}-${c}`;
      if (!answers[key]) {
        // move backwards
        let pr = r, pc = c;
        for (let s = 0; s < GRID_SIZE; s++) {
          if (dir === "across") pc--; else pr--;
          if (pr < 0 || pc < 0) return;
          if (grid[pr][pc]) { focusCell(pr, pc); return; }
        }
      }
    } else if (e.key === "ArrowRight") { e.preventDefault(); setDir("across"); nextCell(r, c, "across"); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setDir("down"); nextCell(r, c, "down"); }
  };

  const check = () => {
    setChecked(true);
    const complete = grid.every((row) => row.every((cell) => !cell || (answers[`${cell.row}-${cell.col}`] === cell.letter)));
    if (complete) setVictory(true);
  };
  const reset = () => { setAnswers({}); setChecked(false); setVictory(false); };
  const nextLevel = () => {
    if (levelIdx + 1 < LEVELS.length) { setLevelIdx(levelIdx + 1); reset(); }
  };

  useEffect(() => { reset(); }, [levelIdx]);

  return (
    <GameShell title={`Family Crossword — ${LEVELS[levelIdx].name}`} subtitle="Fill answers. Press SPACE to jump to the next square.">
      <div className="grid lg:grid-cols-[auto_1fr] gap-6">
        <div className="bg-card rounded-2xl border border-sage-100 shadow-card p-4 mx-auto">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 2rem)` }}>
            {grid.flat().map((cell, i) => {
              if (!cell) return <div key={i} className="w-8 h-8 bg-transparent" />;
              const key = `${cell.row}-${cell.col}`;
              const val = answers[key] || "";
              const correct = checked && val === cell.letter;
              const wrong = checked && val && val !== cell.letter;
              return (
                <div key={i} className="relative">
                  {cell.num && (
                    <span className="absolute top-0 left-0.5 text-[9px] font-bold text-muted-foreground pointer-events-none z-10">{cell.num}</span>
                  )}
                  <input
                    ref={(el) => (inputRefs.current[key] = el)}
                    value={val}
                    onChange={(e) => setLetter(cell.row, cell.col, e.target.value)}
                    onKeyDown={(e) => onKeyDown(e, cell.row, cell.col)}
                    onFocus={() => setChecked(false)}
                    maxLength={1}
                    className={`w-8 h-8 text-center font-bold uppercase border-2 rounded ${
                      correct ? "border-green-500 bg-green-50 text-green-900"
                      : wrong ? "border-red-500 bg-red-50 text-red-900"
                      : "border-sage-200 bg-background text-foreground focus:border-primary focus:outline-none"
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button onClick={check} className="flex-1 gap-2"><Check className="w-4 h-4" /> Check</Button>
            <Button onClick={reset} variant="outline" className="gap-2"><RotateCcw className="w-4 h-4" /> Reset</Button>
            <div className="w-full text-xs text-muted-foreground text-center mt-1">
              Direction: <button className="underline mr-2" onClick={() => setDir("across")}>{dir === "across" ? "▶ Across" : "Across"}</button>
              <button className="underline" onClick={() => setDir("down")}>{dir === "down" ? "▼ Down" : "Down"}</button>
            </div>
          </div>
          {victory && (
            <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
              <Trophy className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="font-medium text-foreground">Level complete! 🎉</p>
              {levelIdx + 1 < LEVELS.length ? (
                <Button onClick={nextLevel} className="mt-3 gap-2">Next Level <ArrowRight className="w-4 h-4" /></Button>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">You've completed all levels — Ke a leboga!</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map((lv, i) => (
              <Button
                key={lv.name}
                size="sm"
                variant={i === levelIdx ? "default" : "outline"}
                onClick={() => setLevelIdx(i)}
                disabled={i > levelIdx && !victory}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <div>
            <h3 className="font-display font-semibold mb-2">Across</h3>
            <ul className="space-y-2 text-sm">
              {words.filter((w) => w.dir === "across").sort((a, b) => (a.num ?? 0) - (b.num ?? 0)).map((w) => (
                <li key={w.id}><span className="font-bold">{w.num}.</span> {w.clue} <span className="text-muted-foreground">({w.answer.length})</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display font-semibold mb-2">Down</h3>
            <ul className="space-y-2 text-sm">
              {words.filter((w) => w.dir === "down").sort((a, b) => (a.num ?? 0) - (b.num ?? 0)).map((w) => (
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
