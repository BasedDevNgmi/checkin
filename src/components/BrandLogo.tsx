interface BrandLogoProps {
  compact?: boolean;
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--surface-border-strong)] bg-[var(--surface-glass-strong)]"
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7f90ff" />
              <stop offset="100%" stopColor="#5a4fff" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="9" fill="url(#logo-gradient)" opacity="0.22" />
          <path
            d="M7.5 12.5 10.5 15.5 16.5 9.5"
            fill="none"
            stroke="url(#logo-gradient)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
          />
        </svg>
      </span>
      {!compact ? (
        <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
          Inchecken
        </span>
      ) : null}
    </div>
  );
}
