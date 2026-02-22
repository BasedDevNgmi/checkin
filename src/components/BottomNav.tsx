"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, PlusCircle, User } from "lucide-react";
import { useNavPrefetch } from "@/components/navigation/useNavPrefetch";

const tabs = [
  { href: "/dashboard", label: "Dagboek", icon: BookOpen },
  { href: "/analytics", label: "Inzichten", icon: BarChart3 },
  { href: "/checkin", label: "Check-in", icon: PlusCircle },
  { href: "/profile", label: "Instellingen", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  useNavPrefetch(tabs.map((tab) => tab.href));
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) {
      return;
    }
    const viewport = window.visualViewport;
    const updateVisibility = () => {
      const inset = window.innerHeight - viewport.height - viewport.offsetTop;
      setKeyboardVisible(inset > 80);
    };
    updateVisibility();
    viewport.addEventListener("resize", updateVisibility);
    viewport.addEventListener("scroll", updateVisibility);
    return () => {
      viewport.removeEventListener("resize", updateVisibility);
      viewport.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  return (
    <nav
      className={`glass-nav fixed bottom-0 left-0 right-0 z-30 border-t pb-[env(safe-area-inset-bottom,0px)] transition-all duration-200 md:hidden ${
        keyboardVisible ? "pointer-events-none translate-y-full opacity-0" : ""
      }`}
      aria-label="Hoofdnavigatie"
    >
      <div className="mx-auto flex min-h-[72px] max-w-4xl items-center justify-around gap-1 px-2 pt-2.5 pb-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 max-w-[88px] min-h-[48px] flex-col items-center justify-center gap-1 rounded-[var(--radius-control)] px-2 py-2.5 text-[11px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
                isActive
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-soft)] hover:text-[var(--text-primary)]"
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
