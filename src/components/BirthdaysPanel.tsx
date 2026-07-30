import { useEffect, useState } from "react";
import { Cake, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Row {
  id: string;
  full_name: string;
  nickname: string | null;
  birth_month: number | null;
  birth_day: number | null;
  is_deceased: boolean | null;
}

/** Shows every family birthday falling in the selected month. */
export const BirthdaysPanel = ({ compact = false }: { compact?: boolean }) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from("family_members")
      .select("id, full_name, nickname, birth_month, birth_day, is_deceased")
      .eq("birth_month", month)
      .order("birth_day", { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        setRows(((data ?? []) as Row[]).filter((r) => !r.is_deceased));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  const today = now.getDate();
  const isThisMonth = month === now.getMonth() + 1;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Cake className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Birthdays</h3>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="h-9 rounded-lg border border-border bg-background text-foreground text-sm px-2"
          aria-label="Select birthday month"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-6 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No birthdays recorded for {MONTHS[month - 1]} yet. Add yours from your profile.
        </p>
      ) : (
        <ul className={compact ? "space-y-1.5" : "space-y-2"}>
          {rows.map((r) => {
            const isToday = isThisMonth && r.birth_day === today;
            return (
              <li
                key={r.id}
                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm ${
                  isToday ? "bg-primary/10 border border-primary/30" : "bg-muted/50"
                }`}
              >
                <span className="text-foreground truncate">
                  {r.full_name}
                  {r.nickname && <span className="text-muted-foreground"> &ldquo;{r.nickname}&rdquo;</span>}
                </span>
                <span className={isToday ? "text-primary font-semibold" : "text-muted-foreground"}>
                  {isToday ? "Today! 🎉" : `${MONTHS[month - 1].slice(0, 3)} ${r.birth_day ?? "?"}`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
