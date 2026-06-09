import { MapPin, TrendingDown, TrendingUp, LineChart } from "lucide-react";
import type { MasterAccountHeader } from "@/lib/mock/masterArea";
import { money, pct } from "@/lib/utils";

type MasterAccountHeaderCardProps = {
  account: MasterAccountHeader;
};

function FlagBadge({ code }: { code: string }) {
  const flags: Record<string, string> = { IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧" };
  return <span className="text-sm leading-none">{flags[code] ?? "🌐"}</span>;
}

export default function MasterAccountHeaderCard({ account }: MasterAccountHeaderCardProps) {
  const loss = account.profit < 0;

  const metrics = [
    {
      label: "Profit",
      value: money(account.profit),
      sub: pct(account.profitChangePct),
      negative: loss,
      showTrend: true,
    },
    {
      label: "Floating Profit",
      value: money(account.floatingProfit),
      negative: account.floatingProfit < 0,
      showTrend: false,
    },
    {
      label: "Equity",
      value: money(account.equity),
      negative: false,
      showTrend: false,
    },
    {
      label: "Gain",
      value: pct(account.gainPct),
      negative: account.gainPct < 0,
      showTrend: true,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
      <div className="flex min-h-[132px] flex-col lg:min-h-[148px] lg:flex-row">
        {/* Green left panel — solid fill, slanted edge via clip-path */}
        <div
          className="relative flex shrink-0 items-center bg-[color:var(--app-primary-solid)] px-6 py-7 text-white lg:w-[340px] lg:px-8 lg:py-8 lg:[clip-path:polygon(0_0,100%_0,calc(100%-18px)_50%,100%_100%,0_100%)]"
        >
          <div className="flex items-center gap-4">
            {/* Icon + gold ring */}
            <div className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[color:var(--app-luxury-gold)]/40" />
              <div className="absolute inset-1.5 rounded-full border border-white/25" />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[color:var(--app-primary-solid)] shadow-md">
                <LineChart className="h-5 w-5" strokeWidth={2.5} />
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
                Master Performance
              </p>
              <h1 className="mt-1 text-lg font-bold leading-snug">{account.title}</h1>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--app-luxury-gold)]/30 bg-white/10 px-2.5 py-1 text-[11px] font-medium">
                <FlagBadge code={account.countryCode} />
                <MapPin className="h-3 w-3 text-[color:var(--app-luxury-gold-light)]" />
                <span>{account.country}</span>
              </div>
            </div>
          </div>
        </div>

        {/* White metrics */}
        <div className="flex flex-1 items-center px-4 py-6 lg:px-6 lg:py-0">
          <div className="grid w-full grid-cols-2 gap-y-6 sm:grid-cols-4">
            {metrics.map((item, idx) => (
              <div key={item.label} className="relative flex flex-col items-center justify-center px-2 text-center">
                {idx > 0 ? (
                  <span
                    className="absolute -left-px top-1/2 hidden -translate-y-1/2 text-lg font-light text-[var(--app-border)] sm:inline"
                    aria-hidden
                  >
                    |
                  </span>
                ) : null}

                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                  {item.label}
                </p>
                <p
                  className={`mt-1.5 text-base font-bold sm:text-lg ${
                    item.negative ? "text-rose-500" : "text-[var(--app-text-primary)]"
                  }`}
                >
                  {item.value}
                </p>

                <div className="mt-1 min-h-[18px]">
                  {item.showTrend && item.sub ? (
                    <span
                      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        item.negative
                          ? "bg-rose-500/10 text-rose-500"
                          : "text-[color:var(--app-primary-solid)]"
                      }`}
                    >
                      {item.negative ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <TrendingUp className="h-3 w-3" />
                      )}
                      {item.sub}
                    </span>
                  ) : item.negative && item.showTrend ? (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                      <TrendingDown className="h-3 w-3" />
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
