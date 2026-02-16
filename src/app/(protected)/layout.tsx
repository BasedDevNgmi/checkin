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
      <header className="sticky top-0 z-20 border-b border-[var(--surface-border)] bg-[var(--surface-glass)]/95 backdrop-blur-xl pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex h-14 min-h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:h-16 sm:min-h-16 sm:px-6">
          <Link
            href="/dashboard"
            className="flex items-center rounded-xl py-2 pr-2 -my-2 transition hover:opacity-90 active:opacity-80"
            aria-label="Dagboek"
          >
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="hidden md:flex md:items-center md:gap-1" aria-label="Header navigatie">
              <Link
                href="/checkin"
                className="rounded-[14px] bg-gradient-to-b from-[var(--accent-soft)] to-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-zen)] transition hover:opacity-95 active:opacity-90"
              >
                Check-in
              </Link>
              <Link
                href="/analytics"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
              >
                Inzichten
              </Link>
              <Link
                href="/profile"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
              >
                Instellingen
              </Link>
            </nav>
            <div className="h-6 w-px hidden md:block bg-[var(--surface-border)]" aria-hidden />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-5 pb-[calc(7.25rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-6 md:pb-10">{children}</main>
      <BottomNav />
    </div>
  );
}
