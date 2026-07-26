import { useState, useMemo } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { Chess as ChessEngine } from "chess.js";
import { Chessboard } from "react-chessboard";

const Chess = () => {
  const [game, setGame] = useState(() => new ChessEngine());
  const [, setTick] = useState(0);

  const status = useMemo(() => {
    if (game.isCheckmate()) return `Checkmate — ${game.turn() === "w" ? "Black" : "White"} wins!`;
    if (game.isStalemate()) return "Stalemate — draw.";
    if (game.isDraw()) return "Draw.";
    if (game.inCheck()) return `${game.turn() === "w" ? "White" : "Black"} is in check.`;
    return `${game.turn() === "w" ? "White" : "Black"} to move.`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, game.fen()]);

  const onPieceDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
    if (!targetSquare) return false;
    try {
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      if (!move) return false;
      setTick((t) => t + 1);
      return true;
    } catch {
      return false;
    }
  };

  const reset = () => setGame(new ChessEngine());

  return (
    <GameShell title="Chess" subtitle="2-player local game">
      <div className="grid lg:grid-cols-[1fr_240px] gap-6 items-start">
        <div className="bg-card rounded-2xl border border-sage-100 shadow-card p-4">
          <Chessboard
            options={{
              position: game.fen(),
              onPieceDrop,
              id: "family-chess",
            }}
          />
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-sage-50">
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <p className="font-medium">{status}</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-sm text-muted-foreground mb-2">Move history</p>
            <p className="text-xs font-mono break-words max-h-40 overflow-y-auto">
              {game.history().join(" ") || "—"}
            </p>
          </div>
          <Button onClick={reset} variant="outline" className="w-full gap-2">
            <RotateCcw className="w-4 h-4" /> New game
          </Button>
        </div>
      </div>
    </GameShell>
  );
};

export default Chess;
