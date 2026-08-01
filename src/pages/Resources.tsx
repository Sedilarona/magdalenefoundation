import { useState, useEffect } from "react";
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
  Menu,
  X,
  Settings,
  ArrowLeft,
  Book,
  Music,
  FileText,
  Download,
  ExternalLink,
  Loader2,
  Search,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GitBranch, label: "Family Tree", href: "/family-tree" },
  { icon: BookHeart, label: "Our Tales", href: "/tales" },
  { icon: Library, label: "Family Memories", href: "/library" },
  { icon: Gamepad2, label: "Family Tricks", href: "/games" },
  { icon: FolderOpen, label: "Family Resources", href: "/resources", active: true },
  { icon: MapPin, label: "Locate Family", href: "/locate-family" },
  { icon: Sparkles, label: "MAGGIE", href: "/maggie" },
];

interface Resource {
  id: string;
  title: string;
  description: string;
  category: "hymns" | "scripture" | "faith";
  icon: typeof Book;
  language: string;
  available: boolean;
  externalUrl?: string;
  hasHymns?: boolean;
  hasScripture?: boolean;
}

interface ScriptureContent {
  id: string;
  book_id: string;
  chapter_number: number | null;
  content: string;
  section_title: string | null;
}

interface Hymn {
  id: string;
  hymn_number: number;
  title: string;
  lyrics: string;
  author: string | null;
}

const resources: Resource[] = [
  {
    id: "difela-sione",
    title: "Difela tsa Sione",
    description: "A sacred collection of Zion hymns sung in Setswana congregations",
    category: "hymns",
    icon: Music,
    language: "Setswana",
    available: true,
    hasHymns: true,
  },
  {
    id: "difela-roma",
    title: "Difela tsa Roma",
    description: "Roman Catholic hymns in Setswana for worship and devotion. Browse the full collection at catholichymns.co.za",
    category: "hymns",
    icon: Music,
    language: "Setswana",
    available: false,
    externalUrl: "https://catholichymns.co.za/",
  },
  {
    id: "difela-lontone",
    title: "Difela tsa Lontone",
    description: "London Missionary Society hymns translated into Setswana",
    category: "hymns",
    icon: Music,
    language: "Setswana",
    available: false,
  },
  {
    id: "niv-bible",
    title: "NIV Bible",
    description: "The New International Version of the Holy Bible",
    category: "scripture",
    icon: Book,
    language: "English",
    available: false,
  },
  {
    id: "kjv",
    title: "KJV Bible",
    description: "The King James Version of the Holy Bible",
    category: "scripture",
    icon: Book,
    language: "English",
    available: true,
    hasScripture: true,
  },
  {
    id: "quran",
    title: "The Holy Quran",
    description: "The central religious text of Islam with English translation",
    category: "scripture",
    icon: Book,
    language: "Arabic/English",
    available: true,
    hasScripture: true,
  },
];

const categoryLabels = {
  hymns: "Hymn Books",
  scripture: "Holy Scriptures",
  faith: "Faith Materials",
};

