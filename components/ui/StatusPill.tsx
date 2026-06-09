import { cn } from "@/lib/utils";

const toneMap = {
  primary: "border-[color-mix(in_oklab,var(--app-primary-solid)_30%,transparent)] bg-[color-mix(in_oklab,var(--app-primary-solid)_10%,var(--app-mix-base))] text-[color:var(--app-primary-solid)]",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  paused: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  stopped: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  rejected: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  neutral: "border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-secondary)]",
};

type StatusPillProps = {
  label: string;
  tone?: keyof typeof toneMap;
  className?: string;
};

export default function StatusPill({ label, tone = "neutral", className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        toneMap[tone],
        className
      )}
    >
      {label}
    </span>
  );
}

export function RiskPill({ level }: { level: "Low" | "Medium" | "High" | string }) {
  const tone =
    level === "Low" ? "active" : level === "Medium" ? "paused" : level === "High" ? "stopped" : "neutral";
  return <StatusPill label={level} tone={tone} />;
}

export function statusToTone(status: string): keyof typeof toneMap {
  const s = status.toLowerCase();
  if (s === "active" || s === "approved") return "active";
  if (s === "paused" || s === "pending") return "paused";
  if (s === "stopped" || s === "rejected") return "stopped";
  return "neutral";
}
