"use client";

import { useMemo, useState } from "react";
import { BarChart3, Clock } from "lucide-react";
import CopierSummaryRings from "@/components/copier/area/CopierSummaryRings";
import CopierHistoryTable from "@/components/copier/area/CopierHistoryTable";
import ChartPeriodPills, { type ChartPeriod } from "@/components/copier/charts/ChartPeriodPills";
import { getCopierMasterBundle, getCopierSummaryForPeriod } from "@/lib/mock/copierArea";

type MainTab = "summary" | "history";
type HistoryTab = "closed" | "open";

type CopierSummaryHistoryPanelProps = {
  masterId: number;
};

const cardClass = "overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-md";

export default function CopierSummaryHistoryPanel({ masterId }: CopierSummaryHistoryPanelProps) {
  const [mainTab, setMainTab] = useState<MainTab>("summary");
  const [historyTab, setHistoryTab] = useState<HistoryTab>("closed");
  const [period, setPeriod] = useState<ChartPeriod>("month");

  const periodData = useMemo(() => getCopierSummaryForPeriod(masterId, period), [masterId, period]);
  const bundle = useMemo(() => getCopierMasterBundle(masterId), [masterId]);

  const tabs = [
    { id: "summary" as const, label: "Summary", icon: BarChart3 },
    { id: "history" as const, label: "History", icon: Clock },
  ];

  return (
    <div className={cardClass}>
      <div className="flex shrink-0 border-b border-[var(--app-border)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = mainTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMainTab(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-2 px-4 py-4 text-xs font-bold uppercase tracking-wide transition sm:text-sm ${
                active
                  ? "text-green-600 dark:text-green-400"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {active ? (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 dark:bg-green-400" />
              ) : null}
            </button>
          );
        })}
      </div>

      {mainTab === "summary" ? (
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-[var(--app-text-muted)]">Calendar period</p>
            <ChartPeriodPills value={period} onChange={setPeriod} compact />
          </div>

          <div className="mt-5">
            <CopierSummaryRings stats={periodData.summary} />
          </div>
        </div>
      ) : (
        <div className="flex min-h-[calc(100dvh-22rem)] flex-col overflow-hidden">
          <div className="flex shrink-0 justify-center gap-8 border-b border-[var(--app-border)] px-4">
            {(
              [
                { id: "closed" as const, label: "Closed Trades" },
                { id: "open" as const, label: "Open Trades" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setHistoryTab(tab.id)}
                className={`border-b-2 px-2 py-4 text-xs font-bold uppercase tracking-wide transition sm:text-sm ${
                  historyTab === tab.id
                    ? "border-green-500 text-green-600 dark:border-green-400 dark:text-green-400"
                    : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-5">
            <CopierHistoryTable
              trades={historyTab === "closed" ? bundle.closedTrades : bundle.openTrades}
              mode={historyTab}
            />
          </div>
        </div>
      )}
    </div>
  );
}
