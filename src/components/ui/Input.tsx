"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const inputBase =
  "w-full rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-3 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-soft)] shadow-[var(--shadow-elevation)] focus-visible:border-[var(--surface-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id: idProp, type, className = "", ...props }, ref) => {
    const id = idProp ?? props.name;
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={id} className="block text-[13px] font-medium text-[var(--text-muted)]">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={isPassword && showPassword ? "text" : type}
            className={`${inputBase} ${isPassword ? "pr-12" : ""} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-0 top-0 flex h-full min-w-[44px] items-center justify-center text-[var(--text-soft)] transition-colors duration-200 hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)] rounded-r-[var(--radius-control)]"
              aria-label={showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" aria-hidden />
              ) : (
                <Eye className="h-[18px] w-[18px]" aria-hidden />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

export { inputBase };
