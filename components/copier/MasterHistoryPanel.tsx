"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Gift } from "lucide-react";
import GroupedHistoryTable from "@/components/copier/GroupedHistoryTable";
import {
  getMasterBalanceOps,
  getMasterClosedOrders,
  getMasterOpenOrders,
  groupByDate,
  type MasterBalanceOp,
  type MasterClosedOrder,
  type MasterOpenOrder,
  type MasterTradeDirection,
} from "@/lib/mock/masterDetail";
import { money } from "@/lib/utils";

type HistoryTab = "closed" | "open" | "balance";

function TradeIcon({ direction }: { direction: MasterTradeDirection }) {
  const isBuy = direction === "buy";
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-white ${
        isBuy ? "bg-blue-500" : "bg-orange-500"
      }`}
    >
      {isBuy ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
    </span>
  );
}

function TradeCell({ symbol, lots, direction }: { symbol: string; lots: number; direction: MasterTradeDirection }) {
  return (
    <div className="flex items-center gap-2.5">
      <TradeIcon direction={direction} />
      <span className="rounded-sm bg-[var(--app-surface-muted)] px-1.5 py-0.5 text-sm font-medium text-[var(--app-text-muted)]">
        {lots.toFixed(2)}
      </span>
      <span className="font-medium text-[var(--app-text-primary)]">{symbol}</span>
    </div>
  );
}

function ProfitCell({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`font-semibold ${positive ? "text-[color:var(--app-primary-solid)]" : "text-rose-500"}`}>
      {money(value)}
    </span>
  );
}

export default function MasterHistoryPanel({ masterId }: { masterId: number }) {
  const [tab, setTab] = useState<HistoryTab>("closed");

  const closedOrders = useMemo(() => getMasterClosedOrders(masterId), [masterId]);
  const openOrders = useMemo(() => getMasterOpenOrders(masterId), [masterId]);
  const balanceOps = useMemo(() => getMasterBalanceOps(masterId), [masterId]);

  const closedGroups = useMemo(() => groupByDate(closedOrders), [closedOrders]);
  const openGroups = useMemo(() => groupByDate(openOrders), [openOrders]);
  const balanceGroups = useMemo(() => groupByDate(balanceOps), [balanceOps]);

  const tabs: { id: HistoryTab; label: string; count?: number }[] = [
    { id: "closed", label: "Closed Orders" },
    { id: "open", label: "Open Orders", count: openOrders.length },
    { id: "balance", label: "Balance Operations" },
  ];

  return (
    <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5 sm:p-6">
      <h2 className="text-xl font-bold text-[var(--app-text-primary)]">History</h2>

      <div className="mt-4 flex gap-0 overflow-x-auto border-b border-[var(--app-border)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition sm:text-base ${
              tab === t.id
                ? "border-[color:var(--app-primary-solid)] text-[color:var(--app-primary-solid)]"
                : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]"
            }`}
          >
            {t.label.toUpperCase()}
            {t.count !== undefined ? ` (${t.count})` : ""}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {tab === "closed" ? (
          <GroupedHistoryTable<MasterClosedOrder>
            groups={closedGroups}
            columns={[
              {
                key: "trade",
                label: "Trades",
                render: (r) => <TradeCell symbol={r.symbol} lots={r.lots} direction={r.direction} />,
              },
              { key: "closeTime", label: "Close Time", render: (r) => r.closeTime },
              { key: "duration", label: "Duration", align: "right", render: (r) => r.duration },
              { key: "profit", label: "Profit", align: "right", render: (r) => <ProfitCell value={r.profit} /> },
            ]}
          />
        ) : null}

        {tab === "open" ? (
          <GroupedHistoryTable<MasterOpenOrder>
            groups={openGroups}
            columns={[
              {
                key: "trade",
                label: "Trades",
                render: (r) => <TradeCell symbol={r.symbol} lots={r.lots} direction={r.direction} />,
              },
              { key: "openTime", label: "Open Time", render: (r) => r.openTime },
              { key: "duration", label: "Duration", align: "right", render: (r) => r.duration },
              { key: "profit", label: "Profit", align: "right", render: (r) => <ProfitCell value={r.profit} /> },
            ]}
          />
        ) : null}

        {tab === "balance" ? (
          <GroupedHistoryTable<MasterBalanceOp>
            groups={balanceGroups}
            columns={[
              {
                key: "type",
                label: "Trades",
                render: (r) => (
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-white ${
                        r.type === "bonus" ? "bg-[color:var(--app-primary-solid)]" : "bg-blue-500"
                      }`}
                    >
                      {r.type === "bonus" ? (
                        <Gift className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </span>
                    <span className="font-medium capitalize text-[var(--app-text-primary)]">{r.type}</span>
                  </div>
                ),
              },
              { key: "time", label: "Close Time", render: (r) => r.time },
              {
                key: "amount",
                label: "Profit",
                align: "right",
                render: (r) => <ProfitCell value={r.amount} />,
              },
            ]}
          />
        ) : null}
      </div>
    </div>
  );
}
