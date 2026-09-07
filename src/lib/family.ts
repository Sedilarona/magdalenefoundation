import { supabase } from "@/integrations/supabase/client";

let cached: string | null | undefined;

/**
 * The family circle the signed-in person belongs to. Every record the app
 * saves is tagged with it so families never see each other's data.
 */
export async function getMyFamilyId(): Promise<string | null> {
  if (cached !== undefined) return cached;
  const { data } = await (supabase as any).rpc("current_family_id");
  cached = (data as string | null) ?? null;
  return cached;
}

export function clearFamilyCache() {
  cached = undefined;
}
