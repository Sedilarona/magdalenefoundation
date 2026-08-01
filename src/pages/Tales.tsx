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
  MapPin,
  Menu,
  X,
  Settings,
  ChevronDown,
  Book,
  Plus,
  Calendar,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TALE_CATEGORIES = ["History", "Lineage", "Family Origin", "Memory", "Wisdom", "General"];

// Sidebar navigation items
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GitBranch, label: "Family Tree", href: "/family-tree" },
  { icon: BookHeart, label: "Our Tales", href: "/tales" },
  { icon: Library, label: "Family Memories", href: "/library" },
  { icon: Gamepad2, label: "Family Tricks", href: "/games" },
  { icon: FolderOpen, label: "Family Resources", href: "/resources" },
  { icon: MapPin, label: "Locate Family", href: "/locate-family" },
  { icon: Sparkles, label: "MAGGIE", href: "/maggie" },
];

// Pre-populated tales
const defaultTales = [
  {
    id: "tale-1",
    title: "A Short Tale of Botswana",
    category: "History",
    content: `Long before borders were drawn and towns were named, the land that would one day be called Botswana was already alive with footsteps. The first were the San, who knew every hill, star, and waterhole, and the Khoi, who followed their cattle across the open plains. They lived with the land, not above it, and their stories were written in stone and song.

As time moved on, new people arrived from the north — farmers and iron workers who brought cattle, crops, and the language that would become Setswana. From these people rose great communities, each guided by a kgosi, each gathered by the fire of the kgotla, where every voice could be heard. Thus were born the Bakwena, Bangwato, Bangwaketse, Batawana, and many others.

The land knew troubled times. Wars and migrations swept across southern Africa, pushing people from place to place. Yet the people of this land endured. They traded with strangers, welcomed missionaries, and learned new ways, while holding firmly to their customs.

When powerful outsiders cast their eyes upon the land, three dikgosi — Khama, Sebele, and Bathoen — rose and spoke not with spears, but with wisdom. They crossed the great sea to protect their people, and so the land became a protectorate, spared the worst of conquest.

At last, in 1966, the people stood on their own. From a poor and quiet land, Botswana chose peace over conflict, dialogue over force. Diamonds were found beneath the soil, but it was good leadership, unity, and respect for tradition that turned stone into prosperity.

And so Botswana grew — a nation rooted in ancient footsteps, shaped by wise voices, and guided by the belief that a people who listen to one another will endure.`,
    createdAt: "Ancient History",
  },
  {
    id: "tale-2",
    title: "Genesis of Bangwato",
    category: "Lineage",
    content: `The Bangwato royal lineage traces its origins to Ngwato, believed to be a descendant of the Bakwena bagaMagopa royal house in the 16th century. Tradition links Ngwato, Kwena, and Ngwaketse as brothers or close relatives, symbolizing the shared ancestry of the Bangwato, Bakwena, and Bangwaketse. Ngwato later adopted the duiker (phuti) as the Bangwato totem, marking a distinct identity.

For many generations, Ngwato's descendants lived as subordinate rulers under the Bakwena. This continued until the reign of Mathiba, Moleta's son, whose rule marked a turning point. Mathiba became the first independent Bangwato ruler after being expelled from Bakwena territory by Kgosi Motswasele I, who had earlier mentored him.

Following the death of Mathiba's father, his uncle Mokgadi ruled as regent. Fearing for her son's life, Mathiba's mother placed him under Motswasele's care. Tensions grew, and Mathiba eventually killed Mokgadi to claim the Bangwato throne. Though suspected, Mathiba was protected by Motswasele, who provided him with an alibi.

Mathiba's rule was unstable, as Mokgadi's son Mongwe sought revenge. Mongwe manipulated tensions between the Bangwato and Bakwena, leading to serious conflict during Bakwena initiation ceremonies. The resulting clash ended in the defeat of the Bangwato by the Bakwena at Kope Hill. After this defeat, Mathiba led the Bangwato northwards, settling in the Shoshong Hill region, marking their final breakaway from the Bakwena.`,
    createdAt: "16th Century",
  },
  {
    id: "tale-3",
    title: "The House Poane",
    category: "Family Origin",
    content: `Long before the roads were cut into the earth and before seasons were counted by calendars, there lived a man who listened closely to the land. He knew the sky, the wind, and the soil beneath his feet. Of all the days in the year, there was one he loved above all others — the ninth day of September.

In Botswana, it was said that 09 September marked the true beginning of cultivation, the sacred day when the plough first kissed the soil and the promise of life was awakened. On this day, the land opened itself willingly, and those who worked it with patience and respect were rewarded with abundance.

This man cherished that day, for it gave him more than crops. It gave him dignity. It gave him the power to feed his family, to fill their granaries, and to harvest more than enough — enough to trade, enough to share, enough to build a future. To him, the ninth of September was not merely a date; it was hope made visible.

When a son was born to him, the man did not hesitate. He named the child Poane, in honour of that beloved day — a name meaning the Ninth of September. And because the child was born of the land, shaped by the promise of cultivation and continuity, he was called Poane Bodilenyane — Poane, child of the soil and the plough.

The elders say Poane Bodilenyane carried the spirit of that day within him. Wherever he walked, people believed the land would one day follow. His name reminded generations that prosperity begins with labour, that abundance is born from patience, and that a family, like the soil, flourishes when it is well tended.

And so, the house of Poane began — not with riches or crowns, but with a plough, a date, and a deep love for the land that feeds us all.`,
    createdAt: "Family Origin Story",
  },
  {
    id: "tale-4",
    title: "The Abraham Effect",
    category: "Wisdom",
    content: `"My dear children, if you want to understand, you must begin with one man: Abraham. Before there were churches, synagogues, or mosques, there was Abraham, a man who trusted God with all his heart. God called him to leave his homeland and promised him that he would become the father of many nations. God also promised that through Abraham's descendants, the whole world would be blessed. Now, Abraham was married to a woman named Sarah. They loved each other dearly, but for many years they could not have children. As they grew old, Sarah became worried that God's promise would never come true. So, according to the customs of that time, she gave her servant, Hagar, to Abraham so that Hagar could bear a child on her behalf. Hagar became pregnant and gave birth to a son named Ishmael. Abraham loved Ishmael very much because he was his firstborn son. God blessed Ishmael and promised that he too would become the father of a great nation. Muslims believe that Ishmael is one of their great ancestors. According to Islamic tradition, Abraham and Ishmael together rebuilt the Kaaba in Mecca, which today is the holiest place in Islam. Years later, when Abraham was nearly one hundred years old and Sarah was ninety, God fulfilled His original promise. Sarah gave birth to a son named Isaac. This was a miracle because they were far beyond the age when people normally have children. God told Abraham that His covenant—the special promise He had made—would continue through Isaac and his descendants. Isaac grew up and had two sons, Esau and Jacob. Although Esau was the older twin, God chose Jacob to continue the covenant. Later, God gave Jacob a new name: Israel. That is why he became known as Israel, and his twelve sons became the fathers of the twelve tribes of Israel. The Jewish people trace their ancestry through Abraham, Isaac, and Jacob, who became Israel. Many generations later, one of Jacob's descendants was King David. God promised David that one day a great King would come from his family line. Christians believe that Jesus Christ fulfilled that promise. Jesus was born into a Jewish family and lived as a Jew. He taught in Jewish synagogues and celebrated Jewish festivals. His first followers were also Jewish. This is why Christianity began within Judaism before spreading to people of every nation. Christians believe that Jesus is the promised Messiah, the Son of God, who came to save humanity. Because of this belief, Christianity grew into its own faith while still sharing the Scriptures and history of the Jewish people. About six hundred years after Jesus, the Prophet Muhammad was born in Arabia. Muslims believe that Muhammad was God's final prophet. Islam teaches that Abraham, Moses, David, Jesus, and many other biblical figures were all true prophets sent by God. Muslims honor Jesus as the Messiah but do not believe He is the Son of God or that He was crucified in the same way Christians believe. Instead, they believe Muhammad completed the message that earlier prophets had brought.

So you see, my dear children, these three great religions are like three branches growing from the same family tree. Judaism follows the family line of Abraham, Isaac, and Jacob. Christianity also comes through Abraham, Isaac, and Jacob, but believes Jesus is the promised Savior. Islam traces its spiritual heritage through Abraham and his son Ishmael and honors many of the same prophets found in the Bible.

Although they disagree on important matters especially about who Jesus is; they all look back to Abraham as a man of faith. That is why he is often called the father of faith by millions of people around the world.

Whenever you hear someone speak of Jews, Christians, or Muslims, remember that their stories begin with the same elderly man who trusted God enough to leave everything behind. His family grew into nations, and from those nations came religions that have shaped the history of the world."

                    Abraham
                   /       \\
              Sarah       Hagar
                |            |
             Isaac        Ishmael
                |
             Jacob (Israel)
      ┌─────────┴─────────┐
      │  Twelve Tribes    │
      │                   │
     Judaism         King David
                          |
                        Jesus
                          |
                    Christianity

Ishmael's descendants
          |
      Arab peoples
          |
      Prophet Muhammad
          |
         Islam`,
    createdAt: "Faith & Lineage",
  },
];


