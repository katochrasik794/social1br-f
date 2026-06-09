"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Server, PlugZap, Save, Eye, EyeOff, Pencil, Loader2, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import StatusPill from "@/components/ui/StatusPill";
import { useToast } from "@/components/ui/Toast";
import {
  deleteManagerConfig,
  fetchManagerConfigs,
  saveManagerConfig,
  testManagerConnection,
  type Mt5ManagerConfig,
} from "@/lib/api/mt5.admin";

function maskApiKey(key: string) {
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

function emptyForm() {
  return {
    label: "Default",
    apiKey: "",
    mt5Login: "",
    mt5Password: "",
    mt5Server: "",
    lastTestedAt: null as string | null,
  };
}

export default function Mt5ManagerPage() {
  const { showToast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  const [configs, setConfigs] = useState<Mt5ManagerConfig[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formEnabled, setFormEnabled] = useState(true);
  const [label, setLabel] = useState("Default");
  const [apiKey, setApiKey] = useState("");
  const [mt5Login, setMt5Login] = useState("");
  const [mt5Password, setMt5Password] = useState("");
  const [mt5Server, setMt5Server] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lastTestedAt, setLastTestedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [deleteRow, setDeleteRow] = useState<Mt5ManagerConfig | null>(null);
  const [deleting, setDeleting] = useState(false);

  const resetFormEmpty = useCallback(() => {
    const empty = emptyForm();
    setEditingId(null);
    setLabel(empty.label);
    setApiKey(empty.apiKey);
    setMt5Login(empty.mt5Login);
    setMt5Password(empty.mt5Password);
    setMt5Server(empty.mt5Server);
    setLastTestedAt(empty.lastTestedAt);
    setShowPassword(false);
  }, []);

  const populateForm = useCallback((data: Mt5ManagerConfig) => {
    setEditingId(data.id);
    setLabel(data.label);
    setApiKey(data.apiKey);
    setMt5Login(String(data.mt5Login));
    setMt5Password(data.mt5Password);
    setMt5Server(data.mt5Server);
    setLastTestedAt(data.lastTestedAt);
    setShowPassword(false);
    setFormEnabled(true);
  }, []);

  const applyListState = useCallback(
    (list: Mt5ManagerConfig[], keepEditing = false) => {
      setConfigs(list);
      if (list.length === 0) {
        resetFormEmpty();
        setFormEnabled(true);
      } else if (!keepEditing) {
        resetFormEmpty();
        setFormEnabled(false);
      }
    },
    [resetFormEmpty]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchManagerConfigs();
      applyListState(list);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load config", "error");
    } finally {
      setLoading(false);
    }
  }, [applyListState, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleEdit(row: Mt5ManagerConfig) {
    setEditingRowId(row.id);
    try {
      populateForm(row);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      setEditingRowId(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveManagerConfig({
        id: editingId ?? undefined,
        label,
        apiKey,
        mt5Login: Number(mt5Login),
        mt5Password: mt5Password || undefined,
        mt5Server,
      });
      showToast("Manager connection saved");
      const list = await fetchManagerConfigs();
      applyListState(list);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    try {
      const result = await testManagerConnection({
        apiKey,
        mt5Login: Number(mt5Login),
        mt5Password: mt5Password || undefined,
        mt5Server,
      });
      showToast(result.message);
      const list = await fetchManagerConfigs();
      setConfigs(list);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Connection test failed", "error");
    } finally {
      setTesting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteRow) return;
    setDeleting(true);
    try {
      await deleteManagerConfig(deleteRow.id);
      setDeleteRow(null);
      resetFormEmpty();
      setFormEnabled(true);
      await loadData();
      showToast("Connection deleted");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  }

  const hasConnection = configs.length > 0;
  const isEditing = formEnabled && editingId !== null;
  const isCreating = formEnabled && !hasConnection;
  const formDisabled = !formEnabled;

  const fieldClass =
    "mt-1 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm font-bold text-[var(--app-text-primary)] outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mx-auto w-full space-y-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400">
          <Server className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--app-text-primary)] sm:text-3xl">Manager Connection</h1>
          <p className="mt-1 text-sm font-bold text-[var(--app-text-secondary)]">
            MT5 manager credentials are stored in the database.
          </p>
        </div>
      </div>

      <div
        ref={formRef}
        className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-md"
      >
        {loading ? (
          <p className="text-center text-sm font-bold text-[var(--app-text-muted)]">Loading...</p>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-bold text-[var(--app-text-primary)]">
                {isEditing ? "Edit connection" : isCreating ? "New connection" : "Connection form"}
              </p>
              {formDisabled && hasConnection ? (
                <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                  You can add maximum only one connection at a time. Click Edit in the table below to update the
                  existing connection.
                </p>
              ) : null}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-[var(--app-text-muted)]">Label</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-[var(--app-text-muted)]">API Key</label>
              <input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-[var(--app-text-muted)]">
                  MT5 Login
                </label>
                <input
                  value={mt5Login}
                  onChange={(e) => setMt5Login(e.target.value)}
                  disabled={formDisabled}
                  className={fieldClass}
                />
              </div>
              <div className="sm:col-span-1 lg:col-span-3">
                <label className="text-xs font-bold uppercase tracking-wide text-[var(--app-text-muted)]">
                  MT5 Server (host:port)
                </label>
                <input
                  value={mt5Server}
                  onChange={(e) => setMt5Server(e.target.value)}
                  disabled={formDisabled}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="max-w-xl">
              <label className="text-xs font-bold uppercase tracking-wide text-[var(--app-text-muted)]">
                MT5 Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={mt5Password}
                  onChange={(e) => setMt5Password(e.target.value)}
                  disabled={formDisabled}
                  placeholder="••••••••"
                  className={`${fieldClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={formDisabled}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text-primary)] disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {lastTestedAt && formEnabled ? (
              <p className="text-xs font-bold text-[var(--app-text-muted)]">
                Last tested: {new Date(lastTestedAt).toLocaleString()}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={formDisabled || saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--app-primary-solid)] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save Connection"}
              </button>
              <button
                type="button"
                onClick={handleTest}
                disabled={formDisabled || testing}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-3 text-sm font-bold text-[var(--app-text-primary)] disabled:opacity-50"
              >
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
                {testing ? "Testing..." : "Test Connection"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-md">
        <div className="border-b border-[var(--app-border)] px-5 py-4">
          <h2 className="text-lg font-bold text-[var(--app-text-primary)]">Stored in database</h2>
          <p className="mt-1 text-xs font-bold text-[var(--app-text-muted)]">
            Only one connection is allowed. Use Edit to update or Delete to remove it.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="rating-table-head border-b">
                <th className="px-4 py-3 text-xs font-bold uppercase">Label</th>
                <th className="px-4 py-3 text-xs font-bold uppercase">API Key</th>
                <th className="px-4 py-3 text-xs font-bold uppercase">Login</th>
                <th className="px-4 py-3 text-xs font-bold uppercase">Server</th>
                <th className="px-4 py-3 text-xs font-bold uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-bold uppercase">Last tested</th>
                <th className="px-4 py-3 text-xs font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm font-bold text-[var(--app-text-muted)]">
                    No manager connection stored yet. Use the form above to add one.
                  </td>
                </tr>
              ) : (
                configs.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--app-border)] last:border-0">
                    <td className="px-4 py-4 font-bold text-[var(--app-text-primary)]">{row.label}</td>
                    <td className="px-4 py-4 font-bold text-[var(--app-text-secondary)]">{maskApiKey(row.apiKey)}</td>
                    <td className="px-4 py-4 font-bold text-[var(--app-text-secondary)]">{row.mt5Login}</td>
                    <td className="px-4 py-4 font-bold text-[var(--app-text-secondary)]">{row.mt5Server}</td>
                    <td className="px-4 py-4">
                      <StatusPill label={row.isActive ? "Active" : "Inactive"} tone={row.isActive ? "active" : "neutral"} />
                    </td>
                    <td className="px-4 py-4 font-bold text-[var(--app-text-secondary)]">
                      {row.lastTestedAt ? new Date(row.lastTestedAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(row)}
                          disabled={editingRowId === row.id}
                          className="inline-flex flex-col items-center gap-0.5 disabled:opacity-50"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] hover:border-green-500">
                            {editingRowId === row.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Pencil className="h-4 w-4" />
                            )}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--app-text-muted)]">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteRow(row)}
                          className="inline-flex flex-col items-center gap-0.5"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] text-red-500 hover:border-red-400">
                            <Trash2 className="h-4 w-4" />
                          </span>
                          <span className="text-[10px] font-bold text-[var(--app-text-muted)]">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!deleteRow}
        onClose={() => !deleting && setDeleteRow(null)}
        title="Delete connection"
        subtitle={deleteRow?.label}
      >
        <p className="text-sm font-bold text-[var(--app-text-secondary)]">
          Are you sure you want to delete this manager connection? You can add a new one after deletion.
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
