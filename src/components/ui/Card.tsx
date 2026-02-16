export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] shadow-[var(--shadow-zen)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
