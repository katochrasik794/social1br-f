"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import CopierSummaryRings from "@/components/copier/area/CopierSummaryRings";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { accountStatusBadgeClass } from "@/components/copier/master/accountStatusStyles";
import {
  getMasterAccountStats,
  type MasterAccountStatsBundle,
  type MasterAttachedAccount,
} from "@/lib/mock/masterArea";
import {
  fetchMasterAccountHistory,
  updateMasterAccountSettings,
  type MasterHistoryTradeRow,
  type MasterMeResponse,
} from "@/lib/api/copier";
import { computeSummaryFromTrades } from "@/lib/copier/summaryFromTrades";
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

function toHistoryRows(trades: MasterHistoryTradeRow[]): HistoryRow[] {
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

function AccountContextBar({
  account,
  displayName,
}: {
  account: MasterAttachedAccount;
  displayName?: string;
}) {
  const label = displayName?.trim() || account.displayName;
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)]/40 px-4 py-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Showing data for</p>
        <p className="mt-0.5 text-sm font-bold text-[var(--app-text-primary)]">
          {label ? `${label} · ` : ""}
          {account.platform} · {account.login}
        </p>
      </div>
      <span
        className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${accountStatusBadgeClass(account.status)}`}
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

function HistoryPanel({
  mode,
  trades,
  loading,
  error,
}: {
  mode: HistoryTab;
  trades: MasterHistoryTradeRow[];
  loading?: boolean;
  error?: string;
}) {
  const rows = useMemo(() => toHistoryRows(trades), [trades]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center text-sm text-[var(--app-text-muted)]">
        Loading trade history…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
        {error}
      </div>
    );
  }

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

function SummaryPanel({
  summaryStats,
  summaryBottom,
  loading,
  error,
}: {
  summaryStats: MasterAccountStatsBundle["summaryStats"];
  summaryBottom: MasterAccountStatsBundle["summaryBottom"];
  loading?: boolean;
  error?: string;
}) {
  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-[var(--app-text-muted)]">
        Loading summary…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
        {error}
      </div>
    );
  }

  const bottom = summaryBottom;

  return (
    <div className="space-y-5 overflow-y-auto">
      <CopierSummaryRings stats={summaryStats} />

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

type SettingsFormState = {
  displayName: string;
  headline: string;
  strategySummary: string;
  strategyDetail: string;
  commissionPct: number;
  minCopyAmount: number;
  riskProfile: "low" | "medium" | "high";
  publicProfile: boolean;
  acceptNewCopiers: boolean;
};

function settingsFromAccount(account: MasterAttachedAccount): SettingsFormState {
  return {
    displayName: account.displayName ?? account.login,
    headline: account.headline ?? "",
    strategySummary: account.strategy ?? "",
    strategyDetail: account.strategyDetail ?? "",
    commissionPct: account.commissionPct ?? account.commissionPerLot,
    minCopyAmount: account.minCopyAmount ?? 25,
    riskProfile: account.riskProfile ?? "medium",
    publicProfile: account.publicProfile ?? true,
    acceptNewCopiers: account.acceptNewCopiers ?? true,
  };
}

function SettingsPanel({
  account,
  accountId,
  initial,
  onSaved,
}: {
  account: MasterAttachedAccount;
  accountId: string;
  initial: SettingsFormState;
  onSaved?: (updated?: MasterMeResponse) => void | Promise<void>;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setForm(initial);
    setError("");
    setSuccess("");
  }, [initial, accountId]);

  function set<K extends keyof SettingsFormState>(key: K, value: SettingsFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateMasterAccountSettings(accountId, {
        displayName: form.displayName.trim(),
        headline: form.headline.trim(),
        strategySummary: form.strategySummary.trim(),
        strategyDetail: form.strategyDetail.trim() || undefined,
        riskProfile: form.riskProfile,
        commissionPct: form.commissionPct,
        minCopyAmount: form.minCopyAmount,
        publicProfile: form.publicProfile,
        acceptNewCopiers: form.acceptNewCopiers,
      });
      setSuccess("Settings saved.");
      await onSaved?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 overflow-y-auto p-1">
      <AccountContextBar account={account} displayName={form.displayName} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Display name</label>
          <input
            required
            value={form.displayName}
            onChange={(e) => set("displayName", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text-primary)] outline-none focus:border-[color:var(--app-primary-solid)]"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Headline</label>
          <input
            required
            value={form.headline}
            onChange={(e) => set("headline", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text-primary)] outline-none focus:border-[color:var(--app-primary-solid)]"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Strategy</label>
          <textarea
            required
            rows={4}
            value={form.strategySummary}
            onChange={(e) => set("strategySummary", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text-primary)] outline-none focus:border-[color:var(--app-primary-solid)]"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Commission (%)</label>
          <input
            type="number"
            required
            min={5}
            max={50}
            value={form.commissionPct}
            onChange={(e) => set("commissionPct", Number(e.target.value))}
            className="mt-1.5 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text-primary)] outline-none focus:border-[color:var(--app-primary-solid)]"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Min copy amount</label>
          <input
            type="number"
            required
            min={25}
            step={25}
            value={form.minCopyAmount}
            onChange={(e) => set("minCopyAmount", Number(e.target.value))}
            className="mt-1.5 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text-primary)] outline-none focus:border-[color:var(--app-primary-solid)]"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Risk level</label>
          <select
            value={form.riskProfile}
            onChange={(e) => set("riskProfile", e.target.value as SettingsFormState["riskProfile"])}
            className="mt-1.5 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text-primary)] outline-none focus:border-[color:var(--app-primary-solid)]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--app-text-primary)]">
          <input
            type="checkbox"
            checked={form.publicProfile}
            onChange={(e) => set("publicProfile", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--app-border)] accent-[color:var(--app-primary-solid)]"
          />
          Public profile
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--app-text-primary)]">
          <input
            type="checkbox"
            checked={form.acceptNewCopiers}
            onChange={(e) => set("acceptNewCopiers", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--app-border)] accent-[color:var(--app-primary-solid)]"
          />
          Accept new copiers
        </label>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-green-600">{success}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-[color:var(--app-primary-solid)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}

export default function MasterStatsSettingsPanel({
  account,
  onSaved,
}: {
  account: MasterAttachedAccount;
  onSaved?: (updated?: MasterMeResponse) => void | Promise<void>;
}) {
  const [mainTab, setMainTab] = useState<MainTab>("statistics");
  const [statsTab, setStatsTab] = useState<StatsTab>("commission");
  const [historyTab, setHistoryTab] = useState<HistoryTab>("closed");
  const [closedTrades, setClosedTrades] = useState<MasterHistoryTradeRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const data = await fetchMasterAccountHistory(account.id);
      setClosedTrades(data.closedTrades);
    } catch (err) {
      setClosedTrades([]);
      setHistoryError(err instanceof Error ? err.message : "Failed to load trade history");
    } finally {
      setHistoryLoading(false);
    }
  }, [account.id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const accountStats = useMemo(() => getMasterAccountStats(account.id), [account.id]);

  const tradeSummary = useMemo(
    () =>
      computeSummaryFromTrades(closedTrades, {
        balance: account.balance ?? 0,
        equity: account.equity ?? 0,
      }),
    [closedTrades, account.balance, account.equity]
  );

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
                ? "bg-green-600 text-white"
                : "bg-[var(--app-surface-muted)]/60 text-[var(--app-text-muted)] hover:bg-green-50 hover:text-green-700"
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
            {statsTab === "summary" ? (
              <SummaryPanel
                summaryStats={tradeSummary.summaryStats}
                summaryBottom={tradeSummary.summaryBottom}
                loading={historyLoading}
                error={historyError}
              />
            ) : null}
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
                <HistoryPanel
                  mode={historyTab}
                  trades={historyTab === "closed" ? closedTrades : []}
                  loading={historyLoading}
                  error={historyError}
                />
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <SettingsPanel
            account={account}
            accountId={account.id}
            initial={settingsFromAccount(account)}
            onSaved={onSaved}
          />
        </div>
      )}
    </div>
  );
}
