"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion, useReducedMotion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasRecovery, setHasRecovery] = useState<boolean | null>(null);
  const reducedMotion = useReducedMotion();
  const easing: [number, number, number, number] = [0.4, 0, 0.2, 1];

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setHasRecovery(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHasRecovery(!!data.user);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || password.length < 6) {
      setMessage({ type: "error", text: "Kies een wachtwoord van minstens 6 tekens." });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: "error", text: "De wachtwoorden komen niet overeen." });
      return;
    }
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "success", text: "Wachtwoord bijgewerkt. Je wordt doorgestuurd…" });
    router.push("/dashboard");
    router.refresh();
  }

  const fadeTransition = reducedMotion ? { duration: 0 } : { duration: 0.4, ease: easing };

  if (hasRecovery === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-[13px] text-[var(--text-soft)]">Laden…</p>
      </div>
    );
  }

  if (hasRecovery === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fadeTransition}
          className="w-full max-w-sm text-center"
        >
          <p className="text-[var(--text-muted)] text-[13px] mb-6">
            Deze link is ongeldig of verlopen. Vraag een nieuwe resetlink aan.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent)] px-5 py-3 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[var(--accent-soft)] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          >
            Naar inloggen
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={fadeTransition}
        className="w-full max-w-sm"
      >
        <h1 className="text-[22px] font-semibold text-[var(--text-primary)] text-center mb-1">
          Nieuw wachtwoord
        </h1>
        <p className="text-[var(--text-muted)] text-[13px] text-center mb-8">
          Kies een nieuw wachtwoord voor je account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="password"
            label="Wachtwoord"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 tekens"
          />
          <Input
            id="confirm"
            label="Wachtwoord bevestigen"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Herhaal wachtwoord"
          />

          {message && (
            <p
              role="alert"
              aria-live="polite"
              className={`text-[13px] ${
                message.type === "success" ? "text-[var(--text-success)]" : "text-[var(--text-error)]"
              }`}
            >
              {message.text}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={loading} className="w-full">
            {loading ? "Bezig…" : "Wachtwoord opslaan"}
          </Button>
        </form>

        <p className="mt-8 text-center">
          <Link href="/login" className="link-muted text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded-sm">
            Terug naar inloggen
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
