import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OfflineBanner } from "@/components/OfflineBanner";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { Sidebar } from "@/components/Sidebar";
import { ProtectedRuntimeBridges } from "@/components/ProtectedRuntimeBridges";
import { isDevPreview } from "@/config/flags";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isDevPreview) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/");
    }
  }

  return (
    <div className="ios-app-shell min-h-screen md:pl-14">
      <ProtectedRuntimeBridges />
      <Sidebar />
      <div className="flex h-full min-h-0 flex-col">
        <header
          className="glass-nav sticky top-0 z-20 border-b pt-[env(safe-area-inset-top,0px)] md:hidden"
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
        <OfflineBanner />
        <main
          id="main-content"
          className="ios-scroll-area mx-auto w-full max-w-5xl flex-1 px-5 py-6 pb-[calc(8.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-8 md:pb-10"
        >
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
