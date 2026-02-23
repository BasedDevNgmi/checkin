import type { LucideIcon } from "lucide-react";
import { BookOpen, BarChart3, PlusCircle, User } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dagboek", icon: BookOpen },
  { href: "/analytics", label: "Inzichten", icon: BarChart3 },
  { href: "/checkin", label: "Check-in", icon: PlusCircle },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { href: "/profile", label: "Instellingen", icon: User },
];

export const MOBILE_NAV_ITEMS: NavItem[] = [...PRIMARY_NAV_ITEMS, ...SECONDARY_NAV_ITEMS];

export function getLikelyNextRoutes(pathname: string): readonly string[] {
  if (pathname.startsWith("/checkin")) return ["/dashboard", "/analytics"];
  if (pathname.startsWith("/analytics")) return ["/dashboard"];
  if (pathname.startsWith("/profile")) return ["/dashboard", "/checkin"];
  return ["/checkin", "/analytics"];
}

export function isActiveNavItem(href: string, pathname: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}
