"use client";

import { useState } from "react";
import { Network, Link2, TrendingUp, Users, Wallet } from "lucide-react";
import PageContainer, { HeroCard, InlineBreadcrumb, btnPrimary } from "@/components/layout/user/PageContainer";
import StatCard from "@/components/ui/StatCard";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import StatusPill, { statusToTone, RiskPill } from "@/components/ui/StatusPill";
import { mockMamManagers, mockManagedLinks } from "@/lib/mock/mam";
import { mockTradingAccounts } from "@/lib/mock/copier";
import { money, pct, formatDate } from "@/lib/utils";

export default function MamInvestorPage() {
  const [requestManager, setRequestManager] = useState<(typeof mockMamManagers)[0] | null>(null);
  const [links, setLinks] = useState(mockManagedLinks);
  const [accountId, setAccountId] = useState(mockTradingAccounts[0].id);

  const totalAum = links.length * 10000;
  const totalPnl = links.reduce((s, l) => s + l.pnlPct, 0) / links.length;

  return (
    <PageContainer>
      <div className="w-full min-w-0 space-y-6">
        <InlineBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "MAM" }, { label: "Investor Area" }]} />
        <HeroCard icon={Network} title="MAM Investor Area" subtitle="Discover managers and link your MT5 accounts" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Link2} label="Linked Accounts" value={links.filter((l) => l.status === "Active").length} />
          <StatCard icon={Wallet} label="Total AUM" value={money(totalAum)} />
          <StatCard icon={TrendingUp} label="Avg P&L" value={pct(totalPnl)} />
          <StatCard icon={Users} label="Active Managers" value={new Set(links.map((l) => l.managerId)).size} />
        </div>

        <h2 className="text-lg font-bold">Discover Managers</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {mockMamManagers.map((m) => (
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

        <DataTable
          title="My Links"
          data={links}
          statusColumn="status"
          columns={[
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
                <button
                  type="button"
                  onClick={() => setLinks((prev) => prev.map((l) => (l.id === r.id ? { ...l, status: "Stopped" as const } : l)))}
                  className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600"
                >
                  Revoke
                </button>
              ),
            },
          ]}
        />

        <Modal open={!!requestManager} onClose={() => setRequestManager(null)} title={`Link to ${requestManager?.displayName}`}>
          <div className="space-y-4">
            <select value={accountId} onChange={(e) => setAccountId(Number(e.target.value))} className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm">
              {mockTradingAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.login} — {money(a.balance)}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> I authorize account management</label>
            <button type="button" onClick={() => setRequestManager(null)} className={`${btnPrimary} w-full`}>Submit Request</button>
          </div>
        </Modal>
      </div>
    </PageContainer>
  );
}
