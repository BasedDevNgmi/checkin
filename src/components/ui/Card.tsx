interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated";
}

export function Card({ children, className = "", variant = "default" }: CardProps) {
  const shadow =
    variant === "elevated"
      ? "shadow-[var(--shadow-zen)]"
      : "shadow-[var(--shadow-elevation)]";
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-[var(--surface-border)]/80 bg-[var(--surface-elevated)] ${shadow} ${className}`}
    >
      {children}
    </div>
  );
}
