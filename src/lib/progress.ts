import { supabase } from "@/integrations/supabase/client";
import { getMyFamilyId } from "@/lib/family";

export interface SavedProgress {
  last_route: string | null;
  last_label: string | null;
  game_state: Record<string, unknown>;
  last_seen_at: string | null;
}

const LOCAL_KEY = "magdalene.progress";

/** Friendly names for every place in the app, used for "pick up where you left off". */
export const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Your family dashboard",
  "/family-tree": "The family tree",
  "/tales": "Family tales",
  "/games": "Family tricks",
  "/games/leaderboard": "The games leaderboard",
  "/games/crossword": "Botswana crossword",
  "/games/bible-trivia": "Bible trivia",
  "/games/family-trivia": "Family trivia",
  "/games/ludo": "Ludo",
  "/games/snakes-ladders": "Snakes & ladders",
  "/games/chess": "Chess",
  "/games/crazy-8": "Crazy 8",
  "/games/rummy": "Rummy",
  "/games/family-puzzle": "Family puzzle",
  "/games/word-search": "Word search",
  "/games/memory-match": "Memory match",
  "/games/tic-tac-toe": "Tic-tac-toe",
  "/resources": "Family resources",
  "/library": "Family memories",
  "/maggie": "A chat with Maggie",
  "/locate-family": "Locate family",
  "/family-services": "Family services",
  "/family-art": "Family art",
  "/profile": "Your profile",
  "/settings": "Settings",
  "/activity": "Activity report",
  "/family-admin": "Family admin",
};

export const labelForRoute = (route: string) =>
  ROUTE_LABELS[route] ?? ROUTE_LABELS[`/${route.split("/")[1] ?? ""}`] ?? "Where you left off";

/** Instant local copy so the app can restore even before the server answers. */
export function readLocalProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as SavedProgress) : null;
  } catch {
    return null;
  }
}

function writeLocalProgress(p: SavedProgress) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(p));
  } catch {
    /* storage full or blocked — the server copy still holds */
  }
}

export function clearLocalProgress() {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    /* ignore */
  }
}

/** Saves the current place in the app. Never throws — progress must not block use. */
export async function saveProgress(route: string, extra?: Record<string, unknown>) {
  const label = labelForRoute(route);
  const local = readLocalProgress();
  const gameState = { ...(local?.game_state ?? {}), ...(extra ?? {}) };
  writeLocalProgress({
    last_route: route,
    last_label: label,
    game_state: gameState,
    last_seen_at: new Date().toISOString(),
  });

  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;
    await (supabase as any).from("user_progress").upsert(
      {
        user_id: user.id,
        family_id: await getMyFamilyId(),
        last_route: route,
        last_label: label,
        game_state: gameState,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  } catch {
    /* offline or signed out — the local copy is enough */
  }
}

/** Saves progress inside one activity (e.g. a game level) without changing the page. */
export async function saveActivityState(key: string, value: unknown) {
  const local = readLocalProgress();
  await saveProgress(local?.last_route ?? window.location.pathname, { [key]: value });
}

export async function loadProgress(): Promise<SavedProgress | null> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return readLocalProgress();
    const { data } = await (supabase as any)
      .from("user_progress")
      .select("last_route,last_label,game_state,last_seen_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      writeLocalProgress(data as SavedProgress);
      return data as SavedProgress;
    }
  } catch {
    /* fall through to local */
  }
  return readLocalProgress();
}
