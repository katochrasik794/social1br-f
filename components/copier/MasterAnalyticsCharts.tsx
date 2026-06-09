"use client";

import { useMemo, useState } from "react";
import EquityGrowthChart from "@/components/copier/charts/EquityGrowthChart";
import TradeDistributionChart from "@/components/copier/charts/TradeDistributionChart";
import ChartPeriodPills from "@/components/copier/charts/ChartPeriodPills";
import type { MasterHistoryTradeRow } from "@/lib/api/copier";
import { tradesToEquityGrowth, tradesToTradeDistribution } from "@/lib/copier/tradeHistoryTransforms";
import { getEquityGrowth, getTradeDistribution, type ChartPeriod } from "@/lib/mock/masterDetail";

type MasterAnalyticsChartsProps = {
  masterId?: string | number;
  closedTrades?: MasterHistoryTradeRow[];
  loading?: boolean;
  error?: string;
};

export default function MasterAnalyticsCharts({ masterId, closedTrades, loading, error }: MasterAnalyticsChartsProps) {
  const [period, setPeriod] = useState<ChartPeriod>("month");
  const mockId = typeof masterId === "number" ? masterId : 0;
  const useReal = closedTrades != null;

  const equityData = useMemo(
    () => (useReal ? tradesToEquityGrowth(closedTrades, period) : getEquityGrowth(mockId, period)),
    [useReal, closedTrades, mockId, period]
  );
  const tradeData = useMemo(
    () => (useReal ? tradesToTradeDistribution(closedTrades, period) : getTradeDistribution(mockId, period)),
    [useReal, closedTrades, mockId, period]
  );

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] text-sm text-[var(--app-text-muted)]">
        Loading charts…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-md border border-rose-200 bg-rose-50 px-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[var(--app-text-secondary)]">Results by period</p>
        <ChartPeriodPills value={period} onChange={setPeriod} />
      </div>

      <EquityGrowthChart data={equityData} period={period} />
      <TradeDistributionChart data={tradeData} period={period} />
    </div>
  );
}
