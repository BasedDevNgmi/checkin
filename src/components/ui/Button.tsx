import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "sm";
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "default", className = "", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-[var(--radius-control)] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";
    const variants = {
      primary:
        "bg-[var(--accent)] text-white hover:bg-[var(--accent-soft)] active:opacity-90",
      secondary:
        "border border-[var(--surface-border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-active)]",
      ghost:
        "text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-active)]",
    };
    const sizes = {
      default: "min-h-[44px] py-3 px-5 text-[15px]",
      sm: "min-h-[36px] py-2 px-3.5 text-[13px]",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
