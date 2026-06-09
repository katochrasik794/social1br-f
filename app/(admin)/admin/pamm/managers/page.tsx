"use client";

import { useState } from "react";
import ProTable from "@/components/ui/ProTable";
import Modal from "@/components/ui/Modal";
import StatusPill, { statusToTone } from "@/components/ui/StatusPill";
import { mockAdminPammManagers } from "@/lib/mock/pamm";
import { money } from "@/lib/utils";

export default function AdminPammManagersPage() {
  const [rows, setRows] = useState(mockAdminPammManagers);
  const [rejectRow, setRejectRow] = useState<(typeof mockAdminPammManagers)[0] | null>(null);

  return (
    <div className="w-full min-w-0 space-y-6">
      <div><h1 className="text-2xl font-bold">PAMM Managers</h1><p className="text-sm text-[var(--app-text-secondary)]">Review manager applications and pools</p></div>
      <ProTable
        title="PAMM Managers"
        rows={rows}
        filters={{ searchKeys: ["name", "poolName", "email"] }}
        columns={[
          { key: "name", label: "Manager" },
          { key: "poolName", label: "Pool" },
          { key: "email", label: "Email" },
          { key: "nav", label: "NAV", render: (r) => money(r.nav as number) },
          { key: "investors", label: "Investors" },
          { key: "status", label: "Status", render: (r) => <StatusPill label={String(r.status)} tone={statusToTone(String(r.status))} /> },
          {
            key: "actions",
            label: "Actions",
            render: (r) =>
              r.status === "Pending" ? (
                <div className="flex gap-2">
                  <button type="button" onClick={() => setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "Approved" } : x))} className="rounded-lg bg-[color:var(--app-primary-solid)] px-3 py-1 text-xs font-semibold text-white">Approve</button>
                  <button type="button" onClick={() => setRejectRow(r as typeof mockAdminPammManagers[0])} className="rounded-lg border border-rose-200 px-3 py-1 text-xs text-rose-600">Reject</button>
                </div>
              ) : null,
          },
        ]}
      />
      <Modal open={!!rejectRow} onClose={() => setRejectRow(null)} title="Reject Manager">
        <textarea placeholder="Reason..." rows={3} className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm" />
        <button type="button" onClick={() => { if (rejectRow) setRows((prev) => prev.map((x) => x.id === rejectRow.id ? { ...x, status: "Rejected" } : x)); setRejectRow(null); }} className="mt-4 w-full rounded-md bg-rose-600 py-2.5 text-sm font-semibold text-white">Confirm</button>
      </Modal>
    </div>
  );
}
