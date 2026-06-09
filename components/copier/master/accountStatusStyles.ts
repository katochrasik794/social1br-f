export function accountStatusBadgeClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "active") {
    return "border-green-500/50 bg-green-50 text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-400";
  }
  if (normalized === "archived") {
    return "border-amber-400/60 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400";
  }
  return "border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]";
}
