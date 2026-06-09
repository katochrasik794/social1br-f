import { money } from "@/lib/utils";

type ProfitLossBarProps = {
  profit: number;
  loss: number;
  variant?: "compact" | "performance";
};

export default function ProfitLossBar({ profit, loss, variant = "compact" }: ProfitLossBarProps) {
  const total = profit + loss || 1;
  const profitPct = (profit / total) * 100;

  if (variant === "performance") {
    return (
      <div>
        <p className="text-sm text-[var(--app-text-muted)]">Profit And Loss</p>
        <div className="mt-1 flex justify-between gap-4 text-base font-bold text-[var(--app-text-primary)]">
          <span>{money(profit)}</span>
          <span>{money(loss)}</span>
        </div>
        <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-[var(--app-surface-muted)]">
          <div
            className="h-full bg-[color:var(--app-primary-solid)] transition-all"
            style={{ width: `${Math.max(profitPct, profit > 0 && loss === 0 ? 100 : profitPct)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[140px]">
      <div className="flex justify-between gap-2 text-sm">
        <span className="font-bold text-green-600 dark:text-green-400">{money(profit)}</span>
        <span className="font-bold text-red-500 dark:text-red-400">{money(loss)}</span>
      </div>
      <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-[var(--app-surface-muted)]">
        <div className="bg-green-500 transition-all dark:bg-green-500" style={{ width: `${profitPct}%` }} />
        <div className="flex-1 bg-red-400 dark:bg-red-500" />
      </div>
    </div>
  );
}
