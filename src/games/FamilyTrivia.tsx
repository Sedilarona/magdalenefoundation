import { useEffect, useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, RotateCcw, Loader2 } from "lucide-react";

interface Member {
  id: string;
  full_name: string;
  nickname: string | null;
  occupation: string | null;
  location: string | null;
  birth_year: string | null;
  generation_level: number | null;
}

interface Question {
  q: string;
  opts: string[];
  a: number;
}

const shuffle = <T,>(arr: T[]) => arr.map((v) => [Math.random(), v] as const).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

const buildQuestions = (members: Member[]): Question[] => {
  const questions: Question[] = [];
  const names = members.map((m) => m.full_name);

  members.forEach((m) => {
    if (m.occupation && names.length >= 4) {
      const distractors = shuffle(names.filter((n) => n !== m.full_name)).slice(0, 3);
      const opts = shuffle([m.full_name, ...distractors]);
      questions.push({
        q: `Who works as a ${m.occupation}?`,
        opts,
        a: opts.indexOf(m.full_name),
      });
    }
    if (m.location && names.length >= 4) {
      const distractors = shuffle(names.filter((n) => n !== m.full_name)).slice(0, 3);
      const opts = shuffle([m.full_name, ...distractors]);
      questions.push({
        q: `Who lives in ${m.location}?`,
        opts,
        a: opts.indexOf(m.full_name),
      });
    }
    if (m.nickname) {
      const distractors = shuffle(names.filter((n) => n !== m.full_name)).slice(0, 3);
      const opts = shuffle([m.full_name, ...distractors]);
      questions.push({
        q: `Whose nickname is "${m.nickname}"?`,
        opts,
        a: opts.indexOf(m.full_name),
      });
    }
  });

  return shuffle(questions).slice(0, 10);
};

const FamilyTrivia = () => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("family_members").select("*").limit(200);
      if (data) setQuestions(buildQuestions(data));
      setLoading(false);
    })();
  }, []);

  const reset = () => {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    if (questions.length) setQuestions(shuffle(questions));
  };

  if (loading) {
    return (
      <GameShell title="Family Trivia">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GameShell>
    );
  }

  if (questions.length === 0) {
    return (
      <GameShell title="Family Trivia">
        <div className="text-center py-16 bg-card rounded-2xl border border-sage-100 p-8">
          <h2 className="font-display text-xl font-semibold mb-2">Not enough family data yet</h2>
          <p className="text-muted-foreground">Add more family members (with occupations, locations, nicknames) to unlock trivia.</p>
        </div>
      </GameShell>
    );
  }

  if (done) {
    return (
      <GameShell title="Family Trivia" subtitle="Round complete">
        <div className="text-center py-12 bg-card rounded-2xl border border-sage-100 shadow-card">
          <h2 className="font-display text-3xl font-bold mb-2">{score} / {questions.length}</h2>
          <p className="text-muted-foreground mb-6">How well do you know your family?</p>
          <Button onClick={reset} className="gap-2"><RotateCcw className="w-4 h-4" /> Play again</Button>
        </div>
      </GameShell>
    );
  }

  const question = questions[idx];
  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === question.a) setScore((s) => s + 1);
  };
  const next = () => {
    if (idx + 1 >= questions.length) setDone(true);
    else { setIdx(idx + 1); setPicked(null); }
  };

  return (
    <GameShell title="Family Trivia" subtitle={`Question ${idx + 1} of ${questions.length} · Score ${score}`}>
      <div className="bg-card rounded-2xl border border-sage-100 shadow-card p-6">
        <h2 className="font-display text-xl font-semibold mb-6">{question.q}</h2>
        <div className="grid gap-3">
          {question.opts.map((opt, i) => {
            const isCorrect = i === question.a;
            const isPicked = picked === i;
            const revealed = picked !== null;
            const state = revealed
              ? isCorrect ? "border-green-500 bg-green-50 text-green-900"
              : isPicked ? "border-red-500 bg-red-50 text-red-900"
              : "border-border bg-muted/30 text-muted-foreground"
              : "border-border hover:border-primary hover:bg-primary/5 text-foreground";
            return (
              <button key={i} onClick={() => pick(i)} disabled={revealed}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${state}`}>
                <span>{opt}</span>
                {revealed && isCorrect && <Check className="w-5 h-5" />}
                {revealed && isPicked && !isCorrect && <X className="w-5 h-5" />}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <Button onClick={next} className="w-full mt-6">
            {idx + 1 >= questions.length ? "See results" : "Next question"}
          </Button>
        )}
      </div>
    </GameShell>
  );
};

export default FamilyTrivia;
