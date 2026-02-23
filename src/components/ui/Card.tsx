interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className = "", variant = "default", padding = "md" }: CardProps) {
  const variantClass =
    variant === "glass"
      ? "glass-card"
      : variant === "elevated"
        ? "surface-card shadow-[var(--shadow-zen)]"
        : "surface-card";
  const paddingClass = {
    none: "",
    sm: "p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-7",
  }[padding];

  return (
    <div
      className={`rounded-[var(--radius-card)] ${variantClass} ${paddingClass} ${className}`}
    >
      {children}
    </div>
  );
}
