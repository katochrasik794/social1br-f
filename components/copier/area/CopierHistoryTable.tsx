import type { CopierHistoryTrade } from "@/lib/mock/copierArea";
import { money } from "@/lib/utils";

type CopierHistoryTableProps = {
  trades: CopierHistoryTrade[];
  mode: "closed" | "open";
};

function ProfitValue({ value }: { value: number }) {
  const positive = value > 0;
  const negative = value < 0;
  return (
    <span
      className={`font-bold ${
        positive
          ? "text-green-600 dark:text-green-400"
          : negative
            ? "text-red-500 dark:text-red-400"
            : "text-[var(--app-text-primary)]"
      }`}
    >
      {money(value)}
    </span>
  );
}

function TimePriceCell({ primary, secondary }: { primary?: string; secondary?: string }) {
  if (!primary && !secondary) return <span className="text-[var(--app-text-muted)]">—</span>;
  return (
    <div className="space-y-0.5 text-sm leading-tight">
      {primary ? <p className="font-bold text-[var(--app-text-primary)]">{primary}</p> : null}
      {secondary ? <p className="font-bold text-[var(--app-text-muted)]">{secondary}</p> : null}
    </div>
  );
}

export default function CopierHistoryTable({ trades, mode }: CopierHistoryTableProps) {
  const timeLabel = mode === "closed" ? "Open / Close Time" : "Open Time";
  const priceLabel = mode === "closed" ? "Open / Close Price" : "Open Price";

  if (!trades.length) {
    return <div className="py-12 text-center text-sm font-bold text-[var(--app-text-muted)]">No trades found</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--app-border)]">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="rating-table-head border-b text-xs font-bold uppercase tracking-wide">
            <th className="px-4 py-4 text-left">Order ID</th>
            <th className="px-4 py-4 text-left">Vol</th>
            <th className="px-4 py-4 text-left">Type</th>
            <th className="px-4 py-4 text-left">Symbol</th>
            <th className="px-4 py-4 text-left">{timeLabel}</th>
            <th className="px-4 py-4 text-left">{priceLabel}</th>
            <th className="px-4 py-4 text-left">Commission</th>
            <th className="px-4 py-4 text-right">Profit</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t, i) => (
            <tr
              key={t.id}
              className={`border-b border-[var(--app-border)] ${
                i % 2 === 0 ? "bg-[var(--app-surface-muted)]/30" : "bg-[var(--app-surface)]"
              }`}
            >
              <td className="px-4 py-4 font-bold text-[var(--app-text-primary)]">{t.orderId}</td>
              <td className="px-4 py-4 font-bold text-[var(--app-text-secondary)]">{t.volume.toFixed(2)}</td>
              <td className="px-4 py-4 font-bold text-[var(--app-text-secondary)]">{t.type}</td>
              <td className="px-4 py-4 font-bold text-[var(--app-text-secondary)]">{t.symbol ?? "—"}</td>
              <td className="px-4 py-4">
                <TimePriceCell primary={t.openTime} secondary={mode === "closed" ? t.closeTime : undefined} />
              </td>
              <td className="px-4 py-4">
                <TimePriceCell primary={t.openPrice} secondary={mode === "closed" ? t.closePrice : undefined} />
              </td>
              <td className="px-4 py-4 font-bold text-[var(--app-text-secondary)]">{t.commission ?? "—"}</td>
              <td className="px-4 py-4 text-right">
                <ProfitValue value={t.profit} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
