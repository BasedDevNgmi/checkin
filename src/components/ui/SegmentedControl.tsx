"use client";

interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number> {
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (next: T) => void;
  ariaLabel: string;
  className?: string;
}

export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`glass-panel inline-flex rounded-[var(--radius-control)] p-0.5 ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-[var(--radius-small)] px-3 py-1.5 text-[13px] font-medium transition-colors duration-[var(--motion-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
              isActive
                ? "bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
