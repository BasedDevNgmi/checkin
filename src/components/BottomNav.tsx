"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavPrefetch } from "@/components/navigation/useNavPrefetch";
import { MOBILE_NAV_ITEMS, getLikelyNextRoutes, isActiveNavItem } from "@/components/navigation/navItems";

export function BottomNav() {
  const pathname = usePathname();
  useNavPrefetch(getLikelyNextRoutes(pathname));
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) {
      return;
    }
    const viewport = window.visualViewport;
    let frameId: number | null = null;
    const updateVisibility = () => {
      if (frameId != null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        const inset = window.innerHeight - viewport.height - viewport.offsetTop;
        const nextVisible = inset > 80;
        setKeyboardVisible((prev) => (prev === nextVisible ? prev : nextVisible));
      });
    };
    updateVisibility();
    viewport.addEventListener("resize", updateVisibility);
    viewport.addEventListener("scroll", updateVisibility);
    return () => {
      if (frameId != null) window.cancelAnimationFrame(frameId);
      viewport.removeEventListener("resize", updateVisibility);
      viewport.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  return (
    <nav
      className={`glass-nav fixed bottom-0 left-0 right-0 z-30 border-t pb-[env(safe-area-inset-bottom,0px)] transition-[opacity,transform] duration-[var(--motion-base)] md:hidden ${
        keyboardVisible ? "pointer-events-none translate-y-full opacity-0" : ""
      }`}
      aria-label="Hoofdnavigatie"
      aria-hidden={keyboardVisible}
    >
      <div className="mx-auto flex min-h-[72px] max-w-4xl items-center justify-around gap-1 px-2 pt-2.5 pb-2">
        {MOBILE_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = isActiveNavItem(href, pathname);
          return (
            <Link
              key={href}
              href={href}
              tabIndex={keyboardVisible ? -1 : 0}
              className={`flex min-w-0 flex-1 max-w-[88px] min-h-[48px] flex-col items-center justify-center gap-1 rounded-[var(--radius-control)] px-2 py-2.5 text-[11px] font-medium transition-colors duration-[var(--motion-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
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
