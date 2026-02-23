"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuthActions } from "@/features/auth/hooks/useAuthActions";
import { LoginPanel } from "@/features/auth/components/LoginPanel";
import { ForgotPasswordPanel } from "@/features/auth/components/ForgotPasswordPanel";
import { AuthCardShell } from "@/features/auth/components/AuthCardShell";
import { EASE_SMOOTH, MOTION_DURATION } from "@/lib/motion";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loadingAction, isLoading, loginWithPassword, signUp, sendMagicLink, sendPasswordReset } = useAuthActions();

  const authErrorMessage =
    searchParams.get("error") === "auth"
      ? { type: "error" as const, text: "Inloggen mislukt of link verlopen. Probeer opnieuw." }
      : null;
  const resolvedMessage = message ?? authErrorMessage;

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setMessage({ type: "error", text: "Vul e-mail en wachtwoord in." });
      return;
    }
    setMessage(null);
    const result = await loginWithPassword(email, password);
    if (!result.ok) {
      setMessage({ type: "error", text: result.message ?? "Inloggen mislukt." });
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setMessage({ type: "error", text: "Vul e-mail en wachtwoord in om een account aan te maken." });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "Kies een wachtwoord van minstens 6 tekens." });
      return;
    }
    setMessage(null);
    const result = await signUp(email, password);
    if (!result.ok) {
      setMessage({ type: "error", text: result.message ?? "Aanmaken account mislukt." });
      return;
    }
    if (result.hasSession) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    setMessage({
      type: "success",
      text: result.message ?? "Account aangemaakt.",
    });
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: "error", text: "Vul je e-mailadres in." });
      return;
    }
    setMessage(null);
    const result = await sendMagicLink(email);
    if (!result.ok) {
      setMessage({ type: "error", text: result.message ?? "Magic link versturen mislukt." });
      return;
    }
    setMessage({ type: "success", text: result.message ?? "Check je e-mail voor de magic link om in te loggen." });
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: "error", text: "Vul je e-mailadres in." });
      return;
    }
    setMessage(null);
    const result = await sendPasswordReset(email);
    if (!result.ok) {
      setMessage({ type: "error", text: result.message ?? "Resetlink versturen mislukt." });
      return;
    }
    setMessage({ type: "success", text: result.message ?? "Check je e-mail voor de resetlink." });
  }

  const reducedMotion = useReducedMotion();
  const panelTransition = reducedMotion ? { duration: 0 } : { duration: MOTION_DURATION.base, ease: EASE_SMOOTH };

  return (
    <AuthCardShell reducedMotion={reducedMotion}>
        <AnimatePresence mode="wait">
          {mode === "forgot" ? (
            <motion.div
              key="forgot"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={panelTransition}
            >
              <ForgotPasswordPanel
                email={email}
                isLoading={isLoading}
                loadingAction={loadingAction}
                message={resolvedMessage}
                onEmailChange={setEmail}
                onSubmitForgotPassword={handleForgotPassword}
                onBackToLogin={() => {
                  setMode("login");
                  setMessage(null);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={panelTransition}
            >
              <LoginPanel
                email={email}
                password={password}
                isLoading={isLoading}
                loadingAction={loadingAction}
                message={resolvedMessage}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onSubmitPasswordLogin={handlePasswordLogin}
                onSignUp={handleSignUp}
                onMagicLink={handleMagicLink}
                onForgotClick={() => {
                  setMode("forgot");
                  setMessage(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
    </AuthCardShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6">
          <p className="surface-card rounded-[var(--radius-card)] px-4 py-3 text-[13px] text-[var(--text-soft)]">
            Laden…
          </p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
