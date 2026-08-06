import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Layers,
  BookHeart,
  GitBranch,
  Sparkles,
  Bell,
  CalendarDays,
  MapPin,
  Clock,
  Activity,
  Cake,
  ChevronRight,
  Loader2,
  Search,
  Milestone,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { CrestWatermark } from "@/components/FamilyCrest";
import { MagdaleneCrest } from "@/components/MagdaleneCrest";
import { BirthdaysPanel } from "@/components/BirthdaysPanel";
import { ProfileButton } from "@/components/ProfileButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Announcement {
  id: string;
  title: string;
  description: string;
  event_date: string | null;
  location: string | null;
  announcement_type: string;
}

const MILESTONES = [
  { year: "1932", label: "Poane George Bodilenyane born", place: "Serowe", icon: Milestone },
  { year: "1958", label: "Marriage of RaTeko & Mma Teko", place: "Serowe", icon: Milestone },
  { year: "1971", label: "The family settles in Gaborone", place: "Gaborone", icon: MapPin },
  { year: "2024", label: "Magdalene Foundation founded", place: "Botswana", icon: Sparkles },
];

/** Confirmed family events kept in the archive alongside database announcements. */
const FAMILY_EVENTS = [
  { date: "2026-10-24", title: "Tefo Kgafela Wedding — Patlo", location: "Ramonaka Ward" },
  { date: "2026-11-27", title: "Tefo Kgafela Wedding — Magadi & Pholoso", location: "Ramonaka" },
  { date: "2026-11-28", title: "Wedding Celebration", location: "Ramonaka" },
  { date: "2026-11-29", title: "Wedding Celebration", location: "Mathubudukwane" },
];

const HERITAGE_ACTIVITY = [
  { id: "reunion-2024", label: "Family reunion in Mmathudukwane, hosted by the Kgafela family", when: "2024" },
];

const MAGGIE_PROMPTS = [
  "Who am I related to?",
  "Explain my lineage.",
  "Show our clan history.",
  "Find ancestors from Serowe.",
];

const greetingFor = (hour: number) =>
  hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

const Card = ({
  children,
  className = "",
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: "easeOut" }}
    className={`rounded-[20px] border border-gold/20 bg-card p-5 shadow-[var(--shadow-archive)] ${className}`}
  >
    {children}
  </motion.section>
);

