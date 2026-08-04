import { useEffect, useRef, useState } from "react";
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
  Wrench,
  MapPin,
  Menu,
  X,
  Settings,
  ArrowLeft,
  Loader2,
  Search,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GitBranch, label: "Family Tree", href: "/family-tree" },
  { icon: BookHeart, label: "Our Tales", href: "/tales" },
  { icon: Library, label: "Family Memories", href: "/library" },
  { icon: Gamepad2, label: "Family Tricks", href: "/games" },
  { icon: FolderOpen, label: "Family Resources", href: "/resources" },
  { icon: MapPin, label: "Locate Family", href: "/locate-family", active: true },
  { icon: Wrench, label: "Family Services", href: "/family-services" },
  { icon: Sparkles, label: "MAGGIE", href: "/maggie" },
];

export interface FamilyPlace {
  place: string;
  area: string;
  lat: number;
  lng: number;
  people: string[];
}

export const familyPlaces: FamilyPlace[] = [
  {
    place: "Kopong",
    area: "Kopong West",
    lat: -24.4667,
    lng: 25.8667,
    people: ["Tshepho Poane", "Oitse Poane", "Mooketsi Poane"],
  },
  {
    place: "Palapye",
    area: "Kediretswe Ward",
    lat: -22.5462,
    lng: 27.1247,
    people: ["Lawrence Bodilenyane & wife"],
  },
  {
    place: "Palapye",
    area: "Extension 8",
    lat: -22.5551,
    lng: 27.1339,
    people: ["Grace Poane", "Mopati Moupo"],
  },
  {
    place: "Palapye",
    area: "Boikago Ward",
    lat: -22.5389,
    lng: 27.1156,
    people: ["Donald Poane & family"],
  },
  {
    place: "Palapye",
    area: "Palapye",
    lat: -22.5620,
    lng: 27.1420,
    people: ["Gontse Bodilenyane"],
  },
  {
    place: "Gaborone",
    area: "Block 5",
    lat: -24.6295,
    lng: 25.9305,
    people: ["Olefile Poane", "Gaone Poane", "Maipelo Kebitseng & family"],
  },
  {
    place: "Gaborone",
    area: "Block 8",
    lat: -24.6478,
    lng: 25.9498,
    people: ["Thuso Hetanang & family"],
  },
  {
    place: "Gaborone",
    area: "Block 9",
    lat: -24.6561,
    lng: 25.9372,
    people: ["Lebone Jansen", "Tumisang Poane & family"],
  },
  {
    place: "Gaborone",
    area: "Broadhurst",
    lat: -24.6301,
    lng: 25.9412,
    people: ["Oankgoga Poane"],
  },
  {
    place: "Otse",
    area: "Otse village",
    lat: -25.0167,
    lng: 25.7500,
    people: ["Keamogetse Jansen", "Patrick Jansen", "Leatile D. (Danny) Jansen"],
  },
  {
    place: "Mmathubudukwane",
    area: "Mmathubudukwane village",
    lat: -24.6167,
    lng: 26.4500,
    people: ["Thomamiso Kgafela & husband", "Lesego Kgafela"],
  },
  {
    place: "Tonota",
    area: "Tonota village",
    lat: -21.4400,
    lng: 27.4667,
    people: ["Seabe Hetanang", "Ogomoditse Hetanang", "Kago Hetanang"],
  },
  {
    place: "Francistown",
    area: "Francistown",
    lat: -21.1700,
    lng: 27.5100,
    people: ["Obakeng Motladiile & family"],
  },
  {
    place: "Bokaa",
    area: "Bokaa village",
    lat: -24.4333,
    lng: 26.0333,
    people: ["Mpho Gabegwe & family"],
  },
  {
    place: "Mmopane",
    area: "Block 1",
    lat: -24.5667,
    lng: 25.8333,
    people: ["Lesego Phatshimo & family"],
  },
  {
    place: "Tloaneng",
    area: "Tloaneng",
    lat: -24.3500,
    lng: 26.0500,
    people: ["Kealeboga Poane & family"],
  },
];

declare global {
  interface Window {
    initFamilyMap?: () => void;
    google?: any;
  }
}

