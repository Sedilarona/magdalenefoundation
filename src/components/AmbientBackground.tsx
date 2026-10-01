import { motion, useReducedMotion } from "framer-motion";

/** Soft drifting leaves and glows behind every signed-in page — the family tree motif. */
const LEAVES = [
  { left: "6%", size: 22, delay: 0, dur: 18 },
  { left: "22%", size: 14, delay: 4, dur: 22 },
  { left: "41%", size: 18, delay: 9, dur: 20 },
  { left: "63%", size: 12, delay: 2, dur: 24 },
  { left: "78%", size: 20, delay: 7, dur: 19 },
  { left: "92%", size: 15, delay: 12, dur: 23 },
];

const Leaf = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2C6 6 4 12 6 18c1 2 3 3 6 4 3-1 5-2 6-4 2-6 0-12-6-16zm0 3v15" opacity=".9" />
  </svg>
);

export const AmbientBackground = () => {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 -right-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
        animate={reduce ? undefined : { x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      {!reduce &&
        LEAVES.map((l, i) => (
          <motion.div
            key={i}
            className="absolute -top-10 text-primary/20"
            style={{ left: l.left }}
            initial={{ y: -40, rotate: 0, opacity: 0 }}
            animate={{ y: "110vh", rotate: 360, opacity: [0, 1, 1, 0], x: [0, 30, -20, 10] }}
            transition={{ duration: l.dur, delay: l.delay, repeat: Infinity, ease: "linear" }}
          >
            <Leaf size={l.size} />
          </motion.div>
        ))}
    </div>
  );
};

export default AmbientBackground;
