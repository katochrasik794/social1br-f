"use client";

import { useMemo } from "react";
import { Info } from "lucide-react";
import type { CopierSummaryStats } from "@/lib/mock/copierArea";
import { money } from "@/lib/utils";

type CopierSummaryRingsProps = {
  stats: CopierSummaryStats;
};

function WaveFooter({ tone }: { tone: "green" | "blue" }) {
  const color =
    tone === "green"
      ? "text-green-200 dark:text-green-900/60"
      : "text-blue-200 dark:text-blue-900/60";

  return (
    <div className={`absolute bottom-0 left-0 right-0 h-10 overflow-hidden opacity-60 ${color}`}>
      <svg viewBox="0 0 200 24" preserveAspectRatio="none" className="h-full w-full">
        <path
          d="M0 14 C40 4 80 22 120 12 C160 4 180 18 200 10 L200 24 L0 24 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

function RingStat({
  value,
  label,
  bottom,
  greenPct = 0,
  bluePct = 0,
  redPct = 0,
  grayPct = 0,
  waveTone = "green",
}: {
  value: string;
  label: string;
  bottom: React.ReactNode;
  greenPct?: number;
  bluePct?: number;
  redPct?: number;
  grayPct?: number;
  waveTone?: "green" | "blue";
}) {
  const r = 34;
  const size = 88;
  const c = 2 * Math.PI * r;
  const greenLen = (greenPct / 100) * c;
  const blueLen = (bluePct / 100) * c;
  const redLen = (redPct / 100) * c;
  const grayLen = (grayPct / 100) * c;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 pb-5 pt-4 shadow-sm">
      <div className="mb-4 flex items-center gap-1.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-primary)]">{label}</p>
        <Info className="h-3.5 w-3.5 text-[var(--app-text-muted)]" />
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="relative h-[88px] w-[88px]">
          <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--app-surface-muted)" strokeWidth="6" />
            {redPct > 0 ? (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="#f87171"
                strokeWidth="6"
                strokeDasharray={`${redLen} ${c - redLen}`}
                strokeLinecap="round"
              />
            ) : null}
            {greenPct > 0 ? (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="var(--app-primary-solid)"
                strokeWidth="6"
                strokeDasharray={`${greenLen} ${c - greenLen}`}
                strokeDashoffset={-redLen}
                strokeLinecap="round"
              />
            ) : null}
            {bluePct > 0 ? (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="6"
                strokeDasharray={`${blueLen} ${c - blueLen}`}
                strokeDashoffset={-(redLen + greenLen)}
                strokeLinecap="round"
              />
            ) : null}
            {grayPct > 0 ? (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="#64748b"
                strokeWidth="6"
                strokeDasharray={`${grayLen} ${c - grayLen}`}
                strokeDashoffset={-(redLen + greenLen + blueLen)}
                strokeLinecap="round"
              />
            ) : null}
          </svg>
          {value ? (
            <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-[var(--app-text-primary)]">
              {value}
            </span>
          ) : null}
        </div>
        <div className="relative z-10 mt-4 w-full">{bottom}</div>
      </div>

      <WaveFooter tone={waveTone} />
    </div>
  );
}

export default function CopierSummaryRings({ stats }: CopierSummaryRingsProps) {
  const grossTotal = stats.grossProfit + stats.grossLoss || 1;
  const profitGreenPct = (stats.grossProfit / grossTotal) * 100;
  const profitRedPct = 100 - profitGreenPct;

  const tradeTotal = stats.winCount + stats.lossCount || 1;
  const winPct = (stats.winCount / tradeTotal) * 100;
  const lossPct = 100 - winPct;

  const dirTotal = stats.buyCount + stats.sellCount || 1;
  const buyPct = (stats.buyCount / dirTotal) * 100;
  const sellPct = 100 - buyPct;

  const pairTotal = stats.pairs.reduce((s, p) => s + p.count, 0) || 1;

  const rings = useMemo(
    () => [
      {
        value: stats.profitFactor.toFixed(2),
        label: "Profit Factor",
        greenPct: profitGreenPct,
        redPct: profitRedPct,
        waveTone: "green" as const,
        bottom: (
          <div className="flex items-center justify-between px-1 text-[11px] font-bold">
            <div className="flex flex-col items-start">
              <span className="text-green-600 dark:text-green-400">{money(stats.grossProfit)}</span>
              <span className="mt-0.5 font-bold text-[var(--app-text-muted)]">Gross Profit</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-red-500 dark:text-red-400">{money(stats.grossLoss)}</span>
              <span className="mt-0.5 font-bold text-[var(--app-text-muted)]">Gross Loss</span>
            </div>
          </div>
        ),
      },
      {
        value: String(stats.winCount + stats.lossCount),
        label: "Total Trades",
        greenPct: winPct,
        redPct: lossPct,
        waveTone: "green" as const,
        bottom: (
          <div className="flex items-center justify-between px-2 text-[11px] font-bold">
            <div className="flex flex-col items-start">
              <span className="text-green-600 dark:text-green-400">{stats.winCount}</span>
              <span className="mt-0.5 font-bold text-[var(--app-text-muted)]">Winning</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-red-500 dark:text-red-400">{stats.lossCount}</span>
              <span className="mt-0.5 font-bold text-[var(--app-text-muted)]">Losing</span>
            </div>
          </div>
        ),
      },
      {
        value: String(stats.buyCount + stats.sellCount),
        label: "Trade Direction",
        bluePct: buyPct,
        grayPct: sellPct,
        waveTone: "blue" as const,
        bottom: (
          <div className="flex items-center justify-between px-2 text-[11px] font-bold">
            <div className="flex flex-col items-start">
              <span className="text-blue-600 dark:text-blue-400">{stats.buyCount}</span>
              <span className="mt-0.5 font-bold text-[var(--app-text-muted)]">Buy</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[var(--app-text-primary)]">{stats.sellCount}</span>
              <span className="mt-0.5 font-bold text-[var(--app-text-muted)]">Sell</span>
            </div>
          </div>
        ),
      },
      {
        value: "",
        label: "Top Symbols",
        bluePct: pairTotal ? ((stats.pairs[0]?.count ?? 0) / pairTotal) * 100 : 0,
        greenPct: pairTotal ? ((stats.pairs[1]?.count ?? 0) / pairTotal) * 100 : 0,
        waveTone: "blue" as const,
        bottom: (
          <div className="space-y-1.5 px-1 text-[11px] font-bold">
            {stats.pairs.map((p) => (
              <div key={p.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: p.color === "var(--app-primary-solid)" ? "var(--app-primary-solid)" : p.color,
                    }}
                  />
                  <span className="uppercase text-[var(--app-text-muted)]">{p.symbol}</span>
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
    [stats, profitGreenPct, profitRedPct, winPct, lossPct, buyPct, sellPct, pairTotal]
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {rings.map((ring, i) => (
        <RingStat key={i} {...ring} />
      ))}
    </div>
  );
}
