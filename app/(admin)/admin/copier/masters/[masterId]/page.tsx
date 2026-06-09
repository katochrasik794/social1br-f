"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import CopierSummaryRings from "@/components/copier/area/CopierSummaryRings";
import MasterAccountCards from "@/components/copier/MasterAccountCards";
import MasterAnalyticsCharts from "@/components/copier/MasterAnalyticsCharts";
import MasterHistoryPanel from "@/components/copier/MasterHistoryPanel";
import MasterPerformanceSection from "@/components/copier/MasterPerformanceSection";
import MasterProfileCard from "@/components/copier/MasterProfileCard";
import ProTable from "@/components/ui/ProTable";
import StatusPill, { statusToTone } from "@/components/ui/StatusPill";
import {
  fetchAdminMasterAccountHistory,
  fetchAdminMasterProfile,
  type AdminMasterProfileResponse,
} from "@/lib/api/copier.admin";
import type { MasterHistoryTradeRow } from "@/lib/api/copier";
import { computeSummaryFromTrades } from "@/lib/copier/summaryFromTrades";
import { tradesToProfitLoss } from "@/lib/copier/tradeHistoryTransforms";
import { formatDate, money } from "@/lib/utils";

export default function AdminMasterProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const masterId = String(params.masterId);
  const accountId = searchParams.get("account") ?? undefined;

  const [profile, setProfile] = useState<AdminMasterProfileResponse | null>(null);
  const [closedTrades, setClosedTrades] = useState<MasterHistoryTradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchAdminMasterProfile(masterId, accountId)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [masterId, accountId]);

  const tradingAccountId = profile?.selectedAccountId;

  useEffect(() => {
    if (!tradingAccountId) {
      setClosedTrades([]);
      setHistoryLoading(false);
      return;
    }
    setHistoryLoading(true);
    setHistoryError("");
    fetchAdminMasterAccountHistory(tradingAccountId)
      .then((res) => setClosedTrades(res.closedTrades))
      .catch((err) => {
        setClosedTrades([]);
        setHistoryError(err instanceof Error ? err.message : "Failed to load trade history");
      })
      .finally(() => setHistoryLoading(false));
  }, [tradingAccountId]);

  const summary = useMemo(() => {
    if (!profile) return null;
    return computeSummaryFromTrades(closedTrades, {
      balance: profile.accountSummary.balance,
      equity: profile.accountSummary.equity,
    });
  }, [closedTrades, profile]);

  const masterWithPnl = useMemo(() => {
    if (!profile) return null;
    const { profit, loss } = tradesToProfitLoss(closedTrades);
    return {
      ...profile.master,
      profit,
      loss,
      tradeCount: closedTrades.length,
    };
  }, [profile, closedTrades]);

  const accountDetails = useMemo(() => {
    if (!profile) return null;
    return {
      ...profile.accountSummary,
      withUsDays: profile.withUsDays,
    };
  }, [profile]);

  function switchAccount(nextAccountId: string) {
    const qs = new URLSearchParams(searchParams.toString());
    qs.set("account", nextAccountId);
    router.push(`/admin/copier/masters/${masterId}?${qs.toString()}`);
  }

  if (loading) {
    return (
      <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center text-sm text-[var(--app-text-muted)]">
        Loading master profile…
      </div>
    );
  }

  if (!profile || !masterWithPnl || !accountDetails) {
    return (
      <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center">
        <p className="font-semibold text-[var(--app-text-primary)]">Master not found</p>
        <Link href="/admin/copier/masters" className="mt-4 inline-block text-sm text-[color:var(--app-primary-solid)] hover:underline">
          Back to Master Traders
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/copier/masters" className="text-sm text-[color:var(--app-primary-solid)] hover:underline">
            ← Master Traders
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{profile.master.displayName}</h1>
          <p className="text-sm text-[var(--app-text-secondary)]">Admin master profile · {profile.email}</p>
        </div>
        {profile.accounts.length > 1 ? (
          <select
            value={profile.selectedAccountId}
            onChange={(e) => switchAccount(e.target.value)}
            className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm"
          >
            {profile.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.displayName || a.login} · {a.platform} {a.login}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <MasterProfileCard
        master={masterWithPnl}
        details={accountDetails}
        readOnly
        email={profile.email}
        accountLogin={profile.master.accountLogin}
      />

      <MasterPerformanceSection
        master={masterWithPnl}
        closedTrades={historyLoading || historyError ? undefined : closedTrades}
        balance={profile.accountSummary.balance}
      />

      <MasterAccountCards details={accountDetails} />

      {summary ? (
        <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5 sm:p-6">
          <h2 className="text-xl font-bold text-[var(--app-text-primary)]">Summary</h2>
          {historyLoading ? (
            <p className="mt-4 text-sm text-[var(--app-text-muted)]">Loading summary…</p>
          ) : historyError ? (
            <p className="mt-4 text-sm text-rose-600">{historyError}</p>
          ) : (
            <div className="mt-4">
              <CopierSummaryRings stats={summary.summaryStats} />
            </div>
          )}
        </div>
      ) : null}

      <MasterAnalyticsCharts
        closedTrades={historyLoading || historyError ? undefined : closedTrades}
        loading={historyLoading}
        error={historyError}
      />

      <MasterHistoryPanel
        closedTrades={closedTrades}
        loading={historyLoading}
        error={historyError}
      />

      <ProTable
        title="Copiers"
        rows={profile.followers}
        filters={{ searchKeys: ["email", "accountLogin"] }}
        columns={[
          { key: "email", label: "Copier" },
          { key: "accountLogin", label: "Account" },
          { key: "allocation", label: "Allocation", render: (r) => money(r.allocation as number) },
          {
            key: "status",
            label: "Status",
            render: (r) => <StatusPill label={String(r.status)} tone={statusToTone(String(r.status))} />,
          },
          { key: "startedAt", label: "Started", render: (r) => formatDate(r.startedAt as string) },
        ]}
      />
    </div>
  );
}
