"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import PageContainer, { HeroCard, InlineBreadcrumb, btnPrimary } from "@/components/layout/user/PageContainer";
import MasterAccountHeaderCard from "@/components/copier/master/MasterAccountHeaderCard";
import MasterAttachedAccountsCard from "@/components/copier/master/MasterAttachedAccountsCard";
import MasterStatsSettingsPanel from "@/components/copier/master/MasterStatsSettingsPanel";
import { mockMasterProfile } from "@/lib/mock/copier";
import { mockMasterAccountHeader, mockMasterAttachedAccounts } from "@/lib/mock/masterArea";

export default function MasterAreaPage() {
  const [profileStatus, setProfileStatus] = useState(mockMasterProfile.status);
  const [selectedAccountId, setSelectedAccountId] = useState(mockMasterAttachedAccounts[0]?.id ?? 0);

  const selectedAccount =
    mockMasterAttachedAccounts.find((a) => a.id === selectedAccountId) ?? mockMasterAttachedAccounts[0];

  if (profileStatus === "none") {
    return (
      <PageContainer>
        <div className="space-y-6">
          <InlineBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Copier" }, { label: "Become Master" }]} />
          <HeroCard icon={Crown} title="Become a Master Trader" subtitle="Apply to offer your strategy for copy trading" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
              <h2 className="text-base font-bold">Application Form</h2>
              <div className="mt-4 space-y-4">
                <input placeholder="Display Name" className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm" />
                <input placeholder="Headline" className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm" />
                <textarea placeholder="Strategy description" rows={4} className="w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm" />
                <div className="grid gap-3 sm:grid-cols-3">
                  {["Low", "Medium", "High"].map((r) => (
                    <button key={r} type="button" className="rounded-md border border-[var(--app-border)] p-3 text-sm font-medium hover:border-[color:var(--app-primary-solid)]">
                      {r} Risk
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setProfileStatus("pending")} className={btnPrimary}>
                  Submit Application
                </button>
              </div>
            </div>
            <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
              <h3 className="font-bold">Requirements</h3>
              <ul className="mt-3 space-y-2 text-sm text-[var(--app-text-secondary)]">
                <li>• Verified KYC status</li>
                <li>• Minimum 3 months track record</li>
                <li>• Linked MT5 master account</li>
                <li>• Accept platform terms</li>
              </ul>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (profileStatus === "pending") {
    return (
      <PageContainer>
        <div className="space-y-6">
          <InlineBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Copier" }, { label: "Master Area" }]} />
          <div className="rounded-md border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/30 dark:bg-amber-500/10">
            <h2 className="font-bold text-amber-800 dark:text-amber-300">Application Pending Review</h2>
            <p className="mt-2 text-sm text-amber-700 dark:text-amber-200">Your master application is being reviewed by our team.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (profileStatus === "rejected") {
    return (
      <PageContainer>
        <div className="rounded-md border border-rose-200 bg-rose-50 p-6 dark:border-rose-500/30 dark:bg-rose-500/10">
          <h2 className="font-bold text-rose-800 dark:text-rose-300">Application Rejected</h2>
          <p className="mt-2 text-sm">Insufficient track record. You may re-apply after 30 days.</p>
          <button type="button" onClick={() => setProfileStatus("none")} className={`${btnPrimary} mt-4`}>
            Re-apply
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-5 sm:space-y-6">
        <InlineBreadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Copier", href: "/copier/rating" },
            { label: "Master Area" },
          ]}
        />

        <MasterAccountHeaderCard account={mockMasterAccountHeader} />
        <MasterAttachedAccountsCard
          accounts={mockMasterAttachedAccounts}
          selectedId={selectedAccountId}
          onSelect={setSelectedAccountId}
        />
        {selectedAccount ? <MasterStatsSettingsPanel account={selectedAccount} /> : null}
      </div>
    </PageContainer>
  );
}
