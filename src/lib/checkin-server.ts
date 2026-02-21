import { createClient } from "@/lib/supabase/server";
import type { CheckInRow } from "@/types/checkin";

/** List check-ins for a given user (server). Pass userId to skip an extra getUser() round-trip. */
export async function listCheckInsServer(userId?: string): Promise<CheckInRow[]> {
  const supabase = await createClient();
  let uid = userId;
  if (!uid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    uid = user.id;
  }
  const { data, error } = await supabase
    .from("checkins")
    .select("id,user_id,created_at,thoughts,emotions,body_parts,energy_level,behavior_meta")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as CheckInRow[];
}
