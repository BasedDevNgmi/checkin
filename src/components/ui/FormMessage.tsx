interface FormMessageProps {
  tone: "success" | "error";
  children: React.ReactNode;
  className?: string;
}

export function FormMessage({ tone, children, className = "" }: FormMessageProps) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className={`text-[13px] ${tone === "success" ? "text-[var(--text-success)]" : "text-[var(--text-error)]"} ${className}`}
    >
      {children}
    </p>
  );
}
