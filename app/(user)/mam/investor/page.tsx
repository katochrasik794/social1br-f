"use client";

import { useEffect, useState } from "react";
import { Network, Link2, TrendingUp, Users, Wallet } from "lucide-react";
import PageContainer, { HeroCard, InlineBreadcrumb, btnPrimary } from "@/components/layout/user/PageContainer";
import StatCard from "@/components/ui/StatCard";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import StatusPill, { statusToTone, RiskPill } from "@/components/ui/StatusPill";
import {
  fetchMamInvestorDashboard,
  type MamLink,
  type MamManager,
} from "@/lib/api/mam";
import { fetchTradingAccounts, type TradingAccount } from "@/lib/api/trading";
import { money, pct, formatDate } from "@/lib/utils";

export default function MamInvestorPage() {
  const [managers, setManagers] = useState<MamManager[]>([]);
  const [links, setLinks] = useState<MamLink[]>([]);
  const [summary, setSummary] = useState({
    linkedAccounts: 0,
    totalAum: 0,
    avgPnlPct: 0,
    activeManagers: 0,
  });
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestManager, setRequestManager] = useState<MamManager | null>(null);
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    Promise.all([fetchMamInvestorDashboard(), fetchTradingAccounts()])
      .then(([data, accounts]) => {
        setManagers(data.managers);
        setLinks(data.links);
        setSummary(data.summary);
        setTradingAccounts(accounts.filter((a) => a.accountStatus === "active"));
        if (accounts[0]) setAccountId(accounts[0].id);
      })
      .catch(() => {
        setManagers([]);
        setLinks([]);
        setTradingAccounts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer>
      <div className="w-full min-w-0 space-y-6">
        <InlineBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "MAM" }, { label: "Investor Area" }]} />
        <HeroCard icon={Network} title="MAM Investor Area" subtitle="Discover managers and link your MT5 accounts" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Link2} label="Linked Accounts" value={summary.linkedAccounts} />
          <StatCard icon={Wallet} label="Total AUM" value={money(summary.totalAum)} />
          <StatCard icon={TrendingUp} label="Avg P&L" value={pct(summary.avgPnlPct)} />
          <StatCard icon={Users} label="Active Managers" value={summary.activeManagers} />
        </div>

        <h2 className="text-lg font-bold">Discover Managers</h2>
        {loading ? (
          <p className="text-sm text-[var(--app-text-muted)]">Loading managers…</p>
        ) : managers.length === 0 ? (
          <p className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-sm text-[var(--app-text-muted)]">
            No MAM managers are available yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {managers.map((m) => (
              <article key={m.id} className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold">{m.displayName}</h3>
                    <p className="text-sm text-[var(--app-text-secondary)]">{m.headline}</p>
                  </div>
                  <RiskPill level={m.riskLevel} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-[var(--app-text-muted)]">Win Rate</p><p className="font-semibold">{m.winRate}%</p></div>
                  <div><p className="text-[var(--app-text-muted)]">Followers</p><p className="font-semibold">{m.followersCount}</p></div>
                  <div><p className="text-[var(--app-text-muted)]">Fee</p><p className="font-semibold">{m.feePct}%</p></div>
                  <div><p className="text-[var(--app-text-muted)]">Scaling</p><p className="font-semibold">{m.lotScaling}</p></div>
                </div>
                <button type="button" onClick={() => setRequestManager(m)} className={`${btnPrimary} mt-4 w-full`}>Request Link</button>
              </article>
            ))}
          </div>
        )}

        <DataTable
          title="My Links"
          data={links}
          isLoading={loading}
          statusColumn="status"
          columns={[
            { key: "managerName", label: "Manager" },
            { key: "accountLogin", label: "Account" },
            { key: "lotMultiplier", label: "Lot Multiplier" },
            { key: "pnlPct", label: "P&L", render: (r) => pct(r.pnlPct as number) },
            { key: "linkedAt", label: "Linked", render: (r) => formatDate(r.linkedAt as string) },
            { key: "status", label: "Status", render: (r) => <StatusPill label={String(r.status)} tone={statusToTone(String(r.status))} /> },
          ]}
        />

        <Modal open={!!requestManager} onClose={() => setRequestManager(null)} title={`Link to ${requestManager?.displayName}`}>
          <div className="space-y-4">
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm"
            >
              {tradingAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountNumber} — {money(a.balance)}
                </option>
              ))}
            </select>
            {tradingAccounts.length === 0 ? (
              <p className="text-sm text-amber-600">You need an active MT5 account to request a link.</p>
            ) : (
              <p className="text-sm text-amber-600">Link requests will be available once MAM linking is enabled.</p>
            )}
            <button type="button" onClick={() => setRequestManager(null)} className={`${btnPrimary} w-full`}>Close</button>
          </div>
        </Modal>
      </div>
    </PageContainer>
  );
}
