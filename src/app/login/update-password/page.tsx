"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion, useReducedMotion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { AuthCardShell } from "@/features/auth/components/AuthCardShell";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { EASE_SMOOTH, MOTION_DURATION } from "@/lib/motion";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasRecovery, setHasRecovery] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    return window.location.hash.includes("type=recovery") ? true : null;
  });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (hasRecovery != null) {
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHasRecovery(!!data.user);
    });
  }, [hasRecovery]);

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

  const fadeTransition = reducedMotion ? { duration: 0 } : { duration: MOTION_DURATION.enter, ease: EASE_SMOOTH };

  if (hasRecovery === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="glass-card rounded-[var(--radius-card)] px-4 py-3 text-[13px] text-[var(--text-soft)]">
          Laden…
        </p>
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
          <Card variant="glass" className="text-center">
          <p className="text-[var(--text-muted)] text-[13px] mb-6">
            Deze link is ongeldig of verlopen. Vraag een nieuwe resetlink aan.
          </p>
          <LinkButton href="/">
            Naar inloggen
          </LinkButton>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthCardShell reducedMotion={reducedMotion}>
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={fadeTransition}
      >
        <Card variant="glass">
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
            <FormMessage tone={message.type}>
              {message.text}
            </FormMessage>
          )}

          <Button type="submit" variant="primary" disabled={loading} className="w-full">
            {loading ? "Bezig…" : "Wachtwoord opslaan"}
          </Button>
        </form>

        <p className="mt-8 text-center">
          <Link href="/" className="link-muted text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded-sm">
            Terug naar inloggen
          </Link>
        </p>
        </Card>
      </motion.div>
    </AuthCardShell>
  );
}
