import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  GitBranch,
  BookHeart,
  CalendarDays,
  MoreHorizontal,
  Library,
  Gamepad2,
  FolderOpen,
  MapPin,
  Wrench,
  Sparkles,
  Palette,
  Trophy,
  Settings,
  User,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const primaryItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GitBranch, label: "Family Tree", href: "/family-tree" },
  { icon: BookHeart, label: "Stories", href: "/tales" },
  { icon: CalendarDays, label: "Events", href: "/dashboard#events" },
];

const moreItems = [
  { icon: Sparkles, label: "Ask MAGGIE", href: "/maggie" },
  { icon: Library, label: "Family Memories", href: "/library" },
  { icon: FolderOpen, label: "Family Resources", href: "/resources" },
  { icon: MapPin, label: "Locate Family", href: "/locate-family" },
  { icon: Wrench, label: "Family Services", href: "/family-services" },
  { icon: Gamepad2, label: "Family Tricks", href: "/games" },
  { icon: Trophy, label: "Leaderboard", href: "/games/leaderboard" },
  { icon: Palette, label: "Family Art", href: "/family-art" },
  { icon: User, label: "My Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

/** Fixed heritage bottom navigation. */
export const BottomNav = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed bottom-0 inset-x-0 z-40 border-t border-gold/25 bg-card/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_28px_-18px_hsl(var(--emerald-deep)/0.5)]"
      >
        <ul className="mx-auto flex max-w-2xl items-stretch justify-between px-2">
          {primaryItems.map((item) => {
            const active = pathname === item.href.split("#")[0];
            return (
              <li key={item.label} className="flex-1">
                <Link
                  to={item.href}
                  aria-current={active ? "page" : undefined}
                  className="relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {active && (
                    <motion.span
                      layoutId="bottom-nav-active"
                      className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-gold"
                    />
                  )}
                  <item.icon
                    className={`h-5 w-5 ${active ? "text-gold" : "text-muted-foreground"}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-[10px] font-medium tracking-wide ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              onClick={() => setOpen(true)}
              aria-label="More sections"
              className="flex min-h-[56px] w-full flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-[10px] font-medium tracking-wide text-muted-foreground">More</span>
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl border-gold/25">
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-2xl">The Family Archive</SheetTitle>
          </SheetHeader>
          <AnimatePresence>
            <div className="mt-4 grid grid-cols-2 gap-3 pb-6">
              {moreItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:bg-muted"
                  >
                    <item.icon className="h-5 w-5 text-gold" aria-hidden="true" />
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </>
  );
};
