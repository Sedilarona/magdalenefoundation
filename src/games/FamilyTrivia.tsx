import { useEffect, useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, RotateCcw, Loader2, Lock, Trophy } from "lucide-react";
import { awardPoints } from "@/lib/gamePoints";
import { OnlineChallenge } from "@/components/OnlineChallenge";

interface Member {
  id: string;
  full_name: string;
  nickname: string | null;
  occupation: string | null;
  location: string | null;
  birth_year: string | null;
  birth_month: number | null;
  gender: string | null;
  is_deceased: boolean | null;
  parent_id: string | null;
  spouse_id: string | null;
  generation_level: number | null;
}

interface Question {
  q: string;
  opts: string[];
  a: number;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const shuffle = <T,>(arr: T[]) =>
  arr.map((v) => [Math.random(), v] as const).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

const withOptions = (correct: string, pool: string[], q: string): Question | null => {
  const distractors = shuffle(pool.filter((n) => n && n !== correct)).slice(0, 3);
  if (distractors.length < 3) return null;
  const opts = shuffle([correct, ...distractors]);
  return { q, opts, a: opts.indexOf(correct) };
};

/** Level 1 — easy: names, nicknames, simple facts. */
const easyQuestions = (members: Member[]): Question[] => {
  const names = members.map((m) => m.full_name);
  const out: Question[] = [];
  members.forEach((m) => {
    if (m.nickname) {
      const q = withOptions(m.full_name, names, `Whose nickname is "${m.nickname}"?`);
      if (q) out.push(q);
    }
    if (m.occupation) {
      const q = withOptions(m.full_name, names, `Who works as a ${m.occupation}?`);
      if (q) out.push(q);
    }
    if (m.location) {
      const q = withOptions(m.full_name, names, `Who lives in ${m.location}?`);
      if (q) out.push(q);
    }
  });
  return out;
};

/** Level 2 — medium: relationships between people. */
const mediumQuestions = (members: Member[]): Question[] => {
  const byId = new Map(members.map((m) => [m.id, m]));
  const names = members.map((m) => m.full_name);
  const out: Question[] = [];
  members.forEach((m) => {
    const parent = m.parent_id ? byId.get(m.parent_id) : undefined;
    if (parent) {
      const q = withOptions(parent.full_name, names, `Who is the parent of ${m.full_name}?`);
      if (q) out.push(q);
    }
    const spouse = m.spouse_id ? byId.get(m.spouse_id) : undefined;
    if (spouse) {
      const q = withOptions(spouse.full_name, names, `Who is married to ${m.full_name}?`);
      if (q) out.push(q);
    }
    if (m.birth_month) {
      const q = withOptions(MONTHS[m.birth_month - 1], MONTHS, `In which month is ${m.full_name}'s birthday?`);
      if (q) out.push(q);
    }
  });
  return out;
};

/** Level 3 — hard: counting, generations and lineage. */
const hardQuestions = (members: Member[]): Question[] => {
  const names = members.map((m) => m.full_name);
  const out: Question[] = [];
  const childCount = new Map<string, number>();
  members.forEach((m) => {
    if (m.parent_id) childCount.set(m.parent_id, (childCount.get(m.parent_id) ?? 0) + 1);
  });

  members.forEach((m) => {
    const count = childCount.get(m.id);
    if (count && count > 1) {
      const options = shuffle([
        String(count),
        String(count + 1),
        String(Math.max(1, count - 1)),
        String(count + 2),
      ].filter((v, i, a) => a.indexOf(v) === i));
      if (options.length === 4) {
        out.push({ q: `How many children does ${m.full_name} have in our tree?`, opts: options, a: options.indexOf(String(count)) });
      }
    }
    // grandparent chains
    const parent = members.find((p) => p.id === m.parent_id);
    const grandparent = parent ? members.find((g) => g.id === parent.parent_id) : undefined;
    if (grandparent) {
      const q = withOptions(grandparent.full_name, names, `Who is the grandparent of ${m.full_name}?`);
      if (q) out.push(q);
    }
    if (m.is_deceased) {
      const q = withOptions(m.full_name, names, "Which of these family members is remembered as an angel (passed on)?");
      if (q) out.push(q);
    }
  });
  return out;
};

const LEVEL_META = [
  { name: "Level 1 · Faces & Names", blurb: "Nicknames, work and where people live", perQuestion: 10, count: 10, build: easyQuestions },
  { name: "Level 2 · Relations", blurb: "Parents, marriages and birthdays", perQuestion: 20, count: 10, build: mediumQuestions },
  { name: "Level 3 · Lineage", blurb: "Grandparents, counts and generations", perQuestion: 30, count: 10, build: hardQuestions },
];

const GAME_KEY = "family-trivia";
const GAME_TITLE = "Family Trivia";
const HOW_TO_PLAY = [
  "Questions are generated live from the family tree, so they change every round.",
  "Level 1 asks about names and nicknames, Level 2 about relationships and birthdays, Level 3 about lineage and generations.",
  "Score at least 60% to unlock the next level.",
  "Points (10/20/30 per correct answer by level) go straight to the family leaderboard.",
  "Challenge a family member from the level screen to play the same round together.",
];

const FamilyTrivia = () => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [levelIdx, setLevelIdx] = useState(0);
  const [unlocked, setUnlocked] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const saved = Number(localStorage.getItem("family-trivia-unlocked") || "1");
    if (saved > 1) setUnlocked(Math.min(saved, LEVEL_META.length));
    (async () => {
      const { data } = await supabase.from("family_members").select("*").limit(400);
      if (data) setMembers(data as Member[]);
      setLoading(false);
    })();
  }, []);

  const meta = LEVEL_META[levelIdx];
  const passMark = Math.ceil(questions.length * 0.6);

  const startLevel = (i: number) => {
    const built = shuffle(LEVEL_META[i].build(members)).slice(0, LEVEL_META[i].count);
    setLevelIdx(i);
    setQuestions(built);
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    setStarted(true);
  };

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === questions[idx].a) setScore((s) => s + 1);
  };

  const next = async () => {
    if (idx + 1 >= questions.length) {
      const earned = score * meta.perQuestion;
      setSessionPoints((p) => p + earned);
      setDone(true);
      if (score >= passMark && levelIdx + 1 >= unlocked && levelIdx + 1 < LEVEL_META.length) {
        const nextUnlocked = levelIdx + 2;
        setUnlocked(nextUnlocked);
        localStorage.setItem("family-trivia-unlocked", String(nextUnlocked));
      }
      await awardPoints({ gameKey: GAME_KEY, gameTitle: GAME_TITLE, level: levelIdx + 1, points: earned });
    } else {
      setIdx(idx + 1);
      setPicked(null);
    }
  };

  if (loading) {
    return (
      <GameShell title={GAME_TITLE} howToPlay={HOW_TO_PLAY}>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GameShell>
    );
  }

  if (!started) {
    return (
      <GameShell title={GAME_TITLE} subtitle="Choose a level" howToPlay={HOW_TO_PLAY} points={sessionPoints}>
        <div className="space-y-6">
          <div className="grid gap-3">
            {LEVEL_META.map((l, i) => {
              const locked = i + 1 > unlocked;
              const available = l.build(members).length;
              const empty = available < 4;
              return (
                <button
                  key={l.name}
                  onClick={() => !locked && !empty && startLevel(i)}
                  disabled={locked || empty}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                    locked || empty
                      ? "border-border bg-muted/40 text-muted-foreground cursor-not-allowed"
                      : "border-sage-100 bg-card hover:border-primary hover:shadow-card text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold">{l.name}</p>
                      <p className="text-sm text-muted-foreground">{l.blurb}</p>
                    </div>
                    {locked ? <Lock className="w-5 h-5" /> : <Trophy className="w-5 h-5 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {empty ? "Not enough family data yet for this level" : `${Math.min(l.count, available)} questions · ${l.perQuestion} pts each`}
                  </p>
                </button>
              );
            })}
          </div>
          <OnlineChallenge gameKey={GAME_KEY} gameTitle={GAME_TITLE} maxPlayers={4} />
        </div>
      </GameShell>
    );
  }

  if (done) {
    const passed = score >= passMark;
    return (
      <GameShell title={GAME_TITLE} subtitle={`${meta.name} complete`} howToPlay={HOW_TO_PLAY} points={sessionPoints}>
        <div className="text-center py-12 bg-card rounded-2xl border border-sage-100 shadow-card px-6">
          <h2 className="font-display text-3xl font-bold mb-2">{score} / {questions.length}</h2>
          <p className="text-primary font-semibold mb-2">+{score * meta.perQuestion} points</p>
          <p className="text-muted-foreground mb-6">
            {passed ? "Level passed! How well you know your people." : `Score ${passMark} or more to unlock the next level.`}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" onClick={() => startLevel(levelIdx)} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Replay level
            </Button>
            {passed && levelIdx + 1 < LEVEL_META.length && (
              <Button onClick={() => startLevel(levelIdx + 1)}>Next level</Button>
            )}
            <Button variant="ghost" onClick={() => setStarted(false)}>All levels</Button>
          </div>
        </div>
      </GameShell>
    );
  }

  const question = questions[idx];

  return (
    <GameShell
      title={GAME_TITLE}
      subtitle={`${meta.name} · Question ${idx + 1} of ${questions.length} · Score ${score}`}
      howToPlay={HOW_TO_PLAY}
      points={sessionPoints}
    >
      <div className="bg-card rounded-2xl border border-sage-100 shadow-card p-6">
        <h2 className="font-display text-xl font-semibold mb-6">{question.q}</h2>
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
            {idx + 1 >= questions.length ? "See results" : "Next question"}
          </Button>
        )}
      </div>
    </GameShell>
  );
};

export default FamilyTrivia;
