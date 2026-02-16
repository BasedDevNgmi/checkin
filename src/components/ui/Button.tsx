import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-[14px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5546ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed";
    const variants = {
      primary:
        "bg-gradient-to-b from-[#6f63ff] to-[#5a4fff] text-white shadow-[0_14px_30px_-18px_rgba(90,79,255,0.75)] hover:from-[#6659ff] hover:to-[#5248ff] py-3 px-5",
      secondary:
        "border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] text-slate-700 backdrop-blur-md hover:bg-white/90 py-3 px-5",
      ghost:
        "text-slate-600 hover:bg-white/60 py-2 px-4",
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
