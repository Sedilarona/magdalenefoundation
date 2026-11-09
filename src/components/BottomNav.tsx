import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  GitBranch,
  BookHeart,
  CalendarDays,
  Gamepad2,
  FolderOpen,
  MapPin,
  Wrench,
  Sparkles,
  Palette,
  Trophy,
  Settings,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const primaryItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GitBranch, label: "Family Tree", href: "/family-tree" },
  { icon: BookHeart, label: "Stories", href: "/tales" },
  { icon: CalendarDays, label: "Events", href: "/dashboard#events" },
];

const moreItems = [
  { icon: Sparkles, label: "Ask MAGGIE", href: "/maggie" },
  { icon: FolderOpen, label: "Family Resources", href: "/resources" },
  { icon: MapPin, label: "Locate Family", href: "/locate-family" },
  { icon: Wrench, label: "Family Services", href: "/family-services" },
  { icon: Gamepad2, label: "Family Tricks", href: "/games" },
  { icon: Trophy, label: "Leaderboard", href: "/games/leaderboard" },
  { icon: Palette, label: "Family Art", href: "/family-art" },
  { icon: User, label: "My Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const adminItem = { icon: ShieldCheck, label: "Family Admin", href: "/family-admin" };

/** Top-left heritage menu with a drop-down of every section. */
export const BottomNav = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, signOut, family } = useAuth();
  const items = [...primaryItems, ...moreItems, ...(family?.is_admin || family?.is_platform_admin ? [adminItem] : [])];

  return (
    <div className="fixed left-3 top-3 z-50 pt-[env(safe-area-inset-top)]">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-11 items-center gap-2 rounded-full border border-gold/40 bg-card/95 px-4 text-sm font-medium text-foreground shadow-card backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <Menu className="h-5 w-5 text-gold" aria-hidden="true" />
        Menu
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 -z-10" onClick={() => setOpen(false)} />
            <motion.nav
              aria-label="Primary"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-2 max-h-[75vh] w-64 overflow-y-auto rounded-2xl border border-gold/25 bg-card p-2 shadow-elevated"
            >
              {items.map((item) => {
                const active = pathname === item.href.split("#")[0];
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted ${active ? "bg-muted font-semibold" : ""}`}
                  >
                    <item.icon className="h-4 w-4 text-gold" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => { setOpen(false); signOut(); }}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out{user?.email ? ` — ${user.email}` : ""}
              </button>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
