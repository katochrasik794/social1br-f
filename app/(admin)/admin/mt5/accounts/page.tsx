"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import AdminDataTable from "@/components/admin/AdminDataTable";
import StatusPill from "@/components/ui/StatusPill";
import { useToast } from "@/components/ui/Toast";
import { fetchAdminTradingAccounts, type AdminTradingAccount } from "@/lib/api/funds.admin";

export default function AdminMt5AccountsPage() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<AdminTradingAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminTradingAccounts({ limit: 100 });
      setRows(data.items);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load accounts", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const tableRows = rows.map((r) => ({ ...r })) as Array<AdminTradingAccount & Record<string, unknown>>;

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--app-text-primary)]">User MT5 Accounts</h1>
          <p className="mt-1 text-sm font-bold text-[var(--app-text-secondary)]">
            All trading accounts opened by users.
          </p>
        </div>
      </div>

      <AdminDataTable
        rows={tableRows}
        loading={loading}
        exportFileName="mt5-user-accounts"
        searchPlaceholder="Search user, email, login, group..."
        searchKeys={["userName", "userEmail", "accountNumber", "mt5Group"]}
        dateKey="createdAt"
        onReset={load}
        columns={[
          { key: "userName", label: "User" },
          { key: "userEmail", label: "Email" },
          { key: "accountNumber", label: "Login" },
          { key: "mt5Group", label: "Group" },
          { key: "leverage", label: "Leverage", render: (r) => <span>1:{String(r.leverage)}</span> },
          {
            key: "balance",
            label: "Balance",
            render: (r) => <span>${Number(r.balance).toLocaleString()}</span>,
          },
          {
            key: "status",
            label: "Status",
            render: (r) => <StatusPill label={String(r.accountStatus)} tone="active" />,
          },
          {
            key: "createdAt",
            label: "Opened",
            render: (r) => <span>{new Date(String(r.createdAt)).toLocaleString()}</span>,
          },
        ]}
      />
    </div>
  );
}
