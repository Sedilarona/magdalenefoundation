import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  BookHeart,
  Library as LibraryIcon,
  Gamepad2,
  FolderOpen,
  Sparkles,
  Menu,
  X,
  Settings,
  ArrowLeft,
  Camera,
  Heart,
  PartyPopper,
  Church,
  Users,
  Baby,
  GraduationCap,
  Cake,
  Upload,
  Grid,
  List,
  Loader2,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GitBranch, label: "Family Tree", href: "/family-tree" },
  { icon: BookHeart, label: "Our Tales", href: "/tales" },
  { icon: LibraryIcon, label: "Library", href: "/library", active: true },
  { icon: Gamepad2, label: "Family Tricks", href: "/games" },
  { icon: FolderOpen, label: "Family Resources", href: "/resources" },
  { icon: Sparkles, label: "MAGGIE", href: "/maggie" },
];

interface PhotoCategory {
  id: string;
  title: string;
  description: string;
  icon: typeof Camera;
  color: string;
  count: number;
}

const photoCategories: PhotoCategory[] = [
  {
    id: "weddings",
    title: "Weddings",
    description: "Celebrations of love and union",
    icon: Heart,
    color: "from-rose-400 to-rose-500",
    count: 0,
  },
  {
    id: "funerals",
    title: "Funerals",
    description: "Honoring those who have passed",
    icon: Church,
    color: "from-slate-500 to-slate-600",
    count: 0,
  },
  {
    id: "parties",
    title: "Parties & Celebrations",
    description: "Birthdays, anniversaries, and gatherings",
    icon: PartyPopper,
    color: "from-amber-400 to-amber-500",
    count: 0,
  },
  {
    id: "reunions",
    title: "Family Reunions",
    description: "Coming together as one family",
    icon: Users,
    color: "from-sage-500 to-sage-600",
    count: 0,
  },
  {
    id: "births",
    title: "New Arrivals",
    description: "Welcoming new family members",
    icon: Baby,
    color: "from-sky-400 to-sky-500",
    count: 0,
  },
  {
    id: "graduations",
    title: "Graduations",
    description: "Academic achievements and milestones",
    icon: GraduationCap,
    color: "from-purple-400 to-purple-500",
    count: 0,
  },
  {
    id: "birthdays",
    title: "Birthdays",
    description: "Celebrating another year of life",
    icon: Cake,
    color: "from-pink-400 to-pink-500",
    count: 0,
  },
  {
    id: "general",
    title: "General Photos",
    description: "Everyday moments and memories",
    icon: Camera,
    color: "from-teal-400 to-teal-500",
    count: 0,
  },
];

const Library = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory | null>(null);
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

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
                {selectedCategory ? (
                  <button
                    onClick={() => setSelectedCategory(null)}
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
                  {selectedCategory ? selectedCategory.title : "Photo Library"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {!selectedCategory ? (
            <>
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 mb-8 text-primary-foreground"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl lg:text-3xl font-bold">Photo Library</h2>
                    <p className="text-primary-foreground/80">
                      Preserve and share our family's precious memories
                    </p>
                  </div>
                </div>

                <Button variant="secondary" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Photos
                </Button>
              </motion.div>

              {/* Categories Grid */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Photo Categories
              </h3>
              
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                {photoCategories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`text-left bg-card rounded-2xl border border-sage-100 shadow-card overflow-hidden hover:shadow-elevated transition-all hover:-translate-y-1 ${
                      viewMode === "list" ? "flex items-center" : ""
                    }`}
                  >
                    <div className={`bg-gradient-to-r ${category.color} ${
                      viewMode === "grid" ? "p-6" : "p-4 w-24 h-24 flex items-center justify-center"
                    }`}>
                      <category.icon className={`text-primary-foreground ${
                        viewMode === "grid" ? "w-10 h-10" : "w-8 h-8"
                      }`} />
                    </div>
                    <div className={viewMode === "grid" ? "p-4" : "p-4 flex-1"}>
                      <h4 className="font-display font-semibold text-foreground">
                        {category.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {category.count} photos
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            /* Category Photos View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Category Header */}
              <div className={`bg-gradient-to-r ${selectedCategory.color} rounded-2xl p-6 mb-6`}>
                <div className="flex items-center gap-4">
                  <selectedCategory.icon className="w-10 h-10 text-primary-foreground" />
                  <div>
                    <h2 className="font-display text-2xl font-bold text-primary-foreground">
                      {selectedCategory.title}
                    </h2>
                    <p className="text-primary-foreground/80">
                      {selectedCategory.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Empty State */}
              <div className="text-center py-16 bg-sage-50 rounded-2xl">
                <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  No photos yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Be the first to add photos to {selectedCategory.title.toLowerCase()}. 
                  Share your memories with the family!
                </p>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Photos
                </Button>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          {!selectedCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: "Total Photos", value: "0" },
                { label: "Categories", value: photoCategories.length.toString() },
                { label: "Contributors", value: "0" },
                { label: "This Month", value: "0" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card rounded-xl p-4 border border-sage-100 text-center"
                >
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Library;