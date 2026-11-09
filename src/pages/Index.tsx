import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, ChevronDown, GitBranch, BookHeart, Music, Sparkles } from "lucide-react";
import heroTree from "@/assets/hero-tree.jpg";
import { FaqDialog } from "@/components/FaqDialog";
import { MagdaleneCrest } from "@/components/MagdaleneCrest";

const links = [
  { label: "Our Tales", to: "/tales" },
  { label: "Family Tree", to: "/family-tree" },
  { label: "Resources", to: "/resources" },
  { label: "MAGGIE", to: "/maggie" },
  { label: "Sign In", to: "/login" },
  { label: "Join the Family", to: "/register" },
];

const pillars = [
  { icon: GitBranch, title: "Family Tree", text: "Every branch, from RaTeko & Mma Teko to the youngest." },
  { icon: BookHeart, title: "Our Tales", text: "Stories told by elders, kept for the grandchildren." },
  { icon: Music, title: "Hymns & Scripture", text: "Difela, the Bible and the Quran for family gatherings." },
  { icon: Sparkles, title: "Ask MAGGIE", text: "Our digital matriarch who knows every name." },
];

const Index = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative min-h-dvh overflow-hidden bg-emerald-deep text-ivory">
      <motion.img
        src={heroTree}
        alt="An ancient tree over the Botswana landscape"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.35 }}
        transition={{ duration: 1.8 }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-deep/60 via-emerald-deep/80 to-emerald-deep" />

      {/* Top-corner menu */}
      <div className="absolute left-4 top-4 z-30">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex h-11 items-center gap-2 rounded-full border border-gold/50 bg-emerald-deep/70 px-4 text-sm font-medium text-ivory backdrop-blur"
        >
          <Menu className="h-5 w-5 text-gold" /> Menu
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-2 w-56 rounded-2xl border border-gold/25 bg-card p-2 shadow-elevated"
            >
              {links.map((l) => (
                <Link key={l.to} to={l.to} className="block rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted">
                  {l.label}
                </Link>
              ))}
              <FaqDialog trigger={<button className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-foreground hover:bg-muted">FAQ</button>} />
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      <main className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }}>
          <MagdaleneCrest size={120} />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 text-xs uppercase tracking-[0.35em] text-gold-soft">
          A Bodilenyane / Poane Legacy
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="mt-4 font-display text-5xl font-semibold leading-tight text-ivory md:text-7xl">
          The Magdalene Foundation
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 max-w-2xl font-display text-lg italic text-gold-soft md:text-2xl">
          &ldquo;Sethare se segologolo, Sethare se setona, Sethare Moriti o tsidididi, Sethare se maungo a monate&hellip;&rdquo;
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link to="/register" className="rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-widest text-gold-foreground shadow-elevated transition hover:scale-105">
            Join the Family
          </Link>
          <Link to="/login" className="rounded-full border border-ivory/40 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-ivory transition hover:bg-ivory/10">
            Sign In
          </Link>
        </motion.div>

        <div className="mt-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + i * 0.12 }}
              className="rounded-[18px] border border-gold/25 bg-ivory/5 p-5 text-left backdrop-blur"
            >
              <p.icon className="h-6 w-6 text-gold" />
              <p className="mt-3 font-display text-lg font-semibold text-ivory">{p.title}</p>
              <p className="mt-1 text-sm text-ivory/80">{p.text}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-12 text-xs uppercase tracking-[0.3em] text-ivory/60">Private family archive &bull; Family members only</p>
      </main>
    </div>
  );
};

export default Index;