const LocateFamily = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [openPlace, setOpenPlace] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [livePlaces, setLivePlaces] = useState<FamilyPlace[]>(familyPlaces);
  const mapDiv = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Keep the list in sync with locations members set on their profiles
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("profiles").select("full_name, location");
      if (!data) return;
      const next = familyPlaces.map((p) => ({ ...p, people: [...p.people] }));
      data.forEach((p: any) => {
        const loc = (p.location ?? "").trim();
        if (!loc || !p.full_name) return;
        const match = next.find(
          (e) =>
            loc.toLowerCase().includes(e.place.toLowerCase()) ||
            loc.toLowerCase().includes(e.area.toLowerCase()),
        );
        if (match) {
          if (!match.people.some((n) => n.toLowerCase().includes(p.full_name.toLowerCase()))) {
            match.people.push(p.full_name);
          }
        } else {
          const existing = next.find((e) => e.place.toLowerCase() === loc.toLowerCase());
          if (existing) {
            if (!existing.people.includes(p.full_name)) existing.people.push(p.full_name);
          } else {
            next.push({ place: loc, area: loc, lat: -24.6282, lng: 25.9231, people: [p.full_name] });
          }
        }
      });
      setLivePlaces(next);
    };
    load();
  }, [user]);


  // Load Google Maps JS API
  useEffect(() => {
    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
    if (!key) {
      setMapError("Map key is not configured yet.");
      return;
    }
    if (window.google?.maps) {
      setMapReady(true);
      return;
    }
    window.initFamilyMap = () => setMapReady(true);
    const existing = document.getElementById("gmaps-script");
    if (existing) return;
    const script = document.createElement("script");
    script.id = "gmaps-script";
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=initFamilyMap${
      channel ? `&channel=${channel}` : ""
    }`;
    script.onerror = () => setMapError("Could not load the map right now.");
    document.head.appendChild(script);
  }, []);

  // Init map + markers
  useEffect(() => {
    if (!mapReady || !mapDiv.current || !window.google?.maps) return;
    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapDiv.current, {
        center: { lat: -23.5, lng: 26.3 },
        zoom: 6,
        mapTypeControl: false,
        streetViewControl: false,
      });
    }
    const info = new window.google.maps.InfoWindow();
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = livePlaces.map((p) => {
      const marker = new window.google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapRef.current,
        title: `${p.place} — ${p.area}`,
      });
      marker.addListener("click", () => {
        info.setContent(
          `<div style="font-family:inherit;max-width:220px">
            <strong>${p.place} — ${p.area}</strong>
            <div style="margin-top:4px;font-size:12px">${p.people.join("<br/>")}</div>
          </div>`
        );
        info.open(mapRef.current, marker);
      });
      return marker;
    });
  }, [mapReady, livePlaces]);

  const focusPlace = (p: FamilyPlace) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat: p.lat, lng: p.lng });
      mapRef.current.setZoom(13);
      mapDiv.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  const byPlace = Array.from(
    livePlaces.reduce((map, p) => {
      const entry = map.get(p.place) ?? { place: p.place, areas: [] as { area: string; people: string[]; entry: FamilyPlace }[], count: 0 };
      entry.areas.push({ area: p.area, people: p.people, entry: p });
      entry.count += p.people.length;
      map.set(p.place, entry);
      return map;
    }, new Map<string, { place: string; areas: { area: string; people: string[]; entry: FamilyPlace }[]; count: number }>()).values()
  ).sort((a, b) => a.place.localeCompare(b.place));

  const filtered = livePlaces.filter((p) => {
    const q = query.toLowerCase();
    return (
      !q ||
      p.place.toLowerCase().includes(q) ||
      p.area.toLowerCase().includes(q) ||
      p.people.some((n) => n.toLowerCase().includes(q))
    );
  });

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
            <h1 className="font-display text-xl font-semibold text-foreground">Locate Family</h1>
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
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Where our family lives</h2>
                <p className="text-primary-foreground/80 text-sm">
                  Cities, villages and wards across Botswana where the family is rooted.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="rounded-2xl overflow-hidden border border-border shadow-card bg-card">
            {mapError ? (
              <div className="h-[380px] flex flex-col items-center justify-center text-center p-6">
                <MapPin className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">{mapError}</p>
              </div>
            ) : (
              <div ref={mapDiv} className="w-full h-[420px]">
                {!mapReady && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search a name, village or ward..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Tap a village or town to see who lives there.
            </p>
            <div className="flex flex-wrap gap-2">
              {byPlace.map(({ place, count }) => {
                const open = openPlace === place;
                return (
                  <button
                    key={place}
                    onClick={() => setOpenPlace(open ? null : place)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors ${
                      open
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    {place}
                    <span className="text-xs opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {openPlace && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground">{openPlace}</h3>
                <button
                  onClick={() => setOpenPlace(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>
              {byPlace
                .find((b) => b.place === openPlace)
                ?.areas.map((a) => (
                  <div key={a.area}>
                    <button
                      onClick={() => focusPlace(a.entry)}
                      className="text-xs font-medium text-primary underline"
                    >
                      {a.area} — show on map
                    </button>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-0.5">
                      {a.people.map((n) => (
                        <li key={n}>• {n}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}

          {query.trim() && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Search results</p>
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground">No match found.</p>
              )}
              {filtered.map((p) => (
                <button
                  key={`${p.place}-${p.area}`}
                  onClick={() => focusPlace(p)}
                  className="block w-full text-left py-2 border-b border-border last:border-0"
                >
                  <span className="font-medium text-foreground text-sm">
                    {p.place} — {p.area}
                  </span>
                  <span className="block text-xs text-muted-foreground">{p.people.join(", ")}</span>
                </button>
              ))}
            </div>
          )}

          <div className="bg-muted/50 rounded-xl p-6 border border-border">
            <h4 className="font-display font-semibold text-foreground mb-1">Pin your own location</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Add your exact city, village or ward on your profile so family can find you on this map.
            </p>
            <Link to="/profile">
              <Button size="sm" variant="outline" className="gap-2">
                <MapPin className="w-4 h-4" />
                Update my location
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LocateFamily;
