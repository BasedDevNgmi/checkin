"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/core/telemetry/events";
import { getAuthRedirectBase } from "@/features/auth/lib/authRedirect";

type AuthLoadingAction = "password" | "magic" | "signup" | "forgot" | null;

interface AuthResponse {
  ok: boolean;
  message?: string;
}

export function useAuthActions() {
  const [loadingAction, setLoadingAction] = useState<AuthLoadingAction>(null);
  const supabase = createClient();
  const redirectBase = getAuthRedirectBase();

  async function runWithLoading(action: Exclude<AuthLoadingAction, null>, fn: () => Promise<AuthResponse>) {
    setLoadingAction(action);
    try {
      return await fn();
    } finally {
      setLoadingAction(null);
    }
  }

  async function loginWithPassword(email: string, password: string): Promise<AuthResponse> {
    return runWithLoading("password", async () => {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return { ok: false, message: error.message };
      trackEvent("auth_login_success");
      return { ok: true };
    });
  }

  async function signUp(email: string, password: string): Promise<AuthResponse & { hasSession?: boolean }> {
    return runWithLoading("signup", async () => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${redirectBase}/auth/callback` },
      });
      if (error) return { ok: false, message: error.message };
      if (data.session) {
        trackEvent("auth_signup_success", { confirmationRequired: false });
        return { ok: true, hasSession: true };
      }
      trackEvent("auth_signup_success", { confirmationRequired: true });
      return {
        ok: true,
        hasSession: false,
        message: "Account aangemaakt. Check je e-mail om je account te bevestigen, daarna kun je inloggen.",
      };
    });
  }

  async function sendMagicLink(email: string): Promise<AuthResponse> {
    return runWithLoading("magic", async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${redirectBase}/auth/callback` },
      });
      if (error) return { ok: false, message: error.message };
      trackEvent("auth_magic_link_sent");
      return { ok: true, message: "Check je e-mail voor de magic link om in te loggen." };
    });
  }

  async function sendPasswordReset(email: string): Promise<AuthResponse> {
    return runWithLoading("forgot", async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${redirectBase}/auth/callback?next=/login/update-password`,
      });
      if (error) return { ok: false, message: error.message };
      return {
        ok: true,
        message: "Check je e-mail voor de link om je wachtwoord opnieuw in te stellen.",
      };
    });
  }

  return {
    loadingAction,
    isLoading: loadingAction !== null,
    loginWithPassword,
    signUp,
    sendMagicLink,
    sendPasswordReset,
  };
}
