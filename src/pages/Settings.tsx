import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Palette, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, ACCENT_OPTIONS } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

const Settings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { mode, accent, toggleMode, setAccent } = useTheme();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 lg:px-8 h-16 max-w-3xl mx-auto">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Appearance */}
        <section className="bg-card rounded-2xl border border-sage-100 shadow-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Appearance</h2>
              <p className="text-sm text-muted-foreground">Customize how the app looks for you.</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-border">
            <div className="flex items-center gap-3">
              {mode === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <div>
                <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle a softer, night-friendly theme.</p>
              </div>
            </div>
            <Switch id="dark-mode" checked={mode === "dark"} onCheckedChange={toggleMode} />
          </div>

          <div className="pt-6">
            <Label className="text-base mb-3 block">Accent Color</Label>
            <p className="text-sm text-muted-foreground mb-4">Pick the color that flavors buttons, links and highlights.</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {ACCENT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setAccent(opt.key)}
                  className={`rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all hover:scale-105 ${
                    accent === opt.key ? "border-primary shadow-md" : "border-border"
                  }`}
                >
                  <span className="w-10 h-10 rounded-full" style={{ background: opt.swatch }} />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Settings;
