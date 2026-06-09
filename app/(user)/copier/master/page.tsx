"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ChevronRight, Crown, Plus } from "lucide-react";
import PageContainer, { HeroCard, InlineBreadcrumb, btnPrimary, btnSecondary } from "@/components/layout/user/PageContainer";
import MasterAccountHeaderCard from "@/components/copier/master/MasterAccountHeaderCard";
import MasterAttachedAccountsCard from "@/components/copier/master/MasterAttachedAccountsCard";
import MasterStatsSettingsPanel from "@/components/copier/master/MasterStatsSettingsPanel";
import MasterApplicationForm, {
  emptyMasterForm,
  masterFormFromProfile,
  type MasterFormValues,
} from "@/components/copier/master/MasterApplicationForm";
import Modal from "@/components/ui/Modal";
import { useMasterProfile } from "@/providers/MasterProfileProvider";
import {
  applyForMaster,
  submitMasterChangeRequest,
  COMMISSION_FROM_COPIERS_LABEL,
  fetchMasterApplyAccountOptions,
  type LinkedMasterAccount,
  type MasterApplyAccountOption,
} from "@/lib/api/copier";
import { money } from "@/lib/utils";
import type { MasterAccountHeader, MasterAttachedAccount } from "@/lib/mock/masterArea";

function riskScoreFromProfile(profile: "low" | "medium" | "high") {
  if (profile === "low") return 2;
  if (profile === "high") return 8;
  return 5;
}

function mapAttachedAccounts(
  accounts: LinkedMasterAccount[]
): MasterAttachedAccount[] {
  return accounts.map((a) => ({
    id: a.id,
    login: String(a.accountNumber),
    platform: (a.platform === "MT4" ? "MT4" : "MT5") as "MT4" | "MT5",
    status: a.accountStatus === "active" ? "Active" : "Archived",
    profit: 0,
    floatingProfit: 0,
    gainPct: 0,
    commissionPerLot: a.commissionPct,
    riskScore: riskScoreFromProfile(a.riskProfile),
    balance: a.balance,
    equity: a.equity,
    displayName: a.displayName,
    headline: a.headline,
    strategy: a.strategySummary,
    strategyDetail: a.strategyDetail,
    commissionPct: a.commissionPct,
    minCopyAmount: a.minCopyAmount,
    riskLevel: a.riskProfile.charAt(0).toUpperCase() + a.riskProfile.slice(1),
    riskProfile: a.riskProfile,
    publicProfile: a.publicProfile,
    acceptNewCopiers: a.acceptNewCopiers,
  }));
}

