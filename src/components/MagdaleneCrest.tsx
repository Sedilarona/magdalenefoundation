import { motion } from "framer-motion";
import logoAsset from "@/assets/magdalene-logo.png.asset.json";

interface MagdaleneCrestProps {
  size?: number;
  className?: string;
}

/**
 * Official Magdalene Foundation seal.
 * Reserved for the Magdalene lineage — do not use for other family branches.
 */
export const MagdaleneCrest = ({ size = 76, className = "" }: MagdaleneCrestProps) => (
  <motion.img
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    src={logoAsset.url}
    width={size}
    height={size}
    alt="The Magdaline Foundation seal — Sethare se se gologolo"
    className={`rounded-full bg-ivory object-contain p-1 shadow-[0_6px_20px_-8px_rgba(0,0,0,0.45)] ring-1 ring-gold/50 ${className}`}
    style={{ width: size, height: size }}
  />
);

export default MagdaleneCrest;
