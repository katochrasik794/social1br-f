"use client";

import { useState } from "react";
import { Layers, Users, Wallet, TrendingUp } from "lucide-react";
import PageContainer, { HeroCard, InlineBreadcrumb, btnPrimary } from "@/components/layout/user/PageContainer";
import StatCard from "@/components/ui/StatCard";
import DataTable from "@/components/ui/DataTable";
import StatusPill, { statusToTone } from "@/components/ui/StatusPill";
import { mockPammManagerProfile } from "@/lib/mock/pamm";
import { money, pct, formatDate } from "@/lib/utils";

export default function PammManagerPage() {
  const [status, setStatus] = useState(mockPammManagerProfile.status);

  if (status === "none") {
    return (
      <PageContainer>
        <div className="mx-auto max-w-[2400px] space-y-6">
          <InlineBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "PAMM" }, { label: "Manager Area" }]} />
          <HeroCard icon={Layers} title="Become a PAMM Manager" subtitle="Apply to run a managed investment pool" />
          <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-6 space-y-4">
            <input placeholder="Pool Name" className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm" />
            <textarea placeholder="Strategy" rows={4} className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm" />
            <input type="number" placeholder="Min Deposit" className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm" />
            <input type="number" placeholder="Performance Fee %" className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm" />
            <select className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm">
              <option>Low Risk</option><option>Medium Risk</option><option>High Risk</option>
            </select>
            <button type="button" onClick={() => setStatus("pending")} className={btnPrimary}>Submit Application</button>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (status === "pending") {
    return (
      <PageContainer>
        <div className="mx-auto max-w-[2400px] rounded-md border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/30 dark:bg-amber-500/10">
          <h2 className="font-bold text-amber-800 dark:text-amber-300">Application Pending</h2>
          <p className="mt-2 text-sm">Your PAMM manager application is under review.</p>
        </div>
      </PageContainer>
    );
  }

  const profile = mockPammManagerProfile;

  return (
    <PageContainer>
      <div className="mx-auto max-w-[2400px] space-y-6">
        <InlineBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "PAMM" }, { label: "Manager Area" }]} />
        <HeroCard icon={Layers} title={profile.poolName} subtitle={profile.strategy} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Wallet} label="Pool NAV" value={money(profile.nav)} />
          <StatCard icon={Users} label="Investors" value={profile.investorsCount} />
          <StatCard icon={TrendingUp} label="Monthly Return" value={pct(profile.monthlyReturnPct)} />
          <StatCard icon={Layers} label="Performance Fee" value={`${profile.feePct}%`} />
        </div>

        <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
          <h3 className="font-bold">NAV Performance</h3>
          <div className="mt-4 flex h-32 items-end gap-2">
            {[35, 50, 45, 60, 55, 70, 65, 80, 75, 85, 90, 78].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[color:var(--app-primary-solid)] to-transparent" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <DataTable
          title="Pool Investors"
          data={profile.investors}
          columns={[
            { key: "email", label: "Investor" },
            { key: "amount", label: "Amount", render: (r) => money(r.amount as number) },
            { key: "sharePct", label: "Share %", render: (r) => `${r.sharePct}%` },
            { key: "joinedAt", label: "Joined", render: (r) => formatDate(r.joinedAt as string) },
            { key: "status", label: "Status", render: (r) => <StatusPill label={String(r.status)} tone={statusToTone(String(r.status))} /> },
          ]}
        />
      </div>
    </PageContainer>
  );
}