export default function MasterAreaPage() {
  const { data, loading, refetch, applyMasterMe } = useMasterProfile();
  const searchParams = useSearchParams();
  const [applyModalOpen, setApplyModalOpen] = useState(searchParams.get("step") === "apply");
  const [switchModalOpen, setSwitchModalOpen] = useState(false);
  const [applyAccounts, setApplyAccounts] = useState<MasterApplyAccountOption[]>([]);
  const [switchAccounts, setSwitchAccounts] = useState<MasterApplyAccountOption[]>([]);
  const [applyForm, setApplyForm] = useState<MasterFormValues>(emptyMasterForm());
  const [switchForm, setSwitchForm] = useState<MasterFormValues>(emptyMasterForm());
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [switchSubmitting, setSwitchSubmitting] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [switchError, setSwitchError] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");

  async function loadApplyAccounts() {
    const list = await fetchMasterApplyAccountOptions(false);
    setApplyAccounts(list);
    const first = list.find((a) => !a.isRegisteredAsMaster && a.accountStatus === "active");
    setApplyForm((f) => ({
      ...f,
      tradingAccountId: first?.id ?? null,
    }));
    return list;
  }

  async function openApplyModal() {
    setApplyError("");
    setApplyForm((f) => ({
      ...(data?.profile ? masterFormFromProfile(data.profile) : emptyMasterForm()),
      termsAccepted: f.termsAccepted,
      tradingAccountId: f.tradingAccountId,
    }));
    setApplyModalOpen(true);
    try {
      await loadApplyAccounts();
    } catch {
      setApplyAccounts([]);
    }
  }

  async function openSwitchModal() {
    if (!data?.profile) return;
    setSwitchError("");
    setSwitchModalOpen(true);
    try {
      const list = await fetchMasterApplyAccountOptions(true);
      setSwitchAccounts(list);
      const first = list.find(
        (a) =>
          !a.isRegisteredAsMaster &&
          !a.isCurrentMasterAccount &&
          !a.isPendingChangeAccount &&
          a.accountStatus === "active"
      );
      setSwitchForm({ ...emptyMasterForm(), tradingAccountId: first?.id ?? null });
    } catch {
      setSwitchAccounts([]);
      setSwitchForm(emptyMasterForm());
    }
  }

  useEffect(() => {
    if (applyModalOpen) {
      loadApplyAccounts().catch(() => setApplyAccounts([]));
    }
  }, [applyModalOpen]);

  useEffect(() => {
    if (data?.profile && (data.status === "rejected" || searchParams.get("step") === "apply")) {
      setApplyForm(masterFormFromProfile(data.profile));
      setApplyModalOpen(true);
    }
  }, [data?.profile, data?.status, searchParams]);

  const attachedAccounts = useMemo(() => {
    if (!data?.linkedAccounts || !data.profile) return [];
    return mapAttachedAccounts(data.linkedAccounts);
  }, [data?.linkedAccounts]);

  useEffect(() => {
    if (!data?.linkedAccounts?.length) return;
    setSelectedAccountId((prev) =>
      prev && data.linkedAccounts!.some((a) => a.id === prev) ? prev : data.linkedAccounts![0].id
    );
  }, [data?.linkedAccounts]);

  const selectedLinked = useMemo(() => {
    if (!data?.linkedAccounts?.length) return null;
    return data.linkedAccounts.find((a) => a.id === selectedAccountId) ?? data.linkedAccounts[0];
  }, [data?.linkedAccounts, selectedAccountId]);

  const headerAccount: MasterAccountHeader | null = useMemo(() => {
    if (!data?.profile || !selectedLinked) return null;
    return {
      title: selectedLinked.displayName || data.profile.displayName,
      country: "—",
      countryCode: "US",
      profit: 0,
      floatingProfit: 0,
      equity: selectedLinked.equity,
      gainPct: 0,
      profitChangePct: 0,
    };
  }, [data?.profile, selectedLinked]);

  const selectedAccount = attachedAccounts.find((a) => a.id === selectedAccountId) ?? attachedAccounts[0];

  async function handleApplySubmit(e: React.FormEvent) {
    e.preventDefault();
    setApplyError("");
    if (!applyForm.termsAccepted) {
      setApplyError("Please accept the master trader terms.");
      return;
    }
    if (!applyForm.tradingAccountId) {
      setApplyError("Select exactly one MT5 account to make a master.");
      return;
    }
    setApplySubmitting(true);
    try {
      await applyForMaster({
        displayName: applyForm.displayName.trim(),
        headline: applyForm.headline.trim(),
        strategySummary: applyForm.strategySummary.trim(),
        strategyDetail: applyForm.strategyDetail.trim() || undefined,
        riskProfile: applyForm.riskProfile,
        commissionPct: applyForm.commissionPct,
        minCopyAmount: applyForm.minCopyAmount,
        tradingAccountIds: [applyForm.tradingAccountId],
        termsAccepted: true,
      });
      setApplyModalOpen(false);
      await refetch();
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setApplySubmitting(false);
    }
  }

  async function handleSwitchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSwitchError("");
    if (!switchForm.termsAccepted) {
      setSwitchError("Please accept the master trader terms.");
      return;
    }
    if (!switchForm.tradingAccountId) {
      setSwitchError("Select a different MT5 account.");
      return;
    }
    setSwitchSubmitting(true);
    try {
      await submitMasterChangeRequest({
        tradingAccountId: switchForm.tradingAccountId,
        displayName: switchForm.displayName.trim(),
        headline: switchForm.headline.trim(),
        strategySummary: switchForm.strategySummary.trim(),
        strategyDetail: switchForm.strategyDetail.trim() || undefined,
        riskProfile: switchForm.riskProfile,
        commissionPct: switchForm.commissionPct,
        minCopyAmount: switchForm.minCopyAmount,
        termsAccepted: true,
      });
      setSwitchModalOpen(false);
      await refetch();
    } catch (err) {
      setSwitchError(err instanceof Error ? err.message : "Failed to submit account change");
    } finally {
      setSwitchSubmitting(false);
    }
  }

  const applyModal = (
    <Modal
      open={applyModalOpen}
      onClose={() => setApplyModalOpen(false)}
      title="Master application"
      subtitle="Tell us about your strategy and select one MT5 account to make a master"
      wide
    >
      <MasterApplicationForm
        accounts={applyAccounts}
        values={applyForm}
        onChange={setApplyForm}
        onSubmit={handleApplySubmit}
        submitting={applySubmitting}
        error={applyError}
        submitLabel="Submit application"
        onCancel={() => setApplyModalOpen(false)}
      />
    </Modal>
  );

  const switchModal = (
    <Modal
      open={switchModalOpen}
      onClose={() => setSwitchModalOpen(false)}
      title="Apply for another account"
      subtitle="Apply to add another MT5 account to your master profile"
      wide
    >
      <MasterApplicationForm
        accounts={switchAccounts}
        values={switchForm}
        onChange={setSwitchForm}
        onSubmit={handleSwitchSubmit}
        submitting={switchSubmitting}
        error={switchError}
        submitLabel="Submit for approval"
        onCancel={() => setSwitchModalOpen(false)}
        switchMode
      />
    </Modal>
  );

  if (loading) {
    return (
      <PageContainer>
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-12 text-center text-sm font-medium text-[var(--app-text-muted)]">
          Loading master profile…
        </div>
      </PageContainer>
    );
  }

  const status = data?.status ?? "none";

  if (status === "pending") {
    return (
      <PageContainer>
        <div className="space-y-6">
          <InlineBreadcrumb items={[{ label: "Overview", href: "/dashboard" }, { label: "Copy Trading", href: "/copier/rating" }, { label: "Master Area" }]} />
          <HeroCard icon={Crown} title="Master Area" subtitle="Apply to become a master trader and manage your followers" />
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/30 dark:bg-amber-500/10">
            <h2 className="font-bold text-amber-800 dark:text-amber-300">Application pending review</h2>
            <p className="mt-2 text-sm text-amber-700 dark:text-amber-200">
              Your master application is being reviewed by our team. You will be notified once a decision is made.
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (status === "approved" && data?.profile && headerAccount) {
    return (
      <PageContainer>
        <div className="space-y-5 sm:space-y-6">
          <InlineBreadcrumb
            items={[
              { label: "Overview", href: "/dashboard" },
              { label: "Copy Trading", href: "/copier/rating" },
              { label: "Master Area" },
            ]}
          />
          <HeroCard
            icon={Crown}
            title="Master Area"
            subtitle="Manage multiple MT5 master accounts — copiers copy your trades and you earn commission from their profit"
            action={
              <button
                type="button"
                onClick={openSwitchModal}
                disabled={!!data.pendingChangeRequest}
                className={`${btnSecondary} shrink-0 gap-2 disabled:opacity-50`}
              >
                <Plus className="h-4 w-4" />
                Apply for another account
              </button>
            }
          />
          {data.pendingChangeRequest ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
              <h2 className="font-bold text-amber-800 dark:text-amber-300">Additional account pending approval</h2>
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-200">
                Your existing master accounts stay active. Once admin approves,{" "}
                <strong>{data.pendingChangeRequest.accountNumber}</strong> will appear in your account dropdown.
              </p>
            </div>
          ) : null}
          {switchModal}
          {data.commissions ? (
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                {COMMISSION_FROM_COPIERS_LABEL}
              </p>
              <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                {selectedLinked?.displayName ? (
                  <span className="font-semibold text-[var(--app-text-primary)]">{selectedLinked.displayName}</span>
                ) : null}
                {selectedLinked?.displayName ? " — " : ""}
                You earn {selectedLinked?.commissionPct ?? data.profile?.commissionPct}% of profit made by copiers
                copying your trades. Example: copier profit {money(100)} → you receive{" "}
                {money((100 * (selectedLinked?.commissionPct ?? data.profile?.commissionPct ?? 0)) / 100)} on payout.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-[var(--app-text-muted)]">Pending payout</p>
                  <p className="text-lg font-bold text-[color:var(--app-primary-solid)]">
                    {money(data.commissions.summary.pendingPayout)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--app-text-muted)]">Total earned</p>
                  <p className="text-lg font-bold">{money(data.commissions.summary.totalAccrued)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--app-text-muted)]">Active copiers</p>
                  <p className="text-lg font-bold">{data.followers?.filter((f) => f.status === "active").length ?? 0}</p>
                </div>
              </div>
            </div>
          ) : null}
          <MasterAccountHeaderCard account={headerAccount} />
          {attachedAccounts.length > 0 ? (
            <>
              <MasterAttachedAccountsCard
                accounts={attachedAccounts}
                selectedId={selectedAccountId}
                onSelect={setSelectedAccountId}
              />
              {selectedAccount ? (
                <MasterStatsSettingsPanel
                  key={`${selectedAccount.id}-${selectedAccount.displayName}`}
                  account={selectedAccount}
                  onSaved={(updated) => {
                    if (updated) applyMasterMe(updated);
                    else return refetch();
                  }}
                />
              ) : null}
            </>
          ) : (
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-sm text-[var(--app-text-secondary)]">
              No linked MT5 accounts on your master profile.
            </div>
          )}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <InlineBreadcrumb
          items={[
            { label: "Overview", href: "/dashboard" },
            { label: "Copy Trading", href: "/copier/rating" },
            { label: "Master Area" },
          ]}
        />
        <HeroCard icon={Crown} title="Master Area" subtitle="Apply to become a master trader and manage your followers" />

        {status === "rejected" ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-500/30 dark:bg-rose-500/10">
            <h2 className="font-bold text-rose-800 dark:text-rose-300">Application rejected</h2>
            <p className="mt-2 text-sm text-rose-700 dark:text-rose-200">
              {data?.rejectionReason ?? "Your application was not approved. You may update your details and re-apply."}
            </p>
            <button type="button" onClick={openApplyModal} className={`${btnPrimary} mt-4`}>
              Re-apply
            </button>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
            <span className="inline-block rounded-full bg-[color-mix(in_oklab,var(--app-primary-solid)_12%,var(--app-mix-base))] px-3 py-1 text-xs font-bold text-[color:var(--app-primary-solid)]">
              Become a master
            </span>
            <h2 className="mt-4 text-2xl font-bold text-[var(--app-text-primary)]">Turn your strategy into income.</h2>
            <p className="mt-3 text-sm text-[var(--app-text-secondary)]">
              Share your trades with the world. Copiers mirror your positions on their MT5 accounts — you earn commission
              from copiers on the profit they make from your copied trades.
            </p>
            <ul className="mt-5 space-y-3">
              {[
                "Set commission from copiers (5% – 50% of their copied-trade profit).",
                "Connect MT5 accounts as master — add more after approval.",
                "Get a public profile with verified performance metrics.",
                "Withdraw commissions on the platform payout cycle.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[var(--app-text-secondary)]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--app-primary-solid)]" />
                  {item}
                </li>
              ))}
            </ul>
            <button type="button" onClick={openApplyModal} className={`${btnPrimary} mt-6`}>
              Apply now
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)]">What to prepare</p>
            <ol className="mt-4 list-decimal space-y-3 pl-4 text-sm text-[var(--app-text-secondary)]">
              <li>A clear strategy summary and risk profile.</li>
              <li>At least one funded MT5 master account.</li>
              <li>Commission tier between 5% and 50%.</li>
              <li>Acceptance of master trader terms.</li>
            </ol>
          </div>
        </div>
      </div>
      {applyModal}
    </PageContainer>
  );
}
