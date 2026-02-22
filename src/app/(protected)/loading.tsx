export default function ProtectedLoading() {
  return (
    <div className="space-y-4 py-2">
      <div className="glass-card rounded-[var(--radius-card)] p-5">
        <div className="h-5 w-40 animate-pulse rounded-[var(--radius-control)] bg-[var(--interactive-hover)]" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[var(--interactive-hover)]" />
      </div>
      <div className="glass-card rounded-[var(--radius-card)] p-5">
        <div className="h-4 w-full animate-pulse rounded bg-[var(--interactive-hover)]" />
        <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-[var(--interactive-hover)]" />
      </div>
      <p className="text-[13px] text-[var(--text-soft)]">Pagina laden…</p>
    </div>
  );
}
