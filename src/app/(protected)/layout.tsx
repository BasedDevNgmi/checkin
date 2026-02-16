import Link from "next/link";
import { OfflineBanner } from "@/components/OfflineBanner";
import { BottomNav } from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandLogo } from "@/components/BrandLogo";
import { ReminderScheduler } from "@/features/settings/components/ReminderScheduler";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <ReminderScheduler />
      <OfflineBanner />
      <header
        className="sticky top-0 z-20 border-b border-[var(--surface-border)]/50 bg-[var(--surface-glass)]/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-[var(--surface-glass)]/60 pt-[env(safe-area-inset-top,0px)]"
        role="banner"
      >
        <div className="mx-auto flex h-[52px] min-h-[52px] max-w-5xl items-center justify-between gap-4 px-4 sm:h-14 sm:min-h-14 sm:px-5 md:px-6">
          <Link
            href="/dashboard"
            className="-m-2 flex items-center rounded-[10px] p-2 transition-colors hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-active)]"
            aria-label="Dagboek"
          >
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <nav className="hidden md:flex md:items-center md:gap-0.5" aria-label="Header navigatie">
              <Link
                href="/checkin"
                className="rounded-[10px] min-h-[36px] inline-flex items-center bg-[var(--accent)] px-4 py-2 text-[15px] font-medium text-white shadow-sm transition hover:opacity-92 active:opacity-90"
              >
                Check-in
              </Link>
              <Link
                href="/analytics"
                className="rounded-[10px] min-h-[36px] inline-flex items-center px-3.5 py-2 text-[15px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
              >
                Inzichten
              </Link>
              <Link
                href="/profile"
                className="rounded-[10px] min-h-[36px] inline-flex items-center px-3.5 py-2 text-[15px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
              >
                Instellingen
              </Link>
            </nav>
            <div className="ml-1 h-5 w-px hidden md:block bg-[var(--surface-border)]/80" aria-hidden />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-5 pb-[calc(7.25rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-6 md:pb-10">{children}</main>
      <BottomNav />
    </div>
  );
}
