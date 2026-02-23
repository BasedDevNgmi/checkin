interface BrandLogoProps {
  compact?: boolean;
}

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
        <radialGradient id="logo-fill" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" />
        </radialGradient>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        fill="url(#logo-fill)"
      />
      <path
        d="M10 16.5 L14.2 20.8 L22 11.2"
        stroke="var(--accent)"
        strokeWidth="2.8"
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
      <span className="flex h-8 w-8 shrink-0 items-center justify-center">
        <LogoIcon className="h-6 w-6 transition-transform duration-[var(--motion-base)]" />
      </span>
      {!compact ? (
        <span className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
          Inchecken
        </span>
      ) : null}
    </div>
  );
}
