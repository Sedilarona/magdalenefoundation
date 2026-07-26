import { useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw } from "lucide-react";

const QUESTIONS = [
  { q: "Who built the ark?", opts: ["Moses", "Noah", "Abraham", "David"], a: 1 },
  { q: "How many disciples did Jesus have?", opts: ["7", "10", "12", "14"], a: 2 },
  { q: "In what city was Jesus born?", opts: ["Nazareth", "Jerusalem", "Bethlehem", "Cana"], a: 2 },
  { q: "Who was thrown into the lions' den?", opts: ["Daniel", "Joseph", "Elijah", "Samuel"], a: 0 },
  { q: "How many books are in the KJV Bible?", opts: ["39", "50", "66", "72"], a: 2 },
  { q: "What was the first plague of Egypt?", opts: ["Frogs", "Water to blood", "Darkness", "Locusts"], a: 1 },
  { q: "Who denied Jesus three times?", opts: ["Peter", "Judas", "John", "Thomas"], a: 0 },
  { q: "What did God create on the fourth day?", opts: ["Fish", "Animals", "Sun, moon, stars", "Man"], a: 2 },
  { q: "Who parted the Red Sea?", opts: ["Aaron", "Joshua", "Moses", "Elijah"], a: 2 },
  { q: "Which king wrote most of the Psalms?", opts: ["Solomon", "David", "Saul", "Hezekiah"], a: 1 },
  { q: "How many days did Jesus fast in the wilderness?", opts: ["7", "12", "30", "40"], a: 3 },
  { q: "What is the first book of the New Testament?", opts: ["Mark", "Matthew", "Luke", "John"], a: 1 },
];

const BibleTrivia = () => {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const question = QUESTIONS[idx];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === question.a) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= QUESTIONS.length) {
      setDone(true);
    } else {
      setIdx(idx + 1);
      setPicked(null);
    }
  };

  const reset = () => {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <GameShell title="Bible Trivia" subtitle="Round complete">
        <div className="text-center py-12 bg-card rounded-2xl border border-sage-100 shadow-card">
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">
            {score} / {QUESTIONS.length}
          </h2>
          <p className="text-muted-foreground mb-6">
            {score === QUESTIONS.length ? "Perfect score! Well done." : score >= QUESTIONS.length / 2 ? "Nicely done!" : "Keep studying the Word."}
          </p>
          <Button onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Play again
          </Button>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Bible Trivia" subtitle={`Question ${idx + 1} of ${QUESTIONS.length} · Score ${score}`}>
      <div className="bg-card rounded-2xl border border-sage-100 shadow-card p-6">
        <div className="w-full h-2 bg-sage-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((idx + (picked !== null ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-6">{question.q}</h2>
        <div className="grid gap-3">
          {question.opts.map((opt, i) => {
            const isCorrect = i === question.a;
            const isPicked = picked === i;
            const revealed = picked !== null;
            const state = revealed
              ? isCorrect
                ? "border-green-500 bg-green-50 text-green-900"
                : isPicked
                ? "border-red-500 bg-red-50 text-red-900"
                : "border-border bg-muted/30 text-muted-foreground"
              : "border-border hover:border-primary hover:bg-primary/5 text-foreground";
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={revealed}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${state}`}
              >
                <span>{opt}</span>
                {revealed && isCorrect && <Check className="w-5 h-5" />}
                {revealed && isPicked && !isCorrect && <X className="w-5 h-5" />}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <Button onClick={next} className="w-full mt-6">
            {idx + 1 >= QUESTIONS.length ? "See results" : "Next question"}
          </Button>
        )}
      </div>
    </GameShell>
  );
};

export default BibleTrivia;
