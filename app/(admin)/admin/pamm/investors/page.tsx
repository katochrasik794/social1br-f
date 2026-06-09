"use client";

import { useState } from "react";
import ProTable from "@/components/ui/ProTable";
import Modal from "@/components/ui/Modal";
import StatusPill, { statusToTone } from "@/components/ui/StatusPill";
import { mockAdminPammInvestors } from "@/lib/mock/pamm";
import { money, pct, formatDate } from "@/lib/utils";

export default function AdminPammInvestorsPage() {
  const [rows, setRows] = useState(mockAdminPammInvestors);
  const [withdrawRow, setWithdrawRow] = useState<(typeof mockAdminPammInvestors)[0] | null>(null);

  const kpis = [
    <article key="a" className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-4"><p className="text-xs uppercase text-[var(--app-text-muted)]">Total Invested</p><p className="mt-2 text-2xl font-bold">{money(rows.reduce((s, r) => s + r.amount, 0))}</p></article>,
    <article key="b" className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-4"><p className="text-xs uppercase text-[var(--app-text-muted)]">Active Investments</p><p className="mt-2 text-2xl font-bold">{rows.filter((r) => r.status === "Active").length}</p></article>,
    <article key="c" className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-4"><p className="text-xs uppercase text-[var(--app-text-muted)]">Pending</p><p className="mt-2 text-2xl font-bold">{rows.filter((r) => r.status === "Pending").length}</p></article>,
    <article key="d" className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-4"><p className="text-xs uppercase text-[var(--app-text-muted)]">Avg Return</p><p className="mt-2 text-2xl font-bold">{pct(rows.reduce((s, r) => s + r.pnlPct, 0) / rows.length)}</p></article>,
  ];

  return (
    <div className="w-full min-w-0 space-y-6">
      <div><h1 className="text-2xl font-bold">PAMM Investors</h1><p className="text-sm text-[var(--app-text-secondary)]">Manage investor allocations and withdrawals</p></div>
      <ProTable
        kpis={kpis}
        title="Investments"
        rows={rows}
        filters={{ searchKeys: ["poolName", "investorEmail"], selects: [{ key: "status", label: "All Statuses", options: ["Active", "Pending"] }] }}
        columns={[
          { key: "investorEmail", label: "Investor" },
          { key: "poolName", label: "Pool" },
          { key: "amount", label: "Amount", render: (r) => money(r.amount as number) },
          { key: "sharePct", label: "Share %", render: (r) => `${r.sharePct}%` },
          { key: "pnlPct", label: "P&L", render: (r) => pct(r.pnlPct as number) },
          { key: "investedAt", label: "Date", render: (r) => formatDate(r.investedAt as string) },
          { key: "status", label: "Status", render: (r) => <StatusPill label={String(r.status)} tone={statusToTone(String(r.status))} /> },
          {
            key: "actions",
            label: "Actions",
            render: (r) =>
              r.status === "Pending" ? (
                <button type="button" onClick={() => setWithdrawRow(r as typeof mockAdminPammInvestors[0])} className="rounded-lg bg-[color:var(--app-primary-solid)] px-3 py-1 text-xs font-semibold text-white">Approve</button>
              ) : null,
          },
        ]}
      />
      <Modal open={!!withdrawRow} onClose={() => setWithdrawRow(null)} title="Approve Withdrawal">
        <p className="text-sm">Approve pending withdrawal for {withdrawRow?.investorEmail}?</p>
        <button type="button" onClick={() => { setRows((prev) => prev.map((r) => r.id === withdrawRow?.id ? { ...r, status: "Active" as const } : r)); setWithdrawRow(null); }} className="mt-4 w-full rounded-md bg-[color:var(--app-primary-solid)] py-2.5 text-sm font-semibold text-white">Confirm</button>
      </Modal>
    </div>
  );
}
