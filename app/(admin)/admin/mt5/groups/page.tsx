"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Layers,
  RefreshCw,
  Eye,
  Pencil,
  Power,
  Trash2,
  Edit3,
  Loader2,
} from "lucide-react";
import AdminDataTable from "@/components/admin/AdminDataTable";
import Modal from "@/components/ui/Modal";
import StatusPill from "@/components/ui/StatusPill";
import { useToast } from "@/components/ui/Toast";
import {
  deleteMt5Group,
  fetchMt5Groups,
  getMt5Group,
  syncMt5Groups,
  updateMt5Group,
  type Mt5Group,
} from "@/lib/api/mt5.admin";
import { cn } from "@/lib/utils";

function formatMoney(value: number | null, noMax = false) {
  if (value == null) return noMax ? "No max" : "-";
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

type ActionKey = "view" | "limits" | "toggle" | "delete";

function actionId(rowId: string, action: ActionKey) {
  return `${rowId}:${action}`;
}

function ActionButton({
  label,
  onClick,
  loading,
  disabled,
  danger,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
  icon: typeof Eye;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="flex min-w-[52px] flex-col items-center gap-0.5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] transition-colors",
          danger
            ? "text-red-500 hover:border-red-400"
            : "text-[var(--app-text-primary)] hover:border-green-500"
        )}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      </span>
      <span className="text-[10px] font-bold leading-tight text-[var(--app-text-muted)]">{label}</span>
    </button>
  );
}

