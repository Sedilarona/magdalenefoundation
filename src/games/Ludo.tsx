import { useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

// Simplified 2-player ludo race — each player has 1 token racing 30 squares.
// Roll a 6 to leave home. Reach 30 to win. Educational simplification.

const PLAYERS = [
  { name: "Red", color: "bg-red-500", textColor: "text-red-600" },
  { name: "Blue", color: "bg-blue-500", textColor: "text-blue-600" },
];

const TRACK = 30;

const Ludo = () => {
  const [positions, setPositions] = useState<(number | null)[]>([null, null]);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState<number | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const [msg, setMsg] = useState("Red rolls a 6 to start.");

  const roll = () => {
    if (winner !== null) return;
    const value = Math.floor(Math.random() * 6) + 1;
    setDice(value);
    const cur = positions[turn];
    let nextPos = cur;
    let extraTurn = false;
    let newMsg = "";

    if (cur === null) {
      if (value === 6) {
        nextPos = 0;
        extraTurn = true;
        newMsg = `${PLAYERS[turn].name} enters the board!`;
      } else {
        newMsg = `${PLAYERS[turn].name} needs a 6 to start.`;
      }
    } else {
      const target = cur + value;
      if (target > TRACK) {
        newMsg = `${PLAYERS[turn].name} rolled too high, needs exactly ${TRACK - cur}.`;
      } else {
        nextPos = target;
        // Kick opponent if landing on same square (not home 0 or finish)
        const opp = 1 - turn;
        if (positions[opp] === target && target < TRACK) {
          const newPositions = [...positions];
          newPositions[opp] = null;
          newPositions[turn] = target;
          setPositions(newPositions);
          newMsg = `${PLAYERS[turn].name} kicked ${PLAYERS[opp].name} home!`;
          if (target === TRACK) setWinner(turn);
          setMsg(newMsg);
          if (!extraTurn && value !== 6) setTimeout(() => setTurn(opp), 500);
          return;
        }
        if (target === TRACK) {
          setWinner(turn);
          newMsg = `${PLAYERS[turn].name} wins! 🎉`;
        } else {
          newMsg = `${PLAYERS[turn].name} moves to ${target}.`;
        }
        if (value === 6) extraTurn = true;
      }
    }

    const newPositions = [...positions];
    newPositions[turn] = nextPos;
    setPositions(newPositions);
    setMsg(newMsg);
    if (winner === null && !extraTurn) setTimeout(() => setTurn(1 - turn), 500);
  };

  const reset = () => {
    setPositions([null, null]);
    setTurn(0);
    setDice(null);
    setWinner(null);
    setMsg("Red rolls a 6 to start.");
  };

  return (
    <GameShell title="Ludo (Race)" subtitle="Simplified 2-player race · roll a 6 to start">
      <div className="bg-card rounded-2xl border border-sage-100 shadow-card p-6">
        <div className="grid grid-cols-10 gap-1 mb-6">
          {Array.from({ length: TRACK }, (_, i) => {
            const sq = i + 1;
            const p0 = positions[0] === sq;
            const p1 = positions[1] === sq;
            const finish = sq === TRACK;
            return (
              <div key={sq}
                className={`aspect-square rounded flex items-center justify-center text-xs font-mono relative ${
                  finish ? "bg-yellow-200 font-bold" : sq % 2 ? "bg-sage-50" : "bg-sage-100"
                }`}>
                <span className="opacity-40 absolute top-0.5 left-0.5">{sq}</span>
                <div className="flex gap-0.5">
                  {p0 && <div className="w-3 h-3 rounded-full bg-red-500 border border-white" />}
                  {p1 && <div className="w-3 h-3 rounded-full bg-blue-500 border border-white" />}
                </div>
                {finish && <span className="text-lg">🏁</span>}
              </div>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {PLAYERS.map((p, i) => (
            <div key={p.name}
              className={`p-4 rounded-xl border-2 ${turn === i && winner === null ? "border-primary bg-primary/5" : "border-border"}`}>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${p.color}`} />
                <span className={`font-medium ${p.textColor}`}>{p.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {positions[i] === null ? "At home" : positions[i] === TRACK ? "Finished!" : `Square ${positions[i]}`}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center p-4 bg-sage-50 rounded-xl">
          {dice !== null && <div className="text-3xl font-bold mb-2">🎲 {dice}</div>}
          <p className="text-sm text-muted-foreground mb-3">{msg}</p>
          {winner !== null ? (
            <Button onClick={reset} className="gap-2"><RotateCcw className="w-4 h-4" /> Play again</Button>
          ) : (
            <Button onClick={roll}>Roll for {PLAYERS[turn].name}</Button>
          )}
        </div>
      </div>
    </GameShell>
  );
};

export default Ludo;
