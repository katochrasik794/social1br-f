"use client";

import { useState } from "react";
import ProTable from "@/components/ui/ProTable";
import Modal from "@/components/ui/Modal";
import StatusPill, { statusToTone } from "@/components/ui/StatusPill";
import { mockAdminMamInvestors } from "@/lib/mock/mam";
import { pct, formatDate } from "@/lib/utils";

export default function AdminMamInvestorsPage() {
  const [rows, setRows] = useState(mockAdminMamInvestors);
  const [unlinkRow, setUnlinkRow] = useState<(typeof mockAdminMamInvestors)[0] | null>(null);

  return (
    <div className="mx-auto max-w-[2400px] space-y-6">
      <div><h1 className="text-2xl font-bold">MAM Investors</h1><p className="text-sm text-[var(--app-text-secondary)]">Manage linked investor accounts</p></div>
      <ProTable
        title="Linked Accounts"
        rows={rows}
        filters={{ searchKeys: ["managerName", "investorEmail", "accountLogin"] }}
        columns={[
          { key: "investorEmail", label: "Investor" },
          { key: "managerName", label: "Manager" },
          { key: "accountLogin", label: "Account" },
          { key: "lotMultiplier", label: "Lot Multiplier" },
          { key: "pnlPct", label: "P&L", render: (r) => pct(r.pnlPct as number) },
          { key: "linkedAt", label: "Linked", render: (r) => formatDate(r.linkedAt as string) },
          { key: "status", label: "Status", render: (r) => <StatusPill label={String(r.status)} tone={statusToTone(String(r.status))} /> },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <button type="button" onClick={() => setUnlinkRow(r as typeof mockAdminMamInvestors[0])} className="rounded-lg border border-rose-200 px-3 py-1 text-xs text-rose-600">Force Unlink</button>
            ),
          },
        ]}
      />
      <Modal open={!!unlinkRow} onClose={() => setUnlinkRow(null)} title="Force Unlink">
        <p className="text-sm">Force unlink {unlinkRow?.investorEmail} from {unlinkRow?.managerName}?</p>
        <button type="button" onClick={() => { setRows((prev) => prev.map((r) => r.id === unlinkRow?.id ? { ...r, status: "Stopped" as const } : r)); setUnlinkRow(null); }} className="mt-4 w-full rounded-md bg-rose-600 py-2.5 text-sm font-semibold text-white">Confirm</button>
      </Modal>
    </div>
  );
}
