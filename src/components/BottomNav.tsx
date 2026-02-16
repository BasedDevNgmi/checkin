"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, PlusCircle, User } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Overzicht", icon: BookOpen },
  { href: "/analytics", label: "Inzichten", icon: BarChart3 },
  { href: "/checkin", label: "Check-in", icon: PlusCircle },
  { href: "/profile", label: "Instellingen", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--surface-border)] bg-[var(--surface-glass)]/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom,0px)] md:hidden"
      aria-label="Hoofdnavigatie"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-around gap-1 px-2 pt-3 pb-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 max-w-[88px] min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[11px] font-medium transition active:scale-[0.98] ${
                isActive
                  ? "bg-[var(--interactive-active)] text-[#8ea0ff]"
                  : "text-[var(--text-soft)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className="truncate w-full text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
