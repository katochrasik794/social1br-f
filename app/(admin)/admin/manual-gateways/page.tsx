"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, Loader2, Pencil, Plus, Power, Trash2 } from "lucide-react";
import AdminDataTable from "@/components/admin/AdminDataTable";
import Modal from "@/components/ui/Modal";
import StatusPill from "@/components/ui/StatusPill";
import { useToast } from "@/components/ui/Toast";
import {
  createAdminGateway,
  deleteAdminGateway,
  fetchAdminGateways,
  toggleAdminGateway,
  updateAdminGateway,
} from "@/lib/api/gateways.admin";
import type { GatewayCategory, ManualGateway } from "@/lib/api/gateways";
import { resolveAssetUrl } from "@/lib/api/gateways";

const CATEGORIES: { value: GatewayCategory; label: string }[] = [
  { value: "gateway", label: "Gateway" },
  { value: "cryptocurrency", label: "Cryptocurrency" },
  { value: "wire_transfer", label: "Wire Transfer" },
  { value: "upi", label: "UPI / UPI QR" },
  { value: "local_depositor", label: "Local Depositor" },
];

const emptyForm = {
  category: "cryptocurrency" as GatewayCategory,
  name: "",
  slug: "",
  details: "",
  cryptoAddress: "",
  vpaAddress: "",
  bankName: "",
  accountNumber: "",
  processingTimeText: "5-15 Mins",
  feeDisplay: "0%",
  minAmount: "20",
  maxAmount: "200000",
  network: "",
  warningText: "",
  isActive: true,
  isRecommended: false,
  sortOrder: "0",
};

