import { useEffect, useMemo, useState } from "react";
import { GameShell } from "./GameShell";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw, Trophy, Lock } from "lucide-react";
import { awardPoints } from "@/lib/gamePoints";
import { OnlineChallenge } from "@/components/OnlineChallenge";

interface Q {
  q: string;
  opts: string[];
  a: number;
}

interface Level {
  name: string;
  blurb: string;
  perQuestion: number;
  questions: Q[];
}

const LEVELS: Level[] = [
  {
    name: "Level 1 · Sunday School",
    blurb: "Well-known stories and people",
    perQuestion: 10,
    questions: [
      { q: "Who built the ark?", opts: ["Moses", "Noah", "Abraham", "David"], a: 1 },
      { q: "How many disciples did Jesus have?", opts: ["7", "10", "12", "14"], a: 2 },
      { q: "In what town was Jesus born?", opts: ["Nazareth", "Jerusalem", "Bethlehem", "Cana"], a: 2 },
      { q: "Who was thrown into the lions' den?", opts: ["Daniel", "Joseph", "Elijah", "Samuel"], a: 0 },
      { q: "How many books are in the King James Bible?", opts: ["39", "50", "66", "72"], a: 2 },
      { q: "Who denied Jesus three times?", opts: ["Peter", "Judas", "John", "Thomas"], a: 0 },
      { q: "Who parted the Red Sea?", opts: ["Aaron", "Joshua", "Moses", "Elijah"], a: 2 },
      { q: "How many days did Jesus fast in the wilderness?", opts: ["7", "12", "30", "40"], a: 3 },
      { q: "What is the first book of the New Testament?", opts: ["Mark", "Matthew", "Luke", "John"], a: 1 },
      { q: "Which giant did David defeat?", opts: ["Og", "Goliath", "Samson", "Nimrod"], a: 1 },
      { q: "Who was swallowed by a great fish?", opts: ["Jonah", "Job", "Amos", "Hosea"], a: 0 },
      { q: "What did God create on the fourth day?", opts: ["Fish", "Animals", "Sun, moon and stars", "Man"], a: 2 },
    ],
  },
  {
    name: "Level 2 · Bible Student",
    blurb: "Details, places and lesser-known names",
    perQuestion: 20,
    questions: [
      { q: "What was the first plague of Egypt?", opts: ["Frogs", "Water turned to blood", "Darkness", "Locusts"], a: 1 },
      { q: "Which king wrote most of the Psalms?", opts: ["Solomon", "David", "Saul", "Hezekiah"], a: 1 },
      { q: "On which mountain did Moses receive the commandments?", opts: ["Mount Carmel", "Mount Sinai", "Mount Nebo", "Mount Zion"], a: 1 },
      { q: "Who was the mother of Samuel?", opts: ["Hannah", "Ruth", "Naomi", "Rachel"], a: 0 },
      { q: "Which apostle was a tax collector before following Jesus?", opts: ["Matthew", "Simon", "Andrew", "Philip"], a: 0 },
      { q: "Who succeeded Moses as leader of Israel?", opts: ["Caleb", "Aaron", "Joshua", "Gideon"], a: 2 },
      { q: "In which city did Paul preach about the 'unknown god'?", opts: ["Corinth", "Athens", "Ephesus", "Rome"], a: 1 },
      { q: "How many sons did Jacob have?", opts: ["10", "11", "12", "13"], a: 2 },
      { q: "Who was the first king of Israel?", opts: ["David", "Saul", "Samuel", "Solomon"], a: 1 },
      { q: "Which prophet was taken up in a whirlwind?", opts: ["Elisha", "Elijah", "Isaiah", "Enoch"], a: 1 },
      { q: "What is the shortest book of the New Testament by chapters?", opts: ["Philemon", "Jude", "Titus", "2 John"], a: 0 },
      { q: "Who interpreted Pharaoh's dreams?", opts: ["Daniel", "Joseph", "Moses", "Aaron"], a: 1 },
    ],
  },
  {
    name: "Level 3 · Scholar",
    blurb: "Hard questions for the serious reader",
    perQuestion: 30,
    questions: [
      { q: "Which book records the fall of Jericho?", opts: ["Judges", "Joshua", "Numbers", "Deuteronomy"], a: 1 },
      { q: "Who was the father-in-law of Moses?", opts: ["Jethro", "Laban", "Eli", "Nahor"], a: 0 },
      { q: "Which judge made a rash vow concerning his daughter?", opts: ["Gideon", "Samson", "Jephthah", "Ehud"], a: 2 },
      { q: "Which king of Judah was healed and given fifteen more years?", opts: ["Josiah", "Hezekiah", "Asa", "Uzziah"], a: 1 },
      { q: "Who was the Roman governor at Jesus' trial?", opts: ["Herod Antipas", "Felix", "Pontius Pilate", "Festus"], a: 2 },
      { q: "Which epistle contains the 'fruit of the Spirit'?", opts: ["Ephesians", "Galatians", "Colossians", "Philippians"], a: 1 },
      { q: "Who replaced Judas among the twelve apostles?", opts: ["Matthias", "Barnabas", "Silas", "Stephen"], a: 0 },
      { q: "Which minor prophet married Gomer?", opts: ["Amos", "Hosea", "Micah", "Joel"], a: 1 },
      { q: "Which city was Paul travelling to when he was blinded by light?", opts: ["Damascus", "Antioch", "Tarsus", "Jerusalem"], a: 0 },
      { q: "How many chapters are in the book of Psalms?", opts: ["120", "144", "150", "155"], a: 2 },
      { q: "Which book of the Bible never mentions God by name?", opts: ["Esther", "Ecclesiastes", "Song of Solomon", "Ruth"], a: 0 },
      { q: "Who was the high priest that questioned Jesus first?", opts: ["Caiaphas", "Annas", "Gamaliel", "Eleazar"], a: 1 },
    ],
  },
];

