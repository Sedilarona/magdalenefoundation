import t1 from "@/assets/narration/tale-1.mp3.asset.json";
import t2 from "@/assets/narration/tale-2.mp3.asset.json";
import t3 from "@/assets/narration/tale-3.mp3.asset.json";
import t4 from "@/assets/narration/tale-4.mp3.asset.json";
import t5 from "@/assets/narration/tale-5.mp3.asset.json";
import t6 from "@/assets/narration/tale-6.mp3.asset.json";

/** Pre-recorded narrations for built-in tales; other tales fall back to live narration. */
export const taleNarrations: Record<string, string> = {
  "tale-1": t1.url, "tale-2": t2.url, "tale-3": t3.url,
  "tale-4": t4.url, "tale-5": t5.url, "tale-6": t6.url,
};
