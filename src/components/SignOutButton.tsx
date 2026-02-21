"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Loader2 } from "lucide-react";

const CONFIRM_MESSAGE = "Weet je het zeker? Je wordt uitgelogd.";
const CONFIRM_LABEL_CANCEL = "Annuleren";
const CONFIRM_LABEL_CONFIRM = "Uitloggen";

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function performSignOut() {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      try {
        await fetch("/api/auth/signout", { method: "POST", redirect: "manual" });
      } catch {
        // Client sign-out already done; redirect regardless
      }
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  function handleClick() {
    if (showConfirm) return;
    setShowConfirm(true);
  }

  function handleConfirm() {
    setShowConfirm(false);
    void performSignOut();
  }

  function handleCancel() {
    setShowConfirm(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        aria-busy={isLoading}
        title="Uitloggen"
        className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-transparent px-3 py-2.5 text-[15px] text-[var(--text-primary)] min-h-[44px] transition-colors duration-200 hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-active)] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <LogOut className="h-4 w-4" aria-hidden />
        )}
        <span>{isLoading ? "Uitloggen…" : "Uitloggen"}</span>
      </button>
      {showConfirm && (
        <div
          className="rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-elevation)]"
          role="dialog"
          aria-labelledby="signout-dialog-title"
          aria-describedby="signout-dialog-desc"
        >
          <p id="signout-dialog-title" className="font-medium text-[var(--text-primary)]">
            Uitloggen
          </p>
          <p id="signout-dialog-desc" className="mt-1 text-[13px] text-[var(--text-muted)]">
            {CONFIRM_MESSAGE}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-[var(--radius-control)] border border-[var(--surface-border)] px-3 py-2.5 text-[15px] font-medium text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-active)] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            >
              {CONFIRM_LABEL_CANCEL}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-[var(--radius-control)] bg-[var(--accent)] px-3 py-2.5 text-[15px] font-medium text-white hover:bg-[var(--accent-soft)] active:opacity-90 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            >
              {CONFIRM_LABEL_CONFIRM}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
