"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownToLine, Check, X, Loader2 } from "lucide-react";
import AdminDataTable from "@/components/admin/AdminDataTable";
import Modal from "@/components/ui/Modal";
import StatusPill from "@/components/ui/StatusPill";
import { useToast } from "@/components/ui/Toast";
import {
  approveDeposit,
  fetchAdminDeposits,
  rejectDeposit,
  type AdminDeposit,
} from "@/lib/api/funds.admin";
import { getApiUrl } from "@/lib/api/http";

type Tab = "pending" | "approved" | "rejected" | "all";

export default function AdminDepositsPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("pending");
  const [rows, setRows] = useState<AdminDeposit[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [actionRow, setActionRow] = useState<AdminDeposit | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminDeposits({
        status: tab === "all" ? undefined : tab,
        limit: 100,
      });
      setRows(data.items);
      setCounts(data.counts);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load deposits", "error");
    } finally {
      setLoading(false);
    }
  }, [tab, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmAction() {
    if (!actionRow || !actionType) return;
    setSubmitting(true);
    try {
      if (actionType === "approve") {
        await approveDeposit(actionRow.id, comment || undefined);
        showToast("Deposit approved");
      } else {
        await rejectDeposit(actionRow.id, reason);
        showToast("Deposit rejected");
      }
      setActionRow(null);
      setActionType(null);
      setComment("");
      setReason("");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Action failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const tableRows = rows.map((r) => ({ ...r })) as Array<AdminDeposit & Record<string, unknown>>;
  const tone = (s: string) => (s === "approved" ? "active" : s === "rejected" ? "stopped" : "pending");

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400">
          <ArrowDownToLine className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--app-text-primary)]">Deposits</h1>
          <p className="mt-1 text-sm font-bold text-[var(--app-text-secondary)]">
            Review and approve user deposit requests.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pending", counts.pending],
            ["approved", counts.approved],
            ["rejected", counts.rejected],
            ["all", counts.pending + counts.approved + counts.rejected],
          ] as const
        ).map(([t, count]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold capitalize ${
              tab === t
                ? "bg-[color:var(--app-primary-solid)] text-white"
                : "border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-secondary)]"
            }`}
          >
            {t} ({count})
          </button>
        ))}
      </div>

      <AdminDataTable
        rows={tableRows}
        loading={loading}
        exportFileName="deposits"
        searchKeys={["userName", "userEmail", "accountNumber", "paymentMethod"]}
        dateKey="createdAt"
        onReset={load}
        columns={[
          { key: "userName", label: "User" },
          { key: "accountNumber", label: "Login" },
          { key: "amount", label: "Amount", render: (r) => <span>${Number(r.amount)}</span> },
          { key: "paymentMethod", label: "Method" },
          {
            key: "gatewayCategory",
            label: "Category",
            render: (r) => <span>{String(r.gatewayCategory ?? "—")}</span>,
          },
          {
            key: "proofUrl",
            label: "Proof",
            render: (r) =>
              r.proofUrl ? (
                <a
                  href={`${getApiUrl()}${String(r.proofUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[color:var(--app-primary-solid)] hover:underline"
                >
                  View
                </a>
              ) : (
                "—"
              ),
          },
          {
            key: "status",
            label: "Status",
            render: (r) => <StatusPill label={String(r.status)} tone={tone(String(r.status))} />,
          },
          {
            key: "createdAt",
            label: "Date",
            render: (r) => <span>{new Date(String(r.createdAt)).toLocaleString()}</span>,
          },
          {
            key: "actions",
            label: "Actions",
            render: (r) => {
              const row = r as AdminDeposit;
              if (row.status !== "pending") return <span>—</span>;
              return (
                <div className="flex gap-2">
                  <button
                    type="button"
                    title="Approve"
                    onClick={() => {
                      setActionRow(row);
                      setActionType("approve");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] hover:border-green-500"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Reject"
                    onClick={() => {
                      setActionRow(row);
                      setActionType("reject");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] text-red-500 hover:border-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            },
          },
        ]}
      />

      <Modal
        open={!!actionRow && !!actionType}
        onClose={() => !submitting && (setActionRow(null), setActionType(null))}
        title={actionType === "approve" ? "Approve deposit" : "Reject deposit"}
        subtitle={actionRow ? `$${actionRow.amount} — ${actionRow.userName}` : undefined}
      >
        {actionType === "approve" ? (
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment"
            className="w-full rounded-xl border border-[var(--app-border)] px-4 py-3 text-sm font-bold"
          />
        ) : (
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason"
            className="w-full rounded-xl border border-[var(--app-border)] px-4 py-3 text-sm font-bold"
            required
          />
        )}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setActionRow(null)}
            disabled={submitting}
            className="flex-1 rounded-xl border border-[var(--app-border)] py-3 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmAction}
            disabled={submitting || (actionType === "reject" && !reason.trim())}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[color:var(--app-primary-solid)] py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
}
