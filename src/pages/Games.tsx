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
  Grid3X3,
  BookOpen,
  Users,
  Dices,
  Crown,
  Spade,
  Puzzle,
  ImageIcon,
  Loader2,
  Play,
  Lock,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GitBranch, label: "Family Tree", href: "/family-tree" },
  { icon: BookHeart, label: "Our Tales", href: "/tales" },
  { icon: Library, label: "Library", href: "/library" },
  { icon: Gamepad2, label: "Family Tricks", href: "/games", active: true },
  { icon: FolderOpen, label: "Family Resources", href: "/resources" },
  { icon: Sparkles, label: "MAGGIE", href: "/maggie" },
];

const games = [
  { id: "crossword", route: "/games/crossword", title: "Botswana Crossword", description: "Multi-level crossword with Setswana and family themes", icon: Grid3X3, color: "from-sage-500 to-sage-600", players: "1 Player", category: "Puzzle", available: true },
  { id: "word-search", route: "/games/word-search", title: "Word Search", description: "Find family and Setswana words hidden in the grid", icon: Grid3X3, color: "from-lime-500 to-lime-600", players: "1 Player", category: "Puzzle", available: true },
  { id: "memory-match", route: "/games/memory-match", title: "Memory Match", description: "Flip pairs of family symbols in as few moves as possible", icon: Puzzle, color: "from-fuchsia-500 to-fuchsia-600", players: "1 Player", category: "Puzzle", available: true },
  { id: "tic-tac-toe", route: "/games/tic-tac-toe", title: "Tic-Tac-Toe", description: "Classic two-player match", icon: Grid3X3, color: "from-indigo-500 to-indigo-600", players: "2 Players", category: "Board Game", available: true },
  { id: "bible-trivia", route: "/games/bible-trivia", title: "Bible Trivia", description: "Challenge yourself with questions from the Holy Bible", icon: BookOpen, color: "from-amber-500 to-amber-600", players: "1 Player", category: "Trivia", available: true },
  { id: "family-trivia", route: "/games/family-trivia", title: "Family Trivia", description: "How well do you know your family history and members?", icon: Users, color: "from-rose-500 to-rose-600", players: "1 Player", category: "Trivia", available: true },
  { id: "ludo", route: "/games/ludo", title: "Ludo", description: "Classic race to the finish", icon: Dices, color: "from-blue-500 to-blue-600", players: "2 Players", category: "Board Game", available: true },
  { id: "snakes-ladders", route: "/games/snakes-ladders", title: "Snakes & Ladders", description: "Climb the ladders, avoid the snakes!", icon: Dices, color: "from-emerald-500 to-emerald-600", players: "2 Players", category: "Board Game", available: true },
  { id: "chess", route: "/games/chess", title: "Chess", description: "The ultimate game of strategy and intellect", icon: Crown, color: "from-slate-600 to-slate-700", players: "2 Players", category: "Strategy", available: true },
  { id: "crazy-8", route: "/games/crazy-8", title: "Crazy 8", description: "Match cards and be the first to empty your hand", icon: Spade, color: "from-purple-500 to-purple-600", players: "vs AI", category: "Card Game", available: true },
  { id: "rummy", route: "/games/rummy", title: "Rummy", description: "Form sets and runs in this classic card game", icon: Spade, color: "from-red-500 to-red-600", players: "Solo", category: "Card Game", available: true },
  { id: "family-puzzle", route: "/games/family-puzzle", title: "Family Puzzle", description: "Slide the tiles to solve the classic 15-puzzle", icon: Puzzle, color: "from-teal-500 to-teal-600", players: "1 Player", category: "Puzzle", available: true },
];

const Games = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
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

  const categories = [...new Set(games.map((g) => g.category))];
  const filteredGames = selectedCategory
    ? games.filter((g) => g.category === selectedCategory)
    : games;

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
                <Link
                  to="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="font-display text-xl font-semibold text-foreground">
                  Family Tricks
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-sage-500 to-sage-600 rounded-2xl p-8 mb-8 text-primary-foreground"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-display text-2xl lg:text-3xl font-bold">Family Tricks</h2>
                <p className="text-primary-foreground/80">
                  Play games together and strengthen family bonds
                </p>
              </div>
            </div>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Games
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl border border-sage-100 shadow-card overflow-hidden hover:shadow-elevated transition-all hover:-translate-y-1 group"
              >
                {/* Game Header */}
                <div className={`bg-gradient-to-r ${game.color} p-6`}>
                  <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center mb-4">
                    <game.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-primary-foreground">
                    {game.title}
                  </h3>
                </div>

                {/* Game Details */}
                <div className="p-6">
                  <p className="text-muted-foreground mb-4">{game.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs bg-sage-100 text-sage-700 px-3 py-1 rounded-full">
                      {game.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{game.players}</span>
                  </div>

                  <Button 
                    className="w-full gap-2" 
                    variant={game.available ? "default" : "secondary"}
                    disabled={!game.available}
                    onClick={() => game.available && navigate(game.route)}
                  >
                    {game.available ? (
                      <>
                        <Play className="w-4 h-4" />
                        Play Now
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Coming Soon
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-sage-50 rounded-xl p-6 text-center"
          >
            <ImageIcon className="w-12 h-12 text-primary mx-auto mb-3" />
            <h4 className="font-display text-lg font-semibold text-foreground mb-2">
              More Games Coming Soon!
            </h4>
            <p className="text-muted-foreground">
              We're working on adding more exciting family games. Have a suggestion? Let us know!
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Games;