const GAME_KEY = "bible-trivia";
const GAME_TITLE = "Bible Trivia";
const HOW_TO_PLAY = [
  "Pick an answer for each question — the correct one is revealed immediately.",
  "Levels get harder as you go: Sunday School, Bible Student, then Scholar.",
  "Answer at least 60% of a level correctly to unlock the next level.",
  "Each correct answer earns points (10, 20 and 30 per question by level) which are added to the family leaderboard.",
  "Use 'Challenge a family member' to invite someone and compare scores on the same level.",
];

const BibleTrivia = () => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [unlocked, setUnlocked] = useState(1);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  const level = LEVELS[levelIdx];
  const questions = level.questions;
  const question = questions[idx];
  const passMark = Math.ceil(questions.length * 0.6);

  useEffect(() => {
    const saved = Number(localStorage.getItem("bible-trivia-unlocked") || "1");
    if (saved > 1) setUnlocked(Math.min(saved, LEVELS.length));
  }, []);

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === question.a) setScore((s) => s + 1);
  };

  const next = async () => {
    if (idx + 1 >= questions.length) {
      const finalScore = score;
      const earned = finalScore * level.perQuestion;
      setSessionPoints((p) => p + earned);
      setDone(true);
      if (finalScore >= passMark && levelIdx + 1 >= unlocked && levelIdx + 1 < LEVELS.length) {
        const nextUnlocked = levelIdx + 2;
        setUnlocked(nextUnlocked);
        localStorage.setItem("bible-trivia-unlocked", String(nextUnlocked));
      }
      await awardPoints({ gameKey: GAME_KEY, gameTitle: GAME_TITLE, level: levelIdx + 1, points: earned });
    } else {
      setIdx(idx + 1);
      setPicked(null);
    }
  };

  const startLevel = (i: number) => {
    setLevelIdx(i);
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    setStarted(true);
  };

  const backToLevels = () => {
    setStarted(false);
    setDone(false);
  };

  const levelPicker = (
    <div className="space-y-6">
      <div className="grid gap-3">
        {LEVELS.map((l, i) => {
          const locked = i + 1 > unlocked;
          return (
            <button
              key={l.name}
              onClick={() => !locked && startLevel(i)}
              disabled={locked}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                locked
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
                {l.questions.length} questions · {l.perQuestion} pts each
              </p>
            </button>
          );
        })}
      </div>
      <OnlineChallenge gameKey={GAME_KEY} gameTitle={GAME_TITLE} maxPlayers={4} />
    </div>
  );

  if (!started) {
    return (
      <GameShell
        title={GAME_TITLE}
        subtitle="Choose a level — difficulty rises as you climb"
        howToPlay={HOW_TO_PLAY}
        points={sessionPoints}
      >
        {levelPicker}
      </GameShell>
    );
  }

  if (done) {
    const passed = score >= passMark;
    return (
      <GameShell title={GAME_TITLE} subtitle={`${level.name} complete`} howToPlay={HOW_TO_PLAY} points={sessionPoints}>
        <div className="text-center py-12 bg-card rounded-2xl border border-sage-100 shadow-card px-6">
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">
            {score} / {questions.length}
          </h2>
          <p className="text-primary font-semibold mb-2">+{score * level.perQuestion} points</p>
          <p className="text-muted-foreground mb-6">
            {passed
              ? levelIdx + 1 < LEVELS.length
                ? "Level passed — the next level is unlocked!"
                : "You have completed the final level. Outstanding!"
              : `You need ${passMark} correct to unlock the next level. Try again.`}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={() => startLevel(levelIdx)} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" /> Replay level
            </Button>
            {passed && levelIdx + 1 < LEVELS.length && (
              <Button onClick={() => startLevel(levelIdx + 1)}>Next level</Button>
            )}
            <Button variant="ghost" onClick={backToLevels}>All levels</Button>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      title={GAME_TITLE}
      subtitle={`${level.name} · Question ${idx + 1} of ${questions.length} · Score ${score}`}
      howToPlay={HOW_TO_PLAY}
      points={sessionPoints}
    >
      <div className="bg-card rounded-2xl border border-sage-100 shadow-card p-6">
        <div className="w-full h-2 bg-sage-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((idx + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }}
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
            {idx + 1 >= questions.length ? "See results" : "Next question"}
          </Button>
        )}
      </div>
    </GameShell>
  );
};

export default BibleTrivia;
