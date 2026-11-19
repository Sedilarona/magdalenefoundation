import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Accent = "sage" | "royal" | "sunset" | "ocean" | "rose";

interface ThemeContextType {
  mode: "dark";
  accent: Accent;
  setAccent: (a: Accent) => void;
}

const ACCENTS: Record<Accent, { primary: string; ring: string; accent: string }> = {
  sage:   { primary: "145 35% 42%", ring: "145 35% 42%", accent: "155 45% 28%" },
  royal:  { primary: "250 55% 55%", ring: "250 55% 55%", accent: "260 50% 35%" },
  sunset: { primary: "18 85% 55%",  ring: "18 85% 55%",  accent: "10 70% 40%"  },
  ocean:  { primary: "200 75% 45%", ring: "200 75% 45%", accent: "210 65% 30%" },
  rose:   { primary: "340 65% 55%", ring: "340 65% 55%", accent: "345 55% 38%" },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<Accent>(() => (localStorage.getItem("mf-theme-accent") as Accent) || "sage");

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
    localStorage.setItem("mf-theme-mode", "dark");
  }, []);

  useEffect(() => {
    const a = ACCENTS[accent];
    const root = document.documentElement;
    root.style.setProperty("--primary", a.primary);
    root.style.setProperty("--ring", a.ring);
    root.style.setProperty("--accent", a.accent);
    root.style.setProperty("--sidebar-primary", a.primary);
    root.style.setProperty("--sidebar-ring", a.ring);
    localStorage.setItem("mf-theme-accent", accent);
  }, [accent]);

  return (
    <ThemeContext.Provider value={{
      mode: "dark", accent,
      setAccent: setAccentState,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export const ACCENT_OPTIONS: { key: Accent; label: string; swatch: string }[] = [
  { key: "sage",   label: "Sage Green",  swatch: "hsl(145 35% 42%)" },
  { key: "royal",  label: "Royal Purple", swatch: "hsl(250 55% 55%)" },
  { key: "sunset", label: "Sunset Amber", swatch: "hsl(18 85% 55%)" },
  { key: "ocean",  label: "Ocean Blue",  swatch: "hsl(200 75% 45%)" },
  { key: "rose",   label: "Rose Petal",  swatch: "hsl(340 65% 55%)" },
];