const Resources = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  const [loadingHymns, setLoadingHymns] = useState(false);
  const [scriptures, setScriptures] = useState<ScriptureContent[]>([]);
  const [selectedScripture, setSelectedScripture] = useState<ScriptureContent | null>(null);
  const [loadingScriptures, setLoadingScriptures] = useState(false);
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (selectedResource?.hasHymns) {
      loadHymns();
    }
    if (selectedResource?.hasScripture) {
      loadScriptures(selectedResource.id);
    }
  }, [selectedResource]);

  const loadHymns = async () => {
    setLoadingHymns(true);
    const { data, error } = await supabase
      .from("hymns")
      .select("*")
      .eq("hymn_book", "difela_tsa_sione")
      .order("hymn_number", { ascending: true });
    
    if (!error && data) {
      setHymns(data);
    }
    setLoadingHymns(false);
  };

  const loadScriptures = async (bookId: string) => {
    setLoadingScriptures(true);
    const { data, error } = await supabase
      .from("scripture_content")
      .select("*")
      .eq("book_id", bookId)
      .order("section_title", { ascending: true, nullsFirst: false })
      .order("chapter_number", { ascending: true })
      .limit(2000);

    if (!error && data) {
      // Alphabetical by book name (section_title contains e.g. "Genesis 1")
      const sorted = [...data].sort((a: any, b: any) => {
        const na = (a.section_title || "").replace(/\s+\d+.*$/, "").toLowerCase();
        const nb = (b.section_title || "").replace(/\s+\d+.*$/, "").toLowerCase();
        if (na !== nb) return na.localeCompare(nb);
        return (a.chapter_number ?? 0) - (b.chapter_number ?? 0);
      });
      setScriptures(sorted as ScriptureContent[]);
    }
    setLoadingScriptures(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const categories = [...new Set(resources.map((r) => r.category))];
  
  const filteredResources = resources.filter((resource) => {
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredHymns = hymns.filter((hymn) => 
    !searchQuery || 
    hymn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hymn.hymn_number.toString().includes(searchQuery)
  );

  const filteredScriptures = scriptures.filter((scripture) =>
    !searchQuery ||
    scripture.section_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scripture.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
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
                        item.active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : ""
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
        <div
          className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2">
                {(selectedResource || selectedHymn || selectedScripture) ? (
                  <button
                    onClick={() => {
                      if (selectedHymn) {
                        setSelectedHymn(null);
                      } else if (selectedScripture) {
                        setSelectedScripture(null);
                      } else {
                        setSelectedResource(null);
                        setHymns([]);
                        setScriptures([]);
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <Link
                    to="/dashboard"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                )}
                <h1 className="font-display text-xl font-semibold text-foreground">
                  {selectedHymn ? `Hymn ${selectedHymn.hymn_number}` : 
                   selectedScripture ? selectedScripture.section_title :
                   selectedResource ? selectedResource.title : "Family Resources"}
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {selectedHymn ? (
            /* Individual Hymn View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-card rounded-2xl border border-sage-100 shadow-card overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-primary-foreground">
                  <span className="text-sm opacity-80">Hymn #{selectedHymn.hymn_number}</span>
                  <h2 className="font-display text-2xl font-bold mt-1">{selectedHymn.title}</h2>
                  {selectedHymn.author && (
                    <p className="text-sm mt-2 opacity-80">by {selectedHymn.author}</p>
                  )}
                </div>
                <div className="p-6">
                  <div className="whitespace-pre-line text-foreground leading-relaxed text-lg">
                    {selectedHymn.lyrics}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : selectedScripture ? (
            /* Individual Scripture View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-card rounded-2xl border border-sage-100 shadow-card overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-primary-foreground">
                  <span className="text-sm opacity-80">
                    {selectedResource?.title} - Chapter {selectedScripture.chapter_number}
                  </span>
                  <h2 className="font-display text-2xl font-bold mt-1">{selectedScripture.section_title}</h2>
                </div>
                <div className="p-6">
                  <div className="whitespace-pre-line text-foreground leading-relaxed text-lg">
                    {selectedScripture.content}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : selectedResource?.hasScripture ? (
            /* Scripture List View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Search */}
              <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search chapters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {loadingScriptures ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredScriptures.map((scripture) => (
                    <motion.button
                      key={scripture.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedScripture(scripture)}
                      className="w-full text-left bg-card rounded-xl border border-sage-100 p-4 hover:shadow-soft hover:border-sage-200 transition-all flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Book className="w-6 h-6 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-foreground truncate">
                          {scripture.section_title || `Chapter ${scripture.chapter_number}`}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {scripture.content.slice(0, 100)}...
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </motion.button>
                  ))}
                </div>
              )}

              {!loadingScriptures && filteredScriptures.length === 0 && (
                <div className="text-center py-12">
                  <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    No chapters found
                  </h3>
                  <p className="text-muted-foreground">
                    Try a different search term
                  </p>
                </div>
              )}
            </motion.div>
          ) : selectedResource?.hasHymns ? (
            /* Hymn List View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Search */}
              <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search hymns by number or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {loadingHymns ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredHymns.map((hymn) => (
                    <motion.button
                      key={hymn.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedHymn(hymn)}
                      className="w-full text-left bg-card rounded-xl border border-sage-100 p-4 hover:shadow-soft hover:border-sage-200 transition-all flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-amber-700">{hymn.hymn_number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-foreground truncate">
                          {hymn.title}
                        </h3>
                        {hymn.author && (
                          <p className="text-sm text-muted-foreground">by {hymn.author}</p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </motion.button>
                  ))}
                </div>
              )}

              {!loadingHymns && filteredHymns.length === 0 && (
                <div className="text-center py-12">
                  <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    No hymns found
                  </h3>
                  <p className="text-muted-foreground">
                    Try a different search term
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            /* Resource List View */
            <>
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-8 mb-8 text-primary-foreground"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                    <FolderOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl lg:text-3xl font-bold">Family Resources</h2>
                    <p className="text-primary-foreground/80">
                      Sacred texts, hymn books, and faith materials for our family
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {categoryLabels[category]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Resources Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-2xl border border-sage-100 shadow-card overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <resource.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                            {resource.title}
                          </h3>
                          <span className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-full">
                            {resource.language}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-4">
                        {resource.description}
                      </p>

                      <div className="flex gap-2">
                        {!resource.available && resource.externalUrl ? (
                          <a
                            href={resource.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button variant="outline" size="sm" className="w-full gap-2">
                              <ExternalLink className="w-4 h-4" />
                              Open catholichymns.co.za
                            </Button>
                          </a>
                        ) : resource.available ? (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1 gap-2"
                            onClick={() => setSelectedResource(resource)}
                          >
                            <ExternalLink className="w-4 h-4" />
                            {resource.hasHymns ? "View Hymns" : resource.hasScripture ? "Read Scripture" : "Read Online"}
                          </Button>
                        ) : (
                          <div className="w-full text-center py-2 text-sm text-muted-foreground bg-sage-50 rounded-lg">
                            📄 PDF upload pending
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Empty State */}
              {filteredResources.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    No resources found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}

              {/* Upload Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 bg-earth-50 rounded-xl p-6 border border-earth-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-foreground mb-1">
                      Contribute Resources
                    </h4>
                    <p className="text-muted-foreground text-sm mb-3">
                      Help grow our family library by uploading hymn books, scriptures, or other 
                      faith materials. Contact a family administrator to add new resources.
                    </p>
                    <Button variant="outline" size="sm">
                      Request Upload Access
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Resources;