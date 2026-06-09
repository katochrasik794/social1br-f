"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageContainer, { btnPrimary, InlineBreadcrumb } from "@/components/layout/user/PageContainer";
import MasterProfileCard from "@/components/copier/MasterProfileCard";
import MasterPerformanceSection from "@/components/copier/MasterPerformanceSection";
import MasterAnalyticsCharts from "@/components/copier/MasterAnalyticsCharts";
import MasterAccountCards from "@/components/copier/MasterAccountCards";
import MasterHistoryPanel from "@/components/copier/MasterHistoryPanel";
import Modal from "@/components/ui/Modal";
import { mockTopRatedMasters, mockTradingAccounts } from "@/lib/mock/copier";
import { getMasterAccountDetails } from "@/lib/mock/masterDetail";
import { money } from "@/lib/utils";

export default function MasterDetailPage() {
  const params = useParams();
  const masterId = Number(params.id);
  const master = mockTopRatedMasters.find((m) => m.id === masterId);

  const [copyOpen, setCopyOpen] = useState(false);
  const [copyForm, setCopyForm] = useState({
    accountId: mockTradingAccounts[0].id,
    allocation: 5000,
    copyMode: "proportional",
    lotMultiplier: 1,
    dailyLossLimit: 5,
  });

  const accountDetails = useMemo(
    () => (master ? getMasterAccountDetails(masterId, master) : null),
    [masterId, master]
  );

  if (!master || !accountDetails) {
    return (
      <PageContainer>
        <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center">
          <p className="font-semibold text-[var(--app-text-primary)]">Master not found</p>
          <Link href="/copier/rating" className="mt-4 inline-block text-sm text-[color:var(--app-primary-solid)] hover:underline">
            Back to Top Rated
          </Link>
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
            { label: "Top Rated", href: "/copier/rating" },
            { label: master.displayName },
          ]}
        />

        <MasterProfileCard master={master} details={accountDetails} onCopyClick={() => setCopyOpen(true)} />

        <MasterPerformanceSection master={master} />

        <MasterAccountCards details={accountDetails} />

        <MasterAnalyticsCharts masterId={masterId} />

        <MasterHistoryPanel masterId={masterId} />

        <Modal open={copyOpen} onClose={() => setCopyOpen(false)} title={`Copy ${master.displayName}`} subtitle="Configure your copy settings">
          <div className="space-y-4">
            <div className="rounded-md border border-[color-mix(in_oklab,var(--app-primary-solid)_25%,transparent)] bg-[color-mix(in_oklab,var(--app-primary-solid)_8%,var(--app-mix-base))] p-3 text-sm">
              Commission: <strong className="text-[color:var(--app-primary-solid)]">{master.commissionPct}%</strong> of profits
            </div>
            <div>
              <label className="text-sm font-medium">Trading Account</label>
              <select
                value={copyForm.accountId}
                onChange={(e) => setCopyForm({ ...copyForm, accountId: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm"
              >
                {mockTradingAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.login} — {money(a.balance)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Allocation ($)</label>
              <input
                type="number"
                value={copyForm.allocation}
                onChange={(e) => setCopyForm({ ...copyForm, allocation: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Copy Mode</label>
              <select
                value={copyForm.copyMode}
                onChange={(e) => setCopyForm({ ...copyForm, copyMode: e.target.value })}
                className="mt-1 w-full rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm"
              >
                <option value="proportional">Proportional</option>
                <option value="fixed">Fixed Lot</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-[color:var(--app-primary-solid)]" defaultChecked />
              I agree to the copy trading terms
            </label>
            <button type="button" onClick={() => setCopyOpen(false)} className={`${btnPrimary} w-full`}>
              Start Copying
            </button>
          </div>
        </Modal>
      </div>
    </PageContainer>
  );
}
