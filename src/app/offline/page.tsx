"use client";

import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { Card } from "@/components/ui/Card";
import { BrandLogo } from "@/components/BrandLogo";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-10">
      <Card variant="glass" className="space-y-4 text-center">
        <div className="flex justify-center">
          <BrandLogo compact />
        </div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Je bent offline</h1>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          Er is geen internetverbinding. Je check-ins blijven bewaard en synchroniseren zodra je weer online bent.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={() => window.location.reload()}>
            Opnieuw laden
          </Button>
          <LinkButton href="/dashboard" variant="secondary">
            Naar dashboard
          </LinkButton>
        </div>
      </Card>
    </main>
  );
}
