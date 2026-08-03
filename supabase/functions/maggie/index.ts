import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAGGIE_SYSTEM_PROMPT = `You are MAGGIE — Matriarchal Archive of Generational Genealogy & Insight Engine.

FAMILY MOTTO (invoke gently when fitting):
"Sethare se segologolo, Sethare se setona, Sethare Moriti o tsidididi, Sethare se maungo a monate..."
(The ancient tree, the mighty tree, the tree of cool shade, the tree of sweet fruit.)

CORE IDENTITY & ROLE:
You are the digital family historian, genealogy assistant, heritage archivist and relationship expert of the Magdalene family app. You speak in the FIRST PERSON as the matriarch herself — never "our family matriarch" in the third person. Say "starting with me as the family matriarch...", "my children", "my grandchildren".

Your purpose: help the family preserve its history, understand relationships, protect memories, and pass knowledge from one generation to the next.

PERSONALITY & TONE:
- Warm, neutral, respectful, emotionally intelligent; a calm elder voice.
- English only. Never invent or guess facts. Never use proverbs beyond the motto.
- If you lack information say: "I do not have enough information yet," and suggest asking the elders or updating the profile.

GREETING RULES (by generation level):
- Level 1 -> "my child"; Level 2 -> "my grandchild"; Level 3+ -> "great-grandchild"; Level 0 -> "my sibling"; unclear -> "family".

GENEALOGY EXPERTISE:
- Traverse the FAMILY GRAPH below to answer any relationship question. Work out the exact kinship term (parent, sibling, half-sibling, aunt/uncle, niece/nephew, first cousin, first cousin once removed, second cousin, in-law, step-relation) by finding the nearest common ancestor and counting generations.
- Always distinguish BLOOD relatives from relatives BY MARRIAGE (in-laws), and say which it is.
- State the path you followed, e.g. "You -> your mother X -> her brother Y -> his daughter Z (your first cousin)."
- Mention generation numbers when useful, and note deceased members respectfully.
- Flag possible duplicate records or contradictions gently if you notice them (same name, same branch).

RESPONSE FORMATTING (very important — the app renders these):
- Use Markdown: short paragraphs, **bold** for names of relationships, bullet lists, and headings when the answer is long.
- Whenever you mention a family member who exists in the FAMILY GRAPH, wrap the name in double brackets so the app links it: [[Full Name]]. Use their full name exactly as recorded.
- For lineage, nuclear families or branch answers, include an ASCII diagram inside a fenced block tagged \`tree\`:
\`\`\`tree
Poane George Bodilenyane ═ Dikeledi Mboshwa
        └── Magdalene ...
\`\`\`
- For anything spanning years (a life, a branch, migrations, events), include a fenced block tagged \`timeline\` with one entry per line as \`year | event\`:
\`\`\`timeline
1932 | Magdalene is born
1958 | Marries ...
\`\`\`
- Keep diagrams and timelines accurate to the data — never fabricate dates.

OTHER CAPABILITIES: family tales, hymns (Difela tsa Sione), announcements and events, recipes and resources, member locations, services offered by family members, upcoming birthdays. Point people to the right page when helpful (Family Tree, Our Tales, Family Memories, Family Resources, Locate Family, Family Services, Family Art Studio).

SECURITY & PRIVACY: never reveal phone numbers or email addresses of other members; refer the user to that member's profile instead. Be careful with sensitive family matters.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let contextData = "";

    // ---- Current user -------------------------------------------------
    let viewerName: string | null = null;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, generation, location, occupation, services, family_branch")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile) {
        viewerName = profile.full_name;
        contextData += `\n\nCURRENT USER: ${profile.full_name}` +
          ` | Generation: ${profile.generation || "unknown"}` +
          ` | Location: ${profile.location || "unknown"}` +
          ` | Occupation: ${profile.occupation || "unknown"}` +
          ` | Branch: ${profile.family_branch || "unknown"}` +
          ` | Services: ${(profile.services || []).join(", ") || "none listed"}`;
      }
    }

    // ---- Family graph -------------------------------------------------
    const { data: members } = await supabase
      .from("family_members")
      .select("*")
      .order("generation_level", { ascending: true })
      .limit(500);

    const byId = new Map<string, any>();
    (members || []).forEach((m) => byId.set(m.id, m));
    const nameOf = (id: string | null) => (id && byId.get(id)?.full_name) || null;

    if (members && members.length) {
      const childrenOf = new Map<string, string[]>();
      members.forEach((m) => {
        if (m.parent_id) {
          const list = childrenOf.get(m.parent_id) || [];
          list.push(m.full_name);
          childrenOf.set(m.parent_id, list);
        }
      });

      contextData += `\n\nFAMILY GRAPH (${members.length} members). Format: NAME | gender | generation | parent | spouse | children | born | died | location | occupation | notes`;
      members.forEach((m) => {
        const born = [m.birth_year, m.birth_month && m.birth_day ? `${m.birth_month}/${m.birth_day}` : null]
          .filter(Boolean).join(" ");
        contextData += `\n- ${m.full_name}${m.nickname ? ` (aka ${m.nickname})` : ""}` +
          ` | ${m.gender || "?"}` +
          ` | gen ${m.generation_level ?? "?"}` +
          ` | parent: ${nameOf(m.parent_id) || "—"}` +
          ` | spouse: ${nameOf(m.spouse_id) || "—"}` +
          ` | children: ${(childrenOf.get(m.id) || []).join("; ") || "none recorded"}` +
          ` | born: ${born || "unknown"}` +
          ` | died: ${m.is_deceased ? (m.death_year || "yes") : "—"}` +
          ` | ${m.location || "location unknown"}` +
          ` | ${m.occupation || ""}` +
          `${m.bio ? ` | ${String(m.bio).slice(0, 160)}` : ""}`;
      });

      // Upcoming birthdays (next 45 days)
      const today = new Date();
      const upcoming = members
        .filter((m) => !m.is_deceased && m.birth_month && m.birth_day)
        .map((m) => {
          let next = new Date(today.getFullYear(), m.birth_month - 1, m.birth_day);
          if (next < today) next = new Date(today.getFullYear() + 1, m.birth_month - 1, m.birth_day);
          return { name: m.full_name, date: next, days: Math.round((+next - +today) / 86400000) };
        })
        .filter((b) => b.days <= 45)
        .sort((a, b) => a.days - b.days);

      if (upcoming.length) {
        contextData += `\n\nUPCOMING BIRTHDAYS (next 45 days):`;
        upcoming.forEach((b) => {
          contextData += `\n- ${b.name}: ${b.date.toDateString()} (in ${b.days} day${b.days === 1 ? "" : "s"})`;
        });
      }
    }

    // ---- Member directory / services / locations ----------------------
    const { data: profiles } = await supabase
      .from("profiles")
      .select("full_name, generation, location, occupation, services, family_branch")
      .limit(300);

    if (profiles?.length) {
      contextData += `\n\nREGISTERED MEMBERS & SERVICES (no contact details may be shared):`;
      profiles.forEach((p) => {
        contextData += `\n- ${p.full_name}${p.location ? `, ${p.location}` : ""}` +
          `${p.occupation ? `, ${p.occupation}` : ""}` +
          `${p.services?.length ? ` | offers: ${p.services.join(", ")}` : ""}`;
      });
    }

    // ---- Tales --------------------------------------------------------
    const { data: tales } = await supabase
      .from("tales")
      .select("title, category, content, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(25);

    if (tales?.length) {
      contextData += `\n\nFAMILY TALES (${tales.length}):`;
      tales.forEach((t) => {
        contextData += `\n- "${t.title}" (${t.category || "general"}): ${String(t.content).slice(0, 400)}...`;
      });
    }

    // ---- Announcements / events ---------------------------------------
    const { data: announcements } = await supabase
      .from("announcements")
      .select("title, description, event_date, event_end_date, location, announcement_type")
      .eq("is_active", true)
      .order("event_date", { ascending: true })
      .limit(25);

    if (announcements?.length) {
      contextData += `\n\nACTIVE ANNOUNCEMENTS & EVENTS:`;
      announcements.forEach((a) => {
        contextData += `\n- [${a.announcement_type}] ${a.title}${a.event_date ? ` on ${a.event_date}` : ""}` +
          `${a.location ? ` at ${a.location}` : ""}: ${String(a.description).slice(0, 200)}`;
      });
    }

    // ---- Hymns --------------------------------------------------------
    const { data: hymns } = await supabase
      .from("hymns")
      .select("hymn_number, title, author, hymn_book")
      .order("hymn_number", { ascending: true })
      .limit(200);

    if (hymns?.length) {
      contextData += `\n\nHYMN BOOK INDEX (${hymns.length} hymns available in the app):`;
      contextData += hymns
        .map((h) => `\n- #${h.hymn_number} "${h.title}"${h.author ? ` — ${h.author}` : ""} (${h.hymn_book})`)
        .join("");
    }

    const systemPromptWithContext = MAGGIE_SYSTEM_PROMPT + contextData +
      (viewerName ? `\n\nWhen the user says "I", "me" or "my", they mean ${viewerName}. Anchor all relationship calculations on that person.` : "");

    console.log("MAGGIE: context length", contextData.length, "members", members?.length ?? 0);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: systemPromptWithContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("MAGGIE error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
