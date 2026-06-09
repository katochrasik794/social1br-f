import { DollarSign, Percent, TrendingUp, Users, Wallet } from "lucide-react";
import { mockTopRatedStats } from "@/lib/mock/copier";
import { pct } from "@/lib/utils";

function compactMoney(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

const STATS = [
  {
    icon: Users,
    color: "#16a34a",
    bg: "bg-green-50 dark:bg-green-950/50",
    value: String(mockTopRatedStats.mastersShown),
    label: "Master Traders shown",
  },
  {
    icon: DollarSign,
    color: "#2563eb",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    value: compactMoney(mockTopRatedStats.totalProfit),
    label: "Total Profit (All time)",
  },
  {
    icon: Percent,
    color: "#7c3aed",
    bg: "bg-violet-50 dark:bg-violet-950/50",
    value: pct(mockTopRatedStats.averageGainPct),
    label: "Average Gain (All time)",
  },
  {
    icon: TrendingUp,
    color: "#ea580c",
    bg: "bg-orange-50 dark:bg-orange-950/50",
    value: `${mockTopRatedStats.profitableMastersPct}%`,
    label: "Profitable Masters",
  },
  {
    icon: Wallet,
    color: "#0d9488",
    bg: "bg-teal-50 dark:bg-teal-950/50",
    value: compactMoney(mockTopRatedStats.totalCopiedFunds),
    label: "Total Copied Funds",
  },
] as const;

export default function TopRatedStatsBar() {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-md sm:p-6">
      <div className="flex min-w-[720px] items-center sm:min-w-0">
        {STATS.map((stat, index) => (
          <div key={stat.label} className="flex flex-1 items-center">
            {index > 0 ? (
              <span
                className="mx-4 shrink-0 select-none text-xl font-light text-[var(--app-border)] sm:mx-5"
                aria-hidden
              >
                |
              </span>
            ) : null}
            <div className="flex min-w-0 flex-1 items-center gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}
                style={{ color: stat.color }}
              >
                <stat.icon className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-bold leading-tight text-[var(--app-text-primary)] sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 truncate text-xs font-bold text-[var(--app-text-muted)] sm:text-sm">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
