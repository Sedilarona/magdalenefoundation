import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, ArrowRight } from "lucide-react";
import { loadProgress, labelForRoute, type SavedProgress } from "@/lib/progress";

/** Shows the member where they last were so they can pick up again. */
export function ContinueCard() {
  const [p, setP] = useState<SavedProgress | null>(null);
  useEffect(() => { loadProgress().then(setP).catch(() => {}); }, []);
  if (!p?.last_route || p.last_route === "/dashboard") return null;
  return (
    <Link
      to={p.last_route}
      className="mt-5 flex items-center gap-3 rounded-[18px] border border-gold/30 bg-card p-4 shadow-card transition hover:border-gold"
    >
      <History className="h-5 w-5 text-gold" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">Continue where you left off</p>
        <p className="font-display font-semibold text-foreground">{p.last_label || labelForRoute(p.last_route)}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-gold" aria-hidden="true" />
    </Link>
  );
}
