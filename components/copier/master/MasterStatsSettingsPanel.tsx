"use client";

import { useMemo, useState } from "react";
import CopierSummaryRings from "@/components/copier/area/CopierSummaryRings";
import DataTable, { type Column } from "@/components/ui/DataTable";
import {
  getMasterAccountStats,
  mockMasterSettings,
  type MasterAccountStatsBundle,
  type MasterAttachedAccount,
  type MasterHistoryTrade,
  type MasterSettings,
} from "@/lib/mock/masterArea";
import { money, pct } from "@/lib/utils";

type MainTab = "statistics" | "settings";
type StatsTab = "commission" | "summary" | "history";
type HistoryTab = "closed" | "open";

type CommissionRow = Record<string, unknown> & {
  id: string;
  weekLabel: string;
  amount: number;
};

type HistoryRow = Record<string, unknown> & {
  id: string;
  orderId: string;
  volume: number;
  type: string;
  symbol: string;
  openTime: string;
  closeTime: string;
  openPrice: string;
  closePrice: string;
  tpSl: string;
  pips: number | null;
  commission: string;
  profit: number;
};

function toHistoryRows(trades: MasterHistoryTrade[]): HistoryRow[] {
  return trades.map((t) => ({
    id: t.id,
    orderId: t.orderId,
    volume: t.volume,
    type: t.type,
    symbol: t.symbol ?? "—",
    openTime: t.openTime ?? "—",
    closeTime: t.closeTime ?? "",
    openPrice: t.openPrice ?? "—",
    closePrice: t.closePrice ?? "",
    tpSl: t.tpSl ?? "—",
    pips: t.pips ?? null,
    commission: t.commission ?? "—",
    profit: t.profit,
  }));
}

function StackedCell({ primary, secondary }: { primary: string; secondary?: string }) {
  if (!secondary) return <span>{primary}</span>;
  return (
    <div className="space-y-0.5 text-xs leading-tight">
      <p>{primary}</p>
      <p className="text-[var(--app-text-muted)]">{secondary}</p>
    </div>
  );
}

