"use client";

import { useEffect, useState } from "react";
import { Layers, Wallet, TrendingUp, Clock, Users } from "lucide-react";
import PageContainer, { HeroCard, InlineBreadcrumb, btnPrimary } from "@/components/layout/user/PageContainer";
import StatCard from "@/components/ui/StatCard";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import StatusPill, { statusToTone, RiskPill } from "@/components/ui/StatusPill";
import {
  fetchPammInvestorDashboard,
  type PammInvestment,
  type PammPool,
} from "@/lib/api/pamm";
import { money, pct, formatDate } from "@/lib/utils";

export default function PammInvestorPage() {
  const [pools, setPools] = useState<PammPool[]>([]);
  const [investments, setInvestments] = useState<PammInvestment[]>([]);
  const [summary, setSummary] = useState({
    totalInvested: 0,
    activePools: 0,
    avgReturnPct: 0,
    pendingWithdrawals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [investPool, setInvestPool] = useState<PammPool | null>(null);
  const [amount, setAmount] = useState(5000);

  useEffect(() => {
    fetchPammInvestorDashboard()
      .then((data) => {
        setPools(data.pools);
        setInvestments(data.investments);
        setSummary(data.summary);
      })
      .catch(() => {
        setPools([]);
        setInvestments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer>
      <div className="w-full min-w-0 space-y-6">
        <InlineBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "PAMM" }, { label: "Investor Area" }]} />
        <HeroCard icon={Layers} title="PAMM Investor Area" subtitle="Browse pools and manage your allocations" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Wallet} label="Total Invested" value={money(summary.totalInvested)} />
          <StatCard icon={Users} label="Active Pools" value={summary.activePools} />
          <StatCard icon={TrendingUp} label="NAV Return" value={pct(summary.avgReturnPct)} />
          <StatCard icon={Clock} label="Pending Withdrawals" value={summary.pendingWithdrawals} />
        </div>

        <h2 className="text-lg font-bold">Browse Pools</h2>
        {loading ? (
          <p className="text-sm text-[var(--app-text-muted)]">Loading pools…</p>
        ) : pools.length === 0 ? (
          <p className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-sm text-[var(--app-text-muted)]">
            No PAMM pools are available yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pools.map((pool) => (
              <article key={pool.id} className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold">{pool.name}</h3>
                    <p className="text-sm text-[var(--app-text-secondary)]">{pool.managerName}</p>
                  </div>
                  <RiskPill level={pool.riskProfile} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-[var(--app-text-muted)]">NAV</p><p className="font-semibold">{money(pool.nav)}</p></div>
                  <div><p className="text-[var(--app-text-muted)]">Monthly</p><p className="font-semibold text-[color:var(--app-primary-solid)]">{pct(pool.monthlyReturnPct)}</p></div>
                  <div><p className="text-[var(--app-text-muted)]">Min Deposit</p><p className="font-semibold">{money(pool.minDeposit)}</p></div>
                  <div><p className="text-[var(--app-text-muted)]">Investors</p><p className="font-semibold">{pool.investorsCount}</p></div>
                </div>
                <button type="button" onClick={() => setInvestPool(pool)} className={`${btnPrimary} mt-4 w-full`}>Invest</button>
              </article>
            ))}
          </div>
        )}

        <DataTable
          title="My Allocations"
          data={investments}
          isLoading={loading}
          statusColumn="status"
          searchableColumns={["poolName"]}
          columns={[
            { key: "poolName", label: "Pool" },
            { key: "amount", label: "Amount", render: (r) => money(r.amount as number) },
            { key: "sharePct", label: "Share %", render: (r) => `${r.sharePct}%` },
            { key: "pnlPct", label: "P&L", render: (r) => pct(r.pnlPct as number) },
            { key: "investedAt", label: "Invested", render: (r) => formatDate(r.investedAt as string) },
            { key: "status", label: "Status", render: (r) => <StatusPill label={String(r.status)} tone={statusToTone(String(r.status))} /> },
          ]}
        />

        <Modal open={!!investPool} onClose={() => setInvestPool(null)} title={`Invest in ${investPool?.name}`}>
          <div className="space-y-4">
            <p className="text-sm text-[var(--app-text-secondary)]">Min deposit: {money(investPool?.minDeposit)}</p>
            <p className="text-sm text-amber-600">Investment requests will be available once pool funding is enabled.</p>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm" disabled />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked disabled /> I agree to PAMM terms</label>
            <button type="button" onClick={() => setInvestPool(null)} className={`${btnPrimary} w-full`}>Close</button>
          </div>
        </Modal>
      </div>
    </PageContainer>
  );
}
