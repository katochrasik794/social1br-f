"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import PageContainer, { btnPrimary, InlineBreadcrumb } from "@/components/layout/user/PageContainer";
import MasterProfileCard from "@/components/copier/MasterProfileCard";
import MasterPerformanceSection from "@/components/copier/MasterPerformanceSection";
import MasterAnalyticsCharts from "@/components/copier/MasterAnalyticsCharts";
import MasterAccountCards from "@/components/copier/MasterAccountCards";
import MasterHistoryPanel from "@/components/copier/MasterHistoryPanel";
import Modal from "@/components/ui/Modal";
import {
  createCopierSubscription,
  fetchMasterDetail,
  fetchPublicMasterAccountHistory,
  type MasterHistoryTradeRow,
  type TopRatedMaster,
} from "@/lib/api/copier";
import { fetchTradingAccounts, type TradingAccount } from "@/lib/api/trading";
import {
  filterCopyEligibleAccounts,
  fullAccountAllocation,
  isOwnMasterProfile,
} from "@/lib/copier/copySetup";
import { tradesToProfitLoss } from "@/lib/copier/tradeHistoryTransforms";
import type { MasterAccountDetails } from "@/lib/mock/masterDetail";
import { useMasterProfile } from "@/providers/MasterProfileProvider";
import { money } from "@/lib/utils";

function MasterDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const masterId = String(params.id);
  const accountId = searchParams.get("account") ?? undefined;
  const { data: masterMe } = useMasterProfile();

  const [master, setMaster] = useState<TopRatedMaster | null>(null);
  const [accountDetails, setAccountDetails] = useState<MasterAccountDetails | null>(null);
  const [closedTrades, setClosedTrades] = useState<MasterHistoryTradeRow[]>([]);
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [copyOpen, setCopyOpen] = useState(false);
  const [copySubmitting, setCopySubmitting] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [copyForm, setCopyForm] = useState({
    accountId: "",
    allocation: 5000,
    copyMode: "proportional" as "proportional" | "fixed",
    lotMultiplier: 1,
    dailyLossLimit: 5,
  });

  useEffect(() => {
    Promise.all([fetchMasterDetail(masterId, accountId), fetchTradingAccounts()])
      .then(([detail, accounts]) => {
        const selected =
          detail.accountDetails.accounts.find((a) => a.id === detail.master.tradingAccountId) ??
          detail.accountDetails.accounts[0];
        setMaster(detail.master);
        setAccountDetails({
          equity: selected?.equity ?? 0,
          withUsDays: 0,
          floatingProfit: selected?.floatingProfit ?? 0,
          balance: selected?.balance ?? 0,
          bonus: 0,
          leverage: "1:500",
          maxUnrealisedLoss: 0,
          maxDrawdownDuration: "—",
          strategySegments: detail.master.strategy.split(/\s+/).filter(Boolean).slice(0, 6),
        });
        setTradingAccounts(accounts);
      })
      .catch(() => {
        setMaster(null);
        setAccountDetails(null);
      })
      .finally(() => setLoading(false));
  }, [masterId, accountId]);

  const tradingAccountId = master?.tradingAccountId;

  useEffect(() => {
    if (!tradingAccountId) {
      setClosedTrades([]);
      setHistoryLoading(false);
      return;
    }
    setHistoryLoading(true);
    setHistoryError("");
    fetchPublicMasterAccountHistory(masterId, tradingAccountId)
      .then((res) => setClosedTrades(res.closedTrades))
      .catch((err) => {
        setClosedTrades([]);
        setHistoryError(err instanceof Error ? err.message : "Failed to load trade history");
      })
      .finally(() => setHistoryLoading(false));
  }, [masterId, tradingAccountId]);

  const masterWithPnl = useMemo(() => {
    if (!master) return null;
    const { profit, loss } = tradesToProfitLoss(closedTrades);
    return {
      ...master,
      profit,
      loss,
      tradeCount: closedTrades.length,
    };
  }, [master, closedTrades]);

  const detailsForCards = useMemo(() => {
    if (!accountDetails) return null;
    return {
      ...accountDetails,
      accounts: [],
    };
  }, [accountDetails]);

  const realTradesReady = !historyLoading && !historyError ? closedTrades : undefined;

  const ownMaster = isOwnMasterProfile(masterMe, masterId);

  const eligibleAccounts = useMemo(
    () => filterCopyEligibleAccounts(tradingAccounts, masterMe),
    [tradingAccounts, masterMe]
  );

  useEffect(() => {
    if (!eligibleAccounts.length) {
      setCopyForm((f) => ({ ...f, accountId: "", allocation: 0 }));
      return;
    }
    setCopyForm((f) => {
      const keep = eligibleAccounts.find((a) => a.id === f.accountId);
      const pick = keep ?? eligibleAccounts[0];
      return { ...f, accountId: pick.id, allocation: fullAccountAllocation(pick) };
    });
  }, [eligibleAccounts]);

  function handleCopyAccountChange(accountId: string) {
    const acc = eligibleAccounts.find((a) => a.id === accountId);
    setCopyForm((f) => ({
      ...f,
      accountId,
      allocation: fullAccountAllocation(acc),
    }));
  }

  async function handleStartCopying() {
    if (!master || !copyForm.accountId) return;
    if (!termsAccepted) {
      setCopyError("Please accept the copy trading terms.");
      return;
    }
    setCopySubmitting(true);
    setCopyError("");
    try {
      await createCopierSubscription({
        masterId: master.id,
        tradingAccountId: copyForm.accountId,
        allocation: copyForm.allocation,
        copyMode: copyForm.copyMode,
        lotMultiplier: copyForm.lotMultiplier,
        dailyLossLimitPct: copyForm.dailyLossLimit,
        termsAccepted: true,
      });
      setCopyOpen(false);
      router.push("/copier/area");
    } catch (err) {
      setCopyError(err instanceof Error ? err.message : "Failed to start copying");
    } finally {
      setCopySubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center text-sm text-[var(--app-text-muted)]">
          Loading master…
        </div>
      </PageContainer>
    );
  }

  if (!masterWithPnl || !accountDetails) {
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
            { label: masterWithPnl.displayName },
          ]}
        />

        <MasterProfileCard
          master={masterWithPnl}
          details={accountDetails}
          onCopyClick={ownMaster ? undefined : () => setCopyOpen(true)}
          copyDisabledMessage={
            ownMaster ? "You cannot copy your own master account." : undefined
          }
        />

        <MasterPerformanceSection
          master={masterWithPnl}
          closedTrades={realTradesReady}
          balance={accountDetails.balance}
        />

        {detailsForCards ? <MasterAccountCards details={detailsForCards} /> : null}

        <MasterAnalyticsCharts
          closedTrades={realTradesReady}
          loading={historyLoading}
          error={historyError}
        />

        <MasterHistoryPanel
          closedTrades={closedTrades}
          loading={historyLoading}
          error={historyError}
        />

        <Modal open={copyOpen} onClose={() => setCopyOpen(false)} title={`Copy ${masterWithPnl.displayName}`} subtitle="Configure your copy settings">
          <div className="space-y-4">
            <div className="rounded-md border border-[color-mix(in_oklab,var(--app-primary-solid)_25%,transparent)] bg-[color-mix(in_oklab,var(--app-primary-solid)_8%,var(--app-mix-base))] p-3 text-sm">
              Commission from copiers: <strong className="text-[color:var(--app-primary-solid)]">{masterWithPnl.commissionPct}%</strong> of your copied-trade profit goes to the master
            </div>
            <div>
              <label className="text-sm font-medium">Trading Account</label>
              <select
                value={copyForm.accountId}
                onChange={(e) => handleCopyAccountChange(e.target.value)}
                className="mt-1 w-full rounded-md border border-[var(--app-border)] px-3 py-2 text-sm"
              >
                {eligibleAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.accountNumber} — {money(a.balance)}
                  </option>
                ))}
              </select>
              {eligibleAccounts.length === 0 ? (
                <p className="mt-2 text-xs text-amber-600">
                  Master trading accounts cannot be used for copying. Use a separate MT5 account.
                </p>
              ) : null}
            </div>
            <div>
              <label className="text-sm font-medium">Allocation ($)</label>
              <input
                type="number"
                readOnly
                disabled
                value={copyForm.allocation}
                className="mt-1 w-full cursor-not-allowed rounded-md border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm opacity-90"
              />
            </div>
            <p className="text-xs text-[var(--app-text-muted)]">
              Full account balance is allocated for copy trading.
            </p>
            {copyError ? <p className="text-sm text-red-500">{copyError}</p> : null}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
              I agree to the copy trading terms
            </label>
            <button
              type="button"
              disabled={copySubmitting || eligibleAccounts.length === 0 || ownMaster}
              onClick={handleStartCopying}
              className={`${btnPrimary} w-full`}
            >
              {copySubmitting ? "Starting…" : "Start Copying"}
            </button>
          </div>
        </Modal>
      </div>
    </PageContainer>
  );
}

export default function MasterDetailPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center text-sm text-[var(--app-text-muted)]">
            Loading master…
          </div>
        </PageContainer>
      }
    >
      <MasterDetailPageContent />
    </Suspense>
  );
}
