import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";

interface LoginPanelProps {
  email: string;
  password: string;
  isLoading: boolean;
  loadingAction: "password" | "magic" | "signup" | "forgot" | null;
  message: { type: "success" | "error"; text: string } | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmitPasswordLogin: (event: React.FormEvent) => void;
  onSignUp: (event: React.FormEvent) => void;
  onMagicLink: (event: React.FormEvent) => void;
  onForgotClick: () => void;
}

export function LoginPanel({
  email,
  password,
  isLoading,
  loadingAction,
  message,
  onEmailChange,
  onPasswordChange,
  onSubmitPasswordLogin,
  onSignUp,
  onMagicLink,
  onForgotClick,
}: LoginPanelProps) {
  return (
    <div className="glass-card rounded-[var(--radius-card)] p-5 sm:p-6">
      <h1 className="text-[22px] font-semibold text-[var(--text-primary)] text-center tracking-[-0.02em]">
        Inloggen
      </h1>
      <p className="text-[var(--text-muted)] text-[13px] text-center mt-2 mb-8 leading-relaxed">
        Log in of maak een account om je check-ins bij te houden.
      </p>

      <form onSubmit={onSubmitPasswordLogin} className="space-y-4">
        <Input
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="jouw@email.nl"
        />
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-[13px] font-medium text-[var(--text-primary)]">
              Wachtwoord
            </label>
            <button
              type="button"
              onClick={onForgotClick}
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
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="••••••••"
          />
        </div>

        {message && <FormMessage tone={message.type}>{message.text}</FormMessage>}

        <div className="flex flex-col gap-2.5 pt-2">
          <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
            {loadingAction === "password" ? "Even geduld…" : "Inloggen"}
          </Button>
          <Button type="button" variant="secondary" onClick={onSignUp} disabled={isLoading} className="w-full">
            {loadingAction === "signup" ? "Even geduld…" : "Account aanmaken"}
          </Button>
          <Button type="button" variant="ghost" onClick={onMagicLink} disabled={isLoading} className="w-full text-[var(--text-muted)]">
            {loadingAction === "magic" ? "Versturen…" : "Magic link (geen wachtwoord)"}
          </Button>
        </div>
      </form>
    </div>
  );
}
