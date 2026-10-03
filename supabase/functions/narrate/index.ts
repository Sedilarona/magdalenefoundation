import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VOICE_INSTRUCTIONS =
  "You are an elderly grandmother in her eighties: warm, wise, gentle and loving. Speak slowly and calmly, with soft pauses, like telling a story by the fire. Use a clear, neutral international English accent with no regional accent.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const json = (b: unknown, status: number) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return json({ error: "Please sign in" }, 401);

    const { text } = await req.json();
    if (typeof text !== "string" || !text.trim() || text.length > 4000) {
      return json({ error: "Text must be 1-4000 characters" }, 400);
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text,
        voice: "sage",
        response_format: "mp3",
        instructions: VOICE_INSTRUCTIONS,
      }),
    });
    if (!upstream.ok) {
      const details = await upstream.text();
      console.error(`TTS failed [${upstream.status}]: ${details}`);
      return json({ error: "Narration failed", status: upstream.status, details }, upstream.status);
    }
    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "audio/mpeg", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
