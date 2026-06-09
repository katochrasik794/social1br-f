import { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  helper?: string;
  tone?: "primary" | "neutral";
};

export default function StatCard({ icon: Icon, label, value, helper, tone = "primary" }: StatCardProps) {
  return (
    <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">{label}</p>
          <p className="mt-1.5 text-xl font-bold tracking-tight text-[var(--app-text-primary)] sm:text-2xl">{value}</p>
          {helper ? <p className="mt-1 text-xs text-[var(--app-text-secondary)]">{helper}</p> : null}
        </div>
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
            tone === "primary"
              ? "bg-[color-mix(in_oklab,var(--app-primary-solid)_12%,var(--app-mix-base))] text-[color:var(--app-primary-solid)]"
              : "bg-[var(--app-surface-muted)] text-[var(--app-text-secondary)]"
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}
