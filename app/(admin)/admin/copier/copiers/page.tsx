"use client";

import { useMemo, useState } from "react";
import { Activity, Users, Wallet, DollarSign, Eye, Square } from "lucide-react";
import ProTable from "@/components/ui/ProTable";
import Modal from "@/components/ui/Modal";
import StatusPill, { statusToTone } from "@/components/ui/StatusPill";
import { mockAdminSubscriptions } from "@/lib/mock/copier";
import { money, pct, formatDate } from "@/lib/utils";

const TABS = ["all", "active", "paused", "stopped"] as const;

export default function AdminCopiersPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const [rows, setRows] = useState(mockAdminSubscriptions);
  const [viewRow, setViewRow] = useState<(typeof mockAdminSubscriptions)[0] | null>(null);
  const [stopRow, setStopRow] = useState<(typeof mockAdminSubscriptions)[0] | null>(null);

  const filteredByTab = useMemo(() => {
    if (tab === "all") return rows;
    const map = { active: "Active", paused: "Paused", stopped: "Stopped" };
    return rows.filter((r) => r.status === map[tab]);
  }, [rows, tab]);

  const totalActive = rows.filter((r) => r.status === "Active").length;
  const totalFollowers = new Set(rows.map((r) => r.copierEmail)).size;
  const totalAllocated = rows.reduce((s, r) => s + r.allocation, 0);
  const totalCommission = rows.reduce((s, r) => s + r.commissionEarned, 0);

  const kpis = [
    <article key="a" className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
      <div className="flex items-start justify-between"><p className="text-xs font-medium uppercase text-[var(--app-text-muted)]">Active Copies</p><Activity size={16} /></div>
      <p className="mt-2 text-2xl font-bold">{totalActive}</p>
    </article>,
    <article key="b" className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
      <div className="flex items-start justify-between"><p className="text-xs font-medium uppercase text-[var(--app-text-muted)]">Unique Followers</p><Users size={16} /></div>
      <p className="mt-2 text-2xl font-bold">{totalFollowers}</p>
    </article>,
    <article key="c" className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
      <div className="flex items-start justify-between"><p className="text-xs font-medium uppercase text-[var(--app-text-muted)]">Total Allocated</p><Wallet size={16} /></div>
      <p className="mt-2 text-2xl font-bold">{money(totalAllocated)}</p>
    </article>,
    <article key="d" className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
      <div className="flex items-start justify-between"><p className="text-xs font-medium uppercase text-[var(--app-text-muted)]">Commission</p><DollarSign size={16} /></div>
      <p className="mt-2 text-2xl font-bold">{money(totalCommission)}</p>
    </article>,
  ];

  return (
    <div className="w-full min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--app-text-primary)]">Copiers</h1>
        <p className="text-sm text-[var(--app-text-secondary)]">Monitor and manage all copy subscriptions</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? "bg-[color:var(--app-primary-solid)] text-white" : "border border-[var(--app-border)] bg-[var(--app-surface)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <ProTable
        kpis={kpis}
        title="Copy Subscriptions"
        rows={filteredByTab}
        filters={{ searchKeys: ["masterName", "copierEmail", "accountLogin"], dateKey: "startedAt" }}
        columns={[
          { key: "copierEmail", label: "Copier" },
          { key: "masterName", label: "Master" },
          { key: "allocation", label: "Allocation", render: (r) => money(r.allocation as number) },
          { key: "pnlPct", label: "P&L", render: (r) => pct(r.pnlPct as number) },
          { key: "status", label: "Status", render: (r) => <StatusPill label={String(r.status)} tone={statusToTone(String(r.status))} /> },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <div className="flex gap-2">
                <button type="button" onClick={() => setViewRow(r as typeof mockAdminSubscriptions[0])} className="rounded-lg border border-[var(--app-border)] p-1.5"><Eye className="h-4 w-4" /></button>
                {r.status !== "Stopped" ? (
                  <button type="button" onClick={() => setStopRow(r as typeof mockAdminSubscriptions[0])} className="rounded-lg border border-rose-200 p-1.5 text-rose-600"><Square className="h-4 w-4" /></button>
                ) : null}
              </div>
            ),
          },
        ]}
      />

      <Modal open={!!viewRow} onClose={() => setViewRow(null)} title="Subscription Details" wide>
        {viewRow ? (
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div><span className="text-[var(--app-text-muted)]">Copier:</span> {viewRow.copierEmail}</div>
            <div><span className="text-[var(--app-text-muted)]">Master:</span> {viewRow.masterName}</div>
            <div><span className="text-[var(--app-text-muted)]">Account:</span> {viewRow.accountLogin}</div>
            <div><span className="text-[var(--app-text-muted)]">Started:</span> {formatDate(viewRow.startedAt)}</div>
            <div><span className="text-[var(--app-text-muted)]">Trades Copied:</span> {viewRow.copiedTradesCount}</div>
            <div><span className="text-[var(--app-text-muted)]">Commission:</span> {money(viewRow.commissionEarned)}</div>
          </div>
        ) : null}
      </Modal>

      <Modal open={!!stopRow} onClose={() => setStopRow(null)} title="Force Stop Copy">
        {stopRow ? (
          <div className="space-y-4">
            <p className="text-sm">Force stop copy subscription for {stopRow.copierEmail} copying {stopRow.masterName}?</p>
            <textarea placeholder="Reason for force stop..." rows={3} className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm" />
            <button
              type="button"
              onClick={() => {
                setRows((prev) => prev.map((r) => (r.id === stopRow.id ? { ...r, status: "Stopped" as const } : r)));
                setStopRow(null);
              }}
              className="w-full rounded-md bg-rose-600 py-2.5 text-sm font-semibold text-white"
            >
              Confirm Force Stop
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
