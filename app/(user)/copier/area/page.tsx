"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageContainer from "@/components/layout/user/PageContainer";
import CopierProgressSection from "@/components/copier/area/CopierProgressSection";
import CopierAccountMetricsRow from "@/components/copier/area/CopierAccountMetricsRow";
import CopierSummaryHistoryPanel from "@/components/copier/area/CopierSummaryHistoryPanel";
import { fetchCopierSettings, fetchCopierSubscriptions } from "@/lib/api/copier";
import type { CopierMasterHistoryEntry, CopierAccountMetrics } from "@/lib/mock/copierArea";

export default function CopierAreaPage() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Awaited<ReturnType<typeof fetchCopierSubscriptions>>>([]);

  useEffect(() => {
    Promise.all([fetchCopierSettings(), fetchCopierSubscriptions()])
      .then(([settings, subs]) => {
        setEnabled(settings.enableCopier);
        setSubscriptions(subs);
      })
      .catch(() => {
        setEnabled(true);
        setSubscriptions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const accountMetrics: CopierAccountMetrics = useMemo(() => {
    const totalEquity = subscriptions.reduce((s, sub) => s + sub.accountEquity, 0);
    const totalBalance = subscriptions.reduce((s, sub) => s + sub.accountBalance, 0);
    return {
      name: subscriptions.length ? "My Copier Portfolio" : "Copier Area",
      country: "—",
      countryCode: "US",
      profit: 0,
      floatingProfit: 0,
      equity: totalEquity || totalBalance,
      gainPct: 0,
    };
  }, [subscriptions]);

  const masters: CopierMasterHistoryEntry[] = useMemo(
    () =>
      subscriptions.map((sub) => ({
        id: sub.id,
        masterId: sub.masterId,
        masterName: sub.masterName,
        expertise: "Experienced",
        profit: 0,
        gainPct: 0,
        isActive: sub.status === "active",
      })),
    [subscriptions]
  );

  const [selected, setSelected] = useState<CopierMasterHistoryEntry | null>(null);

  useEffect(() => {
    if (masters.length > 0 && !selected) {
      setSelected(masters[0]);
    }
  }, [masters, selected]);

  if (loading) {
    return (
      <PageContainer>
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-12 text-center text-sm text-[var(--app-text-muted)]">
          Loading copier area…
        </div>
      </PageContainer>
    );
  }

  if (!enabled) {
    return (
      <PageContainer>
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-12 text-center shadow-md">
          <p className="text-lg font-bold text-[var(--app-text-primary)]">Copier is currently disabled</p>
        </div>
      </PageContainer>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <PageContainer>
        <div className="flex min-h-[calc(100dvh-10rem)] flex-col items-center justify-center gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-12 text-center shadow-md">
          <p className="text-lg font-bold text-[var(--app-text-primary)]">You are not copying any masters yet</p>
          <p className="max-w-md text-sm text-[var(--app-text-secondary)]">
            Browse Top Rated masters and start copying with your MT5 account.
          </p>
          <Link
            href="/copier/rating"
            className="rounded-md bg-[color:var(--app-primary-solid)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Browse Top Rated
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex min-h-[calc(100dvh-10rem)] flex-col gap-5 sm:gap-6">
        <CopierAccountMetricsRow account={accountMetrics} />
        {selected ? (
          <>
            <CopierProgressSection masters={masters} selected={selected} onSelect={setSelected} />
            <CopierSummaryHistoryPanel masterId={selected.masterId} />
          </>
        ) : null}
      </div>
    </PageContainer>
  );
}