export default function Mt5GroupsPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<"active" | "inactive">("active");
  const [rows, setRows] = useState<Mt5Group[]>([]);
  const [counts, setCounts] = useState({ active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [savingDedicated, setSavingDedicated] = useState(false);
  const [savingLimits, setSavingLimits] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [viewRow, setViewRow] = useState<Mt5Group | null>(null);
  const [editRow, setEditRow] = useState<Mt5Group | null>(null);
  const [limitsRow, setLimitsRow] = useState<Mt5Group | null>(null);
  const [deleteRow, setDeleteRow] = useState<Mt5Group | null>(null);
  const [dedicatedName, setDedicatedName] = useState("");
  const [limitsForm, setLimitsForm] = useState({
    marginCall: "",
    marginStopOut: "",
    minDeposit: "",
    maxDeposit: "",
    minWithdrawal: "",
    maxWithdrawal: "",
  });

  const setLoadingAction = (key: string | null) => setActionLoading(key);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMt5Groups({ status: tab, limit: 100 });
      setRows(data.items);
      setCounts(data.counts);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load groups", "error");
    } finally {
      setLoading(false);
    }
  }, [tab, showToast]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  async function handleSync() {
    setSyncing(true);
    try {
      await syncMt5Groups(forceUpdate);
      await loadGroups();
      showToast("Groups synced successfully from MT5");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Sync failed", "error");
    } finally {
      setSyncing(false);
    }
  }

  async function handleToggleActive(row: Mt5Group) {
    const key = actionId(row.id, "toggle");
    setLoadingAction(key);
    try {
      await updateMt5Group(row.id, { isActive: !row.isActive });
      await loadGroups();
      showToast(row.isActive ? "Group deactivated" : "Group activated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setLoadingAction(null);
    }
  }

  async function confirmDelete() {
    if (!deleteRow) return;
    setDeleting(true);
    try {
      await deleteMt5Group(deleteRow.id);
      setDeleteRow(null);
      await loadGroups();
      showToast("Group deleted successfully");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  }

  async function handleView(row: Mt5Group) {
    const key = actionId(row.id, "view");
    setLoadingAction(key);
    try {
      const detail = await getMt5Group(row.id);
      setViewRow(detail);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load detail", "error");
    } finally {
      setLoadingAction(null);
    }
  }

  function openDedicatedEdit(row: Mt5Group) {
    setEditRow(row);
    setDedicatedName(row.dedicatedName ?? "");
  }

  function openLimitsEdit(row: Mt5Group) {
    setLimitsRow(row);
    setLimitsForm({
      marginCall: row.marginCall != null ? String(row.marginCall) : "",
      marginStopOut: row.marginStopOut != null ? String(row.marginStopOut) : "",
      minDeposit: row.minDeposit != null ? String(row.minDeposit) : "",
      maxDeposit: row.maxDeposit != null ? String(row.maxDeposit) : "",
      minWithdrawal: row.minWithdrawal != null ? String(row.minWithdrawal) : "",
      maxWithdrawal: row.maxWithdrawal != null ? String(row.maxWithdrawal) : "",
    });
  }

  async function saveDedicated() {
    if (!editRow) return;
    setSavingDedicated(true);
    try {
      await updateMt5Group(editRow.id, { dedicatedName: dedicatedName || null });
      setEditRow(null);
      await loadGroups();
      showToast("Dedicated name saved");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSavingDedicated(false);
    }
  }

  async function saveLimits() {
    if (!limitsRow) return;
    const toNum = (v: string) => (v.trim() === "" ? null : Number(v));
    setSavingLimits(true);
    try {
      await updateMt5Group(limitsRow.id, {
        marginCall: toNum(limitsForm.marginCall),
        marginStopOut: toNum(limitsForm.marginStopOut),
        minDeposit: toNum(limitsForm.minDeposit),
        maxDeposit: toNum(limitsForm.maxDeposit),
        minWithdrawal: toNum(limitsForm.minWithdrawal),
        maxWithdrawal: toNum(limitsForm.maxWithdrawal),
      });
      setLimitsRow(null);
      await loadGroups();
      showToast("Limits saved successfully");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSavingLimits(false);
    }
  }

  const tableRows = rows.map((r) => ({ ...r })) as Array<Mt5Group & Record<string, unknown>>;

  return (
    <div className="mx-auto max-w-[2400px] space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--app-text-primary)] sm:text-3xl">Group management</h1>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--app-text-primary)]">
            <input
              type="checkbox"
              checked={forceUpdate}
              onChange={(e) => setForceUpdate(e.target.checked)}
              className="h-4 w-4 rounded accent-green-600"
            />
            Force update existing (overwrite raw data)
          </label>
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--app-primary-solid)] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Fetching..." : "Fetch groups from MT5"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["active", "inactive"] as const).map((t) => (
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
            {t} groups ({t === "active" ? counts.active : counts.inactive})
          </button>
        ))}
      </div>

      <AdminDataTable
        rows={tableRows}
        loading={loading}
        exportFileName="mt5-groups"
        searchPlaceholder="Search group name, dedicated name, company..."
        searchKeys={["groupName", "dedicatedName", "company"]}
        dateKey="lastSyncedAt"
        onReset={loadGroups}
        columns={[
          {
            key: "sr",
            label: "Sr No",
            render: (_row, index) => <span>{index + 1}</span>,
          },
          { key: "groupName", label: "Group name" },
          {
            key: "dedicatedName",
            label: "Dedicated name",
            render: (row) => (
              <div className="flex items-center gap-2">
                <span>{row.dedicatedName || "-"}</span>
                <button
                  type="button"
                  onClick={() => openDedicatedEdit(row as Mt5Group)}
                  className="text-[var(--app-text-muted)] hover:text-green-600"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
          {
            key: "marginCall",
            label: "Margin call",
            render: (row) => <span>{row.marginCall != null ? String(row.marginCall) : "-"}</span>,
          },
          {
            key: "marginStopOut",
            label: "Margin stop out",
            render: (row) => <span>{row.marginStopOut != null ? String(row.marginStopOut) : "-"}</span>,
          },
          {
            key: "minDeposit",
            label: "Min deposit",
            render: (row) => <span>{formatMoney(row.minDeposit as number | null)}</span>,
          },
          {
            key: "maxDeposit",
            label: "Max deposit",
            render: (row) => <span>{formatMoney(row.maxDeposit as number | null, true)}</span>,
          },
          {
            key: "minWithdrawal",
            label: "Min withdrawal",
            render: (row) => <span>{formatMoney(row.minWithdrawal as number | null)}</span>,
          },
          {
            key: "maxWithdrawal",
            label: "Max withdrawal",
            render: (row) => <span>{formatMoney(row.maxWithdrawal as number | null, true)}</span>,
          },
          {
            key: "lastSyncedAt",
            label: "Last synced",
            render: (row) => (
              <span>{new Date(String(row.lastSyncedAt)).toLocaleString()}</span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <StatusPill
                label={row.isActive ? "Active" : "Inactive"}
                tone={row.isActive ? "active" : "neutral"}
              />
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) => {
              const g = row as Mt5Group;
              const busy = actionLoading?.startsWith(`${g.id}:`) ?? false;
              return (
                <div className="flex items-start gap-2">
                  <ActionButton
                    label="View"
                    icon={Eye}
                    loading={actionLoading === actionId(g.id, "view")}
                    disabled={busy && actionLoading !== actionId(g.id, "view")}
                    onClick={() => handleView(g)}
                  />
                  <ActionButton
                    label="Limits"
                    icon={Pencil}
                    disabled={busy}
                    onClick={() => openLimitsEdit(g)}
                  />
                  <ActionButton
                    label={g.isActive ? "Inactive" : "Active"}
                    icon={Power}
                    loading={actionLoading === actionId(g.id, "toggle")}
                    disabled={busy && actionLoading !== actionId(g.id, "toggle")}
                    onClick={() => handleToggleActive(g)}
                  />
                  <ActionButton
                    label="Delete"
                    icon={Trash2}
                    danger
                    disabled={busy}
                    onClick={() => setDeleteRow(g)}
                  />
                </div>
              );
            },
          },
        ]}
      />

      <Modal open={!!viewRow} onClose={() => setViewRow(null)} title="Group details" subtitle={viewRow?.groupName}>
        {viewRow ? (
          <pre className="max-h-[420px] overflow-auto rounded-xl bg-[var(--app-surface-muted)] p-4 text-xs font-bold text-[var(--app-text-primary)]">
            {JSON.stringify(viewRow.rawJson, null, 2)}
          </pre>
        ) : null}
      </Modal>

      <Modal open={!!editRow} onClose={() => !savingDedicated && setEditRow(null)} title="Edit dedicated name" subtitle={editRow?.groupName}>
        <div className="space-y-4">
          <input
            value={dedicatedName}
            onChange={(e) => setDedicatedName(e.target.value)}
            disabled={savingDedicated}
            className="w-full rounded-xl border border-[var(--app-border)] px-4 py-3 text-sm font-bold disabled:opacity-50"
            placeholder="Display name for users"
          />
          <button
            type="button"
            onClick={saveDedicated}
            disabled={savingDedicated}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--app-primary-solid)] py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {savingDedicated ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {savingDedicated ? "Saving..." : "Save"}
          </button>
        </div>
      </Modal>

      <Modal open={!!limitsRow} onClose={() => !savingLimits && setLimitsRow(null)} title="Edit limits" subtitle={limitsRow?.groupName}>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["marginCall", "Margin call"],
              ["marginStopOut", "Margin stop out"],
              ["minDeposit", "Min deposit"],
              ["maxDeposit", "Max deposit"],
              ["minWithdrawal", "Min withdrawal"],
              ["maxWithdrawal", "Max withdrawal"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">{label}</label>
              <input
                value={limitsForm[key]}
                onChange={(e) => setLimitsForm((f) => ({ ...f, [key]: e.target.value }))}
                disabled={savingLimits}
                className="mt-1 w-full rounded-xl border border-[var(--app-border)] px-3 py-2.5 text-sm font-bold disabled:opacity-50"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={saveLimits}
          disabled={savingLimits}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--app-primary-solid)] py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {savingLimits ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {savingLimits ? "Saving..." : "Save limits"}
        </button>
      </Modal>

      <Modal
        open={!!deleteRow}
        onClose={() => !deleting && setDeleteRow(null)}
        title="Delete group"
        subtitle={deleteRow?.groupName}
      >
        <p className="text-sm font-bold text-[var(--app-text-secondary)]">
          Are you sure you want to delete this group? This action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setDeleteRow(null)}
            disabled={deleting}
            className="flex-1 rounded-xl border border-[var(--app-border)] py-3 text-sm font-bold text-[var(--app-text-primary)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            disabled={deleting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
