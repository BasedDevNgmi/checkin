"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isLocalStorageMode } from "@/lib/checkin";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    if (isLocalStorageMode()) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="flex items-center gap-1.5 rounded-[14px] border border-[var(--surface-border-strong)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--interactive-active)]"
      title="Uitloggen"
    >
      <LogOut className="h-4 w-4" aria-hidden />
      Uitloggen
    </button>
  );
}
