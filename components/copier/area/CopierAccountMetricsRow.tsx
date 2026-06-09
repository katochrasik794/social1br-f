import { CircleDollarSign, TrendingUp, Wallet } from "lucide-react";
import type { CopierAccountMetrics } from "@/lib/mock/copierArea";
import { money, pct } from "@/lib/utils";

type CopierAccountMetricsRowProps = {
  account: CopierAccountMetrics;
};

function FlagBadge({ code }: { code: string }) {
  const flags: Record<string, string> = { IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧" };
  return <span className="text-lg leading-none">{flags[code] ?? "🌐"}</span>;
}

const cardClass = "rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-md";

export default function CopierAccountMetricsRow({ account }: CopierAccountMetricsRowProps) {
  const initials = account.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const metrics = [
    {
      label: "Profit",
      value: money(account.profit),
      icon: TrendingUp,
      iconBg: "bg-green-50 dark:bg-green-950/50",
      iconColor: "text-green-600 dark:text-green-400",
      valueClass:
        account.profit < 0
          ? "text-red-500 dark:text-red-400"
          : account.profit > 0
            ? "text-green-600 dark:text-green-400"
            : "text-[var(--app-text-primary)]",
    },
    {
      label: "Floating profit",
      value: money(account.floatingProfit),
      icon: CircleDollarSign,
      iconBg: "bg-green-50 dark:bg-green-950/50",
      iconColor: "text-green-600 dark:text-green-400",
      valueClass:
        account.floatingProfit < 0
          ? "text-red-500 dark:text-red-400"
          : account.floatingProfit > 0
            ? "text-green-600 dark:text-green-400"
            : "text-[var(--app-text-primary)]",
    },
    {
      label: "Equity",
      value: money(account.equity),
      icon: Wallet,
      iconBg: "bg-violet-50 dark:bg-violet-950/50",
      iconColor: "text-violet-600 dark:text-violet-400",
      valueClass: "text-[var(--app-text-primary)]",
    },
    {
      label: "Gain",
      value: pct(account.gainPct),
      icon: TrendingUp,
      iconBg: "bg-green-50 dark:bg-green-950/50",
      iconColor: "text-green-600 dark:text-green-400",
      valueClass:
        account.gainPct < 0
          ? "text-red-500 dark:text-red-400"
          : account.gainPct > 0
            ? "text-green-600 dark:text-green-400"
            : "text-[var(--app-text-primary)]",
    },
  ];

  return (
    <div className={`px-5 py-5 sm:px-6 sm:py-6 ${cardClass}`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-50 text-base font-bold text-green-700 dark:bg-green-950/60 dark:text-green-300">
            {initials}
          </div>
          <div>
            <p className="text-base font-bold text-[var(--app-text-primary)] sm:text-lg">{account.name}</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-bold text-[var(--app-text-muted)]">
              <FlagBadge code={account.countryCode} />
              {account.country}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:gap-8">
          {metrics.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
              >
                <item.icon className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--app-text-muted)] sm:text-sm">{item.label}</p>
                <p className={`mt-0.5 text-sm font-bold sm:text-base ${item.valueClass}`}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
