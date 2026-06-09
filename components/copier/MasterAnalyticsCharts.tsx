"use client";

import { useMemo, useState } from "react";
import EquityGrowthChart from "@/components/copier/charts/EquityGrowthChart";
import TradeDistributionChart from "@/components/copier/charts/TradeDistributionChart";
import ChartPeriodPills from "@/components/copier/charts/ChartPeriodPills";
import { getEquityGrowth, getTradeDistribution, type ChartPeriod } from "@/lib/mock/masterDetail";

type MasterAnalyticsChartsProps = {
  masterId: number;
};

export default function MasterAnalyticsCharts({ masterId }: MasterAnalyticsChartsProps) {
  const [period, setPeriod] = useState<ChartPeriod>("month");

  const equityData = useMemo(() => getEquityGrowth(masterId, period), [masterId, period]);
  const tradeData = useMemo(() => getTradeDistribution(masterId, period), [masterId, period]);

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
