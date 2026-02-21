"use client";

import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [loading, setLoading] = useState<"password" | "magic" | "signup" | "forgot" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const redirectBase =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : "");

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth") {
      setMessage({ type: "error", text: "Inloggen mislukt of link verlopen. Probeer opnieuw." });
    }
  }, [searchParams]);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setMessage({ type: "error", text: "Vul e-mail en wachtwoord in." });
      return;
    }
    setLoading("password");
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(null);
    if (error) {
      setMessage({ type: "error", text: error.message });
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
    setLoading("signup");
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${redirectBase}/auth/callback` },
    });
    setLoading(null);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    setMessage({
      type: "success",
      text: "Account aangemaakt. Check je e-mail om je account te bevestigen, daarna kun je inloggen.",
    });
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: "error", text: "Vul je e-mailadres in." });
      return;
    }
    setLoading("magic");
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${redirectBase}/auth/callback` },
    });
    setLoading(null);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({
      type: "success",
      text: "Check je e-mail voor de magic link om in te loggen.",
    });
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: "error", text: "Vul je e-mailadres in." });
      return;
    }
    setLoading("forgot");
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${redirectBase}/auth/callback?next=/login/update-password`,
    });
    setLoading(null);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({
      type: "success",
      text: "Check je e-mail voor de link om je wachtwoord opnieuw in te stellen.",
    });
  }

  const isLoading = loading !== null;
  const reducedMotion = useReducedMotion();
  const easing: [number, number, number, number] = [0.4, 0, 0.2, 1];
  const fadeTransition = reducedMotion ? { duration: 0 } : { duration: 0.4, ease: easing };
  const panelTransition = reducedMotion ? { duration: 0 } : { duration: 0.25, ease: easing };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={fadeTransition}
        className="w-full max-w-sm"
      >
        <AnimatePresence mode="wait">
          {mode === "forgot" ? (
            <motion.div
              key="forgot"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={panelTransition}
              className="space-y-5"
            >
              <h1 className="text-[22px] font-semibold text-[var(--text-primary)] text-center">
                Wachtwoord vergeten?
              </h1>
              <p className="text-[var(--text-muted)] text-[13px] text-center leading-relaxed">
                Vul je e-mail in en we sturen je een link om een nieuw wachtwoord te kiezen.
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Input
                  id="forgot-email"
                  label="E-mail"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jouw@email.nl"
                />
                {message && (
                  <p
                    role="alert"
                    aria-live="polite"
                    className={`text-[13px] ${
                      message.type === "success"
                        ? "text-[var(--text-success)]"
                        : "text-[var(--text-error)]"
                    }`}
                  >
                    {message.text}
                  </p>
                )}
                <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
                  {loading === "forgot" ? "Versturen…" : "Stuur resetlink"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMode("login");
                    setMessage(null);
                  }}
                  disabled={isLoading}
                  className="w-full"
                >
                  Terug naar inloggen
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={panelTransition}
            >
              <h1 className="text-[22px] font-semibold text-[var(--text-primary)] text-center tracking-[-0.02em]">
                Inloggen
              </h1>
              <p className="text-[var(--text-muted)] text-[13px] text-center mt-2 mb-8 leading-relaxed">
                Log in of maak een account om je check-ins bij te houden.
              </p>

              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <Input
                  id="email"
                  label="E-mail"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jouw@email.nl"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-[13px] font-medium text-[var(--text-primary)]">
                      Wachtwoord
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setMessage(null);
                      }}
                      className="text-xs link-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded"
                    >
                      Wachtwoord vergeten?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                {message && (
                  <p
                    role="alert"
                    aria-live="polite"
                    className={`text-[13px] ${
                      message.type === "success"
                        ? "text-[var(--text-success)]"
                        : "text-[var(--text-error)]"
                    }`}
                  >
                    {message.text}
                  </p>
                )}

                <div className="flex flex-col gap-2.5 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {loading === "password" ? "Even geduld…" : "Inloggen"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSignUp}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {loading === "signup" ? "Even geduld…" : "Account aanmaken"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleMagicLink}
                    disabled={isLoading}
                    className="w-full text-[var(--text-muted)]"
                  >
                    {loading === "magic" ? "Versturen…" : "Magic link (geen wachtwoord)"}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6">
          <p className="text-[13px] text-[var(--text-soft)]">Laden…</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
