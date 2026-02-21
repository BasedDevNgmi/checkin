"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dagboek" },
  { href: "/checkin", label: "Check-in" },
  { href: "/analytics", label: "Inzichten" },
  { href: "/profile", label: "Instellingen" },
] as const;

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden md:flex md:items-center md:gap-1"
      aria-label="Header navigatie"
    >
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`rounded-[var(--radius-small)] min-h-[44px] inline-flex items-center whitespace-nowrap px-3.5 py-2 text-[15px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
              isActive
                ? "font-semibold text-[var(--text-primary)]"
                : "font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
