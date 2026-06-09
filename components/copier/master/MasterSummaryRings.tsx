"use client";

import { useMemo } from "react";
import type { CopierSummaryStats } from "@/lib/mock/copierArea";
import { money } from "@/lib/utils";

type MasterSummaryRingsProps = {
  stats: CopierSummaryStats;
};

function RingStat({
  value,
  label,
  bottom,
  greenPct = 0,
  bluePct = 0,
  redPct = 0,
}: {
  value: string;
  label: string;
  bottom: React.ReactNode;
  greenPct?: number;
  bluePct?: number;
  redPct?: number;
}) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const greenLen = (greenPct / 100) * c;
  const blueLen = (bluePct / 100) * c;
  const redLen = (redPct / 100) * c;

  return (
    <div className="flex flex-col items-center text-center">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[var(--app-text-primary)]">{label}</p>
      <div className="relative h-[96px] w-[96px]">
        <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="var(--app-surface-muted)" strokeWidth="7" />
          {redPct > 0 ? (
            <circle cx="48" cy="48" r={r} fill="none" stroke="#f87171" strokeWidth="7" strokeDasharray={`${redLen} ${c - redLen}`} strokeLinecap="round" />
          ) : null}
          {greenPct > 0 ? (
            <circle
              cx="48"
              cy="48"
              r={r}
              fill="none"
              stroke="var(--app-primary-solid)"
              strokeWidth="7"
              strokeDasharray={`${greenLen} ${c - greenLen}`}
              strokeDashoffset={-redLen}
              strokeLinecap="round"
            />
          ) : null}
          {bluePct > 0 ? (
            <circle cx="48" cy="48" r={r} fill="none" stroke="#3b82f6" strokeWidth="7" strokeDasharray={`${blueLen} ${c - blueLen}`} strokeLinecap="round" />
          ) : null}
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[var(--app-text-primary)]">{value}</span>
      </div>
      <div className="mt-6 w-full">{bottom}</div>
    </div>
  );
}

/** Profit Factor + Top Symbols only (master area) */
export default function MasterSummaryRings({ stats }: MasterSummaryRingsProps) {
  const pairTotal = stats.pairs.reduce((s, p) => s + p.count, 0);
  const pairGreenPct = pairTotal ? ((stats.pairs[1]?.count ?? 0) / pairTotal) * 100 : 0;
  const pairBluePct = pairTotal ? ((stats.pairs[0]?.count ?? 0) / pairTotal) * 100 : 0;

  const rings = useMemo(
    () => [
      {
        value: stats.profitFactor.toFixed(2),
        label: "Profit Factor",
        greenPct: 68,
        redPct: 32,
        bottom: (
          <div className="flex items-center justify-between px-2 text-[11px] font-bold">
            <div className="flex flex-col items-start">
              <span className="text-[color:var(--app-primary-solid)]">{money(stats.grossProfit)}</span>
              <span className="mt-0.5 font-medium text-[var(--app-text-muted)]">Gross Profit</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-rose-500">{money(stats.grossLoss)}</span>
              <span className="mt-0.5 font-medium text-[var(--app-text-muted)]">Gross Loss</span>
            </div>
          </div>
        ),
      },
      {
        value: "",
        label: "Top Symbols",
        greenPct: pairGreenPct,
        bluePct: pairBluePct,
        bottom: (
          <div className="space-y-2 px-2 text-[11px] font-bold">
            {stats.pairs.map((p) => (
              <div key={p.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: p.color === "var(--app-primary-solid)" ? "var(--app-primary-solid)" : p.color }}
                  />
                  <span className="text-[var(--app-text-muted)] uppercase">{p.symbol}</span>
                </div>
                <span className="text-[var(--app-text-primary)]">
                  {p.count} ({Math.round((p.count / pairTotal) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        ),
      },
    ],
    [stats, pairGreenPct, pairBluePct, pairTotal]
  );

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      {rings.map((ring, i) => (
        <RingStat key={i} {...ring} />
      ))}
    </div>
  );
}
