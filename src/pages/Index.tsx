import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GitBranch, BookHeart, Sparkles, Music } from "lucide-react";
import heroTree from "@/assets/hero-tree.jpg";
import { FaqDialog } from "@/components/FaqDialog";

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-background text-foreground font-body flex items-center justify-center p-4 md:p-10">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 border border-deep-sage/10 shadow-elevated bg-warm-white overflow-hidden">
        {/* Vertical masthead rail */}
        <aside className="hidden lg:flex lg:col-span-1 border-r border-deep-sage/10 flex-col justify-between py-12 items-center">
          <div
            className="whitespace-nowrap tracking-[0.3em] text-[10px] font-semibold text-deep-sage/40 uppercase"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Est. Heritage &bull; Private Archive
          </div>
          <div className="flex flex-col items-center gap-8">
            <div className="w-px h-24 bg-terracotta" />
            <span className="text-terracotta font-display italic text-2xl">M</span>
          </div>
        </aside>

        <div className="lg:col-span-11 grid grid-cols-1 lg:grid-cols-2">
          {/* Left: visual storytelling */}
          <div className="relative h-[380px] lg:h-[820px] bg-deep-sage overflow-hidden group">
            <div className="absolute inset-0 bg-foreground/20 z-10" />
            <motion.img
              src={heroTree}
              alt="An ancient tree standing over the Botswana landscape, symbol of the Bodilenyane family"
              initial={{ scale: 1.08, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 transition-transform duration-[1200ms] group-hover:scale-110"
            />

            <motion.blockquote
              variants={rise}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.4 }}
              className="absolute bottom-10 right-0 left-8 md:left-12 z-20 bg-parchment p-7 md:p-10"
              style={{ boxShadow: "-20px 20px 0px 0px hsl(var(--deep-sage))" }}
            >
              <p className="text-deep-sage font-display italic text-xl md:text-3xl leading-snug">
                &ldquo;Sethare se segologolo, Sethare se setona, Sethare Moriti o tsidididi, Sethare se maungo a monate&hellip;&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="h-px w-8 bg-terracotta" />
                <span className="uppercase tracking-widest text-[10px] font-bold text-deep-sage">
                  The Family Motto
                </span>
              </div>
            </motion.blockquote>
          </div>

          {/* Right: editorial copy */}
          <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center bg-background">
            <nav className="mb-14 flex flex-wrap gap-6 md:gap-8 text-[11px] uppercase tracking-widest font-bold text-sage-500 items-center">
              <Link to="/tales" className="hover:text-terracotta transition-colors">Our Tales</Link>
              <Link to="/family-tree" className="hover:text-terracotta transition-colors">Family Tree</Link>
              <Link to="/resources" className="hover:text-terracotta transition-colors">Resources</Link>
              <Link to="/maggie" className="hover:text-terracotta transition-colors">MAGGIE</Link>
              <FaqDialog
                trigger={
                  <button className="uppercase tracking-widest font-bold text-[11px] hover:text-terracotta transition-colors">
                    FAQ
                  </button>
                }
              />
              <Link to="/login" className="text-terracotta">Sign In</Link>
            </nav>

            <motion.div variants={rise} initial="hidden" animate="show" className="space-y-6 max-w-lg">
              <h2 className="text-terracotta font-display italic text-xl md:text-2xl">
                A Bodilenyane / Poane Legacy
              </h2>
              <h1 className="font-display text-5xl md:text-7xl leading-[1.1] font-semibold text-foreground">
                The <br />Magdalene <br />Foundation
              </h1>

              <div className="pt-6 space-y-6">
                <p className="text-foreground/80 text-lg leading-relaxed font-light">
                  A private sanctuary celebrating the profound life of{" "}
                  <span className="font-semibold text-deep-sage">Magdeline Bodilenyane</span>. An
                  archive of heritage, hymns, and the enduring wisdom of our elders,{" "}
                  <span className="italic">RaTeko &amp; Mma Teko</span>.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4">
                  <Link
                    to="/register"
                    className="px-10 py-5 bg-deep-sage text-background uppercase tracking-[0.2em] text-xs font-bold hover:bg-foreground transition-colors shadow-soft text-center"
                  >
                    Request Access
                  </Link>
                  <Link
                    to="/tales"
                    className="px-10 py-5 border border-deep-sage/20 text-deep-sage uppercase tracking-[0.2em] text-xs font-bold hover:bg-parchment transition-colors text-center"
                  >
                    Explore Tales
                  </Link>
                </div>

                <div className="flex flex-wrap gap-6 pt-6 text-[11px] uppercase tracking-widest font-bold text-sage-500">
                  <span className="inline-flex items-center gap-2"><GitBranch className="w-3.5 h-3.5" /> Family Tree</span>
                  <span className="inline-flex items-center gap-2"><BookHeart className="w-3.5 h-3.5" /> Our Tales</span>
                  <span className="inline-flex items-center gap-2"><Music className="w-3.5 h-3.5" /> Hymns</span>
                  <span className="inline-flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> MAGGIE</span>
                </div>
              </div>
            </motion.div>

            <div className="mt-20 pt-10 border-t border-deep-sage/10 flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-sage-500 mb-2">Volume I</p>
                <p className="font-display italic text-lg">Roots and Branches</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest font-bold text-sage-500 mb-2">Access</p>
                <p className="font-display italic text-lg">Invitation Only</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
