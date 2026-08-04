import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  BookHeart,
  Library,
  Gamepad2,
  FolderOpen,
  Sparkles,
  MapPin,
  Wrench,
  Menu,
  X,
  Settings,
  ArrowLeft,
  Loader2,
  Search,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GitBranch, label: "Family Tree", href: "/family-tree" },
  { icon: BookHeart, label: "Our Tales", href: "/tales" },
  { icon: Library, label: "Family Memories", href: "/library" },
  { icon: Gamepad2, label: "Family Tricks", href: "/games" },
  { icon: FolderOpen, label: "Family Resources", href: "/resources" },
  { icon: MapPin, label: "Locate Family", href: "/locate-family" },
  { icon: Wrench, label: "Family Services", href: "/family-services", active: true },
  { icon: Sparkles, label: "MAGGIE", href: "/maggie" },
];

// Services known from the family directory. Profiles add to this list live.
const DIRECTORY: { name: string; services: string[] }[] = [
  { name: "Thabang", services: ["Electrician"] },
  { name: "Gaone Poane", services: ["Tennis Coach", "Small Scale Caterer"] },
  { name: "Oaitse Poane", services: ["House Painter"] },
  { name: "Obakeng Motladiile", services: ["Tiler", "Auto Mechanic"] },
  { name: "Kealeboga Kabalano", services: ["JCE English Tutor", "Primary English Tutor", "PSLE Tutor"] },
  {
    name: "Olefile Poane",
    services: [
      "Company Branding",
      "Chilli Sauce Sales Rep",
      "App Developer",
      "Company Registration Consultant",
      "T-Shirt Printing",
      "Safety Health & Environment File Inspection",
    ],
  },
  { name: "Oankgoga Poane", services: ["Interior Architect Consultant"] },
  { name: "Patrick Jansen", services: ["Agri Products Sales"] },
  {
    name: "Mooketsi Poane",
    services: ["Business Plan", "App Developer", "AI Coach", "Financial Advisor", "Courier"],
  },
  { name: "Maipelo Kebitseng", services: ["Day Care Centre"] },
  { name: "Tefo Kgafela", services: ["Photographer", "Videographer"] },
];

const FamilyServices = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [openService, setOpenService] = useState<string | null>(null);
  const [profileEntries, setProfileEntries] = useState<{ name: string; services: string[] }[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("profiles").select("full_name, services");
      if (data) {
        setProfileEntries(
          data
            .filter((p: any) => Array.isArray(p.services) && p.services.length)
            .map((p: any) => ({ name: p.full_name, services: p.services as string[] })),
        );
      }
      setLoadingList(false);
    };
    load();
  }, []);

  // Merge the directory with live profile services
  const grouped = useMemo(() => {
    const map = new Map<string, Set<string>>();
    [...DIRECTORY, ...profileEntries].forEach((entry) => {
      entry.services.forEach((raw) => {
        const service = raw.trim();
        if (!service) return;
        const key = service.toLowerCase();
        const existingKey = [...map.keys()].find((k) => k.toLowerCase() === key) ?? service;
        if (!map.has(existingKey)) map.set(existingKey, new Set());
        map.get(existingKey)!.add(entry.name);
      });
    });
    return [...map.entries()]
      .map(([service, people]) => ({ service, people: [...people].sort() }))
      .sort((a, b) => a.service.localeCompare(b.service));
  }, [profileEntries]);

  const filtered = grouped.filter((g) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      g.service.toLowerCase().includes(q) ||
      g.people.some((p) => p.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed lg:relative z-40 w-[280px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
          >
            <div className="p-6 border-b border-sidebar-border">
              <Logo size="md" />
            </div>
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                        item.active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t border-sidebar-border">
              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-4 px-4 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display text-xl font-semibold text-foreground">Family Services</h1>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 lg:p-8 text-primary-foreground"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                <Wrench className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">What the family offers</h2>
                <p className="text-primary-foreground/80 text-sm">
                  Tap a service to see every family member who offers it.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="font-display font-semibold text-foreground">
              Remember to pay family: Everytime and in full
            </p>
            <p className="text-sm text-muted-foreground italic">(Madi a lothanya)</p>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search a service or a name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loadingList ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((g) => {
                const open = openService === g.service;
                return (
                  <div key={g.service} className="bg-card rounded-xl border border-border overflow-hidden">
                    <button
                      onClick={() => setOpenService(open ? null : g.service)}
                      className="w-full flex items-center justify-between gap-2 p-4 text-left hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-display font-semibold text-foreground">{g.service}</span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {g.people.length}
                        <ChevronRight className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""}`} />
                      </span>
                    </button>
                    {open && (
                      <ul className="px-4 pb-4 space-y-1 text-sm text-muted-foreground">
                        {g.people.map((p) => (
                          <li key={p}>• {p}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-muted/50 rounded-xl p-6 border border-border">
            <h4 className="font-display font-semibold text-foreground mb-1">Offer a service?</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Add it to your profile and it appears here automatically.
            </p>
            <Link to="/profile">
              <Button size="sm" variant="outline" className="gap-2">
                <Wrench className="w-4 h-4" />
                Add my services
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FamilyServices;
