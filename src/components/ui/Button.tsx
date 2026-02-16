import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-[14px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-60 disabled:cursor-not-allowed";
    const variants = {
      primary:
        "bg-gradient-to-b from-[var(--accent-soft)] to-[var(--accent)] text-white shadow-[var(--shadow-zen)] hover:opacity-95 min-h-[44px] py-3 px-5",
      secondary:
        "border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] text-[var(--text-primary)] backdrop-blur-md hover:bg-[var(--interactive-hover)] min-h-[44px] py-3 px-5",
      ghost:
        "text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] min-h-[44px] py-2.5 px-4",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
