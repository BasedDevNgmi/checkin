"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, PlusCircle, BarChart3, User } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dagboek", icon: BookOpen },
  { href: "/checkin", label: "Check-in", icon: PlusCircle },
  { href: "/analytics", label: "Inzichten", icon: BarChart3 },
];

const BOTTOM_ITEMS: NavItem[] = [
  { href: "/profile", label: "Instellingen", icon: User },
];

function isActive(href: string, pathname: string) {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(item.href, pathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`relative flex h-10 items-center gap-3 rounded-[var(--radius-control)] px-3 text-[14px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
        active
          ? "text-[var(--text-primary)] bg-[var(--interactive-hover)]"
          : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--interactive-hover)]"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[var(--accent)]" />
      )}
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
      <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
        {item.label}
      </span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="group/sidebar hidden md:flex fixed left-0 top-0 bottom-0 z-30 w-14 hover:w-[220px] flex-col border-r border-[var(--surface-border)] bg-[var(--background)]/80 backdrop-blur-xl backdrop-saturate-150 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
      aria-label="Hoofdnavigatie"
    >
      <div className="flex h-14 shrink-0 items-center px-3">
        <Link
          href="/dashboard"
          className="flex items-center rounded-[var(--radius-small)] p-1 transition-colors duration-200 hover:bg-[var(--interactive-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          aria-label="Dagboek"
        >
          <span className="flex shrink-0">
            <BrandLogo compact />
          </span>
          <span className="ml-2.5 whitespace-nowrap text-[17px] font-semibold tracking-[-0.025em] text-[var(--text-primary)] opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
            Inchecken
          </span>
        </Link>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        <div className="flex-1" />

        <div className="border-t border-[var(--surface-border)] pt-2 pb-3">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>
    </aside>
  );
}