interface Tale {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
}

const TaleCard = ({ tale, onClick }: { tale: Tale; onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    className="bg-card rounded-2xl border border-sage-100 shadow-card overflow-hidden cursor-pointer hover:shadow-elevated transition-all"
    onClick={onClick}
  >
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center">
          <Book className="w-6 h-6 text-primary" />
        </div>
        <span className="px-3 py-1 bg-sage-50 text-sage-700 text-xs font-medium rounded-full">
          {tale.category}
        </span>
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
        {tale.title}
      </h3>
      <p className="text-muted-foreground text-sm line-clamp-3">
        {tale.content.substring(0, 150)}...
      </p>
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <Calendar className="w-3 h-3" />
        <span>{tale.createdAt}</span>
      </div>
    </div>
  </motion.div>
);

const TaleModal = ({ tale, onClose }: { tale: Tale | null; onClose: () => void }) => {
  if (!tale) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-card rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-3 py-1 bg-sage-100 text-sage-700 text-xs font-medium rounded-full">
                {tale.category}
              </span>
              <h2 className="font-display text-2xl font-bold text-foreground mt-3">
                {tale.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="prose prose-sage max-w-none">
            {tale.content.split("\n\n").map((paragraph, index) => {
              const isDiagram = /[│┌┴─]|\/\s+\\/.test(paragraph);
              return isDiagram ? (
                <pre
                  key={index}
                  className="text-foreground text-xs sm:text-sm leading-snug mb-4 overflow-x-auto font-mono bg-sage-50/60 rounded-lg p-4"
                >
                  {paragraph}
                </pre>
              ) : (
                <p key={index} className="text-foreground leading-relaxed mb-4 whitespace-pre-line">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
        <div className="p-4 border-t border-border bg-sage-50/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{tale.createdAt}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Tales = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTale, setSelectedTale] = useState<Tale | null>(null);
  const [tales, setTales] = useState<Tale[]>(defaultTales);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Memory", content: "" });
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadTales = async () => {
    const { data } = await supabase
      .from("tales")
      .select("id, title, category, content, created_at")
      .order("created_at", { ascending: false });
    const saved: Tale[] = (data ?? []).map((t: any) => ({
      id: t.id,
      title: t.title,
      category: t.category ?? "General",
      content: t.content,
      createdAt: new Date(t.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }));
    setTales([...saved, ...defaultTales]);
  };

  useEffect(() => {
    if (user) loadTales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const saveTale = async () => {
    if (!user) return;
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Add a title and your story", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("tales").insert({
      user_id: user.id,
      title: form.title.trim(),
      category: form.category,
      content: form.content.trim(),
      is_published: true,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Could not save your tale", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Tale recorded", description: "Thank you for preserving our history." });
    setForm({ title: "", category: "Memory", content: "" });
    setAddOpen(false);
    loadTales();
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null;
  }

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
                        item.href === "/tales"
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
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="font-display text-xl font-semibold text-foreground">
                Our Tales
              </h1>
            </div>
            <Button className="gap-2" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Tale</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center max-w-2xl mx-auto"
          >
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Stories That Bind Us
            </h2>
            <p className="text-muted-foreground">
              Every family has a story. These tales preserve our history, honor our ancestors, 
              and pass wisdom to future generations. Read, remember, and share.
            </p>
          </motion.div>

          {/* Tales Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tales.map((tale, index) => (
              <motion.div
                key={tale.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TaleCard tale={tale} onClick={() => setSelectedTale(tale)} />
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      {/* Add Tale Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Record a Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tale-title">Title</Label>
              <Input
                id="tale-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. The day we gathered at Serowe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tale-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger id="tale-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TALE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tale-content">Your story</Label>
              <Textarea
                id="tale-content"
                rows={10}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Tell it the way you would tell it around the fire..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={saveTale} disabled={saving}>
              {saving ? "Saving..." : "Save Tale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tale Modal */}
      <AnimatePresence>
        {selectedTale && (
          <TaleModal tale={selectedTale} onClose={() => setSelectedTale(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tales;