"use client";

import { useState } from "react";
import ProTable from "@/components/ui/ProTable";
import StatusPill, { statusToTone } from "@/components/ui/StatusPill";
import { mockAdminMamManagers } from "@/lib/mock/mam";
import { money } from "@/lib/utils";

export default function AdminMamManagersPage() {
  const [rows, setRows] = useState(mockAdminMamManagers);

  return (
    <div className="w-full min-w-0 space-y-6">
      <div><h1 className="text-2xl font-bold">MAM Managers</h1><p className="text-sm text-[var(--app-text-secondary)]">Review and manage MAM managers</p></div>
      <ProTable
        title="MAM Managers"
        rows={rows}
        filters={{ searchKeys: ["displayName", "email"] }}
        columns={[
          { key: "displayName", label: "Manager" },
          { key: "email", label: "Email" },
          { key: "linkedAccounts", label: "Linked Accounts" },
          { key: "aum", label: "AUM", render: (r) => money(r.aum as number) },
          { key: "status", label: "Status", render: (r) => <StatusPill label={String(r.status)} tone={statusToTone(String(r.status))} /> },
          {
            key: "actions",
            label: "Actions",
            render: (r) =>
              r.status === "Pending" ? (
                <button type="button" onClick={() => setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "Approved" } : x))} className="rounded-lg bg-[color:var(--app-primary-solid)] px-3 py-1 text-xs font-semibold text-white">Approve</button>
              ) : null,
          },
        ]}
      />
    </div>
  );
}
