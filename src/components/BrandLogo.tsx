interface BrandLogoProps {
  compact?: boolean;
}

/** Premium logo mark: breath + check — a calm “in” moment. */
function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-soft)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      {/* Outer ring — subtle, suggests focus/breath */}
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="url(#logo-grad)"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        fill="none"
      />
      {/* Inner check — single smooth stroke */}
      <path
        d="M10 16.5 L14.2 20.8 L22 11.2"
        stroke="url(#logo-grad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--surface-glass-strong)]/80 shadow-sm">
        <LogoIcon className="h-5 w-5" />
      </span>
      {!compact ? (
        <span className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
          Inchecken
        </span>
      ) : null}
    </div>
  );
}
