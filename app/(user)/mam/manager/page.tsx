"use client";

import { useState } from "react";
import { Network, Users, Wallet, TrendingUp } from "lucide-react";
import PageContainer, { HeroCard, InlineBreadcrumb, btnPrimary } from "@/components/layout/user/PageContainer";
import StatCard from "@/components/ui/StatCard";
import DataTable from "@/components/ui/DataTable";
import StatusPill, { statusToTone } from "@/components/ui/StatusPill";
import { mockMamManagerProfile } from "@/lib/mock/mam";
import { money, pct } from "@/lib/utils";

export default function MamManagerPage() {
  const [status, setStatus] = useState(mockMamManagerProfile.status);

  if (status === "none") {
    return (
      <PageContainer>
        <div className="w-full min-w-0 space-y-6">
          <InlineBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "MAM" }, { label: "Manager Area" }]} />
          <HeroCard icon={Network} title="Become a MAM Manager" subtitle="Apply to manage investor accounts" />
          <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-6 space-y-4">
            <input placeholder="Display Name" className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm" />
            <textarea placeholder="Strategy description" rows={4} className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm" />
            <input type="number" placeholder="Performance Fee %" className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm" />
            <button type="button" onClick={() => setStatus("pending")} className={btnPrimary}>Submit Application</button>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (status === "pending") {
    return (
      <PageContainer>
        <div className="w-full min-w-0 rounded-md border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/30 dark:bg-amber-500/10">
          <h2 className="font-bold text-amber-800 dark:text-amber-300">Application Pending</h2>
          <p className="mt-2 text-sm">Your MAM manager application is under review.</p>
        </div>
      </PageContainer>
    );
  }

  const profile = mockMamManagerProfile;

  return (
    <PageContainer>
      <div className="w-full min-w-0 space-y-6">
        <InlineBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "MAM" }, { label: "Manager Area" }]} />
        <HeroCard icon={Network} title={profile.displayName} subtitle={profile.strategy} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Linked Accounts" value={profile.linkedAccounts.length} />
          <StatCard icon={Wallet} label="Total AUM" value={money(profile.totalAum)} />
          <StatCard icon={TrendingUp} label="Performance Fee" value={`${profile.feePct}%`} />
          <StatCard icon={Network} label="Followers" value={profile.followersCount} />
        </div>

        <DataTable
          title="Linked Investor Accounts"
          data={profile.linkedAccounts}
          statusColumn="status"
          columns={[
            { key: "investorEmail", label: "Investor" },
            { key: "accountLogin", label: "Account" },
            { key: "lotMultiplier", label: "Lot Multiplier" },
            { key: "balance", label: "Balance", render: (r) => money(r.balance as number) },
            { key: "pnlPct", label: "P&L", render: (r) => pct(r.pnlPct as number) },
            { key: "status", label: "Status", render: (r) => <StatusPill label={String(r.status)} tone={statusToTone(String(r.status))} /> },
          ]}
        />
      </div>
    </PageContainer>
  );
}
