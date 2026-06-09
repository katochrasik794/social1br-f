"use client";

import type { MasterHistoryTrade } from "@/lib/mock/masterArea";
import { money } from "@/lib/utils";

type MasterHistoryTableProps = {
  trades: MasterHistoryTrade[];
  mode: "closed" | "open";
};

function PipsValue({ value }: { value?: number }) {
  if (value === undefined) return <span className="text-[var(--app-text-muted)]">—</span>;
  const positive = value > 0;
  const negative = value < 0;
  return (
    <span className={positive ? "text-[color:var(--app-primary-solid)]" : negative ? "text-rose-500" : ""}>
      {value > 0 ? "+" : ""}
      {value}
    </span>
  );
}

function ProfitValue({ value }: { value: number }) {
  const positive = value > 0;
  const negative = value < 0;
  return (
    <span className={`font-semibold ${positive ? "text-[color:var(--app-primary-solid)]" : negative ? "text-rose-500" : "text-[var(--app-text-primary)]"}`}>
      {money(value)}
    </span>
  );
}

function StackedCell({ primary, secondary }: { primary?: string; secondary?: string }) {
  if (!primary && !secondary) return <span className="text-[var(--app-text-muted)]">—</span>;
  return (
    <div className="space-y-0.5 text-xs leading-tight">
      {primary ? <p>{primary}</p> : null}
      {secondary ? <p className="text-[var(--app-text-muted)]">{secondary}</p> : null}
    </div>
  );
}

export default function MasterHistoryTable({ trades, mode }: MasterHistoryTableProps) {
  if (!trades.length) {
    return <div className="py-12 text-center text-sm text-[var(--app-text-muted)]">No trades found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] text-xs">
        <thead>
          <tr className="border-b border-[var(--app-border)] text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
            <th className="px-3 py-2.5 text-left">Order ID</th>
            <th className="px-3 py-2.5 text-left">Vol</th>
            <th className="px-3 py-2.5 text-left">Type</th>
            <th className="px-3 py-2.5 text-left">Symbol</th>
            <th className="px-3 py-2.5 text-left">{mode === "closed" ? "Open / Close Time" : "Open Time"}</th>
            <th className="px-3 py-2.5 text-left">{mode === "closed" ? "Open / Close Price" : "Open Price"}</th>
            <th className="px-3 py-2.5 text-left">TP / SL</th>
            <th className="px-3 py-2.5 text-left">Pips</th>
            <th className="px-3 py-2.5 text-left">Commission</th>
            <th className="px-3 py-2.5 text-right">Profit</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t, i) => (
            <tr
              key={t.id}
              className={`border-b border-[var(--app-border)]/50 ${i % 2 === 0 ? "bg-[var(--app-surface-muted)]/25" : ""}`}
            >
              <td className="px-3 py-2.5 font-medium">{t.orderId}</td>
              <td className="px-3 py-2.5">{t.volume.toFixed(2)}</td>
              <td className="px-3 py-2.5">{t.type}</td>
              <td className="px-3 py-2.5">{t.symbol ?? "—"}</td>
              <td className="px-3 py-2.5">
                <StackedCell primary={t.openTime} secondary={mode === "closed" ? t.closeTime : undefined} />
              </td>
              <td className="px-3 py-2.5">
                <StackedCell primary={t.openPrice} secondary={mode === "closed" ? t.closePrice : undefined} />
              </td>
              <td className="px-3 py-2.5">
                {t.tpSl ? (
                  <span className={`rounded px-1.5 py-0.5 ${t.tpSl === "—" ? "" : "bg-rose-500/5 text-rose-500"}`}>{t.tpSl}</span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-2.5">
                <PipsValue value={t.pips} />
              </td>
              <td className="px-3 py-2.5">{t.commission ?? "—"}</td>
              <td className="px-3 py-2.5 text-right">
                <ProfitValue value={t.profit} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
