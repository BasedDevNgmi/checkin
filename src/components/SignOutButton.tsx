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
        className="flex items-center gap-1.5 rounded-[14px] border border-[var(--surface-border-strong)] bg-[var(--surface-glass-strong)] px-3 py-2.5 text-sm text-[var(--text-primary)] min-h-[44px] transition hover:bg-[var(--interactive-active)] disabled:opacity-70 disabled:pointer-events-none"
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
          className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-4 shadow-[var(--shadow-zen)]"
          role="dialog"
          aria-labelledby="signout-dialog-title"
          aria-describedby="signout-dialog-desc"
        >
          <p id="signout-dialog-title" className="font-medium text-[var(--text-primary)]">
            Uitloggen
          </p>
          <p id="signout-dialog-desc" className="mt-1 text-sm text-[var(--text-muted)]">
            {CONFIRM_MESSAGE}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-[14px] border border-[var(--surface-border)] px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] min-h-[44px]"
            >
              {CONFIRM_LABEL_CANCEL}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-[14px] bg-gradient-to-b from-[var(--accent-soft)] to-[var(--accent)] px-3 py-2.5 text-sm font-medium text-white hover:opacity-95 min-h-[44px]"
            >
              {CONFIRM_LABEL_CONFIRM}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
