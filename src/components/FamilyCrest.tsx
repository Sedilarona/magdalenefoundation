import { motion } from "framer-motion";

interface FamilyCrestProps {
  size?: number;
  className?: string;
}

/** Engraved-style family crest: a shield holding an ancestral tree. */
export const FamilyCrest = ({ size = 72, className = "" }: FamilyCrestProps) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    role="img"
    aria-label="Family crest"
    className={className}
  >
    <defs>
      <linearGradient id="crestGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(var(--gold-soft))" />
        <stop offset="50%" stopColor="hsl(var(--gold))" />
        <stop offset="100%" stopColor="hsl(var(--gold-soft))" />
      </linearGradient>
    </defs>

    {/* Shield */}
    <path
      d="M40 5 L69 15 V38c0 18-12 30-29 37C23 68 11 56 11 38V15Z"
      fill="hsl(var(--emerald-deep))"
      stroke="url(#crestGold)"
      strokeWidth="2"
    />
    <path
      d="M40 11 L64 19v19c0 15-10 25-24 31-14-6-24-16-24-31V19Z"
      fill="none"
      stroke="url(#crestGold)"
      strokeWidth="0.75"
      opacity="0.6"
    />

    {/* Tree */}
    <g stroke="url(#crestGold)" strokeWidth="2" strokeLinecap="round" fill="none">
      <path d="M40 62V40" />
      <path d="M40 44 30 34M40 44l10-10" />
      <path d="M30 34l-6-6M30 34l-1-8M50 34l6-6M50 34l1-8" />
      <path d="M40 62c-3 2-5 3-7 5M40 62c3 2 5 3 7 5" strokeWidth="1.5" />
    </g>
    <g fill="url(#crestGold)">
      <circle cx="24" cy="28" r="3.2" />
      <circle cx="29" cy="26" r="2.4" />
      <circle cx="56" cy="28" r="3.2" />
      <circle cx="51" cy="26" r="2.4" />
      <circle cx="40" cy="22" r="2.8" />
    </g>
  </motion.svg>
);

/** Faint tree watermark used behind the dashboard header. */
export const CrestWatermark = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 200"
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M100 190V95" />
    <path d="M100 130 60 90M100 130l40-40M100 100 72 62M100 100l28-38" />
    <path d="M60 90 38 66M60 90l-6-32M140 90l22-24M140 90l6-32M72 62 58 40M128 62l14-22" />
    <circle cx="38" cy="66" r="7" />
    <circle cx="54" cy="58" r="5" />
    <circle cx="162" cy="66" r="7" />
    <circle cx="146" cy="58" r="5" />
    <circle cx="58" cy="40" r="5" />
    <circle cx="142" cy="40" r="5" />
    <circle cx="100" cy="52" r="8" />
  </svg>
);
