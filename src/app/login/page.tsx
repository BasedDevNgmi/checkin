"use client";

import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { isLocalStorageMode } from "@/lib/storage-mode";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"password" | "magic" | "signup" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (isLocalStorageMode()) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth") {
      setMessage({ type: "error", text: "Inloggen mislukt of link verlopen. Probeer opnieuw." });
    }
  }, [searchParams]);

  if (isLocalStorageMode()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-6 shadow-[var(--shadow-zen)] backdrop-blur-xl text-center"
        >
          <p className="text-[var(--text-muted)] mb-4">Local storage mode – geen login nodig.</p>
          <Link
            href="/dashboard"
            className="inline-block rounded-[14px] bg-gradient-to-b from-[var(--accent-soft)] to-[var(--accent)] px-6 py-3 text-sm font-medium text-white shadow-[var(--shadow-zen)] transition hover:opacity-95"
          >
            Naar dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

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
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
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
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-6 shadow-[var(--shadow-zen)] backdrop-blur-xl"
      >
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] text-center mb-2">
          Inchecken
        </h1>
        <p className="text-[var(--text-muted)] text-sm text-center mb-5">
          Log in of maak een account om je check-ins te beheren en de 5 vragen bij te houden.
        </p>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:border-[var(--focus-ring)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-shadow)] transition"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Wachtwoord
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:border-[var(--focus-ring)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-shadow)] transition"
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              onClick={handlePasswordLogin}
              disabled={loading !== null}
              className="w-full rounded-[14px] bg-gradient-to-b from-[var(--accent-soft)] to-[var(--accent)] text-white py-3 font-medium shadow-[var(--shadow-zen)] hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 disabled:opacity-60 transition"
            >
              {loading === "password" ? "Even geduld…" : "Inloggen met wachtwoord"}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading !== null}
              className="w-full rounded-[14px] border-2 border-[var(--surface-border)] bg-transparent text-[var(--text-primary)] py-3 font-medium hover:bg-[var(--interactive-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 disabled:opacity-60 transition"
            >
              {loading === "signup" ? "Even geduld…" : "Account aanmaken"}
            </button>
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading !== null}
              className="w-full rounded-[14px] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] text-[var(--text-muted)] py-2.5 text-sm font-medium hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--surface-border)] disabled:opacity-60 transition"
            >
              {loading === "magic" ? "Versturen…" : "Magic link sturen (geen wachtwoord)"}
            </button>
          </div>
        </form>
        <p className="mt-5 text-center">
          <Link
            href="/"
            className="text-xs text-[var(--text-soft)] hover:text-[var(--text-muted)] transition"
          >
            Terug naar start
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6">
          <p className="text-sm text-[var(--text-soft)]">Laden…</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
