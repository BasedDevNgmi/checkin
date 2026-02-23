import { AnalyticsScreen } from "@/features/analytics/components/AnalyticsScreen";
import { CheckinsProvider } from "@/lib/CheckinsContext";
import { listCheckInsServer } from "@/lib/checkin-server";
import { createClient } from "@/lib/supabase/server";
import { isDevPreview } from "@/config/flags";
import { MOCK_CHECKINS } from "@/lib/dev-mock-data";

export default async function AnalyticsPage() {
  let initialCheckins = MOCK_CHECKINS;
  if (!isDevPreview) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    initialCheckins = user ? await listCheckInsServer(user.id) : [];
  }

  return (
    <CheckinsProvider initialCheckins={initialCheckins}>
      <AnalyticsScreen />
    </CheckinsProvider>
  );
}