const SectionTitle = ({
  icon: Icon,
  children,
  to,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  to?: string;
}) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-foreground">
      <Icon className="h-[18px] w-[18px] text-gold" aria-hidden="true" />
      {children}
    </h2>
    {to && (
      <Link
        to={to}
        className="flex items-center gap-0.5 rounded-md text-xs font-medium text-muted-foreground transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        View all <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    )}
  </div>
);

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState({ members: 0, generations: 0, stories: 0, completion: 0 });
  const [activity, setActivity] = useState<{ id: string; label: string; when: string }[]>([]);
  const [maggieQuery, setMaggieQuery] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [{ data: members }, { count: storyCount }, { data: anns }, { data: media }] =
        await Promise.all([
          supabase.from("family_members").select("id, generation_level, birth_month, photo_url"),
          supabase.from("tales").select("id", { count: "exact", head: true }),
          supabase
            .from("announcements")
            .select("*")
            .eq("is_active", true)
            .order("event_date", { ascending: true }),
          supabase
            .from("media_uploads")
            .select("id, file_name, caption, created_at")
            .order("created_at", { ascending: false })
            .limit(4),
        ]);

      if (cancelled) return;

      const rows = (members ?? []) as unknown as {
        id: string;
        generation_level: number | null;
        birth_month: number | null;
        photo_url: string | null;
      }[];
      const generations = new Set(
        rows.map((r) => r.generation_level).filter((g) => g != null),
      ).size;
      const withDetail = rows.filter((r) => r.birth_month || r.photo_url).length;

      setStats({
        members: rows.length,
        generations,
        stories: storyCount ?? 0,
        completion: rows.length ? Math.round((withDetail / rows.length) * 100) : 0,
      });
      setAnnouncements(anns ?? []);
      setActivity(
        ((media ?? []) as unknown as {
          id: string;
          file_name: string | null;
          caption: string | null;
          created_at: string;
        }[]).map((m) => ({
          id: m.id,
          label: m.caption || m.file_name || "New memory added",
          when: new Date(m.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
        })),
      );
    };

    load().catch(() => undefined);

    // Keep the dashboard numbers in sync with the rest of the app.
    const refresh = () => load().catch(() => undefined);
    const channel = supabase
      .channel("dashboard-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "family_members" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "tales" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "media_uploads" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, refresh)
      .subscribe();

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, []);


  const now = new Date();
  const greeting = useMemo(() => greetingFor(now.getHours()), [now]);
  const firstName = (profile?.full_name || user?.email?.split("@")[0] || "Friend").split(" ")[0];

  const upcoming = [
    ...announcements
      .filter((a) => a.event_date && new Date(a.event_date) >= new Date())
      .map((a) => ({ date: a.event_date as string, title: a.title, location: a.location ?? "Botswana" })),
    ...FAMILY_EVENTS.filter((e) => new Date(e.date) >= new Date()),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const nextEvent = upcoming[0];


  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-gold" aria-label="Loading" />
      </div>
    );
  }
  if (!user) return null;

  const statCards = [
    { icon: Users, label: "Family Members", value: stats.members || "—" },
    { icon: Layers, label: "Generations", value: stats.generations || "—" },
    { icon: BookHeart, label: "Stories Preserved", value: stats.stories || "—" },
    { icon: GitBranch, label: "Tree Complete", value: `${stats.completion}%` },
  ];

  return (
    <div className="min-h-dvh bg-background pb-28">
      <main className="mx-auto w-full max-w-2xl px-4">
        {/* Header */}
        <header className="relative -mx-4 overflow-hidden rounded-b-[28px] bg-[var(--gradient-crest)] px-6 pb-8 pt-10 text-ivory">
          <CrestWatermark className="pointer-events-none absolute -right-10 -top-6 h-56 w-56 text-gold opacity-[0.08]" />
          <div className="relative flex flex-col items-center text-center">
            <MagdaleneCrest size={84} />
            <p className="mt-3 font-display text-2xl font-semibold tracking-wide text-ivory">
              Poane Family Circle
            </p>
            <span className="mt-2 h-px w-16 bg-gold/60" aria-hidden="true" />
            <h1 className="mt-3 text-sm font-medium tracking-wide text-ivory">
              {greeting}, {firstName}.
            </h1>
            <p className="mt-1 font-display text-xs italic text-gold-soft">
              Sethare se segologolo, sethare se setona.
            </p>
          </div>
        </header>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-[18px] border border-gold/20 bg-card p-4 shadow-[var(--shadow-archive)]"
            >
              <s.icon className="h-5 w-5 text-gold" aria-hidden="true" />
              <p className="mt-3 font-display text-2xl font-semibold text-foreground">{s.value}</p>
              <p className="text-xs tracking-wide text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Timeline + Events */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Card delay={0.08}>
            <SectionTitle icon={Clock} to="/family-tree">
              Family Timeline
            </SectionTitle>
            <ol className="space-y-4">
              {MILESTONES.map((m) => (
                <li key={m.year} className="relative pl-5">
                  <span
                    className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-gold"
                    aria-hidden="true"
                  />
                  <span className="absolute left-[3px] top-4 h-full w-px bg-gold/25" aria-hidden="true" />
                  <p className="font-display text-sm font-semibold text-foreground">{m.year}</p>
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.place}</p>
                </li>
              ))}
            </ol>
          </Card>

          <Card delay={0.14} id="events">
            <SectionTitle icon={CalendarDays}>Upcoming Events</SectionTitle>
            <div className="overflow-hidden rounded-2xl border border-gold/20">
              <div className="relative h-28 bg-[var(--gradient-crest)]">
                <CrestWatermark className="absolute inset-0 mx-auto h-28 text-gold opacity-20" />
              </div>
              <div className="p-4">
                <p className="font-display text-base font-semibold text-foreground">
                  {nextEvent?.title ?? "Family Gathering"}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                  {nextEvent?.date
                    ? new Date(nextEvent.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Date to be announced"}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                  {nextEvent?.location ?? "Serowe, Botswana"}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {upcoming.length} upcoming · RSVPs open
                  </span>
                  <Button size="sm" className="h-9 rounded-full bg-gold text-gold-foreground hover:bg-gold/90">
                    RSVP
                  </Button>
                </div>
              </div>
            </div>

            {upcoming.length > 1 && (
              <ul className="mt-3 space-y-2">
                {upcoming.slice(1, 5).map((e) => (
                  <li
                    key={`${e.date}-${e.title}`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/40 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{e.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{e.location}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-gold">
                      {new Date(e.date).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>


        {/* Announcements */}
        <Card className="mt-4" delay={0.18}>
          <SectionTitle icon={Bell}>Recent Announcements</SectionTitle>
          {announcements.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No announcements yet — the archive is quiet today.
            </p>
          ) : (
            <ul className="space-y-3">
              {announcements.slice(0, 4).map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15">
                    {a.announcement_type === "birthday" ? (
                      <Cake className="h-4 w-4 text-gold" aria-hidden="true" />
                    ) : (
                      <Bell className="h-4 w-4 text-gold" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Ask MAGGIE */}
        <Card className="mt-4 bg-[var(--gradient-crest)] text-ivory" delay={0.22}>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ivory">
            <Sparkles className="h-[18px] w-[18px] text-gold" aria-hidden="true" />
            Ask MAGGIE
          </h2>
          <p className="mt-1 text-sm text-ivory/90">
            Your matriarch's memory — lineage, clan history and kinship.
          </p>
          <form
            className="mt-4 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/maggie?q=${encodeURIComponent(maggieQuery)}`);
            }}
          >
            <label htmlFor="maggie-q" className="sr-only">
              Ask MAGGIE a question
            </label>
            <Input
              id="maggie-q"
              value={maggieQuery}
              onChange={(e) => setMaggieQuery(e.target.value)}
              placeholder="Ask about your family…"
              className="h-11 rounded-full border-gold/30 bg-ivory/10 text-ivory placeholder:text-ivory/70 focus-visible:ring-gold"
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Ask MAGGIE"
              className="h-11 w-11 shrink-0 rounded-full bg-gold text-gold-foreground hover:bg-gold/90"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
          <ul className="mt-3 flex flex-wrap gap-2">
            {MAGGIE_PROMPTS.map((p) => (
              <li key={p}>
                <Link
                  to={`/maggie?q=${encodeURIComponent(p)}`}
                  className="inline-flex rounded-full border border-gold/40 px-3 py-1.5 text-xs text-ivory transition-colors hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {p}
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* On this day + activity */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Card delay={0.26}>
            <SectionTitle icon={Clock}>On This Day</SectionTitle>
            <p className="font-display text-sm text-foreground">
              {now.toLocaleDateString(undefined, { month: "long", day: "numeric" })}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              The archive holds no recorded event for today yet. Add a memory and it will appear here
              for generations to come.
            </p>
            <Link
              to="/tales"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gold hover:underline"
            >
              Record a story <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Card>

          <Card delay={0.3}>
            <SectionTitle icon={Activity} to="/library">
              Recent Family Activity
            </SectionTitle>
            {activity.length === 0 && HERITAGE_ACTIVITY.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent contributions.</p>
            ) : (
              <ul className="space-y-3">
                {[...activity, ...HERITAGE_ACTIVITY].map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-foreground">{a.label}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{a.when}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Birthdays */}
        <Card className="mt-4" delay={0.34}>
          <SectionTitle icon={Cake}>Birthdays This Month</SectionTitle>
          <BirthdaysPanel compact />
        </Card>

        {/* Map snapshot */}
        <Card className="mt-4" delay={0.38}>
          <SectionTitle icon={MapPin} to="/locate-family">
            Family Map Snapshot
          </SectionTitle>
          <Link
            to="/locate-family"
            className="block overflow-hidden rounded-2xl border border-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <div className="relative h-36 bg-[var(--gradient-crest)]">
              <CrestWatermark className="absolute inset-0 mx-auto h-36 text-gold opacity-[0.12]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-ivory">
                <MapPin className="h-6 w-6 text-gold" aria-hidden="true" />
                <p className="font-display text-sm">Serowe · Gaborone · Palapye · Francistown</p>
                <p className="text-xs text-ivory/85">Tap to explore where the family lives</p>
              </div>
            </div>
          </Link>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
