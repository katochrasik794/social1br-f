"use client";

import { useCallback, useEffect, useState } from "react";
import { Wallet, Plus } from "lucide-react";
import StatusPill from "@/components/ui/StatusPill";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import PageContainer from "@/components/layout/user/PageContainer";
import OpenAccountWizard from "@/components/accounts/OpenAccountWizard";
import {
  fetchAvailableGroups,
  fetchTradingAccounts,
  type AvailableGroup,
  type TradingAccount,
} from "@/lib/api/trading";

function AccountsPageInner() {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [groups, setGroups] = useState<AvailableGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [accts, grps] = await Promise.all([fetchTradingAccounts(), fetchAvailableGroups()]);
      setAccounts(accts);
      setGroups(grps);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load accounts", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--app-text-primary)]">My Accounts</h1>
            <p className="mt-1 text-sm font-bold text-[var(--app-text-secondary)]">
              Open and manage your MT5 trading accounts.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpenModal(true)}
          disabled={groups.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--app-primary-solid)] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Open MT5 Account
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="rating-table-head border-b">
                {[
                  "Login",
                  "Group",
                  "Leverage",
                  "Master Pass",
                  "Investor Pass",
                  "Balance",
                  "Currency",
                  "Status",
                  "Opened",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-bold uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center font-bold text-[var(--app-text-muted)]">
                    Loading...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center font-bold text-[var(--app-text-muted)]">
                    No MT5 accounts yet. Click Open MT5 Account to get started.
                  </td>
                </tr>
              ) : (
                accounts.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--app-border)] last:border-0">
                    <td className="px-4 py-4 font-bold">{a.accountNumber}</td>
                    <td className="px-4 py-4">{a.mt5Group}</td>
                    <td className="px-4 py-4">1:{a.leverage}</td>
                    <td className="px-4 py-4 font-mono text-xs">{a.masterPassword || "—"}</td>
                    <td className="px-4 py-4 font-mono text-xs">{a.investorPassword || "—"}</td>
                    <td className="px-4 py-4">${a.balance.toLocaleString()}</td>
                    <td className="px-4 py-4">{a.currency}</td>
                    <td className="px-4 py-4">
                      <StatusPill label={a.accountStatus} tone="active" />
                    </td>
                    <td className="px-4 py-4">{new Date(a.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OpenAccountWizard
        open={openModal}
        onClose={() => setOpenModal(false)}
        groups={groups}
        onSuccess={() => {
          showToast("MT5 account opened successfully");
          load();
        }}
        onError={(msg) => showToast(msg, "error")}
      />
    </PageContainer>
  );
}

export default function AccountsPage() {
  return (
    <ToastProvider>
      <AccountsPageInner />
    </ToastProvider>
  );
}
