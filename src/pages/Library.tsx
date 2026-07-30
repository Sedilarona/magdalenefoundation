import { useState, useEffect, useRef } from "react";
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
  Upload,
  Grid,
  List,
  Loader2,
  Image as ImageIcon,
  Plus,
  Play,
  Trash2,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GitBranch, label: "Family Tree", href: "/family-tree" },
  { icon: BookHeart, label: "Our Tales", href: "/tales" },
  { icon: LibraryIcon, label: "Family Memories", href: "/library", active: true },
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
  const [items, setItems] = useState<Array<{ id: string; url: string; file_name: string; file_type: string; user_id: string; storage_path: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (selectedCategory) loadMedia(selectedCategory.id);
    else setItems([]);
  }, [selectedCategory]);

  const loadMedia = async (category: string) => {
    const { data } = await supabase
      .from("media_uploads")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });
    if (!data) return setItems([]);
    const enriched = await Promise.all(data.map(async (r: any) => {
      const { data: signed } = await supabase.storage.from("family-media").createSignedUrl(r.storage_path, 3600);
      return { id: r.id, url: signed?.signedUrl ?? "", file_name: r.file_name, file_type: r.file_type, user_id: r.user_id, storage_path: r.storage_path };
    }));
    setItems(enriched);
  };

  const onUpload = async (files: FileList | null) => {
    if (!files || !user || !selectedCategory) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = `${user.id}/${selectedCategory.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("family-media").upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        const { error: dbErr } = await supabase.from("media_uploads").insert({
          user_id: user.id,
          category: selectedCategory.id,
          storage_path: path,
          file_name: file.name,
          file_type: file.type || "application/octet-stream",
          file_size: file.size,
        });
        if (dbErr) throw dbErr;
      }
      toast({ title: "Uploaded", description: `${files.length} file(s) added to ${selectedCategory.title}.` });
      loadMedia(selectedCategory.id);
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message ?? "Try again.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeItem = async (id: string, storage_path: string, ownerId: string) => {
    if (!user || ownerId !== user.id) {
      toast({ title: "Not allowed", description: "You can only delete your own uploads.", variant: "destructive" });
      return;
    }
    await supabase.storage.from("family-media").remove([storage_path]);
    await supabase.from("media_uploads").delete().eq("id", id);
    setItems((it) => it.filter((i) => i.id !== id));
  };

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
                  {selectedCategory ? selectedCategory.title : "Family Memories"}
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
                    <h2 className="font-display text-2xl lg:text-3xl font-bold">Family Memories</h2>
                    <p className="text-primary-foreground/80">
                      Preserve and share our family's precious memories
                    </p>
                  </div>
                </div>

                <Button variant="secondary" className="gap-2" onClick={() => setSelectedCategory(photoCategories[photoCategories.length - 1])}>
                  <Upload className="w-4 h-4" />
                  Go to General Photos
                </Button>
              </motion.div>

              {/* Categories Grid */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Memory Collections
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

              {/* Upload */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => onUpload(e.target.files)}
              />
              <div className="flex justify-end mb-4">
                <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {uploading ? "Uploading..." : "Add Photos / Videos"}
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-16 bg-sage-50 rounded-2xl">
                  <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">No media yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Be the first to add photos or videos to {selectedCategory.title.toLowerCase()}.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((it) => (
                    <div key={it.id} className="relative group aspect-square rounded-xl overflow-hidden bg-sage-100 border border-sage-200">
                      {it.file_type.startsWith("video/") ? (
                        <>
                          <video src={it.url} controls className="w-full h-full object-cover" />
                          <Play className="absolute top-2 left-2 w-4 h-4 text-primary-foreground drop-shadow" />
                        </>
                      ) : (
                        <img src={it.url} alt={it.file_name} className="w-full h-full object-cover" />
                      )}
                      {user?.id === it.user_id && (
                        <button
                          onClick={() => removeItem(it.id, it.storage_path, it.user_id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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