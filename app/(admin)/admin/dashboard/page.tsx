"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  MailWarning,
  Server,
  Crown,
  Wallet,
  Copy,
  Layers,
  Network,
  ArrowRight,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import StatusPill, { statusToTone } from "@/components/ui/StatusPill";
import {
  fetchAdminActivityLogs,
  fetchAdminDashboardOverview,
  type AdminActivityLog,
  type AdminDashboardOverview,
  type AdminDashboardStats,
  type AdminRecentLog,
} from "@/lib/api/dashboard.admin";
import { formatDate, money, pct } from "@/lib/utils";

function pctOf(part: number, total: number) {
  if (total <= 0) return "0%";
  return pct((part / total) * 100);
}

function SummaryCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
      <h3 className="font-bold text-[var(--app-text-primary)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--app-text-muted)]">{subtitle}</p>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-[var(--app-text-secondary)]">{row.label}</span>
            <span className="font-semibold text-[var(--app-text-primary)]">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentList({
  title,
  href,
  rows,
  showAmount,
}: {
  title: string;
  href: string;
  rows: AdminRecentLog[];
  showAmount?: boolean;
}) {
  return (
    <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[var(--app-text-primary)]">{title}</h3>
        <Link href={href} className="text-xs font-semibold text-[color:var(--app-primary-solid)] hover:underline">
          View all
        </Link>
      </div>
      <div className="mt-3 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--app-text-muted)]">No records yet.</p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="border-b border-[var(--app-border)] pb-3 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{row.userName ?? row.userEmail}</p>
                  <p className="text-xs text-[var(--app-text-muted)]">{formatDate(String(row.time))}</p>
                  {row.mt5 ? <p className="text-xs text-[var(--app-text-muted)]">MT5 {row.mt5}</p> : null}
                </div>
                <div className="shrink-0 text-right">
                  {showAmount && row.amount != null ? (
                    <p className="text-sm font-semibold">{money(row.amount)}</p>
                  ) : null}
                  <StatusPill
                    label={row.status === "opened" ? "Opened" : row.status}
                    tone={statusToTone(row.status === "opened" ? "Approved" : row.status)}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recent, setRecent] = useState<AdminDashboardOverview["recent"] | null>(null);
  const [activity, setActivity] = useState<AdminActivityLog[]>([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityPage, setActivityPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    fetchAdminDashboardOverview()
      .then((data) => {
        setStats(data.stats);
        setRecent(data.recent);
        setActivity(data.activityLogs);
        setActivityTotal(data.activityPagination.total);
      })
      .catch(() => {
        setStats(null);
        setRecent(null);
        setActivity([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadActivity = useCallback(async (page: number, q: string) => {
    setLogsLoading(true);
    try {
      const data = await fetchAdminActivityLogs({ search: q || undefined, page, limit: 10 });
      setActivity(data.items);
      setActivityTotal(data.total);
      setActivityPage(data.page);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  function handleSearch() {
    loadActivity(1, search.trim());
  }

  const s = stats;

  const modules = s
    ? [
        {
          name: "Copier",
          icon: Copy,
          href: "/admin/copier/masters",
          kpis: [
            `${s.copier.activeCopies} Active Copies`,
            `${s.copier.approvedMasters} Masters`,
            `${money(s.aum.copierAllocated)} Allocated AUM`,
          ],
        },
        {
          name: "PAMM",
          icon: Layers,
          href: "/admin/pamm/investors",
          kpis: [
            `${s.pamm.activeInvestments} Investments`,
            `${s.pamm.pools} Pools`,
            `${money(s.pamm.nav || s.pamm.totalInvested)} NAV`,
          ],
        },
        {
          name: "MAM",
          icon: Network,
          href: "/admin/mam/investors",
          kpis: [
            `${s.mam.activeLinks} Links`,
            `${s.mam.managers} Managers`,
            `${money(s.mam.aum)} AUM`,
          ],
        },
      ]
    : [];

  return (
    <div className="w-full min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--app-text-primary)]">Admin Dashboard</h1>
        <p className="text-sm text-[var(--app-text-secondary)]">Platform overview with live trading data</p>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--app-text-muted)]">Loading dashboard…</p>
      ) : !s ? (
        <p className="text-sm text-rose-600">Failed to load dashboard stats.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              icon={Users}
              label="Total Users"
              value={s.users.total}
              helper={`Active: ${s.users.active} (${pctOf(s.users.active, s.users.total)})`}
            />
            <StatCard
              icon={MailWarning}
              label="Email Unverified"
              value={s.users.emailUnverified}
              helper={`${pctOf(s.users.emailUnverified, s.users.total)} of users`}
              tone="neutral"
            />
            <StatCard
              icon={Crown}
              label="Total Masters"
              value={s.masters.approved}
              helper={`Pending: ${s.masters.pending} · Accounts: ${s.masters.linkedAccounts}`}
            />
            <StatCard
              icon={Server}
              label="Total MT5 Accounts"
              value={s.mt5.total}
              helper={`Active: ${s.mt5.active} · Per user: ${s.users.total > 0 ? (s.mt5.total / s.users.total).toFixed(2) : "0"}`}
            />
            <StatCard
              icon={TrendingUp}
              label="Total Platform AUM"
              value={money(s.aum.platformTotal)}
              helper={`Masters ${money(s.aum.masterBalances)} · Copier ${money(s.aum.copierAllocated)}`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SummaryCard
              title="Deposits"
              subtitle={`MTD ${money(s.deposits.mtd)} · Today ${money(s.deposits.today)} (7-day avg ${money(s.deposits.sevenDayAvg)})`}
              rows={[
                { label: "Total Deposited", value: money(s.deposits.totalApproved) },
                { label: "From Master Accounts", value: money(s.deposits.fromMasterAccounts) },
                { label: "From Copier Accounts", value: money(s.deposits.fromCopierAccounts) },
                { label: "Pending Deposits", value: String(s.deposits.pending) },
                { label: "Rejected Deposits", value: String(s.deposits.rejected) },
              ]}
            />
            <SummaryCard
              title="Withdrawals"
              subtitle={`MTD ${money(s.withdrawals.mtd)} · Today ${money(s.withdrawals.today)} (7-day avg ${money(s.withdrawals.sevenDayAvg)})`}
              rows={[
                { label: "Total Withdrawn", value: money(s.withdrawals.totalApproved) },
                { label: "Pending Withdrawals", value: String(s.withdrawals.pending) },
                { label: "Rejected Withdrawals", value: String(s.withdrawals.rejected) },
                { label: "Active Copiers", value: String(s.copier.activeCopiers) },
                { label: "Copier Allocated AUM", value: money(s.aum.copierAllocated) },
              ]}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {modules.map((mod) => (
              <Link
                key={mod.name}
                href={mod.href}
                className="group rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-md bg-[color-mix(in_oklab,var(--app-primary-solid)_10%,var(--app-mix-base))] text-[color:var(--app-primary-solid)]">
                      <mod.icon className="h-6 w-6" />
                    </span>
                    <h2 className="text-lg font-bold">{mod.name}</h2>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[var(--app-text-muted)] group-hover:text-[color:var(--app-primary-solid)]" />
                </div>
                <ul className="mt-4 space-y-2">
                  {mod.kpis.map((kpi) => (
                    <li key={kpi} className="text-sm text-[var(--app-text-secondary)]">{kpi}</li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>

          {recent ? (
            <div>
              <h2 className="mb-3 text-lg font-bold">All Operation Logs</h2>
              <div className="grid gap-4 lg:grid-cols-3">
                <RecentList title="Recent Deposits" href="/admin/deposits" rows={recent.deposits} showAmount />
                <RecentList title="Recent Withdrawals" href="/admin/withdrawals" rows={recent.withdrawals} showAmount />
                <RecentList title="Recent Accounts Opened" href="/admin/mt5/accounts" rows={recent.accountsOpened} />
              </div>
            </div>
          ) : null}

          <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">Activity Logs</h2>
              <div className="flex gap-2">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user, MT5, details…"
                  className="min-w-[220px] rounded-md border border-[var(--app-border)] px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="rounded-md border border-[var(--app-border)] px-3 py-2 text-sm font-medium"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--app-border)] text-xs uppercase tracking-wide text-[var(--app-text-muted)]">
                    <th className="px-2 py-2">Time</th>
                    <th className="px-2 py-2">Type</th>
                    <th className="px-2 py-2">User</th>
                    <th className="px-2 py-2">MT5</th>
                    <th className="px-2 py-2">Amount</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logsLoading ? (
                    <tr>
                      <td colSpan={7} className="px-2 py-6 text-center text-[var(--app-text-muted)]">
                        Loading…
                      </td>
                    </tr>
                  ) : activity.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-2 py-6 text-center text-[var(--app-text-muted)]">
                        No activity found.
                      </td>
                    </tr>
                  ) : (
                    activity.map((row) => (
                      <tr key={`${row.type}-${row.id}`} className="border-b border-[var(--app-border)] last:border-0">
                        <td className="px-2 py-2 whitespace-nowrap">{formatDate(row.time)}</td>
                        <td className="px-2 py-2">{row.type}</td>
                        <td className="px-2 py-2">{row.user}</td>
                        <td className="px-2 py-2">{row.mt5 || "—"}</td>
                        <td className="px-2 py-2">{row.amount != null ? money(row.amount) : "—"}</td>
                        <td className="px-2 py-2">
                          <StatusPill label={row.status} tone={statusToTone(row.status)} />
                        </td>
                        <td className="px-2 py-2 text-[var(--app-text-muted)]">{row.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-[var(--app-text-muted)]">
              <span>
                Showing {(activityPage - 1) * 10 + 1}-{Math.min(activityPage * 10, activityTotal)} of {activityTotal}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={activityPage <= 1 || logsLoading}
                  onClick={() => loadActivity(activityPage - 1, search)}
                  className="rounded border border-[var(--app-border)] px-2 py-1 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={activityPage * 10 >= activityTotal || logsLoading}
                  onClick={() => loadActivity(activityPage + 1, search)}
                  className="rounded border border-[var(--app-border)] px-2 py-1 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/deposits" className="flex items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm font-medium hover:bg-[var(--app-surface-muted)]">
              <ArrowDownToLine className="h-4 w-4" /> Manage Deposits
            </Link>
            <Link href="/admin/withdrawals" className="flex items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm font-medium hover:bg-[var(--app-surface-muted)]">
              <ArrowUpFromLine className="h-4 w-4" /> Manage Withdrawals
            </Link>
            <Link href="/admin/copier/masters" className="flex items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm font-medium hover:bg-[var(--app-surface-muted)]">
              <Crown className="h-4 w-4" /> Master Traders
            </Link>
            <Link href="/admin/mt5/accounts" className="flex items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm font-medium hover:bg-[var(--app-surface-muted)]">
              <Wallet className="h-4 w-4" /> MT5 Accounts
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
