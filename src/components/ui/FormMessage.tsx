interface FormMessageProps {
  tone: "success" | "error" | "warning" | "info";
  children: React.ReactNode;
  className?: string;
}

export function FormMessage({ tone, children, className = "" }: FormMessageProps) {
  const toneClass = {
    success: "text-[var(--text-success)]",
    error: "text-[var(--text-error)]",
    warning: "text-[var(--text-warning)]",
    info: "text-[var(--text-muted)]",
  }[tone];

  return (
    <p
      role="alert"
      aria-live="polite"
      className={`text-[13px] ${toneClass} ${className}`}
    >
      {children}
    </p>
  );
}
