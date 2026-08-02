import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const includeFamily = body?.includeFamily !== false;

    if (!prompt || prompt.length > 2000) {
      return new Response(JSON.stringify({ error: "A prompt between 1 and 2000 characters is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let familyContext = "";
    if (includeFamily) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      const { data: members } = await supabase
        .from("family_members")
        .select("full_name, nickname, gender, is_deceased, generation_level, parent_id, id")
        .limit(200);

      if (members && members.length) {
        const byId = new Map(members.map((m: any) => [m.id, m]));
        const lines = members.slice(0, 120).map((m: any) => {
          const parent = m.parent_id ? byId.get(m.parent_id) : null;
          return `- ${m.full_name}${m.nickname ? ` "${m.nickname}"` : ""} (${m.gender ?? "unknown"}${
            m.is_deceased ? ", late" : ""
          })${parent ? `, child of ${parent.full_name}` : ""}`;
        });
        familyContext = `\n\nUse this Magdalene family reference when the request mentions family members or the family tree:\n${lines.join("\n")}`;
      }
    }

    const fullPrompt =
      `Create a warm, dignified illustration for the Magdalene Foundation family app. ` +
      `Style: soft green earthy palette, elegant, respectful, suitable for all ages. ` +
      `If a family tree or chart is requested, draw a clear, readable diagram with legible names and connecting lines.\n\n` +
      `Request: ${prompt}${familyContext}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image",
        messages: [{ role: "user", content: fullPrompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) {
      const details = await res.text();
      console.error("Image gateway error", res.status, details);
      const message =
        res.status === 429
          ? "Too many requests right now, please try again shortly."
          : res.status === 402
            ? "AI credits depleted. Please contact the administrator."
            : "Could not generate the image.";
      return new Response(JSON.stringify({ error: message, details }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await res.json();
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) {
      console.error("No image in response", JSON.stringify(json).slice(0, 500));
      return new Response(JSON.stringify({ error: "No image was returned." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ image: `data:image/png;base64,${b64}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
