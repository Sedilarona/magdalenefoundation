import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Mail, MessageCircle, ShieldCheck, Search, Clock, TreeDeciduous } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ADMIN_EMAIL,
  ADMIN_EMAIL_LINK,
  ADMIN_WHATSAPP_DISPLAY,
  ADMIN_WHATSAPP_LINK,
} from "@/lib/contacts";

interface TreeName {
  id: string;
  full_name: string;
  gender: string | null;
}

/** How long an unmatched member may stay signed in to pick their name. */
const GRACE_MS = 3 * 60 * 1000;
const GRACE_KEY = "magdalene.link_window_start";

const PendingAccess = () => {
  const { user, family, signOut, loading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [names, setNames] = useState<TreeName[]>([]);
  const [namesLoading, setNamesLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [claiming, setClaiming] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(GRACE_MS);

  const waitingApproval = Boolean(family?.family_id && family?.status !== "approved");

  // Load every name on the family tree that nobody has claimed yet.
  useEffect(() => {
    if (waitingApproval) return;
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any).rpc("signup_family_names");
      if (cancelled) return;
      setNames((data ?? []) as TreeName[]);
      setNamesLoading(false);
    })();
    return () => { cancelled = true; };
  }, [waitingApproval]);

  // Three-minute window, then the visitor is signed out again.
  useEffect(() => {
    if (waitingApproval || !user) return;
    const started = Number(sessionStorage.getItem(GRACE_KEY)) || Date.now();
    sessionStorage.setItem(GRACE_KEY, String(started));

    const tick = () => {
      const left = started + GRACE_MS - Date.now();
      setRemaining(left);
      if (left <= 0) {
        sessionStorage.removeItem(GRACE_KEY);
        signOut();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [waitingApproval, user, signOut]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? names.filter((n) => n.full_name.toLowerCase().includes(q)) : names;
  }, [names, query]);

  const claim = async (member: TreeName) => {
    setClaiming(member.id);
    const { data, error } = await (supabase as any).rpc("claim_family_member", { _member_id: member.id });
    setClaiming(null);

    if (error || !data?.ok) {
      toast({
        title: "Could not link that name",
        description: data?.error === "name_unavailable"
          ? "Someone has already claimed this name. Please choose another or contact the administrator."
          : error?.message ?? "Please try again.",
        variant: "destructive",
      });
      return;
    }

    sessionStorage.removeItem(GRACE_KEY);
    toast({ title: "Welcome home", description: `Your account is now linked to ${member.full_name}.` });
    await refreshProfile();
    navigate("/dashboard", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const mins = Math.max(0, Math.floor(remaining / 60000));
  const secs = Math.max(0, Math.floor((remaining % 60000) / 1000));

  return (
    <div className="min-h-dvh bg-background flex items-start sm:items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[20px] border border-border bg-card p-5 sm:p-8 shadow-lg"
      >
        <Link to="/" className="inline-block mb-6">
          <Logo size="md" />
        </Link>

        {waitingApproval ? (
          <>
            <ShieldCheck className="w-10 h-10 text-primary mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Your access is awaiting approval
            </h1>
            <p className="text-muted-foreground text-sm">
              {family?.family_name} is being reviewed. You will be able to enter as soon as it is
              approved.
            </p>
          </>
        ) : (
          <>
            <TreeDeciduous className="w-10 h-10 text-primary mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Find yourself on the family tree
            </h1>
            <p className="text-muted-foreground text-sm">
              Signed in as {user?.email}. Tap your name below to link your account. Make sure you
              select your own name.
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-foreground">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span>
                You have {mins}:{String(secs).padStart(2, "0")} minutes to choose before you are
                signed out.
              </span>
            </div>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your name"
                className="pl-9 h-11"
              />
            </div>

            <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-border divide-y divide-border">
              {namesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No matching name on the tree.</p>
              ) : (
                filtered.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => claim(n)}
                    disabled={claiming !== null}
                    className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted disabled:opacity-60 flex items-center justify-between gap-3"
                  >
                    <span className="truncate">{n.full_name}</span>
                    {claiming === n.id && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  </button>
                ))
              )}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Cannot find your name? Reach the family administrator and it will be added.
            </p>
          </>
        )}

        <div className="mt-6 space-y-3">
          <a href={ADMIN_EMAIL_LINK} className="block">
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <Mail className="w-4 h-4 text-primary" />
              <span className="truncate">{ADMIN_EMAIL}</span>
            </Button>
          </a>
          <a href={ADMIN_WHATSAPP_LINK} target="_blank" rel="noreferrer" className="block">
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span>WhatsApp {ADMIN_WHATSAPP_DISPLAY}</span>
            </Button>
          </a>
        </div>

        <div className="mt-8 flex items-center justify-between text-sm">
          <Link to="/register" className="text-primary hover:underline">
            Create a new account
          </Link>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingAccess;
