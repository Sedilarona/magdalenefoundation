import { useEffect, useRef, useState } from "react";
import { Loader2, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/** Strip markdown / tree blocks so narration reads naturally. */
const clean = (t: string) =>
  t
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/[*#_>`|═└├─│]/g, " ")
    .replace(/\s+\n/g, "\n")
    .trim();

/** Split at sentence boundaries into chunks under ~1500 chars. */
const chunk = (t: string, max = 1500) => {
  const sentences = t.match(/[^.!?\n]+[.!?]*\s*|\n+/g) ?? [t];
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + s).length > max && cur.trim()) { out.push(cur.trim()); cur = ""; }
    if (s.length > max) { for (let i = 0; i < s.length; i += max) out.push(s.slice(i, i + max)); continue; }
    cur += s;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};

const fetchAudio = async (text: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/narrate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${session?.access_token ?? ""}`,
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error((await res.text()) || `Narration failed (${res.status})`);
  return URL.createObjectURL(await res.blob());
};

export const NarrateButton = ({ text, label = "Listen", size = "sm" }: { text: string; label?: string; size?: "sm" | "icon" }) => {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const stopRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const stop = () => {
    stopRef.current = true;
    audioRef.current?.pause();
    setState("idle");
  };
  useEffect(() => () => { stopRef.current = true; audioRef.current?.pause(); }, []);

  const play = async () => {
    stopRef.current = false;
    setState("loading");
    try {
      const parts = chunk(clean(text));
      let next = fetchAudio(parts[0]);
      for (let i = 0; i < parts.length; i++) {
        const url = await next;
        if (stopRef.current) return;
        if (i + 1 < parts.length) next = fetchAudio(parts[i + 1]); // prefetch, played in order
        const audio = new Audio(url);
        audioRef.current = audio;
        setState("playing");
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve();
          audio.onpause = () => resolve();
          audio.onerror = () => reject(new Error("Could not play audio"));
          audio.play().catch(reject);
        });
        URL.revokeObjectURL(url);
        if (stopRef.current) return;
      }
      setState("idle");
    } catch (e) {
      setState("idle");
      if (!stopRef.current) toast({ title: "Narration unavailable", description: e instanceof Error ? e.message.slice(0, 160) : undefined, variant: "destructive" });
    }
  };

  const busy = state !== "idle";
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={busy ? stop : play}
      aria-label={busy ? "Stop narration" : "Listen to narration"}
      className="gap-2"
    >
      {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "playing" ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      {size !== "icon" && (state === "loading" ? "Preparing…" : state === "playing" ? "Stop" : label)}
    </Button>
  );
};

export default NarrateButton;
