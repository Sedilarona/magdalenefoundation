import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity as ActivityIcon, ArrowLeft, CheckCircle2, Clock, Loader2, ShieldCheck, UserX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ReportRow {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  last_login: string | null;
  login_count: number;
}

interface LogRow {
  id: string;
  full_name: string | null;
  created_at: string;
  user_agent: string | null;
}

const when = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "Never signed in";

const ActivityReport = () => {
  const { family } = useAuth();
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase as any).rpc("family_activity_report");
    setRows((data ?? []) as ReportRow[]);

    const { data: recent } = await (supabase as any)
      .from("login_activity")
      .select("id, full_name, created_at, user_agent")
      .order("created_at", { ascending: false })
      .limit(25);
    setLogs((recent ?? []) as LogRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!family?.is_admin && !family?.is_platform_admin) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center p-6 text-center">
        <div>
          <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Admins only</h1>
          <p className="text-muted-foreground text-sm">Only family admins can view the activity report.</p>
          <Link to="/dashboard" className="inline-block mt-6 text-primary hover:underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const active = rows.filter((r) => r.last_login).length;
  const never = rows.length - active;

  return (
    <div className="min-h-dvh bg-background p-5 pb-28 max-w-3xl mx-auto">
      <header className="py-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-primary" /> Activity report
        </h1>
        <p className="text-muted-foreground text-sm">Who has signed in, and who has not yet joined.</p>
      </header>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Members", value: rows.length, icon: ActivityIcon },
              { label: "Signed in", value: active, icon: CheckCircle2 },
              { label: "Never", value: never, icon: UserX },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}>
                <Card className="p-4 rounded-[18px] text-center">
                  <s.icon className="w-4 h-4 text-primary mx-auto mb-2" aria-hidden="true" />
                  <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="p-5 rounded-[18px] mb-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Members</h2>
            {rows.length === 0 ? (
              <p className="text-muted-foreground text-sm">No member profiles yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((r, i) => (
                  <motion.li key={r.user_id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}
                    className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-foreground font-medium truncate">{r.full_name}</p>
                      <p className="text-muted-foreground text-xs truncate flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" /> {when(r.last_login)}
                      </p>
                    </div>
                    <Badge variant={r.last_login ? "secondary" : "outline"} className="shrink-0">
                      {r.last_login ? `${r.login_count} sign-in${r.login_count === 1 ? "" : "s"}` : "Not yet"}
                    </Badge>
                  </motion.li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5 rounded-[18px]">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Recent sign-ins</h2>
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No sign-ins recorded yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {logs.map((l) => (
                  <li key={l.id} className="py-2.5 flex items-center justify-between gap-3">
                    <span className="text-foreground text-sm truncate">{l.full_name ?? "Member"}</span>
                    <span className="text-muted-foreground text-xs shrink-0">{when(l.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default ActivityReport;
