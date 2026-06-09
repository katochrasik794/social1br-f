"use client";

import { useMemo, useState } from "react";
import TimeRangePills, { type TimeRange } from "@/components/copier/TimeRangePills";
import ProfitLossBar from "@/components/copier/ProfitLossBar";
import type { MasterHistoryTradeRow, TopRatedMaster } from "@/lib/api/copier";
import { tradesToPerformance } from "@/lib/copier/tradeHistoryTransforms";
import { getPerformanceForRange } from "@/lib/mock/masterDetail";
import { pct } from "@/lib/utils";

type MasterPerformanceSectionProps = {
  master: TopRatedMaster;
  closedTrades?: MasterHistoryTradeRow[];
  balance?: number;
};

export default function MasterPerformanceSection({ master, closedTrades, balance }: MasterPerformanceSectionProps) {
  const [range, setRange] = useState<TimeRange>("3M");
  const useReal = closedTrades != null;

  const perf = useMemo(
    () =>
      useReal
        ? tradesToPerformance(closedTrades, range, balance ?? master.aum ?? 0, master.copiers, master.copiersDelta)
        : getPerformanceForRange(master, range),
    [useReal, closedTrades, range, balance, master]
  );

  return (
    <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-[var(--app-text-primary)]">Performance</h2>

      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <TimeRangePills value={range} onChange={setRange} />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-10 lg:gap-14">
          <div>
            <p className="text-sm text-[var(--app-text-muted)]">Gain</p>
            <p className="mt-1 text-2xl font-bold text-[var(--app-text-primary)]">{pct(perf.gainPct)}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--app-text-muted)]">Copiers</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--app-text-primary)]">{perf.copiers}</span>
              <span className="text-[15px] font-semibold text-[color:var(--app-primary-solid)]">↑ {perf.copiersDelta}</span>
            </p>
          </div>
          <div className="min-w-[160px] sm:min-w-[200px]">
            <ProfitLossBar profit={perf.profit} loss={perf.loss} variant="performance" />
          </div>
        </div>
      </div>
    </div>
  );
}
