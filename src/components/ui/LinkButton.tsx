"use client";

import Link from "next/link";

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function LinkButton({
  href,
  children,
  className = "",
  variant = "primary",
  size = "default",
}: LinkButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-[var(--radius-control)] font-medium tracking-[-0.01em] transition-[background-color,color,border-color,box-shadow,opacity,transform] duration-[var(--motion-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]";
  const variants = {
    primary:
      "bg-[var(--accent)] text-white shadow-[var(--shadow-elevation)] hover:brightness-[1.05] hover:shadow-[var(--shadow-zen)] active:opacity-90",
    secondary:
      "border border-[var(--surface-border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] hover:border-[var(--surface-border-strong)] active:bg-[var(--interactive-active)]",
    ghost:
      "text-[var(--text-muted)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)] active:bg-[var(--interactive-active)]",
  };
  const sizes = {
    default: "min-h-[44px] py-3 px-5 text-[15px]",
    sm: "min-h-[36px] py-2 px-3.5 text-[13px]",
    lg: "min-h-[48px] py-3.5 px-6 text-[15px]",
  };

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </Link>
  );
}
