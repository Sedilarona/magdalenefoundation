import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const sizes = {
    sm: { icon: 32, text: "text-lg" },
    md: { icon: 40, text: "text-xl" },
    lg: { icon: 56, text: "text-3xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Active flat line logo - symbol of continuity */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          {/* Tree trunk */}
          <motion.path
            d="M28 48V28"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          {/* Main branches */}
          <motion.path
            d="M28 28C28 28 22 22 18 18M28 28C28 28 34 22 38 18"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          />
          {/* Secondary branches */}
          <motion.path
            d="M18 18C18 18 14 14 12 12M18 18C18 18 16 12 14 10M38 18C38 18 42 14 44 12M38 18C38 18 40 12 42 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          />
          {/* Leaves / circles representing family members */}
          <motion.circle
            cx="12"
            cy="12"
            r="4"
            className="fill-sage-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 1.2 }}
          />
          <motion.circle
            cx="14"
            cy="10"
            r="3"
            className="fill-sage-300"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 1.3 }}
          />
          <motion.circle
            cx="44"
            cy="12"
            r="4"
            className="fill-sage-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 1.4 }}
          />
          <motion.circle
            cx="42"
            cy="10"
            r="3"
            className="fill-sage-300"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 1.5 }}
          />
          {/* Root */}
          <motion.path
            d="M28 48C28 48 24 52 22 54M28 48C28 48 32 52 34 54"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 1 }}
          />
        </svg>
      </motion.div>

      {showText && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col"
        >
          <span className={`font-display font-semibold ${text} text-foreground leading-tight`}>
            Magdalene
          </span>
          <span className="text-xs font-body text-muted-foreground tracking-widest uppercase">
            Foundation
          </span>
        </motion.div>
      )}
    </div>
  );
};
