import { useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

type Cell = "X" | "O" | null;

const lines = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

const winner = (b: Cell[]) => {
  for (const [a,b1,c] of lines) if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  return null;
};

const TicTacToe = () => {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const w = winner(board);
  const full = board.every(Boolean);

  const play = (i: number) => {
    if (board[i] || w) return;
    const nb = [...board];
    nb[i] = xTurn ? "X" : "O";
    setBoard(nb);
    setXTurn(!xTurn);
  };
  const reset = () => { setBoard(Array(9).fill(null)); setXTurn(true); };

  return (
    <GameShell title="Tic-Tac-Toe" subtitle="Two-player family match. Line up three to win.">
      <div className="max-w-xs mx-auto">
        <p className="text-center mb-4 text-muted-foreground">
          {w ? <span className="text-primary font-bold">Winner: {w}</span> : full ? "Draw!" : <>Turn: <span className="font-bold text-foreground">{xTurn ? "X" : "O"}</span></>}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {board.map((c, i) => (
            <button key={i} onClick={() => play(i)} className="aspect-square bg-card border-2 border-sage-200 rounded-xl text-4xl font-bold text-foreground hover:bg-sage-50">
              {c}
            </button>
          ))}
        </div>
        <Button variant="outline" onClick={reset} className="w-full mt-4 gap-2"><RotateCcw className="w-4 h-4" /> New Game</Button>
      </div>
    </GameShell>
  );
};

export default TicTacToe;
