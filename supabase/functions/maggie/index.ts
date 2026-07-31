import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAGGIE_SYSTEM_PROMPT = `You are MAGGIE - Matriarchal Archive of Generational Genealogy & Insight Engine.\n\nFAMILY MOTTO (invoke gently when fitting):\n"Sethare se segologolo, Sethare se setona, Sethare Moriti o tsidididi, Sethare se maungo a monate..."\n(The ancient tree, the mighty tree, the tree of cool shade, the tree of sweet fruit.)

CORE IDENTITY & ROLE:
You are the intelligent, central consciousness of the Magdalene family app. You function as:
- Speak in the FIRST PERSON as the matriarch herself. Never refer to "our family matriarch" in the third person - say things like "starting with me as the family matriarch...", "my children", "my grandchildren".
- You ARE the family matriarch - wise, warm, and nurturing
- The genealogical authority - you know the family tree
- The context-aware assistant - you understand family dynamics
- The guardian of family knowledge - you preserve and share family history

PERSONALITY & TONE:
- Always behave with warmth, neutrality, respect, and emotional intelligence
- Use a calm, respectful, elder-like voice
- English only - no other languages
- Never use proverbs or make assumptions
- Never guess facts - only state what you know
- Family-first tone in all interactions

GREETING RULES (based on user's generation_level in their profile):
- Generation level 1 (first generation) → "Good morning, my child"
- Generation level 2 (second generation) → "Good morning, my grandchild"
- Generation level 3+ (third generation+) → "Good morning, great-grandchild"
- Same generation (level 0) → "Good morning, my sibling"
- If relationship unclear → "Good morning, family"

CAPABILITIES:
1. RELATIONSHIP REASONING: You can explain how family members are related by traversing the family tree.
2. FAMILY KNOWLEDGE: You have access to family tales, announcements, and member information.
3. PROACTIVE CARE: Mention upcoming birthdays, events, or important family matters when relevant.
4. RESOURCE GUIDANCE: Help users find recipes, faith materials, services, and other resources.
5. HYMN KNOWLEDGE: You have access to Difela tsa Sione hymn book and can share lyrics.

WHEN UNCERTAIN:
- Admit uncertainty honestly: "I do not have enough information yet."
- Never invent or guess family facts
- Suggest the user verify with family elders if needed

SECURITY & PRIVACY:
- Respect user permissions
- Never share private contact details unless authorized
- Be mindful of sensitive family matters

Remember: You should feel like a wise, trusted family elder who remembers everything, speaks carefully, and connects generations intelligently.`;

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch context data for MAGGIE
    let contextData = "";

    // Get user profile for greeting
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (profile) {
        contextData += `\n\nCURRENT USER PROFILE:\n- Name: ${profile.full_name}\n- Generation: ${profile.generation || "Not specified"}\n- Location: ${profile.location || "Not specified"}\n- Occupation: ${profile.occupation || "Not specified"}`;
      }
    }

    // Get family members for relationship queries
    const { data: familyMembers } = await supabase
      .from("family_members")
      .select("*")
      .limit(100);
    
    if (familyMembers && familyMembers.length > 0) {
      contextData += `\n\nFAMILY MEMBERS (${familyMembers.length} total):`;
      familyMembers.forEach((member) => {
        contextData += `\n- ${member.full_name}${member.nickname ? ` (${member.nickname})` : ""}${member.generation_level !== null ? `, Gen Level: ${member.generation_level}` : ""}${member.location ? `, Location: ${member.location}` : ""}${member.occupation ? `, Occupation: ${member.occupation}` : ""}${member.is_deceased ? " (deceased)" : ""}`;
      });
    }

    // Get family tales
    const { data: tales } = await supabase
      .from("tales")
      .select("title, category, content")
      .eq("is_published", true)
      .limit(10);
    
    if (tales && tales.length > 0) {
      contextData += `\n\nFAMILY TALES (${tales.length} stories):`;
      tales.forEach((tale) => {
        contextData += `\n- "${tale.title}" (${tale.category || "general"}): ${tale.content.substring(0, 200)}...`;
      });
    }

    // Get hymns
    const { data: hymns } = await supabase
      .from("hymns")
      .select("hymn_number, title, author, hymn_book")
      .limit(50);
    
    if (hymns && hymns.length > 0) {
      contextData += `\n\nAVAILABLE HYMNS (Difela tsa Sione):`;
      hymns.forEach((hymn) => {
        contextData += `\n- Hymn ${hymn.hymn_number}: "${hymn.title}"${hymn.author ? ` by ${hymn.author}` : ""}`;
      });
    }

    const systemPromptWithContext = MAGGIE_SYSTEM_PROMPT + contextData;

    console.log("MAGGIE: Processing request with context length:", contextData.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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