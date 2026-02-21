import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OfflineBanner } from "@/components/OfflineBanner";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { Sidebar } from "@/components/Sidebar";
import { ReminderScheduler } from "@/features/settings/components/ReminderScheduler";
import { CheckinsProvider } from "@/lib/CheckinsContext";
import { listCheckInsServer } from "@/lib/checkin-server";
import { MOCK_CHECKINS } from "@/lib/dev-mock-data";

const isDevPreview = process.env.NEXT_PUBLIC_DEV_PREVIEW === "true";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialCheckins;

  if (isDevPreview) {
    initialCheckins = MOCK_CHECKINS;
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
    }
    initialCheckins = await listCheckInsServer(user.id);
  }

  return (
    <div className="min-h-screen">
      <ReminderScheduler />
      <OfflineBanner />
      <Sidebar />
      <header
        className="sticky top-0 z-20 border-b border-[var(--surface-border)]/60 bg-[var(--background)]/80 backdrop-blur-xl backdrop-saturate-150 pt-[env(safe-area-inset-top,0px)] md:hidden"
        role="banner"
      >
        <div className="flex h-[52px] min-h-[52px] items-center px-5 sm:h-14 sm:min-h-14 sm:px-6">
          <Link
            href="/dashboard"
            className="-m-2 flex items-center rounded-[var(--radius-small)] p-2 transition-colors duration-200 hover:bg-[var(--interactive-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Dagboek"
          >
            <BrandLogo />
          </Link>
        </div>
      </header>
      <CheckinsProvider initialCheckins={initialCheckins}>
        <main className="mx-auto max-w-5xl px-5 py-6 pb-[calc(7.25rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-8 md:ml-14 md:pb-10">{children}</main>
      </CheckinsProvider>
      <BottomNav />
    </div>
  );
}