export default function ManualGatewaysPage() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<ManualGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<ManualGateway | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteRow, setDeleteRow] = useState<ManualGateway | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchAdminGateways());
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load gateways", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditRow(null);
    setForm(emptyForm);
    setIconFile(null);
    setQrFile(null);
    setModalOpen(true);
  }

  function openEdit(row: ManualGateway) {
    setEditRow(row);
    setForm({
      category: row.category,
      name: row.name,
      slug: row.slug,
      details: row.details ?? "",
      cryptoAddress: row.cryptoAddress ?? "",
      vpaAddress: row.vpaAddress ?? "",
      bankName: row.bankName ?? "",
      accountNumber: row.accountNumber ?? "",
      processingTimeText: row.processingTimeText,
      feeDisplay: row.feeDisplay,
      minAmount: String(row.minAmount),
      maxAmount: String(row.maxAmount),
      network: row.network ?? "",
      warningText: row.warningText ?? "",
      isActive: row.isActive,
      isRecommended: row.isRecommended,
      sortOrder: String(row.sortOrder),
    });
    setIconFile(null);
    setQrFile(null);
    setModalOpen(true);
  }

  async function handleSave() {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (iconFile) fd.append("icon", iconFile);
      if (qrFile) fd.append("qrCode", qrFile);
      if (editRow) await updateAdminGateway(editRow.id, fd);
      else await createAdminGateway(fd);
      setModalOpen(false);
      await load();
      showToast(editRow ? "Gateway updated" : "Gateway created");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(row: ManualGateway) {
    try {
      await toggleAdminGateway(row.id);
      await load();
      showToast("Status updated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Toggle failed", "error");
    }
  }

  async function confirmDelete() {
    if (!deleteRow) return;
    try {
      await deleteAdminGateway(deleteRow.id);
      setDeleteRow(null);
      await load();
      showToast("Gateway deleted");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  }

  const fieldClass =
    "mt-1 w-full rounded-xl border border-[var(--app-border)] px-3 py-2.5 text-sm font-bold";

  const tableRows = rows.map((r) => ({ ...r })) as Array<ManualGateway & Record<string, unknown>>;

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--app-text-primary)]">Manual Gateways</h1>
            <p className="mt-1 text-sm font-bold text-[var(--app-text-secondary)]">
              Manage deposit methods shown to users by category.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--app-primary-solid)] px-5 py-3 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" />
          Add method
        </button>
      </div>

      <AdminDataTable
        rows={tableRows}
        loading={loading}
        exportFileName="manual-gateways"
        searchPlaceholder="Search name, slug, network..."
        searchKeys={["name", "slug", "network", "category"]}
        onReset={load}
        columns={[
          { key: "name", label: "Name" },
          { key: "category", label: "Category" },
          {
            key: "address",
            label: "Address / VPA",
            render: (r) => (
              <span className="max-w-[200px] truncate">
                {String(r.cryptoAddress || r.vpaAddress || r.accountNumber || "—")}
              </span>
            ),
          },
          {
            key: "limits",
            label: "Limits",
            render: (r) => (
              <span>
                ${Number(r.minAmount)} - ${Number(r.maxAmount)}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <StatusPill label={r.isActive ? "Active" : "Inactive"} tone={r.isActive ? "active" : "neutral"} />
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (r) => {
              const g = r as ManualGateway;
              return (
                <div className="flex gap-2">
                  <button type="button" onClick={() => openEdit(g)} className="text-[var(--app-text-muted)] hover:text-green-600">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleToggle(g)} className="text-[var(--app-text-muted)] hover:text-green-600">
                    <Power className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setDeleteRow(g)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            },
          },
        ]}
      />

      <Modal
        open={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editRow ? "Edit gateway" : "Add gateway"}
        wide
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as GatewayCategory }))}
              className={fieldClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Name</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={fieldClass} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Slug</label>
            <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={fieldClass} placeholder="auto from name if empty" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Network</label>
            <input value={form.network} onChange={(e) => setForm((f) => ({ ...f, network: e.target.value }))} className={fieldClass} />
          </div>
          {form.category === "cryptocurrency" ? (
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Crypto address</label>
              <input value={form.cryptoAddress} onChange={(e) => setForm((f) => ({ ...f, cryptoAddress: e.target.value }))} className={fieldClass} />
            </div>
          ) : null}
          {form.category === "upi" ? (
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">VPA address</label>
              <input value={form.vpaAddress} onChange={(e) => setForm((f) => ({ ...f, vpaAddress: e.target.value }))} className={fieldClass} />
            </div>
          ) : null}
          {form.category === "wire_transfer" ? (
            <>
              <div>
                <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Bank name</label>
                <input value={form.bankName} onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))} className={fieldClass} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Account number</label>
                <input value={form.accountNumber} onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))} className={fieldClass} />
              </div>
            </>
          ) : null}
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Min amount</label>
            <input value={form.minAmount} onChange={(e) => setForm((f) => ({ ...f, minAmount: e.target.value }))} className={fieldClass} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Max amount</label>
            <input value={form.maxAmount} onChange={(e) => setForm((f) => ({ ...f, maxAmount: e.target.value }))} className={fieldClass} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Processing time</label>
            <input value={form.processingTimeText} onChange={(e) => setForm((f) => ({ ...f, processingTimeText: e.target.value }))} className={fieldClass} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Fee</label>
            <input value={form.feeDisplay} onChange={(e) => setForm((f) => ({ ...f, feeDisplay: e.target.value }))} className={fieldClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Warning text</label>
            <textarea value={form.warningText} onChange={(e) => setForm((f) => ({ ...f, warningText: e.target.value }))} rows={2} className={fieldClass} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Icon image</label>
            <input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0] ?? null)} className="mt-1 w-full text-sm" />
            {editRow?.iconUrl ? (
              <p className="mt-1 text-xs text-[var(--app-text-muted)]">Current: {resolveAssetUrl(editRow.iconUrl)}</p>
            ) : null}
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">QR code image</label>
            <input type="file" accept="image/*" onChange={(e) => setQrFile(e.target.files?.[0] ?? null)} className="mt-1 w-full text-sm" />
            {editRow?.qrCodeUrl ? (
              <p className="mt-1 text-xs text-[var(--app-text-muted)]">Current: {resolveAssetUrl(editRow.qrCodeUrl)}</p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting || !form.name.trim()}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--app-primary-solid)] py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Saving..." : "Save gateway"}
        </button>
      </Modal>

      <Modal open={!!deleteRow} onClose={() => setDeleteRow(null)} title="Delete gateway" subtitle={deleteRow?.name}>
        <p className="text-sm font-bold text-[var(--app-text-secondary)]">This cannot be undone.</p>
        <button
          type="button"
          onClick={confirmDelete}
          className="mt-4 w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white"
        >
          Delete
        </button>
      </Modal>
    </div>
  );
}
