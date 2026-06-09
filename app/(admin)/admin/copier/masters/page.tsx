"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import ProTable from "@/components/ui/ProTable";
import Modal from "@/components/ui/Modal";
import StatusPill, { statusToTone } from "@/components/ui/StatusPill";
import {
  approveAdminChangeRequest,
  approveAdminMaster,
  fetchAdminMasters,
  rejectAdminChangeRequest,
  rejectAdminMaster,
  type AdminMasterRow,
} from "@/lib/api/copier.admin";
import { money, formatDate } from "@/lib/utils";

export default function AdminMastersPage() {
  const [tab, setTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [rows, setRows] = useState<AdminMasterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectRow, setRejectRow] = useState<AdminMasterRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [acting, setActing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchAdminMasters();
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered =
    tab === "all" ? rows : rows.filter((r) => r.status.toLowerCase() === tab);

  async function handleApprove(row: AdminMasterRow) {
    setActing(true);
    try {
      if (row.kind === "account_change") {
        await approveAdminChangeRequest(row.id);
      } else {
        await approveAdminMaster(row.id);
      }
      await load();
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    if (!rejectRow || !rejectReason.trim()) return;
    setActing(true);
    try {
      if (rejectRow.kind === "account_change") {
        await rejectAdminChangeRequest(rejectRow.id, rejectReason.trim());
      } else {
        await rejectAdminMaster(rejectRow.id, rejectReason.trim());
      }
      setRejectRow(null);
      setRejectReason("");
      await load();
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Master Traders</h1>
        <p className="text-sm text-[var(--app-text-secondary)]">
          Review master applications and account change requests
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? "bg-[color:var(--app-primary-solid)] text-white" : "border border-[var(--app-border)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--app-text-muted)]">Loading applications…</p>
      ) : (
        <ProTable
          title="Master Applications"
          rows={filtered}
          filters={{
            searchKeys: ["displayName", "email", "requestedAccount"],
            selects: [{ key: "status", label: "All Statuses", options: ["Approved", "Pending", "Rejected"] }],
          }}
          columns={[
            {
              key: "displayName",
              label: "Name",
              render: (r) => (
                <div>
                  <p className="font-semibold text-[var(--app-text-primary)]">{String(r.displayName)}</p>
                  {r.headline ? (
                    <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">{String(r.headline)}</p>
                  ) : null}
                </div>
              ),
            },
            { key: "email", label: "Email" },
            {
              key: "kind",
              label: "Type",
              render: (r) => (
                <span className="text-xs font-medium text-[var(--app-text-secondary)]">
                  {r.kind === "linked_account"
                    ? "Approved account"
                    : r.kind === "account_change"
                      ? "Additional account"
                      : "New application"}
                </span>
              ),
            },
            {
              key: "requestedAccount",
              label: "MT5 account",
              render: (r) => {
                if (!r.requestedAccount) return "—";
                if (r.kind === "account_change") {
                  return (
                    <span className="text-xs">
                      {r.currentAccount ? `${r.currentAccount} → ` : ""}
                      <strong>{String(r.requestedAccount)}</strong>
                    </span>
                  );
                }
                return (
                  <span className="text-xs font-semibold text-[var(--app-text-primary)]">
                    {r.platform ? `${r.platform} · ` : ""}
                    {String(r.requestedAccount)}
                    {r.kind === "linked_account" && r.isPrimary ? (
                      <span className="ml-1.5 rounded bg-[color-mix(in_oklab,var(--app-primary-solid)_12%,var(--app-mix-base))] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[color:var(--app-primary-solid)]">
                        Primary
                      </span>
                    ) : null}
                  </span>
                );
              },
            },
            {
              key: "status",
              label: "Status",
              render: (r) => <StatusPill label={String(r.status)} tone={statusToTone(String(r.status))} />,
            },
            {
              key: "aum",
              label: "Balance",
              render: (r) => (
                <span className="text-xs">
                  {money(r.aum as number)}
                  {r.equity != null ? (
                    <span className="mt-0.5 block text-[var(--app-text-muted)]">Eq {money(r.equity)}</span>
                  ) : null}
                </span>
              ),
            },
            {
              key: "minCopyAmount",
              label: "Min copy",
              render: (r) =>
                r.minCopyAmount != null ? (
                  <span className="text-xs">{money(r.minCopyAmount)}</span>
                ) : (
                  "—"
                ),
            },
            { key: "followers", label: "Followers" },
            { key: "appliedAt", label: "Applied", render: (r) => formatDate(r.appliedAt as string) },
            {
              key: "actions",
              label: "Actions",
              render: (r) => {
                const row = r as AdminMasterRow;
                const canView =
                  row.kind === "linked_account" && row.masterId && row.tradingAccountId;
                return (
                  <div className="flex items-center gap-2">
                    {canView ? (
                      <Link
                        href={`/admin/copier/masters/${row.masterId}?account=${row.tradingAccountId}`}
                        className="rounded-lg border border-[var(--app-border)] p-1.5 text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-muted)]"
                        title="View master profile"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    ) : null}
                    {row.status === "Pending" ? (
                      <>
                        <button
                          type="button"
                          disabled={acting}
                          onClick={() => handleApprove(row)}
                          className="rounded-lg bg-[color:var(--app-primary-solid)] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={acting}
                          onClick={() => setRejectRow(row)}
                          className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600"
                        >
                          Reject
                        </button>
                      </>
                    ) : !canView ? (
                      <span className="text-xs text-[var(--app-text-muted)]">—</span>
                    ) : null}
                  </div>
                );
              },
            },
          ]}
        />
      )}

      <Modal
        open={!!rejectRow}
        onClose={() => setRejectRow(null)}
        title={rejectRow?.kind === "account_change" ? "Reject additional account" : "Reject application"}
      >
        <textarea
          placeholder="Rejection reason..."
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={acting || !rejectReason.trim()}
          onClick={handleReject}
          className="mt-4 w-full rounded-md bg-rose-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Confirm Reject
        </button>
      </Modal>
    </div>
  );
}
