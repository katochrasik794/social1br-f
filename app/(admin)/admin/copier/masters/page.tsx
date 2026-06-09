"use client";

import { useState } from "react";
import ProTable from "@/components/ui/ProTable";
import Modal from "@/components/ui/Modal";
import StatusPill, { statusToTone } from "@/components/ui/StatusPill";
import { mockAdminMasters } from "@/lib/mock/copier";
import { money, formatDate } from "@/lib/utils";

export default function AdminMastersPage() {
  const [tab, setTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [rows, setRows] = useState(mockAdminMasters);
  const [rejectRow, setRejectRow] = useState<(typeof mockAdminMasters)[0] | null>(null);

  const filtered = tab === "all" ? rows : rows.filter((r) => r.status.toLowerCase() === tab);

  return (
    <div className="mx-auto max-w-[2400px] space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Master Traders</h1>
        <p className="text-sm text-[var(--app-text-secondary)]">Review and approve master applications</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${tab === t ? "bg-[color:var(--app-primary-solid)] text-white" : "border border-[var(--app-border)]"}`}>
            {t}
          </button>
        ))}
      </div>

      <ProTable
        title="Master Applications"
        rows={filtered}
        filters={{ searchKeys: ["displayName", "email"], selects: [{ key: "status", label: "All Statuses", options: ["Approved", "Pending", "Rejected"] }] }}
        columns={[
          { key: "displayName", label: "Name" },
          { key: "email", label: "Email" },
          { key: "status", label: "Status", render: (r) => <StatusPill label={String(r.status)} tone={statusToTone(String(r.status))} /> },
          { key: "aum", label: "AUM", render: (r) => money(r.aum as number) },
          { key: "followers", label: "Followers" },
          { key: "appliedAt", label: "Applied", render: (r) => formatDate(r.appliedAt as string) },
          {
            key: "actions",
            label: "Actions",
            render: (r) =>
              r.status === "Pending" ? (
                <div className="flex gap-2">
                  <button type="button" onClick={() => setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: "Approved" } : x)))} className="rounded-lg bg-[color:var(--app-primary-solid)] px-3 py-1 text-xs font-semibold text-white">Approve</button>
                  <button type="button" onClick={() => setRejectRow(r as typeof mockAdminMasters[0])} className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600">Reject</button>
                </div>
              ) : (
                <span className="text-xs text-[var(--app-text-muted)]">—</span>
              ),
          },
        ]}
      />

      <Modal open={!!rejectRow} onClose={() => setRejectRow(null)} title="Reject Application">
        <textarea placeholder="Rejection reason..." rows={3} className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm" />
        <button
          type="button"
          onClick={() => {
            if (rejectRow) setRows((prev) => prev.map((x) => (x.id === rejectRow.id ? { ...x, status: "Rejected" } : x)));
            setRejectRow(null);
          }}
          className="mt-4 w-full rounded-md bg-rose-600 py-2.5 text-sm font-semibold text-white"
        >
          Confirm Reject
        </button>
      </Modal>
    </div>
  );
}
