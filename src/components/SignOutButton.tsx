"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
      router.push("/");
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
    <>
      <Button type="button" variant="secondary" onClick={handleClick} disabled={isLoading} aria-busy={isLoading} className="w-full justify-start gap-1.5">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <LogOut className="h-4 w-4" aria-hidden />
        )}
        <span>{isLoading ? "Uitloggen…" : "Uitloggen"}</span>
      </Button>
      <ConfirmDialog
        open={showConfirm}
        title="Uitloggen"
        description={CONFIRM_MESSAGE}
        confirmLabel={CONFIRM_LABEL_CONFIRM}
        cancelLabel={CONFIRM_LABEL_CANCEL}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        isPending={isLoading}
      />
    </>
  );
}
