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
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Cake,
  MapPin,
  Briefcase,
  Gift,
  Calendar,
  TrendingUp,
  Users,
  Heart,
  Loader2,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Sidebar navigation items
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GitBranch, label: "Family Tree", href: "/family-tree" },
  { icon: BookHeart, label: "Our Tales", href: "/tales" },
  { icon: Library, label: "Library", href: "/library" },
  { icon: Gamepad2, label: "Family Tricks", href: "/games" },
  { icon: FolderOpen, label: "Family Resources", href: "/resources" },
  { icon: Sparkles, label: "MAGGIE", href: "/maggie" },
];

// Mock announcements
const announcements = [
  {
    type: "birthday",
    icon: Cake,
    title: "Lerato's Birthday",
    description: "Turning 25 tomorrow!",
    date: "Tomorrow",
  },
  {
    type: "event",
    icon: Calendar,
    title: "Annual Family Reunion",
    description: "Planning meeting this Saturday",
    date: "Jan 20",
  },
  {
    type: "visit",
    icon: MapPin,
    title: "Uncle John visiting",
    description: "Arriving from Cape Town",
    date: "Jan 22",
  },
];

// Mock family stats
const familyStats = [
  { icon: Users, label: "Family Members", value: "156" },
  { icon: BookHeart, label: "Stories Shared", value: "89" },
  { icon: Heart, label: "Connections Made", value: "234" },
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const { user, profile, loading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
            {/* Sidebar Header */}
            <div className="p-6 border-b border-sidebar-border">
              <Logo size="md" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                        item.href === "/dashboard"
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

            {/* Sidebar Footer */}
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

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="font-display text-xl font-semibold text-foreground hidden sm:block">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-primary-foreground text-sm font-semibold">
                    {initials}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-foreground">
                    {displayName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-xl shadow-elevated overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-border">
                        <p className="font-medium text-foreground">{displayName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link
                          to="/contributions"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <TrendingUp className="w-4 h-4" />
                          My Contributions
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </div>
                      <div className="p-2 border-t border-border">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted rounded-lg transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Welcome back, {displayName.split(" ")[0]}!
            </h2>
            <p className="text-muted-foreground">
              Here's what's happening in your family circle today.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {familyStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-sage-100 shadow-card"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Announcements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 bg-card rounded-2xl border border-sage-100 shadow-card overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Announcements
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {announcements.map((announcement, index) => (
                  <motion.div
                    key={announcement.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-sage-50 rounded-xl hover:bg-sage-100 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <announcement.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">{announcement.title}</h4>
                      <p className="text-sm text-muted-foreground">{announcement.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {announcement.date}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 border-t border-border">
                <Button variant="ghost" className="w-full">
                  View All Announcements
                </Button>
              </div>
            </motion.div>

            {/* User Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card rounded-2xl border border-sage-100 shadow-card overflow-hidden"
            >
              <div className="bg-gradient-to-br from-sage-500 to-sage-600 p-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground text-2xl font-bold mb-3">
                  {initials}
                </div>
                <h3 className="font-display text-xl font-semibold text-primary-foreground">
                  {displayName}
                </h3>
                <p className="text-primary-foreground/70 text-sm">
                  {profile?.generation || "New Member"}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {profile?.location || "Location not set"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {profile?.occupation || "Occupation not set"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Gift className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {profile?.contribution_points || 0} points
                  </span>
                </div>

                <div className="pt-4 border-t border-border">
                  <Link to="/profile">
                    <Button variant="outline" className="w-full">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 bg-gradient-to-r from-sage-100 to-earth-100 rounded-2xl p-6 border border-sage-200"
          >
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: BookHeart, label: "Record a Story", href: "/tales/new" },
                { icon: GitBranch, label: "View Family Tree", href: "/family-tree" },
                { icon: Sparkles, label: "Ask MAGGIE", href: "/maggie" },
                { icon: Users, label: "View Members", href: "/members" },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl hover:shadow-soft transition-all hover:-translate-y-1"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <action.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground text-center">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
