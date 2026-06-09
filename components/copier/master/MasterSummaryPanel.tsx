"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import MasterSummaryRings from "@/components/copier/master/MasterSummaryRings";
import MasterCumulativeChart from "@/components/copier/master/MasterCumulativeChart";
import CopierHistoryTable from "@/components/copier/area/CopierHistoryTable";
import ChartPeriodPills, { type ChartPeriod } from "@/components/copier/charts/ChartPeriodPills";
import { getCopierMasterBundle } from "@/lib/mock/copierArea";
import { getMasterSummaryForPeriod, mockMasterOverview } from "@/lib/mock/masterArea";

type MainTab = "summary" | "history";

export default function MasterSummaryPanel() {
  const [mainTab, setMainTab] = useState<MainTab>("summary");
  const [period, setPeriod] = useState<ChartPeriod>("year");
  const [historyTab, setHistoryTab] = useState<"closed" | "open">("closed");

  const periodData = useMemo(() => getMasterSummaryForPeriod(period), [period]);
  const trades = useMemo(() => getCopierMasterBundle(2), []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
        {/* Header with Tabs and Period Selector */}
        <div className="flex flex-col gap-4 border-b border-[var(--app-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-lg bg-[var(--app-surface-muted)] p-1">
            {(
              [
                { id: "summary" as const, label: "Summary" },
                { id: "history" as const, label: "History" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMainTab(tab.id)}
                className={`rounded-md px-6 py-1.5 text-xs font-bold transition ${
                  mainTab === tab.id
                    ? "bg-[color:var(--app-primary-solid)] text-white shadow-sm"
                    : "text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ChartPeriodPills value={period} onChange={setPeriod} compact />
          </div>
        </div>

        {mainTab === "summary" ? (
          <div className="space-y-12 p-6 sm:p-8">
            <MasterSummaryRings stats={periodData.summary} />
            <div className="border-t border-[var(--app-border)] pt-12">
              <MasterCumulativeChart data={periodData.cumulative} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-8 border-b border-[var(--app-border)] px-4">
              {(["closed", "open"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setHistoryTab(tab)}
                  className={`border-b-2 px-2 py-4 text-xs font-bold uppercase tracking-widest transition ${
                    historyTab === tab
                      ? "border-[color:var(--app-primary-solid)] text-[color:var(--app-primary-solid)]"
                      : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]"
                  }`}
                >
                  {tab === "closed" ? "Closed Trades" : "Open Trades"}
                </button>
              ))}
            </div>
            <div className="p-4 sm:p-6">
              <CopierHistoryTable
                trades={historyTab === "closed" ? trades.closedTrades : trades.openTrades}
                mode={historyTab}
              />
            </div>
          </>
        )}
      </div>

      {mockMasterOverview.suspicious ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-rose-500/30 dark:bg-rose-500/10">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-rose-800 dark:text-rose-300">Suspicious Activity Detected</p>
              <p className="mt-0.5 text-sm text-rose-700/80 dark:text-rose-300/70">
                Please review performance details and trade history carefully before proceeding.
              </p>
            </div>
          </div>
          <button type="button" className="shrink-0 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400">
            Learn More
          </button>
        </div>
      ) : null}
    </div>
  );
}
