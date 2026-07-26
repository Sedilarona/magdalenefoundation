import { useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw } from "lucide-react";

const SNAKES: Record<number, number> = { 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78 };
const LADDERS: Record<number, number> = { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91 };

const DiceIcon = ({ n }: { n: number }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[n - 1] || Dice1;
  return <Icon className="w-10 h-10" />;
};

const PLAYERS = [
  { name: "Player 1", color: "bg-red-500" },
  { name: "Player 2", color: "bg-blue-500" },
];

const SnakesLadders = () => {
  const [positions, setPositions] = useState([0, 0]);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState<number | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    if (winner !== null || rolling) return;
    setRolling(true);
    let count = 0;
    const spin = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 8) {
        clearInterval(spin);
        const value = Math.floor(Math.random() * 6) + 1;
        setDice(value);
        applyMove(value);
        setRolling(false);
      }
    }, 60);
  };

  const applyMove = (value: number) => {
    setPositions((prev) => {
      const next = [...prev];
      let target = next[turn] + value;
      if (target > 100) target = next[turn];
      if (SNAKES[target]) target = SNAKES[target];
      else if (LADDERS[target]) target = LADDERS[target];
      next[turn] = target;
      if (target === 100) setWinner(turn);
      return next;
    });
    setTimeout(() => setTurn((t) => 1 - t), 400);
  };

  const reset = () => {
    setPositions([0, 0]);
    setTurn(0);
    setDice(null);
    setWinner(null);
  };

  // Board rendering: 10x10, cell 1 bottom-left snake pattern
  const cells: number[] = [];
  for (let row = 9; row >= 0; row--) {
    const rowCells: number[] = [];
    for (let col = 0; col < 10; col++) {
      const cellNum = row * 10 + (row % 2 === 0 ? col + 1 : 10 - col);
      rowCells.push(cellNum);
    }
    cells.push(...rowCells);
  }

  return (
    <GameShell title="Snakes & Ladders" subtitle="2-player local game">
      <div className="grid lg:grid-cols-[1fr_260px] gap-6">
        <div className="bg-card rounded-2xl border border-sage-100 shadow-card p-3 aspect-square">
          <div className="grid grid-cols-10 grid-rows-10 gap-0.5 h-full">
            {cells.map((n) => {
              const isSnake = SNAKES[n] !== undefined;
              const isLadder = LADDERS[n] !== undefined;
              const p0 = positions[0] === n;
              const p1 = positions[1] === n;
              return (
                <div
                  key={n}
                  className={`relative flex items-center justify-center text-[10px] font-mono rounded ${
                    isSnake ? "bg-red-100" : isLadder ? "bg-green-100" : n % 2 ? "bg-sage-50" : "bg-sage-100"
                  }`}
                >
                  <span className="absolute top-0.5 left-0.5 opacity-60">{n}</span>
                  {isSnake && <span className="text-xs">🐍</span>}
                  {isLadder && <span className="text-xs">🪜</span>}
                  <div className="absolute bottom-0.5 right-0.5 flex gap-0.5">
                    {p0 && <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />}
                    {p1 && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-4">
          {PLAYERS.map((p, i) => (
            <div
              key={p.name}
              className={`p-4 rounded-xl border-2 ${turn === i && winner === null ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${p.color}`} />
                <span className="font-medium">{p.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Position: {positions[i]}</p>
            </div>
          ))}
          <div className="p-4 rounded-xl bg-sage-50 text-center">
            {dice !== null && <div className="flex justify-center mb-3"><DiceIcon n={dice} /></div>}
            {winner !== null ? (
              <>
                <p className="font-display text-lg font-bold text-primary mb-3">{PLAYERS[winner].name} wins! 🎉</p>
                <Button onClick={reset} className="w-full gap-2"><RotateCcw className="w-4 h-4" /> Play again</Button>
              </>
            ) : (
              <Button onClick={roll} disabled={rolling} className="w-full">
                Roll dice · {PLAYERS[turn].name}
              </Button>
            )}
          </div>
        </div>
      </div>
    </GameShell>
  );
};

export default SnakesLadders;