function AccountContextBar({ account }: { account: MasterAttachedAccount }) {
  const archived = account.status === "Archived";

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)]/40 px-4 py-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Showing data for</p>
        <p className="mt-0.5 text-sm font-bold text-[var(--app-text-primary)]">
          {account.platform} · {account.login}
        </p>
      </div>
      <span
        className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
          archived
            ? "border-rose-300 text-rose-500 dark:border-rose-500/40"
            : "border-[color:var(--app-primary-solid)]/40 text-[color:var(--app-primary-solid)]"
        }`}
      >
        {account.status}
      </span>
    </div>
  );
}

function CommissionPayoutsPanel({ stats }: { stats: MasterAccountStatsBundle }) {
  const rows: CommissionRow[] = stats.commissionPayouts;
  const total = rows.reduce((s, p) => s + p.amount, 0);

  const columns: Column<CommissionRow>[] = [
    { key: "weekLabel", label: "Week" },
    {
      key: "amount",
      label: "Commission",
      render: (row) => <span className="font-semibold">{money(row.amount)}</span>,
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DataTable
        className="min-h-0 flex-1"
        title="Commission Payouts"
        columns={columns}
        data={rows}
        showSearch
        searchPlaceholder="Search by week..."
        searchableColumns={["weekLabel"]}
        dateColumn=""
        statusColumn=""
        emptyMessage="No commission payouts found"
      />
      <div className="mt-3 flex items-center justify-between rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)]/40 px-4 py-3">
        <span className="text-sm font-bold text-[var(--app-text-primary)]">Total</span>
        <span className="text-sm font-bold text-[color:var(--app-primary-solid)]">{money(total)}</span>
      </div>
    </div>
  );
}

function HistoryPanel({ mode, stats }: { mode: HistoryTab; stats: MasterAccountStatsBundle }) {
  const rows = useMemo(
    () => toHistoryRows(mode === "closed" ? stats.closedTrades : stats.openTrades),
    [mode, stats]
  );

  const columns: Column<HistoryRow>[] = useMemo(
    () => [
      { key: "orderId", label: "Order ID", render: (row) => <span className="font-medium">{row.orderId}</span> },
      { key: "volume", label: "Vol", render: (row) => row.volume.toFixed(2) },
      { key: "type", label: "Type" },
      { key: "symbol", label: "Symbol" },
      {
        key: "openTime",
        label: mode === "closed" ? "Open / Close Time" : "Open Time",
        render: (row) => (
          <StackedCell primary={row.openTime} secondary={mode === "closed" ? row.closeTime : undefined} />
        ),
      },
      {
        key: "openPrice",
        label: mode === "closed" ? "Open / Close Price" : "Open Price",
        render: (row) => (
          <StackedCell primary={row.openPrice} secondary={mode === "closed" ? row.closePrice : undefined} />
        ),
      },
      {
        key: "tpSl",
        label: "TP / SL",
        render: (row) =>
          row.tpSl !== "—" ? (
            <span className="rounded bg-rose-500/5 px-1.5 py-0.5 text-rose-500">{row.tpSl}</span>
          ) : (
            "—"
          ),
      },
      {
        key: "pips",
        label: "Pips",
        render: (row) =>
          row.pips === null ? (
            "—"
          ) : (
            <span className={row.pips > 0 ? "text-[color:var(--app-primary-solid)]" : row.pips < 0 ? "text-rose-500" : ""}>
              {row.pips > 0 ? "+" : ""}
              {row.pips}
            </span>
          ),
      },
      { key: "commission", label: "Commission" },
      {
        key: "profit",
        label: "Profit",
        render: (row) => (
          <span
            className={`font-semibold ${
              row.profit > 0
                ? "text-[color:var(--app-primary-solid)]"
                : row.profit < 0
                  ? "text-rose-500"
                  : "text-[var(--app-text-primary)]"
            }`}
          >
            {money(row.profit)}
          </span>
        ),
      },
    ],
    [mode]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DataTable
        className="min-h-0 flex-1"
        title={mode === "closed" ? "Closed Trades" : "Open Trades"}
        columns={columns}
        data={rows}
        showSearch
        searchPlaceholder="Search order ID, symbol..."
        searchableColumns={["orderId", "symbol", "type"]}
        dateColumn=""
        statusColumn=""
        emptyMessage="No trades found"
      />
    </div>
  );
}

function SummaryPanel({ stats }: { stats: MasterAccountStatsBundle }) {
  const bottom = stats.summaryBottom;

  return (
    <div className="space-y-5 overflow-y-auto">
      <CopierSummaryRings stats={stats.summaryStats} />

      <div className="flex flex-wrap items-center justify-center gap-3 border-t border-[var(--app-border)] pt-4 sm:gap-0">
        {[
          { label: "Equity", value: money(bottom.equity) },
          { label: "Balance", value: money(bottom.balance) },
          { label: "Leverage", value: bottom.leverage },
          { label: "Average daily", value: pct(bottom.avgDailyPct), negative: bottom.avgDailyPct < 0 },
          { label: "This month", value: pct(bottom.monthPct), negative: bottom.monthPct < 0 },
        ].map((item, idx) => (
          <div key={item.label} className="flex items-center">
            {idx > 0 ? (
              <span className="mx-4 hidden text-lg font-light text-[var(--app-border)] sm:inline" aria-hidden>
                |
              </span>
            ) : null}
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">{item.label}</p>
              <p
                className={`mt-1 text-sm font-bold ${
                  "negative" in item && item.negative ? "text-rose-500" : "text-[var(--app-text-primary)]"
                }`}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel({ settings }: { settings: MasterSettings }) {
  const fields = [
    { label: "Display Name", value: settings.displayName },
    { label: "Headline", value: settings.headline },
    { label: "Strategy", value: settings.strategy, wide: true },
    { label: "Commission", value: `${settings.commissionPct}%` },
    { label: "Min Copy Amount", value: money(settings.minCopyAmount) },
    { label: "Risk Level", value: settings.riskLevel },
  ];

  return (
    <div className="space-y-6 overflow-y-auto p-1">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.label} className={f.wide ? "sm:col-span-2" : ""}>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">{f.label}</label>
            <input
              readOnly
              defaultValue={f.value}
              className="mt-1.5 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)]/40 px-3 py-2 text-sm text-[var(--app-text-primary)] outline-none focus:border-[color:var(--app-primary-solid)]"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-6">
        {[
          { label: "Public profile", checked: settings.publicProfile },
          { label: "Accept new copiers", checked: settings.acceptNewCopiers },
        ].map((toggle) => (
          <label key={toggle.label} className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--app-text-primary)]">
            <input
              type="checkbox"
              defaultChecked={toggle.checked}
              className="h-4 w-4 rounded border-[var(--app-border)] accent-[color:var(--app-primary-solid)]"
            />
            {toggle.label}
          </label>
        ))}
      </div>

      <button
        type="button"
        className="rounded-lg bg-[color:var(--app-primary-solid)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
      >
        Save Settings
      </button>
    </div>
  );
}

export default function MasterStatsSettingsPanel({ account }: { account: MasterAttachedAccount }) {
  const [mainTab, setMainTab] = useState<MainTab>("statistics");
  const [statsTab, setStatsTab] = useState<StatsTab>("commission");
  const [historyTab, setHistoryTab] = useState<HistoryTab>("closed");

  const accountStats = useMemo(() => getMasterAccountStats(account.id), [account.id]);

  const statsTabs = useMemo(
    () =>
      [
        { id: "commission" as const, label: "Commission payouts" },
        { id: "summary" as const, label: "Summary" },
        { id: "history" as const, label: "History" },
      ] as const,
    []
  );

  return (
    <div className="flex min-h-[calc(100dvh-22rem)] flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
      {/* Main tabs */}
      <div className="grid shrink-0 grid-cols-2 border-b border-[var(--app-border)]">
        {(
          [
            { id: "statistics" as const, label: "Statistics" },
            { id: "settings" as const, label: "Settings" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMainTab(tab.id)}
            className={`py-4 text-sm font-bold uppercase tracking-[0.12em] transition ${
              mainTab === tab.id
                ? "bg-[var(--app-surface)] text-[var(--app-text-primary)]"
                : "bg-[var(--app-surface-muted)]/60 text-[var(--app-text-muted)] hover:text-[var(--app-text-secondary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mainTab === "statistics" ? (
        <>
          <div className="flex shrink-0 justify-center gap-8 border-b border-[var(--app-border)] px-4">
            {statsTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatsTab(tab.id)}
                className={`relative py-3.5 text-xs font-semibold transition ${
                  statsTab === tab.id
                    ? "text-[var(--app-text-primary)]"
                    : "text-[var(--app-text-muted)] hover:text-[var(--app-text-secondary)]"
                }`}
              >
                {tab.label}
                {statsTab === tab.id ? (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--app-primary-solid)]" />
                ) : null}
              </button>
            ))}
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 sm:p-6">
            <AccountContextBar account={account} />

            {statsTab === "commission" ? <CommissionPayoutsPanel stats={accountStats} /> : null}
            {statsTab === "summary" ? <SummaryPanel stats={accountStats} /> : null}
            {statsTab === "history" ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="mb-4 flex shrink-0 justify-center gap-8">
                  {(["closed", "open"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setHistoryTab(tab)}
                      className={`border-b-2 px-1 pb-2 text-[10px] font-bold uppercase tracking-wide transition ${
                        historyTab === tab
                          ? "border-[color:var(--app-primary-solid)] text-[color:var(--app-primary-solid)]"
                          : "border-transparent text-[var(--app-text-muted)]"
                      }`}
                    >
                      {tab === "closed" ? "Closed Trades" : "Open Trades"}
                    </button>
                  ))}
                </div>
                <HistoryPanel mode={historyTab} stats={accountStats} />
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <AccountContextBar account={account} />
          <div className="mt-4">
            <SettingsPanel settings={mockMasterSettings} />
          </div>
        </div>
      )}
    </div>
  );
}
