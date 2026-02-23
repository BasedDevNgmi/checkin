import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { Card } from "@/components/ui/Card";

interface ForgotPasswordPanelProps {
  email: string;
  isLoading: boolean;
  loadingAction: "password" | "magic" | "signup" | "forgot" | null;
  message: { type: "success" | "error"; text: string } | null;
  onEmailChange: (value: string) => void;
  onSubmitForgotPassword: (event: React.FormEvent) => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordPanel({
  email,
  isLoading,
  loadingAction,
  message,
  onEmailChange,
  onSubmitForgotPassword,
  onBackToLogin,
}: ForgotPasswordPanelProps) {
  return (
    <Card variant="glass" className="space-y-5">
      <h1 className="text-[22px] font-semibold text-[var(--text-primary)] text-center">
        Wachtwoord vergeten?
      </h1>
      <p className="text-[var(--text-muted)] text-[13px] text-center leading-relaxed">
        Vul je e-mail in en we sturen je een link om een nieuw wachtwoord te kiezen.
      </p>
      <form onSubmit={onSubmitForgotPassword} className="space-y-4">
        <Input
          id="forgot-email"
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="jouw@email.nl"
        />
        {message && <FormMessage tone={message.type}>{message.text}</FormMessage>}
        <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
          {loadingAction === "forgot" ? "Versturen…" : "Stuur resetlink"}
        </Button>
        <Button type="button" variant="secondary" onClick={onBackToLogin} disabled={isLoading} className="w-full">
          Terug naar inloggen
        </Button>
      </form>
    </Card>
  );
}
