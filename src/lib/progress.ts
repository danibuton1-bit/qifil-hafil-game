import { supabase } from "@/integrations/supabase/client";
import { MAX_LEVEL } from "@/lib/game";

type Kind = "solo_level" | "online_level";
const clamp = (n: unknown) => { const v = Math.floor(Number(n)); return v >= 1 && v <= MAX_LEVEL ? v : 1; };

/** Last level saved online for the signed-in player (1 when signed out or offline). */
export async function loadCloud(kind: Kind): Promise<number> {
  try {
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user.id;
    if (!uid) return 1;
    const { data } = await supabase.from("game_progress").select("solo_level,online_level").eq("user_id", uid).maybeSingle();
    return clamp(data?.[kind]);
  } catch { return 1; }
}

export async function saveCloud(kind: Kind, n: number) {
  try {
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user.id;
    if (!uid) return;
    await supabase.from("game_progress").upsert({ user_id: uid, [kind]: clamp(n), updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  } catch { /* offline: local copy still kept */ }
}
