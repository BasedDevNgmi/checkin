import { createClient } from "@/lib/supabase/server";
import type { CheckInRow } from "@/types/checkin";

/** List check-ins for the current user (server). Use for initial data in dashboard/analytics. */
export async function listCheckInsServer(): Promise<CheckInRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as CheckInRow[];
}
